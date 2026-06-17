// src/hooks/useSemanticSearch.ts
import { getAuthHeader } from "@/lib/api";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function useSemanticSearch() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function searchExpenses(query: string, team_id: string, limit = 10) {
    try {
      setLoading(true);
      setError(null);

      const headers = await getAuthHeader();
      const response = await fetch(`${API_URL}/expenses/semantic-search`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, limit, team_id }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data.expenses);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { results, loading, error, searchExpenses };
}
