"use client";

import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorVariant: "violet" | "green" | "amber" | "blue";
  change?: string;
  changeType?: "up" | "down" | "neutral";
  loading?: boolean;
}

export function StatsCard({
  label,
  value,
  icon,
  colorVariant,
  change,
  changeType = "neutral",
  loading = false,
}: StatsCardProps) {
  return (
    <Card className={`stat-card stat-card-${colorVariant} border-none bg-card shadow-md`}>
      <CardContent className="p-0">
        <div className={`stat-icon-wrap stat-icon-${colorVariant}`}>{icon}</div>
        {loading ? (
          <>
            <div className="skeleton" style={{ height: 12, width: "60%", marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 32, width: "80%", marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 10, width: "40%" }} />
          </>
        ) : (
          <>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            {change && (
              <div className={`stat-change stat-change-${changeType}`}>
                {changeType === "up" && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                )}
                {changeType === "down" && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
                {change}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
