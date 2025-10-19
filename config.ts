import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, arbitrum, base, type AppKitNetwork } from '@reown/appkit/networks'
import { QueryClient } from '@tanstack/react-query'

// Project ID from environment variables
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || ''

if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

// Metadata for the application
export const metadata = {
  name: 'Trickle - Base Faucet',
  description: 'Get $0.03 worth of ETH for gas fees on Base mainnet - only for Farcaster users',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://trickle-faucet.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

// Define supported networks
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [base, mainnet, arbitrum]

// Create Wagmi Adapter
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

// Create and export QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: (failureCount, error) => {
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number
          if (status >= 400 && status < 500) {
            return false
          }
        }
        return failureCount < 3
      },
    },
  },
})

// Create AppKit with analytics and user tracking enabled
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: base,
  metadata,
  features: { 
    analytics: true, // Enable analytics for tracking
    allWallets: true, // Track all wallet connections (required for dashboard)
    email: false,
    socials: [],
    swaps: false,
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#0052FF',
    '--w3m-color-mix-strength': 40,
    '--w3m-font-family': 'Inter, sans-serif',
    '--w3m-border-radius-master': '12px',
    '--w3m-accent': '#0052FF',
  },
})
