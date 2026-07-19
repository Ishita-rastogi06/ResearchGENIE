import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const G = "var(--primary)";
const CARD = { backgroundColor: "#FFFFFF", border: "1px solid #E5E2D8", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" };

function Spinner({ size = 20, color = "#FFFFFF" }) {
  return <div style={{ width: size, height: size, border: `3px solid ${color}40`, borderTop: `3px solid ${color}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />;
}

/* ── Paper Dropdown ── */
function PaperDropdown({ label, papers, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flex: 1 }}>
      <button onClick={() => setOpen(p => !p)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: "14px",
        padding: "18px 22px",
        backgroundColor: selected ? "#FAFAF8" : "#FFFFFF",
        border: `2px solid ${selected ? G : "#E5E2D8"}`,
        borderRadius: "16px", cursor: "pointer",
        textAlign: "left", fontFamily: "Inter, system-ui, sans-serif",
        transition: "all 0.15s",
        boxShadow: selected ? `0 0 0 4px ${G}12` : "none",
      }}
        onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = "#BBD9C2"; }}
        onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = "#E5E2D8"; }}
      >
        <div style={{ width: "44px", height: "44px", flexShrink: 0, backgroundColor: selected ? "var(--primary-bg)" : "#F4F2EC", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
          📄
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: G, letterSpacing: "0.8px", textTransform: "uppercase", margin: "0 0 4px 0" }}>{label}</p>
          {selected ? (
            <>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: "0 0 2px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.title}</p>
              <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>{selected.authors}{selected.year ? ` · ${selected.year}` : ""}</p>
            </>
          ) : (
            <p style={{ fontSize: "15px", color: "#9CA3AF", margin: 0 }}>Click to select a paper</p>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, backgroundColor: "#FFFFFF", border: "1px solid #E5E2D8", borderRadius: "16px", boxShadow: "0 16px 48px rgba(0,0,0,0.12)", zIndex: 100, overflow: "hidden" }}>
          <div style={{ padding: "8px" }}>
            {papers.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", fontSize: "14px", color: "#9CA3AF" }}>No papers uploaded yet.</div>
            ) : papers.map(p => (
              <button key={p.id} onClick={() => { onSelect(p); setOpen(false); }}
                style={{ width: "100%", textAlign: "left", padding: "13px 16px", background: selected?.id === p.id ? "var(--primary-bg)" : "transparent", border: "none", borderRadius: "10px", cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif", transition: "background 0.12s" }}
                onMouseEnter={e => { if (selected?.id !== p.id) e.currentTarget.style.backgroundColor = "#F8F6F0"; }}
                onMouseLeave={e => { if (selected?.id !== p.id) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: "0 0 3px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>{p.authors}{p.year ? ` · ${p.year}` : ""} · {p.pages} pages</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Compare Result ── */
const FEATURES = ["Dataset","Model / Architecture","Accuracy / Performance","Training Method","Evaluation Metrics","Strengths","Weaknesses","Future Work"];

function CompareTable({ result, paperA, paperB }) {
  const rows = result.table?.length ? result.table : FEATURES.map(f => ({ feature: f, paper_a: result.comparison?.[f]?.paper_a || "—", paper_b: result.comparison?.[f]?.paper_b || "—" }));

  return (
    <div style={{ ...CARD, overflow: "hidden", marginBottom: "20px" }}>
      {/* Table header */}
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr", backgroundColor: "#F8F6F0", borderBottom: "1px solid #E5E2D8" }}>
        <div style={{ padding: "16px 20px", fontSize: "13px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.6px" }}>Feature</div>
        <div style={{ padding: "16px 20px", borderLeft: "1px solid #E5E2D8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: G, flexShrink: 0 }} />
            <span style={{ fontSize: "14px", fontWeight: 800, color: G, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{paperA?.title?.slice(0, 28)}…</span>
          </div>
        </div>
        <div style={{ padding: "16px 20px", borderLeft: "1px solid #E5E2D8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#1A2420", flexShrink: 0 }} />
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#1A2420", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{paperB?.title?.slice(0, 28)}…</span>
          </div>
        </div>
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr", borderBottom: i < rows.length - 1 ? "1px solid #F4F2EC" : "none", backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#FAFAF8" }}>
          <div style={{ padding: "16px 20px", fontSize: "14px", fontWeight: 700, color: "#374151" }}>{row.feature}</div>
          <div style={{ padding: "16px 20px", borderLeft: "1px solid #F0EDE6", fontSize: "14px", color: "#4B5563", lineHeight: "1.6" }}>{row.paper_a || "—"}</div>
          <div style={{ padding: "16px 20px", borderLeft: "1px solid #F0EDE6", fontSize: "14px", color: "#4B5563", lineHeight: "1.6" }}>{row.paper_b || "—"}</div>
        </div>
      ))}
    </div>
  );
}

function VerdictCard({ paper, verdict, color, label }) {
  return (
    <div style={{ ...CARD, padding: "24px 28px", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
        <span style={{ fontSize: "12px", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.8px" }}>{label}</span>
        {verdict?.winner && (
          <span style={{ marginLeft: "auto", padding: "3px 10px", backgroundColor: "#FEF9F0", color: "#D4943A", fontSize: "11px", fontWeight: 700, borderRadius: "100px", border: "1px solid #F5E4C0" }}>
            🏆 Winner
          </span>
        )}
      </div>
      <p style={{ fontSize: "16px", fontWeight: 800, color: "#111827", margin: "0 0 8px 0", lineHeight: "1.3" }}>{paper?.title}</p>
      <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 12px 0" }}>{paper?.authors}{paper?.year ? ` · ${paper?.year}` : ""}</p>
      {verdict?.summary && <p style={{ fontSize: "14px", color: "#4B5563", lineHeight: "1.7", margin: 0 }}>{verdict.summary}</p>}
    </div>
  );
}

/* ── Main ── */
export default function Compare() {
  const [papers, setPapers] = useState([]);
  const [paperA, setPaperA] = useState(null);
  const [paperB, setPaperB] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/papers").then(r => setPapers(r.data || [])).catch(() => {});
  }, []);

  const canCompare = paperA && paperB && paperA.id !== paperB.id;

  const compare = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await api.post("/analysis/compare", { paper_a_id: paperA.id, paper_b_id: paperB.id });
      setResult(r.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Comparison failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "30px", fontWeight: 900, color: "#1A2420", letterSpacing: "-0.8px", margin: "0 0 6px 0" }}>Compare Papers</h1>
        <p style={{ fontSize: "15px", color: "#9CA3AF", margin: 0 }}>AI-powered side-by-side analysis of two research papers</p>
      </div>

      {/* Paper selectors */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", alignItems: "stretch" }}>
        <PaperDropdown label="Paper A" papers={papers} selected={paperA} onSelect={p => { setPaperA(p); setResult(null); }} />

        {/* VS divider */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, width: "48px" }}>
          <div style={{ width: "40px", height: "40px", backgroundColor: "#1A2420", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.5px" }}>VS</div>
        </div>

        <PaperDropdown label="Paper B" papers={papers} selected={paperB} onSelect={p => { setPaperB(p); setResult(null); }} />
      </div>

      {/* Same paper warning */}
      {paperA && paperB && paperA.id === paperB.id && (
        <div style={{ padding: "14px 18px", backgroundColor: "#FFFBEB", border: "1.5px solid #FDE68A", borderRadius: "12px", marginBottom: "20px", fontSize: "14px", color: "#92400E", fontWeight: 500 }}>
          ⚠️ Please select two different papers to compare.
        </div>
      )}

      {/* Compare button */}
      <button
        onClick={compare}
        disabled={!canCompare || loading}
        style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          padding: "15px 36px", fontSize: "16px", fontWeight: 700,
          color: "#FFFFFF",
          background: !canCompare || loading ? "#D1D5DB" : `linear-gradient(135deg, ${G}, var(--primary-light))`,
          border: "none", borderRadius: "100px",
          cursor: !canCompare || loading ? "not-allowed" : "pointer",
          boxShadow: !canCompare || loading ? "none" : "0 4px 16px rgba(var(--primary-rgb),0.4)",
          marginBottom: "28px", fontFamily: "Inter, system-ui, sans-serif",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => { if (canCompare && !loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(var(--primary-rgb),0.5)"; } }}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = !canCompare || loading ? "none" : "0 4px 16px rgba(var(--primary-rgb),0.4)"; }}
      >
        {loading ? <><Spinner /><span>Comparing with AI…</span></> : <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="8" x2="6" y2="8"/><line x1="18" y1="16" x2="6" y2="16"/><polyline points="9 4 3 8 9 12"/><polyline points="15 12 21 16 15 20"/></svg>
          Compare with AI
        </>}
      </button>

      {/* Error */}
      {error && (
        <div style={{ padding: "16px 20px", backgroundColor: "#FFF1F1", border: "1.5px solid #FECACA", borderRadius: "14px", marginBottom: "24px", fontSize: "15px", color: "#DC2626", fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ ...CARD, padding: "60px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <div style={{ width: "48px", height: "48px", border: `4px solid ${G}25`, borderTop: `4px solid ${G}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
          <p style={{ fontSize: "18px", fontWeight: 700, color: "#1A2420", margin: "0 0 8px 0" }}>AI is analyzing both papers…</p>
          <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0 }}>Generating comprehensive comparison table and insights</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>
          {/* Verdict cards */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
            <VerdictCard paper={paperA} verdict={result.paper_a_verdict} color={G} label="Paper A" />
            <VerdictCard paper={paperB} verdict={result.paper_b_verdict} color="#1A2420" label="Paper B" />
          </div>

          {/* Comparison table */}
          <CompareTable result={result} paperA={paperA} paperB={paperB} />

          {/* AI Analysis */}
          {result.analysis && (
            <div style={{ ...CARD, padding: "32px 36px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{ width: "44px", height: "44px", backgroundColor: "#FEF9F0", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>✨</div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#111827", margin: 0 }}>AI Comparative Analysis</h3>
                  <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>In-depth comparison generated by LLM</p>
                </div>
              </div>
              <div style={{ fontSize: "15px", lineHeight: "1.85", color: "#374151" }}>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p style={{ margin: "0 0 14px 0" }}>{children}</p>,
                    strong: ({ children }) => <strong style={{ fontWeight: 700, color: "#111827" }}>{children}</strong>,
                    ul: ({ children }) => <ul style={{ paddingLeft: "20px", margin: "10px 0" }}>{children}</ul>,
                    li: ({ children }) => <li style={{ marginBottom: "6px" }}>{children}</li>,
                    h3: ({ children }) => <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#111827", margin: "20px 0 8px 0" }}>{children}</h3>,
                  }}
                >{result.analysis}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </DashboardLayout>
  );
}
