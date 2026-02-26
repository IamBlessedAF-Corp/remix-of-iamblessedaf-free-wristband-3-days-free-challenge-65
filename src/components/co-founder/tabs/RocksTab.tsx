import { cn } from "@/lib/utils";

type Rock = {
  title: string;
  owner: string;
  initials: string;
  color: string;
  progress: number;
  status: "On Track" | "Off Track";
  due: string;
};

const DATA: Rock[] = [
  { title: "Launch Smart Wristband Pre-orders", owner: "Joe", initials: "JD", color: "bg-purple-500", progress: 85, status: "On Track", due: "Mar 15" },
  { title: "Hit $1M ARR Run Rate", owner: "Joe", initials: "JD", color: "bg-purple-500", progress: 72, status: "On Track", due: "Mar 31" },
  { title: "Build Viral K-Factor Engine (K>2.0)", owner: "Maria", initials: "MC", color: "bg-yellow-500", progress: 45, status: "Off Track", due: "Mar 31" },
  { title: "Hire Integrator", owner: "Joe", initials: "JD", color: "bg-purple-500", progress: 60, status: "On Track", due: "Mar 15" },
  { title: "Launch Affiliate Portal V2", owner: "Alex", initials: "AS", color: "bg-emerald-500", progress: 90, status: "On Track", due: "Feb 28" },
  { title: "Onboarding Flow Redesign", owner: "Laura", initials: "LR", color: "bg-green-500", progress: 30, status: "Off Track", due: "Mar 31" },
];

function progressColor(p: number) {
  if (p >= 70) return "bg-emerald-500";
  if (p >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

function progressText(p: number) {
  if (p >= 70) return "text-emerald-400";
  if (p >= 50) return "text-yellow-400";
  return "text-red-400";
}

export default function RocksTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Rocks</h1>
        <p className="text-xs text-muted-foreground mt-1">Q1 2026 Priorities — Jan 1 to Mar 31</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 overflow-x-auto">
        <table className="w-full min-w-[650px]">
          <thead>
            <tr className="text-[11px] font-semibold text-muted-foreground uppercase">
              <th className="text-left pb-3">Rock</th>
              <th className="text-left pb-3">Owner</th>
              <th className="text-left pb-3 w-48">Progress</th>
              <th className="text-left pb-3">Status</th>
              <th className="text-left pb-3">Due</th>
            </tr>
          </thead>
          <tbody>
            {DATA.map((rock) => (
              <tr key={rock.title} className="border-t border-border/50 hover:bg-secondary/20">
                <td className="py-3 text-xs font-semibold text-foreground">{rock.title}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center shrink-0", rock.color)}>
                      {rock.initials}
                    </span>
                    <span className="text-xs text-foreground">{rock.owner}</span>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", progressColor(rock.progress))} style={{ width: `${rock.progress}%` }} />
                    </div>
                    <span className={cn("text-xs font-semibold min-w-[32px] text-right", progressText(rock.progress))}>
                      {rock.progress}%
                    </span>
                  </div>
                </td>
                <td className="py-3">
                  <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full",
                    rock.status === "On Track" ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
                  )}>
                    {rock.status}
                  </span>
                </td>
                <td className="py-3 text-xs text-muted-foreground">{rock.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
