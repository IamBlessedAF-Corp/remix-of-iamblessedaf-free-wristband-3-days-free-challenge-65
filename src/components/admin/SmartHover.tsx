import { ReactNode } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

/**
 * Centralized knowledge base for KPIs, column names, abbreviations,
 * and any label used across dashboards.
 */
const KNOWLEDGE: Record<string, string> = {
  // ─── KPI / Stat Card labels ───
  "total links": "Total number of short links created in the system. Counts all entries in the short_links table regardless of status.",
  "total clicks": "Sum of all click events recorded across every short link. Each redirect through a short link increments this count.",
  "active links": "Links currently enabled (is_active = true) and not expired. These are the links that will redirect when visited.",
  "period clicks": "Clicks recorded during the currently selected date range filter. Useful for comparing traffic across time periods.",
  "active clippers": "Creators who have submitted at least one clip. Counted as distinct user_ids in clip_submissions.",
  "total clips": "All clip submissions in the system (pending + verified + rejected). Raw count from clip_submissions table.",
  "total views": "Aggregate view_count across all verified clips. Updated periodically via the YouTube/TikTok verification edge function.",
  "creators": "Total registered creator profiles. Each user who completes signup gets a row in creator_profiles.",
  "orders": "Completed Stripe checkout sessions stored in the orders table. Includes all tiers and currencies.",
  "budget status": "Current state of the active budget cycle: pending_approval, active, or closed. Controls whether payouts can be processed.",
  "total paid": "Sum of all total_cents from clipper_payouts with status = 'paid'. Represents actual money disbursed to creators.",
  "weekly budget": "Maximum amount (in USD) that can be paid out to clippers in a single week. Set in the active budget_cycle.",
  "monthly budget": "Maximum monthly payout cap across all segments. Acts as a hard ceiling on clipper spending.",
  "segment spend": "Sum of spent_cents across all budget_segment_cycles for the active cycle. Shows how much of the segmented budget has been used.",
  "budget used": "Percentage of the weekly budget already consumed by segment payouts. Formula: (segment_spend / weekly_budget) × 100.",
  "segments": "Number of active budget segments. Each segment groups clippers by rules (e.g., tier, platform) with its own spending limits.",
  "avg views/clip": "Total views divided by total verified clips. Indicates average content performance across the clipper network.",
  "this week": "Clips submitted in the current calendar week (Monday–Sunday). Sourced from clip_submissions.submitted_at.",
  "pending": "Clips awaiting admin review (status = 'pending'). These need manual or automated verification before earning payouts.",
  "total clippers": "Distinct users who have submitted at least one clip. Same as 'Active Clippers'.",

  // ─── Revenue Intelligence ───
  "total paid out": "Cumulative USD paid to all clippers. Calculated from clipper_payouts where status = 'paid'.",
  "budget remaining": "Weekly budget minus segment spend. If negative, payouts are frozen until the next cycle.",

  // ─── Database column names ───
  "id": "Primary key (UUID v4). Auto-generated unique identifier for each row.",
  "user_id": "References the authenticated user in auth.users. Links this record to a specific account.",
  "created_at": "Timestamp when this row was first inserted. Defaults to now() and never changes.",
  "updated_at": "Timestamp of the last modification. Updated automatically via trigger on each UPDATE.",
  "email": "User's email address. Used for authentication, notifications, and Stripe customer matching.",
  "display_name": "User-chosen public name shown in leaderboards, portals, and social shares.",
  "referral_code": "Unique code assigned to each creator for tracking referrals. Format: alphanumeric, case-insensitive.",
  "referred_by_code": "The referral_code of the user who invited this creator. Used for affiliate credit attribution.",
  "referred_by_user_id": "UUID of the referring user. Resolved from referred_by_code at signup time.",
  "current_tier": "Affiliate tier level: starter, silver, gold, or diamond. Determines credit multiplier and perks.",
  "credit_amount": "Total store credit (in USD) available to this affiliate based on their tier.",
  "wristbands_distributed": "Number of wristbands this affiliate has given out. Drives tier progression thresholds.",
  "tier_unlocked_at": "Timestamp when the user last advanced to a new affiliate tier. Null if still at starter.",
  "blessings_confirmed": "Count of blessings where the recipient confirmed receipt. Drives gamification streaks.",
  "digest_opted_out": "Whether the user has unsubscribed from the weekly digest email.",
  "instagram_handle": "User's Instagram username (without @). Used for social proof and clipper verification.",
  "tiktok_handle": "User's TikTok username. Required for clip submission verification.",
  "twitter_handle": "User's X/Twitter handle. Optional social profile.",
  "congrats_completed": "Identifier of the last congratulations flow completed by this user.",
  "clip_url": "Direct URL to the submitted clip on TikTok, YouTube Shorts, or Instagram Reels.",
  "platform": "Social platform where the clip was posted: tiktok, youtube, or instagram.",
  "status": "Current state of this record. Context-dependent (e.g., pending/verified/rejected for clips, active/closed for cycles).",
  "view_count": "Total views as reported by the platform API. Updated during verification sweeps.",
  "baseline_view_count": "View count captured at submission time. Used to calculate net_views = view_count − baseline.",
  "net_views": "Views gained after submission. Formula: view_count − baseline_view_count. This is what earns money.",
  "earnings_cents": "Amount earned (in cents) for this specific clip based on net_views × RPM.",
  "verified_at": "Timestamp when the clip passed automated verification checks (hashtags, link-in-bio, etc.).",
  "submitted_at": "Timestamp when the creator submitted this clip for review.",
  "is_activated": "Whether the clip has passed the activation gate (minimum views threshold before earning begins).",
  "payout_week": "ISO week key (e.g., '2026-W07') this clip's earnings are attributed to.",
  "ctr": "Click-through rate from clip to landing page. Calculated from link_clicks / views.",
  "day1_post_rate": "Percentage of views that occurred within 24 hours of posting. Indicates viral velocity.",
  "reg_rate": "Registration rate: signups attributed to this clip / total clicks from this clip.",
  "click_count": "Number of times this short link has been clicked. Incremented in real-time by the redirect edge function.",
  "short_code": "The unique slug after the domain (e.g., 'abc123' in go/abc123). Case-sensitive.",
  "destination_url": "The full URL that the short link redirects to when clicked.",
  "is_active": "Whether this record is currently live/enabled. Inactive records are soft-deleted.",
  "source_page": "The page or context where this record originated (e.g., 'offer-111', 'challenge').",
  "campaign": "Campaign identifier for UTM grouping. Links clicks to specific marketing initiatives.",
  "expires_at": "Timestamp after which this record becomes invalid. Used for time-limited offers and OTP codes.",
  "amount_cents": "Transaction amount in the smallest currency unit (cents for USD, yen for JPY).",
  "currency": "ISO 4217 currency code (e.g., 'usd', 'eur'). Defaults to 'usd'.",
  "tier": "Product tier purchased (e.g., 'blessed-af-111', 'blessed-af-444'). Maps to Stripe price IDs.",
  "stripe_session_id": "Stripe Checkout session ID. Used to reconcile payments and prevent duplicate orders.",
  "stripe_customer_id": "Stripe customer ID. Links orders to Stripe's customer record for invoicing.",
  "customer_email": "Email captured from Stripe checkout. Used for order confirmation and RLS matching.",
  "week_key": "ISO week identifier (e.g., '2026-W07'). Groups payouts and clips into weekly cycles.",
  "total_cents": "Total payout amount in cents, including base earnings + bonuses.",
  "base_earnings_cents": "Earnings from net views × RPM before any bonuses are applied.",
  "bonus_cents": "Additional payout from milestone bonuses (monthly views, streaks, etc.).",
  "clips_count": "Number of clips included in this payout period.",
  "total_net_views": "Aggregate net views across all clips in this payout period.",
  "frozen_at": "Timestamp when this payout was frozen for review. Payouts start frozen by default.",
  "paid_at": "Timestamp when the payout was actually sent to the creator's payment method.",
  "reviewed_at": "Timestamp when an admin reviewed and approved/rejected this payout.",
  "notes": "Free-text admin notes. Used for audit trail and communication.",
  "balance": "Current BlessedCoin balance available for redemption.",
  "lifetime_earned": "Total BlessedCoins ever earned by this user across all activities.",
  "lifetime_spent": "Total BlessedCoins spent in the rewards store.",
  "streak_days": "Current consecutive daily login streak. Resets if a day is missed.",
  "last_login_bonus_at": "Date of the last daily login bonus claim. Prevents double-claiming.",
  "cost_bc": "Price of this item/redemption in BlessedCoins.",
  "reward_type": "Type of reward: discount, physical, digital, or experience.",
  "reward_value": "JSON object with reward details (e.g., {discount_percent: 20, code: 'BLESSED20'}).",
  "sort_order": "Display order in lists. Lower numbers appear first.",
  "stock": "Remaining inventory for this item. Null means unlimited supply.",
  "phone": "User's phone number in E.164 format (e.g., +1234567890). Used for SMS/WhatsApp.",
  "friend_1_name": "Name of the first friend in the 3-Day Gratitude Challenge.",
  "friend_2_name": "Name of the second friend (optional).",
  "friend_3_name": "Name of the third friend (optional).",
  "challenge_status": "Current state of the challenge: pending, active, completed, or abandoned.",
  "current_streak": "Current consecutive days of completing the gratitude challenge.",
  "longest_streak": "All-time best consecutive completion streak for this participant.",
  "opted_in_sms": "Whether the participant agreed to receive SMS reminders during the challenge.",
  "confirmation_token": "UUID token sent to blessing recipients to confirm they received the message.",
  "confirmed_at": "Timestamp when the blessing recipient clicked the confirmation link.",
  "sender_id": "UUID of the user who sent this blessing.",
  "recipient_name": "Name of the person receiving the blessing (entered by sender).",
  "day_number": "Which day of the 3-day challenge this message belongs to (1, 2, or 3).",
  "message_body": "The actual gratitude message text that will be/was sent.",
  "scheduled_send_at": "When this message is scheduled to be sent via SMS.",
  "reminder_send_at": "When the reminder notification should fire before the scheduled send.",
  "message_sent_at": "Actual timestamp when the SMS was delivered by Twilio.",
  "twilio_message_sid": "Twilio's unique ID for the sent message. Used for delivery tracking.",
  "twilio_reminder_sid": "Twilio's unique ID for the reminder message.",
  "column_id": "References the Kanban board column this card belongs to.",
  "position": "Sort order within a column or list. Drag-and-drop updates this value.",
  "priority": "Task priority: low, medium, high, or critical.",
  "labels": "Array of tag strings for categorization (e.g., ['bug', 'frontend']).",
  "title": "Display title for this record.",
  "description": "Detailed description or body text.",
  "summary": "AI-generated or manual summary of the card content.",
  "master_prompt": "The original AI prompt used to generate this card's content.",
  "stage": "Pipeline stage (stage-1 through stage-5) for progressive task completion.",
  "staging_status": "Whether the card is in staging or production state.",
  "preview_link": "URL to preview the result of this task/card.",
  "screenshots": "Array of screenshot URLs attached to this card for visual documentation.",
  "logs": "Raw log output from automated processes related to this card.",
  "completed_at": "Timestamp when this card was moved to the 'Done' column.",
  "delegation_score": "Six Sigma delegation score (0–10). Higher = more suitable for delegation.",
  "ad_score": "Audience & Distribution score for content prioritization.",
  "r_score": "Revenue impact score.",
  "hu_score": "Human Urgency score.",
  "cc_score": "Customer-Centricity score.",
  "vs_score": "Value Stack score.",
  "key": "Unique configuration key (e.g., 'clipper_rpm', 'bonus_threshold').",
  "value": "The current value of this configuration setting. Stored as text, parsed by type.",
  "label": "Human-readable label shown in the admin UI.",
  "category": "Grouping category for organization (e.g., 'pricing', 'messaging', 'content').",
  "affected_areas": "Array of page/feature names impacted when this setting changes.",
  "updated_by": "UUID of the admin who last modified this record.",
  "allowed_sections": "Array of admin section identifiers this role can access.",
  "role": "User role: admin, super_admin, developer, clipper, or affiliate.",
  "prompt_summary": "One-line summary of the change made in this changelog entry.",
  "change_details": "Detailed markdown description of what changed and why.",
  "code_changes": "JSON array of file paths and diffs affected by this change.",
  "tags": "Classification tags for filtering changelog entries.",
  "event_type": "Type of event that triggered this activity record.",
  "display_text": "Human-readable text shown in the activity feed.",
  "icon_name": "Lucide icon name to display alongside this activity.",
  "sequence_type": "Type of followup sequence: friend_collection, nurture, or reactivation.",
  "step_number": "Which step in the sequence (1, 2, 3…). Controls message content and timing.",
  "scheduled_at": "When this followup step is scheduled to execute.",
  "sent_at": "When this followup was actually sent. Null if still pending.",
  "channel": "Delivery channel: sms, email, or whatsapp.",
  "participant_id": "References the challenge_participants record this message belongs to.",
  "clicked_at": "Timestamp of the click event on a short link.",
  "ip_hash": "SHA-256 hash of the visitor's IP. Used for unique click counting without storing PII.",
  "country": "Geo-resolved country from IP address. Used for geographic analytics.",
  "city": "Geo-resolved city from IP address.",
  "device_type": "Device category: mobile, desktop, or tablet. Parsed from user-agent.",
  "browser": "Browser name parsed from user-agent string (e.g., Chrome, Safari).",
  "os": "Operating system parsed from user-agent string (e.g., iOS, Android, Windows).",
  "utm_source": "UTM source parameter from the click URL. Tracks traffic origin.",
  "utm_medium": "UTM medium parameter. Tracks marketing channel (e.g., social, email, paid).",
  "utm_campaign": "UTM campaign parameter. Groups clicks by specific campaign.",
  "referrer": "HTTP referer header. Shows which page/site sent the visitor.",
  "user_agent": "Raw user-agent string from the browser. Used for device/browser detection.",
  "metadata": "JSON field for flexible additional data. Schema varies by context.",
  "link_id": "References the short_links record this click belongs to.",
  "messaging_service_sid": "Twilio Messaging Service SID used to send this message.",
  "template_key": "Identifier for the SMS template used (e.g., 'welcome', 'challenge_day1').",
  "traffic_type": "SMS traffic classification: transactional or marketing. Affects routing and compliance.",
  "error_message": "Error details if the SMS failed to deliver.",
  "twilio_sid": "Twilio's unique message SID for delivery tracking.",
  "recipient_phone": "Phone number of the SMS recipient in E.164 format.",
  "message": "The actual SMS text content that was sent.",
  "sms_recipient_name": "Display name of the SMS recipient.",
  "first_name": "User's first name. Captured during waitlist or signup.",
  "created_by": "UUID of the user/admin who created this record.",
  "clip_id": "Reference to the clip that was reposted.",
  "clip_title": "Title/caption of the reposted clip for display purposes.",
  "referral_link": "The user's personalized referral URL included in the repost.",
  "friend_name": "Name of the friend being sent a gratitude/TGF message.",
  "send_count": "Number of times a TGF message has been sent to this contact.",
  "last_sent_at": "Timestamp of the most recent message sent to this contact.",
  "code": "The OTP verification code (6 digits).",
  "attempts": "Number of failed verification attempts. Locked after 5.",
  "purpose": "What this OTP is for: login, challenge_verify, etc.",
  "otp_verified_at": "Timestamp when the OTP was successfully verified.",
  "niche": "Expert's area of expertise (e.g., fitness, finance, mindset).",
  "full_name": "Expert's full legal name as submitted in the lead form.",
  "framework_id": "Identifier for the expert content framework used to generate scripts.",
  "hero_profile": "JSON object with the expert's hero journey profile data.",
  "output": "Generated script text output from the AI framework.",
  "action": "Budget event action type (e.g., 'approve_cycle', 'adjust_limit').",
  "actor": "UUID of the admin who performed this budget action.",
  "before_state": "JSON snapshot of the state before this budget change.",
  "after_state": "JSON snapshot of the state after this budget change.",
  "impacted_segments": "Array of segment names affected by this budget change.",
  "estimated_impact_cents": "Projected financial impact of this budget change in cents.",
  "rollback_token": "UUID token that can be used to reverse this budget change.",
  "monthly_limit_cents": "Maximum monthly spend for this budget segment in cents.",
  "weekly_limit_cents": "Maximum weekly spend for this budget segment in cents.",
  "rules": "JSON rules defining which clippers belong to this segment.",
  "soft_throttle_config": "JSON config for gradual payout reduction when approaching limits.",
  "global_weekly_limit_cents": "System-wide weekly payout ceiling in cents.",
  "global_monthly_limit_cents": "System-wide monthly payout ceiling in cents.",
  "emergency_reserve_cents": "Reserved funds held back for unexpected obligations.",
  "max_payout_per_clip_cents": "Maximum earnings any single clip can generate.",
  "max_payout_per_clipper_week_cents": "Maximum weekly earnings per individual clipper.",
  "start_date": "Beginning of this budget cycle period.",
  "end_date": "End of this budget cycle period.",
  "approved_at": "Timestamp when this item was approved by an admin.",
  "approved_by": "UUID of the admin who approved this item.",
  "spent_cents": "Amount already spent in this budget segment cycle.",
  "projected_cents": "Forecasted total spend for this segment cycle based on current velocity.",
  "remaining_cents": "Budget remaining = limit − spent. Can go negative if overspent.",
  "segment_id": "References the budget_segments record.",
  "cycle_id": "References the budget_cycles record.",
  "assigned_at": "Timestamp when the clipper was assigned to this segment.",
  "assigned_by": "UUID of the admin who assigned the clipper to this segment.",
  "bonus_tier": "Monthly bonus tier achieved: none, bronze, silver, gold, or diamond.",
  "month_key": "Year-month key (e.g., '2026-02'). Groups bonuses by calendar month.",
  "monthly_views": "Total views accumulated this month across all clips.",
  "lifetime_views": "All-time total views for this clipper.",
  "monthly_bonus_cents": "Bonus amount earned in cents for this monthly period.",
  "paid": "Whether this bonus has been paid out yet.",
  "rpm_override": "Manually overridden RPM (Revenue Per Mille) for throttled clippers.",
  "is_active_throttle": "Whether the risk throttle is currently active for the system.",
  "consecutive_low_days": "Number of consecutive days with below-threshold quality metrics.",
  "consecutive_recovery_days": "Days of recovery after throttle activation.",
  "current_avg_ctr": "Rolling average click-through rate across all active clips.",
  "current_avg_reg_rate": "Rolling average registration rate from clip traffic.",
  "current_avg_day1_rate": "Rolling average day-1 view velocity across new clips.",
  "activated_at": "Timestamp when the throttle was last activated.",
  "deactivated_at": "Timestamp when the throttle was last deactivated.",
  "color": "Hex color code for visual identification (e.g., board column headers).",
  "name": "Display name for this record.",

  // ─── Abbreviations ───
  "mpfc": "medial Prefrontal Cortex — the brain area that activates when receiving genuine gratitude. Triggers serotonin + dopamine release.",
  "rpm": "Revenue Per Mille — earnings per 1,000 net views. The core payout rate for clippers.",
  "ctr_abbrev": "Click-Through Rate — percentage of viewers who clicked the link. Formula: clicks / views × 100.",
  "rls": "Row Level Security — Postgres policy system that controls which rows users can access.",
  "uuid": "Universally Unique Identifier — 128-bit ID used as primary keys (e.g., 'dc3ece31-adea-4852...').",
  "utm": "Urchin Tracking Module — URL parameters (source, medium, campaign) for marketing attribution.",
  "otp": "One-Time Password — temporary 6-digit code for phone/email verification.",
  "bc": "BlessedCoin — in-app virtual currency earned through engagement and spent in the rewards store.",
  "tgf": "Thank God it's Friday — weekly gratitude messaging program sent every Friday.",
  "a2p": "Application-to-Person — SMS routing type required for business messaging compliance.",
  "10dlc": "10-Digit Long Code — US phone number registration for business SMS. Required by carriers.",
  "mms": "Multimedia Messaging Service — SMS with images/media attached. Higher engagement but higher cost.",
  "sms": "Short Message Service — text-only messages sent via Twilio. 160 char limit per segment.",
  "kpi": "Key Performance Indicator — a measurable metric that reflects business health.",
  "e.164": "International phone number format (e.g., +14155551234). Required by Twilio.",
  "sid": "String Identifier — Twilio's unique ID for messages, services, and resources.",
  "iso": "International Organization for Standardization — referenced for date/currency formats.",
};

/**
 * Look up the explanation for a label or column name.
 * Falls back to a generic description.
 */
function getExplanation(text: string): string {
  const key = text.toLowerCase().trim();
  if (KNOWLEDGE[key]) return KNOWLEDGE[key];
  // Try removing trailing 's' for plurals
  if (KNOWLEDGE[key.replace(/s$/, "")]) return KNOWLEDGE[key.replace(/s$/, "")]!;
  // Try matching partial
  for (const [k, v] of Object.entries(KNOWLEDGE)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return `"${text}" — System metadata field.`;
}

interface SmartHoverProps {
  /** The text/label to explain */
  label: string;
  /** Optional custom explanation override */
  explanation?: string;
  /** The content to render (defaults to label text) */
  children?: ReactNode;
  /** Additional className for the trigger */
  className?: string;
  /** Which side the popup appears on */
  side?: "top" | "bottom" | "left" | "right";
}

/**
 * Wraps any element with a smart hover tooltip that explains
 * what the label/metric means and how it's calculated.
 * Uses the centralized KNOWLEDGE dictionary.
 */
export default function SmartHover({ label, explanation, children, className, side = "top" }: SmartHoverProps) {
  const text = explanation || getExplanation(label);

  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span
          className={`cursor-help border-b border-dotted border-muted-foreground/30 hover:border-primary/50 transition-colors ${className || ""}`}
        >
          {children || label}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 text-left z-50" side={side} align="center">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-foreground">{label}</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{text}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

/**
 * Export the knowledge lookup for use in other components
 */
export { getExplanation, KNOWLEDGE };
