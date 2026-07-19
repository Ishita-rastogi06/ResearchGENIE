import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section style={{ backgroundColor: "#FAFAF8", padding: "100px 0" }}>
      <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "0 40px" }}>
        <div style={{
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#1A2420",
          borderRadius: "24px",
          padding: "80px 64px",
          textAlign: "center",
        }}>
          {/* Decorative orbs */}
          <div style={{
            position: "absolute", top: "-60px", left: "-60px",
            width: "240px", height: "240px",
            background: "radial-gradient(circle, rgba(var(--primary-rgb),0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-60px", right: "-60px",
            width: "240px", height: "240px",
            background: "radial-gradient(circle, rgba(212,148,58,0.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", maxWidth: "580px", margin: "0 auto" }}>
            {/* Badge */}
            <div style={{
              display: "inline-block",
              padding: "5px 14px",
              backgroundColor: "rgba(var(--primary-rgb),0.2)",
              border: "1px solid rgba(var(--primary-rgb),0.3)",
              borderRadius: "100px",
              marginBottom: "24px",
            }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#6DBF80", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                Free to start
              </span>
            </div>

            {/* Headline */}
            <h2 style={{
              fontSize: "44px",
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              marginBottom: "20px",
            }}>
              Ready to Supercharge<br />
              <span style={{ color: "var(--primary-light)" }}>Your Research?</span>
            </h2>

            {/* Subtext */}
            <p style={{
              fontSize: "16px",
              lineHeight: "1.75",
              color: "rgba(255,255,255,0.55)",
              marginBottom: "40px",
            }}>
              Upload a paper, ask AI questions, discover research gaps
              and generate citations — all in under a minute.
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
              <Link
                to="/register"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "14px 32px",
                  fontSize: "15px", fontWeight: 600,
                  color: "#FFFFFF",
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
                  borderRadius: "10px",
                  textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(var(--primary-rgb),0.5)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(var(--primary-rgb),0.6)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(var(--primary-rgb),0.5)"; }}
              >
                Get Started Free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
              <Link
                to="/login"
                style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "14px 28px",
                  fontSize: "15px", fontWeight: 500,
                  color: "rgba(255,255,255,0.75)",
                  border: "1.5px solid rgba(255,255,255,0.15)",
                  borderRadius: "10px",
                  textDecoration: "none",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
