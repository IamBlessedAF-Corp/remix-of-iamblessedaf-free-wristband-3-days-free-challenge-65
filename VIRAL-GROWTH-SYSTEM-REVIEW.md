# iamblessedaf.com — Viral Growth System: Full Audit & Improvement Plan

**Date:** 2026-02-20
**Goal:** Engineer a measurable viral loop with K-factor >= 2.0 while maintaining compliance (SMS consent, opt-out, platform anti-spam). Optimize for activation + referrals + conversion.
**Framework:** Sean Ellis / Dropbox-style growth loops + Alex Hormozi offer engineering

---

## Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [What's Working (Keep)](#2-whats-working-keep)
3. [Critical Gaps — Viral Loop](#3-critical-gaps--viral-loop)
4. [Critical Gaps — Backend & Scalability](#4-critical-gaps--backend--scalability)
5. [Critical Gaps — Compliance](#5-critical-gaps--compliance)
6. [Growth Loop Architecture (Target)](#6-growth-loop-architecture-target)
7. [Detailed Improvements — Frontend Viral Mechanics](#7-detailed-improvements--frontend-viral-mechanics)
8. [Detailed Improvements — Backend Infrastructure](#8-detailed-improvements--backend-infrastructure)
9. [Detailed Improvements — SMS & Messaging Compliance](#9-detailed-improvements--sms--messaging-compliance)
10. [Detailed Improvements — Funnel Optimization](#10-detailed-improvements--funnel-optimization)
11. [Detailed Improvements — Analytics & Measurement](#11-detailed-improvements--analytics--measurement)
12. [Detailed Improvements — Conversion & Monetization](#12-detailed-improvements--conversion--monetization)
13. [Database Schema Changes Required](#13-database-schema-changes-required)
14. [New Edge Functions Required](#14-new-edge-functions-required)
15. [Priority Execution Order](#15-priority-execution-order)
16. [K-Factor Math: Path to K >= 2.0](#16-k-factor-math-path-to-k--20)

---

## 1. Current State Assessment

### Tech Stack
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions + Realtime)
- **Payments:** Stripe (checkout sessions + webhooks)
- **SMS:** Twilio (3-lane routing: OTP / Transactional / Marketing)
- **WhatsApp:** Via Twilio (send-whatsapp-invite function)
- **Email:** Resend API
- **Voice AI:** ElevenLabs (voice agent/scripts)
- **Hosting:** Lovable.dev (Vite SPA deployment)

### Current Funnel Flow
```
Landing (Offer22) → Free Wristband Claim → Auth (Google/Apple/Email)
  → Gratitude Intro → Gratitude Setup (3-day challenge)
  → Upsell ($22 wristband pack) → Challenge Thanks
  → WhatsApp Invite Modal (invite 3 friends)
  → Affiliate Portal (dashboard, referrals, missions, leaderboard, clip & earn)
```

### Current Referral System
- `/r/:code` redirects to `/?ref=CODE`
- Ref code stored in sessionStorage + localStorage
- Written to `creator_profiles.referred_by_code` + `referred_by_user_id` on signup
- Referral Hub in portal with copy link, WhatsApp, SMS, X, Facebook sharing
- Blessings system: send gratitude to friends via WhatsApp
- BC coins gamification: earn coins for shares, milestones, daily login
- Share milestone tracker: localStorage-based, 5 milestones up to 1000 BC
- Post-purchase share prompt: appears after mystery box on offer success
- Cross-funnel share nudge: slides in after 20s on offer pages

### Current K-Factor Dashboard
- Calculates K = (avg invites per user) x (conversion rate)
- 30-day daily trend chart
- Data sources: blessings table + creator_profiles referral attribution

### Edge Functions (44 total)
- SMS infrastructure: send-sms, sms-router, sms-status-webhook, send-otp, send-email-otp
- Challenge: schedule-challenge-messages, send-scheduled-messages, send-followup-sequences
- Commerce: create-checkout, stripe-webhook, recover-abandoned-cart, send-cart-sms-15min
- Admin: invite-user, manage-user, daily-report, budget-alerts
- Content: verify-clip, verify-youtube-views, clip-approved-notification, expert-scripts
- Engagement: portal-daily-login, process-weekly-payout, send-weekly-digest, tgf-friday, confirm-blessing
- Growth: short-link, send-whatsapp-invite, send-welcome-email, send-tier-milestone-email

### Database (73+ SQL migrations)
- Core tables: creator_profiles, blessings, orders, abandoned_carts, bc_wallets, bc_transactions
- SMS: sms_deliveries, sms_audit_log
- Admin: user_roles, audit_log, backup_verifications
- Gamification: achievements, bc_redemptions, bc_store_items
- Content: clips, clip_submissions, expert_scripts
- Analytics: link_clicks, portal_activity_feed

---

## 2. What's Working (Keep)

1. **Referral attribution flow** — Clean `/r/CODE` → sessionStorage → DB pipeline. Survives OAuth redirects. Good.
2. **SMS compliance architecture** — 3-lane routing (OTP/transactional/marketing) with template registry, marketing keyword guard, STOP language on marketing messages. Solid A2P 10DLC foundation.
3. **WhatsApp invite modal** — High-friction but high-intent. Collects name + phone, sends personalized gratitude message. The Neuro-Hack framing is compelling.
4. **BC coins gamification** — Multi-source earn mechanics (shares, milestones, daily login, referrals). Creates retention loops.
5. **K-Factor dashboard** — Real-time tracking with correct formula. Already measures blessings + referral attribution.
6. **Post-purchase share timing** — Catching users at peak dopamine (after purchase) is correct per Hormozi.
7. **Lazy loading** — All pages are lazy-loaded. Good for initial load performance.
8. **Abandoned cart recovery** — 15-min SMS + recovery function. Covers cart abandonment.
9. **Multi-platform share** — WhatsApp, TikTok, Instagram, YouTube, X, Facebook all covered.
10. **Internationalization** — Google Translate banner for non-English browsers. Smart for viral spread.

---

## 3. Critical Gaps — Viral Loop

### GAP V1: No "Aha Moment" Before Auth Wall
**Problem:** Users hit the free wristband claim → immediately get auth modal. No value delivered yet.
**Dropbox parallel:** Dropbox showed you the magic of syncing BEFORE asking you to sign up.
**Fix:** Deliver the gratitude experience (show the challenge preview, let them pick a friend name, show the message they'd send) BEFORE requiring signup. Auth should gate the "send" action, not the "explore" action.

### GAP V2: Invite Modal Caps at 3 Friends
**Problem:** `InviteFriendsModal` limits to 3 friends (`if (friends.length < 3)`). This artificially caps your K-factor.
**Math:** If avg user invites 3 people at 25% conversion = K of 0.75. You need 8+ invites at 25% to hit K=2.0.
**Fix:** Remove the cap. Let users invite unlimited friends. Show a "power inviter" badge at 5+. Show "Legendary Ambassador" at 10+. Each additional friend should be effortless (one-tap add from contacts).

### GAP V3: No Contact Picker / Phone Book Integration
**Problem:** Users manually type phone numbers. Huge friction. Most people won't type more than 1.
**Fix:** Implement Web Contact Picker API (`navigator.contacts.select()`) or native SMS `sms:` links with pre-filled body. On mobile, this lets users pick from their phone book in 2 taps.

### GAP V4: Share Milestones Only Track localStorage (No Server Persistence)
**Problem:** `ShareMilestoneTracker` uses `localStorage` only. Data lost on device switch, clear cache, or new browser.
**Fix:** Persist share events to `share_events` table in Supabase. Sync localStorage as write-through cache. This also enables cross-device milestone continuity and accurate K-factor analytics.

### GAP V5: No "Invite Score" or Competitive Referral Mechanic
**Problem:** The leaderboard exists but doesn't create urgency. No time-boxed referral contests.
**Fix:** Weekly referral sprints: "Top 5 referrers this week win [X]." Live leaderboard with real-time updates via Supabase Realtime. Countdown timer. Previous winners gallery.

### GAP V6: No Deep Link for Specific Reward Unlocks
**Problem:** When User A shares a link, User B lands on a generic page. No personalization beyond sender name.
**Fix:** When User B clicks `/r/CODE`, show "Sarah sent you a FREE wristband" with Sarah's avatar/photo. Social proof from the specific referrer increases trust and conversion 30-40%.

### GAP V7: No Viral Content Templates / Shareable Assets
**Problem:** Users share text-only links. No pre-made Instagram stories, TikTok overlays, or shareable images.
**Fix:** Generate personalized shareable images using HTML canvas or server-side rendering:
  - "I just donated 22 meals. Your turn." + their name + unique QR code
  - Instagram story template with wristband photo
  - TikTok duet-ready video template

### GAP V8: No Two-Sided Incentive (Referrer + Referee Both Win)
**Problem:** Current system rewards the referrer (BC coins) but the referee just gets a "free wristband" they'd get anyway.
**Fix:** Make the referee's reward BETTER when referred:
  - Referred users get a bonus mystery box
  - Referred users get 50 BC on signup (vs 0 for organic)
  - Referred users skip one step in the funnel
  - This is the Dropbox model: referrer gets space AND referee gets space.

### GAP V9: No Referral Status Tracking for the Referrer
**Problem:** After sharing, referrers have no way to see "Your friend Sarah clicked the link" → "Sarah signed up" → "Sarah purchased."
**Fix:** Real-time referral funnel for each referrer:
  - Link clicked (from `link_clicks` table)
  - Friend signed up (from `creator_profiles.referred_by_user_id`)
  - Friend completed challenge
  - Friend purchased (from `orders` joined with referral)
  - Push notifications on each stage transition

### GAP V10: No SMS/WhatsApp Follow-Up for Unconverted Referrals
**Problem:** If User A invites User B and B doesn't sign up within 24 hours, nothing happens.
**Fix:** Automated re-engagement sequence:
  - T+2 hours: "Your friend [A] is waiting for you to claim your wristband"
  - T+24 hours: "[A]'s gratitude message is still waiting for you"
  - T+72 hours: Last chance reminder
  - This requires the `blessings` table to track recipient conversion status and a cron edge function.

### GAP V11: No "Earned Media" / UGC Amplification Loop
**Problem:** Clipper system exists but is disconnected from the core viral loop. Users clip/repost but it doesn't feed back into referrals.
**Fix:** Every clip should have a trackable referral link burned into the content. When a clip goes viral, the views → clicks → signups pipeline should be measured. The clipper's referral code should be in the video description, pinned comment, and watermark overlay.

### GAP V12: No Waitlist/Scarcity Mechanic on the Free Wristband
**Problem:** "Free wristband" has no urgency. Users can come back anytime.
**Fix:** Add real or perceived scarcity:
  - "Only 247 free wristbands left today" (with live counter)
  - "Your reserved wristband expires in 23:59:42" (per-user countdown)
  - "1,847 people claimed theirs in the last 24 hours" (social proof counter)

---

## 4. Critical Gaps — Backend & Scalability

### GAP B1: No Rate Limiting on Edge Functions
**Problem:** All 44 edge functions accept unlimited requests. A traffic spike (viral moment) or bad actor could overwhelm Supabase.
**Fix:**
  - Add rate limiting middleware to all public-facing edge functions (create-checkout, send-sms, send-whatsapp-invite, send-otp, short-link)
  - Use Supabase's built-in rate limiting or implement token bucket in the function
  - Rate limits: 10 req/min for OTP, 5 req/min for SMS sends, 30 req/min for reads

### GAP B2: No CDN or Static Asset Optimization
**Problem:** SPA served from Lovable's hosting. No evidence of CDN configuration, image optimization, or cache headers.
**Fix:**
  - Ensure Vite build produces hashed filenames (already does by default)
  - Add service worker for offline support and asset caching
  - Optimize images: convert PNGs to WebP, add `srcset` for responsive images
  - Preload critical fonts (currently loading 5 Google Fonts — too many)

### GAP B3: No Database Connection Pooling Strategy
**Problem:** Each edge function creates its own Supabase client. Under load, this means 44+ connection pools.
**Fix:**
  - Use the `_shared` directory for a singleton client factory
  - Implement connection reuse patterns in Deno edge functions
  - Consider Supabase's PgBouncer configuration for connection pooling

### GAP B4: No Queue System for SMS/Email
**Problem:** SMS sends are synchronous in the edge functions. If Twilio is slow, the function times out. If 1000 users sign up simultaneously, 1000 simultaneous Twilio API calls happen.
**Fix:**
  - Implement a job queue using Supabase's `pg_cron` + a queue table
  - Insert SMS jobs into `sms_queue` table
  - Process queue with a cron function (every 30s) that sends in batches
  - This also provides automatic retry on failure

### GAP B5: No Supabase Edge Function Cold Start Optimization
**Problem:** 44 edge functions means 44 potential cold starts. Functions importing heavy dependencies (Stripe, etc.) will be slow on first call.
**Fix:**
  - Consolidate related functions (e.g., all SMS functions into one with path-based routing)
  - Use Deno's `import_map.json` for shared dependency management
  - Pre-warm critical functions with a health check cron

### GAP B6: No Realtime Subscriptions for Live Features
**Problem:** Portal leaderboard, activity feed, and K-factor dashboard use polling (react-query with staleTime). Not real-time.
**Fix:**
  - Use Supabase Realtime channels for:
    - New signups → leaderboard update
    - New blessings → referrer notification
    - New orders → activity feed
    - K-factor recalculation
  - Already using `@supabase/supabase-js` which supports Realtime

### GAP B7: No Error Monitoring / Alerting Beyond Basic Logging
**Problem:** `errorCapture.ts` exists but functions just `console.error`. No centralized error tracking.
**Fix:**
  - The `ingest-error` edge function exists — ensure ALL client-side errors route through it
  - Add error boundary reporting to the existing `ErrorBoundary.tsx`
  - Set up Supabase database webhook to alert on error spikes (alert when errors table gets > 10 rows in 5 minutes)

### GAP B8: No Database Indexes for Viral-Critical Queries
**Problem:** The K-factor dashboard queries `blessings`, `creator_profiles`, and `link_clicks` with date filters. Without proper indexes, these will slow down as data grows.
**Fix:**
  - Add composite indexes:
    ```sql
    CREATE INDEX idx_blessings_created_sender ON blessings(created_at, sender_id);
    CREATE INDEX idx_creator_profiles_referred ON creator_profiles(created_at, referred_by_user_id) WHERE referred_by_user_id IS NOT NULL;
    CREATE INDEX idx_link_clicks_source_date ON link_clicks(utm_source, created_at);
    CREATE INDEX idx_creator_profiles_referral_code ON creator_profiles(referral_code) WHERE referral_code IS NOT NULL;
    ```

### GAP B9: No Horizontal Scaling Plan
**Problem:** Supabase free/Pro tier has limits. No documentation on when to upgrade or scale.
**Fix:**
  - Document Supabase limits: 500 edge function invocations/sec, 500MB database on free tier
  - Plan for: Supabase Pro ($25/mo) supports 50k daily active users
  - For viral moments (100k+ signups/day): Consider Supabase Enterprise or move critical paths to Cloudflare Workers + external Postgres
  - Add database read replicas for analytics queries that don't need real-time consistency

### GAP B10: No Backup and Disaster Recovery
**Problem:** `backup_verifications` table exists and a `verify-backup` function exists, but there's no documented backup strategy.
**Fix:**
  - Enable Supabase PITR (Point-in-Time Recovery) — requires Pro plan
  - Run daily backup verification via cron
  - Export critical tables (creator_profiles, orders, blessings) to external storage weekly

---

## 5. Critical Gaps — Compliance

### GAP C1: No Explicit SMS Consent Collection
**Problem:** The WhatsApp invite modal collects friends' phone numbers and sends messages, but there's no clear opt-in consent from the RECIPIENT before receiving messages.
**Fix:**
  - First message to any new phone number should be a consent request, not the gratitude message directly
  - Store consent status per phone number: `sms_consent` table with `phone`, `consent_given_at`, `consent_source`, `opt_out_at`
  - Only send marketing messages to consented numbers
  - Transactional messages (OTP, order confirmations) don't need consent but should still include STOP language

### GAP C2: No STOP/Unsubscribe Handling
**Problem:** Marketing templates include "Reply STOP to unsubscribe" but there's no webhook to process STOP replies.
**Fix:**
  - Twilio sends incoming messages to a webhook — configure an `sms-inbound` edge function
  - Parse STOP/UNSUBSCRIBE/QUIT keywords
  - Immediately update `sms_consent` table with `opt_out_at`
  - Return confirmation: "You've been unsubscribed. Reply START to re-subscribe."
  - Check consent status before every send in sms-router

### GAP C3: No GDPR/CCPA Data Deletion Flow
**Problem:** No endpoint or UI for users to request data deletion.
**Fix:**
  - Add "Delete My Data" button in portal account settings
  - Implement `delete-user-data` edge function that:
    - Anonymizes creator_profiles
    - Deletes bc_wallets, bc_transactions
    - Removes SMS records
    - Calls Supabase auth admin delete
  - Log deletion request in audit_log

### GAP C4: No Rate Limiting on WhatsApp Invites
**Problem:** A user could spam-send unlimited WhatsApp messages via the invite modal.
**Fix:**
  - Max 10 WhatsApp invites per user per day
  - Max 3 invites to the same phone number (ever)
  - Track in `whatsapp_sends` table with user_id, recipient_phone, sent_at
  - Block and show friendly message: "You've reached today's invite limit. Come back tomorrow!"

### GAP C5: Privacy Policy and Terms Need SMS/WhatsApp Disclosure
**Problem:** Privacy page and Terms page exist at `/privacy` and `/terms` but may not cover SMS consent, WhatsApp message sending on behalf of users, or data sharing with Twilio.
**Fix:**
  - Add SMS/WhatsApp disclosure to privacy policy
  - Add "Message and data rates may apply" language to signup flow
  - Disclose that messages are sent via Twilio
  - Add "By entering your friend's phone number, you confirm you have their permission to receive this message"

---

## 6. Growth Loop Architecture (Target)

### The Dropbox-Style Double Viral Loop

```
LOOP 1: Gratitude Viral Loop (K-target: 1.5)
  User signs up → Free wristband claim → 3-Day Challenge starts
  → Day 1: Send gratitude to Friend A → Friend A gets SMS/WhatsApp
  → Friend A clicks link → Friend A signs up → Friend A invites 3 friends
  → EACH FRIEND REPEATS THE LOOP

LOOP 2: Content Amplification Loop (K-target: 0.5+)
  User creates content (clip/repost/story) → Content has referral link
  → Viewers click → Some sign up → Some create content → REPEAT

COMBINED K = Loop1 K + Loop2 K = 1.5 + 0.5 = 2.0
```

### Key Metrics to Hit K >= 2.0
| Metric | Current (Est.) | Target | Lever |
|--------|---------------|--------|-------|
| Avg invites per user | ~2 | 8+ | Remove cap, add contact picker, multi-channel |
| Invite → Click rate | ~30% | 50% | Better previews, personalized landing, urgency |
| Click → Signup rate | ~15% | 30% | Reduce friction, social proof, referrer context |
| Signup → Inviter rate | ~40% | 70% | Mandatory "thank someone" step, better onboarding |
| Content shares per user | ~0.5 | 2+ | Shareable templates, easy 1-tap content creation |
| Content → Signup rate | ~1% | 3% | Better CTA in content, landing page optimization |

---

## 7. Detailed Improvements — Frontend Viral Mechanics

### 7.1 Remove 3-Friend Cap in InviteFriendsModal
**File:** `src/components/portal/InviteFriendsModal.tsx:60`
**Change:** Remove `if (friends.length < 3)` cap. Allow unlimited additions.
**Add:** Progressive UI — after 3 friends, show "Super Inviter mode activated!" After 5, show "You're on fire! 10 more for Legendary Ambassador status."

### 7.2 Add Web Contact Picker
**File:** New component `src/components/viral/ContactPicker.tsx`
**Logic:**
```typescript
const pickContacts = async () => {
  if ('contacts' in navigator && 'ContactsManager' in window) {
    const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: true });
    return contacts.map(c => ({ name: c.name?.[0] || '', phone: c.tel?.[0] || '' }));
  }
  // Fallback: native SMS link with pre-filled body
  return null;
};
```
**Note:** Contact Picker API is supported on Android Chrome. Fallback for iOS: use `sms:` links with pre-filled text body.

### 7.3 Add Personalized Referral Landing Pages
**File:** Modify `src/pages/Offer22.tsx`
**Change:** When `?ref=CODE` is present, fetch referrer's display_name and avatar. Show:
  - "[Referrer Name] sent you a FREE Gratitude Wristband"
  - If referrer has a photo, show it
  - Show referrer's gratitude streak/stats as social proof
  - "Join [X] others who were blessed by [Referrer Name]"

### 7.4 Add Shareable Image Generator
**File:** New component `src/components/viral/ShareableImageGenerator.tsx`
**Logic:**
  - Use `html2canvas` (already a dependency) to render a styled div as an image
  - Template: "I just donated [X] meals to families in need. Join me: [QR code]"
  - Auto-generate per user with their stats
  - One-tap download + share to Instagram Stories

### 7.5 Add Urgency/Scarcity Counter on Landing Page
**File:** Modify `src/components/offer/FreeWristbandStep.tsx`
**Add:**
  - Live counter: "Only [X] free wristbands left today" (decrements via Supabase Realtime or simulated)
  - Recent activity: "[Name] from [City] claimed 2 minutes ago" (from `link_clicks` or `creator_profiles`)
  - Countdown: "Your reserved wristband expires in [HH:MM:SS]" (session-based)

### 7.6 Add Two-Sided Referral Rewards
**File:** Modify `src/pages/Offer22.tsx` + `ChallengeThanks.tsx`
**Change:** When user arrives via referral:
  - Show "Your friend unlocked a BONUS for you: +50 BC + Mystery Box"
  - Auto-credit 50 BC to referee's wallet on signup
  - Show mystery box immediately after signup (before challenge)
  - This creates reciprocity: "Sarah gave me this, I should share too"

### 7.7 Add Real-Time Referral Status Dashboard
**File:** Modify `src/components/portal/PortalReferralHub.tsx`
**Add:** For each blessing/referral, show a mini-funnel:
  - Link sent -> Link clicked -> Signed up -> Completed challenge -> Purchased
  - With timestamps and status badges
  - Push notification (via Supabase Realtime) when a friend progresses

### 7.8 Add Viral Referral Contests (Weekly Sprints)
**File:** New component `src/components/portal/WeeklyReferralSprint.tsx`
**Logic:**
  - Time-boxed contest: "Top 5 referrers this week win [prize]"
  - Live leaderboard updating via Supabase Realtime
  - Countdown to sprint end
  - Previous winners gallery
  - Auto-announce winners via edge function cron

### 7.9 Add "Challenge Your Friend" Direct Share Flow
**File:** New page `src/pages/ChallengeAFriend.tsx`
**Logic:**
  - Standalone share page: user enters friend's name → gets a personalized share link
  - Link goes to: `/r/CODE?for=FriendName`
  - Landing shows: "Hey [FriendName], [User] challenged you to 3 days of gratitude"
  - This is MORE VIRAL than generic sharing because it's personal

### 7.10 Add Exit-Intent Share Prompt
**File:** The `useExitIntent.ts` hook exists but needs to trigger a share modal
**Change:** When user shows exit intent (mouse leaves viewport on desktop, back button on mobile):
  - Show: "Before you go — send a FREE wristband to someone you love"
  - One-tap share via WhatsApp/SMS
  - This captures users who were going to leave without sharing

---

## 8. Detailed Improvements — Backend Infrastructure

### 8.1 SMS Queue System
**New table:** `sms_queue`
```sql
CREATE TABLE sms_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  template_key text NOT NULL,
  variables jsonb DEFAULT '{}',
  traffic_type text NOT NULL,
  priority integer DEFAULT 5, -- 1=urgent (OTP), 5=normal, 10=low
  status text DEFAULT 'pending', -- pending, processing, sent, failed, cancelled
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  scheduled_for timestamptz DEFAULT now(),
  processed_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_sms_queue_pending ON sms_queue(priority, scheduled_for) WHERE status = 'pending';
```
**New edge function:** `process-sms-queue` — cron every 30s, processes 50 messages per batch.
**Benefit:** Handles viral traffic spikes gracefully. Auto-retries. Priority queue for OTP.

### 8.2 Rate Limiting Middleware
**New file:** `supabase/functions/_shared/rateLimit.ts`
```typescript
// Token bucket rate limiter using Supabase table
export async function checkRateLimit(
  supabase: SupabaseClient,
  key: string,  // e.g., "sms:+1234567890" or "checkout:user123"
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  // Use SELECT FOR UPDATE to prevent race conditions
  // ...
}
```
Apply to: send-sms, send-whatsapp-invite, create-checkout, send-otp, short-link

### 8.3 Database Indexes for Performance
```sql
-- Viral query optimization
CREATE INDEX CONCURRENTLY idx_blessings_created_sender ON blessings(created_at, sender_id);
CREATE INDEX CONCURRENTLY idx_creator_profiles_referred ON creator_profiles(created_at) WHERE referred_by_user_id IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_creator_profiles_referral_code ON creator_profiles(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_link_clicks_source_date ON link_clicks(created_at, utm_source);
CREATE INDEX CONCURRENTLY idx_orders_email ON orders(customer_email, created_at);

-- Queue optimization
CREATE INDEX CONCURRENTLY idx_sms_queue_pending ON sms_queue(priority, scheduled_for) WHERE status = 'pending';

-- Consent checking
CREATE INDEX CONCURRENTLY idx_sms_consent_phone ON sms_consent(phone) WHERE opt_out_at IS NULL;
```

### 8.4 Edge Function Consolidation
Consolidate 44 functions into ~15 by grouping related functionality:
  - `sms-service` (replaces: send-sms, send-otp, send-email-otp, sms-router, sms-status-webhook, process-sms-queue)
  - `challenge-service` (replaces: schedule-challenge-messages, send-scheduled-messages, send-followup-sequences)
  - `commerce-service` (replaces: create-checkout, stripe-webhook, recover-abandoned-cart, send-cart-sms-15min)
  - `user-service` (replaces: invite-user, manage-user, portal-daily-login)
  - `content-service` (replaces: verify-clip, verify-youtube-views, clip-approved-notification, expert-scripts, process-voice-transcript)
  - `notification-service` (replaces: send-welcome-email, send-expert-welcome, send-network-marketer-welcome, send-wristband-welcome, send-tier-milestone-email, send-weekly-digest, card-blocker-notify)
  - `analytics-service` (replaces: daily-report, budget-alerts, verify-backup)
  - `growth-service` (replaces: short-link, send-whatsapp-invite, confirm-blessing, tgf-friday, auto-assign-segments)

**Benefits:** Fewer cold starts, shared code, lower maintenance, better monitoring.

### 8.5 Supabase Realtime Integration
**Enable Realtime on tables:**
  - `blessings` — for live referral tracking
  - `creator_profiles` — for live signup counter
  - `portal_activity_feed` — for live activity stream
  - `bc_wallets` — for live coin balance updates

**Frontend subscription pattern:**
```typescript
const channel = supabase
  .channel('viral-updates')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'blessings' }, (payload) => {
    // Update leaderboard, show toast, etc.
  })
  .subscribe();
```

### 8.6 Cron Jobs for Viral Growth
**Required cron functions (via pg_cron or Supabase scheduled functions):**
| Interval | Function | Purpose |
|----------|----------|---------|
| Every 30s | `process-sms-queue` | Send queued SMS messages |
| Every 5 min | `process-referral-reminders` | Send follow-up to unconverted referrals |
| Every hour | `update-leaderboard-cache` | Pre-compute leaderboard rankings |
| Daily 8am | Schedule challenge messages | Already exists |
| Daily 6pm | `send-daily-share-nudge` | Remind users who haven't shared today |
| Weekly Mon | `process-weekly-referral-sprint` | Announce sprint winners, start new sprint |
| Weekly Fri | `tgf-friday` | Already exists — Thank God Friday |

### 8.7 Font Loading Optimization
**File:** `index.html`
**Problem:** Loading 5 Google Font families: Caveat, Dancing Script, Satisfy, Pacifico, Indie Flower. Each adds 200-400ms.
**Fix:**
  - Audit which fonts are actually used in the visible pages (most users see Offer22 + ChallengeThanks)
  - Remove unused fonts
  - Use `font-display: swap` (already using `&display=swap`, good)
  - Consider self-hosting the 1-2 critical fonts to reduce DNS lookups

---

## 9. Detailed Improvements — SMS & Messaging Compliance

### 9.1 SMS Consent Table
```sql
CREATE TABLE sms_consent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  consent_given_at timestamptz,
  consent_source text, -- 'signup', 'invite-modal', 'checkout', 'manual'
  opt_out_at timestamptz,
  opt_out_source text, -- 'sms-reply', 'web-unsubscribe', 'admin'
  last_message_at timestamptz,
  message_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_phone UNIQUE (phone)
);
```

### 9.2 Inbound SMS Handler (STOP Processing)
**New edge function:** `sms-inbound`
  - Receives Twilio inbound webhook
  - Parses message body for STOP/UNSUBSCRIBE/QUIT/END/CANCEL
  - Updates `sms_consent.opt_out_at`
  - Returns TwiML response confirming unsubscribe
  - Parses START/SUBSCRIBE for re-opt-in

### 9.3 Consent Check Before Every Send
**Modify:** `supabase/functions/sms-router/index.ts`
**Add before Twilio call:**
```typescript
// Check opt-out status
const { data: consent } = await supabase
  .from('sms_consent')
  .select('opt_out_at')
  .eq('phone', formattedTo)
  .maybeSingle();

if (consent?.opt_out_at) {
  return new Response(
    JSON.stringify({ error: 'BLOCKED: Recipient has opted out', code: 'OPT_OUT' }),
    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

### 9.4 WhatsApp Rate Limiting Per User
**Modify:** `supabase/functions/send-whatsapp-invite/index.ts`
**Add:**
  - Check `whatsapp_sends` table: max 10 per user per day
  - Check duplicate: max 3 sends to same phone number ever
  - Return friendly error with remaining quota

---

## 10. Detailed Improvements — Funnel Optimization

### 10.1 Reduce Steps Before Value Delivery
**Current:** Landing → Auth → Gratitude Intro → Gratitude Setup → Upsell
**Proposed:** Landing (with gratitude preview) → Pick Friend → Auth (to send) → Send → Upsell
**Key change:** Let users START the gratitude experience before signing up. The auth wall should be at the "send" step, not the "explore" step.

### 10.2 One-Tap Google/Apple Sign-In
**Current:** Auth modal has Google, Apple, and email options. Good.
**Improvement:** Make Google/Apple sign-in the PRIMARY CTAs (larger buttons, above email). Email should be "or sign in with email" below. 80%+ of users will use social auth — make it frictionless.

### 10.3 Post-Signup Immediate Gratification
**Current:** After signup → Gratitude Intro screen (educational).
**Improvement:** After signup → IMMEDIATELY show "You just donated 11 meals!" with confetti + impact visual. THEN show gratitude intro. The dopamine hit should come first, education second.

### 10.4 Offer Page Optimization (Offer22)
**File:** `src/pages/Offer22.tsx`
**Improvements:**
  - Add social proof above the fold: "12,847 wristbands claimed this month"
  - Add testimonial carousel from real users
  - Add "As seen on" badges if applicable
  - Add trust signals: SSL lock, Stripe badge, satisfaction guarantee
  - Add product imagery: real photos of wristbands being worn

### 10.5 Challenge Completion → Affiliate Portal Transition
**Current:** Challenge Thanks page → WhatsApp invite modal → Affiliate Portal redirect
**Improvement:** Make the transition seamless:
  - After challenge completion, show a "You've unlocked your Affiliate Portal" animation
  - Show the 3 things they can do: Share & Earn, Clip & Earn, Track Impact
  - Guide them to their first action (share with one person)

### 10.6 Smart Downsell Flow
**File:** `src/components/offer/DownsellModal.tsx` exists
**Improvement:**
  - If user rejects $22 upsell → show $11 single wristband
  - If user rejects $11 → show "Pay what you can" ($5 minimum)
  - If user rejects all → show "Get it FREE, just share with 3 friends" (pure viral play)
  - Each rejection should feel like it's unlocking a better deal, not a worse experience

---

## 11. Detailed Improvements — Analytics & Measurement

### 11.1 Full Viral Funnel Tracking
Track every step with named events:
| Event | Source | Table |
|-------|--------|-------|
| `referral_link_generated` | ChallengeThanks | creator_profiles |
| `referral_link_shared` | Share buttons | share_events (new) |
| `referral_link_clicked` | ReferralRedirect | link_clicks |
| `referred_signup` | Offer22 auth | creator_profiles |
| `referred_challenge_start` | Challenge page | challenge_participants (if exists) |
| `referred_challenge_complete` | Challenge completion | challenge_completions |
| `referred_purchase` | Stripe webhook | orders + referral join |
| `referred_became_referrer` | When referred user sends their first invite | blessings |

### 11.2 Cohort Analysis
**New component:** `src/components/admin/CohortAnalysis.tsx`
  - Group users by signup week
  - Track: % who shared, % who invited, % who purchased, % who re-engaged at 7d/14d/30d
  - Identify which cohorts have highest K-factor (correlate with acquisition channel)

### 11.3 Attribution Multi-Touch
**Current:** Last-click attribution only (referred_by_code).
**Improvement:** Track first touch AND last touch:
  - `first_touch_source`: the very first way the user heard about the product
  - `last_touch_source`: the final link they clicked before signing up
  - This helps understand which channels drive awareness vs. conversion

### 11.4 A/B Testing Infrastructure
**File:** `src/hooks/useABTest.ts` exists
**Improvement:**
  - Ensure test assignments are persisted (not just session-based)
  - Log test impressions and conversions to Supabase
  - Build admin dashboard for test results with statistical significance
  - Priority tests to run:
    1. Invite modal: 3-friend cap vs. unlimited
    2. Landing page: generic vs. personalized (referrer context)
    3. Share CTA copy: "Gift a wristband" vs. "Challenge a friend"
    4. Signup flow: auth-first vs. value-first

---

## 12. Detailed Improvements — Conversion & Monetization

### 12.1 Affiliate Tier Acceleration
**Current:** `affiliate_tiers` table tracks wristbands_distributed and credit_amount.
**Improvement:**
  - Make tier progression visible and exciting
  - Show "You're 3 referrals away from Silver tier" with progress bar
  - Each tier unlocks real rewards: higher commission %, exclusive merch, early access
  - Tier milestones should trigger celebration (confetti, push notification, email)

### 12.2 Stripe Checkout Optimization
**File:** `supabase/functions/create-checkout/index.ts`
**Improvements:**
  - Pass referrer info to Stripe metadata for attribution
  - Add upsell/cross-sell in Stripe checkout (additional wristband colors)
  - Enable Apple Pay and Google Pay for 1-tap mobile purchases
  - Add "Buy for a friend" option that creates a gift checkout

### 12.3 Post-Purchase Upsell Sequence
**After initial free wristband claim:**
  - Day 0 (checkout): Upsell to 3-pack ($22) — already exists
  - Day 3 (after challenge completion): Offer premium wristband pack ($44)
  - Day 7: Smart wristband upsell ($111)
  - Day 14: If they've referred 5+ friends, offer Diamond Ambassador package
  - Sequence triggered by edge function cron based on signup date

### 12.4 Revenue Per Referral Tracking
**Add to K-Factor Dashboard:**
  - Revenue attributed to each referrer
  - Average revenue per referred user
  - Cost per referral (BC coins redeemed / referrals generated)
  - ROI of viral loop: organic revenue - coin/reward costs

---

## 13. Database Schema Changes Required

### New Tables
```sql
-- 1. Share events (server-persisted, replaces localStorage)
CREATE TABLE share_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  channel text NOT NULL, -- 'whatsapp', 'sms', 'twitter', 'facebook', 'copy', 'native', 'tiktok', 'instagram'
  referral_url text,
  source_page text, -- which page they shared from
  created_at timestamptz DEFAULT now()
);

-- 2. SMS consent tracking
CREATE TABLE sms_consent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  consent_given_at timestamptz,
  consent_source text,
  opt_out_at timestamptz,
  opt_out_source text,
  last_message_at timestamptz,
  message_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. SMS job queue
CREATE TABLE sms_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  template_key text NOT NULL,
  variables jsonb DEFAULT '{}',
  traffic_type text NOT NULL,
  priority integer DEFAULT 5,
  status text DEFAULT 'pending',
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  scheduled_for timestamptz DEFAULT now(),
  processed_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- 4. WhatsApp send tracking (rate limiting)
CREATE TABLE whatsapp_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  recipient_phone text NOT NULL,
  recipient_name text,
  status text DEFAULT 'sent',
  created_at timestamptz DEFAULT now()
);

-- 5. Referral funnel events (track each step)
CREATE TABLE referral_funnel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid REFERENCES auth.users(id),
  referee_identifier text, -- phone or email of the person referred
  event_type text NOT NULL, -- 'link_sent', 'link_clicked', 'signed_up', 'challenge_started', 'challenge_completed', 'purchased'
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 6. Weekly referral sprints
CREATE TABLE referral_sprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  prize_description text,
  status text DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  created_at timestamptz DEFAULT now()
);

CREATE TABLE referral_sprint_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id uuid NOT NULL REFERENCES referral_sprints(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  referral_count integer DEFAULT 0,
  rank integer,
  prize_awarded boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(sprint_id, user_id)
);

-- 7. A/B test results
CREATE TABLE ab_test_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  test_name text NOT NULL,
  variant text NOT NULL,
  converted boolean DEFAULT false,
  conversion_value numeric,
  created_at timestamptz DEFAULT now()
);
```

### Schema Modifications
```sql
-- Add to creator_profiles
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS first_touch_source text;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS first_touch_at timestamptz;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS total_shares integer DEFAULT 0;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS total_referral_signups integer DEFAULT 0;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS total_referral_revenue_cents integer DEFAULT 0;

-- Add to orders (for referral revenue attribution)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS referred_by_user_id uuid;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS referred_by_code text;
```

---

## 14. New Edge Functions Required

| Function | Trigger | Purpose |
|----------|---------|---------|
| `process-sms-queue` | Cron (30s) | Dequeue and send SMS messages in batches |
| `sms-inbound` | Twilio webhook | Process STOP/START replies |
| `process-referral-reminders` | Cron (5 min) | Send follow-up to unconverted referrals |
| `generate-share-image` | HTTP | Create personalized shareable images |
| `weekly-sprint-cron` | Cron (weekly) | Compute sprint winners, start new sprint |
| `send-daily-share-nudge` | Cron (daily 6pm) | Remind non-sharers to share |
| `delete-user-data` | HTTP | GDPR/CCPA data deletion |
| `track-referral-event` | HTTP | Log referral funnel events |
| `update-leaderboard-cache` | Cron (hourly) | Pre-compute leaderboard rankings |

---

## 15. Priority Execution Order

### Phase 1: Foundation (Week 1) — Unblock Viral Growth
1. **Remove 3-friend invite cap** — Immediate K-factor uplift
2. **Add database indexes** — Prevent performance degradation as you grow
3. **Add SMS consent table + opt-out handling** — Legal compliance requirement
4. **Add rate limiting to send-whatsapp-invite** — Prevent abuse
5. **Persist share events to server** — Accurate analytics

### Phase 2: Viral Mechanics (Week 2) — Boost Invites Per User
6. **Contact picker / phone book integration** — Reduce invite friction
7. **Two-sided referral rewards** — Incentivize both referrer and referee
8. **Personalized referral landing page** — Higher click-to-signup conversion
9. **Referral funnel tracking** — Know exactly where you're losing people
10. **Exit-intent share prompt** — Capture leaving users

### Phase 3: Amplification (Week 3) — Add Second Viral Loop
11. **Shareable image generator** — Enable content-driven virality
12. **Weekly referral sprints** — Create urgency and competition
13. **Real-time referral status updates** — Keep referrers engaged
14. **Smart downsell to pure-viral free option** — 100% of users become referrers
15. **Urgency/scarcity counter on landing** — Higher claim rate

### Phase 4: Scale (Week 4) — Backend for 100k+ Users
16. **SMS queue system** — Handle traffic spikes gracefully
17. **Edge function consolidation** — Reduce cold starts
18. **Supabase Realtime integration** — Live leaderboard and activity
19. **Automated re-engagement for unconverted referrals** — Recover lost conversions
20. **Cohort analysis + A/B testing infrastructure** — Data-driven optimization

---

## 16. K-Factor Math: Path to K >= 2.0

### Current State (Estimated)
```
Users (U) = 1000
Avg invites per user (I) = 2.0 (capped at 3, most send 1-2)
Invite-to-click rate = 30%
Click-to-signup rate = 15%
Conversion rate (C) = 30% × 15% = 4.5%

K = I × C = 2.0 × 0.045 = 0.09 ← SUB-VIRAL
```

### After Phase 1 (Remove cap, better tracking)
```
I = 4.0 (uncapped, but still manual phone entry)
C = 30% × 18% = 5.4% (better landing page)

K = 4.0 × 0.054 = 0.22 ← Still sub-viral but 2.4x improvement
```

### After Phase 2 (Contact picker, two-sided rewards)
```
I = 8.0 (contact picker makes inviting easy)
C = 45% × 25% = 11.25% (personalized landing + referee reward)

K = 8.0 × 0.1125 = 0.90 ← Approaching viral!
```

### After Phase 3 (Content loop + sprints)
```
I = 10.0 (sprints drive more invites)
C = 50% × 30% = 15% (urgency + social proof)
Content loop adds: +0.5 K from earned media

K = (10.0 × 0.15) + 0.5 = 1.5 + 0.5 = 2.0 ← VIRAL! 🚀
```

### Key Insight
The path to K >= 2.0 is NOT about any single feature. It's the compounding effect of:
1. **More invites per user** (remove cap + contact picker + sprints)
2. **Higher click rate** (personalized landing + urgency)
3. **Higher signup rate** (two-sided rewards + reduced friction)
4. **Second viral loop** (content/clips driving organic signups)

Each phase builds on the previous one. Skip a phase and the math doesn't work.

---

## Summary of Everything Missing

### Viral Mechanics (12 gaps)
- [V1] No value before auth wall
- [V2] Invite cap at 3 friends
- [V3] No contact picker
- [V4] Share tracking is localStorage-only
- [V5] No competitive referral mechanic
- [V6] No personalized referral landing
- [V7] No shareable image templates
- [V8] No two-sided incentive
- [V9] No referral status tracking for referrer
- [V10] No follow-up for unconverted referrals
- [V11] Clipper content not linked to referral loop
- [V12] No scarcity/urgency on free wristband

### Backend & Scalability (10 gaps)
- [B1] No rate limiting
- [B2] No CDN/asset optimization
- [B3] No connection pooling strategy
- [B4] No SMS queue (synchronous sends)
- [B5] 44 separate edge functions (cold starts)
- [B6] No Realtime subscriptions
- [B7] No centralized error monitoring
- [B8] No database indexes for viral queries
- [B9] No horizontal scaling plan
- [B10] No documented backup/DR strategy

### Compliance (5 gaps)
- [C1] No explicit SMS consent collection
- [C2] No STOP/unsubscribe handling
- [C3] No GDPR/CCPA data deletion
- [C4] No WhatsApp rate limiting per user
- [C5] Privacy policy doesn't cover SMS/WhatsApp

### Funnel Optimization (6 improvements)
- [F1] Too many steps before value
- [F2] Social auth should be primary CTA
- [F3] No immediate gratification post-signup
- [F4] Landing page needs social proof
- [F5] Challenge→Portal transition is abrupt
- [F6] No smart downsell to pure-viral free option

### Analytics (4 improvements)
- [A1] No full viral funnel tracking
- [A2] No cohort analysis
- [A3] No multi-touch attribution
- [A4] A/B testing infrastructure incomplete

### Monetization (4 improvements)
- [M1] Affiliate tiers not visible/exciting enough
- [M2] Stripe checkout not optimized
- [M3] No post-purchase upsell sequence
- [M4] No revenue-per-referral tracking

**Total: 41 specific improvements identified.**

---

*This document is the pre-execution audit. Each section maps to specific files, functions, and database changes. Prioritized execution order in Section 15.*

---

## 17. Comparison: Surgical Lovable Prompts v4.0 vs Current Codebase

The "Surgical Lovable Prompts v4.0" document was written against an older version of the codebase. Below is a detailed comparison of what the doc proposed vs. what has ALREADY been built, what's still MISSING, and what needs to be UPDATED.

### What the Doc Assumed vs. What Actually Exists Now

| Doc Assumption | Current Reality | Status |
|---|---|---|
| "2 tables: blessings + creator_profiles" | 30+ tables including bc_wallets, bc_transactions, orders, abandoned_carts, sms_deliveries, sms_audit_log, affiliate_tiers, clips, link_clicks, etc. | **OUTDATED** — codebase has evolved massively |
| "12 routes" | 50+ routes including affiliate portal, credit funnels, admin hub, clipper dashboard, experts, diamond ambassador, etc. | **OUTDATED** |
| "Challenge.tsx — signup form (name+email+phone)" | Challenge funnel replaced by `Offer22.tsx` as landing page. Multi-step: Free Wristband → Gratitude Intro → Gratitude Setup → Upsell. Auth via Google/Apple/Email modal. | **OUTDATED** |
| "No phone OTP" | `send-otp` edge function exists. Email OTP via `send-email-otp` exists. Twilio SMS OTP via `sms-router` OTP lane exists. | **PARTIALLY BUILT** |
| "No SMS queue" | `sms-router` with 3-lane routing (OTP/transactional/marketing) + template registry + `sms_audit_log` + `sms_deliveries` tables. BUT no queue table (still synchronous). | **PARTIALLY BUILT** — queue missing, router built |
| "No admin dashboard" | Full `AdminHub.tsx` with 20+ tabs: Dashboard, Traffic, Links, Users, Messaging, SMS, Challenge, Orders, Payments, Leaderboard, K-Factor, Clippers, Experts, Affiliates, etc. | **FULLY BUILT** |
| "No K-factor tracking" | `KFactorDashboard.tsx` with 30-day trend chart, invites/user, conversion rate, daily K-factor computation. | **FULLY BUILT** |
| "No referral system" | Full referral system: `/r/:code` routing, sessionStorage persistence, OAuth redirect preservation, `creator_profiles.referred_by_code` + `referred_by_user_id`, referral hub in portal. | **FULLY BUILT** |
| "No gamification" | BC coins wallet, achievements, share milestones, daily login bonus, leaderboard, rewards store, missions system. | **FULLY BUILT** |
| "No share mechanics" | PostPurchaseSharePrompt, CrossFunnelShareNudge, ShareMilestoneTracker, PortalReferralHub with multi-platform sharing. | **FULLY BUILT** |
| "No WhatsApp integration" | `send-whatsapp-invite` edge function, InviteFriendsModal with 3-friend input + preview. | **FULLY BUILT** |
| "No affiliate system" | Full AffiliatePortal with 8 tabs, AffiliateCreditTracker, 10 credit funnel pages, DiamondAmbassador page. | **FULLY BUILT** |

### From the Surgical Doc: What's ALREADY DONE (Do NOT Rebuild)

1. **Prompt 1 (Database tables):** Most tables already exist or have equivalents:
   - `keys_status` → NOT built (the 3-Key concept doesn't exist yet)
   - `challenge_friends` → NOT built (but the WhatsApp invite modal collects friends — `blessings` table serves a similar purpose)
   - `invites` → Partially exists via `blessings` table + `creator_profiles.referred_by_user_id`
   - `sms_queue` → NOT built (sms-router sends synchronously)
   - `analytics_events` → Partially exists via `link_clicks` + `portal_activity_feed` + `sms_audit_log`

2. **Prompt 2 (Phone OTP + hooks):**
   - Phone OTP: `send-otp` edge function exists, BUT the frontend doesn't use phone-first auth — it uses Google/Apple/Email via `CreatorSignupModal`
   - Key status hook: NOT built (no 3-Key concept)
   - Analytics hook: NOT built as a hook, but `useTrafficAnalytics`, `useLinkAnalytics`, and `useLiveFunnelData` exist

3. **Prompt 3 (Challenge page rebuild):**
   - **Status: OUTDATED** — The challenge flow is now `Offer22.tsx` (free wristband → gratitude → upsell), not the original `Challenge.tsx`. The doc's JOYKEY concept would need to be ADAPTED to the current flow, not replace it.

4. **Prompt 4 (/keys dashboard):**
   - NOT built — The 3-Key progress system doesn't exist in the current codebase.
   - The equivalent is the `AffiliatePortal` with missions/milestones.

5. **Prompt 5 (Story template + Key 2):**
   - Story template generator: NOT built, but `html2canvas` is a dependency
   - WhatsApp fast-track: BUILT via `InviteFriendsModal` and `PortalReferralHub`

6. **Prompt 6 (Key 3 invite tracking):**
   - Invite tracking: PARTIALLY built via `blessings` table and `PortalReferralHub` stats
   - Activation detection: PARTIALLY built — `creator_profiles.referred_by_user_id` is set on signup, but no real-time notification to the referrer

7. **Prompt 7 (Wristband checkout):**
   - BUILT — `create-checkout` edge function + `useStripeCheckout` hook + multiple offer pages

8. **Prompt 8 (Messaging templates):**
   - FULLY BUILT — `sms-router/index.ts` has a complete `TEMPLATE_REGISTRY` with OTP, transactional, and marketing templates. More comprehensive than the doc proposed.

9. **Prompt 9 (Animations):**
   - PARTIALLY BUILT — Framer Motion used extensively, confetti via `canvas-confetti`, achievement toasts exist. But no "key unlock" animation or "emotional scale" component.

10. **Prompt 10 (Admin dashboard):**
    - FULLY BUILT — `AdminHub.tsx` is far more comprehensive than what the doc proposed. Has K-factor dashboard, funnel visualization, user management, SMS tracking, budget control, risk engine, fraud monitoring, etc.

### From the Surgical Doc: What's STILL MISSING and Worth Building

| # | Feature from Doc | Current Status | Worth Building? | Priority |
|---|---|---|---|---|
| 1 | **3-Key gamified progress system** | NOT built. Portal has missions but no linear key-unlock flow. | **YES — HIGH** | The "collect keys to unlock reward" mechanic is psychologically powerful. Adapt it to the current funnel. |
| 2 | **Phone-first auth (OTP as primary)** | Email/Google/Apple only on frontend. OTP backend exists. | **YES — MEDIUM** | Phone OTP reduces friction for mobile users (majority of traffic). Add as PRIMARY option in `CreatorSignupModal`. |
| 3 | **3-friend collection at signup** | InviteFriendsModal collects 1-3 friends AFTER signup. | **YES — HIGH** | Move friend collection to DURING signup flow (before challenge). This is the "name 3 people you're grateful for" step. |
| 4 | **Story template image generator** | `html2canvas` dependency exists, not used for shareable images. | **YES — HIGH** | Pre-made shareable content is the #1 missing viral amplifier. |
| 5 | **Real-time invite status tracking** | Blessings show confirmed/pending. No live updates. | **YES — MEDIUM** | Supabase Realtime already available. Wire up channels for live friend-joined notifications. |
| 6 | **Emotional scale visualization** | Not built. | **LOW** | Nice-to-have animation, not a viral growth driver. |
| 7 | **Key unlock animations** | Not built. Achievement toast exists. | **MEDIUM** | Enhances dopamine hit but won't directly increase K-factor. |
| 8 | **SMS queue table** | SMS is synchronous via sms-router. | **YES — HIGH** | Critical for handling viral traffic spikes. Already identified in Section 8.1. |
| 9 | **Activation detection (real-time referrer notification)** | No push notification when friend joins. | **YES — HIGH** | Keeps referrers engaged. "Sarah just joined!" push creates dopamine loop. |
| 10 | **Dual checkout (free vs. paid shipping)** | Single checkout via Stripe. No "free shipping if you complete X" logic. | **YES — MEDIUM** | Creates clear reward for completing the growth loop. |

---

## 18. Reconciled Master Plan: Doc Suggestions + Fresh Analysis

### The 3-Key System — ADAPTED for Current Codebase

The doc's "3-Key" system is the strongest new concept not yet in the codebase. Here's how to adapt it to the CURRENT funnel:

```
CURRENT FLOW:
Offer22 (free wristband) → Auth → Gratitude Intro → Gratitude Setup → Upsell → ChallengeThanks → Portal

PROPOSED FLOW (with Keys):
Offer22 (free wristband) → Auth → KEY 0: JOYKEY Activated
  → Gratitude Setup (name 3 friends) → KEY 1: Challenge Launched
  → Post Story / Share with Friends → KEY 2: Story Shared
  → 3 Friends Sign Up → KEY 3: Network Activated
  → MASTER KEY: Free Premium Wristband + Shipping

KEY DIFFERENCES FROM DOC:
- Keep Offer22 as landing (don't rebuild /challenge)
- Keep Google/Apple auth (add phone OTP as option, not replacement)
- Keys integrate into existing Portal, not a separate /keys page
- Master Key reward = free shipping on premium wristband (not a separate checkout page)
```

### Tables to Add (Merged from Doc + Fresh Analysis)

The doc proposed 5 tables. Combined with the fresh analysis (Section 13), here's the unified list:

| Table | From | Purpose | Priority |
|---|---|---|---|
| `keys_status` | Doc | 3-Key progress tracking per user | HIGH |
| `challenge_friends` | Doc | Friends named during signup | HIGH |
| `share_events` | Fresh | Server-persisted share tracking (replaces localStorage) | HIGH |
| `sms_consent` | Fresh | Explicit SMS consent + opt-out tracking | HIGH (compliance) |
| `sms_queue` | Both | Message queue for async processing | HIGH |
| `whatsapp_sends` | Fresh | Rate limiting for WhatsApp invites | MEDIUM |
| `referral_funnel_events` | Fresh | Full funnel event tracking | MEDIUM |
| `referral_sprints` + `referral_sprint_entries` | Fresh | Weekly competitive referral contests | MEDIUM |
| `ab_test_assignments` | Fresh | A/B test tracking | LOW |

### Edge Functions to Add (Merged)

| Function | From | Purpose | Priority |
|---|---|---|---|
| `process-sms-queue` | Both | Async SMS processing | HIGH |
| `sms-inbound` | Fresh | STOP/unsubscribe processing | HIGH (compliance) |
| `process-referral-reminders` | Fresh | Follow-up for unconverted referrals | HIGH |
| `generate-share-image` | Both | Personalized shareable story images | HIGH |
| `check-key-progress` | Doc | Auto-detect key unlocks, trigger notifications | MEDIUM |
| `weekly-sprint-cron` | Fresh | Referral sprint management | MEDIUM |
| `send-daily-share-nudge` | Fresh | Re-engage non-sharers | MEDIUM |
| `delete-user-data` | Fresh | GDPR/CCPA compliance | MEDIUM |

### Frontend Components to Build (Merged)

| Component | From | Purpose | Priority |
|---|---|---|---|
| `KeyProgressBar.tsx` | Doc (adapted) | 4-key progress bar in portal header | HIGH |
| `StoryTemplateGenerator.tsx` | Doc | Generate downloadable Instagram/TikTok story images | HIGH |
| `ContactPicker.tsx` | Fresh | Web Contact Picker API for easy friend invites | HIGH |
| `KeyUnlockAnimation.tsx` | Doc | Celebratory animation when a key unlocks | MEDIUM |
| `WeeklyReferralSprint.tsx` | Fresh | Time-boxed referral contest with live leaderboard | MEDIUM |
| `ReferralFunnelStatus.tsx` | Fresh | Per-friend funnel status (clicked → joined → purchased) | MEDIUM |
| `UrgencyCounter.tsx` | Fresh | Live scarcity counter on landing page | MEDIUM |
| `PersonalizedReferralLanding.tsx` | Fresh | Shows referrer info on landing page | MEDIUM |

---

## 19. Updated Priority Execution Order (Final)

### Phase 0: Compliance (Do First — Legal Requirements)
1. Add `sms_consent` table + migration
2. Build `sms-inbound` edge function (STOP/unsubscribe handling)
3. Add consent check to `sms-router` before every send
4. Add rate limiting to `send-whatsapp-invite` (max 10/day/user)
5. Update privacy policy with SMS/WhatsApp disclosure

### Phase 1: Foundation (Unblock Viral Growth)
6. Remove 3-friend cap in `InviteFriendsModal`
7. Add `share_events` table + persist shares server-side
8. Add `sms_queue` table + `process-sms-queue` cron function
9. Add database indexes for viral-critical queries
10. Add phone OTP as primary auth option in `CreatorSignupModal`

### Phase 2: 3-Key System (Gamified Viral Loop)
11. Add `keys_status` + `challenge_friends` tables
12. Build Key Progress Bar component (4 keys in portal header)
13. Integrate friend collection into signup flow (name 3 friends)
14. Build Key 2: Story template generator + "I posted it" verification
15. Build Key 3: Real-time invite tracking with Supabase Realtime
16. Build Master Key: Free shipping reward for completing all keys

### Phase 3: Viral Amplification
17. Build shareable image generator (personalized stories)
18. Add Web Contact Picker / phone book integration
19. Build two-sided referral rewards (referee gets bonus)
20. Build personalized referral landing pages
21. Build exit-intent share prompt
22. Add urgency/scarcity counter on landing page

### Phase 4: Competitive Growth Mechanics
23. Build weekly referral sprints with live leaderboard
24. Build referral funnel status tracking (per-friend progress)
25. Build automated re-engagement for unconverted referrals
26. Connect clipper content to referral tracking
27. Build smart downsell to pure-viral free option

### Phase 5: Scale & Optimize
28. Consolidate edge functions (44 → ~15)
29. Enable Supabase Realtime on viral tables
30. Build cohort analysis dashboard
31. Set up A/B testing infrastructure for key flows
32. Implement revenue-per-referral tracking
33. Document scaling plan for 100k+ users

---

## 20. Doc's 10 Lovable Prompts — Status & Recommendation

| Prompt | Description | Status | Recommendation |
|---|---|---|---|
| 1 | Add 5 new tables | Partially needed | **ADAPT** — Add `keys_status`, `challenge_friends`, `sms_queue`. Skip `analytics_events` (use existing tracking). Merge `invites` with existing `blessings`. |
| 2 | Phone OTP + hooks | Partially built | **ADAPT** — Add phone OTP to `CreatorSignupModal`. Build `useKeyStatus` hook. Skip rebuilding analytics (existing hooks work). |
| 3 | Rebuild /challenge | **OUTDATED** | **SKIP** — Current `Offer22.tsx` flow is more sophisticated. Integrate 3-friend collection into existing flow instead. |
| 4 | /keys dashboard | Not built | **ADAPT** — Don't create separate `/keys` page. Integrate key progress into existing `AffiliatePortal` dashboard tab. |
| 5 | Story template + Key 2 | Not built | **BUILD** — Story template generator is valuable. WhatsApp fast-track already exists. |
| 6 | Key 3 invite tracking | Partially built | **ADAPT** — Extend existing blessings/referral system with real-time tracking. |
| 7 | Wristband checkout | Built | **SKIP** — Checkout flow already works. Add "free shipping" tier for Master Key holders. |
| 8 | Messaging templates | Built | **SKIP** — `sms-router` template registry is more comprehensive. Add `sms_queue` only. |
| 9 | Animations | Partially built | **BUILD** — Key unlock animations are worth adding for dopamine feedback. |
| 10 | Admin dashboard | Fully built | **SKIP** — `AdminHub` is far beyond what the doc proposed. |

**Summary: Of 10 prompts, 3 should be SKIPPED (already built), 5 should be ADAPTED (codebase has evolved), and 2 should be BUILT as-is.**

---

## Final Summary

### Total Improvements Identified: 53

- **From fresh codebase analysis:** 41 improvements (Sections 3-12)
- **From Surgical Lovable Prompts doc:** 10 prompts → 12 additional specific improvements
- **Overlap (already addressed in both):** ~10 items

### The 5 Highest-Impact Changes (Do These First After Compliance)

1. **Remove 3-friend invite cap** — Instant K-factor uplift, 15 minutes of work
2. **Add 3-Key gamified progress** — Psychological hook that drives completion
3. **Build shareable image generator** — Enables content-driven second viral loop
4. **Add phone OTP auth** — Reduces signup friction for mobile-first audience
5. **Add SMS queue + async processing** — Prevents crashes during viral moments

### The Single Most Important Insight

> **Your biggest bottleneck to K >= 2.0 is not features — it's INVITES PER USER.**
> Currently capped at 3. With that cap, even with 100% conversion, K = 3 × 1.0 = 3.0 max.
> In practice with 15% conversion, K = 3 × 0.15 = 0.45.
> Remove the cap, add contact picker, and you can realistically get to 8-10 invites per user.
> At 15% conversion: K = 10 × 0.15 = 1.5. Add the content loop for +0.5 and you're at K = 2.0.
