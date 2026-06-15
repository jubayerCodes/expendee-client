"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/client";
import { createTeam, getTeamMembers, addTeamMember } from "@/lib/api";
import { useActiveTeam } from "@/hooks/useActiveTeam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
});

const onboardMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type CreateTeamValues = z.infer<typeof createTeamSchema>;
type OnboardMemberValues = z.infer<typeof onboardMemberSchema>;

export default function TeamsPage() {
  const {
    teams,
    activeTeam,
    setActiveTeam,
    loading: teamsLoading,
    refreshTeams,
  } = useActiveTeam();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [memberSuccess, setMemberSuccess] = useState<string | null>(null);
  const [teamSuccess, setTeamSuccess] = useState<string | null>(null);

  const supabase = createClient();

  // Get current user id
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) {
        setCurrentUserId(data.user.id);
      }
    });
  }, [supabase.auth]);

  // Load team members and check if current user is admin
  useEffect(() => {
    async function loadMembers() {
      if (!activeTeam) {
        setMembers([]);
        setIsAdmin(false);
        return;
      }
      try {
        setLoadingMembers(true);
        const data = await getTeamMembers(activeTeam.id);
        setMembers(data);

        // Check user role in active team
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userMember = data.find((m: any) => m.user_id === currentUserId);
        setIsAdmin(userMember?.role === "admin");
      } catch (err) {
        console.error("Failed to load team members:", err);
      } finally {
        setLoadingMembers(false);
      }
    }
    loadMembers();
  }, [activeTeam, currentUserId]);

  // Listen to external team changes (e.g. from Sidebar selector)
  useEffect(() => {
    const handleTeamChanged = () => {
      refreshTeams();
    };
    window.addEventListener("activeTeamChanged", handleTeamChanged);
    return () =>
      window.removeEventListener("activeTeamChanged", handleTeamChanged);
  }, [refreshTeams]);

  // React Hook Form for Create Team
  const {
    register: registerTeam,
    handleSubmit: handleTeamSubmit,
    reset: resetTeamForm,
    formState: { errors: teamErrors, isSubmitting: isCreatingTeam },
  } = useForm<CreateTeamValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { name: "" },
  });

  // React Hook Form for Onboard Member
  const {
    register: registerMember,
    handleSubmit: handleMemberSubmit,
    reset: resetMemberForm,
    formState: { errors: memberErrors, isSubmitting: isAddingMember },
  } = useForm<OnboardMemberValues>({
    resolver: zodResolver(onboardMemberSchema),
    defaultValues: { email: "" },
  });

  const onSubmitTeam = async (values: CreateTeamValues) => {
    try {
      setTeamError(null);
      setTeamSuccess(null);
      const newTeam = await createTeam(values.name);
      setTeamSuccess(`Team "${newTeam.name}" created successfully!`);
      resetTeamForm();
      await refreshTeams();
      // Select the newly created team
      setActiveTeam(newTeam);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setTeamError(err.message || "Failed to create team");
    }
  };

  const onSubmitMember = async (values: OnboardMemberValues) => {
    if (!activeTeam) return;
    try {
      setMemberError(null);
      setMemberSuccess(null);
      await addTeamMember(activeTeam.id, values.email);
      setMemberSuccess(`Successfully added ${values.email} to the team!`);
      resetMemberForm();
      // Reload member listing
      const updatedMembers = await getTeamMembers(activeTeam.id);
      setMembers(updatedMembers);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMemberError(err.message || "Failed to add member");
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
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
            <span className="text-foreground">Team Management</span>
          </div>
        </header>

        <main className="page-content anim-slide-up">
          <div className="page-header">
            <h1 className="page-title">Teams</h1>
            <p className="page-subtitle">
              Manage your spending teams and onboard colleagues.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Active Team Detail Column */}
            <div className="lg:col-span-2 space-y-6">
              {activeTeam ? (
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold tracking-tight">
                          {activeTeam.name}
                        </CardTitle>
                        <CardDescription>Active Team Workspace</CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-white/10 text-accent bg-accent/5"
                      >
                        {isAdmin ? "Admin View" : "Member View"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold mb-3">
                        Team Members
                      </h3>
                      {loadingMembers ? (
                        <div className="py-4 text-center text-sm text-muted-foreground animate-pulse">
                          Loading members...
                        </div>
                      ) : (
                        <div className="border border-white/5 rounded-md overflow-hidden">
                          <Table>
                            <TableHeader className="bg-white/2">
                              <TableRow className="hover:bg-transparent border-white/5">
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {members.map((member) => (
                                <TableRow
                                  key={member.id}
                                  className="border-white/5 hover:bg-white/1"
                                >
                                  <TableCell className="font-medium text-[13px]">
                                    {member.profiles?.full_name ||
                                      "Name Pending"}
                                  </TableCell>
                                  <TableCell className="text-[13px] text-muted-foreground">
                                    {member.profiles?.email}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="secondary"
                                      className={
                                        member.role === "admin"
                                          ? "bg-violet-500/10 text-violet-400 hover:bg-violet-500/10"
                                          : "bg-slate-500/10 text-slate-400 hover:bg-slate-500/10"
                                      }
                                    >
                                      {member.role}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>

                    {/* Onboard form: Only for Admins */}
                    {isAdmin ? (
                      <div className="pt-4 border-t border-white/5">
                        <h3 className="text-sm font-semibold mb-2">
                          Onboard Team Member
                        </h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          Enter the email of a registered user to add them as a
                          team member.
                        </p>

                        {memberSuccess && (
                          <div className="alert alert-success text-xs p-3 mb-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            {memberSuccess}
                          </div>
                        )}
                        {memberError && (
                          <div className="alert alert-error text-xs p-3 mb-4 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400">
                            {memberError}
                          </div>
                        )}

                        <form
                          onSubmit={handleMemberSubmit(onSubmitMember)}
                          className="flex items-end gap-3"
                        >
                          <div className="flex-1 space-y-1.5">
                            <Label htmlFor="member-email" className="text-xs">
                              User Email
                            </Label>
                            <Input
                              id="member-email"
                              type="email"
                              placeholder="colleague@example.com"
                              {...registerMember("email")}
                              disabled={isAddingMember}
                              className="h-9 bg-background/50 border-white/5"
                            />
                            {memberErrors.email && (
                              <p className="text-[11px] text-destructive">
                                {memberErrors.email.message}
                              </p>
                            )}
                          </div>
                          <Button
                            type="submit"
                            size="sm"
                            disabled={isAddingMember}
                            className="h-9"
                          >
                            {isAddingMember ? "Adding..." : "Add Member"}
                          </Button>
                        </form>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-white/5 text-xs text-muted-foreground">
                        💡 Only team admins can onboard new members to this
                        team.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-card flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                  <div className="text-3xl mb-3">👥</div>
                  <h3 className="font-semibold text-lg">No Active Team</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-1">
                    Select a team from the sidebar, or create a new team to
                    begin managing expenses.
                  </p>
                </Card>
              )}
            </div>

            {/* Create Team & Other Teams List Column */}
            <div className="space-y-6">
              {/* Create Team Form */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Create a Team
                  </CardTitle>
                  <CardDescription>
                    Start a new expense tracking team.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teamSuccess && (
                    <div className="text-xs p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      {teamSuccess}
                    </div>
                  )}
                  {teamError && (
                    <div className="text-xs p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400">
                      {teamError}
                    </div>
                  )}

                  <form
                    onSubmit={handleTeamSubmit(onSubmitTeam)}
                    className="space-y-3"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="team-name" className="text-xs">
                        Team Name
                      </Label>
                      <Input
                        id="team-name"
                        placeholder="e.g. Marketing, Engineering"
                        {...registerTeam("name")}
                        disabled={isCreatingTeam}
                        className="h-9 bg-background/50 border-white/5"
                      />
                      {teamErrors.name && (
                        <p className="text-[11px] text-destructive">
                          {teamErrors.name.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      className="w-full h-9"
                      disabled={isCreatingTeam}
                    >
                      {isCreatingTeam ? "Creating..." : "Create Team"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Your Teams List */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Your Teams
                  </CardTitle>
                  <CardDescription>Select a team workspace.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {teamsLoading ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      Loading teams...
                    </div>
                  ) : teams.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      You belong to no teams yet.
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {teams.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setActiveTeam(t)}
                          className={`flex items-center justify-between p-3.5 border-b border-white/5 last:border-b-0 text-left hover:bg-white/2 transition-colors ${
                            activeTeam?.id === t.id
                              ? "bg-white/3 text-foreground font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          <span className="text-[13px]">{t.name}</span>
                          {activeTeam?.id === t.id && (
                            <span className="text-accent text-[11px] font-semibold">
                              Active
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
