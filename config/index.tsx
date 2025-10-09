// config/index.tsx
// Re-export everything from src/lib/reownConfig.ts (single source of truth)
// This file maintains backward compatibility for imports from /config

export {
  projectId,
  networks,
  metadata,
  wagmiAdapter,
  config,
  appKitConfig,
  initializeAppKit,
  appKitInstance,
  isReownInitialized,
  getAppKitState,
  openAppKit,
  closeAppKit,
  isBaseNetwork,
  getSupportedNetworkById,
  isSupportedNetwork,
  base,
  mainnet,
  arbitrum,
  BASE_CHAIN_ID,
  MAINNET_CHAIN_ID,
  ARBITRUM_CHAIN_ID,
} from '../src/lib/reownConfig'
