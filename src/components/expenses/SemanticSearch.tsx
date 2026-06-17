"use client";

import { useSemanticSearch } from "@/hooks/useSemanticSearch";
import { useState } from "react";

export function SemanticSearch({ team_id }: { team_id: string }) {
  const { results, loading, error, searchExpenses } = useSemanticSearch();
  const [query, setQuery] = useState("");

  return (
    <div className="semantic-search">
      <h2>AI Expense Search</h2>

      <div className="search-box">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search: 'food expenses last month' or 'travel costs'"
        />
        <button
          onClick={() => searchExpenses(query, team_id)}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {results.length > 0 && (
        <div className="results">
          <h3>Found {results.length} similar expenses</h3>
          {results.map((expense) => (
            <ExpenseItem key={expense.id} expense={expense} />
          ))}
        </div>
      )}
    </div>
  );
}
