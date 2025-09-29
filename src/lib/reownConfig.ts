// src/lib/reownConfig.ts
import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, arbitrum, base } from '@reown/appkit/networks'
import type { Chain } from 'viem'

// Project configuration
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not defined. Please set it in .env.local')
}

// Define supported networks
export const networks: [Chain, ...Chain[]] = [base, mainnet, arbitrum]

// App metadata
export const metadata = {
  name: 'Trickle - Base Faucet',
  description: 'Get $0.025 worth of ETH for gas fees on Base mainnet',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://trickle-faucet.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

// Create Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ 
    storage: cookieStorage 
  }),
  ssr: true,
  projectId,
  networks,
})

// Export Wagmi config
export const config = wagmiAdapter.wagmiConfig

// AppKit configuration
export const appKitConfig = {
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: base,
  metadata,
  features: { 
    analytics: true,
    email: false,
    socials: [],
    emailShowWallets: true,
  },
  themeMode: 'light' as const,
  themeVariables: {
    '--w3m-color-mix': '#0052FF',
    '--w3m-color-mix-strength': 40,
    '--w3m-font-family': 'Inter, sans-serif',
    '--w3m-border-radius-master': '12px',
    '--w3m-accent': '#0052FF',
  },
}

// Initialize AppKit (call this once in your app)
export const initializeAppKit = () => {
  if (typeof window === 'undefined') return null
  
  return createAppKit(appKitConfig)
}

// Utility functions
export const getAppKitState = () => {
  if (typeof window === 'undefined') return null
  return (window as any).appKit
}

export const openAppKit = () => {
  const appKit = getAppKitState()
  if (appKit) {
    appKit.open()
  }
}

export const closeAppKit = () => {
  const appKit = getAppKitState()
  if (appKit) {
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
  BASE_CHAIN_ID,
  MAINNET_CHAIN_ID,
  ARBITRUM_CHAIN_ID,
}