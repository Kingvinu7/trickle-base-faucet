// src/config/wagmi.ts
// Re-export from wagmiConfig for backward compatibility

export {
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
  base,
  mainnet,
  arbitrum,
  monadTestnet,
} from '../lib/wagmiConfig'
