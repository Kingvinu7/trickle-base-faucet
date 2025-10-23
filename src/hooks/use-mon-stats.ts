'use client'

import { useQuery } from '@tanstack/react-query'
import { useReadContract } from 'wagmi'
import { MON_FAUCET_CONTRACT } from '@/config/constants'

interface MonClaimInfo {
  claimsMadeToday: bigint
  remainingClaims: bigint
  monClaimedToday: bigint
  remainingMON: bigint
  canClaimNow: boolean
}

/**
 * Hook to fetch MON claim statistics for a user
 * Fetches data directly from the MON faucet contract
 */
export function useMonStats(address?: string) {
  const { data: claimInfo, isLoading, refetch } = useReadContract({
    address: MON_FAUCET_CONTRACT.address,
    abi: MON_FAUCET_CONTRACT.abi,
    functionName: 'getUserClaimInfo',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!MON_FAUCET_CONTRACT.address,
      refetchInterval: 10000, // Refetch every 10 seconds
      staleTime: 5000, // Consider data stale after 5 seconds
    },
  })

  // Parse the contract response
  const stats = claimInfo ? {
    claimsMadeToday: Number(claimInfo[0]),
    remainingClaims: Number(claimInfo[1]),
    monClaimedToday: Number(claimInfo[2]) / 1e18, // Convert from wei to MON
    remainingMON: Number(claimInfo[3]) / 1e18, // Convert from wei to MON
    canClaimNow: claimInfo[4],
  } : null

  return {
    data: stats,
    isLoading,
    refetch,
  }
}
