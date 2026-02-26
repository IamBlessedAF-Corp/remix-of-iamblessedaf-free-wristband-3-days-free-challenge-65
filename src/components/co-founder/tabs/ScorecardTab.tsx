import { cn } from "@/lib/utils";

type ScorecardRow = {
  name: string;
  owner: string;
  initials: string;
  color: string;
  goal: string;
  weeks: { value: string; onTrack: boolean }[];
  onTrack: boolean;
};

const DATA: ScorecardRow[] = [
  {
    name: "Revenue", owner: "Joe", initials: "JD", color: "bg-purple-500",
    goal: "$108K",
    weeks: [
      { value: "$95K", onTrack: true }, { value: "$102K", onTrack: true },
      { value: "$118K", onTrack: true }, { value: "$128K", onTrack: true },
    ],
    onTrack: true,
  },
  {
    name: "New Users", owner: "Maria", initials: "MC", color: "bg-yellow-500",
    goal: "1,200",
    weeks: [
      { value: "780", onTrack: false }, { value: "830", onTrack: false },
      { value: "890", onTrack: false }, { value: "947", onTrack: false },
    ],
    onTrack: false,
  },
  {
    name: "Churn Rate", owner: "Alex", initials: "AS", color: "bg-emerald-500",
    goal: "<3%",
    weeks: [
      { value: "2.8%", onTrack: true }, { value: "2.4%", onTrack: true },
      { value: "2.2%", onTrack: true }, { value: "2.1%", onTrack: true },
    ],
    onTrack: true,
  },
  {
    name: "NPS Score", owner: "Laura", initials: "LR", color: "bg-green-500",
    goal: "60",
    weeks: [
      { value: "65", onTrack: true }, { value: "68", onTrack: true },
      { value: "70", onTrack: true }, { value: "72", onTrack: true },
    ],
    onTrack: true,
  },
  {
    name: "Challenge Signups", owner: "Joe", initials: "JD", color: "bg-purple-500",
    goal: "2,000",
    weeks: [
      { value: "1,800", onTrack: true }, { value: "2,100", onTrack: true },
      { value: "2,340", onTrack: true }, { value: "2,510", onTrack: true },
    ],
    onTrack: true,
  },
  {
    name: "Affiliate Sign-ups", owner: "Maria", initials: "MC", color: "bg-yellow-500",
    goal: "80",
    weeks: [
      { value: "42", onTrack: false }, { value: "51", onTrack: false },
      { value: "58", onTrack: false }, { value: "63", onTrack: false },
    ],
    onTrack: false,
  },
  {
    name: "Support Ticket Avg (hrs)", owner: "Alex", initials: "AS", color: "bg-emerald-500",
    goal: "<4",
    weeks: [
      { value: "3.2", onTrack: true }, { value: "2.9", onTrack: true },
      { value: "2.6", onTrack: true }, { value: "2.3", onTrack: true },
    ],
    onTrack: true,
  },
];

export default function ScorecardTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Scorecard</h1>
        <p className="text-xs text-muted-foreground mt-1">Weekly measurables — Week of Feb 24, 2026</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="text-[11px] font-semibold text-muted-foreground uppercase">
              <th className="text-left pb-3">Measurable</th>
              <th className="text-left pb-3">Owner</th>
              <th className="text-left pb-3">Goal</th>
              <th className="text-left pb-3">W8</th>
              <th className="text-left pb-3">W9</th>
              <th className="text-left pb-3">W10</th>
              <th className="text-left pb-3">W11 (current)</th>
              <th className="text-left pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {DATA.map((row) => (
              <tr key={row.name} className="border-t border-border/50 hover:bg-secondary/20">
                <td className="py-3 text-xs font-semibold text-foreground">{row.name}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center shrink-0", row.color)}>
                      {row.initials}
                    </span>
                    <span className="text-xs text-foreground">{row.owner}</span>
                  </div>
                </td>
                <td className="py-3 text-xs text-muted-foreground">{row.goal}</td>
                {row.weeks.map((w, i) => (
                  <td key={i} className={cn("py-3 text-xs", w.onTrack ? "text-emerald-400" : "text-red-400", i === 3 && "font-bold")}>
                    {w.value}
                  </td>
                ))}
                <td className="py-3">
                  <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full",
                    row.onTrack ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
                  )}>
                    {row.onTrack ? "On Track" : "Off Track"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
