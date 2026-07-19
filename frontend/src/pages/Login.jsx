import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail ?? "Invalid credentials. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Left green panel ── */}
      <div style={{
        width: "42%", flexShrink: 0,
        background: "linear-gradient(160deg, var(--primary) 0%, #3A6248 100%)",
        display: "flex", flexDirection: "column", justifyContent: "center",
        gap: "36px",
        padding: "40px 44px",
        overflow: "hidden",
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <div style={{ width: "40px", height: "40px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <span style={{ fontSize: "20px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.3px" }}>ResearchGenie</span>
        </Link>

        {/* Headline */}
        <div>
          <h2 style={{ fontSize: "34px", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1, letterSpacing: "-1.2px", margin: "0 0 14px 0" }}>
            Unlock the Power<br />of AI Research
          </h2>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.80)", lineHeight: "1.6", margin: 0 }}>
            Summarize and analyze<br />research papers in seconds.
          </p>
        </div>

        {/* Bullets */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            "Upload PDFs and extract insights instantly",
            "Ask questions grounded in the paper",
            "Find research gaps with AI",
          ].map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "20px", height: "20px", flexShrink: 0, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.88)", lineHeight: "1.5" }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right white panel ── */}
      <div style={{ flex: 1, backgroundColor: "#FAF8F2", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px" }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>

          {/* Heading */}
          <h1 style={{ fontSize: "34px", fontWeight: 900, color: "#1A2420", letterSpacing: "-0.8px", margin: "0 0 8px 0" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "16px", color: "#9CA3AF", margin: "0 0 36px 0" }}>
            Sign in to your ResearchGenie account
          </p>

          {/* Error */}
          {error && (
            <div style={{ padding: "14px 18px", backgroundColor: "#FFF1F1", border: "1.5px solid #FECACA", borderRadius: "12px", marginBottom: "24px", fontSize: "15px", color: "#DC2626", fontWeight: 500 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "15px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                Email address
              </label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                style={{ width: "100%", padding: "14px 18px", fontSize: "15px", color: "#1A2420", backgroundColor: "#FFFFFF", border: "2px solid #E5E7EB", borderRadius: "12px", outline: "none", fontFamily: "Inter, system-ui, sans-serif", boxSizing: "border-box", transition: "border-color 0.15s" }}
                onFocus={e => e.target.style.borderColor = "var(--primary)"}
                onBlur={e => e.target.style.borderColor = "#E5E7EB"}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: "15px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"} required value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  style={{ width: "100%", padding: "14px 50px 14px 18px", fontSize: "15px", color: "#1A2420", backgroundColor: "#FFFFFF", border: "2px solid #E5E7EB", borderRadius: "12px", outline: "none", fontFamily: "Inter, system-ui, sans-serif", boxSizing: "border-box", transition: "border-color 0.15s" }}
                  onFocus={e => e.target.style.borderColor = "var(--primary)"}
                  onBlur={e => e.target.style.borderColor = "#E5E7EB"}
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", display: "flex", alignItems: "center" }}>
                  {showPw
                    ? <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{
                width: "100%", padding: "15px", fontSize: "16px", fontWeight: 700,
                color: "#FFFFFF", background: loading ? "#D1D5DB" : "linear-gradient(135deg, var(--primary), var(--primary-light))",
                border: "none", borderRadius: "12px", cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                boxShadow: loading ? "none" : "0 4px 14px rgba(var(--primary-rgb),0.4)",
                fontFamily: "Inter, system-ui, sans-serif", transition: "all 0.15s",
              }}>
              {loading
                ? <><div style={{ width: "18px", height: "18px", border: "2.5px solid rgba(255,255,255,0.35)", borderTop: "2.5px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Signing in…</>
                : "Sign In"
              }
            </button>
          </form>

          <p style={{ marginTop: "28px", textAlign: "center", fontSize: "15px", color: "#9CA3AF" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}
              onMouseEnter={e => e.target.style.textDecoration = "underline"}
              onMouseLeave={e => e.target.style.textDecoration = "none"}
            >Create one</Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
