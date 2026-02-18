

# Referral Attribution: /r/CODE --> / with Full Tracking

## What This Does
When someone clicks `iamblessedaf.com/r/BLESSED7CF8`, they'll land on the main page (`/`) with the referral code saved silently. When they sign up (Google, Apple, or email), the system automatically records who referred them in the database -- before they even start the funnel.

## Changes

### 1. ReferralRedirect.tsx -- Redirect to `/` instead of `/challenge`
- Change the redirect from `/challenge?ref=CODE` to `/?ref=CODE`
- The referral code is already being saved to `sessionStorage` downstream, but we'll make it explicit here too for safety

### 2. Offer22.tsx (the `/` page) -- Capture `ref` param on load
- On mount, read `?ref=` from the URL and store it in `sessionStorage` as `referral_code`
- This persists across OAuth redirects (Google/Apple send the user away and back)

### 3. CreatorSignupModal.tsx -- Write `referred_by_code` on signup
- After successful account creation (email signup) or sign-in (OAuth), read `referral_code` from `sessionStorage`
- Immediately upsert the `creator_profiles` row with `referred_by_code` set to the stored code
- Clear `sessionStorage` after writing

### 4. useAuth.ts -- Pass referral code in user metadata for OAuth
- When calling `signInWithGoogle` / `signInWithApple`, append the referral code to the redirect URL so it survives the OAuth round-trip (e.g., `redirect_uri=origin/?ref=CODE`)

### 5. ChallengeThanks.tsx -- Also write `referred_by_code` when creating profile
- The profile auto-creation logic (line ~101) already creates a `creator_profiles` row but doesn't set `referred_by_code`
- Add: read `referral_code` from `sessionStorage` and include it in the insert

---

## Technical Details

```text
Flow:
  /r/BLESSED7CF8
       |
       v
  ReferralRedirect --> navigate("/?ref=BLESSED7CF8")
       |
       v
  Offer22 mounts --> reads ?ref=BLESSED7CF8 --> sessionStorage.setItem("referral_code", "BLESSED7CF8")
       |
       v
  User clicks "Claim" --> CreatorSignupModal opens
       |
       +--[Google/Apple]--> OAuth redirect (redirect_uri includes ?ref=CODE) --> returns to / --> sessionStorage still has code
       +--[Email+OTP]----> signup completes inline
       |
       v
  onSuccess fires --> read sessionStorage("referral_code") --> upsert creator_profiles.referred_by_code = "BLESSED7CF8"
       |
       v
  sessionStorage.removeItem("referral_code") --> done
```

### Files Modified
| File | Change |
|------|--------|
| `src/pages/ReferralRedirect.tsx` | Redirect to `/?ref=CODE` instead of `/challenge?ref=CODE` |
| `src/pages/Offer22.tsx` | Read `?ref` param on mount, save to `sessionStorage` |
| `src/components/contest/CreatorSignupModal.tsx` | After signup/signin success, write `referred_by_code` to `creator_profiles` |
| `src/hooks/useAuth.ts` | Include `?ref=CODE` in OAuth redirect URLs so code survives round-trip |
| `src/pages/ChallengeThanks.tsx` | Include `referred_by_code` from `sessionStorage` when auto-creating profile |

### No Database Changes Needed
The `creator_profiles` table already has a `referred_by_code` column -- we just need to populate it at signup time.

