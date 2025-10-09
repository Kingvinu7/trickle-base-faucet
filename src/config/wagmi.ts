// src/config/wagmi.ts
// Re-export from reownConfig to maintain backward compatibility
// This file now serves as a compatibility layer for existing imports
// All configuration is managed in src/lib/reownConfig.ts (single source of truth)

export {
  projectId,
  networks,
  wagmiAdapter,
  config,
  isReownInitialized,
  base,
  mainnet,
  arbitrum,
  BASE_CHAIN_ID,
  MAINNET_CHAIN_ID,
  ARBITRUM_CHAIN_ID,
} from '../lib/reownConfig'
