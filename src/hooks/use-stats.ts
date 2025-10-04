'use client'

import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL, API_ENDPOINTS } from '@/config/constants'

interface StatsResponse {
  totalClaims: number
  claimsLast24h: number
  source: 'database' | 'blockchain' | 'error'
}

async function fetchStats(): Promise<StatsResponse> {
  try {
    // Try blockchain stats first
    console.log('Fetching blockchain stats from:', `${API_BASE_URL}${API_ENDPOINTS.BLOCKCHAIN_STATS}`)
    const blockchainResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BLOCKCHAIN_STATS}`)
    if (blockchainResponse.ok) {
      const data = await blockchainResponse.json()
      console.log('Blockchain stats response:', data)
      if (data.source === 'blockchain' && data.totalClaims >= 0) {
        console.log('Using blockchain stats:', data)
        return data
      }
    }
  } catch (error) {
    console.warn('Blockchain stats failed, falling back to database stats', error)
  }

  try {
    // Fallback to database stats
    console.log('Falling back to database stats from:', `${API_BASE_URL}${API_ENDPOINTS.STATS}`)
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STATS}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.json()
    console.log('Database stats response:', data)
    return data
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
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}