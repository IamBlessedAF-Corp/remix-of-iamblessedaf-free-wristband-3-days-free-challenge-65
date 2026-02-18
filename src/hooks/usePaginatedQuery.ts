import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type TableName = "orders" | "smart_wristband_waitlist" | "sms_deliveries" | "sms_audit_log" | "clip_submissions" | "expert_leads";

interface UsePaginatedQueryOptions {
  table: TableName;
  queryKey: string;
  pageSize?: number;
  orderBy?: string;
  ascending?: boolean;
  select?: string;
}

export function usePaginatedQuery<T = Record<string, any>>({
  table,
  queryKey,
  pageSize = 50,
  orderBy = "created_at",
  ascending = false,
  select: selectCols = "*",
}: UsePaginatedQueryOptions) {
  const [page, setPage] = useState(0);

  const { data: totalCount = 0 } = useQuery({
    queryKey: [queryKey, "count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const { data = [], isLoading } = useQuery({
    queryKey: [queryKey, page, pageSize],
    queryFn: async () => {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data, error } = await supabase
        .from(table)
        .select(selectCols)
        .order(orderBy, { ascending })
        .range(from, to);
      if (error) throw error;
      return data as T[];
    },
  });

  return {
    data,
    isLoading,
    page,
    totalPages,
    totalCount,
    pageSize,
    nextPage: () => setPage(p => Math.min(p + 1, totalPages - 1)),
    prevPage: () => setPage(p => Math.max(p - 1, 0)),
    goToPage: (p: number) => setPage(Math.max(0, Math.min(p, totalPages - 1))),
  };
}
