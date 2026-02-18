/**
 * Roadmap optimization items per phase.
 * ✅ = Already implemented (tracked in roadmap_completions table).
 * Items below are REMAINING — duplicates removed, prompts refined.
 */

export interface NextStepItem {
  title: string;
  detail: string;
  priority: "critical" | "high" | "medium" | "low";
  /** Pre-built execution prompt for the Ethereum Master Developer agent */
  prompt?: string;
}

export const PHASE_NEXT_STEPS: Record<string, NextStepItem[]> = {
  foundation: [
    // ✅ DONE: Add database connection pooling & query monitoring
    // ✅ DONE: Implement row-level audit logging
    // ✅ DONE: Add rate limiting on auth endpoints
    // ✅ DONE: Implement session refresh token rotation
    // ✅ DONE: Add database index optimization pass
    {
      title: "Add automated database backup verification",
      detail: "Scheduled edge function to verify backup integrity and send alerts on failure",
      priority: "high",
      prompt: "Create a 'verify-db-backup' edge function that runs on a cron schedule. It should check the last backup timestamp via Supabase management API, compare against a 24h threshold, and send an alert via Resend email if backup is stale. Add a 'system_health_checks' table to log results. Include RLS for admin-only access.",
    },
    {
      title: "Create database migration rollback playbook",
      detail: "Document rollback procedures for every migration with tested restore scripts",
      priority: "medium",
      prompt: "Create a new admin tab 'Migration Playbook' under Operations that displays all applied migrations from a 'migration_playbook' table (columns: migration_name, rollback_sql, tested_at, risk_level). Include an 'Add Entry' form for admins. Use AdminSectionDashboard for KPIs showing total migrations, untested count, high-risk count.",
    },
    {
      title: "Add multi-factor authentication (TOTP)",
      detail: "Optional 2FA for admin accounts using time-based one-time passwords",
      priority: "medium",
      prompt: "Implement TOTP-based 2FA for admin users. Add a 'user_mfa_settings' table (user_id, totp_secret_encrypted, is_enabled, backup_codes). Create a setup flow in PortalAccountSettings with QR code generation. Gate admin routes behind MFA verification when enabled. Use the existing OTP verification pattern from useAuth.",
    },
    {
      title: "Create health-check edge function",
      detail: "Endpoint returning DB connectivity, auth service status, edge function uptime",
      priority: "medium",
      prompt: "Create a 'health-check' edge function that tests: 1) DB connectivity via a simple SELECT 1, 2) Auth service by checking auth.users count, 3) Returns JSON with status, latency_ms, and timestamp. Add a HealthCheckWidget component to the admin Dashboard tab showing green/yellow/red status indicators with auto-refresh every 60s.",
    },
    {
      title: "Implement soft-delete pattern across all tables",
      detail: "Add deleted_at column instead of hard deletes for data recovery capability",
      priority: "medium",
      prompt: "Add a 'deleted_at' timestamptz column (nullable, default null) to tables: creator_profiles, board_cards, short_links, clip_submissions. Create a DB function 'soft_delete(table_name, row_id)' that sets deleted_at=now(). Update all existing RLS SELECT policies to include 'AND deleted_at IS NULL'. Add an admin 'Trash' view showing soft-deleted records with restore capability.",
    },
    {
      title: "Add end-to-end encryption for sensitive user data",
      detail: "Encrypt PII fields at rest using Vault integration for GDPR compliance",
      priority: "low",
      prompt: "Implement PII encryption for phone numbers and emails in challenge_participants and creator_profiles. Create a 'encrypt-pii' edge function that encrypts/decrypts using AES-256 with a ENCRYPTION_KEY secret. Add a migration to create encrypted_phone and encrypted_email columns. Update edge functions that read these fields to decrypt on access.",
    },
  ],
  funnel: [
    // ✅ DONE: Add exit-intent detection with dynamic downsell
    // ✅ DONE: Build revenue dashboard with LTV tracking
    {
      title: "Implement cart abandonment recovery flow",
      detail: "Track checkout starts without completion, trigger SMS/email recovery within 1hr",
      priority: "critical",
      prompt: "Add a 'checkout_intents' table (id, user_id, email, tier, stripe_session_id, started_at, completed_at, recovered_at). Log checkout starts in useStripeCheckout. Create a 'recover-abandoned-carts' edge function that runs hourly: finds intents older than 1hr without completion, sends recovery email via Resend with a direct checkout link. Integrate with existing orders table to mark as recovered.",
    },
    {
      title: "Add order bump on checkout page",
      detail: "Pre-checked add-on item (wristband pack) on Stripe checkout for AOV boost",
      priority: "high",
      prompt: "Modify the create-checkout edge function to accept an optional 'addons' array parameter. When present, add additional line_items to the Stripe session. Update the ShopifyStyleCart component to show a pre-checked 'Add 3 Wristbands (+$22)' checkbox before the checkout button. Track addon acceptance rate in campaign_config.",
    },
    {
      title: "Create post-purchase upsell sequence",
      detail: "Automated 3-email sequence with ascending offers after initial purchase",
      priority: "high",
      prompt: "Create a 'post-purchase-sequence' edge function triggered by stripe-webhook after order completion. It should schedule 3 emails via Resend: Day 1 = thank you + wristband upsell, Day 3 = challenge invite, Day 7 = tier upgrade offer. Use the existing followup_sequences table pattern with sequence_type='post_purchase'.",
    },
    {
      title: "Add payment plan options ($111 → 3x$40)",
      detail: "Stripe installment payments to reduce friction on higher-tier offers",
      priority: "high",
      prompt: "Update the create-checkout edge function to support a 'payment_plan' parameter. When set, create a Stripe subscription with 3 monthly payments instead of a one-time charge. Add a toggle in the offer pages (Offer111, Offer444) showing 'Pay in 3 installments' with the monthly price calculated. Update orders table to track payment_type='installment'.",
    },
    {
      title: "Implement dynamic pricing based on engagement",
      detail: "Adjust displayed price/discount based on time spent, pages viewed, return visits",
      priority: "medium",
      prompt: "Create a useEngagementPricing hook that calculates a discount tier based on: pages visited (from sessionStorage), time on site, return visit count (localStorage). Map to discount tiers: 0-10% based on engagement score. Display the personalized discount on offer pages using the existing DiscountBanner component. Log pricing events to exit_intent_events for analytics.",
    },
    {
      title: "Add scarcity engine with real inventory tracking",
      detail: "Real-time stock counts synced with Stripe, auto-close offers at threshold",
      priority: "high",
      prompt: "Create an 'inventory' table (tier, total_stock, reserved, sold, is_open). Update stripe-webhook to decrement stock on purchase. Create a useInventory hook that reads real-time stock. Replace the simulated useUrgencyStock hook with real data. Add an admin Inventory tab showing stock levels per tier with manual adjustment capability.",
    },
    {
      title: "Create offer page heatmap tracking",
      detail: "Track click coordinates, scroll depth, hover time for CRO optimization",
      priority: "medium",
      prompt: "Create a useHeatmapTracking hook that captures: scroll depth milestones (25/50/75/100%), click coordinates (x,y,element), and section visibility time. Store events in a 'page_heatmap_events' table (page, event_type, data jsonb, session_id). Add an admin 'Heatmap' sub-tab under Analytics showing scroll depth distribution and click density per offer page.",
    },
    {
      title: "Add multi-currency support",
      detail: "Auto-detect visitor geo, display prices in local currency with Stripe multi-currency",
      priority: "medium",
      prompt: "Create a useCurrency hook that detects visitor locale via navigator.language, maps to currency code (USD/EUR/GBP/CAD/AUD), and fetches exchange rates from a cached 'exchange_rates' campaign_config key. Update offer page price displays to show local currency. Pass the currency to create-checkout edge function for Stripe multi-currency sessions.",
    },
    {
      title: "Implement coupon/promo code system",
      detail: "Stripe coupon integration with unique codes, usage limits, expiry dates",
      priority: "low",
      prompt: "Create a 'promo_codes' table (code, stripe_coupon_id, discount_percent, max_uses, current_uses, expires_at, is_active). Add a promo code input field to ShopifyStyleCart. Update create-checkout to apply the Stripe coupon when a valid code is provided. Add admin PromoCodesTab for CRUD management with usage analytics.",
    },
  ],
  virality: [
    // ✅ DONE: Add social proof notification stream
    // ✅ DONE: Build WhatsApp/Telegram share deeplinks
    // ✅ DONE: Build creator analytics dashboard
    {
      title: "Build referral attribution funnel",
      detail: "Track referral → visit → signup → purchase chain with attribution to source creator",
      priority: "critical",
      prompt: "Create a 'referral_events' table (id, referral_code, event_type enum('visit','signup','purchase'), user_id, order_id, created_at). Update the short-link edge function to log 'visit' events. Update auth callback to log 'signup'. Update stripe-webhook to log 'purchase'. Build an admin ReferralFunnelChart component showing conversion rates at each stage using Recharts Sankey diagram.",
    },
    {
      title: "Add viral coefficient (K-factor) real-time dashboard",
      detail: "Live K-factor calculation: invites sent × conversion rate, with daily trend chart",
      priority: "critical",
      prompt: "Create a KFactorDashboard component for the admin Analytics section. Calculate K-factor from existing data: K = (avg invites per user from blessings table) × (conversion rate from referral_code in orders). Show daily K-factor trend using an area chart. Add KPI cards for: current K, 7-day avg, invites/user, conversion rate. Use the existing AdminSectionDashboard pattern.",
    },
    {
      title: "Implement tiered referral rewards",
      detail: "Escalating BC coin rewards: 1st ref = 50BC, 5th = 100BC, 10th = 500BC",
      priority: "high",
      prompt: "Update the existing BC wallet system to award escalating rewards on referral milestones. Create a 'check-referral-milestone' function in the stripe-webhook that counts completed referrals and awards BC coins: 1st=50, 5th=100, 10th=500, 25th=1000. Use the existing bc_transactions and bc_wallets tables. Add a ReferralMilestones component to the Portal showing progress toward next tier.",
    },
    {
      title: "Create shareable blessing cards (OG images)",
      detail: "Dynamic OG image generation with recipient name, sender message, impact count",
      priority: "high",
      prompt: "Create a 'generate-blessing-card' edge function that accepts recipient_name, sender_name, and impact_count. Use Canvas API (or SVG template) to generate a 1200x630 OG image with the blessing data overlaid on the brand template. Store in Supabase storage 'blessing-cards' bucket. Return the public URL for sharing. Update the SendBlessingForm to show a preview and share button.",
    },
    {
      title: "Add referral leaderboard with weekly prizes",
      detail: "Public leaderboard of top referrers with automated weekly BC coin prize pool",
      priority: "medium",
      prompt: "Enhance the existing PortalLeaderboard to add a 'Weekly Referral Champions' tab. Query orders grouped by referral_code for the current week. Display top 10 with referral count and revenue generated. Create a 'distribute-weekly-prizes' edge function that runs Monday: awards 1st=1000BC, 2nd=500BC, 3rd=250BC. Log prizes in bc_transactions.",
    },
    {
      title: "Implement UTM auto-tagging on all outbound links",
      detail: "Auto-append utm_source/medium/campaign to every share link generated",
      priority: "medium",
      prompt: "Update the PortalSocialShare, ViralShareNudge, and InviteFriendsModal components to auto-append UTM parameters to all generated share links. Use the pattern: utm_source={platform}, utm_medium=referral, utm_campaign={user_referral_code}. Centralize UTM logic in a buildShareUrl utility function in src/utils/shareLinks.ts.",
    },
    {
      title: "Create UGC submission & approval pipeline",
      detail: "Users upload gratitude videos/photos, admin approve, display on impact page",
      priority: "medium",
      prompt: "Create a 'ugc_submissions' table (id, user_id, media_url, caption, status enum('pending','approved','rejected'), created_at). Add a Supabase storage bucket 'ugc-media'. Create a UGCSubmitForm in the Portal. Add an admin UGCReviewTab showing pending submissions with approve/reject buttons. Display approved UGC on the Impact page in a masonry grid.",
    },
    {
      title: "Add QR code generation for physical sharing",
      detail: "Generate printable QR codes linking to personalized blessing pages",
      priority: "low",
      prompt: "Add a QR code generator to the PortalReferralHub. Use a lightweight QR library to generate SVG QR codes encoding the user's referral link. Add a 'Download QR' button that exports a print-ready PNG. Include the user's referral code text below the QR code. No new tables needed — uses existing referral_code from creator_profiles.",
    },
  ],
  gamification: [
    // ✅ DONE: Implement achievement progress notifications
    {
      title: "Add streak protection items in BC store",
      detail: "Purchasable streak shields that prevent streak loss on missed days",
      priority: "high",
      prompt: "Add a 'streak_shield' item to bc_store_items (cost: 100BC, reward_type: 'streak_shield'). Update the portal-daily-login edge function: before resetting streak, check if user has an active shield in bc_redemptions (status='active'). If yes, consume the shield (set status='used') and preserve streak. Add a shield icon indicator next to streak display in PortalDashboard.",
    },
    {
      title: "Implement level-up system with XP curve",
      detail: "Logarithmic XP curve with 50 levels, each unlocking new store items/badges",
      priority: "critical",
      prompt: "Add 'xp' and 'level' columns to bc_wallets. Create a calculateLevel utility with logarithmic XP curve: level = floor(sqrt(xp/100)). Award XP for actions: bless=10, purchase=50, streak_day=5, referral=25. Add a LevelProgressBar component to PortalDashboard showing current XP, level, and progress to next. Create a 'level_rewards' table mapping levels to unlocked store items.",
    },
    {
      title: "Create daily challenge rotation system",
      detail: "Random daily missions from pool of 30+: share, bless, refer, purchase, streak",
      priority: "high",
      prompt: "Create a 'daily_challenges' table (id, title, description, action_type, target_count, reward_bc, is_active). Seed 30 challenges. Create a useDailyChallenge hook that picks 3 random challenges per day (seeded by date). Track completion in a 'user_daily_challenges' table (user_id, challenge_id, date, completed_at). Award BC on completion. Display in PortalMissions.",
    },
    {
      title: "Add animated loot box mechanic",
      detail: "Temu-style animated reveal with rarity tiers: common/rare/epic/legendary rewards",
      priority: "high",
      prompt: "Create a LootBoxReveal component with Framer Motion animations: shake → open → particles → reward reveal. Define rarity tiers in a 'loot_box_rewards' table (tier, reward_type, reward_value, probability). Users earn loot boxes at milestones (every 5 levels, 7-day streak). Create an 'open-loot-box' edge function that rolls rewards based on probability weights. Display in Portal.",
    },
    {
      title: "Build social comparison features",
      detail: "Compare your stats vs friends, 'You're in top 10%' motivational nudges",
      priority: "medium",
      prompt: "Create a ComparisonCard component that shows the user's rank percentile across: streak days, blessings sent, BC balance, level. Calculate percentiles from aggregate queries on bc_wallets and creator_profiles. Show motivational messages: 'You're in the top 15% of blessers!' Display on PortalDashboard sidebar.",
    },
    {
      title: "Implement BC coin staking/interest system",
      detail: "Lock BC coins for 7/30/90 days for bonus interest — retention mechanic",
      priority: "medium",
      prompt: "Create a 'bc_stakes' table (user_id, amount, lock_days, interest_rate, staked_at, matures_at, status). Interest rates: 7d=5%, 30d=15%, 90d=40%. Add a StakingPanel to PortalRewardsStore. Create a 'process-stake-maturity' edge function that runs daily: finds matured stakes, credits interest to bc_wallets, logs in bc_transactions.",
    },
    {
      title: "Create seasonal event framework",
      detail: "Holiday-themed challenges, limited-time store items, seasonal leaderboards",
      priority: "medium",
      prompt: "Create a 'seasonal_events' table (id, name, theme, start_date, end_date, bonus_multiplier, special_rewards jsonb). Add a SeasonalBanner component that shows active events with countdown. Multiply XP/BC earnings by bonus_multiplier during events. Add seasonal items to bc_store_items with event_id foreign key. Admin can manage events in a new SeasonalEventsTab.",
    },
    {
      title: "Build guild/team system",
      detail: "Users form teams, compete on collective blessings, shared rewards pool",
      priority: "low",
      prompt: "Create 'guilds' (id, name, leader_id, created_at) and 'guild_members' (guild_id, user_id, joined_at) tables. Add guild creation and join flows in the Portal. Create a GuildLeaderboard showing collective blessings and BC earned per guild. Award bonus BC to all members when guild hits milestones. Add guild chat using existing portal_activity pattern.",
    },
    {
      title: "Add animated avatar/profile customization",
      detail: "Spend BC coins on avatar frames, backgrounds, badges displayed on leaderboard",
      priority: "low",
      prompt: "Add 'avatar_frame' and 'profile_background' columns to creator_profiles. Create avatar customization items in bc_store_items (category='cosmetic'). Build an AvatarCustomizer component in PortalAccountSettings showing owned items with equip/unequip. Update PortalLeaderboard to render equipped frames around user avatars.",
    },
    {
      title: "Add referral tree visualization",
      detail: "Visual tree showing downstream referrals, earnings per branch, network growth over time",
      priority: "medium",
      prompt: "Create a ReferralTree component using a recursive tree layout. Query creator_profiles joined by referred_by_code to build the tree structure. Show each node with: name, join date, orders count, downstream referrals. Use Framer Motion for expand/collapse animations. Display in PortalReferralHub as a new 'Network Map' tab.",
    },
  ],
  ops: [
    // ✅ DONE: Implement feature flag system
    // ✅ DONE: Add board analytics — cycle time & throughput
    // ✅ DONE: Build deployment changelog generator
    {
      title: "Add automated regression testing suite",
      detail: "Vitest tests for all edge functions, critical user flows, DB triggers",
      priority: "critical",
      prompt: "Create comprehensive Vitest tests in src/test/ for: 1) useStripeCheckout hook mocking Supabase, 2) useAuth hook testing login/logout flows, 3) useBcWallet hook testing earn/spend, 4) RevenueLtvDashboard component rendering with mock data. Add Deno tests for edge functions: create-checkout, stripe-webhook, portal-daily-login. Target 80% coverage on critical paths.",
    },
    {
      title: "Implement CI/CD pipeline with preview deploys",
      detail: "Auto-deploy branches to preview URLs, run tests before merge",
      priority: "high",
      prompt: "This is handled by Lovable's built-in deployment system. Mark as done — Lovable Cloud provides automatic preview deploys and CI/CD. Focus instead on ensuring all edge functions have proper error handling and tests.",
    },
    {
      title: "Add error monitoring & alerting (Sentry-style)",
      detail: "Capture frontend errors, edge function failures, alert via webhook",
      priority: "critical",
      prompt: "Create a global ErrorBoundary component wrapping the app that catches React errors and logs them to a 'frontend_errors' table (component, error_message, stack_trace, url, user_agent, created_at). Add an ErrorMonitoringTab in admin showing recent errors grouped by component with frequency charts. Create a 'check-error-spikes' edge function that alerts via Resend when error rate exceeds threshold.",
    },
    {
      title: "Create performance monitoring dashboard",
      detail: "Core Web Vitals tracking, edge function latency, DB query performance",
      priority: "high",
      prompt: "Extend the existing DbMonitoringPanel to include: 1) Edge function latency from query_performance_logs, 2) A PerformanceVitals component using web-vitals API to track LCP/FID/CLS and store in a 'web_vitals' table. Show all metrics in the admin Dashboard with sparkline trends. Reuse AdminSectionDashboard for consistent layout.",
    },
    {
      title: "Add automated card creation from error logs",
      detail: "Edge function failures auto-create board cards in Errors column",
      priority: "medium",
      prompt: "Create a DB trigger on the 'frontend_errors' table (once created) that auto-inserts a board_card into an 'Errors' column when error count for a component exceeds 5 in 1 hour. Use the existing board_cards/board_columns tables. Include error details in the card description. Deduplicate by checking existing open error cards for the same component.",
    },
    {
      title: "Create load testing framework",
      detail: "Simulate concurrent users on critical paths: checkout, SMS, link redirect",
      priority: "medium",
      prompt: "Create a 'load-test' edge function (admin-only) that simulates N concurrent requests to specified endpoints. Accept params: target_function, concurrency, iterations. Return results: avg_latency, p95, p99, error_rate. Add a LoadTestingTab in admin with a form to configure and run tests, displaying results in a table with historical comparison.",
    },
    {
      title: "Implement automated security scanning",
      detail: "Scheduled RLS policy audit, exposed endpoint check, dependency CVE scan",
      priority: "medium",
      prompt: "Create a 'security-audit' edge function that: 1) Queries pg_policies to verify all tables have RLS enabled, 2) Checks for tables without any policies, 3) Verifies all edge functions require authentication where expected. Store results in a 'security_audit_results' table. Add a SecurityAuditTab in admin showing last scan results with pass/fail indicators and remediation suggestions.",
    },
    {
      title: "Build runbook library for incident response",
      detail: "Documented procedures for DB issues, auth failures, payment errors",
      priority: "low",
      prompt: "Create an admin RunbookTab that displays incident response procedures from a 'runbooks' table (title, category, steps jsonb, severity, last_updated). Seed with runbooks for: DB connection failure, Stripe webhook failure, SMS delivery failure, Auth service outage, High error rate. Include copy-pasteable commands and escalation contacts. Admin can edit inline.",
    },
  ],
  analytics: [
    // ✅ DONE: Add revenue analytics with MRR/ARR tracking (via RevenueLtvDashboard)
    {
      title: "Build real-time conversion funnel visualization",
      detail: "Sankey diagram showing user flow: landing → challenge → offer → purchase → share",
      priority: "critical",
      prompt: "Create a ConversionFunnelSankey component using Recharts Sankey chart. Pull data from: link_clicks (visits), challenge_participants (signups), orders (purchases), blessings (shares). Calculate conversion rates between each stage. Display in admin Dashboard > Funnel Engine tab alongside the existing FunnelMap. Add date range filter for period comparison.",
    },
    {
      title: "Add cohort analysis for retention tracking",
      detail: "Weekly cohorts tracking 7/14/30/60-day retention rates",
      priority: "critical",
      prompt: "Create a CohortAnalysis component that groups users by signup week (from creator_profiles.created_at). Track retention by checking portal_activity or bc_transactions for activity in subsequent weeks. Display as a cohort heatmap table (rows=cohorts, columns=weeks, cells=retention %). Use color coding: green >50%, yellow 25-50%, red <25%. Add to admin Analytics section.",
    },
    {
      title: "Implement event-driven attribution model",
      detail: "Multi-touch attribution: first-click, last-click, linear, time-decay models",
      priority: "high",
      prompt: "Create an AttributionDashboard component. Use link_clicks with utm_source/medium/campaign to build attribution chains per order. Implement 4 models: first-click, last-click, linear (equal credit), time-decay (recent gets more). Display revenue attributed per channel/source under each model. Add model selector dropdown. Integrate into admin Analytics.",
    },
    {
      title: "Create automated A/B test significance calculator",
      detail: "Chi-square test with p-value, confidence interval, minimum sample size alerts",
      priority: "high",
      prompt: "Create an ABTestResultsPanel component. Pull data from exit_intent_events where event_type starts with 'ab_'. Calculate: sample size per variant, conversion rate, chi-square statistic, p-value, confidence interval. Show 'Significant' or 'Need more data' badges. Calculate minimum sample size needed for significance. Display in admin Analytics alongside existing A/B test data from useABTest.",
    },
    {
      title: "Build custom analytics event pipeline",
      detail: "Client-side event queue → edge function → analytics table with batching",
      priority: "medium",
      prompt: "Create a useAnalyticsQueue hook that batches client-side events (page_view, click, scroll, interaction) in memory and flushes to a 'track-events' edge function every 30s or on page unload. The edge function batch-inserts into an 'analytics_events' table (event_name, properties jsonb, session_id, user_id, page, created_at). Add RLS: insert for all, select for admin only.",
    },
    {
      title: "Add geo-heatmap for visitor distribution",
      detail: "World map visualization of visitor origins with click-to-drill-down by country",
      priority: "medium",
      prompt: "Create a GeoHeatmap component using the existing DonationMap pattern but powered by real data from link_clicks.country. Aggregate clicks by country, display as a bubble map with size proportional to click count. Add click-to-filter: clicking a country filters all admin dashboards to that geo. Display in admin Analytics section.",
    },
    {
      title: "Implement predictive analytics for churn",
      detail: "ML model scoring users on churn probability based on engagement patterns",
      priority: "medium",
      prompt: "Create a 'predict-churn' edge function using Lovable AI (gemini-2.5-flash) that analyzes per-user signals: days since last login, streak trend, BC transaction frequency, blessing frequency. Score 0-100 churn risk. Store in a 'churn_predictions' table. Create a ChurnRiskPanel in admin showing high-risk users with recommended re-engagement actions.",
    },
    {
      title: "Create automated weekly report generator",
      detail: "Edge function generates weekly KPI report, posts to board as card",
      priority: "medium",
      prompt: "Create a 'weekly-report' edge function that aggregates: new users, orders, revenue, blessings, K-factor, top referrer, top clipper for the past week. Format as markdown. Auto-create a board_card in a 'Reports' column with the summary. Send the report via Resend to admin email. Schedule to run every Monday.",
    },
    {
      title: "Add page speed & performance scoring",
      detail: "Track LCP, FID, CLS per page with alerting on regression",
      priority: "high",
      prompt: "Install web-vitals library. Create a useWebVitals hook that captures LCP, FID, CLS, TTFB on each page load and sends to a 'web_vitals' table via edge function. Create a PerformanceScorecard component in admin showing per-page scores with traffic-light indicators. Alert when any metric regresses >20% vs 7-day average.",
    },
    {
      title: "Build data export API for external BI tools",
      detail: "REST endpoint for bulk data export to Google Sheets, Looker, etc.",
      priority: "low",
      prompt: "Create a 'data-export' edge function (admin-only, requires auth) that accepts table name and date range params. Returns CSV or JSON data for: orders, creator_profiles, clip_submissions, link_clicks. Rate limit to 10 requests/hour. Add an ExportHub component in admin with preset export templates and download buttons. Extend existing ExportCsvButton pattern.",
    },
  ],
  comms: [
    // ✅ DONE: Add SMS opt-in/opt-out compliance system
    // ✅ DONE: Implement webhook retry logic with dead-letter queue
    {
      title: "Build Soap Opera email sequence engine",
      detail: "5-email drip: backstory → conflict → epiphany → transformation → call-to-action",
      priority: "critical",
      prompt: "Create an 'email_sequences' table (id, name, trigger_event, emails jsonb[{day, subject, body_template, cta_url}]). Seed with the Soap Opera Sequence: Day 0=backstory, Day 1=conflict, Day 3=epiphany, Day 5=transformation, Day 7=CTA. Create a 'process-email-sequence' edge function that runs hourly, finds due emails, sends via Resend with merge fields ({name}, {referral_code}, {impact_count}). Track opens/clicks in sms_audit_log (rename to 'message_audit_log' or add channel='email').",
    },
    {
      title: "Build message personalization engine",
      detail: "Dynamic merge fields: {name}, {streak}, {impact_count}, {next_reward}",
      priority: "high",
      prompt: "Create a resolveMessageTemplate utility function that accepts a template string and user_id. Fetches user data from creator_profiles, bc_wallets, and aggregates. Replaces merge fields: {name}, {streak}, {bc_balance}, {blessings_count}, {referral_count}, {next_reward}, {impact_count}. Integrate into send-sms, send-welcome-email, and all communication edge functions. Centralize in a shared 'template-resolver' module.",
    },
    {
      title: "Implement send-time optimization",
      detail: "Track per-user optimal send times, schedule messages for peak engagement",
      priority: "medium",
      prompt: "Add 'preferred_send_hour' column to creator_profiles. Create a 'calculate-send-times' edge function that analyzes sms_audit_log: find hours with highest open/response rates per user. Update preferred_send_hour weekly. Modify send-scheduled-messages to respect user's preferred time ±1 hour. Default to 9am local time for new users.",
    },
    {
      title: "Create multi-channel campaign builder",
      detail: "Design campaigns spanning SMS + email + push with unified tracking",
      priority: "high",
      prompt: "Create a 'campaigns' table (id, name, channels[], audience_filter jsonb, messages jsonb[], status, scheduled_at, sent_at). Build a CampaignBuilder component in admin Messaging tab with: audience selector (by tier, activity, location), channel picker (SMS/email), message editor with merge fields, schedule picker. Create a 'send-campaign' edge function that dispatches via appropriate channels. Track delivery in sms_audit_log.",
    },
    {
      title: "Build message A/B testing framework",
      detail: "Test subject lines, body copy, send times with statistical significance",
      priority: "medium",
      prompt: "Extend the campaign system: add variant_a and variant_b message fields to campaigns. The send-campaign function randomly assigns recipients 50/50. Track opens/clicks per variant. Create a CampaignABResults component showing winner with statistical significance. Auto-declare winner after reaching significance threshold (95% confidence).",
    },
    {
      title: "Add unsubscribe analytics dashboard",
      detail: "Track unsubscribe rates by channel, campaign, send frequency correlation",
      priority: "low",
      prompt: "Create an UnsubscribeAnalytics component in admin Messaging showing: unsubscribe rate per campaign, rate trend over time, correlation between send frequency and unsubscribes, top unsubscribe reasons. Pull data from sms_audit_log where status='unsubscribed' and creator_profiles.digest_opted_out. Display as charts using AdminSectionDashboard.",
    },
    {
      title: "Add email open/click tracking",
      detail: "Pixel tracking for opens, link wrapping for clicks, per-campaign engagement metrics",
      priority: "high",
      prompt: "Create a 'track-email-event' edge function that handles: 1) Pixel tracking (returns 1x1 transparent GIF, logs 'open' event), 2) Click redirect (logs 'click' event, redirects to actual URL). Update all Resend email sends to inject tracking pixel and wrap links. Store events in sms_audit_log with channel='email'. Show email engagement metrics in admin Messaging.",
    },
    {
      title: "Build notification preference center",
      detail: "User-facing settings page to control email, SMS, and push notification preferences per category",
      priority: "medium",
      prompt: "Add notification_preferences jsonb column to creator_profiles (default: all enabled). Create a NotificationPreferences component in PortalAccountSettings with toggles for: challenge reminders, weekly digest, promotional offers, referral alerts, achievement notifications — per channel (email/SMS). Update all send functions to check preferences before sending.",
    },
    {
      title: "Add transactional email templates library",
      detail: "Branded templates for order confirmation, shipping, tier unlock, password reset",
      priority: "medium",
      prompt: "Create reusable HTML email templates as edge function modules: order-confirmation, tier-unlock, welcome, weekly-digest, blessing-received. Use a shared buildEmailHtml utility with brand colors, logo, footer. Store template versions in campaign_config for admin editing. Update all Resend sends to use templates instead of inline HTML.",
    },
  ],
  conversion: [
    // ✅ DONE: Build dynamic social proof banner
    // ✅ DONE: Implement sticky mobile CTA with scroll progress
    // ✅ DONE: Build FAQ accordion with objection handling
    // ✅ DONE: Build price anchoring visualization
    {
      title: "Implement personalized CTA copy based on entry source",
      detail: "UTM-aware CTA text: organic → 'Join Free', paid → 'Claim Your Discount'",
      priority: "critical",
      prompt: "Create a usePersonalizedCTA hook that reads UTM params from URL and returns customized CTA text and subtext. Map: utm_source=google → 'Claim Your Exclusive Discount', organic → 'Join the Movement Free', utm_source=tiktok → 'Get Your Creator Pack', referral → 'Accept {name}'s Gift'. Apply to all offer page CTA buttons. Track CTA variant shown in exit_intent_events.",
    },
    {
      title: "Add above-fold video testimonial",
      detail: "Auto-playing muted video testimonial with captions, above primary CTA",
      priority: "high",
      prompt: "Create a VideoTestimonial component that auto-plays a muted video with subtitle overlays. Accept props: videoSrc, captions (array of {time, text}), posterImage. Use IntersectionObserver to play/pause on visibility. Add to Offer111 and Offer444 pages above the first CTA block. Use the existing testimonial video assets or reference a placeholder.",
    },
    {
      title: "Create urgency engine with real deadlines",
      detail: "Server-side countdown tied to actual inventory/time limits, not fake scarcity",
      priority: "high",
      prompt: "Replace the client-side OfferTimer with a server-driven countdown. Store deadline timestamps in campaign_config (key: 'offer_{tier}_deadline'). Create a useServerCountdown hook that fetches the deadline from campaign_config and counts down. When expired, show 'Offer Closed' state. Admin can set/extend deadlines from the Campaign Config tab. Reuse existing OfferTimer UI.",
    },
    {
      title: "Implement progressive form disclosure",
      detail: "Multi-step forms revealing one field at a time to reduce perceived friction",
      priority: "high",
      prompt: "Create a ProgressiveForm component that renders form fields one at a time with smooth Framer Motion transitions. Props: steps (array of field configs), onComplete. Each step shows one input with 'Continue' button. Progress bar at top. Use in the Challenge signup flow and Expert leads form. Track step completion rates in exit_intent_events for funnel analysis.",
    },
    {
      title: "Add trust badge & security seal system",
      detail: "SSL badge, money-back guarantee seal, 'Verified by Stripe' positioned near CTA",
      priority: "medium",
      prompt: "Create a TrustBadges component displaying: Stripe secure checkout badge, 30-day money-back guarantee, SSL encrypted, meals donated counter. Position below every CTA button on offer pages. Add configurable badges via campaign_config. Use subtle, non-intrusive styling with semantic tokens. Mobile-responsive — stack vertically on small screens.",
    },
    {
      title: "Add before/after transformation section",
      detail: "Visual before/after showing life without vs with gratitude practice",
      priority: "medium",
      prompt: "Create a BeforeAfterSection component with a side-by-side comparison layout. Left column (faded/gray): 'Without Practice' showing pain points. Right column (vibrant/primary): 'With Practice' showing transformation outcomes. Use Framer Motion to animate the reveal on scroll. Add to offer pages between social proof and CTA sections.",
    },
    {
      title: "Create comparison table vs alternatives",
      detail: "Feature matrix: IamBlessedAF vs journaling apps vs therapy vs nothing",
      priority: "medium",
      prompt: "Create a ComparisonTable component showing a feature matrix. Columns: IamBlessedAF, Journaling Apps, Therapy, Nothing. Rows: Daily Practice, Community, Accountability, Scientific Backing, Cost, Impact/Meals, Referral Rewards. IamBlessedAF column highlighted with checkmarks. Use the existing table UI components. Add to Offer111 page.",
    },
  ],
  impact: [
    // ✅ DONE: Add real-time donation feed with animations
    // ✅ DONE: Build interactive impact calculator
    // ✅ DONE: Implement milestone celebration system
    {
      title: "Create partner NGO integration dashboard",
      detail: "API integration with food bank partners for verified meal delivery tracking",
      priority: "high",
      prompt: "Create an 'ngo_partners' table (id, name, api_endpoint, api_key_encrypted, meals_delivered, last_sync_at). Create a 'sync-ngo-data' edge function that fetches delivery data from partner APIs. Build an NGOPartnersDashboard in admin Impact section showing: meals delivered per partner, sync status, delivery verification rate. Initially seed with mock data; real API integration when partners onboard.",
    },
    {
      title: "Add impact certificate/badge system",
      detail: "Shareable certificates: 'You helped feed 50 families' with unique verification ID",
      priority: "high",
      prompt: "Create an 'impact_certificates' table (id, user_id, milestone, meals_count, certificate_url, verification_code, created_at). Auto-generate certificates at milestones (10, 50, 100, 500 meals). Create a 'generate-certificate' edge function that builds an SVG certificate with user name, meal count, and unique verification code. Store in Supabase storage. Add a CertificateGallery to Portal.",
    },
    {
      title: "Build community wall of gratitude",
      detail: "Public wall displaying anonymous gratitude messages from challenge participants",
      priority: "medium",
      prompt: "Create a 'gratitude_wall_posts' table (id, message, is_anonymous, user_id, approved, created_at). Add a 'Post to Wall' button in the Challenge completion flow. Create a GratitudeWall component for the Impact page showing approved posts in a masonry layout with auto-scroll animation. Admin can moderate posts from an existing admin tab. RLS: anyone can read approved, users can insert own.",
    },
    {
      title: "Add impact storytelling section with recipient stories",
      detail: "Real stories from meal recipients with photos, connecting donors to impact",
      priority: "high",
      prompt: "Create an 'impact_stories' table (id, title, story_text, photo_url, location, meals_received, created_at, is_featured). Build an ImpactStories component for the Impact page showing featured stories in a carousel. Admin can add/edit stories via a new sub-tab. Use motion animations for story transitions. Include 'Share This Story' button linking to blessing page.",
    },
    {
      title: "Create annual impact report generator",
      detail: "Auto-generated yearly report: total impact, top contributors, growth charts",
      priority: "medium",
      prompt: "Create a 'generate-annual-report' edge function that aggregates yearly data: total meals, total orders, top 10 referrers, monthly growth chart data, blessing count, community size. Generate a formatted HTML report. Create an AnnualReport page component that renders the report with charts. Add a 'Generate Report' button in admin Impact section.",
    },
    {
      title: "Build corporate sponsorship matching engine",
      detail: "2x/3x match campaigns where sponsors double community donations",
      priority: "medium",
      prompt: "Create a 'match_campaigns' table (id, sponsor_name, multiplier, budget_cents, spent_cents, start_date, end_date, is_active). During active campaigns, multiply meal counts by the multiplier. Create a MatchCampaignBanner component showing: sponsor logo, multiplier, remaining budget. Display on offer pages during active campaigns. Admin manages campaigns in Impact section.",
    },
    {
      title: "Add environmental impact tracking",
      detail: "Calculate and display carbon offset, food waste reduction from gratitude meals",
      priority: "low",
      prompt: "Add calculated environmental metrics to the Impact page: 1 meal = 2.5kg CO2 saved, 0.5kg food waste diverted. Create an EnvironmentalImpact component showing total CO2 saved, equivalent trees planted, food waste prevented with animated counters. Pull meal count from get_total_meals_donated(). No new tables needed — pure calculation from existing data.",
    },
    {
      title: "Implement community voting for next impact project",
      detail: "BC coin-weighted voting on where next donation batch goes",
      priority: "low",
      prompt: "Create 'impact_proposals' (id, title, description, target_meals, votes_weighted) and 'impact_votes' (user_id, proposal_id, bc_weight, created_at) tables. Users spend BC coins as vote weight. Create a VotingBooth component in Portal. Top-voted proposal gets funded when voting period ends. Create a 'tally-votes' edge function that runs at period end.",
    },
  ],
};
