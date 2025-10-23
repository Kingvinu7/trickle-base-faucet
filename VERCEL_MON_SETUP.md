# ✅ Vercel MON Faucet Setup

## Your Deployed Contract

**MON Faucet Address:** `0xbDcf080097890804F0c7bed6ADf8b58b042a0D47`

---

## 🔧 Vercel Environment Variables

Make sure you have set these in your Vercel dashboard:

### Required Variables

```env
# Enable MON Faucet
NEXT_PUBLIC_MON_FAUCET_ENABLED=true

# MON Contract Address (use BOTH variables)
NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS=0xbDcf080097890804F0c7bed6ADf8b58b042a0D47
MON_FAUCET_CONTRACT_ADDRESS=0xbDcf080097890804F0c7bed6ADf8b58b042a0D47

# Owner Private Key (the wallet that deployed the contract)
MON_FAUCET_OWNER_PRIVATE_KEY=your_private_key_without_0x

# Optional: If using different key than Base ETH faucet
# Otherwise it will use FAUCET_OWNER_PRIVATE_KEY as fallback
```

---

## ✅ Verification Checklist

### 1. Check Vercel Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Verify these are set:
- [ ] `NEXT_PUBLIC_MON_FAUCET_ENABLED` = `true`
- [ ] `NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS` = `0xbDcf080097890804F0c7bed6ADf8b58b042a0D47`
- [ ] `MON_FAUCET_CONTRACT_ADDRESS` = `0xbDcf080097890804F0c7bed6ADf8b58b042a0D47`
- [ ] `MON_FAUCET_OWNER_PRIVATE_KEY` = `your_key` (or using fallback)

**Important:** After adding/changing env vars, you MUST redeploy!

### 2. Redeploy on Vercel

After setting env vars:
```bash
# Option 1: From Vercel Dashboard
Deployments → Click "Redeploy" on latest deployment

# Option 2: Push to trigger deploy
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

### 3. Fund the Contract

Send MON tokens to your contract:
```
To: 0xbDcf080097890804F0c7bed6ADf8b58b042a0D47
Amount: 100 MON (or more)
Network: Monad Testnet
```

**Why?** The contract needs MON balance to distribute to users.

### 4. Test the Deployment

1. **Open your site** (e.g., `your-app.vercel.app`)
2. **Select "Monad Testnet" tab**
3. **Connect wallet** in Farcaster
4. **Check requirements:**
   - ✅ Platform: Farcaster
   - ✅ Score: ≥ 0.5
   - ✅ Follow: @vinu07
5. **See stats:** Should show `0/10 claims`, `0.0/1.0 MON`
6. **Click "Claim 0.1 MON"**
7. **Confirm transaction**
8. **Success!** Stats update to `1/10`, `0.1/1.0`

---

## 🚨 Troubleshooting

### Issue: Stats showing "Contract stats unavailable"

**Causes:**
1. Env vars not set in Vercel
2. Forgot to redeploy after setting env vars
3. Wrong contract address
4. Wrong network (should be Monad Testnet)

**Fix:**
1. Check all env vars are set correctly
2. Redeploy from Vercel dashboard
3. Wait 1-2 minutes for deployment
4. Hard refresh browser (Ctrl+Shift+R)

### Issue: "Server configuration error"

**Cause:** Backend can't find `MON_FAUCET_CONTRACT_ADDRESS` or `MON_FAUCET_OWNER_PRIVATE_KEY`

**Fix:**
1. Set `MON_FAUCET_CONTRACT_ADDRESS` in Vercel
2. Set `MON_FAUCET_OWNER_PRIVATE_KEY` OR ensure `FAUCET_OWNER_PRIVATE_KEY` is set
3. Redeploy

### Issue: Transaction fails with "Insufficient funds"

**Cause:** Contract doesn't have MON tokens

**Fix:**
Send MON to: `0xbDcf080097890804F0c7bed6ADf8b58b042a0D47`

### Issue: Stats show but button still disabled

**Cause:** May be in cooldown or limit reached

**Check:**
- Wait until tomorrow (daily reset)
- Check remaining claims (should be > 0)
- Check browser console for errors

---

## 📊 Contract Details

### Your MON Faucet Contract

**Address:** `0xbDcf080097890804F0c7bed6ADf8b58b042a0D47`
**Network:** Monad Testnet
**Features:**
- 0.1 MON per claim
- 10 claims per day
- 1.0 MON daily limit
- Automatic daily reset

### Contract Functions

**User Functions:**
- `requestTokens(nonce, deadline, signature)` - Claim MON
- `getUserClaimInfo(address)` - Get claim stats
- `getRemainingClaims(address)` - Check remaining
- `getRemainingMON(address)` - Check MON left

**Owner Functions (you only):**
- `setDripAmount(amount)` - Change claim amount
- `setMaxClaimsPerDay(max)` - Change max claims
- `setDailyLimit(limit)` - Change daily limit
- `withdraw()` - Withdraw contract balance

---

## 🔑 Environment Variable Reference

### Complete .env for Local Development

```env
# MON Faucet
NEXT_PUBLIC_MON_FAUCET_ENABLED=true
NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS=0xbDcf080097890804F0c7bed6ADf8b58b042a0D47
MON_FAUCET_CONTRACT_ADDRESS=0xbDcf080097890804F0c7bed6ADf8b58b042a0D47
MON_FAUCET_OWNER_PRIVATE_KEY=your_private_key_here

# Base ETH Faucet (keep existing)
NEXT_PUBLIC_FAUCET_CONTRACT_ADDRESS=0x34bB7cb2c9b5fF03D824F0C80067E3eeB6C4401d
FAUCET_CONTRACT_ADDRESS=0x34bB7cb2c9b5fF03D824F0C80067E3eeB6C4401d
FAUCET_OWNER_PRIVATE_KEY=your_eth_private_key

# Other (keep existing)
NEXT_PUBLIC_PROJECT_ID=your_project_id
NEYNAR_API_KEY=your_neynar_key
NEXT_PUBLIC_FOLLOW_REQUIRED=true
NEXT_PUBLIC_SPAM_LABEL_REQUIRED=true
NEXT_PUBLIC_MINIAPP_STRICT_MODE=true
```

---

## 📝 Quick Commands

### Check Contract Balance (in browser console)
```javascript
// After connecting wallet
const provider = new ethers.BrowserProvider(window.ethereum);
const balance = await provider.getBalance('0xbDcf080097890804F0c7bed6ADf8b58b042a0D47');
console.log('Contract balance:', ethers.formatEther(balance), 'MON');
```

### Verify Environment Variables (check Network tab)
1. Open DevTools → Network
2. Refresh page
3. Look for API calls
4. Check if contract address appears in requests

---

## 🎯 Expected Behavior

### After Correct Setup:

1. **Monad Testnet tab visible** ✅
2. **Connect wallet** → See stats
3. **Stats show:** `0/10 claims, 0.0/1.0 MON` ✅
4. **Button enabled:** "Claim 0.1 MON" ✅
5. **Click claim** → Transaction popup
6. **Confirm** → Success toast
7. **Stats update:** `1/10 claims, 0.1/1.0 MON` ✅
8. **Can claim again** immediately (no cooldown)
9. **After 10 claims:** "Daily Limit Reached"
10. **Tomorrow:** Fresh 10 claims

---

## 💡 Pro Tips

1. **Test on testnet first** before mainnet
2. **Fund contract with extra MON** (buffer for testing)
3. **Monitor contract balance** regularly
4. **Check Vercel logs** for errors
5. **Use browser console** to debug
6. **Test all edge cases:**
   - New user (0 claims)
   - Mid-day user (5 claims)
   - Limit reached (10 claims)
   - Next day (reset)

---

## 📞 Support

If something's not working:

1. **Check Vercel logs:**
   ```
   Vercel Dashboard → Your Project → Deployments → Click deployment → View Function Logs
   ```

2. **Check browser console:**
   ```
   F12 → Console tab → Look for errors
   ```

3. **Verify contract:**
   - Is it deployed?
   - Does it have MON balance?
   - Is address correct?

4. **Verify env vars:**
   - All set in Vercel?
   - Redeployed after setting?
   - No typos?

---

## ✅ Final Checklist

Before claiming everything works:

- [ ] Contract deployed: `0xbDcf080097890804F0c7bed6ADf8b58b042a0D47`
- [ ] Contract funded with MON tokens
- [ ] All env vars set in Vercel
- [ ] Redeployed after setting env vars
- [ ] Monad tab visible on site
- [ ] Stats showing (0/10, 0.0/1.0)
- [ ] Button clickable
- [ ] Test claim successful
- [ ] Stats updated after claim
- [ ] Can claim multiple times
- [ ] Daily limit enforced

---

**Your MON faucet is ready!** 🚀

Contract: `0xbDcf080097890804F0c7bed6ADf8b58b042a0D47`
