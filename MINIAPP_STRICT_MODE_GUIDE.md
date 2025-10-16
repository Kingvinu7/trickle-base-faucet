# Farcaster Miniapp Strict Mode Guide

## Current Issue
You're seeing `Miniapp detection result: false` in the console but can still claim from the browser. This is because **strict mode is not enabled**.

## How It Works

### Without Strict Mode (Current State)
```
isInFarcaster = false
miniappStrictMode = false (or undefined)
isDevelopment = true (on vercel.app/localhost)
→ isAllowedPlatform = true ✅ (allows claims)
```

### With Strict Mode Enabled
```
isInFarcaster = false
miniappStrictMode = true
isDevelopment = true (doesn't matter)
→ isAllowedPlatform = false ❌ (blocks claims)
```

## How to Enable Strict Mode

### Option 1: For Vercel Deployment (Recommended for Production)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name:** `NEXT_PUBLIC_MINIAPP_STRICT_MODE`
   - **Value:** `true`
   - **Environments:** Select `Production` (and `Preview` if needed)
4. Click **Save**
5. Redeploy your application

### Option 2: For Local Testing

Create a `.env.local` file in the project root:

```bash
# .env.local
NEXT_PUBLIC_MINIAPP_STRICT_MODE=true
```

Then restart your development server:
```bash
npm run dev
```

## Verification

After enabling strict mode, check the browser console. You should see:

```javascript
🔒 Miniapp Access Control: {
  isInFarcaster: false,
  miniappStrictMode: true,    // ← Should be true now
  isDevelopment: true,
  hostname: "your-domain.vercel.app",
  isAllowedPlatform: false,   // ← Should be false now
  envVar: "true"              // ← Should show "true"
}
```

## Expected Behavior

### When Strict Mode is Enabled (`true`)
- ❌ Browser access: Shows "Access Restricted" message, claim button disabled
- ✅ Farcaster app: Works normally, can claim

### When Strict Mode is Disabled (`false` or not set)
- ✅ Browser access: Works (for development/testing)
- ✅ Farcaster app: Works normally

## Quick Test

1. **Check current status:** Open browser console and look for `🔒 Miniapp Access Control` log
2. **If `miniappStrictMode: false`:** Strict mode is not enabled
3. **If `isAllowedPlatform: true` and `isInFarcaster: false`:** You're in development bypass mode

## Deployment Checklist

- [ ] Set `NEXT_PUBLIC_MINIAPP_STRICT_MODE=true` in Vercel environment variables
- [ ] Redeploy the application
- [ ] Test from browser (should be blocked)
- [ ] Test from Farcaster app (should work)
- [ ] Check console logs to verify settings

## Troubleshooting

**Q: I set the env var but it's still not working**
- A: Make sure you redeployed after adding the environment variable
- A: Check the console log to see if `envVar` shows "true"

**Q: The console shows `envVar: undefined`**
- A: The environment variable is not being read. Check:
  - Variable name is exactly `NEXT_PUBLIC_MINIAPP_STRICT_MODE`
  - Value is exactly `true` (lowercase)
  - You redeployed after adding it

**Q: I want to test locally with strict mode**
- A: Create `.env.local` with the variable and restart dev server

## Support

If issues persist, check the browser console for the debug logs and share them for troubleshooting.
