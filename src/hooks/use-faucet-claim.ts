'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { FAUCET_CONTRACT, API_BASE_URL, API_ENDPOINTS } from '@/config/constants'
import { parseError } from '@/lib/utils'
import { useState } from 'react'

async function logClaim(address: string, txHash: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOG_CLAIM}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: address.toLowerCase(),
        txHash,
      }),
    })

    if (!response.ok) {
      console.warn('Failed to log claim:', response.statusText)
    }
  } catch (error) {
    console.warn('Failed to log claim:', error)
    // Don't throw error for logging failures
  }
}

export function useFaucetClaim() {
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null)
  const queryClient = useQueryClient()
  
  const { writeContract, isPending: isWritePending, error: writeError } = useWriteContract()
  
  const { isLoading: isReceiptLoading, isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt({
    hash: currentTxHash as `0x${string}` | undefined,
  })

  const mutation = useMutation({
    mutationFn: async (address: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        try {
          writeContract(
            {
              address: FAUCET_CONTRACT.address,
              abi: FAUCET_CONTRACT.abi,
              functionName: 'requestTokens',
            },
            {
              onSuccess: async (txHash) => {
                console.log('Transaction sent:', txHash)
                setCurrentTxHash(txHash)
                
                try {
                  // Log the claim attempt
                  await logClaim(address, txHash)
                  
                  // Invalidate related queries
                  queryClient.invalidateQueries({ queryKey: ['eligibility', address] })
                  queryClient.invalidateQueries({ queryKey: ['stats'] })
                  
                  resolve(txHash)
                } catch (error) {
                  console.warn('Failed to log claim, but transaction was successful:', error)
                  // Don't reject here - the transaction was successful
                  resolve(txHash)
                }
              },
              onError: (error) => {
                console.error('Transaction failed:', error)
                setCurrentTxHash(null)
                reject(new Error(parseError(error)))
              },
            }
          )
        } catch (error) {
          console.error('Failed to initiate transaction:', error)
          reject(new Error(parseError(error)))
        }
      })
    },
    onError: (error) => {
      console.error('Claim failed:', error)
      setCurrentTxHash(null)
    },
    onSuccess: (txHash) => {
      console.log('Claim successful:', txHash)
      // Reset transaction hash after successful completion
      setTimeout(() => setCurrentTxHash(null), 5000)
    },
  })

  return {
    ...mutation,
    isPending: mutation.isPending || isWritePending || isReceiptLoading,
    isSuccess: mutation.isSuccess && isReceiptSuccess,
    currentTxHash,
  }
}