// src/lib/wagmiConfig.ts - Simplified wagmi config for Farcaster only
import { http, cookieStorage, createConfig, createStorage } from 'wagmi'
import { base, mainnet, arbitrum } from 'wagmi/chains'
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors'
import type { Chain } from 'viem'

// Monad Testnet configuration
export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Monad Explorer', 
      url: 'https://explorer.monad.xyz' 
    },
  },
  testnet: true,
} as const satisfies Chain

// All supported networks
export const networks: [Chain, ...Chain[]] = [base, monadTestnet, mainnet, arbitrum]

// Create wagmi config with connectors for browser access
export const config = createConfig({
  chains: networks,
  connectors: [
    injected(), // MetaMask, Brave, etc.
    coinbaseWallet({
      appName: 'Trickle Base Faucet',
      appLogoUrl: 'https://trickle-base-faucet.vercel.app/ti.png',
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID || 'placeholder',
      metadata: {
        name: 'Trickle Base Faucet',
        description: 'Get ETH for gas fees on Base mainnet',
        url: 'https://trickle-base-faucet.vercel.app',
        icons: ['https://trickle-base-faucet.vercel.app/ti.png'],
      },
    }),
  ],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [base.id]: http(),
    [monadTestnet.id]: http(),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
  },
})

// Network utilities
export const isBaseNetwork = (chainId?: number) => {
  return chainId === base.id
}

export const isMonadTestnet = (chainId?: number) => {
  return chainId === monadTestnet.id
}

export const getSupportedNetworkById = (chainId: number) => {
  return networks.find(network => network.id === chainId)
}

export const isSupportedNetwork = (chainId?: number) => {
  if (!chainId) return false
  return networks.some(network => network.id === chainId)
}

export const getNetworkName = (chainId?: number) => {
  if (!chainId) return 'Unknown'
  const network = networks.find(n => n.id === chainId)
  return network?.name || 'Unknown'
}

// Export network constants
export { base, mainnet, arbitrum }
export const BASE_CHAIN_ID = base.id
export const MAINNET_CHAIN_ID = mainnet.id
export const ARBITRUM_CHAIN_ID = arbitrum.id
export const MONAD_TESTNET_CHAIN_ID = monadTestnet.id

// Console logging for debugging
console.log('🔧 Wagmi Configuration (Farcaster only):', {
  mode: 'Farcaster embedded wallet',
  supportedNetworks: [
    `Base (${base.id})`,
    `Monad Testnet (${monadTestnet.id})`,
    `Ethereum (${mainnet.id})`,
    `Arbitrum (${arbitrum.id})`
  ]
})

// Default export
export default {
  config,
  networks,
  isBaseNetwork,
  isMonadTestnet,
  getSupportedNetworkById,
  isSupportedNetwork,
  getNetworkName,
  BASE_CHAIN_ID,
  MAINNET_CHAIN_ID,
  ARBITRUM_CHAIN_ID,
  MONAD_TESTNET_CHAIN_ID,
}
