// src/hooks/useAutoCategorize.ts
import { getAuthHeader } from "@/lib/api";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function useAutoCategorize() {
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function categorizeExpense(
    description: string,
    amount: number,
    team_id: string,
  ) {
    try {
      setLoading(true);
      setError(null);

      const headers = await getAuthHeader();
      const response = await fetch(`${API_URL}/expenses/auto-categorize`, {
        method: "POST",
        headers,
        body: JSON.stringify({ description, amount, team_id }),
      });

      if (!response.ok) {
        throw new Error("Categorization failed");
      }

      const data = await response.json();
      setSuggestedCategory(data.suggested_category);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { suggestedCategory, loading, error, categorizeExpense };
}
