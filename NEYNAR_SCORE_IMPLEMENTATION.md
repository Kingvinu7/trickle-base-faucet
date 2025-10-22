# Neynar Score Requirement Implementation

## ✅ Current Status: FULLY IMPLEMENTED

**This feature is now working!** Users must have a minimum Neynar score of 0.5 to claim ETH from the faucet.

## Summary

This implementation checks a user's **Neynar reputation score** before allowing claims. Neynar score ranges from 0 to 1, where higher scores indicate more reputable and active Farcaster accounts. This helps prevent spam and ensures fair distribution to legitimate users.

### Why Neynar Score Instead of Spam Labels?

Originally, this was planned to check Warpcast spam labels, but those are stored in an **84MB Git LFS file** with no public API. Instead, we switched to **Neynar score** which:

- ✅ Uses the existing Neynar API (already integrated for follow checks)
- ✅ Provides real-time reputation scores
- ✅ No database infrastructure needed
- ✅ Easy to implement and maintain
- ✅ Good indicator of account quality

## Changes Made

### 1. New API Endpoint: `/api/check-spam-label`
**File:** `src/app/api/check-spam-label/route.ts`

- Integrates with Neynar API (`https://api.neynar.com/v2/farcaster/user/bulk`)
- Checks if a Farcaster user meets the minimum Neynar score (0.5)
- Extracts `experimental.neynar_user_score` from user data
- Implements graceful error handling (fail-open approach)
- Returns score information and user-friendly status messages

**Key Features:**
- Minimum score requirement: **0.5** (configurable in code)
- If Neynar API unavailable: Allows claim (to avoid blocking legitimate users)
- If quota exceeded (402): Allows claim with warning
- If score below minimum: Blocks claim with current score displayed
- Returns actual score to show in UI

### 2. Hook: `use-spam-label-check`
**File:** `src/hooks/use-spam-label-check.ts`

- React hook for checking Neynar score (name kept for backward compatibility)
- Uses React Query for caching and automatic retries
- 5-minute stale time (scores don't change frequently)
- No refetch on window focus (optimization)
- Returns score, minimum requirement, and status

### 3. Updated Constants
**File:** `src/config/constants.ts`

Added new configurations:
- `API_ENDPOINTS.CHECK_SPAM_LABEL`: API endpoint for spam label check
- `FARCASTER_CONFIG.spamLabelRequired`: Toggle for spam label requirement (default: true)

### 4. Updated Faucet Card UI
**File:** `src/components/faucet-card.tsx`

**New Features:**
- Imports and uses `useSpamLabelCheck` hook
- Displays Neynar score verification status
- Shows different UI states:
  - ✅ **Verified Account ✓** (meets minimum score with actual score shown)
  - ⚠️ **Reputation Too Low** (below minimum with current score shown)
  - ⏳ **Checking account reputation...** (loading state)
  - ⚠️ **Reputation check temporarily unavailable** (API error state)
- Blocks claiming if user's score is below minimum
- Shows actual score and minimum requirement
- Provides helpful message about improving score

**Visual Design:**
- Green gradient for users with sufficient score
- Red/orange gradient for users below minimum
- Displays current score and requirement
- Consistent with existing follow requirement UI

### 5. Environment Configuration
**File:** `.env.example`

Added new environment variable:
```env
# Farcaster Neynar Score Requirement
# When set to 'true' (default), users must have a minimum Neynar score of 0.5 to claim
# When set to 'false', score check is disabled
# Neynar score ranges from 0 to 1, where higher scores indicate more reputable accounts
NEXT_PUBLIC_SPAM_LABEL_REQUIRED=true
```

## How It Works

1. **User connects wallet** in Farcaster miniapp
2. **Neynar score check runs** automatically using the user's FID
3. **Neynar API is queried** to fetch user data and score
4. **Score is extracted** from `user.experimental.neynar_user_score`
5. **Score is compared** to minimum requirement (0.5)
6. **UI updates** based on the result:
   - If score ≥ 0.5: User can proceed to claim (shows score)
   - If score < 0.5: User sees current score and requirement, cannot claim
   - If API error: User can still claim (fail-open approach)
7. **Claim button** is enabled only if all criteria are met:
   - Correct network (Base)
   - Not in cooldown
   - From Farcaster platform
   - Following target user (if required)
   - **Neynar score ≥ 0.5 (if required)**

## API Response Format

The Neynar API returns user data in this format:

```json
{
  "users": [
    {
      "fid": 12345,
      "username": "example",
      "experimental": {
        "neynar_user_score": 0.75
      },
      ...
    }
  ]
}
```

We extract `users[0].experimental.neynar_user_score` and compare it to the minimum requirement (0.5).

## Configuration

### Enable/Disable the Feature

**Enable score requirement (default):**
```env
NEXT_PUBLIC_SPAM_LABEL_REQUIRED=true
```

**Disable score requirement:**
```env
NEXT_PUBLIC_SPAM_LABEL_REQUIRED=false
```

### Adjust Minimum Score

To change the minimum required score, edit `src/app/api/check-spam-label/route.ts`:

```typescript
const MINIMUM_SCORE = 0.5 // Change this value (0.0 to 1.0)
```

**Recommended values:**
- `0.3` - Very lenient (allows most active users)
- `0.5` - Balanced (default, good spam prevention)
- `0.7` - Strict (only well-established accounts)
- `0.9` - Very strict (only highly reputable accounts)

## Fail-Safe Design

The implementation follows a **fail-open** approach:
- If the Neynar API is unavailable → Allow claim
- If the API quota is exceeded (402) → Allow claim with warning
- If there's a network error → Allow claim
- If Neynar API key is not configured → Allow claim (development mode)
- Only if the API explicitly returns a score below 0.5 → Block claim

This ensures legitimate users can still claim even if there are temporary API issues.

## Benefits

1. ✅ **Spam Prevention**: Blocks low-reputation accounts from draining the faucet
2. ✅ **Fair Distribution**: Ensures ETH goes to active, legitimate users
3. ✅ **User Experience**: Clear feedback with actual score shown
4. ✅ **Configurable**: Can be enabled/disabled and minimum score adjustable
5. ✅ **Resilient**: Graceful handling of API failures
6. ✅ **Transparent**: Shows users their current score and what's needed
7. ✅ **No Infrastructure**: Uses existing Neynar API, no database needed
8. ✅ **Real-time**: Checks current score on every claim attempt

## Related Files

- API Route: `src/app/api/check-spam-label/route.ts`
- Hook: `src/hooks/use-spam-label-check.ts`
- UI Component: `src/components/faucet-card.tsx`
- Constants: `src/config/constants.ts`
- Environment: `.env.example`

## Dependencies

- ✅ Uses existing **Neynar API** (already configured for follow checks)
- ✅ No new npm packages required
- ✅ No database infrastructure needed
- ✅ Integrates seamlessly with existing Farcaster miniapp context

## Current Behavior

- **Feature is ENABLED by default** (`NEXT_PUBLIC_SPAM_LABEL_REQUIRED=true`)
- Minimum Neynar score requirement: **0.5**
- Users with score ≥ 0.5 can claim
- Users with score < 0.5 are blocked with explanation
- API failures default to allowing claims (fail-open)
- UI shows actual score and requirement

## Future Improvements

1. Make minimum score configurable via environment variable
2. Add retry mechanism with exponential backoff for failed API calls
3. Add admin dashboard to see score distribution
4. Track score improvements over time for users
5. Provide personalized tips for improving Neynar score
6. Metrics and monitoring for score-based claim denials
7. A/B test different minimum score thresholds
