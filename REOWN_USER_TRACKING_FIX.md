# Reown Dashboard User Tracking Fix

## Issue
Connected users were not showing up in the Reown dashboard's "Connected Users" tab.

## Root Cause
The `allWallets: true` feature flag was missing from the AppKit configuration. This flag is **required** for the Reown dashboard to track and display all wallet connections.

## Changes Made

### 1. Updated `config.ts` (Main Configuration)
```typescript
features: { 
  analytics: true,      // Enable analytics for tracking
  allWallets: true,     // ✅ NEW: Track all wallet connections (required for dashboard)
  email: false,
  socials: [],
  swaps: false,
}
```

### 2. Updated `src/lib/reownConfig.ts` (Fallback Configuration)
Applied the same change to the fallback configuration for consistency.

## How to Verify It's Working

### Step 1: Check Your Reown Project ID
Make sure you have a valid Reown Project ID set in your environment:

**For Vercel:**
- Go to Project Settings → Environment Variables
- Verify `NEXT_PUBLIC_PROJECT_ID` is set correctly
- If not set, get one from: https://dashboard.reown.com

**For Local:**
```bash
# .env.local
NEXT_PUBLIC_PROJECT_ID=your_actual_project_id_here
```

### Step 2: Deploy and Test
1. Deploy your application (or restart local dev server)
2. Connect a wallet through your app
3. Wait 1-2 minutes for data to sync
4. Check Reown dashboard: https://dashboard.reown.com

### Step 3: Verify in Dashboard
1. Log in to Reown dashboard
2. Select your project
3. Navigate to **Analytics** → **Connected Users** (or **Users** tab)
4. You should now see:
   - User addresses
   - Connection timestamps
   - Wallet types used
   - Network information

## What Gets Tracked Now

With `allWallets: true` enabled, the dashboard will track:

✅ **User Connections**
- Wallet addresses that connect
- Connection timestamps
- Wallet types (MetaMask, Coinbase, etc.)

✅ **Network Activity**
- Which networks users connect to
- Network switching events

✅ **Session Data**
- Session durations
- User engagement metrics

## Expected Timeline

- **Immediate**: New connections start being tracked
- **1-2 minutes**: Data appears in dashboard
- **24 hours**: Full analytics and metrics populate

## Troubleshooting

### Users Still Not Showing?

**Check 1: Verify Project ID**
```bash
# In browser console after connecting wallet
console.log('Project ID:', process.env.NEXT_PUBLIC_PROJECT_ID)
```
Should show your actual project ID, not undefined or a placeholder.

**Check 2: Verify AppKit Initialization**
Open browser console and look for:
```
✅ Reown AppKit initialized and attached to window.reownAppKit
```

If you see warnings about missing Project ID, your configuration isn't loaded.

**Check 3: Check Network Requests**
1. Open browser DevTools → Network tab
2. Filter by "reown" or "walletconnect"
3. After connecting wallet, you should see analytics requests to Reown servers

**Check 4: Verify Dashboard Access**
- Make sure you're logged into the correct Reown account
- Verify you're viewing the correct project in the dashboard
- Check if you have proper permissions for the project

### Common Issues

**Issue: "Analytics not enabled"**
- Solution: Make sure both `analytics: true` AND `allWallets: true` are set

**Issue: "Data not appearing after 5+ minutes"**
- Solution: Try disconnecting and reconnecting the wallet
- Solution: Clear cache and try again
- Solution: Check Reown status page for any outages

**Issue: "Wrong project selected"**
- Solution: Double-check the Project ID in your .env matches the dashboard project

## Additional Resources

- **Reown Dashboard**: https://dashboard.reown.com
- **Reown Docs**: https://docs.reown.com/appkit/overview
- **Get Support**: https://discord.gg/reown (Reown Discord)

## Testing Checklist

Use this checklist to verify everything is working:

- [ ] Project ID is set correctly in environment variables
- [ ] Application has been redeployed/restarted
- [ ] Wallet successfully connects through the app
- [ ] Console shows "AppKit initialized" message
- [ ] Network tab shows analytics requests to Reown
- [ ] Dashboard shows the connected user (wait 1-2 minutes)
- [ ] User address is visible in Connected Users tab
- [ ] Connection timestamp is accurate
- [ ] Wallet type is displayed correctly

## Notes

- User tracking is **privacy-respecting** - only wallet addresses and connection metadata are tracked
- Users can always disconnect to stop tracking
- No personal information or transaction details are sent to Reown
- This is standard practice for Web3 dApp analytics

---

**Last Updated**: 2025-10-14
**Status**: ✅ Fixed - `allWallets: true` feature enabled
