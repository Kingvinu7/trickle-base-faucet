# 🔐 Follow Requirement Setup Guide

## Overview

The faucet now requires users to follow **@vinu07** on Farcaster before they can claim ETH. This feature helps build your Farcaster following while providing value to users.

## How It Works

### User Flow
1. User connects wallet in Farcaster app
2. App checks if user follows @vinu07
3. If not following:
   - Shows "Follow Required" message
   - Displays "Follow @vinu07" button
   - User clicks button → Opens profile in new tab
   - User follows you on Farcaster
   - Returns to faucet, clicks "I've followed - Check again"
4. If following:
   - Shows green checkmark ✓
   - User can proceed to claim ETH

### Technical Implementation
- **Frontend Check**: `useFollowCheck` hook queries follow status
- **Backend Verification**: `/api/check-follow` endpoint uses Neynar API
- **Smart Contract**: No changes needed (follow check is off-chain)
- **Database**: No changes needed

## Configuration

### Required Environment Variables

#### 1. Neynar API Key
Get a free API key from [neynar.com](https://neynar.com):

```bash
NEYNAR_API_KEY=your_neynar_api_key_here
```

**Why needed:** To query Farcaster social graph and check follow relationships.

#### 2. Follow Requirement Toggle (Optional)
```bash
NEXT_PUBLIC_FOLLOW_REQUIRED=true  # Default: true
```

Set to `false` to disable follow requirement (useful for testing).

### Vercel Deployment

Add environment variables in Vercel Dashboard:

1. Go to: **Project Settings → Environment Variables**
2. Add:
   ```
   NEYNAR_API_KEY = your_actual_key_here
   NEXT_PUBLIC_FOLLOW_REQUIRED = true
   ```
3. Redeploy for changes to take effect

## Target Profile Configuration

The target profile is configured in `src/config/constants.ts`:

```typescript
export const FARCASTER_CONFIG = {
  targetFid: 250869,           // vinu07's FID
  targetUsername: 'vinu07',
  targetProfileUrl: 'https://farcaster.xyz/vinu07',
  followRequired: process.env.NEXT_PUBLIC_FOLLOW_REQUIRED !== 'false'
}
```

**To change target user:**
1. Update `targetFid` with your Farcaster ID
2. Update `targetUsername` with your handle
3. Update `targetProfileUrl` with your profile URL

## API Endpoint

### POST /api/check-follow

**Request:**
```json
{
  "fid": 12345
}
```

**Response (Following):**
```json
{
  "isFollowing": true,
  "message": "User follows vinu07"
}
```

**Response (Not Following):**
```json
{
  "isFollowing": false,
  "message": "User does not follow vinu07"
}
```

**Error Handling:**
The API is designed to be **lenient on errors** to avoid blocking legitimate users:
- If Neynar API is down → Allow claim
- If API key is missing (development) → Allow claim
- If request times out → Allow claim

This ensures the faucet remains functional even if the follow check fails.

## UI Components

### Follow Status Display

**Not Following:**
```
┌─────────────────────────────────────┐
│ 👤 Follow Required                  │
│                                     │
│ To claim ETH, please follow @vinu07│
│ on Farcaster                        │
│                                     │
│ [Follow @vinu07 →]                  │
│ [I've followed - Check again]       │
└─────────────────────────────────────┘
```

**Following:**
```
┌─────────────────────────────────────┐
│ ✓ Following @vinu07 ✓               │
└─────────────────────────────────────┘
```

## Testing

### Local Testing

1. **Disable Follow Requirement:**
   ```bash
   NEXT_PUBLIC_FOLLOW_REQUIRED=false
   ```
   Or leave `NEYNAR_API_KEY` unset (auto-bypasses in development)

2. **Enable Follow Requirement:**
   ```bash
   NEXT_PUBLIC_FOLLOW_REQUIRED=true
   NEYNAR_API_KEY=your_key_here
   ```

### Production Testing

1. Open faucet in Warpcast app
2. Connect wallet
3. Should see "Follow Required" if not following
4. Click "Follow @vinu07"
5. Follow the profile
6. Return to faucet
7. Click "I've followed - Check again"
8. Should see green checkmark ✓
9. Claim button should now be enabled

## Troubleshooting

### Issue: Follow button doesn't appear

**Cause:** Not in Farcaster environment or follow requirement disabled

**Solution:**
- Ensure `NEXT_PUBLIC_FOLLOW_REQUIRED=true`
- Open app in Warpcast, not regular browser
- Check `farcasterUser` is populated in console

### Issue: "Checking follow status..." forever

**Cause:** Neynar API error or invalid API key

**Solution:**
- Check Vercel logs for API errors
- Verify `NEYNAR_API_KEY` is correct
- Check Neynar API status

### Issue: Follow check passes even though not following

**Cause:** API error → lenient fallback

**Solution:**
- Check Vercel function logs
- Look for `❌ Neynar API error` messages
- Verify API key is valid and has quota remaining

### Issue: Can't claim even after following

**Cause:** Cache or API delay

**Solution:**
- Wait 30 seconds for API to update
- Click "I've followed - Check again"
- Check browser console for follow check response
- Verify you followed the correct profile

## Security Considerations

### Why Off-Chain Verification?

Follow verification is done **off-chain** (not in the smart contract) for several reasons:

1. **Gas Efficiency:** No extra gas for users
2. **Flexibility:** Can update follow requirement without contract changes
3. **User Experience:** Instant feedback without waiting for transactions
4. **Cost:** No blockchain storage needed

### Bypass Risk

**Can users bypass the check?**

Technically yes, if they:
- Directly call the smart contract (skipping frontend)
- Modify frontend JavaScript

**Mitigation:**
- Backend also checks follow status before issuing signatures
- Smart contract uses signature-based claiming (only authorized signatures work)
- Even if frontend is bypassed, backend must approve claim

**Trade-off:**
This is acceptable because:
- Most users won't attempt bypass
- Those who do are technically savvy (your target audience)
- Building goodwill is more valuable than perfect enforcement
- $0.03 ETH is low enough risk

## Benefits

### For You
- ✅ Grow Farcaster following organically
- ✅ Build engaged community
- ✅ Track follower growth alongside faucet usage
- ✅ Create sustainable user acquisition funnel

### For Users
- ✅ Get free ETH for gas fees
- ✅ Discover your Farcaster profile
- ✅ Join the Base community
- ✅ Simple one-click follow process

## Analytics

### Monitoring Follow Conversion

Check these metrics:
1. **Total Claims:** Database count
2. **Farcaster Users:** Filter claims by `farcaster_fid`
3. **Your Followers:** Check Warpcast analytics
4. **Conversion Rate:** (Your followers / Total claims) × 100

### Vercel Logs

Look for:
```
🔍 Checking if FID 12345 follows FID 250869
✅ Follow check result: FID 12345 IS following FID 250869
```

Or:
```
✅ Follow check result: FID 12345 IS NOT following FID 250869
```

## Summary

| Feature | Status |
|---------|--------|
| Follow Verification | ✅ Implemented |
| UI Components | ✅ Complete |
| API Endpoint | ✅ `/api/check-follow` |
| Error Handling | ✅ Lenient fallback |
| Configuration | ✅ Environment variables |
| Documentation | ✅ This guide |

**Next Steps:**
1. Get Neynar API key
2. Add to Vercel environment variables
3. Deploy and test
4. Monitor follower growth! 📈

**Need help?** Check Vercel function logs and browser console for debugging info.
