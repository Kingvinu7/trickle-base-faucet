'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { FAUCET_CONTRACT, API_BASE_URL, API_ENDPOINTS } from '@/config/constants'
import { parseError } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

async function logClaim(
  address: string, 
  txHash: string, 
  farcasterUser?: {fid: number, username: string, displayName: string}
): Promise<void> {
  console.log('🚀 SENDING CLAIM TO LOG API:', {
    address: address.toLowerCase(),
    txHash,
    farcasterUser,
    hasFarcasterData: !!farcasterUser
  })
  
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOG_CLAIM}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: address.toLowerCase(),
        txHash,
        network: 'base',
        ...(farcasterUser && { farcasterUser }),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Failed to log claim:', response.statusText, errorText)
    } else {
      const result = await response.json()
      console.log('✅ Claim logged successfully:', result)
    }
  } catch (error) {
    console.error('❌ Failed to log claim:', error)
    // Don't throw error for logging failures
  }
}

export function useFaucetClaim(farcasterUser?: {fid: number, username: string, displayName: string}) {
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
      console.log('Transaction confirmed! Invalidating queries...')
      // Wait a brief moment for the blockchain to process the event
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['eligibility', claimAddress] })
        queryClient.invalidateQueries({ queryKey: ['stats'] })
      }, 2000)
    }
  }, [isReceiptSuccess, claimAddress, queryClient])

  const mutation = useMutation({
    mutationFn: async (address: string): Promise<string> => {
      return new Promise(async (resolve, reject) => {
        try {
          // Step 1: Request signature from backend
          toast.info('Requesting authorization...')
          
          const signatureResponse = await fetch('/api/request-signature', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address }),
          })
          
          if (!signatureResponse.ok) {
            const errorData = await signatureResponse.json()
            throw new Error(errorData.error || 'Failed to get authorization')
          }
          
          const { signature, nonce, deadline } = await signatureResponse.json()
          
          console.log('Signature received:', { signature, nonce, deadline })
          toast.success('Authorization received! Processing claim...')
          
          // Step 2: Store the claim address for later query invalidation
          setClaimAddress(address)
          
          // Step 3: Call contract with signature
          writeContract(
            {
              address: FAUCET_CONTRACT.address,
              abi: FAUCET_CONTRACT.abi,
              functionName: 'requestTokens',
              args: [nonce, BigInt(deadline), signature],
            },
            {
              onSuccess: async (txHash) => {
                console.log('Transaction sent:', txHash)
                setCurrentTxHash(txHash)
                
                try {
                  // Log the claim attempt with Farcaster user data
                  await logClaim(address, txHash, farcasterUser)
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
                setClaimAddress(null)
                reject(new Error(parseError(error)))
              },
            }
          )
        } catch (error) {
          console.error('Failed to initiate transaction:', error)
          setClaimAddress(null)
          reject(new Error(parseError(error)))
        }
      })
    },
    onError: (error) => {
      console.error('Claim failed:', error)
      setCurrentTxHash(null)
      setClaimAddress(null)
    },
    onSuccess: (txHash) => {
      console.log('Claim successful:', txHash)
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