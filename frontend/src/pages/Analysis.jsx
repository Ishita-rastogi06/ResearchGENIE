import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

/* ── Shared primitives ── */
const G = "var(--primary)";
const CARD = { backgroundColor: "#FFFFFF", border: "1px solid #E5E2D8", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" };

function Spinner({ size = 24, color = G }) {
  return (
    <div style={{ width: size, height: size, border: `3px solid ${color}30`, borderTop: `3px solid ${color}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
  );
}

function Skeleton({ lines = 4 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{ height: "15px", borderRadius: "8px", backgroundColor: "#F0EDE6", animation: "pulse 1.5s ease-in-out infinite", width: i % 3 === 0 ? "75%" : i % 3 === 1 ? "90%" : "82%" }} />
      ))}
    </div>
  );
}

const TABS = [
  { id: "summary",    label: "Summary",        emoji: "📋" },
  { id: "gaps",       label: "Research Gaps",  emoji: "💡" },
  { id: "flashcards", label: "Flashcards",      emoji: "🃏" },
  { id: "quiz",       label: "Quiz",            emoji: "✅" },
  { id: "mindmap",    label: "Mind Map",        emoji: "🗺️" },
  { id: "citations",  label: "Citations",       emoji: "📖" },
  { id: "semantic",   label: "Semantic Search", emoji: "🔍" },
];

/* ── Paper Selector ── */
function PaperSelector({ papers, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger button */}
      <button onClick={() => setOpen(p => !p)} style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "9px 16px",
        backgroundColor: "#F8F6F0", border: "1.5px solid #E8E4DA",
        borderRadius: "10px", fontSize: "14px", fontWeight: 500,
        color: "#1A2420", cursor: "pointer",
        transition: "border-color 0.15s",
        minWidth: "200px", maxWidth: "300px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = G}
        onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = "#E8E4DA"; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" }}>
          {selected ? selected.title : "Select a Paper"}
        </span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          width: "340px",
          backgroundColor: "#FFFFFF", border: "1px solid #E8E4DA",
          borderRadius: "14px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          zIndex: 200, overflow: "hidden",
        }}>
          <div style={{ padding: "6px" }}>
            {papers.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#9CA3AF", fontSize: "14px" }}>No papers uploaded yet.</div>
            ) : papers.map(p => (
              <button key={p.id} onClick={() => { onSelect(p); setOpen(false); }} style={{
                width: "100%", textAlign: "left", padding: "11px 14px",
                background: selected?.id === p.id ? "var(--primary-bg)" : "transparent",
                border: "none", borderRadius: "8px", cursor: "pointer",
                fontFamily: "Inter, system-ui, sans-serif", transition: "background 0.12s",
                boxSizing: "border-box",
              }}
                onMouseEnter={e => { if (selected?.id !== p.id) e.currentTarget.style.backgroundColor = "#F8F6F0"; }}
                onMouseLeave={e => { if (selected?.id !== p.id) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#111827", margin: "0 0 2px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>{p.authors}{p.year ? ` · ${p.year}` : ""} · {p.pages} pages</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Summary Tab ── */
const SUMMARY_SECTIONS = [
  { key: "abstract",      label: "Abstract Summary",   emoji: "📄", color: G },
  { key: "contributions", label: "Key Contributions",  emoji: "🎯", color: "#D4943A" },
  { key: "methodology",   label: "Methodology",        emoji: "🔬", color: G },
  { key: "results",       label: "Results",            emoji: "📈", color: "#D4943A" },
  { key: "limitations",   label: "Limitations",        emoji: "⚠️", color: G },
  { key: "future_work",   label: "Future Work",        emoji: "🚀", color: "#D4943A" },
];

// Safely extract a string value — handles raw JSON strings like {"abstract":"..."} 
function safeStr(val) {
  if (!val) return "";

  if (typeof val === "string") {
    const trimmed = val.trim();
    // Looks like a JSON object — extract the actual text
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === "object" && parsed !== null) {
          // Return the longest string value (most likely the real content)
          const strings = Object.values(parsed).filter(v => typeof v === "string" && v.trim());
          if (strings.length > 0) return strings.reduce((a, b) => a.length >= b.length ? a : b);
          const arrays = Object.values(parsed).filter(v => Array.isArray(v));
          if (arrays.length > 0) return arrays[0].join("\n");
        }
        if (typeof parsed === "string") return parsed;
      } catch { /* not valid JSON, continue */ }
    }
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.join("\n");
      } catch { /* not valid JSON */ }
    }
    return val;
  }

  if (Array.isArray(val)) return val.join("\n");

  if (typeof val === "object" && val !== null) {
    const strings = Object.values(val).filter(v => typeof v === "string" && v.trim());
    if (strings.length > 0) return strings.reduce((a, b) => a.length >= b.length ? a : b);
    return "";
  }

  return String(val);
}

function NotAvailable() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", textAlign: "center", gap: "10px" }}>
      <div style={{ fontSize: "28px", opacity: 0.35 }}>🔍</div>
      <p style={{ fontSize: "14px", color: "#C4BDB0", fontStyle: "italic", margin: 0, lineHeight: "1.5" }}>
        Not extracted for this paper
      </p>
    </div>
  );
}

function SummaryTab({ paperId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); setData(null);
    api.get(`/analysis/summary/${paperId}`)
      .then(r => {
        // Normalize — handle case where the whole response is itself a JSON string
        let d = r.data;
        if (typeof d === "string") {
          try { d = JSON.parse(d); } catch { d = { abstract: d }; }
        }
        setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [paperId]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" }}>
      {SUMMARY_SECTIONS.map(s => {
        const rawVal = data?.[s.key];
        const text = safeStr(rawVal);
        return (
          <div key={s.key} style={{
            ...CARD, padding: "26px 28px",
            display: "flex", flexDirection: "column",
            minHeight: "220px",
          }}>
            {/* Card header */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", paddingBottom: "14px", borderBottom: "1px solid #F0EDE6" }}>
              <div style={{ width: "38px", height: "38px", backgroundColor: s.color + "15", borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                {s.emoji}
              </div>
              <span style={{ fontSize: "15px", fontWeight: 800, color: "#111827", letterSpacing: "-0.2px" }}>{s.label}</span>
            </div>
            {/* Card body */}
            <div style={{ flex: 1 }}>
              {loading ? (
                <Skeleton lines={4} />
              ) : text ? (
                <div style={{ fontSize: "14px", lineHeight: "1.8", color: "#374151" }}>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p style={{ margin: "0 0 8px 0" }}>{children}</p>,
                      ul: ({ children }) => <ul style={{ paddingLeft: "18px", margin: "6px 0" }}>{children}</ul>,
                      li: ({ children }) => <li style={{ marginBottom: "4px" }}>{children}</li>,
                      strong: ({ children }) => <strong style={{ fontWeight: 700, color: s.color }}>{children}</strong>,
                    }}
                  >{text}</ReactMarkdown>
                </div>
              ) : (
                <NotAvailable />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Gaps Tab ── */
function GapsTab({ paperId }) {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api.get(`/analysis/gaps/${paperId}`).then(r => setData(r.data.gaps)).catch(() => {}).finally(() => setLoading(false));
  }, [paperId]);

  return (
    <div style={{ ...CARD, padding: "36px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid #F0EDE6" }}>
        <div style={{ width: "48px", height: "48px", backgroundColor: "#FEF9F0", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>💡</div>
        <div>
          <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#111827", margin: 0, letterSpacing: "-0.3px" }}>Research Gap Analysis</h3>
          <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0, marginTop: "2px" }}>AI-identified gaps, limitations and future opportunities</p>
        </div>
      </div>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[100,88,95,72,85,90,70,80].map((w,i) => (
            <div key={i} style={{ height: "16px", borderRadius: "8px", backgroundColor: "#F0EDE6", animation: "pulse 1.5s ease-in-out infinite", width: `${w}%` }} />
          ))}
        </div>
      ) : (
        <div>
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#1A2420", margin: "28px 0 12px 0", paddingBottom: "8px", borderBottom: "2px solid #F0EDE6", letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "4px", height: "20px", backgroundColor: G, borderRadius: "2px", display: "inline-block", flexShrink: 0 }} />
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#374151", margin: "20px 0 10px 0" }}>{children}</h3>
              ),
              p: ({ children }) => (
                <p style={{ fontSize: "15px", lineHeight: "1.85", color: "#4B5563", margin: "0 0 12px 0" }}>{children}</p>
              ),
              ul: ({ children }) => (
                <ul style={{ paddingLeft: "0", margin: "8px 0 16px 0", listStyle: "none" }}>{children}</ul>
              ),
              li: ({ children }) => (
                <li style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "15px", color: "#4B5563", lineHeight: "1.7", marginBottom: "10px" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: G, flexShrink: 0, marginTop: "8px" }} />
                  <span>{children}</span>
                </li>
              ),
              strong: ({ children }) => <strong style={{ fontWeight: 800, color: "#111827" }}>{children}</strong>,
            }}
          >
            {data || "No gap analysis available."}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

/* ── Flashcards Tab ── */
function FlipCard({ card, index }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div onClick={() => setFlipped(f => !f)} style={{ cursor: "pointer", height: "180px", perspective: "1000px" }}>
      <div style={{ position: "relative", height: "100%", transition: "transform 0.5s", transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "" }}>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", backgroundColor: "#FFFFFF", border: "2px solid #E5E2D8", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: G, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>Term</span>
          <p style={{ fontSize: "17px", fontWeight: 800, color: "#111827", margin: "0 0 8px 0" }}>{card.term}</p>
          <p style={{ fontSize: "12px", color: "#9CA3AF" }}>Tap to flip</p>
        </div>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: `linear-gradient(135deg, var(--primary), var(--primary-light))`, borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>Definition</span>
          <p style={{ fontSize: "14px", lineHeight: "1.65", color: "#FFFFFF", margin: 0 }}>{card.definition}</p>
        </div>
      </div>
    </div>
  );
}

function FlashcardsTab({ paperId }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api.get(`/analysis/flashcards/${paperId}`).then(r => setCards(r.data.flashcards || [])).catch(() => {}).finally(() => setLoading(false));
  }, [paperId]);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <p style={{ fontSize: "15px", color: "#6B7280" }}>{cards.length} cards · Click any card to flip</p>
        {loading && <Spinner size={20} />}
      </div>
      {!loading && cards.length === 0 ? <p style={{ color: "#9CA3AF", fontSize: "15px" }}>No flashcards generated.</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {cards.map((c, i) => <FlipCard key={i} card={c} index={i} />)}
        </div>
      )}
    </div>
  );
}

/* ── Quiz Tab ── */
function QuizQuestion({ q, index }) {
  const [sel, setSel] = useState(null);
  return (
    <div style={{ ...CARD, padding: "24px 28px", marginBottom: "16px" }}>
      <p style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "16px", lineHeight: "1.5" }}>
        <span style={{ color: G }}>Q{index + 1}. </span>{q.question}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answer;
          const isSelected = sel === i;
          let bg = "#FAFAF8", border = "#E5E7EB", color = "#374151";
          if (sel !== null) {
            if (isCorrect) { bg = "var(--primary-bg)"; border = G; color = G; }
            else if (isSelected) { bg = "#FFF1F1"; border = "#EF4444"; color = "#EF4444"; }
          }
          return (
            <button key={i} onClick={() => { if (sel === null) setSel(i); }}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 18px", backgroundColor: bg, border: `2px solid ${border}`, borderRadius: "12px", cursor: sel === null ? "pointer" : "default", textAlign: "left", transition: "all 0.15s", fontFamily: "Inter, system-ui, sans-serif" }}>
              <span style={{ width: "28px", height: "28px", flexShrink: 0, borderRadius: "50%", backgroundColor: sel !== null && isCorrect ? G : (isSelected ? "#EF4444" : "#E5E7EB"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span style={{ fontSize: "14px", fontWeight: 500, color }}>{opt}</span>
              {sel !== null && isCorrect && <span style={{ marginLeft: "auto", fontSize: "16px" }}>✓</span>}
            </button>
          );
        })}
      </div>
      {sel !== null && <div style={{ marginTop: "14px", padding: "14px 16px", backgroundColor: "#F8F6F0", borderRadius: "10px", fontSize: "14px", color: "#4B5563", lineHeight: "1.6" }}><strong style={{ color: "#111827" }}>Explanation:</strong> {q.explanation}</div>}
    </div>
  );
}

function QuizTab({ paperId }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    setQuestions([]);
    api.get(`/analysis/quiz/${paperId}`)
      .then(r => setQuestions(r.data.questions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [paperId]);

  const createMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const r = await api.get(`/analysis/quiz-more/${paperId}?existing_count=${questions.length}&count=10`);
      const newQs = r.data.questions || [];
      if (newQs.length > 0) setQuestions(prev => [...prev, ...newQs]);
    } catch { } finally { setLoadingMore(false); }
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}><Spinner size={36} color={G} /></div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#111827", margin: 0 }}>Quiz</h3>
          <p style={{ fontSize: "13px", color: "#9CA3AF", margin: "3px 0 0 0" }}>{questions.length} questions · Click an option to answer</p>
        </div>
        <button
          onClick={createMore}
          disabled={loadingMore}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "11px 22px", fontSize: "14px", fontWeight: 700,
            color: "#FFFFFF",
            background: loadingMore ? "#D1D5DB" : `linear-gradient(135deg, ${G}, var(--primary-light))`,
            border: "none", borderRadius: "100px",
            cursor: loadingMore ? "not-allowed" : "pointer",
            boxShadow: loadingMore ? "none" : "0 3px 10px rgba(var(--primary-rgb),0.35)",
            fontFamily: "Inter, system-ui, sans-serif",
            transition: "all 0.15s",
          }}
        >
          {loadingMore ? <><Spinner size={16} color="#fff" /><span>Generating…</span></> : <><span>✨</span> +10 More</>}
        </button>
      </div>

      {questions.length === 0 ? (
        <p style={{ color: "#9CA3AF", fontSize: "15px" }}>No quiz generated.</p>
      ) : (
        <div>{questions.map((q, i) => <QuizQuestion key={`${paperId}-${i}`} q={q} index={i} />)}</div>
      )}

      {questions.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "24px", paddingBottom: "8px" }}>
          <button
            onClick={createMore}
            disabled={loadingMore}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 32px", fontSize: "15px", fontWeight: 700,
              color: loadingMore ? "#9CA3AF" : G,
              backgroundColor: "var(--primary-bg)",
              border: `2px solid ${loadingMore ? "#E5E7EB" : G}`,
              borderRadius: "100px",
              cursor: loadingMore ? "not-allowed" : "pointer",
              fontFamily: "Inter, system-ui, sans-serif", transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (!loadingMore) { e.currentTarget.style.backgroundColor = G; e.currentTarget.style.color = "#FFFFFF"; } }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "var(--primary-bg)"; e.currentTarget.style.color = loadingMore ? "#9CA3AF" : G; }}
          >
            {loadingMore ? <><Spinner size={16} color={G} /> Generating 10 more…</> : <>✨ Create 10 More Questions</>}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── MindMap Tab ── */
function MindNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(true);
  const colors = [G, "#D4943A", "#1A2420", G, "#D4943A"];
  const c = colors[depth % colors.length];
  const hasChildren = node.children?.length > 0;
  return (
    <div style={{ paddingLeft: depth > 0 ? "24px" : "0", borderLeft: depth > 0 ? `2px dashed #E5E2D8` : "none", marginTop: "6px" }}>
      <button onClick={() => setOpen(p => !p)}
        style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 0", background: "none", border: "none", cursor: hasChildren ? "pointer" : "default", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: c, flexShrink: 0 }} />
        <span style={{ fontSize: depth === 0 ? "17px" : "15px", fontWeight: depth === 0 ? 800 : 500, color: "#111827" }}>{node.label}</span>
        {hasChildren && <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{open ? "▾" : "▸"}</span>}
      </button>
      {open && node.children?.map((child, i) => <MindNode key={i} node={child} depth={depth + 1} />)}
    </div>
  );
}

function MindMapTab({ paperId }) {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api.get(`/analysis/mindmap/${paperId}`).then(r => setTree(r.data.tree)).catch(() => {}).finally(() => setLoading(false));
  }, [paperId]);
  return (
    <div style={{ ...CARD, padding: "32px 36px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <div style={{ width: "44px", height: "44px", backgroundColor: "var(--primary-bg)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🗺️</div>
        <div><h3 style={{ fontSize: "18px", fontWeight: 800, color: "#111827", margin: 0 }}>Paper Mind Map</h3><p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>Visual structure of the paper</p></div>
      </div>
      {loading ? <Spinner /> : tree ? <MindNode node={tree} /> : <p style={{ color: "#9CA3AF" }}>Mind map unavailable.</p>}
    </div>
  );
}

/* ── Citations Tab ── */
function CitationsTab({ paperId }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [style, setStyle] = useState("apa");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    setLoading(true);
    api.get(`/analysis/citations/${paperId}`).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [paperId]);
  const copy = () => { navigator.clipboard.writeText(data[style] || ""); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ ...CARD, padding: "32px 36px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div style={{ width: "44px", height: "44px", backgroundColor: "#1A242018", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>📖</div>
        <div><h3 style={{ fontSize: "18px", fontWeight: 800, color: "#111827", margin: 0 }}>Citation Generator</h3><p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>APA, MLA, IEEE and BibTeX formats</p></div>
      </div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["apa","mla","ieee","bibtex"].map(s => (
          <button key={s} onClick={() => setStyle(s)} style={{ padding: "9px 20px", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", backgroundColor: style === s ? G : "transparent", color: style === s ? "#FFFFFF" : "#6B7280", border: `2px solid ${style === s ? G : "#E5E2D8"}`, borderRadius: "10px", cursor: "pointer", transition: "all 0.15s", fontFamily: "Inter, system-ui, sans-serif" }}>
            {s}
          </button>
        ))}
      </div>
      {loading ? <Skeleton /> : (
        <div style={{ position: "relative" }}>
          <pre style={{ backgroundColor: "#F8F6F0", borderRadius: "14px", padding: "20px 24px", fontSize: "14px", lineHeight: "1.8", color: "#1A2420", fontFamily: "monospace", whiteSpace: "pre-wrap", margin: 0, border: "1px solid #E5E2D8" }}>
            {data[style] || "Citation not available."}
          </pre>
          <button onClick={copy} style={{ position: "absolute", top: "14px", right: "14px", display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", fontSize: "13px", fontWeight: 600, backgroundColor: "#FFFFFF", border: "1.5px solid #E5E2D8", borderRadius: "8px", cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif" }}>
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Semantic Search Tab ── */
function SemanticTab({ paperId }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true); setSearched(true);
    try {
      const r = await api.post("/analysis/semantic-search", { paper_id: paperId, query, top_k: 5 });
      setResults(r.data.results || []);
    } catch { setResults([]); } finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ ...CARD, padding: "28px 32px", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#111827", margin: "0 0 6px 0" }}>🔍 Semantic Search</h3>
        <p style={{ fontSize: "14px", color: "#9CA3AF", margin: "0 0 20px 0" }}>Search by meaning — find exact paragraphs about any concept</p>
        <div style={{ display: "flex", gap: "12px" }}>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
            placeholder="e.g. attention mechanism, dataset size, model accuracy…"
            style={{ flex: 1, padding: "13px 18px", fontSize: "15px", color: "#111827", backgroundColor: "#FAFAF8", border: "2px solid #E5E2D8", borderRadius: "12px", outline: "none", fontFamily: "Inter, system-ui, sans-serif", transition: "border-color 0.15s" }}
            onFocus={e => e.target.style.borderColor = G} onBlur={e => e.target.style.borderColor = "#E5E2D8"}
          />
          <button onClick={search} disabled={loading || !query.trim()} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "13px 26px", fontSize: "15px", fontWeight: 700, color: "#FFFFFF", background: loading || !query.trim() ? "#D1D5DB" : `linear-gradient(135deg,${G},var(--primary-light))`, border: "none", borderRadius: "12px", cursor: loading || !query.trim() ? "not-allowed" : "pointer", boxShadow: loading || !query.trim() ? "none" : "0 4px 14px rgba(var(--primary-rgb),0.35)", fontFamily: "Inter, system-ui, sans-serif" }}>
            {loading ? <Spinner size={18} color="#FFFFFF" /> : "Search"}
          </button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {results.map((r, i) => (
          <div key={i} style={{ ...CARD, padding: "22px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ padding: "4px 12px", backgroundColor: "var(--primary-bg)", color: G, fontSize: "13px", fontWeight: 700, borderRadius: "100px" }}>Page {r.page}</span>
              <span style={{ padding: "4px 12px", backgroundColor: "#F8F6F0", color: "#6B7280", fontSize: "13px", fontWeight: 600, borderRadius: "100px" }}>Score {(Math.max(0, r.score) * 100).toFixed(0)}%</span>
            </div>
            <p style={{ fontSize: "15px", lineHeight: "1.75", color: "#374151", margin: 0 }}>{r.text}</p>
          </div>
        ))}
        {searched && !loading && results.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF", fontSize: "15px" }}>No results found. Try different keywords.</div>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function Analysis() {
  const [searchParams] = useSearchParams();
  const paperId = searchParams.get("paper");
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    api.get("/papers").then(r => {
      const list = r.data || [];
      setPapers(list);
      if (paperId) {
        const found = list.find(p => String(p.id) === paperId);
        if (found) setSelectedPaper(found);
      }
    }).catch(() => {});
  }, [paperId]);

  const handleSelectPaper = (p) => {
    setSelectedPaper(p);
    setActiveTab("summary");
  };

  return (
    <DashboardLayout>
      <div style={{ padding: "0 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#1A2420", letterSpacing: "-0.6px", margin: "0 0 4px 0" }}>AI Analysis</h1>
          <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>Deep insights powered by RAG + LLM</p>
        </div>
        <PaperSelector papers={papers} selected={selectedPaper} onSelect={handleSelectPaper} />
      </div>

      {!selectedPaper ? (
        /* Empty state */
        <div style={{ ...CARD, padding: "80px 40px", textAlign: "center" }}>
          <div style={{ width: "72px", height: "72px", backgroundColor: "var(--primary-bg)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 24px" }}>✨</div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1A2420", margin: "0 0 10px 0" }}>Select a Paper to Analyze</h2>
          <p style={{ fontSize: "15px", color: "#9CA3AF", margin: "0 0 28px 0", maxWidth: "360px", marginLeft: "auto", marginRight: "auto" }}>
            Choose from your uploaded papers to generate AI summaries, flashcards, quizzes and more.
          </p>
          <Link to="/upload" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "13px 28px", background: `linear-gradient(135deg,${G},var(--primary-light))`, color: "#FFFFFF", borderRadius: "100px", fontSize: "15px", fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(var(--primary-rgb),0.35)" }}>
            Upload a Paper
          </Link>
        </div>
      ) : (
        <>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: "4px", backgroundColor: "#FFFFFF", border: "1px solid #E5E2D8", borderRadius: "16px", padding: "6px", marginBottom: "28px", overflowX: "auto", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", width: "fit-content", maxWidth: "100%" }}>
            {TABS.map(t => {
              const on = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  display: "flex", alignItems: "center", gap: "7px", padding: "10px 18px", fontSize: "14px", fontWeight: on ? 700 : 500,
                  color: on ? "#FFFFFF" : "#6B7280", background: on ? `linear-gradient(135deg,${G},var(--primary-light))` : "transparent",
                  border: "none", borderRadius: "11px", cursor: "pointer", transition: "all 0.15s",
                  boxShadow: on ? "0 3px 10px rgba(var(--primary-rgb),0.3)" : "none", whiteSpace: "nowrap",
                  fontFamily: "Inter, system-ui, sans-serif",
                }}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.backgroundColor = "#F8F6F0"; }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <span style={{ fontSize: "16px" }}>{t.emoji}</span>{t.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            {activeTab === "summary"    && <SummaryTab    paperId={selectedPaper.id} />}
            {activeTab === "gaps"       && <GapsTab       paperId={selectedPaper.id} />}
            {activeTab === "flashcards" && <FlashcardsTab paperId={selectedPaper.id} />}
            {activeTab === "quiz"       && <QuizTab       paperId={selectedPaper.id} />}
            {activeTab === "mindmap"    && <MindMapTab    paperId={selectedPaper.id} />}
            {activeTab === "citations"  && <CitationsTab  paperId={selectedPaper.id} />}
            {activeTab === "semantic"   && <SemanticTab   paperId={selectedPaper.id} />}
          </div>
        </>
      )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </DashboardLayout>
  );
}
