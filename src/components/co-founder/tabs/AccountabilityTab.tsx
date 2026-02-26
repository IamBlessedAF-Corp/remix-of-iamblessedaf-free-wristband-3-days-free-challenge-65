import { cn } from "@/lib/utils";

type Seat = {
  title: string;
  person: string | null;
  roles: string;
  borderColor: string;
  color: string;
};

const TOP_SEAT: Seat = {
  title: "Visionary", person: "Joe Da Vincy",
  roles: "Vision \u2022 Culture \u2022 Big Ideas \u2022 R&D",
  borderColor: "border-purple-500/50", color: "text-emerald-400",
};

const INTEGRATOR: Seat = {
  title: "Integrator", person: null,
  roles: "P&L \u2022 Operations \u2022 LMA \u2022 Execution",
  borderColor: "border-emerald-500/50", color: "text-yellow-400",
};

const DEPARTMENTS: Seat[] = [
  { title: "Marketing", person: "Maria Chen", roles: "Growth \u2022 Content \u2022 Viral Loops \u2022 Affiliates", borderColor: "border-border", color: "text-emerald-400" },
  { title: "Technology", person: "Alex Suarez", roles: "Engineering \u2022 DevOps \u2022 AI \u2022 Integrations", borderColor: "border-border", color: "text-emerald-400" },
  { title: "Customer Success", person: "Laura Reyes", roles: "Support \u2022 Onboarding \u2022 NPS \u2022 Community", borderColor: "border-border", color: "text-emerald-400" },
];

function SeatCard({ seat }: { seat: Seat }) {
  return (
    <div className={cn("bg-secondary/30 border rounded-xl p-4 text-center min-w-[180px]", seat.borderColor)}>
      <div className="text-sm font-bold text-foreground">{seat.title}</div>
      <div className={cn("text-xs mt-1", seat.color)}>
        {seat.person || "Hiring..."}
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">{seat.roles}</div>
    </div>
  );
}

function Connector() {
  return <div className="w-0.5 h-6 bg-border mx-auto" />;
}

export default function AccountabilityTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Accountability Chart</h1>
        <p className="text-xs text-muted-foreground mt-1">Who owns what at IamBlessedAF</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 overflow-x-auto">
        <div className="flex flex-col items-center gap-0 min-w-[600px]">
          {/* Visionary */}
          <SeatCard seat={TOP_SEAT} />
          <Connector />

          {/* Integrator */}
          <SeatCard seat={INTEGRATOR} />
          <Connector />

          {/* Departments */}
          <div className="flex gap-8 items-start">
            {DEPARTMENTS.map((dept) => (
              <div key={dept.title} className="flex flex-col items-center">
                <SeatCard seat={dept} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
