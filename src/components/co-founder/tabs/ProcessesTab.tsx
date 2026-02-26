import { cn } from "@/lib/utils";

type ProcessStep = { num: number; name: string; detail: string; done: boolean };

type Process = {
  title: string;
  owner: string;
  steps: ProcessStep[];
};

const DATA: Process[] = [
  {
    title: "Sales Process", owner: "Maria Chen",
    steps: [
      { num: 1, name: "Attract", detail: "Organic + paid traffic to challenge landing page", done: true },
      { num: 2, name: "Capture", detail: "Free wristband giveaway + SMS opt-in", done: true },
      { num: 3, name: "Nurture", detail: "3-day challenge with daily gratitude texts", done: true },
      { num: 4, name: "Convert", detail: "$111 / $444 offer at challenge completion", done: true },
      { num: 5, name: "Delight", detail: "Onboarding sequence + community access", done: false },
    ],
  },
  {
    title: "Customer Onboarding Process", owner: "Laura Reyes",
    steps: [
      { num: 1, name: "Welcome Email", detail: "Personalized welcome + setup guide", done: true },
      { num: 2, name: "Setup Call", detail: "15-min call to set expectations + first rock", done: true },
      { num: 3, name: "Week 1 Check-in", detail: "Automated text: \"How's it going?\"", done: true },
      { num: 4, name: "30-Day Review", detail: "NPS survey + renewal/upgrade offer", done: false },
    ],
  },
  {
    title: "Affiliate Ambassador Process", owner: "Maria Chen",
    steps: [
      { num: 1, name: "Apply", detail: "Application form with social proof questions", done: true },
      { num: 2, name: "Approve & Onboard", detail: "Manual review + welcome kit + unique link", done: true },
      { num: 3, name: "Activate", detail: "First referral within 48 hours", done: false },
      { num: 4, name: "Scale", detail: "Diamond tier: 50+ referrals, custom commission", done: false },
    ],
  },
  {
    title: "Engineering Sprint Process", owner: "Alex Suarez",
    steps: [
      { num: 1, name: "Plan", detail: "Monday: sprint planning from rock milestones", done: true },
      { num: 2, name: "Build", detail: "Tue-Thu: focused development", done: true },
      { num: 3, name: "Ship", detail: "Friday: deploy + QA + release notes", done: false },
      { num: 4, name: "Retro", detail: "Friday PM: what worked, what didn't", done: false },
    ],
  },
];

export default function ProcessesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Core Processes</h1>
        <p className="text-xs text-muted-foreground mt-1">Documented and followed by all (FBA)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DATA.map((process) => (
          <div key={process.title} className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-bold text-foreground">{process.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Owner: {process.owner}</p>

            <div className="space-y-0">
              {process.steps.map((step) => (
                <div key={step.num} className="flex items-start gap-4 py-3 border-b border-border/30 last:border-none">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0",
                    step.done ? "bg-emerald-500" : "bg-primary/30"
                  )}>
                    {step.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{step.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{step.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
