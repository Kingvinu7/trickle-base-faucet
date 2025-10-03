'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useFarcasterMiniapp } from '@/hooks/use-farcaster-miniapp'
import { sdk as MiniappSDK } from '@farcaster/miniapp-sdk'

interface FarcasterMiniappContextType {
  sdk: typeof MiniappSDK | null
  isReady: boolean
  error: string | null
  isInFarcaster: boolean
}

const FarcasterMiniappContext = createContext<FarcasterMiniappContextType | undefined>(undefined)

export function FarcasterMiniappProvider({ children }: { children: ReactNode }) {
  const miniappData = useFarcasterMiniapp()

  return (
    <FarcasterMiniappContext.Provider value={miniappData}>
      {children}
    </FarcasterMiniappContext.Provider>
  )
}

export function useFarcasterMiniappContext() {
  const context = useContext(FarcasterMiniappContext)
  if (context === undefined) {
    throw new Error('useFarcasterMiniappContext must be used within a FarcasterMiniappProvider')
  }
  return context
}