# Vercel Environment Variables Setup

## Your Contract Address
```
0x34bB7cb2c9b5fF03D824F0C80067E3eeB6C4401d
```

## Quick Setup Guide

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these 3 variables:

---

### Variable 1: Frontend Contract Address

**Name:**
```
NEXT_PUBLIC_FAUCET_CONTRACT_ADDRESS
```

**Value:**
```
0x34bB7cb2c9b5fF03D824F0C80067E3eeB6C4401d
```

**Environments:** 
- ✅ Production
- ✅ Preview  
- ✅ Development

---

### Variable 2: Backend Contract Address

**Name:**
```
FAUCET_CONTRACT_ADDRESS
```

**Value:**
```
0x34bB7cb2c9b5fF03D824F0C80067E3eeB6C4401d
```

**Environments:**
- ✅ Production
- ✅ Preview
- ✅ Development

---

### Variable 3: Owner Private Key (⚠️ KEEP SECRET!)

**Name:**
```
FAUCET_OWNER_PRIVATE_KEY
```

**Value:**
```
[YOUR_PRIVATE_KEY_WITHOUT_0x_PREFIX]
```

**Environments:**
- ✅ Production
- ✅ Preview
- ✅ Development

**⚠️ SECURITY WARNING:**
- Never share this private key
- Never commit it to git
- This should be the private key of the wallet that deployed the contract

**How to get your private key:**
1. Open MetaMask
2. Click the three dots (⋮)
3. Account Details
4. Export Private Key
5. Enter your password
6. Copy the key
7. **Remove the `0x` prefix if present**

**Example format:**
```
Good: abc123def456789012345678901234567890123456789012345678901234
Bad:  0xabc123def456789012345678901234567890123456789012345678901234
```

---

## After Adding Variables

1. Click **Save** for each variable
2. Go to **Deployments** tab
3. Click on latest deployment
4. Click **⋯ (three dots)** → **Redeploy**
5. Wait for deployment to complete

## Verify Setup

After redeployment, test the signature endpoint:

```bash
curl -X POST https://your-app.vercel.app/api/request-signature \
  -H "Content-Type: application/json" \
  -d '{"address":"0xYourWalletAddress"}'
```

**Expected Response:**
```json
{
  "success": true,
  "signature": "0x...",
  "nonce": "0x...",
  "deadline": 1234567890,
  "message": "Signature generated successfully"
}
```

## Contract Details

**Contract Address:** `0x34bB7cb2c9b5fF03D824F0C80067E3eeB6C4401d`

**Network:** Base Mainnet

**View on BaseScan:**
https://basescan.org/address/0x34bB7cb2c9b5fF03D824F0C80067E3eeB6C4401d

**Verify Contract (Optional but Recommended):**
1. Go to contract on BaseScan
2. Click "Contract" tab
3. Click "Verify and Publish"
4. Upload source code
5. Set compiler to 0.8.20
6. Enable optimization: 200 runs

## Troubleshooting

### "Server configuration error"
- ✅ Check all 3 variables are added
- ✅ Check for typos in variable names
- ✅ Redeploy after adding

### "Invalid signature"
- ✅ Verify private key matches contract owner
- ✅ Verify private key has NO `0x` prefix
- ✅ Check contract address is correct

### "Environment variable not found"
- ✅ Make sure you selected all 3 environments (Production, Preview, Development)
- ✅ Redeploy after adding variables

## Security Checklist

- [ ] ✅ Private key added to Vercel only
- [ ] ✅ Private key NOT in any code files
- [ ] ✅ Private key NOT in git repository
- [ ] ✅ `.env.local` in `.gitignore`
- [ ] ✅ Only contract address is public
- [ ] ✅ Backup of private key stored securely (encrypted)

---

**Contract Address:** `0x34bB7cb2c9b5fF03D824F0C80067E3eeB6C4401d`  
**Ready to deploy!** ✅
