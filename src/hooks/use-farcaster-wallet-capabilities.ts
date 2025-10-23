'use client'

import { useEffect, useState } from 'react'

interface FarcasterCapabilities {
  wallet_switchEthereumChain: boolean
  wallet_addEthereumChain: boolean
}

/**
 * Hook to detect Farcaster wallet capabilities
 * Based on: https://miniapps.farcaster.xyz/docs/sdk/detecting-capabilities
 */
export function useFarcasterWalletCapabilities() {
  const [capabilities, setCapabilities] = useState<FarcasterCapabilities>({
    wallet_switchEthereumChain: true, // Default to true
    wallet_addEthereumChain: true, // Default to true
  })
  const [isInFarcaster, setIsInFarcaster] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if we're in Farcaster miniapp
    const userAgent = navigator.userAgent || ''
    const inFarcaster = userAgent.includes('Farcaster') || 
                        window.location.href.includes('farcaster') ||
                        document.referrer.includes('farcaster')
    
    setIsInFarcaster(inFarcaster)

    // Check wallet capabilities
    if ((window as any).ethereum) {
      const provider = (window as any).ethereum
      
      // Check if provider supports these methods
      const canSwitch = typeof provider.request === 'function'
      const canAdd = typeof provider.request === 'function'
      
      setCapabilities({
        wallet_switchEthereumChain: canSwitch,
        wallet_addEthereumChain: canAdd,
      })

      console.log('🔍 Farcaster Wallet Capabilities:', {
        isInFarcaster: inFarcaster,
        canSwitchChain: canSwitch,
        canAddChain: canAdd,
        provider: provider.constructor?.name || 'Unknown'
      })
    }
  }, [])

  return {
    ...capabilities,
    isInFarcaster,
    canUseCustomNetworks: capabilities.wallet_addEthereumChain && capabilities.wallet_switchEthereumChain,
  }
}
