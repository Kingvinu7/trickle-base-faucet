'use client'

import { useEffect, useState } from 'react'
import { MiniappSDK } from '@farcaster/miniapp-sdk'

export function useFarcasterMiniapp() {
  const [sdk, setSdk] = useState<MiniappSDK | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Initialize the Farcaster Miniapp SDK
        const miniappSDK = new MiniappSDK()
        
        // Call the ready function to signal the miniapp is ready
        await miniappSDK.ready()
        
        setSdk(miniappSDK)
        setIsReady(true)
        
        console.log('Farcaster Miniapp SDK initialized and ready')
      } catch (err) {
        console.error('Failed to initialize Farcaster Miniapp SDK:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    // Only initialize if we're in a Farcaster environment
    if (typeof window !== 'undefined' && window.location !== window.parent.location) {
      initializeSDK()
    } else {
      // If not in Farcaster environment, still set as ready for development
      setIsReady(true)
      console.log('Not in Farcaster environment, miniapp ready for development')
    }
  }, [])

  return {
    sdk,
    isReady,
    error,
    isInFarcaster: typeof window !== 'undefined' && window.location !== window.parent.location
  }
}