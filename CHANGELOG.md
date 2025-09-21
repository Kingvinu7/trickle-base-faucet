# Changelog

All notable changes to the Trickle Base Faucet project will be documented in this file.

## [2.0.0] - 2025-09-21

### 🔗 Major Addition: WalletConnect SDK Integration

#### Added
- **WalletConnect SDK v4** integration for comprehensive wallet support
- Support for **300+ wallets** including:
  - MetaMask (browser extension & mobile)
  - Coinbase Wallet
  - Trust Wallet
  - Rainbow Wallet
  - Ledger Live
  - And many more...

#### WalletConnect Features
- ✅ **Multi-platform support**: Desktop, mobile, browser extensions
- ✅ **QR Code connections** for mobile wallets
- ✅ **Deep link integration** for mobile apps
- ✅ **Session persistence** across browser sessions
- ✅ **Network switching** support (Base mainnet)

#### Technical Implementation
- Added `@web3modal/wagmi` v4.1.7 for modal interface
- Integrated `wagmi` v2.5.7 for React hooks
- Added `viem` v2.7.15 for low-level Ethereum interactions
- Configured webpack fallbacks for React Native dependencies
- Set up proper TypeScript types for Web3 interactions

#### Configuration Added
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` environment variable
- Multi-chain configuration (Base + Ethereum mainnet)
- Custom wallet connector setup in `src/config/wagmi.ts`

### 🐛 Bug Fixes
- Fixed API route mismatch causing false cooldown messages
- Improved error handling for database connection issues
- Enhanced user feedback for system errors vs actual cooldowns

### 🔧 Technical Improvements
- Better error logging and debugging information
- Improved serverless deployment compatibility
- Enhanced type safety across Web3 components

---

## [1.0.0] - Initial Release

### Added
- Basic faucet functionality for Base mainnet
- Simple wallet connection (injected wallets only)
- 24-hour cooldown system
- Database integration for claim tracking
- Basic UI with Tailwind CSS