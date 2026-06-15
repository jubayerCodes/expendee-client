import { useState, useEffect, useCallback } from "react";
import { getTeams } from "@/lib/api";

export interface Team {
  id: string;
  name: string;
  created_at: string;
}

export function useActiveTeam() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTeams();
      setTeams(data);

      if (data && data.length > 0) {
        const storedTeamId = localStorage.getItem("active_team_id");
        const found = data.find((t: Team) => t.id === storedTeamId);
        if (found) {
          setActiveTeam(found);
        } else {
          setActiveTeam(data[0]);
          localStorage.setItem("active_team_id", data[0].id);
        }
      } else {
        setActiveTeam(null);
        localStorage.removeItem("active_team_id");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to load teams:", err);
      setError(err.message || "Failed to load teams");
      setTeams([]);
      setActiveTeam(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTeams();
  }, [fetchTeams]);

  const selectActiveTeam = useCallback((team: Team) => {
    setActiveTeam(team);
    localStorage.setItem("active_team_id", team.id);
    // Dispatch custom event to notify other components of team changes
    window.dispatchEvent(new Event("activeTeamChanged"));
  }, []);

  return {
    teams,
    activeTeam,
    setActiveTeam: selectActiveTeam,
    loading,
    error,
    refreshTeams: fetchTeams,
  };
}
