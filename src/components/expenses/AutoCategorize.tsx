// src/components/expenses/AutoCategorize.tsx
import { useAutoCategorize } from "@/hooks/useAutoCategorize";
import { useState } from "react";

export function AutoCategorize({ team_id }: { team_id: string }) {
  const { suggestedCategory, loading, error, categorizeExpense } =
    useAutoCategorize();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);

  return (
    <div className="auto-categorize">
      <h2>AI Auto-Categorize</h2>

      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Expense description (e.g., 'Restaurant dinner with friends')"
      />

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(parseFloat(e.target.value))}
        placeholder="Amount"
      />

      <button
        onClick={() => categorizeExpense(description, amount, team_id)}
        disabled={loading || !description}
      >
        {loading ? "Categorizing..." : "Get Suggested Category"}
      </button>

      {error && <div className="error">{error}</div>}

      {suggestedCategory && (
        <div className="suggestion">
          <strong>Suggested Category:</strong> {suggestedCategory}
        </div>
      )}
    </div>
  );
}
