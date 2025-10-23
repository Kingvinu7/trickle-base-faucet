# 🔍 Monad Network Debug Guide

## Issue: "Wrong Network" showing after switching

### Quick Checks

**1. Open Browser Console (F12) and check the logs:**

Look for: `MON Faucet Network Check:`

Should show:
```javascript
{
  isConnected: true,
  currentChainId: 10143,      // ← Should be 10143
  currentChainName: "Monad Testnet",
  expectedChainId: 10143,
  expectedChainName: "Monad Testnet",
  isWrongNetwork: false       // ← Should be false
}
```

**If `isWrongNetwork: true` even when `currentChainId: 10143`:**
- There's a bug in the check logic
- Clear browser cache and hard refresh (Ctrl+Shift+R)

**If `currentChainId` is NOT 10143:**
- Wallet didn't actually switch
- Try manual switch in wallet

---

## Manual Network Addition

If auto-switch doesn't work, add Monad Testnet manually to your wallet:

### For MetaMask / Coinbase Wallet:

**Network Name:** `Monad Testnet`
**RPC URL:** `https://testnet-rpc.monad.xyz`
**Chain ID:** `10143`
**Currency Symbol:** `MON`
**Block Explorer:** `https://explorer.monad.xyz`

### Steps:
1. Open wallet
2. Networks dropdown → Add Network
3. Fill in details above
4. Save
5. Switch to Monad Testnet
6. Refresh the faucet page

---

## Verification Steps

### 1. Check Current Chain
```javascript
// In browser console
console.log('Current chain:', window.ethereum.chainId)
// Should show: 0x279f (hex for 10143)
```

### 2. Check Monad Config
```javascript
// In browser console
// Should show chain ID 10143
```

### 3. Force Switch
```javascript
// In browser console
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0x279f' }], // 10143 in hex
})
```

### 4. Add Network Manually
```javascript
// In browser console
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x279f',
    chainName: 'Monad Testnet',
    nativeCurrency: {
      name: 'MON',
      symbol: 'MON',
      decimals: 18
    },
    rpcUrls: ['https://testnet-rpc.monad.xyz'],
    blockExplorerUrls: ['https://explorer.monad.xyz']
  }]
})
```

---

## Common Issues

### Issue 1: "Switched to Monad" but still wrong network
**Cause:** Wallet switched but wagmi state hasn't updated
**Fix:** 
- Refresh the page
- Or disconnect/reconnect wallet

### Issue 2: Can't find Monad Testnet in wallet
**Cause:** Network not added to wallet
**Fix:** Add manually using steps above

### Issue 3: RPC error when switching
**Cause:** RPC might be down or rate limited
**Fix:** 
- Try again in a few seconds
- Check https://testnet-rpc.monad.xyz directly
- Try alternative RPC if available

### Issue 4: Contract address not recognized
**Cause:** Contract not deployed or wrong network
**Fix:**
- Verify contract deployed at: 0xbDcf080097890804F0c7bed6ADf8b58b042a0D47
- Check on explorer: https://explorer.monad.xyz/address/0xbDcf080097890804F0c7bed6ADf8b58b042a0D47

---

## Expected Network Flow

1. **User clicks "Monad Testnet" tab**
2. **App calls switchChain with chainId 10143**
3. **Wallet prompts: "Switch to Monad Testnet?"**
4. **User approves**
5. **Wallet switches** (chainId becomes 10143)
6. **Wagmi detects change** (chain?.id becomes 10143)
7. **App rechecks** `isWrongNetwork = false`
8. **Orange banner disappears**
9. **Claim button enabled**

**If stuck at step 7-8:**
- Refresh page
- Disconnect and reconnect wallet
- Check console logs

---

## Environment Variables (Vercel)

Make sure these are set:
```env
NEXT_PUBLIC_MON_FAUCET_ENABLED=true
NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS=0xbDcf080097890804F0c7bed6ADf8b58b042a0D47
MON_FAUCET_CONTRACT_ADDRESS=0xbDcf080097890804F0c7bed6ADf8b58b042a0D47
MON_FAUCET_OWNER_PRIVATE_KEY=your_key
```

After setting, **REDEPLOY** on Vercel!

---

## Testing Locally

```bash
# 1. Clone repo
git pull origin main

# 2. Install dependencies
npm install

# 3. Create .env.local with MON vars
# (Copy from .env.example)

# 4. Run dev server
npm run dev

# 5. Open http://localhost:3000
# 6. Check console for "MON Faucet Network Check" logs
```

---

## Quick Fix Commands

### Clear Everything and Retry
```bash
# 1. Clear browser cache
# 2. Hard refresh (Ctrl+Shift+R)
# 3. Disconnect wallet
# 4. Reconnect wallet
# 5. Click Monad tab
# 6. Approve switch
```

### Force Reconnect
```javascript
// In console
window.location.reload()
```

---

## Support

If still not working after all above:

1. **Check console logs** - Share the `MON Faucet Network Check` output
2. **Check wallet** - What chain ID does it show?
3. **Check RPC** - Can you access https://testnet-rpc.monad.xyz?
4. **Check contract** - Is it deployed on Monad Testnet?

**Share this info for debugging:**
```javascript
{
  chainId: window.ethereum.chainId,
  networkVersion: window.ethereum.networkVersion,
  isConnected: // from app,
  currentChain: // from wagmi
}
```
