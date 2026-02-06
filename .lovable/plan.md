

# The Gratitude Engine™ Funnel - Build Plan

## Design Direction
A **premium, exclusive** feel with:
- Clean white background for sophistication
- Your bold red logo color as the accent/CTA color
- Black headlines, grey body text
- Subtle animations and smooth transitions
- Mobile-first design (80%+ traffic will be from social/SMS)
- Sleek, minimal layout with intentional white space

---

## Page 1: Landing Page (`/challenge`)

**Hero Section:**
- Your IamBlessedAF logo prominently displayed
- Bold headline: "3 Days. 1 Real Gratitude Message per Day. Win $1,111 This Week."
- Subheadline: "No apps. No journaling. Real people. Real confirmation."

**Dual Signup Options:**
- Primary: "Continue with Google" button (premium styled)
- Alternative: Email + Phone form with "Join the Free Challenge" CTA
- Micro-trust badge: "Powered by real human confirmation"

**Design Elements:**
- Subtle gradient or soft shadows for depth
- Minimalist icons for credibility
- Smooth entrance animations

---

## Page 2: Thank You Page (`/challenge/thanks`)

**Confirmation Experience:**
- Success checkmark animation
- "You're In" headline with confirmation message
- "Day 1 arrives at 8am. Check your email/SMS."
- Optional: Share buttons to invite friends
- Clean, celebratory but understated design

---

## Page 3: Confirmation Page (`/confirm`)

**Single-Action Focus:**
- Large, premium "Confirm Blessing ✅" button
- Brief context: "Tap to confirm your gratitude was received"
- Heart/blessing counter display
- Will integrate with GoHighLevel trigger link

---

## Page 4-7: Offer Pages

**`/offer/22` - Starter Gift Pack ($22)**
- "Multiply Your Impact" messaging
- Wristbands + QR physical goods upsell
- Stripe checkout integration

**`/offer/111` - Identity & Impact Pack ($111)**
- "Lock This as Identity" positioning
- Unlocked after completing 3-Day Challenge
- Premium packaging feel

**`/offer/444` - Habit Lock Pack ($444)**
- "Strongest Reinforcement Layer"
- Unlocked after 11-Day completion
- High-value transformation positioning

**`/offer/11mo` - Monthly Membership ($11/mo)**
- "Keep the Engine Running"
- Premium prompts + private challenges + early drops
- Subscription model

---

## Technical Integration Points

- **Google OAuth**: Ready to connect with Supabase auth
- **Form Handling**: Email/Phone validation with Zod
- **Webhook-Ready**: Placeholder hooks for GoHighLevel integration
- **Stripe-Ready**: Checkout links structure prepared
- **Viral Loops**: Referral code display ready

---

## Mobile-First Features
- Thumb-friendly button placement
- Large tap targets for CTAs
- Swipe-friendly layouts
- Fast-loading, minimal assets
- SMS-optimized confirmation flow

