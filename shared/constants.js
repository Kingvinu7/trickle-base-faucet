// Shared constants across all platforms

// Network Configuration
export const NETWORKS = {
    BASE_MAINNET: {
        chainId: 8453,
        chainIdHex: '0x2105',
        name: 'Base Mainnet',
        currency: 'ETH',
        rpcUrl: 'https://mainnet.base.org',
        explorerUrl: 'https://basescan.org',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
        }
    },
    ETHEREUM_MAINNET: {
        chainId: 1,
        chainIdHex: '0x1',
        name: 'Ethereum Mainnet',
        currency: 'ETH',
        rpcUrl: 'https://cloudflare-eth.com',
        explorerUrl: 'https://etherscan.io',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
        }
    }
};

// Contract Configuration
export const CONTRACTS = {
    FAUCET: {
        address: '0x8D08e77837c28fB271D843d84900544cA46bA2F3',
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
        ]
    }
};

// WalletConnect Configuration
export const WALLETCONNECT_CONFIG = {
    // Replace with your actual project ID from https://cloud.walletconnect.com
    projectId: process.env.WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
    
    // App metadata
    metadata: {
        name: 'Trickle - Base Faucet',
        description: 'Get $0.025 worth of ETH for gas fees on Base mainnet',
        url: 'https://your-domain.com', // Update with your actual domain
        icons: ['https://your-domain.com/favicon.ico']
    },
    
    // Supported chains (using CAIP-2 format)
    chains: ['eip155:8453'], // Base Mainnet
    
    // Optional chains
    optionalChains: ['eip155:1'], // Ethereum Mainnet
    
    // RPC endpoints
    rpcMap: {
        8453: 'https://mainnet.base.org',
        1: 'https://cloudflare-eth.com'
    },
    
    // Features
    enableAnalytics: true,
    enableEmail: false,
    enableSocials: false,
    
    // Theme
    themeMode: 'light',
    themeVariables: {
        '--w3m-color-mix': '#00D4FF',
        '--w3m-color-mix-strength': 40
    }
};

// API Configuration
export const API_CONFIG = {
    baseUrl: process.env.API_BASE_URL || 'https://your-api-domain.com',
    endpoints: {
        checkEligibility: '/check-eligibility',
        logClaim: '/log-claim',
        stats: '/stats',
        blockchainStats: '/blockchain-stats'
    },
    timeout: 10000 // 10 seconds
};

// App Configuration
export const APP_CONFIG = {
    name: 'Trickle - Base Faucet',
    version: '1.0.0',
    description: 'Get $0.025 worth of ETH for gas fees on Base mainnet',
    
    // Cooldown configuration
    cooldownHours: 24,
    
    // Claim amount (in ETH)
    claimAmount: '0.025',
    
    // Deep linking
    schemes: {
        ios: 'trickle://',
        android: 'trickle://',
        universal: 'https://your-domain.com/app'
    },
    
    // Social links
    social: {
        website: 'https://your-domain.com',
        twitter: 'https://twitter.com/your-handle',
        discord: 'https://discord.gg/your-server',
        github: 'https://github.com/your-repo'
    }
};

// Function signatures (for contract interactions)
export const FUNCTION_SIGNATURES = {
    REQUEST_TOKENS: '0x9fbc8713' // keccak256("requestTokens()")
};

// Error messages
export const ERROR_MESSAGES = {
    WALLET_NOT_CONNECTED: 'Please connect your wallet first',
    WRONG_NETWORK: 'Please switch to Base network',
    INSUFFICIENT_FUNDS: 'Insufficient funds for gas fees',
    COOLDOWN_ACTIVE: 'Please wait before claiming again',
    TRANSACTION_REJECTED: 'Transaction was rejected by user',
    CONNECTION_FAILED: 'Failed to connect wallet',
    UNKNOWN_ERROR: 'An unknown error occurred'
};

// Success messages
export const SUCCESS_MESSAGES = {
    WALLET_CONNECTED: 'Wallet connected successfully!',
    CLAIM_SUCCESS: 'ETH claimed successfully!',
    TRANSACTION_SENT: 'Transaction sent to network'
};