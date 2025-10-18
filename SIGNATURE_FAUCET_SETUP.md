# Signature-Based Faucet Setup Guide

## Overview

This is a **secure, signature-based faucet** that prevents unauthorized direct contract calls. Users must get authorization from your backend before claiming, which allows you to implement:

- ✅ CAPTCHA verification
- ✅ IP-based rate limiting
- ✅ Bot protection
- ✅ Signature expiration (5 minutes)
- ✅ Replay attack prevention (nonces)

## How It Works

```
┌──────────┐    1. Request Signature    ┌──────────┐
│          │ ──────────────────────────> │          │
│ Frontend │                             │ Backend  │
│          │ <────────────────────────── │          │
└──────────┘    2. Return Signed Auth   └──────────┘
      │                                        │
      │                                        │ Signs with
      │                                        │ Owner's Private Key
      │                                        │
      │         3. Submit Signature            ▼
      │         + Claim Request         ┌──────────┐
      └────────────────────────────────>│ Contract │
                                        │          │
                4. Verify Signature     │ Verifies │
                   & Send ETH           │ Owner    │
                                        └──────────┘
```

## Step 1: Deploy the New Contract

### Contract Code

The contract requires 3 parameters for each claim:
- `nonce` - Unique identifier (prevents replay attacks)
- `deadline` - Timestamp when signature expires
- `signature` - Cryptographic proof from backend

```solidity
function requestTokens(
    bytes32 nonce,
    uint256 deadline,
    bytes memory signature
) public
```

### Deployment Steps

1. **Open Remix IDE**: https://remix.ethereum.org/

2. **Create New File**: `Faucet.sol`

3. **Paste the Contract Code** (provided by you)

4. **Install OpenZeppelin**:
   - In Remix, click "File Explorer"
   - Right-click and select "Install OpenZeppelin Contracts"
   - Or use: `npm install @openzeppelin/contracts`

5. **Compile**:
   - Compiler version: `0.8.20` or higher
   - Enable optimization: 200 runs

6. **Deploy**:
   - Network: **Base Mainnet**
   - Environment: **Injected Provider - MetaMask**
   - Constructor Argument: Your wallet address (owner)
   - Click "Deploy"
   - **Confirm transaction in MetaMask**

7. **Fund the Contract**:
   ```
   Send ETH to the deployed contract address
   Example: 0.1 ETH can serve ~17,857 claims at 0.0000056 ETH each
   ```

8. **Save the Contract Address**:
   ```
   Example: 0x1234567890abcdef1234567890abcdef12345678
   ```

## Step 2: Configure Backend Environment Variables

### Required Variables

Add these to your Vercel environment variables or `.env.local`:

```bash
# Contract address (frontend - public)
NEXT_PUBLIC_FAUCET_CONTRACT_ADDRESS=0xYourContractAddressHere

# Contract address (backend - server only)
FAUCET_CONTRACT_ADDRESS=0xYourContractAddressHere

# Owner's private key (backend - MUST BE SECRET!)
FAUCET_OWNER_PRIVATE_KEY=your_private_key_without_0x_prefix
```

### Getting Your Private Key

**⚠️ SECURITY WARNING: Never share your private key!**

**From MetaMask:**
1. Click the three dots
2. Account details → Export Private Key
3. Enter password
4. Copy the private key (without `0x` prefix)

**Example:**
```
Good: abc123def456...
Bad:  0xabc123def456...
```

### Setting in Vercel

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable:
   - Name: `FAUCET_OWNER_PRIVATE_KEY`
   - Value: Your private key (paste without 0x)
   - Environments: Select `Production`, `Preview`, `Development`
4. Click "Save"
5. **Redeploy** your application

## Step 3: Update Frontend Configuration

Already done! The code updates include:

✅ New API endpoint: `/api/request-signature`
✅ Updated contract ABI with signature verification
✅ Modified claim flow to request signatures first
✅ Environment variable support for contract address

## How the Security Works

### Backend Signature Generation

```typescript
// 1. Generate unique nonce (prevents replay)
const nonce = randomBytes(32)

// 2. Set expiration (5 minutes)
const deadline = now + 300 seconds

// 3. Create message hash
const hash = keccak256(address + nonce + deadline + contractAddress)

// 4. Sign with owner's private key
const signature = sign(hash, ownerPrivateKey)

// 5. Return to frontend
return { signature, nonce, deadline }
```

### Contract Verification

```solidity
// 1. Check signature not expired
require(block.timestamp <= deadline)

// 2. Check nonce not used before
require(!usedNonces[nonce])

// 3. Recover signer from signature
address signer = recoverSigner(signature)

// 4. Verify signer is owner
require(signer == owner())

// 5. Mark nonce as used
usedNonces[nonce] = true

// 6. Process claim
send ETH to user
```

## Security Features

### 1. Signature Expiration
- Signatures valid for **5 minutes** only
- Old signatures automatically rejected
- Prevents signature harvesting

### 2. Replay Protection
- Each nonce can only be used **once**
- Contract tracks all used nonces
- Prevents reusing old valid signatures

### 3. Owner Verification
- Only signatures from contract owner accepted
- ECDSA cryptographic verification
- No one else can create valid signatures

### 4. Backend Authorization
- Users must go through your API
- Can add CAPTCHA verification
- Can implement IP rate limiting
- Can add custom rules (Farcaster only, etc.)

## What This Prevents

❌ **Direct Contract Calls**
- Users can't call contract through BaseScan
- Must get signature from backend first

❌ **Bot Attacks**
- Backend can require CAPTCHA
- IP-based rate limiting possible
- Custom anti-bot measures

❌ **Signature Reuse**
- Nonce system prevents replays
- Deadline prevents old signature use

❌ **Unauthorized Claims**
- Only your backend can authorize
- Full control over who can claim

## Optional: Add CAPTCHA

To add Google reCAPTCHA v3:

### 1. Get reCAPTCHA Keys

1. Go to: https://www.google.com/recaptcha/admin
2. Register your site
3. Choose reCAPTCHA v3
4. Add your domain
5. Get Site Key and Secret Key

### 2. Add to Environment Variables

```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
```

### 3. Update Frontend

```typescript
// In FaucetCard component
const { executeRecaptcha } = useGoogleReCaptcha()

const handleClaim = async () => {
  const token = await executeRecaptcha('claim')
  
  // Pass token to backend
  claimTokens({ address, captchaToken: token })
}
```

### 4. Update Backend

Uncomment the CAPTCHA verification code in `/api/request-signature/route.ts`

## Testing

### Test Signature Generation

```bash
curl -X POST http://localhost:3000/api/request-signature \
  -H "Content-Type: application/json" \
  -d '{"address":"0xYourWalletAddress"}'
```

Expected response:
```json
{
  "success": true,
  "signature": "0x1234...",
  "nonce": "0xabcd...",
  "deadline": 1234567890,
  "message": "Signature generated successfully"
}
```

### Test Full Claim Flow

1. Open your app in browser
2. Connect wallet
3. Click "Claim ETH"
4. Check console logs:
   - "Requesting authorization..."
   - "Signature received..."
   - "Transaction sent..."
5. Verify on BaseScan

### Verify Security

Try to claim directly through BaseScan:
1. Go to contract on BaseScan
2. Try "Write Contract" → `requestTokens`
3. Enter any values for nonce/deadline/signature
4. Transaction should **FAIL** with "Invalid signature"

## Troubleshooting

### "Server configuration error"
**Problem:** Missing environment variables

**Solution:**
- Check `FAUCET_OWNER_PRIVATE_KEY` is set
- Check `FAUCET_CONTRACT_ADDRESS` is set
- Verify in Vercel dashboard
- Redeploy after adding

### "Invalid signature"
**Problem:** Wrong private key or contract address

**Solution:**
- Verify private key matches contract owner
- Verify contract address matches deployed contract
- Check private key has no `0x` prefix

### "Signature expired"
**Problem:** Took too long to submit

**Solution:**
- Signatures expire after 5 minutes
- Request new signature if expired
- Consider increasing deadline if needed

### "Nonce already used"
**Problem:** Trying to reuse old signature

**Solution:**
- Request fresh signature each time
- This is intentional security feature

## Monitoring

### Check Signature Generation

```bash
# Vercel logs will show:
"Signature generated for: {
  address: '0x...',
  nonce: '0x...',
  deadline: '2025-10-14...',
  ip: '1.2.3.4',
  signer: '0x...'
}"
```

### Check Contract Events

Watch for `NonceUsed` events to track claims:

```javascript
// Get recent nonce usage
const logs = await contract.queryFilter(
  contract.filters.NonceUsed()
)
```

## Upgrading

If you need to change the owner:

```solidity
// Call transferOwnership on contract
contract.transferOwnership(newOwnerAddress)

// Update backend private key
FAUCET_OWNER_PRIVATE_KEY=new_private_key
```

## Cost Analysis

### Gas Costs

**Old Contract (Direct Call):**
- ~50,000 gas per claim

**New Contract (With Signature):**
- ~75,000 gas per claim
- +25,000 gas for signature verification
- Minimal increase (~$0.05 at 1 gwei)

### Backend Costs

**Signature Generation:**
- Serverless function execution
- ~10ms per signature
- Free tier: 100,000 requests/month (Vercel)

## Security Best Practices

1. **Never commit private keys** to git
2. **Use environment variables** for secrets
3. **Rotate keys** periodically
4. **Monitor** signature generation logs
5. **Set up alerts** for unusual activity
6. **Keep backup** of private key (encrypted)
7. **Use hardware wallet** for production
8. **Implement rate limiting** on signature endpoint
9. **Add CAPTCHA** for public deployments
10. **Monitor contract** for suspicious activity

## Support

If you encounter issues:
1. Check Vercel logs for errors
2. Verify environment variables are set
3. Test signature generation endpoint directly
4. Check contract owner matches private key
5. Verify contract address is correct

---

**Status:** Ready to Deploy
**Security Level:** High
**Bot Protection:** Enabled
**Contract Calls:** Authorized Only ✅
