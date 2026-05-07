import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";

const TABLE_QUERY_MAP: Record<string, string> = {
  employees:        "/api/employees",
  leaves:           "/api/leaves",
  meals:            "/api/meals",
  attendance:       "/api/attendance",
  overtime:         "/api/overtime",
  kitchen_expenses: "/api/kitchen-expenses",
  office_expenses:  "/api/office-expenses",
};

async function fetchConfig(retries = 5, delayMs = 500): Promise<{ supabaseUrl: string; supabaseAnonKey: string }> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch("/api/config");
      const contentType = res.headers.get("content-type") ?? "";
      if (!res.ok || !contentType.includes("application/json")) {
        throw new Error("Not JSON");
      }
      return await res.json();
    } catch {
      if (i < retries - 1) await new Promise(r => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw new Error("Could not reach /api/config");
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    fetchConfig()
      .then(({ supabaseUrl, supabaseAnonKey }) => {
        if (cancelled || !supabaseUrl || !supabaseAnonKey) return;

        const client = createClient(supabaseUrl, supabaseAnonKey);

        const channel = client
          .channel("db-changes")
          .on(
            "postgres_changes" as any,
            { event: "*", schema: "public" },
            (payload: any) => {
              const queryKey = TABLE_QUERY_MAP[payload.table];
              if (queryKey) {
                queryClient.invalidateQueries({ queryKey: [queryKey] });
              }
            }
          )
          .subscribe();

        cleanup = () => {
          channel.unsubscribe();
          client.removeAllChannels();
        };
      })
      .catch((err) => {
        if (!cancelled) console.warn("Realtime setup failed:", err?.message ?? err);
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [queryClient]);

  return <>{children}</>;
}
