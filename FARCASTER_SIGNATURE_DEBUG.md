# Farcaster Signature Debugging Guide

## 🎯 Issue Report
**Rabby Wallet:** Shows signature as alphanumeric (hex), claim works ✅  
**Farcaster Wallet:** Shows weird symbols, transaction fails ❌

## 🔍 What We Need to Find

When you test in Farcaster, open browser console (F12) and look for these logs:

### 1. Signature Request Stage
```
🖊️ ============ SIGNATURE REQUEST DEBUG ============
   Address: 0x...
   Message Hash: 0x...
   Message Hash Type: string
   Message Hash Length: 66 (should be 66 for 0x + 64 hex chars)
   Nonce: 0x...
   Deadline: 1234567890
   Connector: Injected (or Farcaster Wallet)
   Provider: Available
```

**What to check:**
- [ ] Is `Message Hash` a valid hex string starting with `0x`?
- [ ] Is `Message Hash Length` exactly 66?
- [ ] Is `Provider` "Available"?
- [ ] What is the `Connector` name?

### 2. Signature Received Stage
```
✅ Signature received!
   Signature: 0x...
   Signature Length: 132 (should be 132 for 0x + 130 chars)
   Signature Type: string
================================================
```

**What to check:**
- [ ] Is `Signature` present and starting with `0x`?
- [ ] Is `Signature Length` exactly 132?
- [ ] Does the signature look valid (hex characters)?

### 3. Contract Call Stage
```
🚀 ============ CALLING CONTRACT ============
   Contract Address: 0xbDcf080097890804F0c7bed6ADf8b58b042a0D47
   Function: requestTokens
   Arg 1 (nonce): 0x...
   Arg 2 (deadline): 1234567890n
   Arg 3 (signature): 0x...
================================================
```

**What to check:**
- [ ] Is `Contract Address` correct?
- [ ] Are all 3 arguments present?
- [ ] Does signature match the one received above?

### 4a. If Success
```
✅ Transaction successful! 0x...
```

### 4b. If Failure
```
❌ ============ CONTRACT CALL FAILED ============
   Error: [error object]
   Error Message: "..."
   Error Name: "..."
   Full Error Object: {...}
================================================
```

**Common Error Messages:**
- `"invalid signature"` → Signature verification failed in contract
- `"execution reverted"` → Contract rejected the call
- `"user rejected"` → User cancelled
- `"insufficient funds"` → Not enough gas
- `"deadline expired"` → Took too long to sign

## 🔧 Expected vs Actual

### Working (Rabby):
```
Message Hash: 0x1234abcd... (66 chars)
Signature: 0xabcd1234... (132 chars)
Contract Call: Success ✅
```

### Not Working (Farcaster):
```
Message Hash: ??? (Check length and format)
Signature: ??? (Check if received and format)
Contract Call: ??? (Check error message)
```

## 📊 Diagnostic Scenarios

### Scenario A: Signature Not Received
**Symptoms:** No "✅ Signature received!" log  
**Cause:** Farcaster wallet rejected or failed to sign  
**Solution:** Check wallet permissions, try different signing method

### Scenario B: Signature Received But Contract Fails
**Symptoms:** Signature received, but contract call fails with "invalid signature"  
**Cause:** Signature format incompatible with contract verification  
**Possible fixes:**
- Use `eth_signTypedData_v4` instead of `personal_sign`
- Convert message hash to bytes array format
- Add Ethereum Signed Message prefix manually

### Scenario C: Transaction Doesn't Start
**Symptoms:** No contract call logs at all  
**Cause:** Code failing before reaching contract call  
**Check:** Earlier error logs in "CLAIM PROCESS FAILED" section

## 🚀 Next Steps

After testing in Farcaster, **copy ALL console logs** and share them. We'll identify:

1. **Where it's failing** (signature stage vs contract stage)
2. **What format differences exist** (between Rabby and Farcaster)
3. **What the exact error is** (from contract or wallet)

Then we can implement the correct fix!

## 📝 Quick Test Checklist

In Farcaster:
- [ ] Open console (F12 → Console tab)
- [ ] Click "Claim 0.1 MON"
- [ ] Approve signature request
- [ ] Copy ALL logs from console
- [ ] Check what the signature prompt showed (weird symbols?)
- [ ] Note if transaction started or failed
- [ ] Share logs for analysis

---

**Note:** The weird symbols in the signature prompt are expected (it's a hex hash displayed as text). The real issue is whether the signature works with the contract!
