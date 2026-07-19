import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

/* ─────────────────── Primitives ─────────────────── */

function SectionCard({ icon, title, subtitle, children }) {
  return (
    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E2D8", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden", marginBottom: "28px", animation: "fadeIn 0.25s ease" }}>
      <div style={{ padding: "28px 36px 24px", borderBottom: "1px solid #F0EDE6", display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ width: "46px", height: "46px", backgroundColor: "var(--primary-bg)", borderRadius: "13px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{icon}</div>
        <div>
          <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#111827", letterSpacing: "-0.3px", margin: 0 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0, marginTop: "2px" }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ padding: "32px 36px" }}>{children}</div>
    </div>
  );
}

function FieldLabel({ children }) {
  return <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "8px", letterSpacing: "0.1px" }}>{children}</label>;
}

function TextField({ label, type = "text", value, onChange, placeholder, suffix }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div style={{ position: "relative" }}>
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: "14px 20px", paddingRight: suffix ? "52px" : "20px",
            fontSize: "15px", color: "#111827", backgroundColor: "#FAFAF8",
            border: `2px solid ${focused ? "var(--primary)" : "#E5E7EB"}`,
            borderRadius: "12px", outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
            boxShadow: focused ? "0 0 0 4px rgba(var(--primary-rgb),0.1)" : "none",
            fontFamily: "Inter, system-ui, sans-serif", boxSizing: "border-box",
          }}
        />
        {suffix && <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }}>{suffix}</div>}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <select
        value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "14px 20px",
          fontSize: "15px", color: value ? "#111827" : "#9CA3AF", backgroundColor: "#FAFAF8",
          border: `2px solid ${focused ? "var(--primary)" : "#E5E7EB"}`,
          borderRadius: "12px", outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: focused ? "0 0 0 4px rgba(var(--primary-rgb),0.1)" : "none",
          fontFamily: "Inter, system-ui, sans-serif", boxSizing: "border-box", cursor: "pointer",
        }}
      >
        <option value="">Prefer not to say</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function PrimaryButton({ onClick, disabled, loading, saved, children }) {
  const inactive = disabled || loading;
  return (
    <button
      onClick={onClick} disabled={inactive}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px",
        padding: "14px 32px", fontSize: "15px", fontWeight: 700,
        color: "#FFFFFF", border: "none", borderRadius: "100px",
        background: inactive ? "#D1D5DB" : "linear-gradient(135deg,var(--primary),var(--primary-light))",
        cursor: inactive ? "not-allowed" : "pointer",
        boxShadow: inactive ? "none" : "0 4px 14px rgba(var(--primary-rgb),0.35)",
        transition: "all 0.15s", fontFamily: "Inter, system-ui, sans-serif",
        minWidth: "180px",
      }}
      onMouseEnter={e => { if (!inactive) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(var(--primary-rgb),0.45)"; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = inactive ? "none" : "0 4px 14px rgba(var(--primary-rgb),0.35)"; }}
    >
      {loading ? (
        <><div style={{ width: "17px", height: "17px", border: "2.5px solid rgba(255,255,255,0.35)", borderTop: "2.5px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Saving…</>
      ) : saved ? (
        <><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Saved!</>
      ) : children}
    </button>
  );
}

/* ─────────────────── Tabs ─────────────────── */
const TABS = [
  { id: "profile", label: "Profile", emoji: "👤" },
  { id: "password", label: "Password", emoji: "🔒" },
  { id: "ai", label: "AI Provider", emoji: "🧠" },
  { id: "appearance", label: "Appearance", emoji: "🎨" },
];

/* ─────────────────── Profile ─────────────────── */
function ProfileSection({ user, updateUser }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    education: user?.education || "",
    location: user?.location || "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const save = async () => {
    setError(""); setLoading(true);
    try {
      const res = await api.put("/auth/profile", form);
      updateUser?.(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to update profile.");
    } finally { setLoading(false); }
  };

  const initials = form.name ? form.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  return (
    <SectionCard icon="👤" title="Profile Information" subtitle="Update your personal and academic details">
      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "20px 24px", backgroundColor: "#F8F6F0", borderRadius: "16px", marginBottom: "28px" }}>
        <div style={{ width: "64px", height: "64px", background: "linear-gradient(135deg,var(--primary),var(--primary-light))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 800, color: "#FFFFFF", flexShrink: 0 }}>{initials}</div>
        <div>
          <p style={{ fontSize: "18px", fontWeight: 800, color: "#111827", margin: 0 }}>{form.name || "Your Name"}</p>
          <p style={{ fontSize: "14px", color: "#9CA3AF", margin: "3px 0 0 0" }}>{form.email || "your@email.com"}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <TextField label="Full Name" value={form.name} onChange={set("name")} placeholder="Your full name" />
        <TextField label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <TextField label="Phone Number" type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" />
        <SelectField label="Gender" value={form.gender} onChange={set("gender")} options={["Female", "Male", "Non-binary", "Other"]} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
        <TextField label="Education" value={form.education} onChange={set("education")} placeholder="e.g. M.Sc. Computer Science" />
        <TextField label="Place" value={form.location} onChange={set("location")} placeholder="City, Country" />
      </div>

      {error && <div style={{ padding: "14px 18px", backgroundColor: "#FFF1F1", border: "1.5px solid #FECACA", borderRadius: "12px", marginBottom: "16px", fontSize: "14px", color: "#DC2626", fontWeight: 500 }}>⚠️ {error}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <PrimaryButton onClick={save} loading={loading} saved={saved}>💾 Save Profile</PrimaryButton>
      </div>
    </SectionCard>
  );
}

/* ─────────────────── Password ─────────────────── */
function PasswordSection() {
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const mismatch = pw.next && pw.confirm && pw.next !== pw.confirm;
  const canSave = pw.current && pw.next && pw.confirm && !mismatch;

  const save = async () => {
    setError(""); setLoading(true);
    try { await api.put("/auth/password", { current_password: pw.current, new_password: pw.next }); setPw({ current: "", next: "", confirm: "" }); setSaved(true); setTimeout(() => setSaved(false), 2500); }
    catch (e) { setError(e.response?.data?.detail || "Failed to update password."); }
    finally { setLoading(false); }
  };

  const EyeToggle = ({ field }) => (
    <button type="button" onClick={() => setShow(p => ({ ...p, [field]: !p[field] }))}
      style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", display: "flex", alignItems: "center", padding: "2px" }}>
      {show[field]
        ? <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        : <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      }
    </button>
  );

  return (
    <SectionCard icon="🔒" title="Change Password" subtitle="Keep your account safe with a strong password">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "28px" }}>
        {[{ key: "current", label: "Current Password", ph: "Enter your current password" }, { key: "next", label: "New Password", ph: "Minimum 6 characters" }, { key: "confirm", label: "Confirm New Password", ph: "Repeat your new password" }].map(({ key, label, ph }) => (
          <TextField key={key} label={label} type={show[key] ? "text" : "password"} value={pw[key]} onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} suffix={<EyeToggle field={key} />} />
        ))}
      </div>

      {mismatch && <div style={{ padding: "14px 18px", backgroundColor: "#FFF1F1", border: "1.5px solid #FECACA", borderRadius: "12px", marginBottom: "16px", fontSize: "14px", color: "#DC2626", fontWeight: 500 }}>⚠️ Passwords do not match.</div>}
      {error && <div style={{ padding: "14px 18px", backgroundColor: "#FFF1F1", border: "1.5px solid #FECACA", borderRadius: "12px", marginBottom: "16px", fontSize: "14px", color: "#DC2626", fontWeight: 500 }}>⚠️ {error}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <PrimaryButton onClick={save} loading={loading} saved={saved} disabled={!canSave}>🔑 Update Password</PrimaryButton>
      </div>
    </SectionCard>
  );
}

/* ─────────────────── AI Provider ─────────────────── */
const PROVIDERS = [
  { id: "groq", name: "Groq", tag: "Fastest ⚡", tagColor: "#4A7C59", model: "llama-3.3-70b-versatile", desc: "Ultra-fast LLaMA 3.3 inference. Best for real-time research conversations and quick summaries.", icon: "⚡", keyField: "groq_api_key", keyHint: "gsk_... (from console.groq.com)" },
];

function AIProviderSection({ user, updateUser }) {
  const [selected, setSelected] = useState(user?.llm_provider || "groq");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const active = PROVIDERS.find(p => p.id === selected);

  const save = async () => {
    setError(""); setLoading(true);
    try {
      const payload = { llm_provider: selected };
      if (apiKey.trim()) payload[active.keyField] = apiKey.trim();
      const res = await api.put("/auth/preferences", payload);
      updateUser?.(res.data);
      setApiKey("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to save AI provider.");
    } finally { setLoading(false); }
  };

  return (
    <SectionCard icon="🧠" title="AI Provider" subtitle="Choose the language model that powers your research">
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
        {PROVIDERS.map(p => {
          const on = selected === p.id;
          const isCurrent = user?.llm_provider === p.id;
          return (
            <button key={p.id} onClick={() => setSelected(p.id)}
              style={{
                display: "flex", alignItems: "center", gap: "20px",
                padding: "22px 24px", textAlign: "left",
                backgroundColor: on ? "var(--primary-bg)" : "#FAFAF8",
                border: `2px solid ${on ? "var(--primary)" : "#E5E7EB"}`,
                borderRadius: "16px", cursor: "pointer",
                boxShadow: on ? "0 0 0 4px rgba(var(--primary-rgb),0.1)" : "none",
                transition: "all 0.15s", fontFamily: "Inter, system-ui, sans-serif",
              }}
              onMouseEnter={e => { if (!on) { e.currentTarget.style.borderColor = "#BBD9C2"; e.currentTarget.style.backgroundColor = "#F8FCF8"; } }}
              onMouseLeave={e => { if (!on) { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.backgroundColor = "#FAFAF8"; } }}
            >
              {/* Icon */}
              <div style={{ width: "52px", height: "52px", flexShrink: 0, backgroundColor: on ? "rgba(var(--primary-rgb),0.15)" : "#F0EDE6", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>{p.icon}</div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                  <span style={{ fontSize: "17px", fontWeight: 800, color: "#111827" }}>{p.name}</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", backgroundColor: p.tagColor + "15", color: p.tagColor, borderRadius: "100px", letterSpacing: "0.3px" }}>{p.tag}</span>
                  {isCurrent && <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", backgroundColor: "rgba(var(--primary-rgb),0.12)", color: "var(--primary)", borderRadius: "100px" }}>Active</span>}
                </div>
                <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 5px 0", fontFamily: "monospace" }}>Model: {p.model}</p>
                <p style={{ fontSize: "14px", color: "#6B7280", margin: 0, lineHeight: "1.5" }}>{p.desc}</p>
              </div>

              {/* Radio */}
              <div style={{ width: "24px", height: "24px", flexShrink: 0, borderRadius: "50%", border: `2.5px solid ${on ? "var(--primary)" : "#D1D5DB"}`, backgroundColor: on ? "var(--primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                {on && <div style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#FFFFFF" }} />}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginBottom: "24px" }}>
        <TextField
          label={`${active.name} API Key`}
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder={active.keyHint}
        />
        <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "8px" }}>
          Leave blank to keep the key already configured on the server (from <code>backend/.env</code>). Paste a new one here to override it — needed if {active.name} isn't answering.
        </p>
      </div>

      {error && <div style={{ padding: "14px 18px", backgroundColor: "#FFF1F1", border: "1.5px solid #FECACA", borderRadius: "12px", marginBottom: "16px", fontSize: "14px", color: "#DC2626", fontWeight: 500 }}>⚠️ {error}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <PrimaryButton onClick={save} loading={loading} saved={saved}>🧠 Save Provider</PrimaryButton>
      </div>
    </SectionCard>
  );
}

/* ─────────────────── Appearance ─────────────────── */
const THEMES = [
  { id: "sage", name: "Sage Green", desc: "The signature ResearchGenie palette — calm, academic, focused.", color: "#4A7C59", light: "#F0F9F1" },
  { id: "midnight", name: "Midnight Blue", desc: "Deep navy tones for a serious, professional academic feel.", color: "#1E3A5F", light: "#EEF3FB" },
  { id: "amber", name: "Warm Amber", desc: "Golden warmth — inviting and energetic for long research sessions.", color: "#B45309", light: "#FEF3E2" },
];

function AppearanceSection({ updateUser }) {
  const { theme, setTheme } = useTheme();
  const [pending, setPending] = useState(theme);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const apply = async () => {
    setSaving(true);
    await setTheme(pending);
    updateUser?.({ theme: pending });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SectionCard icon="🎨" title="Appearance" subtitle="Customize the visual theme of your workspace">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "32px" }}>
        {THEMES.map(t => {
          const on = pending === t.id;
          return (
            <button key={t.id} onClick={() => setPending(t.id)}
              style={{
                padding: "24px 20px", textAlign: "left",
                backgroundColor: on ? t.light : "#FAFAF8",
                border: `2px solid ${on ? t.color : "#E5E7EB"}`,
                borderRadius: "16px", cursor: "pointer",
                boxShadow: on ? `0 0 0 4px ${t.color}18` : "none",
                transition: "all 0.15s", fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              {/* Swatch */}
              <div style={{ width: "100%", height: "56px", backgroundColor: t.color, borderRadius: "12px", marginBottom: "16px", boxShadow: on ? `0 6px 18px ${t.color}40` : "0 2px 8px rgba(0,0,0,0.08)" }} />
              <p style={{ fontSize: "15px", fontWeight: 800, color: "#111827", margin: "0 0 5px 0" }}>{t.name}</p>
              <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.5", margin: 0 }}>{t.desc}</p>
              {on && (
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "12px" }}>
                  <div style={{ width: "20px", height: "20px", backgroundColor: t.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: t.color }}>{pending === theme ? "Active" : "Selected"}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <PrimaryButton onClick={apply} loading={saving} saved={saved} disabled={pending === theme}>🎨 Apply Theme</PrimaryButton>
      </div>
    </SectionCard>
  );
}

/* ─────────────────── Page ─────────────────── */
export default function Settings() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState("profile");

  return (
    <DashboardLayout>
      {/* Page header */}
      <div style={{ marginBottom: "36px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#1A2420", letterSpacing: "-1px", margin: "0 0 6px 0" }}>Settings</h1>
        <p style={{ fontSize: "16px", color: "#9CA3AF", margin: 0 }}>Manage your account, security and AI preferences.</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "4px", backgroundColor: "#FFFFFF", border: "1px solid #E5E2D8", borderRadius: "16px", padding: "6px", marginBottom: "32px", width: "fit-content", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        {TABS.map(t => {
          const on = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "11px 22px", fontSize: "15px", fontWeight: on ? 700 : 500,
                color: on ? "#FFFFFF" : "#6B7280",
                background: on ? "linear-gradient(135deg,var(--primary),var(--primary-light))" : "transparent",
                border: "none", borderRadius: "12px", cursor: "pointer",
                transition: "all 0.15s", boxShadow: on ? "0 3px 10px rgba(var(--primary-rgb),0.3)" : "none",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.backgroundColor = "#F8F6F0"; }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <span style={{ fontSize: "17px" }}>{t.emoji}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ maxWidth: "800px" }}>
        {tab === "profile"    && <ProfileSection user={user} updateUser={updateUser} />}
        {tab === "password"   && <PasswordSection />}
        {tab === "ai"         && <AIProviderSection user={user} updateUser={updateUser} />}
        {tab === "appearance" && <AppearanceSection updateUser={updateUser} />}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </DashboardLayout>
  );
}
