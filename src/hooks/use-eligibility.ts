'use client'

import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL, API_ENDPOINTS } from '@/config/constants'

interface EligibilityResponse {
  eligible: boolean
  message?: string
  nextClaimTime?: string | null
  hoursRemaining?: number
}

interface EligibilityError extends Error {
  status?: number
  data?: any
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
    
    // For 4xx errors, check if it's actually a cooldown or just an error
    if (response.status >= 400 && response.status < 500) {
      // If we have eligibility data, use it
      if (errorData.eligible !== undefined) {
        return {
          eligible: errorData.eligible,
          message: errorData.message || 'Client error occurred',
          nextClaimTime: errorData.nextClaimTime || null,
          hoursRemaining: errorData.hoursRemaining || 0,
        }
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
    queryFn: async () => {
      try {
        return await checkEligibility(address!)
      } catch (error) {
        console.warn('Eligibility check failed:', error)
        // Return fallback data on error to prevent false cooldowns
        return { eligible: true, message: 'Unable to verify eligibility. You can try claiming.' }
      }
    },
    enabled: !!address,
    staleTime: 5000, // Consider data stale after 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
    retry: (failureCount: number, error: any) => {
      // Don't retry on 4xx errors (client errors) unless they contain eligibility data
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string
        if (message.includes('HTTP 4')) {
          return false
        }
      }
      // For 5xx errors, retry up to 2 times with exponential backoff
      return failureCount < 2
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000), // Shorter exponential backoff
    // Handle errors gracefully
    select: (data: EligibilityResponse) => data,
    // Provide fallback data when there are network issues
    placeholderData: { eligible: true, message: 'Checking eligibility...' }
  })
}