import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default async function Home() {
  const supabase = createClient();
  const { data: users } = await supabase.functions.invoke("users");
  console.log(users);
  return (
    <div className="landing-page">
      {/* Background orbs */}
      <div
        className="bg-orb bg-orb-violet"
        style={{ width: 600, height: 600, top: -200, left: -200 }}
      />
      <div
        className="bg-orb bg-orb-purple"
        style={{ width: 500, height: 500, bottom: -100, right: -100 }}
      />

      {/* Nav */}
      <nav className="topbar bg-transparent! border-none! pt-4 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2">
          <div className="landing-logo-icon">💸</div>
          <span className="landing-logo-name">expendee</span>
        </div>
        <div className="landing-nav-links">
          <Link
            href="/login"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Sign In
          </Link>
          <Link href="/signup" className={buttonVariants({ size: "sm" })}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="landing-main max-w-[1200px] mx-auto text-center">
        {/* Badge */}
        <div className="badge badge-violet mb-6 anim-fade-in">
          🎉 Expendee 2.0 is now live
        </div>

        {/* Title */}
        <h1 className="hero-title anim-fade-up mx-auto">
          Smart expense management <br />
          for <span className="gradient-text">modern teams</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle anim-fade-up delay-100 mx-auto">
          Track, manage, and analyze your company&apos;s spending in real-time.
          Built for speed, designed for clarity.
        </p>

        {/* CTA */}
        <div className="hero-cta anim-fade-up delay-200">
          <Link
            href="/signup"
            className={buttonVariants({
              size: "lg",
              className: "h-14 px-7 text-[15px]",
            })}
          >
            <span>🚀</span> Start for free
          </Link>
          <Link
            href="/login"
            className={buttonVariants({
              variant: "secondary",
              size: "lg",
              className: "h-14 px-7 text-[15px]",
            })}
          >
            Sign in to your account
          </Link>
        </div>

        {/* Feature bullets */}
        <div className="hero-features">
          {[
            "Real-time syncing",
            "Role-based access",
            "Category analytics",
            "CSV export",
            "Supabase-powered",
          ].map((f) => (
            <div key={f} className="hero-feature-item">
              <div className="hero-feature-dot" />
              {f}
            </div>
          ))}
        </div>

        {/* Preview card */}
        <div
          className="glass-card anim-fade-up delay-400 mx-auto"
          style={{
            marginTop: 64,
            padding: "28px 32px",
            maxWidth: 700,
            width: "100%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 20,
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                fontWeight: 500,
              }}
            >
              Recent Expenses
            </div>
            <div className="badge badge-green" style={{ marginLeft: "auto" }}>
              Live
            </div>
          </div>
          {[
            {
              title: "AWS Infrastructure",
              amount: "$340.00",
              category: "Tech",
              badge: "badge-blue",
            },
            {
              title: "Team Lunch",
              amount: "$87.50",
              category: "Food",
              badge: "badge-amber",
            },
            {
              title: "Figma Pro",
              amount: "$45.00",
              category: "Design",
              badge: "badge-violet",
            },
            {
              title: "Flight — NYC",
              amount: "$610.00",
              category: "Travel",
              badge: "badge-pink",
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className={`anim-fade-in delay-${(i + 1) * 100}`}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: i < 3 ? "1px solid var(--border-subtle)" : "none",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--text-primary)",
                  }}
                >
                  {item.title}
                </div>
              </div>
              <div
                className={`badge ${item.badge}`}
                style={{ marginRight: 16 }}
              >
                {item.category}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {item.amount}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
