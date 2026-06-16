"use client";

import { useState, useEffect } from "react";
import { StatsCard } from "@/components/StatsCard";
import { ExpenseList } from "@/components/ExpenseList";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { getExpenses } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useActiveTeam } from "@/hooks/useActiveTeam";
import { useRouter } from "next/navigation";
import { useRealtimeExpenses } from "@/hooks/useRealtimeExpenses";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [initialExpenses, setInitialExpenses] = useState<any[]>([]);
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const token = getToken();

  const { activeTeam, loading: teamsLoading, refreshTeams } = useActiveTeam();

  // Listen to activeTeamChanged events
  useEffect(() => {
    const handleTeamChanged = () => refreshTeams();
    window.addEventListener("activeTeamChanged", handleTeamChanged);
    return () =>
      window.removeEventListener("activeTeamChanged", handleTeamChanged);
  }, [refreshTeams]);

  async function loadExpenses() {
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
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeTeam]);

  const expenses = useRealtimeExpenses(activeTeam?.id || "", initialExpenses);

  const totalAmount = initialExpenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0,
  );

  // If loading teams context
  if (teamsLoading || loading) {
    return (
      <div className="main-content flex items-center justify-center min-h-screen">
        <div className="text-sm text-muted-foreground animate-pulse">
          Loading workspace...
        </div>
      </div>
    );
  }

  // If not loading, and user is in no teams
  if (!teamsLoading && !activeTeam) {
    return (
      <div className="main-content flex flex-col items-center justify-center p-10 text-center min-h-[80vh]">
        <div className="text-4xl mb-4">👥</div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          No Active Team Workspace
        </h1>
        <p className="text-muted-foreground max-w-sm mb-6">
          You must belong to a team to view or add expenses. Create a team or
          ask your admin to onboard you.
        </p>
        <Button onClick={() => router.push("/teams")}>
          Create or Manage Teams
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="main-content">
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
            <span className="text-foreground">Dashboard</span>
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
              {activeTeam?.name}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" className="btn-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </Button>
            <Button
              id="dashboard-add-expense"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
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
          </div>
        </header>

        <main className="page-content anim-slide-up">
          <div className="page-header">
            <h1 className="page-title">{activeTeam?.name} Dashboard</h1>
            <p className="page-subtitle">
              Here&apos;s what&apos;s happening with your team&apos;s finances.
            </p>
          </div>

          <div className="stats-grid">
            <StatsCard
              label="Total Spent"
              value={`$${totalAmount.toFixed(2)}`}
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
              colorVariant="violet"
              change="Total accumulated expenses"
              changeType="neutral"
              loading={loading}
            />
            <StatsCard
              label="Active Expenses"
              value={expenses.length.toString()}
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              }
              colorVariant="amber"
              change="Transactions recorded"
              changeType="neutral"
              loading={loading}
            />
            <StatsCard
              label="Team Members"
              value="Verified Workspace"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              }
              colorVariant="blue"
              change="Strict member access"
              changeType="neutral"
              loading={loading}
            />
          </div>

          <div className="glass-card mt-8 p-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold tracking-tight">
                Recent Transactions
              </h2>
            </div>
            <ExpenseList expenses={expenses} loading={loading} />
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
