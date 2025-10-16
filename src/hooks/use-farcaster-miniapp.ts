'use client'

import { useEffect, useState } from 'react'
import { sdk as MiniappSDK } from '@farcaster/miniapp-sdk'

export function useFarcasterMiniapp() {
  const [sdk, setSdk] = useState<typeof MiniappSDK | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInFarcaster, setIsInFarcaster] = useState(false)

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Use the SDK instance directly (it's already initialized)
        setSdk(MiniappSDK)
        
        // Check if user is in Farcaster using the official SDK method
        // isInMiniApp() is an async function that returns Promise<boolean>
        // It uses multi-step detection including environment and communication checks
        if (typeof window !== 'undefined') {
          const inMiniApp = await MiniappSDK.isInMiniApp()
          setIsInFarcaster(inMiniApp)
          console.log('Miniapp detection result:', inMiniApp)
        }
        
        // Call the ready function to signal the miniapp is ready
        await MiniappSDK.actions.ready()
        
        setIsReady(true)
        
        console.log('Farcaster Miniapp SDK initialized and ready')
      } catch (err) {
        console.error('Failed to initialize Farcaster Miniapp SDK:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        // Default to not in Farcaster on error
        setIsInFarcaster(false)
      }
    }

    // Initialize SDK in both Farcaster and development environments
    if (typeof window !== 'undefined') {
      initializeSDK()
    } else {
      // If not in browser environment, still set as ready for development
      setIsReady(true)
      console.log('Not in browser environment, miniapp ready for development')
    }
  }, [])

  // Development mode bypass - allow access on localhost for testing
  // Only applied when MINIAPP_STRICT_MODE is not enabled
  const miniappStrictMode = process.env.NEXT_PUBLIC_MINIAPP_STRICT_MODE === 'true'
  
  const isDevelopment = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('vercel.app') ||
    process.env.NODE_ENV === 'development'
  )

  // In strict mode, only allow Farcaster environment
  // In non-strict mode, allow both Farcaster and development environments
  const isAllowedPlatform = miniappStrictMode ? isInFarcaster : (isInFarcaster || isDevelopment)

  // Debug logging to help troubleshoot
  if (typeof window !== 'undefined') {
    console.log('🔒 Miniapp Access Control:', {
      isInFarcaster,
      miniappStrictMode,
      isDevelopment,
      hostname: window.location.hostname,
      isAllowedPlatform,
      envVar: process.env.NEXT_PUBLIC_MINIAPP_STRICT_MODE
    })
  }

  return {
    sdk,
    isReady,
    error,
    isInFarcaster,
    isAllowedPlatform
  }
}