// src/lib/reownConfig.ts
import { cookieStorage, createStorage, createConfig, http } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, arbitrum, base } from '@reown/appkit/networks'
import { injected, coinbaseWallet } from 'wagmi/connectors'
import type { Chain } from 'viem'
import type { AppKit } from '@reown/appkit'

// Project configuration
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

// Validate project ID (check if it's set and not a placeholder)
const hasValidProjectId = projectId && 
  projectId !== 'YOUR_PROJECT_ID' && 
  projectId !== 'your_project_id_here' &&
  projectId.length > 10

// Log configuration for debugging
console.log('🔧 Reown AppKit Configuration:', {
  projectId: projectId ? `${projectId.substring(0, 8)}...` : 'Not set',
  hasValidProjectId,
  mode: hasValidProjectId ? 'Reown AppKit' : 'Fallback wagmi',
  environment: process.env.NODE_ENV || 'development'
})

// Export initialization flag
export const isReownInitialized = hasValidProjectId

// Define supported networks (consolidated single source of truth)
export const networks: [Chain, ...Chain[]] = [base, mainnet, arbitrum]

// App metadata
export const metadata = {
  name: 'Trickle - Base Faucet',
  description: 'Get $0.1 worth of ETH for gas fees on Base mainnet - only for Farcaster users',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://trickle-faucet.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

// Wagmi configuration and AppKit instance
let wagmiAdapter: WagmiAdapter
let appKitInstance: AppKit | null = null

if (hasValidProjectId) {
  // ✅ Use Reown AppKit adapter with valid project ID
  console.log('✅ Initializing with Reown AppKit...')
  
  wagmiAdapter = new WagmiAdapter({
    storage: createStorage({ 
      storage: cookieStorage 
    }),
    ssr: true,
    projectId: projectId!,
    networks,
  })
} else {
  // ⚠️ Fallback: Use a placeholder project ID for basic functionality
  console.warn('⚠️ Reown Project ID not configured or invalid.')
  console.warn('📝 To enable Reown AppKit and qualify for WalletConnect weekly rewards:')
  console.warn('   1. Get a Project ID from https://dashboard.reown.com')
  console.warn('   2. Add NEXT_PUBLIC_PROJECT_ID to your .env.local file')
  console.warn('   3. Restart the development server')
  console.warn('🔄 Using fallback configuration for now...')
  
  // WagmiAdapter requires a projectId, so we use a placeholder for development
  // This allows the app to compile and run without Reown setup
  wagmiAdapter = new WagmiAdapter({
    storage: createStorage({ 
      storage: cookieStorage 
    }),
    ssr: true,
    projectId: 'fallback-development-mode', // Placeholder for development
    networks,
  })
}

// Export Wagmi config
export const config = wagmiAdapter.wagmiConfig
export { wagmiAdapter }

// AppKit configuration (only used if valid project ID)
export const appKitConfig = hasValidProjectId ? {
  adapters: [wagmiAdapter],
  projectId: projectId!,
  networks,
  defaultNetwork: base,
  metadata,
  features: { 
    analytics: true, // Enable analytics for user tracking
    allWallets: true, // Track all wallet connections in dashboard
    email: false,
    socials: [],
    emailShowWallets: true,
    swaps: false, // Explicitly disable swaps
  },
  themeMode: 'light' as const,
  themeVariables: {
    '--w3m-color-mix': '#0052FF',
    '--w3m-color-mix-strength': 40,
    '--w3m-font-family': 'Inter, sans-serif',
    '--w3m-border-radius-master': '12px',
    '--w3m-accent': '#0052FF',
  },
} : null

// Initialize AppKit (call this once in your app)
export const initializeAppKit = () => {
  if (typeof window === 'undefined') return null
  
  if (!hasValidProjectId || !appKitConfig) {
    console.warn('⚠️ AppKit not initialized: Missing valid Reown Project ID')
    return null
  }
  
  try {
    appKitInstance = createAppKit(appKitConfig)
    
    // Make appKit available globally for programmatic access
    if (typeof window !== 'undefined') {
      (window as any).reownAppKit = appKitInstance
      console.log('✅ Reown AppKit initialized and attached to window.reownAppKit')
    }
    
    return appKitInstance
  } catch (error) {
    console.error('❌ Failed to initialize Reown AppKit:', error)
    return null
  }
}

// Export the appKit instance
export { appKitInstance }

// Utility functions
export const getAppKitState = () => {
  if (typeof window === 'undefined') return null
  return (window as any).reownAppKit || (window as any).appKit || null
}

export const openAppKit = () => {
  const appKit = getAppKitState()
  if (appKit && typeof appKit.open === 'function') {
    console.log('🔓 Opening Reown AppKit modal...')
    appKit.open()
  } else {
    console.warn('⚠️ AppKit modal not available. Make sure Reown is initialized.')
  }
}

export const closeAppKit = () => {
  const appKit = getAppKitState()
  if (appKit && typeof appKit.close === 'function') {
    console.log('🔒 Closing Reown AppKit modal...')
    appKit.close()
  }
}

// Network utilities
export const isBaseNetwork = (chainId?: number) => {
  return chainId === base.id
}

export const getSupportedNetworkById = (chainId: number) => {
  return networks.find(network => network.id === chainId)
}

export const isSupportedNetwork = (chainId?: number) => {
  if (!chainId) return false
  return networks.some(network => network.id === chainId)
}

// Export network constants for easy access
export { base, mainnet, arbitrum }
export const BASE_CHAIN_ID = base.id
export const MAINNET_CHAIN_ID = mainnet.id
export const ARBITRUM_CHAIN_ID = arbitrum.id

// Default export for convenience
export default {
  projectId,
  networks,
  metadata,
  wagmiAdapter,
  config,
  appKitConfig,
  initializeAppKit,
  openAppKit,
  closeAppKit,
  isBaseNetwork,
  getSupportedNetworkById,
  isSupportedNetwork,
  isReownInitialized,
  appKitInstance,
  BASE_CHAIN_ID,
  MAINNET_CHAIN_ID,
  ARBITRUM_CHAIN_ID,
}
