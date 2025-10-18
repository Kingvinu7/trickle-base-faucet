# Database Migration for Hall of Fame

## What Changed

Migrated from **file-based storage** (doesn't work on Vercel) to **PostgreSQL database** for persistent claim storage.

## Why the Change?

**Problem:** File storage on Vercel serverless functions is read-only. Claims were not persisting.

**Solution:** Use your existing PostgreSQL database (DATABASE_URL already configured).

## Database Schema

The claims table will be created automatically on first API call:

```sql
CREATE TABLE claims (
  id SERIAL PRIMARY KEY,
  address VARCHAR(42) NOT NULL,
  tx_hash VARCHAR(66) NOT NULL UNIQUE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  farcaster_fid INTEGER,
  farcaster_username VARCHAR(255),
  farcaster_display_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_claims_timestamp ON claims(timestamp DESC);
CREATE INDEX idx_claims_farcaster_fid ON claims(farcaster_fid) WHERE farcaster_fid IS NOT NULL;
```

## Files Changed

1. **`src/lib/db.ts`** (NEW)
   - PostgreSQL connection pool
   - Database initialization
   - Save and fetch claim functions

2. **`src/app/api/log-claim/route.ts`**
   - Removed file-based storage
   - Now uses PostgreSQL
   - Auto-initializes schema on first request

## Environment Variable Required

Already configured! ✅

```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

## Testing After Deployment

### 1. Check Database Connection

The table will be created automatically on first API call. Check Vercel logs for:

```
✅ "Database initialized"
✅ "PostgreSQL connection pool created"
```

### 2. Manually Add Test Claim

To test the Hall of Fame, you can manually add a test claim via psql or your database admin:

```sql
INSERT INTO claims (
  address, 
  tx_hash, 
  farcaster_fid, 
  farcaster_username, 
  farcaster_display_name,
  timestamp
) VALUES (
  '0x1234567890123456789012345678901234567890',
  '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  12345,
  'testuser',
  'Test User',
  NOW()
);
```

### 3. Test API Endpoints

**Log a claim:**
```bash
curl -X POST https://your-app.vercel.app/api/log-claim \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890123456789012345678901234567890",
    "txHash": "0xtest123...",
    "farcasterUser": {
      "fid": 12345,
      "username": "testuser",
      "displayName": "Test User"
    }
  }'
```

**Get recent claims:**
```bash
curl https://your-app.vercel.app/api/log-claim
```

Expected response:
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
        "username": "testuser",
        "displayName": "Test User"
      }
    }
  ]
}
```

## Troubleshooting

### Hall of Fame Still Empty

**Check these:**

1. **Database Connection**
   - Look at Vercel function logs
   - Should see "Database initialized"
   - Check DATABASE_URL is set correctly

2. **Farcaster User Data**
   - User must claim from Farcaster app (not browser)
   - Check browser console for: `"Miniapp detection result: true"`
   - Should see Farcaster user object in logs

3. **Claims Being Logged**
   - Check Vercel logs for: `"Claim logged to database"`
   - Should show farcasterUser data if claimed from Farcaster

4. **Query the Database Directly**
   ```sql
   SELECT * FROM claims 
   WHERE farcaster_fid IS NOT NULL 
   ORDER BY timestamp DESC 
   LIMIT 10;
   ```

### "Database initialization failed"

**Possible causes:**
- DATABASE_URL not set
- Database connection refused
- SSL certificate issues

**Fix:**
1. Verify DATABASE_URL in Vercel environment variables
2. Check database is accessible (not IP restricted)
3. SSL is set to `rejectUnauthorized: false` (already configured)

### Claims Logged But Not Showing

**Check if Farcaster data is present:**

```sql
-- Check if claims have Farcaster data
SELECT 
  address,
  tx_hash,
  farcaster_fid,
  farcaster_username,
  timestamp
FROM claims
ORDER BY timestamp DESC
LIMIT 10;
```

If `farcaster_fid` is NULL, the user claimed from browser (not Farcaster app).

## Debug Claims from Browser Console

When a user claims, check browser console for these logs:

```javascript
// Should see Farcaster detection
"Miniapp detection result: true"  // ✅ If claiming from Farcaster
"Miniapp detection result: false" // ❌ If claiming from browser

// Should see Farcaster user context
"Farcaster context: {user: {fid: 12345, username: '...'}}"

// Should see claim being logged
"Claim logged to database: {
  address: '0x...',
  txHash: '0x...',
  farcasterUser: {fid: 12345, username: '...'}
}"
```

## Force Refresh Hall of Fame

The Hall of Fame auto-refreshes every 30 seconds. To force refresh:

1. Open browser console
2. Run: `window.location.reload()`

Or wait 30 seconds for automatic refresh.

## Migration Status

- ✅ Database schema created
- ✅ PostgreSQL connection pool configured
- ✅ API endpoints updated
- ✅ Auto-initialization on first request
- ✅ Indexes created for performance

## Next Steps

1. Deploy to Vercel (DATABASE_URL already configured)
2. Make a test claim from Farcaster app
3. Check Vercel logs for "Claim logged to database"
4. Wait 30 seconds and check Hall of Fame
5. If still empty, check database directly with SQL query above

---

**Migration Complete!** 🎉
**Status:** Ready to Deploy
