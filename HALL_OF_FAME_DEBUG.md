# Hall of Fame Debugging Guide

## Issue: Claims Not Showing

If your claims aren't appearing in the Hall of Fame, follow these debug steps:

## Step 1: Verify You're Claiming from Farcaster

**IMPORTANT:** Hall of Fame only shows claims made from **within the Farcaster app** (Warpcast).

### Check in Browser Console:

When you claim, you should see:
```javascript
✅ "Miniapp detection result: true"  // MUST be true
✅ "Farcaster context: {user: {fid: 12345, username: 'yourname', displayName: 'Your Name'}}"
```

**If you see:**
```javascript
❌ "Miniapp detection result: false"
```
**→ You're claiming from a regular browser, not Farcaster app!**

### Solution:
1. Open **Warpcast app** (mobile or desktop)
2. Navigate to your faucet URL
3. Claim from within Warpcast
4. Check console again for `"Miniapp detection result: true"`

## Step 2: Check Vercel Function Logs

Go to: **Vercel Dashboard → Deployments → Latest → Functions**

### Look for `/api/log-claim` POST logs:

**What you should see:**
```
✅ CLAIM LOGGED TO DATABASE: {
  address: '0x...',
  txHash: '0x...',
  hasFarcasterData: true,  ← MUST BE TRUE
  farcasterUser: {
    fid: 12345,
    username: 'yourname',
    displayName: 'Your Name'
  },
  savedClaim: 'Success'
}
```

**If `hasFarcasterData: false`:**
- You claimed from browser, not Farcaster app
- Claim was saved but won't appear in Hall of Fame
- Solution: Claim again from Farcaster app

**If `savedClaim: 'Duplicate (already exists)'`:**
- This transaction was already logged
- Check if it's in the database (see Step 3)

## Step 3: Check Database Directly

Connect to your database and run:

```sql
-- Check all claims
SELECT 
  id,
  address,
  farcaster_fid,
  farcaster_username,
  farcaster_display_name,
  claim_timestamp
FROM claims
ORDER BY claim_timestamp DESC
LIMIT 10;

-- Check only Farcaster claims (what Hall of Fame shows)
SELECT 
  farcaster_fid as fid,
  farcaster_username as username,
  farcaster_display_name as display_name,
  claim_timestamp,
  tx_hash
FROM claims
WHERE farcaster_fid IS NOT NULL
ORDER BY claim_timestamp DESC;
```

**Expected Result:**
- You should see your claim with `farcaster_fid` filled in
- If `farcaster_fid` is NULL → claim was from browser

## Step 4: Check Hall of Fame Fetch

Look for `/api/log-claim` GET logs in Vercel:

```
✅ FETCHED 5 FARCASTER CLAIMS FROM DATABASE: [
  {fid: 12345, username: 'user1', timestamp: '2025-10-14...'},
  {fid: 67890, username: 'user2', timestamp: '2025-10-14...'},
  ...
]
```

**If it shows 0 claims:**
- Database connection issue
- No Farcaster claims in database yet
- Check database credentials

## Step 5: Force Refresh Hall of Fame

The Hall of Fame auto-refreshes every 30 seconds.

**Manual refresh:**
1. Open browser console
2. Run: `window.location.reload()`
3. Or wait 30 seconds

## Step 6: Test Database Connection

Test the API endpoint directly:

```bash
curl https://your-app.vercel.app/api/log-claim
```

**Expected response:**
```json
{
  "success": true,
  "claims": [
    {
      "address": "0x...",
      "txHash": "0x...",
      "timestamp": "2025-10-14T...",
      "farcasterUser": {
        "fid": 12345,
        "username": "yourname",
        "displayName": "Your Name"
      }
    }
  ]
}
```

**If you get an error:**
- Check DATABASE_URL is set in Vercel
- Verify database is accessible
- Check Vercel logs for error details

## Common Issues & Solutions

### Issue 1: "Miniapp detection result: false"

**Problem:** Accessing from regular browser

**Solution:**
1. Open Warpcast app
2. Navigate to your faucet
3. Claim from within Warpcast

### Issue 2: Claims in database but not showing

**Check:**
```sql
-- Verify farcaster_fid is not NULL
SELECT COUNT(*) FROM claims WHERE farcaster_fid IS NOT NULL;
```

If count is 0, all claims were from browser.

**Solution:** Claim from Farcaster app

### Issue 3: "Database initialization failed"

**Check:**
- DATABASE_URL environment variable
- Database credentials are correct
- Database is accessible (not IP restricted)
- SSL settings

**Verify connection:**
```bash
# Test from local machine
psql "YOUR_DATABASE_URL"
```

### Issue 4: Old claims not showing

**Reason:** Database was recreated with new schema

**Solution:** Make new claim from Farcaster app

## Test Checklist

Use this to verify everything:

- [ ] Open app in **Warpcast** (not Chrome/Safari)
- [ ] Connect wallet
- [ ] Click "Claim ETH"
- [ ] Check browser console:
  - [ ] `"Miniapp detection result: true"` ✅
  - [ ] Farcaster context shows user data ✅
- [ ] Check Vercel logs:
  - [ ] `"✅ CLAIM LOGGED TO DATABASE"` ✅
  - [ ] `hasFarcasterData: true` ✅
  - [ ] farcasterUser has fid, username, displayName ✅
- [ ] Wait 30 seconds
- [ ] Check Hall of Fame:
  - [ ] Your name appears ✅
  - [ ] Shows correct time ("just now", "2m ago") ✅

## Still Not Working?

### Get Debug Info:

1. **Browser Console Logs:**
   - Take screenshot of all console logs during claim
   - Look for "Miniapp detection result"
   - Look for "Farcaster context"

2. **Vercel Function Logs:**
   - Go to Vercel → Deployments → Functions
   - Find POST to `/api/log-claim`
   - Copy full log output

3. **Database Query Results:**
   ```sql
   SELECT * FROM claims 
   WHERE farcaster_fid IS NOT NULL 
   ORDER BY claim_timestamp DESC 
   LIMIT 5;
   ```

4. **API Response:**
   ```bash
   curl https://your-app.vercel.app/api/log-claim
   ```

### What to Check:

- Is `NEXT_PUBLIC_MINIAPP_STRICT_MODE` set to `true`?
  - If yes, you MUST claim from Farcaster
  - If no, you can claim from browser but won't show in Hall of Fame
  
- Is DATABASE_URL set correctly?
  - Check Vercel environment variables
  - Verify format: `postgresql://user:pass@host:port/db`

- Is the table created?
  - Check logs for "Created claims table"
  - Or query: `SELECT * FROM information_schema.tables WHERE table_name = 'claims';`

---

**Remember:** Hall of Fame ONLY shows claims from Farcaster app users!

If you claim from regular browser, the claim succeeds but won't appear in Hall of Fame.
