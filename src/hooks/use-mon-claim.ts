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
  
  const { isLoading: isReceiptLoading, isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt({
    hash: currentTxHash as `0x${string}` | undefined,
  })

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
                setCurrentTxHash(txHash)
                resolve(txHash)
              },
              onError: (error) => {
                console.error('MON transaction failed:', error)
                setCurrentTxHash(null)
                setClaimAddress(null)
                reject(new Error(parseError(error)))
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
