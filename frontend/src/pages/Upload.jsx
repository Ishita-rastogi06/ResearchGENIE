import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

function FileRow({ file, onRemove }) {
  const sizeMB = (file.size / 1024 / 1024).toFixed(2);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      style={{
        display: "flex", alignItems: "center", gap: "14px",
        padding: "16px 20px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8E4DA",
        borderRadius: "12px",
      }}
    >
      <div style={{
        width: "42px", height: "42px", flexShrink: 0,
        backgroundColor: "var(--primary-bg)",
        borderRadius: "10px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "15px", fontWeight: 600, color: "#1A2420", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {file.name}
        </p>
        <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "2px" }}>{sizeMB} MB · PDF</p>
      </div>
      <button
        onClick={() => onRemove(file.name)}
        style={{
          width: "32px", height: "32px",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "none", background: "transparent",
          borderRadius: "8px", cursor: "pointer",
          color: "#9CA3AF",
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#FFF1F1"; e.currentTarget.style.color = "#EF4444"; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </motion.div>
  );
}

function ProcessedCard({ paper }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        backgroundColor: "#FFFFFF",
        border: "1.5px solid #BBD9C2",
        borderRadius: "16px",
        padding: "24px 28px",
        boxShadow: "0 2px 12px rgba(var(--primary-rgb),0.08)",
      }}
    >
      {/* Success header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <div style={{
          width: "28px", height: "28px",
          backgroundColor: "var(--primary-bg)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--primary)" }}>Processed Successfully</span>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#1A2420", marginBottom: "16px", letterSpacing: "-0.3px", lineHeight: 1.3 }}>
        {paper.title}
      </h3>

      {/* Meta grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {[
          { icon: "👤", label: "Authors", value: paper.authors || "Unknown" },
          { icon: "📅", label: "Year", value: paper.year || "—" },
          { icon: "📄", label: "Pages", value: `${paper.pages} pages` },
          { icon: "🔢", label: "Chunks indexed", value: `${paper.chunks} chunks` },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{
            padding: "12px 14px",
            backgroundColor: "#F8F6F0",
            borderRadius: "10px",
          }}>
            <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "3px" }}>{icon} {label}</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#1A2420", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedPapers, setUploadedPapers] = useState([]);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  const STEPS = ["Extracting text with PyMuPDF", "Chunking into semantic segments", "Creating embeddings", "Storing in vector database"];

  const onDrop = useCallback((accepted) => {
    const pdfs = accepted.filter(f => f.type === "application/pdf");
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...pdfs.filter(f => !names.has(f.name))];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name));

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setError("");
    setStep(0);
    try {
      const results = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        // Simulate step progression
        for (let i = 0; i < STEPS.length; i++) {
          setStep(i);
          await new Promise(r => setTimeout(r, 400));
        }
        const res = await api.post("/papers/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        results.push(res.data);
      }
      setUploadedPapers(prev => [...results, ...prev]);
      setFiles([]);
    } catch (err) {
      setError(err.response?.data?.detail ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#1A2420", letterSpacing: "-0.8px", marginBottom: "6px" }}>
            Upload Papers
          </h1>
          <p style={{ fontSize: "15px", color: "#6B7280", lineHeight: "1.6" }}>
            Upload one or multiple PDFs. AI will extract, chunk and embed them automatically.
          </p>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? "var(--primary)" : "#D1D5DB"}`,
            borderRadius: "16px",
            backgroundColor: isDragActive ? "var(--primary-bg)" : "#FFFFFF",
            padding: "56px 32px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s",
            marginBottom: "20px",
            boxShadow: isDragActive ? "0 0 0 4px rgba(var(--primary-rgb),0.1)" : "none",
          }}
        >
          <input {...getInputProps()} />

          <div style={{
            width: "56px", height: "56px",
            backgroundColor: isDragActive ? "#D8EFE0" : "var(--primary-bg)",
            borderRadius: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>

          {isDragActive ? (
            <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary)" }}>Drop PDFs here…</p>
          ) : (
            <>
              <p style={{ fontSize: "17px", fontWeight: 600, color: "#1A2420", marginBottom: "6px" }}>
                Drop PDF here or{" "}
                <span style={{ color: "var(--primary)", textDecoration: "underline", textUnderlineOffset: "3px" }}>Browse Files</span>
              </p>
              <p style={{ fontSize: "13px", color: "#9CA3AF" }}>Supports multiple PDFs · Max 50 MB each</p>
            </>
          )}
        </div>

        {/* Queued files */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#6B7280", marginBottom: "10px" }}>
                {files.length} file{files.length > 1 ? "s" : ""} ready to upload
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {files.map(f => <FileRow key={f.name} file={f} onRemove={removeFile} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "14px 16px",
            backgroundColor: "#FFF1F1",
            border: "1px solid #FECACA",
            borderRadius: "10px",
            marginBottom: "16px",
            fontSize: "14px", color: "#DC2626",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            padding: "16px",
            background: uploading || files.length === 0
              ? "#D1D5DB"
              : "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px", fontWeight: 700,
            color: "#FFFFFF",
            cursor: uploading || files.length === 0 ? "not-allowed" : "pointer",
            boxShadow: uploading || files.length === 0 ? "none" : "0 4px 14px rgba(var(--primary-rgb),0.35)",
            transition: "all 0.15s",
            marginBottom: "24px",
          }}
        >
          {uploading ? (
            <>
              <div style={{
                width: "18px", height: "18px",
                border: "2.5px solid rgba(255,255,255,0.3)",
                borderTop: "2.5px solid #FFFFFF",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              Processing…
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload {files.length > 0 ? `${files.length} Paper${files.length > 1 ? "s" : ""}` : "Papers"}
            </>
          )}
        </button>

        {/* Processing steps */}
        {uploading && (
          <div style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8E4DA",
            borderRadius: "14px",
            padding: "24px",
            marginBottom: "24px",
          }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#1A2420", marginBottom: "16px" }}>
              AI is processing your paper…
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "28px", height: "28px", flexShrink: 0,
                    borderRadius: "50%",
                    backgroundColor: i <= step ? "var(--primary-bg)" : "#F8F6F0",
                    border: `2px solid ${i <= step ? "var(--primary)" : "#E8E4DA"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {i < step ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : i === step ? (
                      <div style={{
                        width: "10px", height: "10px",
                        border: "2px solid var(--primary)",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }} />
                    ) : (
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#D1D5DB" }} />
                    )}
                  </div>
                  <span style={{ fontSize: "14px", color: i <= step ? "#1A2420" : "#9CA3AF", fontWeight: i === step ? 600 : 400 }}>
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processed results */}
        {uploadedPapers.length > 0 && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1A2420", marginBottom: "16px", letterSpacing: "-0.4px" }}>
              Processed Papers
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {uploadedPapers.map(p => <ProcessedCard key={p.id} paper={p} />)}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
