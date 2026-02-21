# DAY 1 VIRAL INSTAGRAM GIVEAWAY PLAN
## IamBlessedAF — $1,111 Blessed Best Friend Giveaway + K>2 Week 1 Engine

---

## Context

**Problem:** Current K-factor is 0.09 (K = 2 invites × 4.5% conversion). The system uses private WhatsApp messages with zero public visibility. No Instagram Story integration exists. No giveaway/contest mechanics exist.

**Goal:** Engineer a Day 1 experience that gets EVERY user to post an Instagram Story with their referral link, tag friends, and invite the maximum number of people with minimum friction — achieving K > 2.0 in Week 1.

**Core Mechanic:** The "$1,111 Blessed Best Friend Giveaway" — a weekly cash prize where BOTH the storyteller AND the friend who helped them win $1,111 each ($2,222 total per week), selected every Friday LIVE on @IamBlessedAF Instagram. Threshold: 2,222 challenge participants needed to unlock cash prizes. Below threshold = $1,111 store credit each instead.

---

## STAGE 1: Core $1,111 Giveaway Architecture

### The Giveaway Rules (Exact)

**Prize Structure:**
- Winner: $1,111 CASH
- Winner's nominated "Blessed Best Friend": $1,111 CASH
- Total weekly payout: $2,222
- Both sides win — this is the 2-sided incentive that makes it spread

**Threshold Mechanic:**
- IF total challenge participants ≥ 2,222 people → CASH prizes ($1,111 + $1,111)
- IF total challenge participants < 2,222 in Week 1 → Convert to $1,111 store credit each at iamblessedaf.com online store
- This creates COLLECTIVE urgency: "We need 2,222 people! Share so we ALL get the cash prize unlocked!"
- Live counter on every page showing progress toward 2,222

**Selection Process:**
- Every Friday LIVE on @IamBlessedAF Instagram account
- Winner selected from that week's Instagram Story submissions
- Criteria: "Most compelling help story from a best friend" — the story of HOW a friend blessed your life
- The winner's STORY is what wins, not random — this incentivizes HIGH-QUALITY emotional content
- Winner must have posted an Instagram Story during the challenge with their referral link
- Winner's "Blessed Best Friend" is the person featured in their winning story

**Weekly Cycle:**
```
Monday:    New week begins. Counter resets. "This week's $1,111 is up for grabs!"
Mon-Thu:   Stories accumulate. Best stories get reposted by @IamBlessedAF (amplification)
Friday:    LIVE selection on @IamBlessedAF Instagram — winner announced
Saturday:  Winner + friend featured in @IamBlessedAF content (social proof for next week)
Sunday:    Teaser for next week's giveaway. "Will YOU be next Friday's winner?"
```

**Legal Compliance:**
- "No purchase necessary" disclaimer required
- Official rules page on website
- Void where prohibited
- Winners must be 18+
- Tax responsibility disclosure
- Not affiliated with Instagram/Meta

### What Exists Now (Reuse)
- `bc_wallets` + `bc_transactions` — Can track giveaway entries and bonus coins
- `PortalLeaderboard.tsx` — Adapt for weekly story contest leaderboard
- `portal_activity` table — Log giveaway-related events
- `creator_profiles.referral_code` — Already generates unique referral links
- `blessings` table — Track who blessed whom (ties to "Blessed Best Friend")

### What Needs to Be Built
- New DB table: `giveaway_weeks` (week_id, starts_at, ends_at, participant_count, threshold_met, cash_or_credit, winner_user_id, winner_friend_name, status)
- New DB table: `giveaway_entries` (id, user_id, week_id, instagram_story_url, story_screenshot_url, blessed_friend_name, blessed_friend_story, entry_status, created_at)
- New component: `GiveawayCounterBanner.tsx` — Live counter "1,847 / 2,222 people joined! $1,111 CASH unlocked at 2,222"
- New component: `GiveawayEntryFlow.tsx` — Step-by-step story submission
- New edge function: `weekly-giveaway-cron` — Monday reset, Friday winner prep
- Modify: `PortalLeaderboard.tsx` — Add "This Week's Stories" tab

---

## STAGE 2: Day 1 Instagram Story Viral Engine

### The Day 1 Flow (Every Single User)

The key insight: Make posting the Instagram Story THE core action of Day 1 — not an afterthought. The gratitude exercise IS creating the story content.

```
STEP 1: User completes Day 1 challenge (send gratitude text)
  → Emotional peak: friend replies with love
  → THIS is the moment of maximum sharing motivation

STEP 2: Immediate "Capture the Moment" prompt
  → "Screenshot this moment! Your gratitude story could win $1,111 THIS FRIDAY"
  → Show pre-made Instagram Story template (auto-generated)
  → Template includes:
    - User's first name
    - "Day 1 of the 11:11 Gratitude Challenge"
    - Their referral link as text overlay
    - QR code pointing to their referral link
    - @IamBlessedAF tag
    - #BlessedBestFriend hashtag
    - "Tag 3 friends you're grateful for"
    - Beautiful gradient/branded design

STEP 3: One-tap Instagram Story share
  → "Share to Instagram Story" button
  → Opens Instagram with image pre-loaded (via share API or download + redirect)
  → Pre-filled caption with @IamBlessedAF + hashtag + referral link
  → Fallback: "Download image" button → manual share instructions

STEP 4: Verify + Enter Giveaway
  → "I posted my story!" confirmation button
  → Optional: paste story URL or screenshot upload for giveaway entry
  → Instant reward: +200 BC coins for posting
  → Entry into $1,111 weekly giveaway
  → Show: "You're entered! Winner announced Friday LIVE on @IamBlessedAF"

STEP 5: Tag & Invite amplification
  → "Tag 3 friends in your story for +100 BC bonus each"
  → "The more friends who join through YOUR link, the better your chances!"
  → Show friend-invite options: WhatsApp (pre-filled), SMS (pre-filled), Copy Link, DM template
```

### Why EVERY User Will Post (Psychology Breakdown — STEPPS)

| Lever | How It Works |
|---|---|
| **Social Currency** | "I'm in the $1,111 challenge" = status. The story template looks premium, not spammy |
| **Triggers** | Day 1 emotional high + 11:11 time + physical wristband reminder |
| **Emotion** | High-arousal: excitement ($1,111!) + gratitude (friend replied) + pride (I did Day 1) |
| **Public** | Instagram Story = MAXIMUM public visibility to entire follower base |
| **Practical Value** | Friends get free wristband + access to challenge + their own shot at $1,111 |
| **Stories** | "My best friend helped me through X, and now we could BOTH win $1,111" = narrative gold |

### Friction Removal (Every Barrier Eliminated)

| Barrier | Solution |
|---|---|
| "I don't know what to post" | Pre-made template auto-generated with their name + link |
| "It takes too long" | One-tap share button → Instagram opens with image ready |
| "I don't want to look like I'm selling" | Template is beautiful + about gratitude, not "BUY THIS" |
| "What's in it for me?" | $1,111 cash + 200 BC coins + giveaway entry |
| "What's in it for my friends?" | They get free wristband + their own $1,111 chance |
| "I'll do it later" | "Stories expire in 24h — post now for this week's giveaway!" |
| "I don't have Instagram" | Alternative: WhatsApp Status + Facebook Story + TikTok + SMS blast |

### Instagram Story Template Generator (Tech Spec)

**Component:** `StoryTemplateGenerator.tsx`
**Approach:** Use `html2canvas` (already a dependency) to render a styled div as a downloadable image

**Template Variants (A/B test):**

**Variant A — "The Gratitude Card"**
```
┌──────────────────────────┐
│  ✨ DAY 1 COMPLETE ✨     │
│                          │
│  I just sent gratitude   │
│  to someone I love.      │
│                          │
│  The 11:11 Challenge     │
│  changed my perspective  │
│  in ONE day.             │
│                          │
│  YOUR TURN 👇            │
│  [QR CODE]               │
│  iamblessedaf.com/r/CODE │
│                          │
│  Tag 3 friends.          │
│  Win $1,111 THIS Friday. │
│                          │
│  @IamBlessedAF           │
│  #BlessedBestFriend      │
└──────────────────────────┘
```

**Variant B — "The Challenge Card"**
```
┌──────────────────────────┐
│  🏆 $1,111 GIVEAWAY 🏆   │
│                          │
│  I nominated YOU for the │
│  11:11 Gratitude         │
│  Challenge!              │
│                          │
│  → 3 days               │
│  → 1 text at 11:11      │
│  → FREE wristband        │
│  → Shot at $1,111 CASH   │
│                          │
│  Join here 👇            │
│  [QR CODE]               │
│  iamblessedaf.com/r/CODE │
│                          │
│  @IamBlessedAF           │
│  #BlessedBestFriend      │
└──────────────────────────┘
```

**Image specs:** 1080×1920px (Instagram Story ratio 9:16), PNG, <2MB

### Files to Modify/Create

- **New:** `src/components/viral/StoryTemplateGenerator.tsx` — Canvas-based image generator
- **New:** `src/components/viral/InstagramStoryShareFlow.tsx` — Full share + verify + giveaway entry flow
- **New:** `src/components/viral/GiveawayEntryModal.tsx` — "I posted!" confirmation + screenshot upload
- **Modify:** `src/components/challenge/GratitudeSetupFlow.tsx` — Insert story prompt after Day 1 completion
- **Modify:** `src/pages/ChallengeThanks.tsx` — Add story CTA as primary action
- **Reuse:** `html2canvas` dependency (already installed)
- **Reuse:** `src/hooks/useBcWallet.ts` — `earnCoins()` for +200 BC reward
- **Reuse:** `src/components/portal/PortalReferralHub.tsx` — Referral link generation pattern

---

## STAGE 3: Referral Link + Friend Tagging System (Maximum Invites, Minimum Friction)

### The Multi-Channel Invite Explosion

After posting their Instagram Story, users are guided through a **rapid-fire invite sequence** — each channel takes ONE TAP:

```
"Your story is live! Now let's get your friends in:"

[1] 📲 WhatsApp Blast (one-tap)
    → Opens WhatsApp with pre-filled message + referral link
    → User picks multiple contacts from native picker
    → Message: "I just started the 11:11 Gratitude Challenge and I nominated YOU!
      Free wristband + shot at $1,111 cash this Friday 🙏
      Join here: [LINK]"

[2] 💬 SMS Blast (one-tap)
    → Opens native SMS with pre-filled body
    → sms: link with body pre-populated
    → Same message as WhatsApp

[3] 📋 Copy Magic Message (one-tap)
    → Copies perfectly formatted message to clipboard
    → "Paste this in any DM, group chat, or comment!"
    → Toast: "Copied! Paste it anywhere"

[4] 📸 Share Story to More Platforms
    → Instagram (already done)
    → WhatsApp Status
    → Facebook Story
    → TikTok
    → Each uses the same generated story image
```

### Reducing Friction to Near-Zero

**Current friction (K=0.09):**
- User types phone numbers manually
- Limited to 3 friends
- No pre-filled messages
- No contact picker
- Single channel (WhatsApp only)

**New friction level (target K>2):**

| Action | Taps Required | Time |
|---|---|---|
| Post Instagram Story | 2 taps (share + confirm) | 10 seconds |
| WhatsApp blast to 5+ friends | 2 taps (open + select contacts) | 15 seconds |
| SMS blast | 1 tap (opens native SMS) | 5 seconds |
| Copy link for DMs | 1 tap | 2 seconds |
| TOTAL to invite via ALL channels | ~6 taps | ~30 seconds |

### The "Tag 3 Friends" Instagram Mechanic

When users tag friends IN their Instagram Story:
- Each tagged friend gets a notification from Instagram itself (free push notification!)
- Tagged friends see the story with the referral link/QR code
- This creates a SECOND invite channel that's completely free and native to Instagram

**Incentive structure for tagging:**
- Tag 1 friend: +50 BC
- Tag 3 friends: +100 BC each (300 total)
- Tag 5+ friends: +150 BC each + "Super Nominator" badge

### Contact Picker Implementation

**Component:** `ContactPicker.tsx`
**API:** `navigator.contacts.select(['name', 'tel'], { multiple: true })`
- Android Chrome: Full support — native contact picker
- iOS Safari: NOT supported — fallback to `sms:` link with pre-filled body
- Desktop: Fallback to manual entry (current behavior)

**Key change:** Remove the 3-friend cap in `InviteFriendsModal.tsx` line 61. Change from `friends.length < 3` to `friends.length < 20`.

### Files to Modify/Create

- **Modify:** `src/components/portal/InviteFriendsModal.tsx` — Remove 3-friend cap, add contact picker, multi-channel
- **New:** `src/components/viral/ContactPicker.tsx` — Web Contact Picker API + fallbacks
- **New:** `src/components/viral/MultiChannelInviteFlow.tsx` — WhatsApp + SMS + Copy + Social all in one screen
- **Modify:** `supabase/functions/send-whatsapp-invite/index.ts` — Remove `friends.length > 3` cap at line 67

---

## STAGE 4: K-Factor > 2.0 in Week 1 — The Math

### Current State
```
I (invites per user) = 2.0
C (conversion rate) = 4.5%
K = 2.0 × 0.045 = 0.09
```

### Week 1 Target State (with this plan)
```
INVITE CHANNELS (I):
  Instagram Story views → taps on link:     avg 3.0 new visitors per user
  Instagram Story friend tags:              avg 3.0 tagged (notification sent)
  WhatsApp blast (contact picker):          avg 5.0 contacts messaged
  SMS blast:                                avg 2.0 contacts messaged
  Link copied + pasted in DMs/groups:       avg 2.0 people reached
  ─────────────────────────────────────────
  TOTAL reach per user (I):                 ~15 people

CONVERSION (C):
  Base conversion (generic link click):     8%
  Personalized landing ("X nominated you"): +5% → 13%
  Two-sided incentive (free wristband):     +3% → 16%
  $1,111 giveaway urgency:                  +4% → 20%
  Social proof counter (X/2,222 joined):    +2% → 22%
  ─────────────────────────────────────────
  TOTAL conversion rate (C):                ~22%

K = 15 × 0.22 = 3.3 (VIRAL — exponential growth)
```

### Why $1,111 Giveaway Changes Everything

Without giveaway:
```
I = 8 (some people share, most don't bother)
C = 12% (decent but no urgency)
K = 8 × 0.12 = 0.96 (close but sub-viral)
```

WITH $1,111 giveaway:
```
I = 15 (EVERYONE shares because $1,111 is at stake)
C = 22% (urgency + scarcity + collective goal of 2,222)
K = 15 × 0.22 = 3.3 (EXPLOSIVE)
```

The giveaway adds ~+7 to I (more people share when cash is on the line) and ~+10% to C (landing page with "$1,111 CASH this Friday" converts dramatically better).

### The 2,222 Threshold Creates a Collective Viral Push

This is the secret weapon. The threshold creates:
1. **Collective urgency**: "We need 2,222 people or the cash becomes store credit"
2. **Progress bar psychology**: Watching 847 → 1,203 → 1,891 → 2,100 creates momentum
3. **Social obligation**: "I shared, now YOU need to share so we hit 2,222"
4. **FOMO at the finish line**: When counter hits 2,000+ everyone pushes harder
5. **Built-in content**: "We're at 1,500! Help us get to 2,222!" becomes shareable content itself

### Growth Projection (Week 1)

```
Day 0 (Launch):    Seed = 100 users (organic + creator posts)
Day 1 (K=3.3):    100 × 3.3 = 330 new → 430 total
Day 2 (K=2.8):    330 × 2.8 = 924 new → 1,354 total  (K drops as early adopters exhaust close network)
Day 3 (K=2.2):    924 × 2.2 = 2,033 new → 3,387 total  ← 2,222 THRESHOLD CROSSED
Day 4 (K=1.8):    2,033 × 1.8 = 3,659 new → 7,046 total
Day 5 (K=1.5):    Natural decay but Friday LIVE event creates spike
Day 6 (Fri LIVE):  Winner announced → content wave → K spikes back to 2.0+
Day 7 (Sat):       Winner story content → new users discover challenge

WEEK 1 TOTAL: ~7,000-10,000 users (conservative with K decay)
```

---

## STAGE 5: Friday LIVE Selection Mechanics (@IamBlessedAF)

### The Friday LIVE Event — Week 1

**Pre-show (Thursday night):**
- @IamBlessedAF posts: "Tomorrow we pick our $1,111 winner LIVE! Have you posted your story?"
- Push notification to all challenge participants: "Tune in tomorrow at [TIME] for the LIVE drawing!"
- Email blast: "The $1,111 Blessed Best Friend winner is chosen tomorrow"

**The LIVE Show Format (15-20 minutes):**
```
SEGMENT 1 (3 min): "Welcome! Let's check the numbers"
  → Show the 2,222 counter (if crossed: "WE DID IT! Cash prizes are LIVE!")
  → If not crossed: "We're at X — but store credit is still amazing!"
  → Build excitement

SEGMENT 2 (5 min): "This week's top stories"
  → Read 5-7 of the best "Blessed Best Friend" stories submitted
  → These are the stories people wrote about how a friend helped them
  → Each story = content + emotion + keeps viewers watching

SEGMENT 3 (3 min): "The moment you've been waiting for..."
  → Dramatic countdown
  → Announce the winner by showing their Instagram Story
  → Read their winning story aloud
  → "And [Winner's Name]... your Blessed Best Friend [Friend's Name]...
     you BOTH just won $1,111 CASH!"

SEGMENT 4 (3 min): "Next week starts NOW"
  → "Want to be next week's winner?"
  → Show QR code / link on screen
  → "Post your Day 1 story RIGHT NOW"
  → "Tag @IamBlessedAF and use #BlessedBestFriend"
  → This LIVE moment becomes a weekly content tentpole

SEGMENT 5 (2 min): Winner video call (if possible)
  → FaceTime/call the winner live
  → Their reaction = pure viral content
  → Clip this moment for reels/TikTok
```

**Post-show content cascade:**
- Clip winner announcement → Instagram Reel → TikTok → YouTube Shorts
- Winner's reaction clip → Stories + Reels
- "Next week could be YOU" CTA on every clip
- Winner testimonial post (with their permission)
- Each piece of content has the referral link / QR code

### Why the LIVE Format Maximizes Virality

1. **Instagram favors LIVE** — Algorithm boosts live content visibility
2. **Real-time engagement** — Comments, reactions, shares during live
3. **FOMO** — People tune in because they might be the winner
4. **Content machine** — One LIVE session produces 5-10 clips for the week
5. **Trust builder** — Seeing real winners getting real money = credibility
6. **Recurring habit** — "Tune in every Friday" creates weekly engagement loop
7. **Winner becomes ambassador** — $1,111 winner naturally shares their win story

---

## STAGE 6: Fallback — $1,111 → Store Credit if < 2,222

### How the Fallback Works

```
IF challenge_participants < 2,222 by Friday LIVE:

  INSTEAD OF: $1,111 cash + $1,111 cash
  AWARD:      $1,111 store credit + $1,111 store credit

  Store credit valid at: iamblessedaf.com online store
  Can purchase: Premium wristbands, merch, bundles, gift packs
  Expiry: 90 days from award date
  Transferable: YES (winner can gift to friend)
```

### Why Store Credit Is Still a Strong Incentive

- $1,111 in store credit is HUGE — entire wardrobe of merch
- Winner still gets featured on LIVE (social currency)
- Creates urgency to hit 2,222: "Help us unlock CASH instead of credit!"
- Store credit drives product sales + inventory movement
- Cost to business: ~$300-400 in COGS (vs $1,111 cash) — much cheaper for the business

### The Escalation Mechanic

```
Week 1: < 2,222 → $1,111 store credit each
Week 2: IF we cross 2,222 → $1,111 CASH each (and every week after)
Week 3+: As long as weekly participants ≥ 2,222, cash prizes continue

BONUS: If we cross 11,111 total participants in any month:
  → That month's final Friday = $11,111 GRAND PRIZE (winner only)
  → This creates an escalating incentive structure
```

### Implementation

- **Modify:** `GiveawayCounterBanner.tsx` — Show "CASH UNLOCKED!" vs "STORE CREDIT" based on threshold
- **New DB column:** `giveaway_weeks.threshold_met` (boolean) — Set by cron checking participant count
- **New DB column:** `giveaway_weeks.prize_type` — 'cash' or 'store_credit'
- **Edge function:** `weekly-giveaway-cron` checks participant count Monday+Wednesday+Friday, updates prize_type
- **Reuse:** `bc_store_items` table — Store credit can be implemented as a high-value BC redemption or separate Stripe coupon

---

## STAGE 7: Full Implementation Timeline + Tech Requirements

### Week 0 (Pre-Launch Build) — 5 Days

**Day 1-2: Database + Backend**
```
□ Create giveaway_weeks table
□ Create giveaway_entries table
□ Add participant_count tracking (materialized view or counter)
□ Create weekly-giveaway-cron edge function
□ Add "story_posted" boolean to creator_profiles
□ Create indexes for giveaway queries
```

**Day 3-4: Story Template Generator + Share Flow**
```
□ Build StoryTemplateGenerator.tsx (html2canvas → 1080×1920 image)
□ Build InstagramStoryShareFlow.tsx (share API + download fallback)
□ Build GiveawayEntryModal.tsx (confirmation + screenshot upload)
□ Build GiveawayCounterBanner.tsx (live counter → 2,222)
□ Build MultiChannelInviteFlow.tsx (WhatsApp + SMS + Copy in one screen)
□ Build ContactPicker.tsx (Web Contacts API + fallbacks)
```

**Day 5: Integration + Wiring**
```
□ Wire story flow into ChallengeThanks.tsx (after Day 1 completion)
□ Wire giveaway counter banner into all pages (Offer22, Portal, ChallengeThanks)
□ Remove 3-friend cap (InviteFriendsModal.tsx line 61)
□ Remove 3-friend cap (send-whatsapp-invite line 67)
□ Add +200 BC reward for story posting (useBcWallet.earnCoins)
□ Add giveaway entry logging
□ Personalize referral landing: "X nominated you + $1,111 giveaway this Friday"
```

### Week 1 (Launch Week)

**Monday — Launch Day:**
- @IamBlessedAF announces the $1,111 Blessed Best Friend Giveaway
- First 100 seed users go through the new flow
- Counter starts: "0 / 2,222 — Help unlock the $1,111 CASH prize!"
- All seed users get the Instagram Story template + invite flow

**Tuesday-Thursday — Growth Phase:**
- Monitor K-factor daily via existing KFactorDashboard
- Repost best user stories from @IamBlessedAF (amplification)
- Daily counter update posts: "We're at X / 2,222!"
- A/B test story templates (Variant A vs B)

**Friday — LIVE Selection:**
- First LIVE event on @IamBlessedAF
- Select winner from story entries
- Announce if cash or store credit (based on 2,222 threshold)
- Clip content for next week's promotion

### Budget Breakdown

| Item | Cost (Weekly) | Notes |
|---|---|---|
| Cash prize (if threshold met) | $2,222 | Winner + friend |
| Store credit (if threshold NOT met) | ~$400-600 COGS | Product cost only |
| Instagram Story template design | $0 | Auto-generated via code |
| Twilio SMS/WhatsApp | ~$50-100 | Pay per message |
| Supabase (existing plan) | $0 incremental | Already running |
| **TOTAL (cash scenario)** | **~$2,372** | |
| **TOTAL (credit scenario)** | **~$550-700** | |

**ROI Math:**
- Week 1 target: 7,000+ users
- Cost per user (cash): $2,372 / 7,000 = $0.34/user
- Cost per user (credit): $650 / 7,000 = $0.09/user
- Compare to: Facebook ads = $2-5/user acquisition

### Critical Files Summary

**New Files to Create:**
1. `src/components/viral/StoryTemplateGenerator.tsx`
2. `src/components/viral/InstagramStoryShareFlow.tsx`
3. `src/components/viral/GiveawayEntryModal.tsx`
4. `src/components/viral/GiveawayCounterBanner.tsx`
5. `src/components/viral/MultiChannelInviteFlow.tsx`
6. `src/components/viral/ContactPicker.tsx`
7. `supabase/functions/weekly-giveaway-cron/index.ts`
8. New migration: `giveaway_weeks` + `giveaway_entries` tables

**Existing Files to Modify:**
1. `src/components/portal/InviteFriendsModal.tsx` — Remove 3-friend cap (line 61)
2. `supabase/functions/send-whatsapp-invite/index.ts` — Remove 3-friend cap (line 67)
3. `src/pages/ChallengeThanks.tsx` — Insert story share flow as primary CTA
4. `src/pages/Offer22.tsx` — Add giveaway banner + personalized referral landing
5. `src/components/portal/PortalLeaderboard.tsx` — Add weekly stories tab
6. `src/hooks/useGamificationStats.ts` — Add story_posted reward tier

**Existing Infrastructure to Reuse:**
- `html2canvas` — Already a dependency, use for story image generation
- `useBcWallet.ts` + `bc_earn_coins()` — Reward +200 BC for story posts
- `creator_profiles.referral_code` — Unique referral links per user
- `PortalReferralHub.tsx` — Sharing pattern (WhatsApp, SMS, copy, social)
- `portal_activity` table — Log giveaway events
- `KFactorDashboard.tsx` — Monitor K-factor during launch week

### Verification / Testing Plan

1. **Story Template:** Generate a test image, verify 1080×1920px, verify QR code scans to correct referral link
2. **Share Flow:** Test Instagram share API on Android + iOS, verify download fallback works
3. **Giveaway Entry:** Submit test entry, verify it appears in giveaway_entries table
4. **Counter:** Insert test participants, verify counter updates in real-time
5. **Threshold Logic:** Test with count < 2,222 (should show "store credit") and ≥ 2,222 (should show "CASH")
6. **Friend Cap Removal:** Verify users can invite >3 friends via WhatsApp
7. **Contact Picker:** Test on Android Chrome (native picker) + iOS Safari (SMS fallback)
8. **BC Rewards:** Verify +200 BC credited after story confirmation
9. **Full Flow E2E:** Sign up → Day 1 → Story → Share → Friend clicks link → Friend signs up → Verify K-factor dashboard updates
10. **Giveaway Cron:** Trigger manually, verify weekly reset + participant count + prize_type calculation

---

## KEY INSIGHT: Why This Achieves K > 2 in Week 1

The current system asks users to do something FOR the brand (invite friends).
This system asks users to do something FOR THEMSELVES ($1,111) that ALSO grows the brand.

The $1,111 giveaway transforms every single touchpoint:
- **Why post a story?** → Because my story could win me $1,111
- **Why tag friends?** → Because more friends = more chances + we need 2,222 for cash
- **Why share on WhatsApp?** → Because my friend gets a free wristband + their own shot at $1,111
- **Why share via SMS?** → Because reaching more people = higher visibility for my entry
- **Why do it on Day 1?** → Because this week's giveaway closes Friday

Every friction point is overcome by a $1,111 incentive.
Every sharing channel is activated by a two-sided reward.
Every user becomes a marketer because it's in THEIR interest.

That's how K goes from 0.09 to 3.3.
