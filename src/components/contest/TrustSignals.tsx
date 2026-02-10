import { motion } from "framer-motion";
import { Eye, Clock, FileCheck, Activity, Users, Video, TrendingUp, DollarSign } from "lucide-react";
import { useClipperSocialProof } from "@/hooks/useClipperSocialProof";

const signals = [
  {
    icon: FileCheck,
    title: "Clear Payout Rules",
    desc: "Submit a valid clip → views get counted from platform analytics → you get paid. No subjective review. No approval committee.",
  },
  {
    icon: Clock,
    title: "Weekly Payouts",
    desc: "Earnings are processed every week. Not monthly, not 'eventually.' You see your balance and payout status in real time.",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    desc: "Your dashboard shows every clip, view count, earnings, and payout status. Nothing is hidden. You always know where you stand.",
  },
  {
    icon: Activity,
    title: "This Program Is Live",
    desc: "Clippers are submitting and getting paid right now. This isn't a waitlist or a coming-soon page — the system is active today.",
  },
];

const TrustSignals = () => {
  const proof = useClipperSocialProof();

  return (
    <motion.section
      className="px-4 py-10 max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {/* Live stats bar */}
      {!proof.loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Users, label: "Active Clippers", value: proof.totalClippers },
            { icon: Video, label: "Clips Submitted", value: proof.totalClips },
            { icon: TrendingUp, label: "Total Views", value: proof.totalViews },
            { icon: DollarSign, label: "Paid Out", value: proof.totalPaidOut },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-card rounded-xl p-3.5 border border-border/50 text-center">
                <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-black text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            );
          })}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-1">How We're Different From Every Other Clipper Program</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Most clipper programs die from broken verification and slow payouts. Here's why this one won't.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {signals.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              className="bg-card rounded-xl p-5 border border-border/50"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Icon className="w-6 h-6 text-primary mb-2.5" />
              <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};

export default TrustSignals;
