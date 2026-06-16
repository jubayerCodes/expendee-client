"use client";

import { useState, useEffect, useCallback } from "react";
import { getExpenses } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useActiveTeam } from "@/hooks/useActiveTeam";
import { useRouter } from "next/navigation";
import { useRealtimeExpenses } from "@/hooks/useRealtimeExpenses";
import { useAuth } from "@/hooks/useAuth";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/types/database.types";
import { createClient } from "@/lib/supabase/client";

type Expense = Database["public"]["Tables"]["expenses"]["Row"];
type ExpenseWithUser = Expense & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"];
};

const categoryColors: Record<string, string> = {
  Software: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Travel: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Office: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Meals: "bg-green-500/10 text-green-400 border-green-500/20",
  Marketing: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Other: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function ExpensesPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialExpenses, setInitialExpenses] = useState<ExpenseWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const { getToken } = useAuth();
  const token = getToken();
  const { activeTeam, loading: teamsLoading } = useActiveTeam();

  const loadExpenses = useCallback(async () => {
    if (!token || !activeTeam) {
      setInitialExpenses([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getExpenses(activeTeam.id);
      setInitialExpenses(data);
    } catch (err) {
      console.error(err);
      setInitialExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [token, activeTeam]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadExpenses();
  }, [loadExpenses]);

  const expenses = useRealtimeExpenses(activeTeam?.id || "", initialExpenses);

  // Filter expenses
  const filtered = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.profiles?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleViewReceipt = async (expense: Expense) => {
    const supabase = createClient();

    if (expense.receipt_url) {
      try {
        const { data, error } = await supabase.storage
          .from("receipts")
          .download(expense.receipt_url);

        if (error) throw error;

        if (data) {
          const url = window.URL.createObjectURL(data);
          const a = document.createElement("a");
          a.href = url;
          a.download = expense.receipt_url;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error("Error fetching receipt URL:", error);
        // Optional: Show an error toast
      }
    }
  };

  const totalAmount = filtered.reduce((sum, e) => sum + Number(e.amount), 0);
  const categories = [
    "All",
    "Software",
    "Travel",
    "Office",
    "Meals",
    "Marketing",
    "Other",
  ];

  if (teamsLoading || loading) {
    return (
      <div className="main-content flex items-center justify-center min-h-screen">
        <div className="text-sm text-muted-foreground animate-pulse">
          Loading expenses...
        </div>
      </div>
    );
  }

  if (!activeTeam) {
    return (
      <div className="main-content flex flex-col items-center justify-center p-10 text-center min-h-[80vh]">
        <div className="text-4xl mb-4">💸</div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          No Active Team
        </h1>
        <p className="text-muted-foreground max-w-sm mb-6">
          You need to be in a team to view expenses.
        </p>
        <Button onClick={() => router.push("/teams")}>Go to Teams</Button>
      </div>
    );
  }

  return (
    <>
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar anim-fade-in">
          <div className="text-[14px] font-medium text-muted-foreground flex items-center gap-2">
            Overview
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="text-foreground">Expenses</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="text-foreground font-semibold">
              {activeTeam.name}
            </span>
          </div>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mr-1.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Expense
          </Button>
        </header>

        <main className="page-content anim-slide-up">
          <div className="page-header">
            <h1 className="page-title">Expenses</h1>
            <p className="page-subtitle">
              All transactions for {activeTeam.name}.
            </p>
          </div>

          {/* Summary row */}
          <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
            <span>
              <span className="text-foreground font-semibold">
                {filtered.length}
              </span>{" "}
              transactions
            </span>
            <span>
              Total:{" "}
              <span className="text-foreground font-semibold">
                ${totalAmount.toFixed(2)}
              </span>
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by title or member..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Category filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">
                    Title
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">
                    Category
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">
                    Added By
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">
                    Date
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-right">
                    Amount
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-center">
                    Receipt
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-16 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="opacity-30"
                        >
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                        <span className="text-sm">
                          {search || categoryFilter !== "All"
                            ? "No expenses match your filters"
                            : "No expenses yet — add your first one"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((expense) => (
                    <TableRow
                      key={expense.id}
                      className="border-border hover:bg-white/2 transition-colors"
                    >
                      {/* Title */}
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center shrink-0">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-muted-foreground"
                            >
                              <rect x="2" y="5" width="20" height="14" rx="2" />
                              <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              {expense.title}
                            </div>
                            {expense.notes && (
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {expense.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[11px] font-medium border ${categoryColors[expense.category ?? "Other"] ?? categoryColors["Other"]}`}
                        >
                          {expense.category ?? "Other"}
                        </Badge>
                      </TableCell>

                      {/* Added by */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-semibold text-foreground shrink-0">
                            {(
                              expense.profiles?.full_name ||
                              expense.profiles?.email ||
                              "?"
                            )
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {expense.profiles?.full_name ||
                              expense.profiles?.email ||
                              "Unknown"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(expense.created_at || "").toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right">
                        <span className="text-sm font-semibold text-foreground">
                          ${Number(expense.amount).toFixed(2)}
                        </span>
                      </TableCell>

                      {/* Receipt */}
                      <TableCell className="text-center">
                        {expense.receipt_url ? (
                          <Button
                            title="View receipt"
                            onClick={() => handleViewReceipt(expense)}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground/30 text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      {activeTeam && (
        <AddExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          token={token || null}
          activeTeamId={activeTeam.id}
        />
      )}
    </>
  );
}
