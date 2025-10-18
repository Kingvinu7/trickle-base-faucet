# 🚀 Signature-Based Faucet Deployment Checklist

Complete this checklist in order to deploy your secure signature-based faucet.

## ✅ Pre-Deployment Checklist

### 1. Deploy New Smart Contract

- [ ] Open Remix IDE: https://remix.ethereum.org/
- [ ] Create new file `Faucet.sol`
- [ ] Copy the contract code from reference (includes signature verification)
- [ ] Set compiler to 0.8.20+
- [ ] Enable optimization (200 runs)
- [ ] Connect MetaMask to **Base Mainnet**
- [ ] Deploy with your address as `initialOwner`
- [ ] **Save the contract address**: `0x___________________________`
- [ ] Fund the contract with ETH (e.g., 0.1 ETH)
- [ ] Verify on BaseScan (optional but recommended)

### 2. Configure Environment Variables in Vercel

Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

**Add these 3 variables:**

#### Variable 1: Contract Address (Frontend)
- **Name:** `NEXT_PUBLIC_FAUCET_CONTRACT_ADDRESS`
- **Value:** (paste your deployed contract address)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variable 2: Contract Address (Backend)
- **Name:** `FAUCET_CONTRACT_ADDRESS`
- **Value:** (paste your deployed contract address - same as above)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variable 3: Owner Private Key (⚠️ KEEP SECRET!)
- **Name:** `FAUCET_OWNER_PRIVATE_KEY`
- **Value:** (your private key WITHOUT `0x` prefix)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

**Getting Your Private Key:**
1. Open MetaMask
2. Click three dots → Account Details
3. Export Private Key
4. Enter password
5. Copy key (remove `0x` if present)

**Example:**
```
Good: abc123def456789...
Bad:  0xabc123def456789...
```

### 3. Redeploy Application

- [ ] After adding environment variables, click **Redeploy** in Vercel
- [ ] Wait for build to complete
- [ ] Check build logs for any errors

## ✅ Post-Deployment Testing

### Test 1: Signature Generation

Test the backend API:

```bash
curl -X POST https://your-domain.vercel.app/api/request-signature \
  -H "Content-Type: application/json" \
  -d '{"address":"YOUR_WALLET_ADDRESS"}'
```

**Expected Response:**
```json
{
  "success": true,
  "signature": "0x1234...",
  "nonce": "0xabcd...",
  "deadline": 1234567890,
  "message": "Signature generated successfully"
}
```

- [ ] API returns success
- [ ] Signature is present
- [ ] Nonce and deadline included

### Test 2: Frontend Claim

- [ ] Open your deployed app
- [ ] Connect wallet (use Farcaster if strict mode enabled)
- [ ] Click "Claim ETH"
- [ ] Check browser console for logs:
  - [ ] "Requesting authorization..."
  - [ ] "Signature received..."
  - [ ] "Transaction sent..."
- [ ] Transaction succeeds on blockchain
- [ ] ETH received in wallet

### Test 3: Security Verification

**Try to bypass the backend (should fail):**

1. Go to your contract on BaseScan
2. Navigate to "Write Contract"
3. Find `requestTokens` function
4. Try to call with any random values
5. **Expected:** Transaction fails with "Invalid signature"

- [ ] Direct contract call fails ✅
- [ ] Only authorized signatures work ✅

## ✅ Monitoring & Maintenance

### Check Logs

**Vercel Logs:**
- Go to: Vercel Dashboard → Deployments → Click latest deployment → Functions
- Check `/api/request-signature` logs
- Should see: "Signature generated for: {...}"

**Contract Events:**
- Monitor `NonceUsed` events on BaseScan
- Each successful claim emits this event

### Monitor Contract Balance

```bash
# Check contract balance regularly
# When low, send more ETH to contract address
```

- [ ] Set up balance alert (manual check weekly)
- [ ] Prepare refill strategy

## ⚠️ Troubleshooting

### Error: "Server configuration error"

**Cause:** Missing environment variables

**Fix:**
1. Verify all 3 environment variables are set in Vercel
2. Check no typos in variable names
3. Redeploy after adding

### Error: "Invalid signature"

**Cause:** Wrong private key or contract address mismatch

**Fix:**
1. Verify private key matches the contract owner address
2. Verify `FAUCET_CONTRACT_ADDRESS` matches deployed address
3. Ensure private key has NO `0x` prefix
4. Redeploy after fixing

### Error: "Signature expired"

**Cause:** Took too long between signature request and claim

**Fix:**
- This is expected behavior (5-minute timeout)
- User should try again
- Consider increasing deadline if needed (edit `/api/request-signature`)

### Error: "Nonce already used"

**Cause:** Trying to reuse an old signature

**Fix:**
- This is a security feature (working as intended)
- User should request a new signature
- Each claim needs a fresh signature

## 🔒 Security Best Practices

- [ ] ✅ Never commit private keys to git
- [ ] ✅ Keep `.env.local` in `.gitignore`
- [ ] ✅ Only share contract address publicly
- [ ] ✅ Monitor signature generation logs
- [ ] ✅ Set up rate limiting (optional)
- [ ] ✅ Add CAPTCHA (optional but recommended)
- [ ] ✅ Backup private key (encrypted storage)
- [ ] ✅ Use different wallet for other funds

## 📊 Success Metrics

After 24 hours, check:

- [ ] Claims working through frontend only
- [ ] Direct contract calls failing
- [ ] No unauthorized claims
- [ ] Signature generation logs show activity
- [ ] Hall of Fame updating with Farcaster users

## 🎯 Optional Enhancements

### Add CAPTCHA (Recommended for Public Launch)

See: `SIGNATURE_FAUCET_SETUP.md` → "Optional: Add CAPTCHA" section

- [ ] Get reCAPTCHA keys from Google
- [ ] Add keys to environment variables
- [ ] Uncomment CAPTCHA code in `/api/request-signature`
- [ ] Add reCAPTCHA to frontend

### Add IP Rate Limiting

Implement Redis or similar for IP tracking:

```typescript
// Pseudo-code
const attempts = await redis.get(`attempts:${ip}`)
if (attempts > 10) {
  return error("Too many requests")
}
```

- [ ] Set up Redis (Vercel KV or Upstash)
- [ ] Track requests per IP
- [ ] Limit to X requests per hour

## 📝 Documentation

Keep these docs handy:

- `SIGNATURE_FAUCET_SETUP.md` - Complete technical guide
- `DEPLOYMENT_CHECKLIST.md` - This checklist
- `HALL_OF_FAME_GUIDE.md` - Leaderboard feature docs

## ✅ Deployment Complete!

Once all items are checked:

- ✅ Contract deployed and funded
- ✅ Environment variables configured
- ✅ Application redeployed
- ✅ Tests passing
- ✅ Security verified
- ✅ Monitoring in place

**Your signature-based secure faucet is live!** 🎉

## 🆘 Need Help?

1. Check `SIGNATURE_FAUCET_SETUP.md` for detailed troubleshooting
2. Review Vercel function logs
3. Check browser console for errors
4. Verify all environment variables are set correctly

---

**Last Updated:** 2025-10-14
**Deployment Type:** Signature-Based Secure Faucet
**Security Level:** High ✅
