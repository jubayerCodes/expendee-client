"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";

type Expense = Database["public"]["Tables"]["expenses"]["Row"];
type ExpenseWithUser = Expense & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"];
};

const supabase = createClient();

// Fetch single expense with profile — called after realtime event
async function fetchExpenseWithProfile(
  id: string,
): Promise<ExpenseWithUser | null> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*, profiles(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as ExpenseWithUser;
}

export function useRealtimeExpenses(
  teamId: string,
  initialData: ExpenseWithUser[] = [],
) {
  const [expenses, setExpenses] = useState<ExpenseWithUser[]>(initialData);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpenses(initialData);
  }, [initialData]);

  useEffect(() => {
    if (!teamId) return;

    const channel = supabase
      .channel(`expenses:${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `team_id=eq.${teamId}`,
        },
        async (payload) => {
          console.log("Realtime event:", payload.eventType);

          if (payload.eventType === "INSERT") {
            // Fetch full expense with profile instead of using raw payload
            const full = await fetchExpenseWithProfile(payload.new.id);
            if (full) setExpenses((prev) => [full, ...prev]);
          }

          if (payload.eventType === "UPDATE") {
            const full = await fetchExpenseWithProfile(payload.new.id);
            if (full) {
              setExpenses((prev) =>
                prev.map((e) => (e.id === full.id ? full : e)),
              );
            }
          }

          if (payload.eventType === "DELETE") {
            setExpenses((prev) => prev.filter((e) => e.id !== payload.old.id));
            // DELETE doesn't need a fetch — we just remove by id
          }
        },
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  return expenses;
}
