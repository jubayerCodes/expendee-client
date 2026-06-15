"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useActiveTeam } from "@/hooks/useActiveTeam";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const navItems = [
  {
    section: "Main",
    items: [
      {
        id: "nav-dashboard",
        label: "Dashboard",
        href: "/dashboard",
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        id: "nav-teams",
        label: "Teams",
        href: "/teams",
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Insights",
    items: [
      {
        id: "nav-analytics",
        label: "Analytics",
        href: "#",
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        ),
      },
      {
        id: "nav-reports",
        label: "Reports",
        href: "#",
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Settings",
    items: [
      {
        id: "nav-settings",
        label: "Settings",
        href: "#",
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState("");

  const {
    teams,
    activeTeam,
    setActiveTeam,
    loading: teamsLoading,
  } = useActiveTeam();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });
  }, [supabase.auth]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "U";

  return (
    <aside className="sidebar anim-slide-in">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">💸</div>
        <span className="sidebar-logo-text">expendee</span>
      </div>

      {/* Team Switcher */}
      <div className="px-4 mb-4">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
          Active Team
        </label>
        {teamsLoading ? (
          <div className="h-9 w-full rounded-md border border-white/5 bg-white/2 animate-pulse" />
        ) : teams.length === 0 ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs justify-start border-dashed border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/2"
            onClick={() => router.push("/teams")}
          >
            + Create a Team
          </Button>
        ) : (
          <Select
            value={activeTeam?.name || ""}
            onValueChange={(val) => {
              const selected = teams.find((t) => t.id === val);

              if (selected) {
                setActiveTeam(selected);
              }
            }}
          >
            <SelectTrigger className="w-full h-9 bg-white/2 border-white/5 text-[13px] font-medium text-foreground">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/5 text-foreground">
              {teams.map((team) => (
                <SelectItem
                  key={team.id}
                  value={team.id}
                  className="text-[13px] text-foreground hover:bg-white/5"
                >
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            <div className="flex flex-col items-stretch gap-2">
              {section.items.map((item) => (
                <Link
                  key={item.id}
                  id={item.id}
                  href={item.href}
                  className={`sidebar-item ${pathname === item.href ? "active" : ""}`}
                >
                  <span className="item-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{userEmail || "Loading..."}</div>
            <div className="sidebar-user-role">Member</div>
          </div>
          <Button
            id="sidebar-logout"
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 ml-1"
            title="Sign out"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </Button>
        </div>
      </div>
    </aside>
  );
}
