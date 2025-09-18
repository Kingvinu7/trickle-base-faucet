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
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
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
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string
        if (message.includes('HTTP 4')) {
          return false
        }
      }
      return failureCount < 3
    },
  })
}