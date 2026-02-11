import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-bold text-foreground">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </section>
);

const Privacy = () => {
  const navigate = useNavigate();
  const lastUpdated = "February 11, 2026";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">Privacy Policy</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mt-1">Last updated: {lastUpdated}</p>
          </div>

          <Section title="1. Introduction">
            <p>
              Blessed Collective ("we," "us," or "our") operates the Blessed Collective platform,
              including all associated websites, mobile experiences, ambassador portals, and
              related services (collectively, the "Service"). This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you use our Service.
            </p>
            <p>
              By accessing or using the Service, you agree to this Privacy Policy. If you do not
              agree, please discontinue use of the Service immediately.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p className="font-semibold text-foreground">a) Information You Provide Directly</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account &amp; Profile Data:</strong> Email address, display name, and optional social media handles (Instagram, TikTok, Twitter/X) when you create an ambassador or creator profile.</li>
              <li><strong>Phone Number:</strong> When you join the Gratitude Challenge or opt in to SMS notifications, we collect your mobile phone number.</li>
              <li><strong>Friend/Recipient Names:</strong> First names of friends you choose to send gratitude messages or blessings to.</li>
              <li><strong>Custom Messages:</strong> Text content you compose for gratitude messages, blessings, and personalized shirt messages.</li>
              <li><strong>Payment Information:</strong> When you make a purchase, payment details are processed securely by Stripe. We store your email, order amount, currency, and Stripe identifiers — never your full card number.</li>
              <li><strong>Content Submissions:</strong> Clip URLs, platform names, and associated metadata when you submit content through the Clipper program.</li>
            </ul>

            <p className="font-semibold text-foreground mt-4">b) Information Collected Automatically</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Device &amp; Browser Data:</strong> Browser type, operating system, device type, and screen resolution.</li>
              <li><strong>Usage Analytics:</strong> Pages visited, time spent, click patterns, and navigation paths.</li>
              <li><strong>Link Click Data:</strong> When you click short links, we record anonymized IP hashes, approximate geolocation (country/city), referrer URL, UTM parameters, and device information for analytics.</li>
              <li><strong>Local Storage Data:</strong> We use browser localStorage to persist gamification progress (Blessed Coins balance, achievement badges, mystery box status, spin wheel state) and funnel progress locally on your device.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Deliver the Service:</strong> Process orders, send gratitude challenge SMS messages, manage your ambassador portal, and track blessings.</li>
              <li><strong>Gamification &amp; Rewards:</strong> Maintain your Blessed Coins (BC) wallet, streak tracking, leaderboard ranking, tier progression, and reward store redemptions.</li>
              <li><strong>Communications:</strong> Send scheduled gratitude reminders, follow-up sequences, TGF Friday nudges, and transactional notifications via SMS (Twilio) and email.</li>
              <li><strong>Analytics &amp; Improvement:</strong> Understand how users interact with the Service, measure campaign performance, optimize conversion funnels, and improve the user experience.</li>
              <li><strong>Clipper Program:</strong> Verify clip submissions, track view counts, calculate earnings, and manage payouts.</li>
              <li><strong>Fraud Prevention:</strong> Detect and prevent fraudulent clip submissions, duplicate accounts, and abuse of the referral system.</li>
              <li><strong>Impact Reporting:</strong> Aggregate blessing counts and meal donation metrics for our public impact dashboard.</li>
            </ul>
          </Section>

          <Section title="4. SMS &amp; Messaging">
            <p>
              If you opt in to SMS communications (e.g., the Gratitude Challenge), you consent to
              receiving automated text messages at the phone number provided. Message frequency
              varies. Message and data rates may apply.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Reply <strong>STOP</strong> to any message to opt out at any time.</li>
              <li>Reply <strong>DONE</strong> to mark a gratitude message as completed.</li>
              <li>SMS delivery status and message SIDs are logged for reliability and troubleshooting.</li>
            </ul>
            <p>
              We use Twilio as our SMS provider. Your phone number and message content are
              transmitted through Twilio's infrastructure. See{" "}
              <a href="https://www.twilio.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Twilio's Privacy Policy
              </a>{" "}
              for details.
            </p>
          </Section>

          <Section title="5. Payment Processing">
            <p>
              All payments are processed by Stripe. We do not store credit card numbers or
              sensitive financial information on our servers. We retain your email, order total,
              currency, and Stripe session/customer identifiers for order fulfillment and support.
            </p>
            <p>
              See{" "}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Stripe's Privacy Policy
              </a>{" "}
              for how your payment data is handled.
            </p>
          </Section>

          <Section title="6. Data Sharing &amp; Third Parties">
            <p>We do not sell your personal information. We share data only as follows:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Twilio:</strong> Phone numbers and message content for SMS delivery.</li>
              <li><strong>Stripe:</strong> Payment and billing information for transaction processing.</li>
              <li><strong>Hosting &amp; Infrastructure:</strong> Our backend infrastructure processes and stores data securely with encryption at rest and in transit.</li>
              <li><strong>Public Leaderboards:</strong> Display names and blessing counts are shown publicly on the ambassador leaderboard. No email, phone, or other personal data is exposed.</li>
              <li><strong>Legal Compliance:</strong> We may disclose information if required by law, regulation, or legal process.</li>
            </ul>
          </Section>

          <Section title="7. Data Security">
            <p>
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Row-Level Security (RLS) policies ensuring users can only access their own data.</li>
              <li>Role-based access control for admin functions.</li>
              <li>Encrypted data transmission (HTTPS/TLS).</li>
              <li>Hashed IP addresses for analytics (never stored in plain text).</li>
              <li>Secure token-based authentication for all API requests.</li>
            </ul>
            <p>
              No system is 100% secure. While we strive to protect your data, we cannot guarantee
              absolute security.
            </p>
          </Section>

          <Section title="8. Data Retention">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Data:</strong> Retained while your account is active. You may request deletion at any time.</li>
              <li><strong>Blessings:</strong> Unconfirmed blessings expire after 7 days automatically.</li>
              <li><strong>SMS Logs:</strong> Delivery records retained for troubleshooting and compliance purposes.</li>
              <li><strong>Analytics Data:</strong> Link click data is retained for campaign performance analysis.</li>
              <li><strong>Orders:</strong> Transaction records are retained for accounting and legal requirements.</li>
              <li><strong>Local Storage:</strong> Gamification data persists in your browser until you clear it manually.</li>
            </ul>
          </Section>

          <Section title="9. Your Rights">
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data ("right to be forgotten").</li>
              <li>Opt out of SMS communications at any time by replying STOP.</li>
              <li>Withdraw consent for data processing.</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at the email below.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              The Service is not directed to individuals under 13 years of age. We do not
              knowingly collect personal information from children under 13. If we learn we have
              collected such data, we will delete it promptly.
            </p>
          </Section>

          <Section title="11. Cookies &amp; Local Storage">
            <p>
              We use browser localStorage (not traditional cookies) to store gamification state,
              funnel progress, and user preferences. This data remains on your device and is not
              transmitted to our servers unless you authenticate, at which point your Blessed Coins
              balance is synced to your account.
            </p>
          </Section>

          <Section title="12. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this
              page with an updated "Last updated" date. Continued use of the Service after changes
              constitutes acceptance of the revised policy.
            </p>
          </Section>

          <Section title="13. Happiness Guarantee">
            <p>
              Our Happiness Guarantee allows you to send 3 gratitude texts and use the product for
              3 days. If you don't feel happier, we offer a full refund with no questions asked.
              Refund requests do not affect your privacy rights or data deletion requests.
            </p>
          </Section>

          <Section title="14. Contact Us">
            <p>
              If you have questions about this Privacy Policy or wish to exercise your data rights,
              please contact us:
            </p>
            <p className="font-semibold text-foreground">
              Email: privacy@blessedcollective.com
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

export default Privacy;
