import { base } from '@reown/appkit/networks'

// Contract Configuration
export const FAUCET_CONTRACT = {
  address: (process.env.NEXT_PUBLIC_FAUCET_CONTRACT_ADDRESS || '0x34bB7cb2c9b5fF03D824F0C80067E3eeB6C4401d') as `0x${string}`,
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
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "nonce",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "signature",
          "type": "bytes"
        }
      ],
      "name": "requestTokens",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "nonce",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "getMessageHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "messageHash",
          "type": "bytes32"
        }
      ],
      "name": "getEthSignedMessageHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "usedNonces",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "nonce",
          "type": "bytes32"
        }
      ],
      "name": "NonceUsed",
      "type": "event"
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

// MON Faucet Contract Configuration (Monad Testnet)
export const MON_FAUCET_CONTRACT = {
  address: (process.env.NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS || '') as `0x${string}`,
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
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "claimNumber",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalClaimedToday",
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
          "internalType": "bytes32",
          "name": "nonce",
          "type": "bytes32"
        }
      ],
      "name": "NonceUsed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newDay",
          "type": "uint256"
        }
      ],
      "name": "DailyLimitReset",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "nonce",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "signature",
          "type": "bytes"
        }
      ],
      "name": "requestTokens",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "nonce",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "getMessageHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "messageHash",
          "type": "bytes32"
        }
      ],
      "name": "getEthSignedMessageHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCurrentDay",
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
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getRemainingClaims",
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
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getRemainingMON",
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
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserClaimInfo",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "claimsMadeToday",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "remainingClaims",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "monClaimedToday",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "remainingMON",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "canClaimNow",
          "type": "bool"
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
      "inputs": [],
      "name": "maxClaimsPerDay",
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
      "name": "dailyLimit",
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
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "usedNonces",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
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
          "internalType": "uint256",
          "name": "_newMax",
          "type": "uint256"
        }
      ],
      "name": "setMaxClaimsPerDay",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_newLimit",
          "type": "uint256"
        }
      ],
      "name": "setDailyLimit",
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
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ] as const
} as const

// Monad Testnet Configuration
// Based on https://chainlist.org/chain/10143
export const monadTestnet = {
  id: 10143, // Monad Testnet chain ID
  name: 'Monad Testnet',
  network: 'monad-testnet',
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
    default: { name: 'Monad Explorer', url: 'https://explorer.monad.xyz' },
  },
  testnet: true,
} as const

// Network Configuration
export const SUPPORTED_CHAINS = [base, monadTestnet]
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
  HEALTH: '/health',
  REQUEST_SIGNATURE: '/request-signature',
  REQUEST_MON_SIGNATURE: '/request-mon-signature',
  CHECK_FOLLOW: '/check-follow',
  CHECK_SPAM_LABEL: '/check-spam-label'
} as const

// Farcaster Configuration
export const FARCASTER_CONFIG = {
  targetFid: 250869, // vinu07's FID
  targetUsername: 'vinu07',
  targetProfileUrl: 'https://farcaster.xyz/vinu07',
  followRequired: process.env.NEXT_PUBLIC_FOLLOW_REQUIRED !== 'false', // Default true
  // Neynar score requirement (minimum 0.5 score to claim)
  // Neynar score ranges from 0 to 1, where higher scores indicate more reputable accounts
  // This helps prevent spam and ensures fair distribution to legitimate users
  spamLabelRequired: process.env.NEXT_PUBLIC_SPAM_LABEL_REQUIRED !== 'false' // Default true
} as const

// App Configuration
export const APP_CONFIG = {
  name: 'Trickle - Base Faucet',
  description: 'Get $0.03 worth of ETH for gas fees on Base mainnet',
  claimAmount: '0.03',
  cooldownHours: 24,
  version: '2.0.0',
  // Miniapp Configuration
  // When true, claims are ONLY allowed from within the Farcaster miniapp environment
  // When false or undefined, development mode bypass is allowed (localhost, vercel preview, etc.)
  miniappStrictMode: process.env.NEXT_PUBLIC_MINIAPP_STRICT_MODE === 'true'
} as const

// MON Faucet Configuration
export const MON_CONFIG = {
  name: 'MON Token Faucet',
  description: 'Get MON testnet tokens on Monad',
  claimAmount: '0.1',
  maxClaimsPerDay: 10,
  dailyLimit: '1.0',
  enabled: process.env.NEXT_PUBLIC_MON_FAUCET_ENABLED === 'true',
  network: 'Monad Testnet'
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