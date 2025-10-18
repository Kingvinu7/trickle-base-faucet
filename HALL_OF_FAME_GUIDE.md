# Hall of Fame Leaderboard Feature 🏆

## Overview

The Hall of Fame is a real-time leaderboard that displays recent claimers from Farcaster, showing their display names and how long ago they claimed.

## Features

### ✅ What's Included

1. **Farcaster User Display**
   - Shows Farcaster display name (e.g., "Tc", "Alice")
   - Shows username (e.g., "@tc", "@alice")
   - Shows Farcaster FID (Farcaster ID)

2. **Real-Time Updates**
   - Automatically refreshes every 30 seconds
   - Shows latest 20 claims from Farcaster users
   - Animated entries with smooth transitions

3. **Relative Timestamps**
   - "2m ago" for 2 minutes ago
   - "1 hr ago" for 1 hour ago
   - "3 days ago" for longer periods
   - Powered by `date-fns` library

4. **Ranked Display**
   - 🥇 Gold medal for #1
   - 🥈 Silver medal for #2
   - 🥉 Bronze medal for #3
   - Numbered badges for others

5. **Transaction Links**
   - Each claim links to Basescan
   - View transaction details on blockchain

6. **Responsive Design**
   - Scrollable list (max height: 96px)
   - Works on mobile and desktop
   - Beautiful gradient backgrounds

## How It Works

### Data Flow

```
1. User Claims → Faucet Contract
2. Frontend calls useFaucetClaim hook
3. Hook logs claim with Farcaster user data → /api/log-claim
4. API stores claim in memory + data/claims.json
5. Hall of Fame polls /api/log-claim every 30s
6. Displays recent claims with user info
```

### Farcaster User Data

When a user claims from within Farcaster miniapp, we collect:

```typescript
{
  fid: 12345,              // Farcaster ID
  username: "tc",          // Farcaster username
  displayName: "Tc"        // Display name shown in app
}
```

This data comes from the `@farcaster/miniapp-sdk` context API.

### Storage

**In-Memory Cache:**
- Fast access for API requests
- Stores last 100 claims
- Resets on server restart

**File Persistence:**
- Saved to `data/claims.json`
- Loads on server start
- No database needed!

**Example `data/claims.json`:**
```json
[
  {
    "address": "0x1234...",
    "txHash": "0xabcd...",
    "timestamp": "2025-10-14T12:30:00.000Z",
    "farcasterUser": {
      "fid": 12345,
      "username": "tc",
      "displayName": "Tc"
    }
  }
]
```

## Component Structure

### HallOfFame Component

Located at: `src/components/hall-of-fame.tsx`

**Key Features:**
- Fetches claims from `/api/log-claim` GET endpoint
- Auto-refreshes every 30 seconds
- Shows loading state on initial load
- Empty state if no claims yet
- Animated list with framer-motion

**States:**
- Loading: Shows spinner
- Empty: "No claims yet. Be the first!"
- Populated: Shows ranked list

### API Endpoints

#### POST /api/log-claim
Logs a new claim with Farcaster user data.

**Request:**
```json
{
  "address": "0x1234...",
  "txHash": "0xabcd...",
  "farcasterUser": {
    "fid": 12345,
    "username": "tc",
    "displayName": "Tc"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Claim logged successfully"
}
```

#### GET /api/log-claim
Fetches recent claims.

**Response:**
```json
{
  "success": true,
  "claims": [
    {
      "address": "0x1234...",
      "txHash": "0xabcd...",
      "timestamp": "2025-10-14T12:30:00.000Z",
      "farcasterUser": {
        "fid": 12345,
        "username": "tc",
        "displayName": "Tc"
      }
    }
  ]
}
```

## User Experience

### When User Claims

1. User connects wallet in Farcaster miniapp
2. User clicks "Claim ETH"
3. Transaction sent to blockchain
4. Upon success:
   - Transaction hash captured
   - Farcaster user data fetched from SDK
   - Claim logged to API with user info
5. Within 30 seconds, user appears on Hall of Fame
6. Other users see the new claim

### Hall of Fame Display

```
┌──────────────────────────────────────┐
│     🏆 Hall of Fame 🏆               │
├──────────────────────────────────────┤
│ 🥇  Tc                    2m ago     │
│     @tc                              │
│     0xabcd...1234                    │
├──────────────────────────────────────┤
│ 🥈  Alice                 5m ago     │
│     @alice                           │
│     0xefgh...5678                    │
├──────────────────────────────────────┤
│ 🥉  Bob                   10m ago    │
│     @bob                             │
│     0xijkl...9012                    │
└──────────────────────────────────────┘
```

## Configuration

### Environment Variables

No new environment variables needed! The feature works out of the box.

### Customization

**Refresh Interval:**
```typescript
// In src/components/hall-of-fame.tsx
const interval = setInterval(fetchClaims, 30000) // 30 seconds
```

**Max Claims Displayed:**
```typescript
// In src/app/api/log-claim/route.ts
const farcasterClaims = recentClaims
  .filter(claim => claim.farcasterUser)
  .slice(0, 20) // Show last 20
```

**Total Claims Stored:**
```typescript
// In src/app/api/log-claim/route.ts
recentClaims.unshift(claim)
recentClaims = recentClaims.slice(0, 100) // Keep last 100
```

## Deployment Notes

### Production Setup

1. **Data Directory**
   - `data/` folder is gitignored
   - Created automatically on first claim
   - Ensure write permissions on server

2. **File Persistence**
   - Claims saved to `data/claims.json`
   - Survives deployments if volume mounted
   - For Vercel: Data resets between deploys (expected)

3. **Vercel Considerations**
   - Vercel uses serverless functions
   - In-memory data resets on cold starts
   - For persistent storage, consider:
     - Vercel KV (Redis)
     - Supabase
     - MongoDB Atlas
     - PostgreSQL

### Upgrading to Database

To use a real database instead of file storage:

1. Install database client (e.g., Prisma)
2. Update `src/app/api/log-claim/route.ts`:
   - Replace file I/O with database queries
   - Store claims in database table
3. Add database connection string to `.env`

## Troubleshooting

### Claims Not Showing

**Issue:** Hall of Fame is empty or not updating

**Solutions:**
1. Check browser console for errors
2. Verify API is accessible: `GET /api/log-claim`
3. Check if claims have `farcasterUser` data
4. Ensure user claimed from Farcaster miniapp
5. Wait 30 seconds for next refresh

### Farcaster User Data Missing

**Issue:** Claims show but no usernames

**Solutions:**
1. Verify user claimed from Farcaster app (not browser)
2. Check console logs for Farcaster context
3. Ensure `NEXT_PUBLIC_MINIAPP_STRICT_MODE` is set correctly
4. Test Farcaster SDK initialization

### Timestamps Not Updating

**Issue:** Times show "NaN ago" or incorrect

**Solutions:**
1. Check `date-fns` is installed
2. Verify timestamp format is ISO 8601
3. Clear browser cache and refresh

### Data Lost on Deploy

**Issue:** Claims disappear after redeployment

**Expected behavior on Vercel:**
- File-based storage resets
- This is normal for serverless
- Consider using database for persistence

## Future Enhancements

### Possible Improvements

1. **User Avatars**
   - Fetch from Farcaster profile
   - Use Neynar API to get profile pics
   - Display next to usernames

2. **Stats**
   - Total claims per user
   - Leaderboard by frequency
   - "Hall of Champions" for most claims

3. **Filters**
   - Last hour / day / week / month
   - Search by username
   - Sort by different criteria

4. **Animations**
   - Confetti on new claim
   - Sound effects
   - Celebration animations

5. **Social Features**
   - Share on Farcaster
   - Tag users in claims
   - Claim streaks

6. **Database Integration**
   - PostgreSQL for persistence
   - Analytics dashboard
   - Historical data

## Testing

### Local Testing

1. **With Farcaster User:**
   - Open app in Farcaster miniapp
   - Connect wallet and claim
   - Check Hall of Fame appears
   - Verify your name shows up

2. **Without Farcaster:**
   - Open in browser
   - Claim (if allowed)
   - Check claim logged but not in Hall of Fame
   - Only Farcaster claims appear

3. **API Testing:**
```bash
# Test GET endpoint
curl https://your-domain.com/api/log-claim

# Test POST endpoint
curl -X POST https://your-domain.com/api/log-claim \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234...",
    "txHash": "0xabcd...",
    "farcasterUser": {
      "fid": 12345,
      "username": "test",
      "displayName": "Test User"
    }
  }'
```

## Dependencies Added

```json
{
  "@neynar/nodejs-sdk": "latest",  // For future Farcaster API integration
  "date-fns": "latest"              // For relative time formatting
}
```

## Code Locations

- **Hook:** `src/hooks/use-farcaster-miniapp.ts`
- **Component:** `src/components/hall-of-fame.tsx`
- **API:** `src/app/api/log-claim/route.ts`
- **Context:** `src/components/farcaster-miniapp-provider.tsx`
- **Usage:** `src/app/page.tsx`
- **Data:** `data/claims.json` (gitignored)

## Support

If you encounter issues:
1. Check console logs for errors
2. Verify Farcaster SDK is initialized
3. Test API endpoints directly
4. Check `data/claims.json` exists and is writable

---

**Feature Status:** ✅ Complete and Deployed
**Last Updated:** 2025-10-14
**Bundle Impact:** +4 kB (date-fns library)
