'use client'

import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL, API_ENDPOINTS } from '@/config/constants'

interface SpamLabelCheckResult {
  hasSpamLabel2: boolean
  score?: number
  minimumScore?: number
  message?: string
  apiError?: boolean
  quotaExceeded?: boolean
  error?: boolean
}

/**
 * Hook to check if a Farcaster user meets the minimum Neynar score requirement
 * Note: Despite the name "spam label", this now checks Neynar score (kept for backward compatibility)
 * @param fid - The Farcaster ID of the user to check
 * @param enabled - Whether to run the query (default: true if fid exists)
 */
export function useSpamLabelCheck(fid: number | undefined, enabled: boolean = true) {
  return useQuery<SpamLabelCheckResult>({
    queryKey: ['spamLabelCheck', fid],
    queryFn: async () => {
      if (!fid) {
        return { hasSpamLabel2: false, message: 'No FID provided' }
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHECK_SPAM_LABEL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fid }),
      })

      if (!response.ok) {
        // Be lenient on errors
        return { 
          hasSpamLabel2: true, 
          apiError: true,
          message: 'Score check unavailable'
        }
      }

      return response.json()
    },
    enabled: enabled && !!fid,
    staleTime: 300000, // 5 minutes (scores don't change frequently)
    refetchOnWindowFocus: false, // No need to refetch on window focus for scores
  })
}
