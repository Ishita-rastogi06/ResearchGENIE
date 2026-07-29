import { Link } from "react-router-dom";

const CHECK = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Hero() {
  return (
    <section style={{
  backgroundColor: "#FAFAF8",
  height: "calc(100vh - 68px)",
  display: "flex",
  alignItems: "center",
  transform: "translateY(-35px)",
  position: "relative",
  overflow: "hidden",
}}>
      {/* Subtle gradient orbs */}
      <div style={{
        position: "absolute", top: "-100px", left: "-100px",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(var(--primary-rgb),0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-80px", right: "0",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(212,148,58,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: "1120px",
        margin: "0 auto",
        padding: "0 40px",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "60px",
        alignItems: "center",
      }}>

        {/* ── Left ── */}
        <div>
          {/* Headline */}
          <h1 style={{
            fontSize: "54px",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-2px",
            color: "#1A2420",
            marginBottom: "20px",
          }}>
            Understand<br />
            Research<br />
            <span style={{ color: "var(--primary)" }}>Like Never</span><br />
            <span style={{ color: "var(--primary)" }}>Before</span>
          </h1>

          {/* Description */}
          <p style={{
            fontSize: "16px",
            lineHeight: "1.7",
            color: "#6B7280",
            marginBottom: "20px",
            maxWidth: "460px",
          }}>
            Upload research papers, ask AI questions grounded in the document,
            generate summaries, find research gaps and compare papers — all in seconds.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
            {[
              "Citation-backed answers with exact page references",
              "Research gap finder & future research directions",
              "Auto-generated flashcards, quizzes and mind maps",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CHECK />
                <span style={{ fontSize: "15px", color: "#4B5563" }}>{item}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
            <Link
              to="/register"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "13px 28px",
                fontSize: "15px", fontWeight: 600,
                color: "#FFFFFF",
                background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
                borderRadius: "10px",
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(var(--primary-rgb),0.35)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(var(--primary-rgb),0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(var(--primary-rgb),0.35)"; }}
            >
              Start for Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
            <Link
              to="/login"
              style={{
                display: "inline-flex", alignItems: "center",
                padding: "13px 24px",
                fontSize: "15px", fontWeight: 500,
                color: "#374151",
                border: "1.5px solid #E5E7EB",
                borderRadius: "10px",
                textDecoration: "none",
                backgroundColor: "#FFFFFF",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E7EB"}
            >
              Sign in
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: "36px",
            paddingTop: "28px",
            borderTop: "1px solid #E5E7EB",
          }}>
            {[
              { num: "10K+", label: "Papers analyzed" },
              { num: "94%", label: "Citation accuracy" },
              { num: "45s", label: "Avg. analysis time" },
            ].map(({ num, label }) => (
              <div key={label}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#1A2420", letterSpacing: "-0.5px" }}>{num}</div>
                <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right — Dashboard Mock ── */}
        <div style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: "28px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
        }}>
          {/* Window chrome */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              {["#FF5F57","#FFBD2E","#28C840"].map(c => (
                <div key={c} style={{ width: "11px", height: "11px", borderRadius: "50%", backgroundColor: c }} />
              ))}
            </div>
            <span style={{
              fontSize: "11px", fontWeight: 600,
              padding: "4px 10px",
              backgroundColor: "var(--primary-bg)",
              color: "var(--primary)",
              borderRadius: "6px",
              border: "1px solid #BBD9C2",
            }}>● AI Active</span>
          </div>

          {/* Upload card */}
          <div style={{
            backgroundColor: "#F9FAFB",
            borderRadius: "12px",
            padding: "14px 16px",
            marginBottom: "12px",
            display: "flex", alignItems: "center", gap: "12px",
            border: "1px solid #F3F4F6",
          }}>
            <div style={{
              width: "38px", height: "38px", flexShrink: 0,
              backgroundColor: "var(--primary-bg)",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>transformer_attention.pdf</div>
              <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>24 pages · 312 chunks indexed</div>
            </div>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              backgroundColor: "var(--primary)",
              animation: "pulse 2s infinite",
              flexShrink: 0,
            }} />
          </div>

          {/* Summary card */}
          <div style={{
            backgroundColor: "#F9FAFB",
            borderRadius: "12px",
            padding: "14px 16px",
            marginBottom: "12px",
            border: "1px solid #F3F4F6",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div style={{
                width: "28px", height: "28px",
                backgroundColor: "rgba(212,148,58,0.12)",
                borderRadius: "7px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4943A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                </svg>
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>AI Summary</span>
            </div>
            <p style={{ fontSize: "12px", lineHeight: "1.65", color: "#6B7280" }}>
              Transformer architecture replaces recurrence with multi-head self-attention,
              enabling superior parallelization and state-of-the-art NLP performance.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
