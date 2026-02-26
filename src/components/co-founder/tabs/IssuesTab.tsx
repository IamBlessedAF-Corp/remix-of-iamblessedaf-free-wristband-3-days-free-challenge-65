type Issue = {
  num: number;
  title: string;
  detail: string;
  type: string;
  owner: string;
  priority: string;
  priorityColor: string;
  status: string;
  statusColor: string;
};

const DATA: Issue[] = [
  {
    num: 1, title: "Onboarding drop-off at step 3", detail: "42% of users abandon at payment screen",
    type: "Process", owner: "Laura", priority: "High", priorityColor: "text-red-400 bg-red-500/10",
    status: "Discussing", statusColor: "text-yellow-400 bg-yellow-500/10",
  },
  {
    num: 2, title: "Affiliate payout calculation errors", detail: "3 ambassadors reported wrong amounts this week",
    type: "Process", owner: "Alex", priority: "Medium", priorityColor: "text-yellow-400 bg-yellow-500/10",
    status: "Identified", statusColor: "text-purple-400 bg-purple-500/10",
  },
  {
    num: 3, title: "Team unclear on Q1 rock milestones", detail: "No weekly check-in cadence established",
    type: "People", owner: "Joe", priority: "Medium", priorityColor: "text-yellow-400 bg-yellow-500/10",
    status: "Solved", statusColor: "text-emerald-400 bg-emerald-500/10",
  },
  {
    num: 4, title: "Slack bot response latency > 5s", detail: "Hormozi KB routing adds 3s delay",
    type: "Tech", owner: "Alex", priority: "Low", priorityColor: "text-muted-foreground bg-muted",
    status: "Identified", statusColor: "text-purple-400 bg-purple-500/10",
  },
  {
    num: 5, title: "Instagram story sharing rate below target", detail: "Only 12% of challenge participants share — need 30%+",
    type: "Process", owner: "Maria", priority: "High", priorityColor: "text-red-400 bg-red-500/10",
    status: "Discussing", statusColor: "text-yellow-400 bg-yellow-500/10",
  },
];

export default function IssuesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Issues List</h1>
        <p className="text-xs text-muted-foreground mt-1">Identify → Discuss → Solve (IDS)</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="text-[11px] font-semibold text-muted-foreground uppercase">
              <th className="text-left pb-3 w-8">#</th>
              <th className="text-left pb-3">Issue</th>
              <th className="text-left pb-3">Type</th>
              <th className="text-left pb-3">Owner</th>
              <th className="text-left pb-3">Priority</th>
              <th className="text-left pb-3">IDS Status</th>
            </tr>
          </thead>
          <tbody>
            {DATA.map((issue) => (
              <tr key={issue.num} className="border-t border-border/50 hover:bg-secondary/20">
                <td className="py-3 text-xs text-muted-foreground">{issue.num}</td>
                <td className="py-3">
                  <div className="text-xs font-semibold text-foreground">{issue.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{issue.detail}</div>
                </td>
                <td className="py-3">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-purple-400 bg-purple-500/10">
                    {issue.type}
                  </span>
                </td>
                <td className="py-3 text-xs text-foreground">{issue.owner}</td>
                <td className="py-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${issue.priorityColor}`}>
                    {issue.priority}
                  </span>
                </td>
                <td className="py-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${issue.statusColor}`}>
                    {issue.status}
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
