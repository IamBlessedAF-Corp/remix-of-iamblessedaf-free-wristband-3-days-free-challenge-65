import { motion } from "framer-motion";
import { FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-bold text-foreground">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </section>
);

const Terms = () => {
  const navigate = useNavigate();
  const lastUpdated = "February 11, 2026";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <FileText className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">Terms &amp; Conditions</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Terms &amp; Conditions</h1>
            <p className="text-sm text-muted-foreground mt-1">Last updated: {lastUpdated}</p>
          </div>

          <Section title="1. Agreement to Terms">
            <p>
              By accessing or using the Blessed Collective platform, including all associated
              websites, mobile experiences, ambassador portals, the Clipper Program, the Gratitude
              Challenge, and related services (collectively, the "Service"), you agree to be bound
              by these Terms and Conditions ("Terms"). If you do not agree, do not use the Service.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              <strong>Blessed Collective</strong> is a gratitude-driven community platform that
              enables users to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Purchase and send gratitude-themed products (t-shirts, wristbands) with personalized messages.</li>
              <li>Participate in the <strong>Gratitude Challenge</strong> — a daily SMS-based habit-building program encouraging users to send gratitude messages to friends.</li>
              <li>Join the <strong>Ambassador &amp; Clipper Program</strong> — a creator incentive system where participants earn rewards by creating and sharing video clips promoting the Blessed Collective mission.</li>
              <li>Earn and redeem <strong>Blessed Coins (BC)</strong> — a virtual rewards currency used within the platform's gamification system.</li>
              <li>Track personal and community impact through the <strong>Ambassador Portal</strong>, including leaderboards, missions, and a rewards store.</li>
              <li>Contribute to the community goal of <strong>1,111,111 meals donated by 2026</strong> through purchases and referrals.</li>
            </ul>
          </Section>

          <Section title="3. SMS &amp; Messaging Program">
            <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
              <p className="font-semibold text-foreground">📱 Blessed Collective SMS Program</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Program Name:</strong> Blessed Collective Gratitude Challenge &amp; Notifications</li>
                <li><strong>Description:</strong> When you opt in to SMS communications, you will receive automated text messages including daily gratitude reminders, challenge streak updates, TGF Gratitude Friday prompts, order confirmations, and referral notifications.</li>
                <li><strong>Message Frequency:</strong> Message frequency varies. During the Gratitude Challenge, you may receive up to 2 messages per day (a reminder and a gratitude prompt). TGF Gratitude Fridays sends 1 message per week. Transactional messages (order confirmations, referral alerts) are sent as needed.</li>
                <li><strong>Message &amp; Data Rates:</strong> Message and data rates may apply. Check with your mobile carrier for details about your text messaging plan.</li>
              </ul>

              <div className="border-t border-border pt-3 space-y-2">
                <p className="font-semibold text-foreground">Opt-Out &amp; Help Instructions:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>STOP:</strong> Reply <strong>STOP</strong> to any message to opt out of
                    all SMS communications. You will receive a one-time confirmation message. No
                    further messages will be sent unless you re-enroll.
                  </li>
                  <li>
                    <strong>HELP:</strong> Reply <strong>HELP</strong> to any message for assistance.
                    You will receive a response with contact information and support instructions.
                  </li>
                  <li>
                    <strong>DONE:</strong> Reply <strong>DONE</strong> or <strong>SENT</strong> to
                    confirm you've sent your daily gratitude message. This updates your streak counter.
                  </li>
                </ul>
              </div>

              <p className="text-xs text-muted-foreground">
                SMS services are powered by Twilio. By opting in, you consent to receive automated
                text messages at the phone number provided. Consent is not a condition of purchase.
              </p>
            </div>
          </Section>

          <Section title="4. Eligibility">
            <p>
              You must be at least 13 years of age to use the Service. By using the Service, you
              represent and warrant that you meet this requirement. Users under 18 must have
              parental or guardian consent.
            </p>
          </Section>

          <Section title="5. Account Registration">
            <p>
              Certain features require account creation (email and password). You are responsible
              for maintaining the confidentiality of your account credentials and for all activity
              under your account. You agree to provide accurate, current, and complete information.
            </p>
          </Section>

          <Section title="6. Purchases &amp; Payments">
            <ul className="list-disc pl-5 space-y-1">
              <li>All prices are displayed in USD unless otherwise stated.</li>
              <li>Payments are processed securely via <strong>Stripe</strong>. We do not store your full credit card information.</li>
              <li>Product tiers include: $11.11 Starter, $22.22 Standard, $44.44 Premium, $111.11 Ultimate, and monthly subscription options.</li>
              <li>Each purchase tier contributes a specific number of meals to our community impact goal.</li>
              <li>Digital delivery is immediate. Physical products (t-shirts, wristbands) ship separately and delivery times vary.</li>
            </ul>
          </Section>

          <Section title="7. Happiness Guarantee (Refund Policy)">
            <p>
              We offer a <strong>"Happiness Guarantee"</strong>: send 3 gratitude texts and use the
              product for 3 days. If you don't feel happier, we'll give you a full refund — no
              questions asked. To request a refund, contact us at the email provided in Section 18.
            </p>
            <p>
              Refunds are processed to the original payment method within 5–10 business days.
            </p>
          </Section>

          <Section title="8. Clipper &amp; Ambassador Program">
            <ul className="list-disc pl-5 space-y-1">
              <li>The Clipper Program allows participants to earn rewards by creating and sharing promotional video clips on platforms like TikTok, Instagram Reels, and YouTube Shorts.</li>
              <li><strong>Earnings are performance-based</strong> and depend on verified view counts. Results vary and are not guaranteed.</li>
              <li>Clip submissions must be original content created by the submitting user. We reserve the right to verify ownership and reject fraudulent submissions.</li>
              <li>Verification includes cross-referencing the clip URL with the creator's registered social media handles and checking for duplicate submissions.</li>
              <li>Blessed Collective reserves the right to modify payout rates, bonus structures, and program terms at any time with reasonable notice.</li>
              <li>The <strong>Super Payout</strong> milestone (1,000,000 cumulative views) and bonus ladder tiers are subject to verification and approval.</li>
            </ul>
            <p className="text-xs text-muted-foreground italic">
              Disclaimer: Earnings examples and scenarios are illustrative and performance-dependent.
              Individual results will vary based on content quality, audience size, and engagement.
            </p>
          </Section>

          <Section title="9. Blessed Coins (BC) Virtual Currency">
            <ul className="list-disc pl-5 space-y-1">
              <li>Blessed Coins (BC) are a virtual, non-transferable rewards currency with no cash value.</li>
              <li>BC can be earned through daily login bonuses (10–50 BC based on streak), achievements, referrals, and missions.</li>
              <li>BC can be redeemed for items in the Rewards Store (discounts, exclusive content, premium features).</li>
              <li>We reserve the right to adjust BC balances, earning rates, and store pricing at any time.</li>
              <li>BC cannot be purchased, sold, traded, or transferred between accounts.</li>
              <li>Abuse of the BC system (bot activity, multi-accounting) will result in balance forfeiture and account suspension.</li>
            </ul>
          </Section>

          <Section title="10. Referral Program">
            <ul className="list-disc pl-5 space-y-1">
              <li>Each ambassador receives a unique referral code and short link for sharing.</li>
              <li>Referral rewards (free wristbands, BC bonuses) are credited when a referred user completes a qualifying action.</li>
              <li>Self-referrals, fake accounts, and incentivized signups (paying others to sign up) are prohibited.</li>
              <li>We reserve the right to void referral rewards obtained through fraudulent means.</li>
            </ul>
          </Section>

          <Section title="11. Gratitude Challenge">
            <ul className="list-disc pl-5 space-y-1">
              <li>The Gratitude Challenge is a free, opt-in daily habit program delivered via SMS.</li>
              <li>Participants provide their phone number and at least one friend's first name.</li>
              <li>The system sends daily reminders and tracks streak completion via reply keywords (DONE, SENT, YES).</li>
              <li>Streak data (current streak, longest streak) is tracked and displayed publicly on leaderboards (display name only).</li>
              <li>TGF Gratitude Fridays sends a weekly prompt with a rotating friend and referral link.</li>
            </ul>
          </Section>

          <Section title="12. User Content &amp; Conduct">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Submit false, misleading, or fraudulent clip submissions or referral activity.</li>
              <li>Use the Service to send spam, harassing, or inappropriate messages.</li>
              <li>Attempt to manipulate leaderboards, view counts, or reward systems.</li>
              <li>Create multiple accounts to exploit bonuses or referral rewards.</li>
              <li>Reverse-engineer, scrape, or interfere with the Service's infrastructure.</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms without
              prior notice.
            </p>
          </Section>

          <Section title="13. Intellectual Property">
            <p>
              All content, branding, designs, and software associated with Blessed Collective are
              owned by us or our licensors. You may not reproduce, distribute, or create derivative
              works without our written consent. Clipper participants grant us a non-exclusive,
              royalty-free license to feature submitted clips in marketing materials.
            </p>
          </Section>

          <Section title="14. Leaderboards &amp; Public Data">
            <p>
              By creating an ambassador profile, you consent to your <strong>display name</strong> and{" "}
              <strong>blessing count</strong> appearing on public leaderboards. No email, phone
              number, or other personal data is displayed publicly.
            </p>
          </Section>

          <Section title="15. Third-Party Services">
            <p>The Service integrates with third-party providers:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Stripe</strong> — Payment processing (<a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer" className="text-primary underline">Stripe Terms</a>)</li>
              <li><strong>Twilio</strong> — SMS/MMS delivery (<a href="https://www.twilio.com/legal/tos" target="_blank" rel="noopener noreferrer" className="text-primary underline">Twilio Terms</a>)</li>
            </ul>
            <p>
              We are not responsible for the practices or policies of third-party services.
            </p>
          </Section>

          <Section title="16. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, Blessed Collective shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages arising from
              your use of the Service, including but not limited to loss of revenue, data, or
              business opportunities. Our total liability shall not exceed the amount you paid us
              in the 12 months preceding the claim.
            </p>
          </Section>

          <Section title="17. Modifications to Terms">
            <p>
              We reserve the right to modify these Terms at any time. Changes will be posted on
              this page with an updated "Last updated" date. Continued use of the Service after
              modifications constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="18. Contact Us">
            <p>For questions about these Terms, contact us:</p>
            <p className="font-semibold text-foreground">
              Email: support@blessedcollective.com
            </p>
            <p>
              For SMS help, reply <strong>HELP</strong> to any message or email the address above.
            </p>
          </Section>

          <div className="pt-6 border-t border-border/40 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Blessed Collective. All rights reserved.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Terms;
