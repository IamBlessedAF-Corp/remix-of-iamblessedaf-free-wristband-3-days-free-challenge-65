import { useState } from "react";
import { cn } from "@/lib/utils";

type Todo = { text: string; done: boolean; due: string; overdue?: boolean };
type Person = { name: string; done: number; total: number; todos: Todo[] };

const DATA: Person[] = [
  {
    name: "Joe Da Vincy", done: 6, total: 7,
    todos: [
      { text: "Review wristband prototype samples", done: true, due: "Feb 25" },
      { text: "Send investor update email", done: true, due: "Feb 25" },
      { text: "Interview integrator candidate #3", done: true, due: "Feb 26" },
      { text: "Approve Q1 marketing budget", done: true, due: "Feb 26" },
      { text: "Record challenge intro video", done: true, due: "Feb 27" },
      { text: "Set up Stripe payouts for affiliates", done: true, due: "Feb 28" },
      { text: "Finalize $444 offer pricing page", done: false, due: "Mar 1", overdue: true },
    ],
  },
  {
    name: "Maria Chen", done: 3, total: 5,
    todos: [
      { text: "Launch IG story template A/B test", done: true, due: "Feb 25" },
      { text: "Write email sequence for challenge Day 2", done: true, due: "Feb 26" },
      { text: "Set up UTM tracking for affiliate links", done: true, due: "Feb 27" },
      { text: "Design referral rewards tier structure", done: false, due: "Mar 2", overdue: true },
      { text: "Analyze K-factor data from cohort 7", done: false, due: "Mar 3" },
    ],
  },
];

function statusBadge(done: number, total: number) {
  const pct = done / total;
  if (pct >= 0.8) return "text-emerald-400 bg-emerald-500/10";
  if (pct >= 0.5) return "text-yellow-400 bg-yellow-500/10";
  return "text-red-400 bg-red-500/10";
}

export default function TodosTab() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">To-Dos</h1>
        <p className="text-xs text-muted-foreground mt-1">7-Day To-Dos — Due by Mar 4, 2026</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DATA.map((person) => (
          <div key={person.name} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-bold text-foreground">{person.name}</h3>
              <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", statusBadge(person.done, person.total))}>
                {person.done}/{person.total} done
              </span>
            </div>

            <div className="space-y-0">
              {person.todos.map((todo) => {
                const key = `${person.name}-${todo.text}`;
                const checked = toggles[key] !== undefined ? toggles[key] : todo.done;
                return (
                  <div key={todo.text} className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-none">
                    <button
                      onClick={() => toggle(key)}
                      className={cn(
                        "w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded border-2 flex items-center justify-center transition-all text-[10px] font-bold",
                        checked
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      {checked && "✓"}
                    </button>
                    <span className={cn("flex-1 text-xs", checked && "line-through text-muted-foreground")}>
                      {todo.text}
                    </span>
                    <span className={cn("text-[11px]", todo.overdue ? "text-yellow-400" : "text-muted-foreground")}>
                      {todo.due}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
