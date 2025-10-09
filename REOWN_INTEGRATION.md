# Reown AppKit Integration Guide

This application has been integrated with **Reown AppKit** (formerly WalletConnect) to provide comprehensive wallet connectivity and qualify for WalletConnect's weekly rewards program for Base builders.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Setup Instructions](#setup-instructions)
- [Qualifying for Weekly Rewards](#qualifying-for-weekly-rewards)
- [Technical Details](#technical-details)
- [Features Enabled](#features-enabled)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Start

### 1. Get a Reown Project ID

Visit [dashboard.reown.com](https://dashboard.reown.com) and create a free account to get your Project ID.

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_PROJECT_ID=your_project_id_here
```

### 3. Restart Development Server

```bash
npm run dev
# or
pnpm dev
```

That's it! Your app now uses Reown AppKit for wallet connections.

---

## 🔧 Setup Instructions

### Step 1: Get Your Reown Project ID

1. Visit [https://dashboard.reown.com](https://dashboard.reown.com)
2. Sign up or log in with your account
3. Create a new project
4. Copy your Project ID from the dashboard

### Step 2: Add Environment Variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and replace `your_project_id_here` with your actual Project ID:

```env
NEXT_PUBLIC_PROJECT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Step 3: Verify Integration

Start your development server:

```bash
npm run dev
```

Check the console for successful initialization:

```
🔧 Reown AppKit Configuration: {
  projectId: "a1b2c3d4...",
  hasValidProjectId: true,
  mode: "Reown AppKit",
  environment: "development"
}
✅ Initializing with Reown AppKit...
✅ Reown AppKit initialized and attached to window.reownAppKit
```

---

## 🏆 Qualifying for Weekly Rewards

Reown/WalletConnect offers weekly rewards for Base builders. Here's how to qualify:

### Requirements Checklist

- [x] **Integrate Reown AppKit** - ✅ Already done!
- [x] **Deploy on Base Network** - ✅ App supports Base as default
- [ ] **Get a Basename** - Get your onchain identity on Base
- [ ] **Achieve Builder Score ≥40** - Through GitHub activity and contract deployments
- [ ] **Human Verification** - Complete verification through Talent Protocol App

### Additional Actions

1. **Deploy Verified Contracts**
   - Deploy your contracts to Base mainnet
   - Verify them on [BaseScan](https://basescan.org)
   - This significantly boosts your Builder Score

2. **Maintain GitHub Activity**
   - Make meaningful commits and contributions
   - Keep your repository public and active
   - Document your work thoroughly

3. **Get a Basename**
   - Visit [base.org/names](https://www.base.org/names)
   - Register your onchain identity
   - Required for program eligibility

4. **Human Checkmark**
   - Complete verification through Talent Protocol App
   - This proves you're a real builder

### Rewards Program Benefits

- 💰 Weekly USDC rewards based on your Builder Score
- 🎯 Recognition in the Base builder community
- 📊 Access to exclusive analytics and insights
- 🚀 Potential for featured project spotlights

Learn more: [WalletConnect Builder Rewards](https://docs.walletconnect.com/)

---

## 🔍 Technical Details

### Architecture

This app uses **Next.js 14** with the **App Router** and implements Reown AppKit through:

- **WagmiAdapter** - Connects Reown to Wagmi v2
- **Cookie Storage** - SSR-compatible session persistence
- **Multi-chain Support** - Base (default), Ethereum, Arbitrum

### Configuration Files

#### `src/lib/reownConfig.ts`
Main configuration file with:
- Wagmi adapter setup
- AppKit initialization
- Network configuration
- Fallback handling
- Utility functions

#### `src/context/index.tsx`
React context provider that:
- Wraps the app with WagmiProvider
- Initializes Reown AppKit
- Handles SSR hydration

#### `src/app/layout.tsx`
Root layout that:
- Retrieves cookies for SSR
- Passes them to ContextProvider
- Sets up global app structure

### Supported Networks

| Network | Chain ID | Default | RPC Provider |
|---------|----------|---------|--------------|
| **Base** | 8453 | ✅ Yes | Reown/Public |
| **Ethereum** | 1 | No | Reown/Public |
| **Arbitrum** | 42161 | No | Reown/Public |

### Connector Support

The app automatically supports:
- 🦊 **MetaMask** - Browser extension and mobile
- 💙 **Coinbase Wallet** - With smart wallet support
- 🌈 **Rainbow** - Mobile and browser
- 🔐 **Trust Wallet** - Multi-chain mobile wallet
- 🔌 **300+ other wallets** via WalletConnect protocol

---

## ✨ Features Enabled

### ✅ Core Features

- **Universal Wallet Support** - Connect with 300+ wallets
- **Multi-Chain** - Seamless network switching
- **Smart Accounts** - Support for smart contract wallets
- **Session Persistence** - Reconnect automatically
- **QR Code Connection** - Mobile wallet linking
- **Deep Links** - Native app integration

### ✅ User Experience

- **Beautiful Modal** - Clean, branded wallet selection UI
- **Network Detection** - Automatic chain switching prompts
- **Error Handling** - User-friendly error messages
- **Loading States** - Clear connection status feedback
- **Responsive Design** - Works on all screen sizes

### ✅ Developer Features

- **TypeScript Support** - Full type safety
- **SSR Compatible** - Next.js server-side rendering
- **Fallback Mode** - Works without Reown during development
- **Debug Logging** - Detailed console logs for troubleshooting
- **Programmatic Control** - `window.reownAppKit` access

### 🎨 Customization

Theme is customized to match Base branding:

```typescript
themeVariables: {
  '--w3m-color-mix': '#0052FF',        // Base blue
  '--w3m-color-mix-strength': 40,      // Color intensity
  '--w3m-font-family': 'Inter, sans-serif',
  '--w3m-border-radius-master': '12px',
  '--w3m-accent': '#0052FF',           // Accent color
}
```

---

## 📖 Usage Guide

### Basic Usage (Web Component)

Use the built-in web component anywhere in your app:

```tsx
export default function MyPage() {
  return (
    <div>
      <h1>Connect Your Wallet</h1>
      <appkit-button />
    </div>
  )
}
```

### Programmatic Control

Access the modal programmatically via the global instance:

```typescript
// Open the modal
window.reownAppKit?.open()

// Close the modal
window.reownAppKit?.close()
```

### Using Wagmi Hooks

```typescript
'use client'

import { useAccount, useDisconnect } from 'wagmi'

export default function WalletInfo() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()

  if (!isConnected) return <p>Not connected</p>

  return (
    <div>
      <p>Address: {address}</p>
      <p>Network: {chain?.name}</p>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  )
}
```

### Network Utilities

```typescript
import { 
  isBaseNetwork, 
  getSupportedNetworkById,
  isSupportedNetwork,
  BASE_CHAIN_ID 
} from '@/lib/reownConfig'

// Check if on Base network
if (isBaseNetwork(chainId)) {
  console.log('Connected to Base!')
}

// Get network info
const network = getSupportedNetworkById(8453)

// Validate network
if (isSupportedNetwork(chainId)) {
  console.log('Network is supported')
}
```

---

## 🐛 Troubleshooting

### Issue: "Reown Project ID not configured"

**Solution:**
1. Verify `.env.local` exists in project root
2. Ensure variable is named `NEXT_PUBLIC_PROJECT_ID`
3. Restart dev server after adding env variables

### Issue: Modal doesn't open

**Symptoms:** Clicking connect button does nothing

**Solutions:**
- Check browser console for errors
- Verify Reown is initialized: `window.reownAppKit`
- Ensure you're not blocking popups/modals
- Try `window.reownAppKit?.open()` in console

### Issue: "Network not supported"

**Solution:**
```typescript
import { networks } from '@/lib/reownConfig'

// Log supported networks
console.log('Supported networks:', networks)
```

The app supports Base, Ethereum, and Arbitrum. Ask users to switch networks.

### Issue: Wallet won't connect on mobile

**Solutions:**
- Ensure deep links are enabled in your hosting
- Check that mobile wallet app is installed
- Try QR code connection instead
- Verify HTTPS in production (required for WalletConnect)

### Issue: Fallback mode instead of Reown

**Symptoms:** Console shows "Using fallback wagmi configuration"

**Cause:** Invalid or missing Project ID

**Solution:**
1. Get valid Project ID from dashboard.reown.com
2. Ensure it's at least 10 characters long
3. Not a placeholder like "YOUR_PROJECT_ID"
4. Restart dev server

### Debug Mode

Enable detailed logging by opening console and checking:

```javascript
// Check initialization status
console.log('Reown initialized:', !!window.reownAppKit)

// Check configuration
import { isReownInitialized } from '@/lib/reownConfig'
console.log('Valid config:', isReownInitialized)
```

---

## 📚 Additional Resources

### Documentation Links

- [Reown AppKit Docs](https://docs.reown.com/appkit/overview)
- [Wagmi Documentation](https://wagmi.sh/)
- [Base Network Docs](https://docs.base.org/)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)

### Getting Help

- 💬 [Reown Discord](https://discord.com/invite/reown)
- 🐦 [@Reown_](https://twitter.com/Reown_)
- 📖 [GitHub Discussions](https://github.com/reown-com/appkit/discussions)

### Related Files

- `REOWN_COMPLIANCE_REPORT.md` - Compliance checklist
- `REOWN_APPKIT_COMPARISON.md` - Feature comparison analysis
- `WALLETCONNECT_INTEGRATION.md` - Legacy Web3Modal docs

---

## 🎯 Next Steps

1. ✅ Get your Reown Project ID
2. ✅ Add to `.env.local`
3. ✅ Test wallet connections
4. 📝 Get a Basename for rewards eligibility
5. 🚀 Deploy contracts on Base
6. 📊 Monitor analytics in Reown dashboard
7. 💰 Track Builder Score for weekly rewards

---

**Integration Status:** ✅ Complete and Production Ready  
**Last Updated:** October 9, 2025  
**Reown AppKit Version:** 1.8.6  
**Wagmi Version:** 2.5.7
