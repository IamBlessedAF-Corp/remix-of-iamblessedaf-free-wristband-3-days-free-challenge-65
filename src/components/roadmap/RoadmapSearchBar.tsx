import { Search, X, Filter } from "lucide-react";

export interface RoadmapFilters {
  keyword: string;
  status: string;
  priority: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "done", label: "✅ Done" },
  { value: "in-progress", label: "🔄 In Progress" },
  { value: "blocked", label: "🚫 Blocked" },
  { value: "planned", label: "📋 Planned" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "All Priorities" },
  { value: "critical", label: "🔴 Critical" },
  { value: "high", label: "🟠 High" },
  { value: "medium", label: "🔵 Medium" },
  { value: "low", label: "⚪ Low" },
];

interface RoadmapSearchBarProps {
  filters: RoadmapFilters;
  onChange: (filters: RoadmapFilters) => void;
  matchCount: number;
  totalCount: number;
}

export default function RoadmapSearchBar({ filters, onChange, matchCount, totalCount }: RoadmapSearchBarProps) {
  const hasFilters = filters.keyword || filters.status || filters.priority;

  const clearAll = () => onChange({ keyword: "", status: "", priority: "" });

  return (
    <div className="bg-card border border-border/50 rounded-xl p-3 space-y-2">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={filters.keyword}
          onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
          placeholder="Search roadmap items, tracking metrics, optimizations…"
          className="w-full pl-9 pr-9 py-2 text-xs bg-secondary/40 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
        {filters.keyword && (
          <button
            onClick={() => onChange({ ...filters, keyword: "" })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3 h-3 text-muted-foreground shrink-0" />
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="text-[11px] px-2 py-1 rounded-md bg-secondary/40 border border-border/50 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={filters.priority}
          onChange={(e) => onChange({ ...filters, priority: e.target.value })}
          className="text-[11px] px-2 py-1 rounded-md bg-secondary/40 border border-border/50 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
        >
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {hasFilters && (
          <>
            <button
              onClick={clearAll}
              className="text-[10px] px-2 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors font-medium"
            >
              Clear All
            </button>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {matchCount} of {totalCount} items
            </span>
          </>
        )}
      </div>
    </div>
  );
}
