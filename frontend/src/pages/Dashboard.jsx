import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const STAT_CARDS = [
  {
    key: "papers", label: "Papers Uploaded",
    color: "var(--primary)", bg: "var(--primary-bg)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
  {
    key: "questions", label: "Questions Asked",
    color: "#D4943A", bg: "#FEF9F0",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4943A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    key: "summaries", label: "Summaries Generated",
    color: "var(--primary)", bg: "var(--primary-bg)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    key: "comparisons", label: "Comparisons Done",
    color: "#D4943A", bg: "#FEF9F0",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4943A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="8" x2="6" y2="8"/><line x1="18" y1="16" x2="6" y2="16"/>
        <polyline points="9 4 3 8 9 12"/><polyline points="15 12 21 16 15 20"/>
      </svg>
    ),
  },
];

const QUICK_ACTIONS = [
  {
    to: "/upload", label: "Upload Paper", sub: "Add a new PDF",
    bg: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
  },
  {
    to: "/analysis", label: "Analysis", sub: "View AI insights",
    bg: "linear-gradient(135deg, #B8730A 0%, #D4943A 100%)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    to: "/compare", label: "Compare", sub: "Side-by-side AI",
    bg: "linear-gradient(135deg, #3A6B50 0%, var(--primary) 100%)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="8" x2="6" y2="8"/><line x1="18" y1="16" x2="6" y2="16"/>
        <polyline points="9 4 3 8 9 12"/><polyline points="15 12 21 16 15 20"/>
      </svg>
    ),
  },
];

function StatCard({ label, value, color, bg, icon, loading }) {
  return (
    <div style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "16px",
      padding: "28px 24px",
      border: "1px solid #E8E4DA",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      flex: 1,
    }}>
      <div style={{
        width: "48px", height: "48px",
        backgroundColor: bg,
        borderRadius: "14px",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "20px",
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: "48px",
        fontWeight: 900,
        color: "#1A2420",
        lineHeight: 1,
        letterSpacing: "-2px",
        marginBottom: "8px",
      }}>
        {loading ? "—" : value}
      </div>
      <div style={{ fontSize: "13px", fontWeight: 500, color: "#9CA3AF" }}>{label}</div>
    </div>
  );
}

function QuickAction({ to, label, sub, bg, icon }) {
  return (
    <Link
      to={to}
      style={{
        display: "flex", alignItems: "center", gap: "16px",
        padding: "20px 22px",
        background: bg,
        borderRadius: "16px",
        textDecoration: "none",
        flex: 1,
        boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.18)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.12)"; }}
    >
      <div style={{
        width: "44px", height: "44px", flexShrink: 0,
        backgroundColor: "rgba(255,255,255,0.18)",
        borderRadius: "12px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF", marginBottom: "3px" }}>{label}</p>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>{sub}</p>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ papers: 0, questions: 0, summaries: 0, comparisons: 0 });
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "Researcher";

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/stats").catch(() => ({ data: {} })),
      api.get("/papers?limit=6").catch(() => ({ data: [] })),
    ]).then(([statsRes, papersRes]) => {
      setStats(statsRes.data || {});
      setPapers(papersRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "36px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#1A2420", letterSpacing: "-1px", marginBottom: "6px" }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ fontSize: "15px", color: "#6B7280" }}>
            Here's what's happening with your research today.
          </p>
        </div>
        <Link
          to="/upload"
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "12px 22px",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
            borderRadius: "10px",
            fontSize: "14px", fontWeight: 600,
            color: "#FFFFFF",
            textDecoration: "none",
            boxShadow: "0 3px 10px rgba(var(--primary-rgb),0.35)",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload Paper
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        {STAT_CARDS.map(({ key, label, color, bg, icon }) => (
          <StatCard key={key} label={label} value={stats[key] ?? 0} color={color} bg={bg} icon={icon} loading={loading} />
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#1A2420", marginBottom: "14px", letterSpacing: "-0.3px" }}>
          Quick Actions
        </h2>
        <div style={{ display: "flex", gap: "14px" }}>
          {QUICK_ACTIONS.map((a) => <QuickAction key={a.to} {...a} />)}
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px" }}>

        {/* Recent Papers */}
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E8E4DA",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid #F0EDE6",
          }}>
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#1A2420", letterSpacing: "-0.3px" }}>
              Recent Papers
            </h2>
            <Link to="/upload" style={{
              display: "flex", alignItems: "center", gap: "4px",
              fontSize: "13px", fontWeight: 500, color: "var(--primary)", textDecoration: "none",
            }}>
              View all
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
              <div style={{
                width: "32px", height: "32px",
                border: "3px solid #E8E4DA",
                borderTop: "3px solid var(--primary)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
            </div>
          ) : papers.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center" }}>
              <div style={{
                width: "56px", height: "56px",
                backgroundColor: "var(--primary-bg)",
                borderRadius: "16px",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "16px",
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>No papers yet</p>
              <p style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "20px" }}>
                Upload your first research paper to get started
              </p>
              <Link
                to="/upload"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "10px 20px",
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
                  borderRadius: "8px",
                  fontSize: "13px", fontWeight: 600,
                  color: "#FFFFFF",
                  textDecoration: "none",
                  boxShadow: "0 2px 8px rgba(var(--primary-rgb),0.3)",
                }}
              >
                Upload Paper
              </Link>
            </div>
          ) : (
            papers.map((paper, i) => (
              <div
                key={paper.id}
                style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "16px 24px",
                  borderBottom: i < papers.length - 1 ? "1px solid #F8F6F0" : "none",
                }}
              >
                <div style={{
                  width: "40px", height: "40px", flexShrink: 0,
                  backgroundColor: "var(--primary-bg)",
                  borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A2420", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "2px" }}>
                    {paper.title}
                  </p>
                  <p style={{ fontSize: "12px", color: "#9CA3AF" }}>{paper.authors} · {paper.year}</p>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <Link to={`/analysis?paper=${paper.id}`} style={{
                    padding: "5px 12px", fontSize: "11px", fontWeight: 600,
                    color: "#D4943A", backgroundColor: "#FEF9F0",
                    borderRadius: "6px", textDecoration: "none",
                  }}>
                    Analyze
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI Insight */}
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E8E4DA",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#1A2420", letterSpacing: "-0.3px" }}>
            AI Insight
          </h2>

          {/* Tip card */}
          <div style={{
            backgroundColor: "#FFFBF2",
            border: "1px solid #F5E4C0",
            borderRadius: "12px",
            padding: "18px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <div style={{
                width: "32px", height: "32px",
                backgroundColor: "rgba(212,148,58,0.12)",
                borderRadius: "8px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px",
              }}>✦</div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#1A2420" }}>Tip of the Day</span>
            </div>
            <p style={{ fontSize: "13px", lineHeight: "1.7", color: "#4B5563" }}>
              Use <span style={{ fontWeight: 700, color: "var(--primary)" }}>Semantic Search</span> to find
              exact paragraphs instead of scrolling through the entire paper.
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { icon: "⏱", label: "Average analysis time", value: "45 seconds" },
              { icon: "🎯", label: "RAG accuracy", value: "94% citation rate" },
              { icon: "📄", label: "Supported formats", value: "PDF up to 50MB" },
              { icon: "🧠", label: "AI model", value: "Groq LLaMA 3 70B" },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px",
                backgroundColor: "#F8F6F0",
                borderRadius: "10px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px" }}>{icon}</span>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>{label}</span>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#1A2420" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
}
