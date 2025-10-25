import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { toast } from 'sonner'
import { MON_FAUCET_CONTRACT, MON_CONFIG, API_BASE_URL, API_ENDPOINTS } from '@/config/constants'

export function useMonClaim() {
  const { address, connector } = useAccount()
  const queryClient = useQueryClient()
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null)
  const [claimAddress, setClaimAddress] = useState<string | null>(null)
  const [isManuallyConfirmed, setIsManuallyConfirmed] = useState(false)

  const { writeContract } = useWriteContract()

  const { data: receipt, isSuccess: isReceiptSuccess, isError: isReceiptError } = useWaitForTransactionReceipt({
    hash: currentTxHash as `0x${string}`,
    timeout: 300000, // 5 minutes
    retryCount: 3,
  })

  // Handle successful transaction receipt
  React.useEffect(() => {
    if (isReceiptSuccess && receipt && claimAddress) {
      setIsManuallyConfirmed(false)
      setCurrentTxHash(null)
      setClaimAddress(null)
      
      // Show success message
      toast.success(
        `MON Claim Successful! TX: ${currentTxHash ? formatAddress(currentTxHash) : 'Unknown'}\\nView on Monad Explorer: https://explorer.monad.xyz/tx/${currentTxHash}`,
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
          // Check if we're on the right network
          if (typeof window !== 'undefined' && (window as any).ethereum) {
            try {
              const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' })
              if (chainId !== '0x279f') {
                reject(new Error('Please switch to Monad testnet to claim MON tokens.'))
                return
              }
            } catch (error) {
              console.error('Failed to check network:', error)
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
          
          // Step 2: Sign the message with the user's wallet
          // Get provider from wagmi connector - works with Farcaster and all wallets
          if (!connector || !address) {
            throw new Error('Wallet not connected. Please connect your wallet first.')
          }
          
          toast.info('Please sign the message in your wallet...')
          
          // Get provider from connector - this works with Farcaster!
          const provider = await connector.getProvider()
          console.log('Provider obtained:', { 
            hasProvider: !!provider, 
            hasRequest: provider && typeof provider === 'object' && 'request' in provider,
            connectorName: connector.name 
          })
          
          if (!provider || typeof provider !== 'object' || !('request' in provider)) {
            throw new Error('Wallet provider not available. Please ensure your wallet is connected.')
          }
          
          // Show user-friendly message before signature request
          toast.info('Please approve the signature request in your wallet. The message will appear as a hash (this is normal for security).', { duration: 5000 })
          
          // Sign using personal_sign - this is what the contract expects
          // Note: The message will display as hex/binary in the wallet (expected behavior)
          console.log('🖊️ Requesting signature for message hash:', messageHash)
          console.log('   Message format: 32-byte hash (will display as hex in wallet)')
          
          // MOBILE DEBUG: Show signature request details
          toast.info(`🔍 DEBUG: Signing\nHash: ${messageHash.slice(0, 20)}...\nLength: ${messageHash.length}\nConnector: ${connector.name}`, { duration: 8000 })
          
          const signature = await (provider as any).request({
            method: 'personal_sign',
            params: [messageHash, address],
          }) as `0x${string}`
          
          console.log('✅ Signature received:', signature)
          
          // MOBILE DEBUG: Show signature received
          toast.success(`✅ Sig Received!\n${signature.slice(0, 20)}...${signature.slice(-10)}\nLength: ${signature.length}`, { duration: 8000 })
          
          // MOBILE DEBUG: Step 3
          toast.info(`📍 Step 3: Storing address...`, { duration: 5000 })
          setClaimAddress(address)
          
          // MOBILE DEBUG: Step 4
          toast.info(`📍 Step 4: Checking contract...`, { duration: 5000 })
          if (!MON_FAUCET_CONTRACT.address || MON_FAUCET_CONTRACT.address.length === 0) {
            toast.error(`❌ CONTRACT NOT CONFIGURED!\nAddress is missing!`, { duration: 10000 })
            throw new Error('MON faucet contract address is not configured! Please set NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS in Vercel environment variables.')
          }
          
          // MOBILE DEBUG: Contract address OK
          toast.success(`✅ Contract OK: ${MON_FAUCET_CONTRACT.address.slice(0, 12)}...`, { duration: 5000 })
          
          // MOBILE DEBUG: About to call writeContract
          toast.info(`📍 Step 5: Preparing transaction...\nFunction: requestTokens\nArgs ready!`, { duration: 5000 })
          
          try {
            toast.info(`📍 Step 6: Calling writeContract NOW!`, { duration: 5000 })
            writeContract(
              {
                address: MON_FAUCET_CONTRACT.address,
                abi: MON_FAUCET_CONTRACT.abi,
                functionName: 'requestTokens',
                args: [nonce, BigInt(deadline), signature],
              },
              {
                onSuccess: async (txHash) => {
                  console.log('✅ Transaction successful!', txHash)
                  toast.success(`✅ TX SUCCESS!\n${txHash.slice(0, 20)}...`, { duration: 5000 })
                  toast.info('Waiting for confirmation on Monad testnet...')
                  setCurrentTxHash(txHash)
                  
                  // Set a fallback timeout for Monad testnet
                  // If receipt doesn't come back in 2 minutes, assume success
                  setTimeout(() => {
                    if (currentTxHash === txHash && !isReceiptSuccess && !isReceiptError && !isManuallyConfirmed) {
                      setIsManuallyConfirmed(true)
                      
                      toast.success(
                        `Transaction Submitted! TX: ${formatAddress(txHash)}\\n⚠️ Monad testnet confirmation delayed - check explorer: https://explorer.monad.xyz/tx/${txHash}`,
                        { duration: 15000 }
                      )
                      
                      // Invalidate queries
                      if (claimAddress) {
                        queryClient.invalidateQueries({ queryKey: ['monStats', claimAddress] })
                        queryClient.invalidateQueries({ queryKey: ['readContract'] })
                      }
                      
                      // Reset after showing success
                      setTimeout(() => {
                        setIsManuallyConfirmed(false)
                        setCurrentTxHash(null)
                        setClaimAddress(null)
                      }, 5000)
                    }
                  }, 120000) // 2 minutes timeout
                  
                  resolve(txHash)
                },
                onError: (error) => {
                  console.error('❌ ============ CONTRACT CALL FAILED ============')
                  console.error('   Error:', error)
                  console.error('   Error Message:', error.message)
                  console.error('   Error Name:', error.name)
                  console.error('   Full Error Object:', JSON.stringify(error, null, 2))
                  console.error('================================================')
                  
                  // MOBILE DEBUG: Show error details with specific checks
                  const errorMsg = error.message?.toLowerCase() || 'unknown error'
                  const errorPreview = (error.message || 'Unknown error').slice(0, 100)
                  
                  // Check for specific issues and show user-friendly toast
                  if (errorMsg.includes('user rejected') || errorMsg.includes('denied') || errorMsg.includes('cancelled')) {
                    toast.error(`❌ USER CANCELLED\nYou rejected the transaction`, { duration: 8000 })
                  } else if (errorMsg.includes('insufficient funds') || errorMsg.includes('gas')) {
                    toast.error(`❌ GAS ERROR\n${errorPreview}`, { duration: 10000 })
                  } else if (errorMsg.includes('invalid signature') || errorMsg.includes('signature')) {
                    toast.error(`❌ SIGNATURE INVALID\n${errorPreview}\n\nFarcaster wallet may use different signing!`, { duration: 12000 })
                  } else {
                    toast.error(`❌ TX FAILED\nError: ${errorPreview}\nName: ${error.name || 'N/A'}`, { duration: 10000 })
                  }
                  
                  setCurrentTxHash(null)
                  setClaimAddress(null)
                  
                  // Reject with specific error messages for mutation handling
                  if (errorMsg.includes('deadline') || errorMsg.includes('expired')) {
                    reject(new Error('Signature expired. Please try again.'))
                  } else if (errorMsg.includes('signature')) {
                    reject(new Error('Invalid signature. Please try again.'))
                  } else if (errorMsg.includes('already claimed')) {
                    reject(new Error('You have already claimed today. Try again later.'))
                  } else if (errorMsg.includes('insufficient funds')) {
                    reject(new Error('Insufficient funds for gas. Please add MON to your wallet.'))
                  } else if (errorMsg.includes('user rejected') || errorMsg.includes('denied')) {
                    reject(new Error('Transaction was cancelled by user.'))
                  } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
                    reject(new Error('Network error. Please check your connection and try again.'))
                  } else if (errorMsg.includes('gas') || errorMsg.includes('execution reverted')) {
                    reject(new Error('Transaction failed. Please try again or contact support.'))
                  } else {
                    reject(new Error(`Transaction failed: ${error.message || 'Unknown error'}`))
                  }
                }
              }
            )
          } catch (writeError: any) {
            setCurrentTxHash(null)
            setClaimAddress(null)
            reject(new Error(`Failed to submit transaction: ${writeError.message || 'Unknown error'}`))
          }
        } catch (error: any) {
          console.error('❌ CLAIM PROCESS FAILED:', error)
          
          // MOBILE DEBUG: Show failure stage
          const failStage = error.message?.includes('signature') || error.message?.includes('sign') 
            ? 'SIGNATURE' 
            : error.message?.includes('contract') 
            ? 'CONTRACT' 
            : 'UNKNOWN'
          const errorPreview = error.message?.slice(0, 80) || 'Unknown error'
          toast.error(`❌ FAILED: ${failStage}\n${errorPreview}`, { duration: 12000 })
          
          setCurrentTxHash(null)
          setClaimAddress(null)
          reject(error)
        }
      })
    },
    onSuccess: () => {
      // Additional success handling if needed
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const claim = (address: string) => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }
    mutation.mutate(address)
  }

  return {
    claim,
    isClaimPending: mutation.isPending,
    isClaimSuccess: mutation.isSuccess,
    isClaimError: mutation.isError,
    claimError: mutation.error,
    currentTxHash,
    isManuallyConfirmed,
  }
}

// Helper function to format addresses
function formatAddress(address: string): string {
  if (!address) return 'Unknown'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}