# WalletConnect SDK Integration Guide

> **⚠️ NOTICE:** This document describes the legacy Web3Modal v4 integration.  
> **For the current Reown AppKit integration, see:**
> - **[REOWN_INTEGRATION.md](./REOWN_INTEGRATION.md)** - Complete setup guide
> - **[REOWN_COMPLIANCE_REPORT.md](./REOWN_COMPLIANCE_REPORT.md)** - Compliance checklist
> - **[REOWN_APPKIT_COMPARISON.md](./REOWN_APPKIT_COMPARISON.md)** - Feature comparison

---

## 🔗 Overview

This project now integrates **Reown AppKit** (formerly WalletConnect/Web3Modal) to provide comprehensive wallet connectivity supporting **300+ wallets** across desktop, mobile, and browser platforms.

**Current Version:** Reown AppKit 1.8.6 (upgraded from Web3Modal v4)

## 📦 Packages Added

**UPDATED:** The project now uses Reown AppKit packages:

```json
{
  "dependencies": {
    "@reown/appkit": "^1.8.6",                    // Reown AppKit (formerly Web3Modal)
    "@reown/appkit-adapter-wagmi": "^1.8.6",      // Wagmi adapter
    "@wagmi/core": "^2.6.5",                      // Core Web3 functionality  
    "wagmi": "^2.5.7",                            // React hooks for Web3
    "viem": "^2.7.15",                            // Low-level Ethereum client
    "@tanstack/react-query": "^5.25.0"            // Query client
  }
}
```

**Migration:** `@web3modal/wagmi` → `@reown/appkit` + `@reown/appkit-adapter-wagmi`

## 🔧 Configuration Files

### 1. Reown Configuration (`src/lib/reownConfig.ts`)
**UPDATED:** Main configuration now uses Reown AppKit
```typescript
// Reown AppKit configuration
- Project ID setup with validation
- Supported chains (Base, Ethereum, Arbitrum)
- WagmiAdapter integration
- Modal customization and theming
- Fallback handling
- Global instance access (window.reownAppKit)
```

### 2. Wagmi Re-exports (`src/config/wagmi.ts`)
**UPDATED:** Now re-exports from reownConfig.ts for backward compatibility
```typescript
// Re-exports configuration from reownConfig
export { projectId, networks, wagmiAdapter, config } from '../lib/reownConfig'
```

### 3. Next.js Configuration (`next.config.js`)
```javascript
// Webpack fallbacks for WalletConnect SDK (if needed)
config.resolve.fallback = {
  '@react-native-async-storage/async-storage': false
};
```

### 4. Environment Variables
**UPDATED:** Variable name changed
```env
# Old (deprecated)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# New (current)
NEXT_PUBLIC_PROJECT_ID=your_project_id_here
```

## 🎯 Supported Wallets

### Featured Wallets:
- **MetaMask** - Most popular Ethereum wallet
- **Coinbase Wallet** - User-friendly with built-in DApp browser
- **Trust Wallet** - Multi-chain mobile wallet
- **Rainbow** - Beautiful, user-friendly interface

### Platform Support:
- **Desktop**: Browser extensions (MetaMask, Coinbase, etc.)
- **Mobile**: Native wallet apps via deep links
- **QR Code**: Mobile wallet connection via QR scanning
- **Web**: Browser-based wallets

## 🚀 Key Features Implemented

### ✅ Multi-Platform Connectivity
- Automatic detection of available wallets
- Platform-specific connection methods
- Seamless mobile-desktop experience

### ✅ Session Management
- Persistent wallet connections
- Auto-reconnection on page refresh
- Secure session storage

### ✅ Network Management
- Automatic network switching to Base
- Multi-chain support (Base + Ethereum)
- Network mismatch detection and prompts

### ✅ User Experience
- Beautiful, customizable modal interface
- Loading states and error handling
- Responsive design for all screen sizes

## 🔍 Technical Implementation

### React Hooks Used:
**UPDATED:** Reown AppKit hooks
```typescript
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'
// Web component for modal: <appkit-button />
// Or programmatic: window.reownAppKit?.open()
```

### Key Components:
**UPDATED:** New component structure
- `src/lib/reownConfig.ts` - Main Reown AppKit configuration
- `src/context/index.tsx` - Wagmi & AppKit provider setup
- `src/components/faucet-card.tsx` - Main wallet integration
- `src/hooks/use-eligibility.ts` - Wallet-based eligibility checking
- `src/hooks/use-faucet-claim.ts` - Smart contract interactions

## 🐛 Build Fixes Applied

### Vercel Build Issues Resolved:
1. **Missing Node Types**: Added `@types/node` to devDependencies
2. **React Native Dependencies**: Added webpack fallbacks for async storage
3. **MetaMask SDK Compatibility**: Configured proper fallbacks in next.config.js

### Webpack Configuration:
```javascript
// Fix for WalletConnect SDK React Native dependencies
config.resolve.fallback = {
  '@react-native-async-storage/async-storage': false
};
```

## 📱 Mobile Integration

### Deep Link Support:
- Automatic deep link generation for mobile wallets
- Platform detection (iOS/Android)
- Fallback to QR codes when deep links unavailable

### QR Code Connections:
- Automatic QR code generation
- Mobile wallet scanning support
- Connection status feedback

## 🔐 Security Features

### Best Practices Implemented:
- Environment variable protection for Project ID
- Secure session management
- Network validation before transactions
- Error boundary protection

### Privacy:
- Analytics can be disabled
- No personal data collection
- Wallet addresses handled securely

## 📊 Analytics & Monitoring

### WalletConnect Analytics:
- Connection success rates
- Popular wallet usage
- Platform distribution
- Error tracking

### Custom Events:
- Wallet connection events
- Network switching events
- Transaction initiation tracking

## 🔄 Migration Notes

### From Previous Version:
- Upgraded from basic injected wallet support
- Added comprehensive multi-wallet support
- Improved user experience with modal interface
- Enhanced mobile compatibility

### Breaking Changes:
- None - backward compatible with existing functionality
- Enhanced features without removing previous capabilities

## 🎨 Customization

### Theme Customization:
```typescript
themeVariables: {
  '--w3m-color-mix': '#0052FF',           // Brand color
  '--w3m-color-mix-strength': 40,         // Color intensity
  '--w3m-font-family': 'Inter, sans-serif', // Font family
  '--w3m-border-radius-master': '12px'    // Border radius
}
```

### Wallet Selection:
- Featured wallets prominently displayed
- Custom wallet inclusion/exclusion
- Platform-specific wallet filtering

## 📞 Support & Resources

### Documentation:
**UPDATED:** New documentation links
- [Reown AppKit Docs](https://docs.reown.com/appkit)
- [WalletConnect Docs](https://docs.walletconnect.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- **Internal**: [REOWN_INTEGRATION.md](./REOWN_INTEGRATION.md)

### Project ID:
**UPDATED:** Get from new dashboard
- Get your Project ID at [dashboard.reown.com](https://dashboard.reown.com)
- Required for Reown AppKit functionality
- Free tier available with generous limits
- Qualifies for WalletConnect Builder Rewards

---

## 🔄 Migration to Reown AppKit

### What Changed?

| Aspect | Old (Web3Modal v4) | New (Reown AppKit) |
|--------|-------------------|-------------------|
| **Package** | `@web3modal/wagmi` | `@reown/appkit` |
| **Adapter** | Built-in | `@reown/appkit-adapter-wagmi` |
| **Hook** | `useWeb3Modal()` | Web component or `window.reownAppKit` |
| **Env Var** | `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `NEXT_PUBLIC_PROJECT_ID` |
| **Dashboard** | cloud.walletconnect.com | dashboard.reown.com |

### Why Reown?

- ✅ WalletConnect rebranded to Reown
- ✅ Better Next.js App Router support
- ✅ Improved SSR handling
- ✅ Enhanced features and stability
- ✅ Builder rewards program integration

### Migration Complete

All features from Web3Modal v4 are preserved and enhanced in Reown AppKit.

---

**Original Integration Date**: September 21, 2025  
**Reown Migration Date**: October 9, 2025  
**Current Version**: Reown AppKit 1.8.6  
**Implementation Status**: ✅ Migrated and Production Ready  

**📖 For Current Documentation:** See [REOWN_INTEGRATION.md](./REOWN_INTEGRATION.md)