# MON Token Faucet Integration

## ✅ Implementation Complete

Your faucet now supports **two separate claim options**: Base ETH and MON testnet tokens!

---

## 🎯 Features

### Base ETH Faucet
- **Amount:** $0.03 worth of ETH
- **Cooldown:** 24 hours
- **Network:** Base mainnet
- **Claims:** 1 per day

### MON Token Faucet
- **Amount:** 0.1 MON per claim
- **Max Claims:** 10 per day
- **Daily Limit:** 1.0 MON total
- **Network:** Monad Testnet
- **Flexibility:** Claim all 10 at once or spread throughout the day

---

## 📂 Files Created/Modified

### New Files
1. **`src/app/api/request-mon-signature/route.ts`** - API endpoint for MON signatures
2. **`src/hooks/use-mon-stats.ts`** - Hook to fetch user's MON claim stats
3. **`src/hooks/use-mon-claim.ts`** - Hook to handle MON claiming
4. **`src/components/mon-faucet-card.tsx`** - MON faucet UI component
5. **`MON_FAUCET_INTEGRATION.md`** - This documentation

### Modified Files
1. **`src/config/constants.ts`** - Added MON contract ABI and configuration
2. **`src/app/page.tsx`** - Added MON faucet card to main page
3. **`.env.example`** - Added MON environment variables

---

## 🛠️ Setup Instructions

### 1. Deploy the MON Faucet Contract

Deploy your Solidity contract to **Monad Testnet**:

```solidity
// Your MonadFaucet.sol contract
// Constructor parameter: initialOwner (your address)
```

After deployment, note the contract address.

### 2. Configure Environment Variables

Add to your `.env` file:

```env
# Enable MON Faucet
NEXT_PUBLIC_MON_FAUCET_ENABLED=true

# MON Contract Address (use the same address for both)
NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS=0xYourMonContractAddress
MON_FAUCET_CONTRACT_ADDRESS=0xYourMonContractAddress

# Owner Private Key (can use same as ETH faucet or different)
MON_FAUCET_OWNER_PRIVATE_KEY=your_private_key_without_0x
```

### 3. Fund the Contract

Send MON tokens to your deployed contract:

```bash
# For 100 MON (supports 1000 claims of 0.1 MON each)
# Send to: 0xYourMonContractAddress
```

### 4. Deploy and Test

```bash
npm run build
npm run dev  # Test locally
# or deploy to Vercel/production
```

---

## 🔧 How It Works

### Smart Contract Features

Your MON faucet contract includes:

- **Daily Claim Tracking:** Resets automatically at midnight (UTC)
- **Multiple Claims:** Users can claim up to 10 times per day
- **Daily Limit:** Maximum 1.0 MON per user per day
- **No Cooldown:** Claim multiple times back-to-back
- **Signature Verification:** Same secure system as ETH faucet
- **Replay Protection:** Nonces prevent reuse of signatures

### User Flow

1. **User connects wallet** in Farcaster app
2. **Sees two faucet options:**
   - Base ETH (24h cooldown)
   - MON Tokens (10 claims/day)
3. **Checks MON stats:**
   - Claims made today (e.g., 3/10)
   - MON claimed today (e.g., 0.3/1.0)
   - Remaining claims and MON
4. **Clicks "Claim 0.1 MON"**
5. **Backend generates signature**
6. **User signs transaction**
7. **Receives 0.1 MON**
8. **Can claim again immediately** (up to daily limit)

---

## 📊 UI Components

### MON Faucet Card Features

**Stats Display:**
- Claims made today / Maximum claims
- MON claimed today / Daily limit
- Remaining claims and MON

**Visual Design:**
- Purple/pink gradient theme (distinct from ETH blue)
- Real-time stat updates
- Progress tracking
- Clear status messages

**States:**
- ✅ **Ready to claim:** Shows claim button
- ⏳ **Loading:** Checking stats...
- 🎉 **Claiming:** Processing transaction
- ❌ **Limit reached:** Daily limit message
- ⚠️ **Not connected:** Connect wallet prompt

---

## 🔐 Security Features

Same security model as ETH faucet:

1. **Signature-based authorization**
2. **Nonce system** (prevents replay attacks)
3. **Deadline enforcement** (5-minute expiry)
4. **Platform restriction** (Farcaster only)
5. **Follow requirement** (optional)
6. **Neynar score check** (optional)
7. **Contract-level validation**

---

## ⚙️ Configuration Options

### Adjust Claim Amount

In contract (requires owner):
```solidity
setDripAmount(0.2 ether) // Change to 0.2 MON per claim
```

### Adjust Max Claims Per Day

In contract (requires owner):
```solidity
setMaxClaimsPerDay(20) // Allow 20 claims per day
```

### Adjust Daily Limit

In contract (requires owner):
```solidity
setDailyLimit(2 ether) // Allow 2 MON total per day
```

### Enable/Disable MON Faucet

In `.env`:
```env
NEXT_PUBLIC_MON_FAUCET_ENABLED=false  # Hide MON faucet
```

---

## 📊 Contract Functions Used

### Read Functions

**`getUserClaimInfo(address user)`**
Returns:
- `claimsMadeToday` - Number of claims today
- `remainingClaims` - Claims left for today
- `monClaimedToday` - Total MON claimed today
- `remainingMON` - MON left to claim today
- `canClaimNow` - Boolean if user can claim now

**`getRemainingClaims(address user)`**
Returns: Number of claims remaining for today

**`getRemainingMON(address user)`**
Returns: Amount of MON remaining for today

**`getCurrentDay()`**
Returns: Current day number (for tracking)

### Write Functions

**`requestTokens(bytes32 nonce, uint256 deadline, bytes signature)`**
Claims MON tokens with signature verification

---

## 🎨 Customization

### Change Colors

Edit `src/components/mon-faucet-card.tsx`:

```typescript
// Current: purple/pink theme
className="bg-gradient-to-r from-purple-600 to-pink-600"

// Change to: blue/cyan theme
className="bg-gradient-to-r from-blue-600 to-cyan-600"
```

### Change MON Config

Edit `src/config/constants.ts`:

```typescript
export const MON_CONFIG = {
  name: 'MON Token Faucet',
  description: 'Get MON testnet tokens on Monad',
  claimAmount: '0.1',        // Change display amount
  maxClaimsPerDay: 10,       // Update if contract changes
  dailyLimit: '1.0',         // Update if contract changes
  enabled: process.env.NEXT_PUBLIC_MON_FAUCET_ENABLED === 'true',
  network: 'Monad Testnet'   // Change network name
}
```

---

## 🧪 Testing Checklist

Before going live, test:

### Contract Tests
- [ ] Deploy contract successfully
- [ ] Fund contract with MON
- [ ] Verify owner address
- [ ] Test single claim
- [ ] Test multiple claims (2-3 in a row)
- [ ] Test all 10 claims
- [ ] Verify daily limit (1.0 MON max)
- [ ] Test next day reset

### Frontend Tests
- [ ] MON card appears when enabled
- [ ] MON card hidden when disabled
- [ ] Stats display correctly
- [ ] Claims counter updates
- [ ] MON balance updates
- [ ] Daily limit message shows
- [ ] Transaction success toast
- [ ] Error handling works

### Integration Tests
- [ ] Signature generation works
- [ ] Contract accepts signatures
- [ ] Nonce prevents replay
- [ ] Deadline expires correctly
- [ ] Platform restriction works
- [ ] Follow check works (if enabled)
- [ ] Score check works (if enabled)

---

## 📈 Monitoring

### Contract Events

Monitor these events on-chain:

**`FundsDripped`**
```solidity
event FundsDripped(
    address indexed recipient,
    uint256 amount,
    uint256 claimNumber,
    uint256 totalClaimedToday
)
```

**`DailyLimitReset`**
```solidity
event DailyLimitReset(
    address indexed user,
    uint256 newDay
)
```

**`NonceUsed`**
```solidity
event NonceUsed(
    bytes32 indexed nonce
)
```

### Metrics to Track

- Total MON claimed per day
- Average claims per user
- Peak claiming times
- Contract balance over time
- Failed transaction rate
- Most active users

---

## 🚨 Troubleshooting

### Issue: MON card not showing

**Solution:**
```env
# Make sure this is set to true
NEXT_PUBLIC_MON_FAUCET_ENABLED=true
```

### Issue: "Server configuration error"

**Solution:**
Check that both env vars are set:
```env
MON_FAUCET_CONTRACT_ADDRESS=0x...
MON_FAUCET_OWNER_PRIVATE_KEY=...
```

### Issue: Transaction fails with "Daily claim limit reached"

**Explanation:** User has already made 10 claims today. This is normal behavior.

**Solution:** Tell user to wait until tomorrow (resets at midnight UTC).

### Issue: Transaction fails with "Daily MON limit reached"

**Explanation:** User has claimed 1.0 MON today already.

**Solution:** Tell user to wait until tomorrow.

### Issue: Stats not updating after claim

**Solution:** Stats refetch automatically after 2 seconds. If still not updating:
1. Check contract address is correct
2. Verify transaction was confirmed
3. Check browser console for errors

---

## 🔄 Differences from ETH Faucet

| Feature | ETH Faucet | MON Faucet |
|---------|------------|------------|
| **Amount** | 0.03 ETH | 0.1 MON |
| **Frequency** | Once per 24h | 10 times per day |
| **Cooldown** | 24 hours | None (within daily limit) |
| **Daily Limit** | N/A | 1.0 MON total |
| **Network** | Base mainnet | Monad Testnet |
| **Color Theme** | Blue | Purple/Pink |
| **Stats Tracking** | Last claim time | Claims count + MON amount |

---

## 📚 Additional Resources

### Smart Contract
- Contract source: See your Solidity file
- OpenZeppelin docs: https://docs.openzeppelin.com/
- Signature verification: ECDSA library

### Frontend
- Wagmi hooks: https://wagmi.sh/
- React Query: https://tanstack.com/query/
- Framer Motion: https://www.framer.com/motion/

### Deployment
- Monad Testnet: https://docs.monad.xyz/
- Vercel deployment: https://vercel.com/docs

---

## 🎉 You're All Set!

Your faucet now supports both Base ETH and MON testnet tokens with a beautiful, user-friendly interface.

### Next Steps

1. **Deploy** your MON contract to Monad Testnet
2. **Configure** environment variables
3. **Fund** the contract with MON tokens
4. **Test** thoroughly on testnet
5. **Deploy** to production
6. **Monitor** usage and adjust limits as needed

### Support

If you encounter any issues, check:
- Contract deployment logs
- Backend API logs
- Browser console errors
- Network connectivity

---

**Happy Claiming! 🚀**
