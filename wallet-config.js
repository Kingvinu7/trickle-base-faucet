// WalletConnect Configuration
// Get your project ID from https://cloud.walletconnect.com

export const WALLETCONNECT_CONFIG = {
    // Replace with your actual WalletConnect project ID
    projectId: process.env.WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
    
    // Supported chains
    chains: {
        base: {
            chainId: 8453,
            name: 'Base',
            currency: 'ETH',
            explorerUrl: 'https://basescan.org',
            rpcUrl: 'https://mainnet.base.org'
        },
        // Add more chains as needed
        ethereum: {
            chainId: 1,
            name: 'Ethereum',
            currency: 'ETH',
            explorerUrl: 'https://etherscan.io',
            rpcUrl: 'https://cloudflare-eth.com'
        }
    },
    
    // App metadata
    metadata: {
        name: 'Trickle - Base Faucet',
        description: 'Get gas fees for Base mainnet',
        url: 'https://your-domain.com', // Update with your actual domain
        icons: ['https://your-domain.com/favicon.ico']
    },
    
    // Features
    enableAnalytics: true,
    enableEmail: false,
    enableSocials: false,
    
    // Theme customization
    themeMode: 'light', // 'light' | 'dark' | 'auto'
    themeVariables: {
        '--w3m-color-mix': '#00D4FF',
        '--w3m-color-mix-strength': 40
    }
};

// Mobile app configurations
export const MOBILE_CONFIG = {
    android: {
        packageName: 'com.trickle.faucet',
        scheme: 'trickle',
        universalLink: 'https://your-domain.com/app'
    },
    ios: {
        bundleId: 'com.trickle.faucet',
        scheme: 'trickle',
        universalLink: 'https://your-domain.com/app'
    }
};