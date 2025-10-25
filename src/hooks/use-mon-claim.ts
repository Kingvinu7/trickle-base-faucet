'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { MON_FAUCET_CONTRACT, API_BASE_URL, API_ENDPOINTS } from '@/config/constants'
import { parseError, formatAddress } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { CheckCircle } from 'lucide-react'

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
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div className="font-medium">Transaction Submitted!</div>
            </div>
            <div className="text-xs text-gray-500">
              TX: {currentTxHash ? formatAddress(currentTxHash) : 'Unknown'}
            </div>
            <div className="text-xs text-amber-600">
              ⚠️ Monad testnet is slow - transaction may still be processing
            </div>
            {currentTxHash && (
              <a 
                href={`https://explorer.monad.xyz/tx/${currentTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 underline"
              >
                Check on Monad Explorer →
              </a>
            )}
          </div>,
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
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <div className="font-medium">MON Claim Successful!</div>
          </div>
          <div className="text-xs text-gray-500">
            TX: {currentTxHash ? formatAddress(currentTxHash) : 'Unknown'}
          </div>
          {currentTxHash && (
            <a 
              href={`https://explorer.monad.xyz/tx/${currentTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              View on Monad Explorer →
            </a>
          )}
        </div>,
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
          // Step 1: Request signature from backend
          toast.info('Requesting MON authorization...')
          
          const signatureResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REQUEST_MON_SIGNATURE}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address }),
          })
          
          if (!signatureResponse.ok) {
            const errorData = await signatureResponse.json()
            throw new Error(errorData.error || 'Failed to get MON authorization')
          }
          
          const { signature, nonce, deadline } = await signatureResponse.json()
          
          console.log('MON signature received:', { signature, nonce, deadline })
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
            address: address
          })
          
          // Verify contract address is set
          if (!MON_FAUCET_CONTRACT.address || MON_FAUCET_CONTRACT.address.length === 0) {
            console.error('MON_FAUCET_CONTRACT.address is empty:', MON_FAUCET_CONTRACT.address)
            throw new Error('MON faucet contract address is not configured! Please set NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS in Vercel environment variables.')
          }
          
          console.log('MON faucet contract address:', MON_FAUCET_CONTRACT.address)
          
          writeContract(
            {
              address: MON_FAUCET_CONTRACT.address,
              abi: MON_FAUCET_CONTRACT.abi,
              functionName: 'requestTokens',
              args: [nonce, BigInt(deadline), signature],
            },
            {
              onSuccess: async (txHash) => {
                console.log('MON transaction sent:', txHash)
                console.log('View on Monad Explorer: https://explorer.monad.xyz/tx/' + txHash)
                toast.info('Transaction submitted! Waiting for confirmation on Monad testnet...')
                setCurrentTxHash(txHash)
                
                // Set a fallback timeout for Monad testnet
                // If receipt doesn't come back in 2 minutes, assume success
                setTimeout(() => {
                  if (currentTxHash === txHash && !isReceiptSuccess && !isReceiptError && !isManuallyConfirmed) {
                    console.log('Monad testnet timeout fallback - assuming transaction succeeded')
                    setIsManuallyConfirmed(true)
                    
                    toast.success(
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <div className="font-medium">Transaction Submitted!</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          TX: {formatAddress(txHash)}
                        </div>
                        <div className="text-xs text-amber-600">
                          ⚠️ Monad testnet confirmation delayed - check explorer
                        </div>
                        <a 
                          href={`https://explorer.monad.xyz/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 underline"
                        >
                          Check on Monad Explorer →
                        </a>
                      </div>,
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
                console.error('MON transaction failed:', error)
                console.error('Error details:', {
                  message: error.message,
                  name: error.name
                })
                setCurrentTxHash(null)
                setClaimAddress(null)
                
                // Check for specific error messages
                const errorMsg = error.message.toLowerCase()
                console.error('MON transaction error details:', {
                  message: error.message,
                  name: error.name,
                  code: error.code,
                  cause: error.cause
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
                } else {
                  reject(new Error(parseError(error)))
                }
              },
            }
          )
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
