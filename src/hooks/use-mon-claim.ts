'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { MON_FAUCET_CONTRACT, MON_CONFIG, API_BASE_URL, API_ENDPOINTS } from '@/config/constants'
import { parseError, formatAddress } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

/**
 * Hook to claim MON tokens from the faucet
 * Supports multiple claims per day (up to 10)
 */
export function useMonClaim(farcasterUser?: {fid: number, username: string, displayName: string}) {
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null)
  const [claimAddress, setClaimAddress] = useState<string | null>(null)
  const [isManuallyConfirmed, setIsManuallyConfirmed] = useState(false)
  const queryClient = useQueryClient()
  
  const { writeContract, isPending: isWritePending, error: writeError } = useWriteContract()
  
  const { 
    isLoading: isReceiptLoading, 
    isSuccess: isReceiptSuccess,
    isError: isReceiptError,
    error: receiptError
  } = useWaitForTransactionReceipt({
    hash: currentTxHash as `0x${string}` | undefined,
    timeout: 300_000, // 5 minutes timeout for Monad testnet
    retryCount: 3, // Retry up to 3 times
    retryDelay: 2000, // Wait 2 seconds between retries
  })

  // Handle receipt errors
  useEffect(() => {
    if (isReceiptError && receiptError) {
      console.error('Transaction receipt error:', receiptError)
      
      // Check if it's a timeout error
      const errorMsg = receiptError.message?.toLowerCase() || ''
      if (errorMsg.includes('timeout') || errorMsg.includes('expired')) {
        // For Monad testnet, show success even if receipt times out
        // The transaction might still be successful
        console.log('Transaction receipt timed out, but transaction may have succeeded')
        setIsManuallyConfirmed(true)
        
        toast.success(
          `Transaction Submitted! TX: ${currentTxHash ? formatAddress(currentTxHash) : 'Unknown'}\n⚠️ Monad testnet is slow - check explorer: https://explorer.monad.xyz/tx/${currentTxHash}`,
          { duration: 15000 }
        )
        
        // Invalidate queries anyway (transaction might have succeeded)
        if (claimAddress) {
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['monStats', claimAddress] })
            queryClient.invalidateQueries({ queryKey: ['readContract'] })
          }, 2000)
        }
        
        // Reset after showing success
        setTimeout(() => {
          setCurrentTxHash(null)
          setClaimAddress(null)
          setIsManuallyConfirmed(false)
        }, 5000)
      } else {
        toast.error('Transaction failed. Please check Monad Explorer and try again.')
      }
      
      setCurrentTxHash(null)
      setClaimAddress(null)
    }
  }, [isReceiptError, receiptError, currentTxHash, claimAddress, queryClient])

  // Invalidate queries when transaction is confirmed
  useEffect(() => {
    if (isReceiptSuccess && claimAddress) {
      console.log('MON transaction confirmed! Invalidating queries...')
      
      // Show success message
      toast.success(
        `MON Claim Successful! TX: ${currentTxHash ? formatAddress(currentTxHash) : 'Unknown'}\nView on Monad Explorer: https://explorer.monad.xyz/tx/${currentTxHash}`,
        { duration: 10000 }
      )
      
      // Wait a brief moment for the blockchain to process the event
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['monStats', claimAddress] })
        // Also invalidate the contract read query
        queryClient.invalidateQueries({ queryKey: ['readContract'] })
      }, 2000)
    }
  }, [isReceiptSuccess, claimAddress, queryClient, currentTxHash])

  const mutation = useMutation({
    mutationFn: async (address: string): Promise<string> => {
      return new Promise(async (resolve, reject) => {
        try {
          console.log('🚀 Starting MON claim process for address:', address)
          console.log('🔍 Current wallet state:', {
            address,
            isConnected: !!address,
            contractAddress: MON_FAUCET_CONTRACT.address,
            contractEnabled: MON_CONFIG.enabled
          })
          
          // Check if we're on the right network
          if (typeof window !== 'undefined' && (window as any).ethereum) {
            try {
              const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' })
              console.log('🔗 Current chain ID:', chainId, 'Expected: 0x279f (10143)')
              if (chainId !== '0x279f') {
                console.warn('⚠️ Wallet is not on Monad testnet! Current chain:', chainId)
                reject(new Error('Please switch to Monad testnet to claim MON tokens.'))
                return
              }
              
              // Check wallet balance
              const balance = await (window as any).ethereum.request({ 
                method: 'eth_getBalance', 
                params: [address, 'latest'] 
              })
              console.log('💰 Wallet balance:', balance, 'wei')
              const balanceEth = parseInt(balance, 16) / 1e18
              console.log('💰 Wallet balance:', balanceEth, 'MON')
              
              if (balanceEth < 0.001) {
                console.warn('⚠️ Low wallet balance, might not have enough gas')
              }
              
              // Check contract balance
              const contractBalance = await (window as any).ethereum.request({ 
                method: 'eth_getBalance', 
                params: [MON_FAUCET_CONTRACT.address, 'latest'] 
              })
              console.log('🏦 Contract balance:', contractBalance, 'wei')
              const contractBalanceEth = parseInt(contractBalance, 16) / 1e18
              console.log('🏦 Contract balance:', contractBalanceEth, 'MON')
              
              if (contractBalanceEth < 0.1) {
                console.warn('⚠️ Contract has low MON balance, might not be able to distribute')
              }
            } catch (error) {
              console.error('❌ Failed to check wallet state:', error)
            }
          }
          
          // Step 1: Request message hash from backend for client-side signing
          toast.info('Requesting MON authorization...')
          
          const messageHashResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REQUEST_MON_SIGNATURE}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address }),
          })
          
          if (!messageHashResponse.ok) {
            const errorData = await messageHashResponse.json()
            throw new Error(errorData.error || 'Failed to get MON authorization')
          }
          
          const { messageHash, nonce, deadline } = await messageHashResponse.json()
          
          console.log('MON message hash received:', { messageHash, nonce, deadline })
          
          // Step 2: Sign the message with the user's wallet
          if (typeof window === 'undefined' || !(window as any).ethereum) {
            throw new Error('Wallet not available for signing')
          }
          
          toast.info('Please sign the message in your wallet...')
          
          const signature = await (window as any).ethereum.request({
            method: 'personal_sign',
            params: [messageHash, address],
          })
          
          console.log('MON signature created by user wallet:', { signature })
          toast.success('Authorization received! Claiming MON...')
          
          // Step 2: Store the claim address for later query invalidation
          setClaimAddress(address)
          
          // Step 3: Call contract with signature
          console.log('🚀 Calling MON contract requestTokens with:', {
            contract: MON_FAUCET_CONTRACT.address,
            functionName: 'requestTokens',
            nonce,
            nonceType: typeof nonce,
            deadline,
            deadlineType: typeof deadline,
            deadlineBigInt: BigInt(deadline).toString(),
            signature,
            signatureLength: signature.length,
            signaturePreview: signature.substring(0, 20) + '...',
            address: address,
            chainId: 10143, // Monad testnet
            network: 'Monad Testnet'
          })
          
          console.log('🔍 Contract ABI check:', {
            hasAbi: !!MON_FAUCET_CONTRACT.abi,
            abiLength: MON_FAUCET_CONTRACT.abi?.length,
            requestTokensFunction: MON_FAUCET_CONTRACT.abi?.find((fn: any) => fn.name === 'requestTokens')
          })
          
          // Verify contract address is set
          if (!MON_FAUCET_CONTRACT.address || MON_FAUCET_CONTRACT.address.length === 0) {
            console.error('MON_FAUCET_CONTRACT.address is empty:', MON_FAUCET_CONTRACT.address)
            throw new Error('MON faucet contract address is not configured! Please set NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS in Vercel environment variables.')
          }
          
          console.log('MON faucet contract address:', MON_FAUCET_CONTRACT.address)
          
          console.log('📝 About to call writeContract with params:', {
            address: MON_FAUCET_CONTRACT.address,
            abi: MON_FAUCET_CONTRACT.abi?.length + ' functions',
            functionName: 'requestTokens',
            args: [nonce, BigInt(deadline), signature],
            argsTypes: [
              typeof nonce,
              typeof BigInt(deadline),
              typeof signature
            ]
          })
          
          try {
            console.log('🔄 Calling writeContract...')
            writeContract(
            {
              address: MON_FAUCET_CONTRACT.address,
              abi: MON_FAUCET_CONTRACT.abi,
              functionName: 'requestTokens',
              args: [nonce, BigInt(deadline), signature],
            },
            {
              onSuccess: async (txHash) => {
                console.log('✅ MON transaction sent successfully:', txHash)
                console.log('🔗 View on Monad Explorer: https://explorer.monad.xyz/tx/' + txHash)
                toast.info('Transaction submitted! Waiting for confirmation on Monad testnet...')
                setCurrentTxHash(txHash)
                
                // Set a fallback timeout for Monad testnet
                // If receipt doesn't come back in 2 minutes, assume success
                setTimeout(() => {
                  if (currentTxHash === txHash && !isReceiptSuccess && !isReceiptError && !isManuallyConfirmed) {
                    console.log('⏰ Monad testnet timeout fallback - assuming transaction succeeded')
                    setIsManuallyConfirmed(true)
                    
                    toast.success(
                      `Transaction Submitted! TX: ${formatAddress(txHash)}\n⚠️ Monad testnet confirmation delayed - check explorer: https://explorer.monad.xyz/tx/${txHash}`,
                      { duration: 15000 }
                    )
                    
                    // Invalidate queries
                    if (claimAddress) {
                      queryClient.invalidateQueries({ queryKey: ['monStats', claimAddress] })
                      queryClient.invalidateQueries({ queryKey: ['readContract'] })
                    }
                    
                    // Reset after showing success
                    setTimeout(() => {
                      setCurrentTxHash(null)
                      setClaimAddress(null)
                      setIsManuallyConfirmed(false)
                    }, 5000)
                  }
                }, 120_000) // 2 minutes fallback
                
                resolve(txHash)
              },
              onError: (error) => {
                console.error('❌ MON transaction failed:', error)
                console.error('🔍 Error details:', {
                  message: error.message,
                  name: error.name,
                  stack: error.stack
                })
                setCurrentTxHash(null)
                setClaimAddress(null)
                
                // Check for specific error messages
                const errorMsg = error.message.toLowerCase()
                console.error('🔍 MON transaction error analysis:', {
                  message: error.message,
                  name: error.name,
                  errorMsg: errorMsg
                })
                
                if (errorMsg.includes('deadline') || errorMsg.includes('expired')) {
                  reject(new Error('Signature expired. Please try again.'))
                } else if (errorMsg.includes('signature')) {
                  reject(new Error('Invalid signature. Please try again.'))
                } else if (errorMsg.includes('already claimed')) {
                  reject(new Error('You have already claimed today. Try again later.'))
                } else if (errorMsg.includes('insufficient funds')) {
                  reject(new Error('Contract has insufficient MON balance. Please contact support.'))
                } else if (errorMsg.includes('user rejected') || errorMsg.includes('rejected')) {
                  reject(new Error('Transaction was rejected by user.'))
                } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
                  reject(new Error('Network error on Monad testnet. Please try again in a few moments.'))
                } else if (errorMsg.includes('gas') || errorMsg.includes('fee')) {
                  reject(new Error('Gas estimation failed. Please try again.'))
                } else if (errorMsg.includes('execution reverted')) {
                  reject(new Error('Transaction reverted. Check contract requirements and try again.'))
                } else {
                  reject(new Error(parseError(error)))
                }
              },
            }
          )
          console.log('✅ writeContract call initiated')
          } catch (writeError: any) {
            console.error('❌ writeContract call failed immediately:', writeError)
            reject(new Error(`Failed to initiate transaction: ${writeError.message || 'Unknown error'}`))
            return
          }
        } catch (error) {
          console.error('Failed to initiate MON transaction:', error)
          setClaimAddress(null)
          reject(new Error(parseError(error)))
        }
      })
    },
    onError: (error) => {
      console.error('MON claim failed:', error)
      setCurrentTxHash(null)
      setClaimAddress(null)
    },
    onSuccess: (txHash) => {
      console.log('MON claim successful:', txHash)
      // Reset transaction hash and address after successful completion
      setTimeout(() => {
        setCurrentTxHash(null)
        setClaimAddress(null)
      }, 5000)
    },
  })

  return {
    ...mutation,
    isPending: mutation.isPending || isWritePending || (isReceiptLoading && !isManuallyConfirmed),
    isSuccess: mutation.isSuccess && (isReceiptSuccess || isManuallyConfirmed),
    currentTxHash,
  }
}
