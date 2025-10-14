import { base } from '@reown/appkit/networks'

// Contract Configuration
export const FAUCET_CONTRACT = {
  address: '0x52dA60097d20F5AE30a3A620095139B10a7B1734' as `0x${string}`,
  abi: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "initialOwner",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "FundsDripped",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "requestTokens",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_newCooldown",
          "type": "uint256"
        }
      ],
      "name": "setCooldownTime",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_newAmount",
          "type": "uint256"
        }
      ],
      "name": "setDripAmount",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    },
    {
      "inputs": [],
      "name": "cooldownTime",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "dripAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "lastClaimed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const
} as const

// Network Configuration
export const SUPPORTED_CHAINS = [base]
export const DEFAULT_CHAIN = base

// Environment validation
function validateEnvironment() {
  const requiredEnvVars = ['NEXT_PUBLIC_PROJECT_ID']
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.warn(`Missing environment variables: ${missingVars.join(', ')}`)
    console.warn('App will use fallback wagmi configuration')
  }
}

// Validate environment on module load
if (typeof window === 'undefined') {
  validateEnvironment()
}

// API Configuration - Use Next.js API routes as proxy
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export const API_ENDPOINTS = {
  CHECK_ELIGIBILITY: '/check-eligibility',
  LOG_CLAIM: '/log-claim',
  STATS: '/stats',
  BLOCKCHAIN_STATS: '/blockchain-stats',
  HEALTH: '/health'
} as const

// App Configuration
export const APP_CONFIG = {
  name: 'Trickle - Base Faucet',
  description: 'Get $0.1 worth of ETH for gas fees on Base mainnet',
  claimAmount: '0.1',
  cooldownHours: 24,
  version: '2.0.0',
  // Miniapp Configuration
  // When true, claims are ONLY allowed from within the Farcaster miniapp environment
  // When false or undefined, development mode bypass is allowed (localhost, vercel preview, etc.)
  miniappStrictMode: process.env.NEXT_PUBLIC_MINIAPP_STRICT_MODE === 'true'
} as const

// UI Configuration
export const UI_CONFIG = {
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500
    }
  },
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024
  }
} as const

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  WRONG_NETWORK: 'Please switch to Base network',
  INSUFFICIENT_FUNDS: 'Insufficient funds for gas fees',
  COOLDOWN_ACTIVE: 'Please wait before claiming again',
  TRANSACTION_REJECTED: 'Transaction was rejected',
  CONNECTION_FAILED: 'Failed to connect wallet',
  UNKNOWN_ERROR: 'An unknown error occurred',
  NETWORK_ERROR: 'Network error. Please try again.',
  CONTRACT_ERROR: 'Contract interaction failed'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully!',
  CLAIM_SUCCESS: 'ETH claimed successfully!',
  TRANSACTION_SENT: 'Transaction sent to network',
  NETWORK_SWITCHED: 'Network switched successfully'
} as const

// Social Links
export const SOCIAL_LINKS = {
  website: 'https://base.org',
  twitter: 'https://twitter.com/base',
  discord: 'https://discord.gg/buildonbase',
  github: 'https://github.com/base-org'
} as const