/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['assets.coingecko.com', 'raw.githubusercontent.com'],
  },
  webpack: (config) => {
    // WalletConnect SDK webpack fallbacks
    // Required for WalletConnect SDK which has React Native dependencies
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      // Fix for @metamask/sdk React Native async storage dependency
      '@react-native-async-storage/async-storage': false
    };
    // Exclude problematic packages from bundling
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  env: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

module.exports = nextConfig