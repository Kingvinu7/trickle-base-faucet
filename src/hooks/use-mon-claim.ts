'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { MON_FAUCET_CONTRACT, API_BASE_URL, API_ENDPOINTS } from '@/config/constants'
import { parseError } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

/**
 * Hook to claim MON tokens from the faucet
 * Supports multiple claims per day (up to 10)
 */
export function useMonClaim(farcasterUser?: {fid: number, username: string, displayName: string}) {
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null)
  const [claimAddress, setClaimAddress] = useState<string | null>(null)
  const queryClient = useQueryClient()
  
  const { writeContract, isPending: isWritePending, error: writeError } = useWriteContract()
  
  const { 
    isLoading: isReceiptLoading, 
    isSuccess: isReceiptSuccess,
    isError: isReceiptError,
    error: receiptError
  } = useWaitForTransactionReceipt({
    hash: currentTxHash as `0x${string}` | undefined,
    timeout: 60_000, // 60 seconds timeout
  })

  // Handle receipt errors
  useEffect(() => {
    if (isReceiptError && receiptError) {
      console.error('Transaction receipt error:', receiptError)
      toast.error('Transaction failed. Please check Monad Explorer and try again.')
      setCurrentTxHash(null)
      setClaimAddress(null)
    }
  }, [isReceiptError, receiptError])

  // Invalidate queries when transaction is confirmed
  useEffect(() => {
    if (isReceiptSuccess && claimAddress) {
      console.log('MON transaction confirmed! Invalidating queries...')
      // Wait a brief moment for the blockchain to process the event
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['monStats', claimAddress] })
        // Also invalidate the contract read query
        queryClient.invalidateQueries({ queryKey: ['readContract'] })
      }, 2000)
    }
  }, [isReceiptSuccess, claimAddress, queryClient])

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
            throw new Error('MON_FAUCET_CONTRACT.address is not configured! Please set NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS')
          }
          
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
                toast.info('Transaction submitted! Waiting for confirmation...')
                setCurrentTxHash(txHash)
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
                if (errorMsg.includes('deadline') || errorMsg.includes('expired')) {
                  reject(new Error('Signature expired. Please try again.'))
                } else if (errorMsg.includes('signature')) {
                  reject(new Error('Invalid signature. Please try again.'))
                } else if (errorMsg.includes('already claimed')) {
                  reject(new Error('You have already claimed today. Try again later.'))
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
    isPending: mutation.isPending || isWritePending || isReceiptLoading,
    isSuccess: mutation.isSuccess && isReceiptSuccess,
    currentTxHash,
  }
}
