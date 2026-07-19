import { useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { to: "/upload", label: "Upload Papers", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> },
  { to: "/analysis", label: "Analysis", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { to: "/compare", label: "Compare", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="8" x2="6" y2="8"/><line x1="18" y1="16" x2="6" y2="16"/><polyline points="9 4 3 8 9 12"/><polyline points="15 12 21 16 15 20"/></svg> },
  { to: "/settings", label: "Settings", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

const S = {
  sidebar: { width: "280px", backgroundColor: "#FFFFFF", borderRight: "1px solid #E5E2D8", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40 },
  logo: { padding: "28px 24px 24px", borderBottom: "1px solid #F0EDE6", display: "flex", alignItems: "center", gap: "12px" },
  logoBox: { width: "40px", height: "40px", background: "linear-gradient(135deg,var(--primary),var(--primary-light))", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoText: { fontSize: "19px", fontWeight: 800, color: "#1A2420", letterSpacing: "-0.4px" },
  nav: { flex: 1, padding: "16px 12px", overflowY: "auto" },
  sectionLabel: { fontSize: "11px", fontWeight: 700, color: "#B0A899", letterSpacing: "1px", textTransform: "uppercase", padding: "8px 12px 10px" },
  userArea: { padding: "16px 12px 20px", borderTop: "1px solid #F0EDE6" },
  userCard: { display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", backgroundColor: "#F8F6F0", borderRadius: "14px", marginBottom: "8px" },
  avatar: { width: "40px", height: "40px", background: "linear-gradient(135deg,var(--primary),var(--primary-light))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 700, color: "#FFFFFF", flexShrink: 0 },
  main: { marginLeft: "280px", backgroundColor: "#F2F0E8", minHeight: "100vh" },
  content: { padding: "36px 40px", maxWidth: "1280px", margin: "0 auto" },
  mainFull: {
    marginLeft: "280px",
    backgroundColor: "#F2F0E8",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
    position: "fixed",
    top: 0,
    left: "280px",
    right: 0,
  },
};

export default function DashboardLayout({ children, fullHeight = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef(null);
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  // Every time the route changes (e.g. clicking a sidebar link), scroll the
  // content area back to the top instead of keeping the previous page's
  // scroll position.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={S.sidebar}>
        {/* Logo */}
        <div style={S.logo}>
          <div style={S.logoBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <span style={S.logoText}>Research<span style={{ color: "var(--primary)" }}>Genie</span></span>
        </div>

        {/* Nav */}
        <nav style={S.nav}>
          <p style={S.sectionLabel}>Menu</p>
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "13px",
              padding: "12px 16px", borderRadius: "12px", marginBottom: "3px",
              fontSize: "15px", fontWeight: isActive ? 700 : 500,
              color: isActive ? "#FFFFFF" : "#4B5563",
              background: isActive ? "linear-gradient(135deg,var(--primary),var(--primary-mid))" : "transparent",
              textDecoration: "none", transition: "all 0.15s",
              boxShadow: isActive ? "0 3px 10px rgba(var(--primary-rgb),0.3)" : "none",
            })}>
              {icon}{label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={S.userArea}>
          <div style={S.userCard}>
            <div style={S.avatar}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#1A2420", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "User"}</p>
              <p style={{ fontSize: "12px", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate("/"); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "11px 16px", fontSize: "14px", fontWeight: 600, color: "#EF4444", background: "transparent", border: "none", borderRadius: "10px", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#FFF1F1"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log out
          </button>
        </div>
      </aside>

      <main ref={mainRef} style={fullHeight ? S.mainFull : { ...S.main, overflowY: "auto", flex: 1 }}>
        {fullHeight
          ? children
          : <div style={S.content}>{children}</div>
        }
      </main>
    </div>
  );
}
