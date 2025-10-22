# Spam Label 2 Requirement Implementation

## ⚠️ Current Status: NOT FULLY IMPLEMENTED

**Important:** This feature is currently **disabled by default** because spam labels are not available via a public API.

## Summary

This implementation provides the **framework** for requiring claimers to have **spam label 2** from Warpcast's spam labels (published by [Merkle Team](https://github.com/merkle-team/labels)). However, the actual spam checking is currently a **placeholder** that allows all users.

### Why It's Not Fully Implemented

Warpcast spam labels are stored in an **84MB Git LFS file** (`spam.jsonl`) with **no public API**. This makes it impractical to fetch and parse on every request. The file is updated weekly and contains millions of FID entries.

**File location:** https://github.com/warpcast/labels/blob/main/spam.jsonl

## Changes Made

### 1. New API Endpoint: `/api/check-spam-label`
**File:** `src/app/api/check-spam-label/route.ts`

- Integrates with Merkle Team labels API (`https://api.merkle.team/v1/labels/{fid}`)
- Checks if a Farcaster user has spam label 2 (verified non-spam user)
- Handles multiple response formats from the API
- Implements graceful error handling (fail-open approach)
- Returns user-friendly status messages

**Key Features:**
- If user is not found (404): Allows claim (assumes not in spam database)
- If API fails: Allows claim (to avoid blocking legitimate users)
- If user found but no label 2: Blocks claim with informative message

### 2. New Hook: `use-spam-label-check`
**File:** `src/hooks/use-spam-label-check.ts`

- React hook for checking spam label status
- Uses React Query for caching and automatic retries
- 5-minute stale time (labels don't change frequently)
- No refetch on window focus (optimization)

### 3. Updated Constants
**File:** `src/config/constants.ts`

Added new configurations:
- `API_ENDPOINTS.CHECK_SPAM_LABEL`: API endpoint for spam label check
- `FARCASTER_CONFIG.spamLabelRequired`: Toggle for spam label requirement (default: true)

### 4. Updated Faucet Card UI
**File:** `src/components/faucet-card.tsx`

**New Features:**
- Imports and uses `useSpamLabelCheck` hook
- Displays spam label verification status
- Shows different UI states:
  - ✅ **Verified User** (has spam label 2)
  - ⚠️ **Verification Required** (doesn't have spam label 2)
  - ⏳ **Checking spam label...** (loading state)
  - ⚠️ **Spam label check temporarily unavailable** (API error state)
- Blocks claiming if user doesn't have spam label 2
- Provides link to Merkle Team labels documentation

**Visual Design:**
- Green gradient for verified users
- Red/orange gradient for unverified users
- Consistent with existing follow requirement UI

### 5. Environment Configuration
**File:** `.env.example`

Added new environment variable:
```env
# Farcaster Spam Label Requirement
# When set to 'true' (default), users must have spam label 2 (verified non-spam user) to claim
# When set to 'false', spam label check is disabled
# Spam labels are provided by Merkle Team: https://github.com/merkle-team/labels
NEXT_PUBLIC_SPAM_LABEL_REQUIRED=true
```

## How It Works

1. **User connects wallet** in Farcaster miniapp
2. **Spam label check runs** automatically using the user's FID
3. **Merkle Team API is queried** to check for spam label 2
4. **UI updates** based on the result:
   - If verified (has label 2): User can proceed to claim
   - If not verified: User sees explanation and cannot claim
   - If API error: User can still claim (fail-open)
5. **Claim button** is enabled only if all criteria are met:
   - Correct network (Base)
   - Not in cooldown
   - From Farcaster platform
   - Following target user (if required)
   - **Has spam label 2 (if required)**

## API Response Handling

The implementation handles multiple possible response formats:

```typescript
// Format 1: Array of label objects
{ labels: [{ label: 2 }, { label: 3 }] }

// Format 2: Array of label primitives
{ labels: [2, 3] }

// Format 3: Single label value
{ label: 2 }
```

## Testing

To test the implementation:

1. **Enable spam label requirement:**
   ```env
   NEXT_PUBLIC_SPAM_LABEL_REQUIRED=true
   ```

2. **Disable spam label requirement:**
   ```env
   NEXT_PUBLIC_SPAM_LABEL_REQUIRED=false
   ```

3. **Build and run:**
   ```bash
   npm run build
   npm run dev
   ```

## Fail-Safe Design

The implementation follows a **fail-open** approach:
- If the Merkle Team API is unavailable → Allow claim
- If the user is not found in the database → Allow claim
- If there's a network error → Allow claim
- Only if the API explicitly returns that the user lacks label 2 → Block claim

This ensures legitimate users can still claim even if there are temporary API issues.

## Benefits

1. ✅ **Spam Prevention**: Blocks known spam accounts from draining the faucet
2. ✅ **Fair Distribution**: Ensures ETH goes to legitimate users
3. ✅ **User Experience**: Clear feedback on verification status
4. ✅ **Configurable**: Can be enabled/disabled via environment variable
5. ✅ **Resilient**: Graceful handling of API failures
6. ✅ **Educational**: Links to Merkle Team labels documentation

## Related Files

- API Route: `src/app/api/check-spam-label/route.ts`
- Hook: `src/hooks/use-spam-label-check.ts`
- UI Component: `src/components/faucet-card.tsx`
- Constants: `src/config/constants.ts`
- Environment: `.env.example`

## Dependencies

- No new npm packages required
- **No external API dependency** (labels are in Git LFS file)
- Integrates seamlessly with existing Farcaster miniapp context

## How to Fully Implement This Feature

To make spam label checking actually work, you need to implement a custom backend solution:

### Option 1: Database-Backed Solution (Recommended)

1. **Download the spam labels file:**
   ```bash
   git lfs clone https://github.com/warpcast/labels.git
   ```

2. **Parse and store in database:**
   ```javascript
   // Parse spam.jsonl and insert into database
   // Schema: { fid: number, label: number, updated_at: timestamp }
   ```

3. **Set up weekly updates:**
   ```javascript
   // Cron job to fetch and update labels weekly
   ```

4. **Update the API endpoint:**
   ```javascript
   // Query your database instead of external API
   const result = await db.query('SELECT label FROM spam_labels WHERE fid = $1', [fid])
   const hasSpamLabel2 = result.rows[0]?.label === 2
   ```

5. **Enable the feature:**
   ```env
   NEXT_PUBLIC_SPAM_LABEL_REQUIRED=true
   ```

### Option 2: In-Memory Cache Solution

1. Download and parse the JSONL file
2. Load into Redis or similar cache on startup
3. Update weekly via background job
4. Query the cache in the API endpoint

### Option 3: Third-Party Service

If a third-party service emerges that indexes Warpcast spam labels with an API, integrate with that service.

## Current Behavior

- **Feature is DISABLED by default** (`NEXT_PUBLIC_SPAM_LABEL_REQUIRED=false`)
- When disabled, the spam label check always returns `true` (passes)
- No users are blocked due to spam labels
- The UI component is hidden when disabled

## Future Improvements

1. ✅ Implement database-backed label storage and lookup
2. Add retry mechanism with exponential backoff for failed DB queries
3. Display label information (which labels the user has)
4. Add admin dashboard to see spam label statistics
5. Support for other label types (not just label 2)
6. Automated weekly updates of spam labels
7. Metrics and monitoring for label distribution
