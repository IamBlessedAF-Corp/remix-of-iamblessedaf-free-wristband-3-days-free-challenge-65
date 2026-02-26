import { cn } from "@/lib/utils";

type AgendaStep = {
  num: number;
  name: string;
  detail: string;
  time: string;
  status: "done" | "current" | "pending";
};

const AGENDA: AgendaStep[] = [
  { num: 1, name: "Segue", detail: "Good news — personal & professional", time: "5 min", status: "done" },
  { num: 2, name: "Scorecard Review", detail: "5/7 measurables on track", time: "5 min", status: "done" },
  { num: 3, name: "Rock Review", detail: "4/6 rocks on track", time: "5 min", status: "done" },
  { num: 4, name: "Customer/Employee Headlines", detail: "Affiliate ambassador hit $10K in referrals", time: "5 min", status: "done" },
  { num: 5, name: "To-Do List", detail: "Last week: 91% complete (21/23)", time: "5 min", status: "done" },
  { num: 6, name: "IDS (Issues)", detail: "3 issues to solve today", time: "60 min", status: "current" },
  { num: 7, name: "Conclude", detail: "Recap to-dos, cascading messages, rating", time: "5 min", status: "pending" },
];

const ATTENDEES = [
  { name: "Joe Da Vincy", role: "Visionary", initials: "JD", color: "bg-purple-500" },
  { name: "Maria Chen", role: "Marketing Lead", initials: "MC", color: "bg-yellow-500" },
  { name: "Alex Suarez", role: "Tech Lead", initials: "AS", color: "bg-emerald-500" },
  { name: "Laura Reyes", role: "Customer Success", initials: "LR", color: "bg-green-500" },
];

export default function L10Tab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">L10 Meeting</h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">Weekly Level 10 — Feb 25, 2026 &bull; Tue 9:00 AM</p>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-yellow-400 bg-yellow-500/10">In Progress</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Agenda */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Agenda</h3>
          <div className="space-y-0">
            {AGENDA.map((step) => (
              <div key={step.num} className="flex items-start gap-4 py-3 border-b border-border/30 last:border-none">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0",
                  step.status === "done" ? "bg-emerald-500" :
                    step.status === "current" ? "bg-yellow-500 animate-pulse" :
                      "bg-primary/30"
                )}>
                  {step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{step.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{step.detail}</div>
                </div>
                <div className="text-xs text-muted-foreground font-medium">{step.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Attendees */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Attendees (4/4)</h3>
            <div className="space-y-0">
              {ATTENDEES.map((a) => (
                <div key={a.name} className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-none">
                  <span className={cn("w-7 h-7 rounded-full text-[10px] font-bold text-white flex items-center justify-center shrink-0", a.color)}>
                    {a.initials}
                  </span>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-foreground">{a.name}</div>
                    <div className="text-[11px] text-muted-foreground">{a.role}</div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-500/10">Present</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">Last Week Ratings</h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
                8.4
              </div>
              <div className="text-xs text-muted-foreground">Average rating<br />out of 10</div>
            </div>
            <div className="text-xs text-muted-foreground mt-3">
              Joe: 9 &bull; Maria: 8 &bull; Alex: 8 &bull; Laura: 8.5
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
