'use client'

import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL, API_ENDPOINTS } from '@/config/constants'

interface EligibilityResponse {
  eligible: boolean
  message?: string
  nextClaimTime?: string
  hoursRemaining?: number
}

async function checkEligibility(address: string): Promise<EligibilityResponse> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHECK_ELIGIBILITY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address: address.toLowerCase(),
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    
    // For server errors (5xx), we might still get eligibility data
    if (response.status >= 500 && errorData.eligible !== undefined) {
      return {
        eligible: errorData.eligible,
        message: errorData.message || 'Server error occurred',
        nextClaimTime: errorData.nextClaimTime || null,
        hoursRemaining: errorData.hoursRemaining || 0,
      }
    }
    
    throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`)
  }

  const data = await response.json()
  
  return {
    eligible: data.eligible || false,
    message: data.message || '',
    nextClaimTime: data.nextClaimTime || null,
    hoursRemaining: data.hoursRemaining || 0,
  }
}

export function useEligibility(address?: string) {
  return useQuery({
    queryKey: ['eligibility', address],
    queryFn: () => checkEligibility(address!),
    enabled: !!address,
    staleTime: 5000, // Consider data stale after 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
    retry: (failureCount: number, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string
        if (message.includes('HTTP 4')) {
          return false
        }
      }
      // For 5xx errors, retry up to 3 times with exponential backoff
      return failureCount < 3
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}