const features = [
  {
    icon: "🧠", title: "AI Summary",
    desc: "Abstract, key contributions, methodology, results, limitations and future work — auto-generated in under a minute.",
    accent: "var(--primary)",
  },
  {
    icon: "🔍", title: "Semantic Search",
    desc: "Find exact paragraphs using vector similarity — not just keyword matching. Get the most relevant sections instantly.",
    accent: "var(--primary)",
  },
  {
    icon: "⚖️", title: "Compare Papers",
    desc: "Side-by-side AI comparison table: dataset, model architecture, accuracy, weaknesses, strengths and future work.",
    accent: "#D4943A",
  },
  {
    icon: "💡", title: "Research Gaps",
    desc: "AI identifies limitations, unanswered questions and potential future research directions from the paper.",
    accent: "var(--primary)",
  },
  {
    icon: "🃏", title: "Flashcards",
    desc: "Auto-generate interactive flip cards for every key term, concept and methodology mentioned in the paper.",
    accent: "#D4943A",
  },
  {
    icon: "✅", title: "Quiz Generator",
    desc: "Multiple choice questions with detailed explanations, generated directly from the paper's content.",
    accent: "var(--primary)",
  },
  {
    icon: "🗺️", title: "Mind Map",
    desc: "Visual tree structure: Problem → Dataset → Method → Results → Future Work, auto-built from the paper.",
    accent: "#D4943A",
  },
  {
    icon: "📖", title: "Citations",
    desc: "One-click generation of APA, MLA, IEEE and BibTeX citations formatted perfectly and ready to copy.",
    accent: "var(--primary)",
  },
  {
  icon: "💬", title: "Ask Your Paper",
  desc: "Chat with your uploaded research paper and get clear, citation-backed answers with exact page references.",
  accent: "#D4943A",
  },
];

export default function Features() {
  return (
    <section id="features" style={{ backgroundColor: "#FFFFFF", padding: "100px 0" }}>
      <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "0 40px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div style={{
            display: "inline-block",
            padding: "5px 14px",
            backgroundColor: "var(--primary-bg)",
            border: "1px solid #BBD9C2",
            borderRadius: "100px",
            marginBottom: "16px",
          }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.8px", textTransform: "uppercase" }}>
              Features
            </span>
          </div>
          <h2 style={{
            fontSize: "46px",
            fontWeight: 900,
            color: "#1A2420",
            letterSpacing: "-1.5px",
            lineHeight: 1.1,
            marginBottom: "16px",
          }}>
            Everything You Need
          </h2>
          <p style={{
            fontSize: "18px",
            color: "#6B7280",
            lineHeight: "1.7",
            maxWidth: "500px",
            margin: "0 auto",
          }}>
            Designed for researchers, students and professionals who want
            to understand academic papers faster with AI.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
        }}>
          {features.map((item, i) => (
            <div
              key={i}
              style={{
                background: "linear-gradient(135deg, #F7F7F6 0%, #EDE2D2 100%)",
                border: "1px solid #E5E7EB",
                borderRadius: "16px",
                padding: "28px",
                transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                cursor: "default",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.07)";
                e.currentTarget.style.borderColor = "#BBD9C2";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#E5E7EB";
              }}
            >
              {/* Icon */}
              <div style={{
                width: "44px", height: "44px",
                backgroundColor: item.accent + "12",
                borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px",
                marginBottom: "16px",
              }}>
                {item.icon}
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#111827",
                marginBottom: "8px",
                letterSpacing: "-0.2px",
              }}>
                {item.title}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: "14px",
                lineHeight: "1.75",
                color: "#6B7280",
              }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
