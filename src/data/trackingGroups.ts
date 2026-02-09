/**
 * Trackable engagement groups — actions we can measure
 * to incentivize sharing, buying, content creation, and brand building.
 */

export interface TrackingItem {
  title: string;
  detail: string;
  priority: "critical" | "high" | "medium" | "low";
}

export interface TrackingGroup {
  id: string;
  icon: string;
  title: string;
  items: TrackingItem[];
}

export const TRACKING_GROUPS: TrackingGroup[] = [
  {
    id: "sharing",
    icon: "📤",
    title: "📤 Sharing & Referrals",
    items: [
      { title: "SMS share taps (per user, per offer)", detail: "Track every SMS share button tap with user_id, offer_tier, timestamp", priority: "critical" },
      { title: "WhatsApp share taps", detail: "Track WhatsApp deep-link opens with attribution to source page", priority: "critical" },
      { title: "Referral link copies", detail: "Count clipboard copies of /r/:code links per user per session", priority: "critical" },
      { title: "Referral link clicks (inbound)", detail: "Track visits arriving via /r/:code with full UTM attribution", priority: "critical" },
      { title: "Referral → signup conversion", detail: "Measure how many referral visitors complete signup", priority: "high" },
      { title: "Referral → purchase conversion", detail: "Full-funnel attribution: ref click → signup → purchase with revenue", priority: "high" },
      { title: "Social platform breakdown", detail: "Track which platform (SMS, WhatsApp, IG, TikTok, X) drives most shares", priority: "high" },
      { title: "Viral K-factor (daily/weekly)", detail: "Compute invites_sent × conversion_rate to track organic growth coefficient", priority: "critical" },
      { title: "Share-to-purchase time", detail: "Measure latency between share event and resulting purchase", priority: "medium" },
      { title: "Multi-hop referral chains", detail: "Track depth of referral chains: A → B → C → D with attribution", priority: "medium" },
      { title: "QR code scans", detail: "Track scans of printed/shared QR codes linking to blessing pages", priority: "low" },
    ],
  },
  {
    id: "purchases",
    icon: "💰",
    title: "💰 Purchases & Revenue",
    items: [
      { title: "Checkout starts per tier", detail: "Track Stripe checkout session creation by offer tier ($22/$111/$444/$1111/$4444)", priority: "critical" },
      { title: "Checkout completions per tier", detail: "Track successful payment by tier with revenue attribution", priority: "critical" },
      { title: "Cart abandonment rate", detail: "Checkout start without completion within 1hr window", priority: "critical" },
      { title: "Average order value (AOV)", detail: "Track AOV trend daily/weekly with upsell contribution", priority: "high" },
      { title: "Upsell accept/decline rates", detail: "Per-upsell conversion: wristband pack, monthly membership, higher tiers", priority: "high" },
      { title: "Downsell conversion", detail: "Track exit-intent downsell modal → $11/mo subscription conversion", priority: "high" },
      { title: "Repeat purchase rate", detail: "Users who purchase more than one tier or reorder", priority: "high" },
      { title: "Customer LTV by acquisition source", detail: "LTV segmented by UTM source, referral vs organic vs paid", priority: "critical" },
      { title: "Time from first visit to purchase", detail: "Measure consideration window across all funnels", priority: "medium" },
      { title: "Coupon/promo code usage", detail: "Track redemption rates, revenue impact, and attribution per code", priority: "medium" },
      { title: "Subscription churn rate ($11/mo)", detail: "Monthly churn tracking with cancellation reason tagging", priority: "high" },
    ],
  },
  {
    id: "content-creation",
    icon: "🎬",
    title: "🎬 User-Generated Content (UGC)",
    items: [
      { title: "AI video contest submissions", detail: "Track submissions to /make-2500-with-1-ai-clip with creator profile linkage", priority: "high" },
      { title: "#IamBlessedAF hashtag usage", detail: "Monitor hashtag mentions across TikTok, IG, X via social API or manual log", priority: "high" },
      { title: "UGC photo/video uploads", detail: "Track gratitude media uploads through portal with approval pipeline", priority: "high" },
      { title: "Testimonial submissions", detail: "Track written testimonials submitted via portal or post-purchase", priority: "medium" },
      { title: "Unboxing video shares", detail: "Track users sharing unboxing content with trackable links", priority: "medium" },
      { title: "Story/reel mentions", detail: "Track Instagram/TikTok story mentions with brand tag", priority: "medium" },
      { title: "Creator profile completions", detail: "Track creators who fill out full profile: display name, socials, avatar", priority: "medium" },
      { title: "Content approval rate", detail: "Measure % of submitted UGC that passes admin review", priority: "low" },
      { title: "Content reach/impressions (reported)", detail: "Creator-reported view counts on their UGC posts", priority: "low" },
      { title: "Brand asset downloads", detail: "Track downloads of official logos, templates, brand guidelines", priority: "low" },
      { title: "Community challenge participation", detail: "Track entries into themed weekly/monthly gratitude challenges", priority: "medium" },
    ],
  },
  {
    id: "engagement",
    icon: "🔥",
    title: "🔥 Daily Engagement & Retention",
    items: [
      { title: "Daily active users (DAU)", detail: "Unique users with any tracked action per day", priority: "critical" },
      { title: "Portal daily login streaks", detail: "Track streak_days, streak_breaks, longest_streak per user", priority: "critical" },
      { title: "Spin wheel plays", detail: "Track spins per user, prizes won, BC earned from wheel", priority: "high" },
      { title: "Mission completions", detail: "Track which portal missions are completed, completion rate per mission type", priority: "high" },
      { title: "Blessing confirmations", detail: "Track /confirm/:token visits and successful confirmations", priority: "high" },
      { title: "Challenge completion rate (3-day)", detail: "% of challenge_participants who complete all 3 days", priority: "critical" },
      { title: "Session duration", detail: "Average time on site per visit, segmented by entry page", priority: "medium" },
      { title: "Pages per session", detail: "Navigation depth tracking across funnel pages", priority: "medium" },
      { title: "Return visit frequency", detail: "Days between visits per user cohort", priority: "medium" },
      { title: "Push notification opt-in rate", detail: "Track web push permission grants vs dismissals", priority: "medium" },
      { title: "Leaderboard views & interactions", detail: "Track how often users check leaderboard and their rank position changes", priority: "low" },
    ],
  },
  {
    id: "bc-economy",
    icon: "🪙",
    title: "🪙 BC Coin Economy",
    items: [
      { title: "BC earned per action type", detail: "Breakdown of BC earnings: login bonus, missions, referrals, purchases, shares", priority: "critical" },
      { title: "BC spent per store category", detail: "Track redemptions by category: discounts, exclusive items, upgrades", priority: "high" },
      { title: "BC store conversion rate", detail: "Views → redemptions per store item", priority: "high" },
      { title: "Average BC balance per user tier", detail: "Segment balances by purchase tier for economy health monitoring", priority: "medium" },
      { title: "BC velocity (earn/spend ratio)", detail: "Track how fast BC flows through the economy to prevent inflation", priority: "high" },
      { title: "Top BC earners leaderboard engagement", detail: "Track engagement difference between top 10% earners vs rest", priority: "medium" },
      { title: "Streak shield usage", detail: "Track purchases and uses of streak protection items", priority: "low" },
      { title: "BC-driven re-engagement", detail: "Track users returning specifically to spend accumulated BC", priority: "medium" },
      { title: "Achievement badge unlock rate", detail: "% of users unlocking each badge, time to unlock distribution", priority: "medium" },
      { title: "BC gifting between users", detail: "Track peer-to-peer BC transfers if implemented", priority: "low" },
      { title: "Economy health score (composite)", detail: "Combined metric: earn rate, spend rate, active wallets, store utilization", priority: "high" },
    ],
  },
  {
    id: "brand-building",
    icon: "👑",
    title: "👑 Brand Building & Community",
    items: [
      { title: "Ambassador signups", detail: "Track creator_profiles created per day/week with referral attribution", priority: "critical" },
      { title: "Ambassador active rate", detail: "% of ambassadors with ≥1 referral click in last 7 days", priority: "high" },
      { title: "Community wall submissions", detail: "Gratitude messages posted to public wall of gratitude", priority: "medium" },
      { title: "Impact milestone celebrations", detail: "Track user engagement spikes around 1K/5K/10K meal milestones", priority: "medium" },
      { title: "Impact page visits & time-on-page", detail: "Track /impact engagement depth and scroll completion", priority: "medium" },
      { title: "Email/SMS open & click rates", detail: "Track open rates, click-through rates per campaign type", priority: "high" },
      { title: "NPS score collection", detail: "Post-purchase Net Promoter Score surveys with trend tracking", priority: "medium" },
      { title: "Brand mention sentiment", detail: "Track positive/negative/neutral mentions across social platforms", priority: "low" },
      { title: "Merch photo shares (wearing shirts)", detail: "Track users sharing photos wearing Friend Shirts with branded hashtags", priority: "high" },
      { title: "Corporate sponsor inquiries", detail: "Track inbound interest from potential corporate matching partners", priority: "low" },
      { title: "Roadmap feedback submissions", detail: "Track community voting and feedback on upcoming features", priority: "low" },
    ],
  },
];
