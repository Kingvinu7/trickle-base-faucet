'use client'

import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL, API_ENDPOINTS } from '@/config/constants'

interface StatsResponse {
  totalClaims: number
  claimsLast24h: number
  source: 'database' | 'blockchain' | 'error' | 'placeholder'
}

async function fetchStats(): Promise<StatsResponse> {
  try {
    // Try blockchain stats first
    const blockchainResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BLOCKCHAIN_STATS}`)
    if (blockchainResponse.ok) {
      const data = await blockchainResponse.json()
      console.log('Blockchain stats response:', data)
      
      // Accept both blockchain and placeholder sources (placeholder is used during build)
      if ((data.source === 'blockchain' || data.source === 'placeholder') && data.totalClaims >= 0) {
        return data
      }
    }
  } catch (error) {
    console.warn('Blockchain stats failed, falling back to database stats', error)
  }

  try {
    // Fallback to database stats
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STATS}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return {
      totalClaims: 0,
      claimsLast24h: 0,
      source: 'error'
    }
  }
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    staleTime: 5000, // Consider data stale after 5 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}