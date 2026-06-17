import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL; // http://localhost:5000/api/v1

export async function getAuthHeader() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}` };
}

export async function getExpenses(teamId: string) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_URL}/expense?team_id=${teamId}`, {
    headers,
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Failed to fetch expenses");
  }
  return res.json();
}

export async function createExpense(data: {
  title: string;
  amount: number;
  category: string;
  team_id: string;
  notes?: string;
  receipt_url?: string; // ← add this
}) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_URL}/expense`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function deleteExpense(expenseId: string) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_URL}/expense/${expenseId}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Failed to delete expense");
  }
  return res.json();
}

export async function getTeams() {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_URL}/team`, {
    headers,
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Failed to fetch teams");
  }
  return res.json();
}

export async function createTeam(name: string) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_URL}/team`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Failed to create team");
  }
  return res.json();
}

export async function getTeamMembers(teamId: string) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_URL}/team/${teamId}/members`, {
    headers,
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Failed to fetch team members");
  }
  return res.json();
}

export async function addTeamMember(teamId: string, email: string) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_URL}/team/${teamId}/members`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Failed to add team member");
  }
  return res.json();
}
