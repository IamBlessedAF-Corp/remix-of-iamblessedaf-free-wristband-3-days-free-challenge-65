import { cn } from "@/lib/utils";

type PersonRow = {
  name: string;
  coreValues: ("+" | "+/-" | "-")[];
  getsIt: boolean;
  wantsIt: boolean;
  hasCapacity: boolean | null;
  quadrant: string;
  quadrantColor: string;
};

const CORE_VALUE_LABELS = [
  "Rad. Generosity", "Rel. Growth", "Auth. Connection", "Bold Execution", "Spir. Intelligence",
];

const DATA: PersonRow[] = [
  {
    name: "Joe Da Vincy",
    coreValues: ["+", "+", "+", "+", "+"],
    getsIt: true, wantsIt: true, hasCapacity: true,
    quadrant: "A-Player", quadrantColor: "text-emerald-400 bg-emerald-500/10",
  },
  {
    name: "Maria Chen",
    coreValues: ["+", "+", "+/-", "+", "+"],
    getsIt: true, wantsIt: true, hasCapacity: null,
    quadrant: "Right Person, Capacity?", quadrantColor: "text-yellow-400 bg-yellow-500/10",
  },
  {
    name: "Alex Suarez",
    coreValues: ["+", "+", "+", "+", "+/-"],
    getsIt: true, wantsIt: true, hasCapacity: true,
    quadrant: "A-Player", quadrantColor: "text-emerald-400 bg-emerald-500/10",
  },
  {
    name: "Laura Reyes",
    coreValues: ["+", "+", "+", "+/-", "+"],
    getsIt: true, wantsIt: true, hasCapacity: true,
    quadrant: "A-Player", quadrantColor: "text-emerald-400 bg-emerald-500/10",
  },
];

function ratingColor(v: string) {
  if (v === "+") return "text-emerald-400";
  if (v === "+/-") return "text-yellow-400";
  return "text-red-400";
}

function gwcColor(v: boolean | null) {
  if (v === true) return "text-emerald-400";
  if (v === null) return "text-yellow-400";
  return "text-red-400";
}

function gwcLabel(v: boolean | null) {
  if (v === true) return "Y";
  if (v === null) return "?";
  return "N";
}

export default function PeopleTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">People Analyzer</h1>
        <p className="text-xs text-muted-foreground mt-1">Core Values + GWC (Gets it, Wants it, Capacity to do it)</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="text-[11px] font-semibold text-muted-foreground uppercase">
              <th className="text-left pb-3">Person</th>
              {CORE_VALUE_LABELS.map((cv) => (
                <th key={cv} className="text-center pb-3">{cv}</th>
              ))}
              <th className="text-center pb-3">Gets It</th>
              <th className="text-center pb-3">Wants It</th>
              <th className="text-center pb-3">Has Capacity</th>
              <th className="text-left pb-3">Quadrant</th>
            </tr>
          </thead>
          <tbody>
            {DATA.map((row) => (
              <tr key={row.name} className="border-t border-border/50 hover:bg-secondary/20">
                <td className="py-3 text-xs font-semibold text-foreground">{row.name}</td>
                {row.coreValues.map((cv, i) => (
                  <td key={i} className={cn("py-3 text-center text-xs font-bold", ratingColor(cv))}>{cv}</td>
                ))}
                <td className={cn("py-3 text-center text-xs font-bold", gwcColor(row.getsIt))}>{gwcLabel(row.getsIt)}</td>
                <td className={cn("py-3 text-center text-xs font-bold", gwcColor(row.wantsIt))}>{gwcLabel(row.wantsIt)}</td>
                <td className={cn("py-3 text-center text-xs font-bold", gwcColor(row.hasCapacity))}>{gwcLabel(row.hasCapacity)}</td>
                <td className="py-3">
                  <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", row.quadrantColor)}>
                    {row.quadrant}
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
