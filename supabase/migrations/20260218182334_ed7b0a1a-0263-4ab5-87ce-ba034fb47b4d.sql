
-- ═══════════════════════════════════════════════════
-- 1. Intelligent Blocks table
-- ═══════════════════════════════════════════════════
CREATE TABLE public.intelligent_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  component text NOT NULL,
  used_in text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  icon_name text NOT NULL DEFAULT 'Zap',
  live_value_query text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.intelligent_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage intelligent_blocks"
  ON public.intelligent_blocks FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view intelligent_blocks"
  ON public.intelligent_blocks FOR SELECT
  USING (true);

CREATE TRIGGER update_intelligent_blocks_updated_at
  BEFORE UPDATE ON public.intelligent_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════
-- 2. Roadmap Items table (seed from static file)
-- ═══════════════════════════════════════════════════
CREATE TABLE public.roadmap_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phase text NOT NULL,
  title text NOT NULL,
  detail text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'medium',
  prompt text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage roadmap_items"
  ON public.roadmap_items FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view roadmap_items"
  ON public.roadmap_items FOR SELECT
  USING (true);

CREATE TRIGGER update_roadmap_items_updated_at
  BEFORE UPDATE ON public.roadmap_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════
-- 3. Seed Intelligent Blocks from existing static data
-- ═══════════════════════════════════════════════════
INSERT INTO public.intelligent_blocks (name, category, component, used_in, description, icon_name, sort_order) VALUES
  ('Expert Quotes', 'Content', 'GrokQuotesSection / GptQuotesSection', ARRAY['/offer/111', '/offer/111-grok', '/offer/111-gpt'], 'Huberman, Tony Robbins & Joe Dispenza quotes with author avatars. Grok=clinical tone, GPT=warm tone.', 'ScrollText', 1),
  ('Hawkins Scale', 'Content', 'Inline <img> hawkins-scale.jpg', ARRAY['/offer/111', '/offer/111-grok', '/offer/111-gpt'], 'Dr. Hawkins'' Consciousness Scale image (20Hz→540Hz). Anchors the ''27× happier'' claim.', 'Brain', 2),
  ('Research List', 'Content', 'ResearchList', ARRAY['/offer/111', '/offer/111-grok', '/offer/111-gpt'], '''Backed by Science'' section with peer-reviewed study citations.', 'ScrollText', 3),
  ('Epiphany Bridge', 'Content', 'EpiphanyBridge', ARRAY['/offer/111'], 'Brunson-style storytelling bridge from problem to solution.', 'Brain', 4),
  ('Gratitude Engine Loop™', 'Content', 'GratitudeEngineLoop', ARRAY['/', '/challenge'], 'Locked Huberman video + mPFC tooltip. Core neuroscience trigger.', 'Flame', 5),
  ('I AM Branding', 'Content', 'Inline section + logo', ARRAY['/offer/111', '/offer/111-grok', '/offer/111-gpt', '/'], '''I AM'' identity encoding section with Tony Robbins quote and brand logo.', 'Zap', 6),
  ('Wristband Product Card', 'Product', 'ProductSections (wristband)', ARRAY['/offer/111', '/offer/111-grok', '/offer/111-gpt', '/offer/22', '/'], 'Neuro-Hacker Wristband showcase: waterproof nylon, debossed, FREE badge + $11 strikethrough.', 'Award', 10),
  ('Friend Shirt Section', 'Product', 'FriendShirtSection', ARRAY['/offer/111', '/offer/111-grok', '/offer/111-gpt'], 'Custom shirt preview with friend name personalization, model gallery, and video.', 'Users', 11),
  ('Shirt Customizer', 'Product', 'ShirtCustomizer', ARRAY['/offer/111', '/offer/111-grok', '/offer/111-gpt'], 'Interactive shirt message editor — saves friendShirtName + friendShirtMessage to localStorage.', 'Settings', 12),
  ('Shopify Cart', 'Product', 'ShopifyStyleCart', ARRAY['/offer/111', '/offer/111-grok', '/offer/111-gpt'], 'TEMU/Shopify-style itemized cart with FREE badges, coupon breakdown, and savings summary.', 'DollarSign', 13),
  ('Product Sections', 'Product', 'ProductSections', ARRAY['/offer/111', '/offer/111-grok', '/offer/111-gpt'], 'Full product grid: shirts + wristbands with gallery, zoom modals, and afterWristband CTA slot.', 'Eye', 14),
  ('CTA Block (Grok)', 'CTA', 'GrokCtaBlock', ARRAY['/offer/111-grok'], 'ROI-math CTA with scarcity counter. Data-driven copy.', 'Target', 20),
  ('CTA Block (GPT)', 'CTA', 'GptCtaBlock', ARRAY['/offer/111-gpt'], 'Warm emotional CTA with heart-centered copy.', 'Target', 21),
  ('CTA Block ($444)', 'CTA', 'Grok444CtaBlock', ARRAY['/offer/444'], 'Habit-lock tier CTA — 1,111 meals.', 'Target', 22),
  ('CTA Block ($1111)', 'CTA', 'Grok1111CtaBlock', ARRAY['/offer/1111'], 'Kingdom Ambassador CTA — 11,111 meals.', 'Target', 23),
  ('CTA Block ($4444)', 'CTA', 'Grok4444CtaBlock', ARRAY['/offer/4444'], 'Terminal Ambassador CTA — custom leather jacket + NFT.', 'Target', 24),
  ('Discount Banner', 'CTA', 'DiscountBanner', ARRAY['/offer/111', '/offer/111-grok', '/offer/111-gpt'], '''77% OFF TODAY'' red badge with strikethrough pricing.', 'DollarSign', 25),
  ('Hero (Grok $111)', 'Hero', 'GrokHeroSection', ARRAY['/offer/111-grok'], '$111 ÷ 365 = $0.30/day ROI math headline + Harvard 85-year study bridge.', 'BarChart3', 30),
  ('Hero (GPT $111)', 'Hero', 'GptHeroSection', ARRAY['/offer/111-gpt'], 'Warm storytelling hero — ''custom shirt for your best friend''.', 'BarChart3', 31),
  ('Hero ($444)', 'Hero', 'Grok444HeroSection', ARRAY['/offer/444'], '$444 ÷ 365 = $1.22/day. 5 shirts + 14 wristbands.', 'BarChart3', 32),
  ('Hero ($1111)', 'Hero', 'Grok1111HeroSection', ARRAY['/offer/1111'], 'Kingdom Ambassador — 7 black shirts + 11 friend shirts + 111 wristbands.', 'BarChart3', 33),
  ('Hero ($4444)', 'Hero', 'Grok4444HeroSection', ARRAY['/offer/4444'], 'Custom leather jacket + artist patronage + NFT ownership.', 'BarChart3', 34),
  ('Landing Hero', 'Hero', 'Index page inline', ARRAY['/'], '''Feel Up to 27× Happier in 3 Days'' — auth gate CTA with wristband visual.', 'BarChart3', 35),
  ('Social Proof', 'Trust', 'SocialProofSection', ARRAY['/offer/111', '/offer/111-grok', '/offer/111-gpt'], 'Testimonial cards + live metrics. Two variants: ''story'' (warm) and ''data'' (clinical).', 'Users', 40),
  ('Risk Reversal (Grok)', 'Trust', 'GrokRiskReversal', ARRAY['/offer/111-grok'], 'Green checkmarks: 11 meals donated, SSL, free US shipping.', 'ShieldAlert', 41),
  ('Risk Reversal (GPT)', 'Trust', 'GptRiskReversal', ARRAY['/offer/111-gpt'], 'Heart emojis: ''Our Promise to You'' warm guarantee.', 'ShieldAlert', 42),
  ('Gratitude Guarantee', 'Trust', 'RiskReversalGuarantee', ARRAY['/offer/111'], '''Gratitude Guarantee'' badge — 11 meals in honor of neuroscience.', 'ShieldAlert', 43),
  ('Author Avatar', 'Trust', 'AuthorAvatar', ARRAY['/offer/111', '/offer/111-grok', '/offer/111-gpt'], 'Huberman, Tony Robbins, Joe Dispenza photo + credentials badge.', 'Users', 44),
  ('Offer Timer', 'Urgency', 'OfferTimer', ARRAY['/offer/111'], 'Countdown timer for checkout urgency.', 'Clock', 50),
  ('Urgency Banner', 'Urgency', 'UrgencyBanner', ARRAY['/offer/111'], 'Exit-intent triggered stock decay + viewer count.', 'AlertTriangle', 51),
  ('Mystery Box Badge', 'Urgency', 'Inline badge', ARRAY['/offer/111', '/offer/111-grok', '/offer/111-gpt'], '''🎉 You Won a FREE Custom Shirt From the Mystery Box!'' unlock badge.', 'Award', 52),
  ('Downsell Modal', 'Urgency', 'DownsellModal', ARRAY['/offer/111', '/offer/111-grok', '/offer/111-gpt'], 'Exit-intent modal: $11/mo alternative offer.', 'AlertCircle', 53),
  ('Viral Footer', 'Viral', 'GrokViralFooter', ARRAY['/offer/111-grok'], 'Post-offer viral share + skip link.', 'TrendingUp', 60),
  ('Viral Share Nudge', 'Viral', 'ViralShareNudge', ARRAY['/offer/111'], 'Cross-funnel WhatsApp/SMS share prompt.', 'TrendingUp', 61),
  ('Impact Counter', 'Viral', 'ImpactCounter', ARRAY['/offer/111'], 'Global meals donated counter with animation.', 'Gauge', 62),
  ('Gamification Header', 'Viral', 'GamificationHeader', ARRAY['/', '/offer/111', '/offer/111-grok', '/offer/111-gpt', '/offer/444', '/offer/1111', '/offer/4444'], 'Top bar with BC coins, streak, and progress. Present on all funnel pages.', 'Trophy', 63),
  ('Value Stack (Grok)', 'Value Stack', 'GrokValueStack', ARRAY['/offer/111-grok'], 'Benefits-first bullet list — data-driven, ROI focus.', 'Zap', 70),
  ('Value Stack (GPT)', 'Value Stack', 'GptValueStack', ARRAY['/offer/111-gpt'], 'Emotion-first benefit list — warm, story-driven.', 'Zap', 71),
  ('Value Stack ($444)', 'Value Stack', 'Grok444ValueStack', ARRAY['/offer/444'], '5 shirts + 14 wristbands + 1,111 meals stack.', 'Zap', 72),
  ('Value Stack ($1111)', 'Value Stack', 'Grok1111ValueStack', ARRAY['/offer/1111'], '7+11 shirts + 111 wristbands + 11,111 meals.', 'Zap', 73),
  ('Value Stack ($4444)', 'Value Stack', 'Grok4444ValueStack', ARRAY['/offer/4444'], 'Leather jacket + NFT + artist patronage.', 'Zap', 74),
  ('Activation Badge', 'System', 'ClipActivationGate', ARRAY['/clipper-dashboard'], 'Shows clipper activation status with verified/total counts.', 'Zap', 80),
  ('Bonus Card', 'System', 'ClipperBonusLadder', ARRAY['/clipper-dashboard', '/Gratitude-Clips-Challenge'], 'Displays clipper earnings & tier progress.', 'Trophy', 81),
  ('Risk Banner', 'System', 'RiskThrottleIndicator', ARRAY['/clipper-dashboard', '/admin'], 'Throttle/kill warnings for budget segments.', 'ShieldAlert', 82),
  ('Pending Queue', 'System', 'ClipperMyClips', ARRAY['/clipper-dashboard', '/admin'], 'Shows clips awaiting review count.', 'Clock', 83),
  ('Payment Timeline', 'System', 'ClipperPayoutHistory', ARRAY['/clipper-dashboard', '/admin'], 'Weekly payout cycle status and segment cycle tracking.', 'CreditCard', 84),
  ('Activity Feed', 'System', 'PortalActivityFeed', ARRAY['/portal', '/admin'], 'Portal activity events live stream.', 'AlertCircle', 85);
