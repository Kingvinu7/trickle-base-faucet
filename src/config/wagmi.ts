'use client'

/**
 * WalletConnect SDK Integration
 * 
 * This file configures WalletConnect SDK v4 for comprehensive wallet support.
 * Supports 300+ wallets including MetaMask, Coinbase Wallet, Trust Wallet, etc.
 * 
 * Key Features:
 * - Multi-platform wallet support (desktop, mobile, browser extensions)
 * - QR code connections for mobile wallets
 * - Deep link integration for mobile apps
 * - Session persistence across browser sessions
 * - Network switching support
 */

import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { WagmiConfig } from 'wagmi'
import { base, mainnet } from '@reown/appkit/networks'

// WalletConnect project ID - safe to be public
const projectId = 'a9e76b0ec4e509017100199fb6ff6957'

// Define chains
const chains = [base, mainnet] as const

// App metadata
const metadata = {
  name: 'Trickle - Base Faucet',
  description: 'Get $0.025 worth of ETH for gas fees on Base mainnet',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://trickle-faucet.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [...chains]
})

// Get the wagmi config from adapter
const config = wagmiAdapter.wagmiConfig

// Create AppKit
const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [...chains],
  projectId,
  metadata,
  features: {
    analytics: true
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#0052FF',
    '--w3m-color-mix-strength': 40,
    '--w3m-font-family': 'Inter, sans-serif',
    '--w3m-border-radius-master': '12px'
  }
})

export { config, projectId, appKit }