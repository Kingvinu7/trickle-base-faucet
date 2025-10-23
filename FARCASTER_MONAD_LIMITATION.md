# ⚠️ Farcaster Wallet Limitation for Monad Testnet

## 🔍 The Issue Discovered

**Farcaster's embedded wallet only supports 3 networks:**
- ✅ Base (Chain ID: 8453)
- ✅ Ethereum (Chain ID: 1)
- ✅ Arbitrum (Chain ID: 42161)

**It does NOT support:**
- ❌ Monad Testnet (Chain ID: 10143)
- ❌ Any other custom networks

This is a **platform limitation**, not a bug in our code.

---

## ✅ The Solution

We've implemented a **dual-platform approach**:

### Base ETH Faucet
- **Platform:** Farcaster only ✓
- **Network:** Base
- **Works in:** Farcaster miniapp
- **Requirements:** Follow + Score

### MON Token Faucet  
- **Platform:** Regular wallets only ✓
- **Network:** Monad Testnet
- **Works in:** MetaMask, Coinbase Wallet, Rainbow, etc.
- **Does NOT work in:** Farcaster miniapp

---

## 🎯 User Experience

### When User is in Farcaster

**Clicks "Monad Testnet" tab:**

Shows blue info banner:
```
┌─────────────────────────────────────────┐
│ ℹ️ Farcaster Wallet Limitation         │
│                                         │
│ Farcaster's embedded wallet only       │
│ supports Base, Ethereum, and Arbitrum. │
│                                         │
│ To claim MON on Monad Testnet, use:   │
│ • MetaMask                             │
│ • Coinbase Wallet                      │
│ • Rainbow Wallet                       │
│ • Or any wallet that supports custom   │
│   networks                             │
│                                         │
│ How to claim MON:                      │
│ 1. Open this site in regular browser  │
│ 2. Connect MetaMask/Coinbase Wallet   │
│ 3. Add Monad Testnet (Chain ID: 10143)│
│ 4. Come back and claim MON tokens     │
└─────────────────────────────────────────┘
```

**Button shows:** "Use Regular Wallet" (disabled)

### When User Uses Regular Wallet (Outside Farcaster)

**Clicks "Monad Testnet" tab:**

1. ✅ Auto-prompts to add Monad Testnet
2. ✅ Auto-switches to Monad Testnet
3. ✅ Shows claim stats
4. ✅ Can claim MON tokens!

**However:** Follow and score checks WON'T work (no Farcaster context)

---

## 🔧 Technical Implementation

### Platform Logic

**Base ETH:**
```typescript
requires: isAllowedPlatform === true  // Must be in Farcaster
checks: follow, score, platform
```

**MON Tokens:**
```typescript
requires: isAllowedPlatform === false  // Must NOT be in Farcaster
checks: network only (no follow/score outside Farcaster)
```

### Code Changes

1. **MON faucet disabled in Farcaster**
2. **Shows helpful limitation notice**
3. **Provides clear instructions**
4. **Button disabled with explanation**
5. **Works perfectly outside Farcaster**

---

## 🎯 Recommended Approach

### Option 1: Current Implementation (DONE)
- Base ETH: Farcaster only
- MON: Regular wallets only
- Clear messaging for users

**Pros:** ✅ Both faucets work
**Cons:** ❌ Different platforms for each

### Option 2: Disable MON in Farcaster (Alternative)

Hide MON tab completely when in Farcaster:
```typescript
{!isInFarcaster && <MonadTab />}
```

**Pros:** ✅ Less confusion
**Cons:** ❌ Users don't know MON exists

### Option 3: Deploy MON on Base (If Possible)

If you can deploy MON contract on Base instead:
- Both faucets work in Farcaster
- No platform limitation
- Seamless UX

**Pros:** ✅ Best UX
**Cons:** ❌ Requires redeploying contract to Base

---

## 💡 What We Chose

**Current implementation (Option 1):**

- Shows MON tab to everyone
- In Farcaster: Clear explanation + instructions
- Outside Farcaster: Works normally
- Users educated about the limitation

This is the best balance of:
- ✅ Transparency
- ✅ Functionality
- ✅ User education
- ✅ Both faucets available

---

## 📊 Platform Matrix

| Feature | In Farcaster | Outside Farcaster |
|---------|--------------|-------------------|
| **Base ETH** | ✅ Works | ❌ Disabled |
| **MON Tokens** | ❌ Not supported | ✅ Works |
| **Follow Check** | ✅ Works | ⚠️ No FID context |
| **Score Check** | ✅ Works | ⚠️ No FID context |
| **Network Switch** | ⚠️ Limited (3 chains) | ✅ All chains |

---

## 🔮 Future Possibilities

### If Farcaster Adds Monad Support

When/if Farcaster adds Monad Testnet:
1. Update manifest with `requiredChains`
2. Change MON logic back to `isAllowedPlatform === true`
3. Re-enable follow/score checks
4. Remove limitation notice

### If You Deploy MON on Base

If you deploy a MON faucet contract on Base:
1. Change network from Monad to Base
2. Works in Farcaster
3. Remove platform restriction
4. Keep all security checks

---

## 📝 User Documentation Needed

Consider adding to your app:

**FAQ Section:**
> **Q: Why can't I claim MON in Farcaster?**
> 
> A: Farcaster's embedded wallet only supports Base, Ethereum, and Arbitrum networks. Monad Testnet requires a regular wallet like MetaMask. Open our faucet in a regular browser with MetaMask to claim MON!

**Help Text:**
> To claim MON tokens, please use MetaMask, Coinbase Wallet, or Rainbow Wallet outside the Farcaster app.

---

## ✅ Summary

**The Limitation:**
- Farcaster wallet doesn't support Monad Testnet
- This is a Farcaster platform limitation
- Cannot be fixed without Farcaster adding Monad support

**Our Solution:**
- Clear blue info banner in Farcaster
- Explains the limitation
- Provides alternative (use MetaMask)
- Step-by-step instructions
- MON works perfectly outside Farcaster

**For Users:**
- Base ETH: Use Farcaster app ✓
- MON tokens: Use MetaMask/Coinbase ✓
- Both faucets fully functional ✓

---

**Changes pushed to main!** 🚀

The app now handles this limitation gracefully with clear user messaging.
