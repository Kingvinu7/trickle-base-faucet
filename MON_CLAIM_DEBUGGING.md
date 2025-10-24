# 🔍 MON Claim Debugging Guide

## 🐛 Issue: Transaction Not Going Through

**Symptoms:**
- Click "Claim 0.1 MON"
- Shows "claiming..."
- Then fails with generic error
- Transaction never actually sent

---

## 🔧 New Debugging Features

I've added comprehensive logging to help identify the exact failure point.

### Check Browser Console (F12)

**After clicking "Claim MON", you'll see:**

#### 1. Signature Request
```javascript
🔍 MON signature received: {
  signature: "0x1234...",
  nonce: "0xabcd...",
  deadline: 1730123456,
  deadlineDate: "2024-10-28T12:00:00.000Z",
  timeUntilDeadline: "1800 seconds",
  fullResponse: {success: true, signature: "...", ...}
}
```

**✅ If you see this:** Signature generation works!
**❌ If you don't:** Backend signature API failing

#### 2. Contract Call Attempt
```javascript
🚀 Calling MON contract requestTokens with: {
  contract: "0xbDcf080097890804F0c7bed6ADf8b58b042a0D47",
  functionName: "requestTokens",
  nonce: "0xabcd...",
  nonceType: "string",
  deadline: 1730123456,
  deadlineType: "number",
  deadlineBigInt: "1730123456",
  signature: "0x1234...",
  signatureLength: 132,
  address: "0x..."
}
```

**✅ If you see this:** Frontend is calling contract correctly
**❌ If you don't:** Something failed before contract call

#### 3. Error (if it fails)
```javascript
❌ MON transaction FAILED: {error details}
Full error object: {...}
Error details: {
  message: "...",
  name: "...",
  stack: "..."
}
```

**This shows the EXACT error from wagmi/contract!**

---

## 🎯 Common Issues & Solutions

### Issue 1: Contract Address Not Set

**Console shows:**
```
MON_FAUCET_CONTRACT.address is not configured!
```

**Solution:**
Set in Vercel environment variables:
```
NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS=0xbDcf080097890804F0c7bed6ADf8b58b042a0D47
```

### Issue 2: Invalid Signature

**Console shows:**
```
Invalid signature
```

**Possible causes:**
1. **Wrong private key** - `MON_FAUCET_OWNER_PRIVATE_KEY` doesn't match contract owner
2. **Wrong contract address** - Signature includes contract address in hash
3. **Message hash mismatch** - Backend and contract calculating differently

**Check:**
```bash
# In Vercel env vars:
MON_FAUCET_OWNER_PRIVATE_KEY=0x... # Must be contract OWNER's key
MON_FAUCET_CONTRACT_ADDRESS=0xbDcf080097890804F0c7bed6ADf8b58b042a0D47
```

**Verify owner:**
```javascript
// Get contract owner address
const owner = await contract.owner()
console.log('Contract owner:', owner)

// Get signer address from private key
const wallet = new ethers.Wallet(process.env.MON_FAUCET_OWNER_PRIVATE_KEY)
console.log('Signer address:', wallet.address)

// These MUST match!
```

### Issue 3: Deadline Expired

**Console shows:**
```
Signature expired / deadline
```

**Solution:**
- Already increased to 30 minutes
- Check system clock sync
- Might be timezone issue

### Issue 4: Already Claimed

**Console shows:**
```
Already claimed / cooldown
```

**Solution:**
- User hit daily limit (10 claims)
- Wait for next day
- Check contract: `getUserClaimInfo(address)`

### Issue 5: Insufficient Gas

**Console shows:**
```
Insufficient funds for gas
```

**Solution:**
- User needs MON for gas on Monad Testnet
- Need to fund wallet first
- Catch-22: Need MON to claim MON!

### Issue 6: Contract Out of Funds

**Console shows:**
```
Transfer amount exceeds balance / insufficient balance
```

**Solution:**
Fund the contract:
```javascript
// Send MON to contract address
// Contract needs MON to distribute!
```

---

## 📊 Debugging Checklist

### Step 1: Verify Environment Variables

**In Vercel:**
```
✓ NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS set?
✓ MON_FAUCET_OWNER_PRIVATE_KEY set?
✓ MON_FAUCET_CONTRACT_ADDRESS set? (backend)
```

### Step 2: Verify Contract Deployment

**On Monad Explorer:**
1. Go to: https://explorer.monad.xyz/address/0xbDcf080097890804F0c7bed6ADf8b58b042a0D47
2. Check:
   - ✓ Contract exists?
   - ✓ Has MON balance?
   - ✓ Owner address correct?

### Step 3: Verify Signature Generation

**Check API endpoint:**
```bash
curl -X POST https://your-app.vercel.app/api/request-mon-signature \
  -H "Content-Type: application/json" \
  -d '{"address":"0xYourAddress"}'
```

**Expected response:**
```json
{
  "success": true,
  "signature": "0x...",
  "nonce": "0x...",
  "deadline": 1730123456
}
```

### Step 4: Test Contract Directly

**Using ethers.js:**
```javascript
const contract = new ethers.Contract(
  "0xbDcf080097890804F0c7bed6ADf8b58b042a0D47",
  MON_FAUCET_ABI,
  signer
)

// Check user stats
const info = await contract.getUserClaimInfo("0xYourAddress")
console.log('Can claim?', info.canClaimNow)
console.log('Remaining claims:', info.remainingClaims.toString())

// Try claiming
const tx = await contract.requestTokens(nonce, deadline, signature)
await tx.wait()
```

---

## 🔍 What to Share for Help

If it still doesn't work, share:

1. **Browser console logs** (F12 → Console tab)
   - Look for 🔍, 🚀, ❌ emoji logs
   - Copy the full error object

2. **Environment variables** (redacted)
   ```
   NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS: 0xbDc... (first 6 chars)
   MON_FAUCET_OWNER_PRIVATE_KEY: Set? Yes/No
   ```

3. **Contract address on Monad Explorer**
   - Link to explorer
   - Does it have balance?
   - What's the owner address?

4. **Full error message**
   - From console logs
   - From toast notification
   - From network tab (F12 → Network)

---

## 🎯 Expected Flow (When Working)

```
1. User clicks "Claim 0.1 MON"
   ↓
2. Frontend calls /api/request-mon-signature
   Console: 🔍 MON signature received
   ↓
3. Frontend calls contract.requestTokens()
   Console: 🚀 Calling MON contract requestTokens
   ↓
4. Wallet prompts user to sign
   ↓
5. User signs
   ↓
6. Transaction sent to Monad
   Console: Transaction sent: 0x...
   Toast: "Transaction Submitted!"
   ↓
7. Success!
```

---

## 💡 Most Likely Issue

Based on "transaction not going through", it's probably:

**#1: Wrong private key**
- `MON_FAUCET_OWNER_PRIVATE_KEY` doesn't match contract owner
- Signature validation fails at contract level
- Error: "Invalid signature"

**#2: Contract address not set**
- `NEXT_PUBLIC_MON_FAUCET_CONTRACT_ADDRESS` empty
- Frontend can't find contract
- Error: "Contract address not configured"

**#3: Contract not funded**
- Contract has no MON to distribute
- Transfer fails
- Error: "Insufficient balance"

---

## ✅ After Vercel Redeploys

1. Open browser console (F12)
2. Try claiming MON
3. Look for the 🔍 🚀 ❌ logs
4. Share the logs if it fails!

**The console will tell us exactly what's wrong!** 🎯
