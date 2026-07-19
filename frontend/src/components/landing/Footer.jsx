import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid #E5E7EB" }}>
      <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "60px 40px 40px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "48px", marginBottom: "48px" }}>

          {/* Brand */}
          <div style={{ maxWidth: "260px" }}>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", textDecoration: "none" }}>
              <div style={{
                width: "32px", height: "32px",
                background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
                borderRadius: "9px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#1A2420" }}>
                Research<span style={{ color: "var(--primary)" }}>Genie</span>
              </span>
            </Link>
            <p style={{ fontSize: "13px", lineHeight: "1.7", color: "#9CA3AF" }}>
              AI-powered research paper analysis using RAG + Generative AI.
              Built for researchers, students and professionals.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: "64px" }}>
            {[
              {
                title: "Product",
                links: [
                  { label: "Features", href: "#features" },
                  { label: "Get Started", to: "/register" },
                ],
              },
              {
                title: "Account",
                links: [
                  { label: "Login", to: "/login" },
                  { label: "Register", to: "/register" },
                ],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#1A2420", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "16px" }}>
                  {title}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {links.map(({ label, href, to }) => (
                    href ? (
                      <a key={label} href={href} style={{ fontSize: "13px", color: "#6B7280", textDecoration: "none" }}
                        onMouseEnter={e => e.target.style.color = "var(--primary)"}
                        onMouseLeave={e => e.target.style.color = "#6B7280"}
                      >{label}</a>
                    ) : (
                      <Link key={label} to={to} style={{ fontSize: "13px", color: "#6B7280", textDecoration: "none" }}
                        onMouseEnter={e => e.target.style.color = "var(--primary)"}
                        onMouseLeave={e => e.target.style.color = "#6B7280"}
                      >{label}</Link>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          paddingTop: "24px",
          borderTop: "1px solid #F3F4F6",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <p style={{ fontSize: "12px", color: "#9CA3AF" }}>© 2026 ResearchGenie. All rights reserved.</p>
          <p style={{ fontSize: "12px", color: "#D1D5DB" }}>FastAPI · React · LangChain · FAISS · Groq</p>
        </div>

      </div>
    </footer>
  );
}
