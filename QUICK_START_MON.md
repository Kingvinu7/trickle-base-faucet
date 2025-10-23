# 🚀 MON Faucet - Quick Start Guide

## ✅ Implementation Complete!

Your faucet now has **two claim options**: Base ETH and MON tokens!

---

## 🎯 What You Have Now

### 1. Base ETH Faucet (Existing)
- $0.03 ETH per claim
- 24-hour cooldown
- Base mainnet

### 2. MON Token Faucet (NEW!)
- 0.1 MON per claim
- 10 claims per day
- 1.0 MON daily maximum
- Monad Testnet
- **No cooldown** - claim all 10 at once if you want!

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Deploy Your Contract

Deploy the `MonadFaucet.sol` contract to **Monad Testnet**:

```bash
# Use Remix, Hardhat, or Foundry
# Constructor parameter: YOUR_WALLET_ADDRESS
```

Save the deployed contract address: `0x...`

### Step 2: Configure Environment

Add to your `.env` file:

```env
# Enable MON Faucet
NEXT_PUBLIC_MON_FAUCET_ENABLED=true

# Contract addresses
NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS=0xYourContractAddress
MON_FAUCET_CONTRACT_ADDRESS=0xYourContractAddress

# Private key (can use same as ETH faucet)
MON_FAUCET_OWNER_PRIVATE_KEY=your_private_key_here
```

### Step 3: Fund & Deploy

```bash
# 1. Send MON to your contract
# For 100 MON: Supports 1000 claims (100 / 0.1)

# 2. Deploy to production
vercel --prod
# or
npm run build && npm run start
```

---

## 📊 How Users See It

```
┌─────────────────────────────────┐
│   Choose Your Claim             │
├─────────────────────────────────┤
│                                 │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│  ┃  Claim Base ETH         ┃   │
│  ┃  $0.03 ETH • Once/24h   ┃   │
│  ┃  [Claim ETH Button]     ┃   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│                                 │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│  ┃  Claim MON Tokens       ┃   │
│  ┃  0.1 MON • 10x per day  ┃   │
│  ┃                         ┃   │
│  ┃  Claims: 3/10 ✓         ┃   │
│  ┃  MON: 0.3/1.0 ✓         ┃   │
│  ┃                         ┃   │
│  ┃  [Claim 0.1 MON]        ┃   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│                                 │
└─────────────────────────────────┘
```

---

## 🎨 UI Features

### Real-Time Stats
- **Claims counter:** Shows 3/10 (7 remaining)
- **MON balance:** Shows 0.3/1.0 (0.7 left)
- **Can claim indicator:** ✅ or ❌

### Visual Design
- **ETH card:** Blue gradient theme
- **MON card:** Purple/pink gradient theme
- Sparkle icons for MON ✨
- Animated progress bars
- Success/error toasts

---

## 🔧 Configuration

### To Enable/Disable MON Faucet

```env
NEXT_PUBLIC_MON_FAUCET_ENABLED=true   # Show MON faucet
NEXT_PUBLIC_MON_FAUCET_ENABLED=false  # Hide MON faucet
```

### To Adjust Claim Amounts (in contract)

```solidity
// As contract owner, call these functions:
setDripAmount(0.2 ether)    // Change to 0.2 MON per claim
setMaxClaimsPerDay(20)      // Allow 20 claims per day
setDailyLimit(2 ether)      // Allow 2 MON total per day
```

---

## 📝 Environment Variables Needed

```env
# MON Faucet (add these to your .env)
NEXT_PUBLIC_MON_FAUCET_ENABLED=true
NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS=0x...
MON_FAUCET_CONTRACT_ADDRESS=0x...
MON_FAUCET_OWNER_PRIVATE_KEY=...

# Existing (keep these)
NEXT_PUBLIC_FAUCET_CONTRACT_ADDRESS=0x...
FAUCET_CONTRACT_ADDRESS=0x...
FAUCET_OWNER_PRIVATE_KEY=...
NEYNAR_API_KEY=...
```

---

## 🧪 Test Checklist

Before going live:

- [ ] Deploy MON contract to Monad Testnet
- [ ] Fund contract with MON tokens
- [ ] Set all environment variables
- [ ] Test single MON claim
- [ ] Test multiple claims (2-3 in a row)
- [ ] Test all 10 claims at once
- [ ] Verify daily limit (1.0 MON max)
- [ ] Test next day reset
- [ ] Verify stats update correctly
- [ ] Check transaction confirmations
- [ ] Test on mobile (Farcaster app)

---

## 🎯 User Experience

### Claiming MON Tokens

1. **User connects wallet**
2. **Sees both faucet options**
3. **Clicks "Claim 0.1 MON"**
4. **Backend generates signature**
5. **User confirms transaction**
6. **Receives 0.1 MON instantly**
7. **Stats update: 1/10 claims, 0.1/1.0 MON**
8. **Can claim again immediately!**
9. **Repeat until 10 claims or 1.0 MON reached**
10. **Come back tomorrow for fresh claims**

### Daily Reset

- Happens automatically at **midnight UTC**
- Resets both claim counter and MON balance
- User gets fresh 10 claims and 1.0 MON limit

---

## 💡 Pro Tips

### For Users
- Claim all 10 at once for maximum speed
- Or spread claims throughout the day
- No cooldown between claims!
- Daily limit: 1.0 MON (enforced by contract)

### For You (Admin)
- Monitor contract balance
- Refill when needed
- Adjust limits based on usage
- Track metrics via contract events
- Can use same private key for both faucets

---

## 🚨 Common Issues

### "MON card not showing"
**Fix:** Set `NEXT_PUBLIC_MON_FAUCET_ENABLED=true`

### "Server configuration error"
**Fix:** Set both contract address env vars

### "Daily claim limit reached"
**This is normal!** User claimed 10 times already.

### "Daily MON limit reached"
**This is normal!** User claimed 1.0 MON already.

### Stats not updating
**Wait 2 seconds.** Auto-refreshes after transaction.

---

## 📚 Full Documentation

For complete technical details, see:
- **`MON_FAUCET_INTEGRATION.md`** - Full implementation guide
- **`.env.example`** - All environment variables
- **Contract:** Your `MonadFaucet.sol` file

---

## 🎉 You're Ready!

Your faucet now has:
- ✅ Dual token support (ETH + MON)
- ✅ Flexible claiming (10x per day for MON)
- ✅ Beautiful UI with real-time stats
- ✅ Same security as ETH faucet
- ✅ Production-ready code

### Next Actions:

1. **Deploy** MON contract → Get address
2. **Configure** `.env` → Add 3 variables
3. **Fund** contract → Send MON tokens
4. **Deploy** to Vercel → Go live!
5. **Test** → Verify everything works
6. **Monitor** → Check usage and refill as needed

---

**Questions?** Check `MON_FAUCET_INTEGRATION.md` for detailed troubleshooting!

**Ready to launch! 🚀**
