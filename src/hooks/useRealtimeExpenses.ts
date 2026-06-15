// frontend/hooks/useRealtimeExpenses.ts
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";

type Expense = Database["public"]["Tables"]["expenses"]["Row"];

export function useRealtimeExpenses(
  teamId: string,
  initialData: Expense[] = [],
) {
  const [expenses, setExpenses] = useState<Expense[]>(initialData);
  const supabase = createClient();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpenses(initialData);
  }, [initialData]);

  useEffect(() => {
    if (!teamId) return;

    // Subscribe to all changes on expenses table for this team
    const channel = supabase
      .channel(`expenses:${teamId}`) // unique channel name per team
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `team_id=eq.${teamId}`, // only this team's expenses
        },
        (payload) => {
          console.log("Realtime event:", payload.eventType, payload);

          if (payload.eventType === "INSERT") {
            setExpenses((prev) => [payload.new as Expense, ...prev]);
          }

          if (payload.eventType === "UPDATE") {
            setExpenses((prev) =>
              prev.map((e) =>
                e.id === payload.new.id ? (payload.new as Expense) : e,
              ),
            );
          }

          if (payload.eventType === "DELETE") {
            setExpenses((prev) => prev.filter((e) => e.id !== payload.old.id));
          }
        },
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);
  console.log(expenses);
  return expenses;
}
