'use client'

import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL, API_ENDPOINTS, FARCASTER_CONFIG } from '@/config/constants'

interface FollowCheckResult {
  isFollowing: boolean
  message?: string
  development?: boolean
  apiError?: boolean
  error?: boolean
}

/**
 * Hook to check if a Farcaster user follows the target user (vinu07)
 * @param fid - The Farcaster ID of the user to check
 * @param enabled - Whether to run the query (default: true if fid exists)
 */
export function useFollowCheck(fid: number | undefined, enabled: boolean = true) {
  return useQuery<FollowCheckResult>({
    queryKey: ['followCheck', fid],
    queryFn: async () => {
      if (!fid) {
        return { isFollowing: false, message: 'No FID provided' }
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHECK_FOLLOW}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fid }),
      })

      if (!response.ok) {
        // Be lenient on errors
        return { 
          isFollowing: true, 
          apiError: true,
          message: 'Follow check unavailable'
        }
      }

      return response.json()
    },
    enabled: enabled && !!fid && FARCASTER_CONFIG.followRequired,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  })
}
