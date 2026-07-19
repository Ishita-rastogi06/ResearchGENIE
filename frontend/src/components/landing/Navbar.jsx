import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      backgroundColor: "rgba(250,250,248,0.92)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #E5E7EB",
    }}>
      <div style={{
        maxWidth: "1120px",
        margin: "0 auto",
        padding: "0 40px",
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{
            width: "34px", height: "34px",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#1A2420", letterSpacing: "-0.3px" }}>
            Research<span style={{ color: "var(--primary)" }}>Genie</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "36px" }}>
          {["Features", "About", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#4B5563",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => e.target.style.color = "var(--primary)"}
              onMouseLeave={e => e.target.style.color = "#4B5563"}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Auth buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            to="/login"
            style={{
              padding: "8px 18px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#374151",
              border: "1.5px solid #D1D5DB",
              borderRadius: "8px",
              textDecoration: "none",
              transition: "all 0.15s",
              backgroundColor: "transparent",
            }}
            onMouseEnter={e => { e.target.style.borderColor = "var(--primary)"; e.target.style.color = "var(--primary)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#D1D5DB"; e.target.style.color = "#374151"; }}
          >
            Log in
          </Link>
          <Link
            to="/register"
            style={{
              padding: "8px 18px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#FFFFFF",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
              borderRadius: "8px",
              textDecoration: "none",
              transition: "opacity 0.15s",
              boxShadow: "0 1px 3px rgba(var(--primary-rgb),0.3)",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
