import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

function PaperIcon({ size = 20, color = "var(--primary)" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function BotIcon() {
  return (
    <div
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "11px",
        background:
          "linear-gradient(135deg, var(--primary), var(--primary-light))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="7" width="18" height="13" rx="3" />
        <path d="M12 3v4" />
        <circle cx="8" cy="13" r="1" fill="#FFFFFF" />
        <circle cx="16" cy="13" r="1" fill="#FFFFFF" />
        <path d="M8 17h8" />
      </svg>
    </div>
  );
}

function cleanAnswer(answer) {
  if (typeof answer !== "string" || !answer.trim()) {
    return "I couldn't generate an answer from the selected paper.";
  }

  return answer.trim();
}

export default function Chatbot() {
  const [papers, setPapers] = useState([]);
  const [selectedPaperId, setSelectedPaperId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingPapers, setLoadingPapers] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const selectedPaper = papers.find(
    (paper) => String(paper.id) === String(selectedPaperId)
  );

  useEffect(() => {
    api
      .get("/papers")
      .then((response) => {
        setPapers(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        setError(
          "We couldn't load your uploaded papers. Please refresh and try again."
        );
      })
      .finally(() => setLoadingPapers(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  function handlePaperChange(event) {
    const paperId = event.target.value;
    setSelectedPaperId(paperId);
    setMessages([]);
    setInput("");
    setError("");
  }

  async function handleSend(event) {
    event.preventDefault();

    const question = input.trim();

    if (!selectedPaper || !question || sending) {
      return;
    }

    setError("");
    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "user", content: question },
    ]);
    setInput("");
    setSending(true);

    try {
      const response = await api.post("/chat", {
        paper_id: selectedPaper.id,
        message: question,
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: cleanAnswer(response.data?.answer),
        },
      ]);
    } catch (requestError) {
      const detail = requestError?.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "The AI service is temporarily unavailable. Please try again shortly."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <DashboardLayout>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "24px",
          marginBottom: "28px",
        }}
      >
        <div style={{ paddingTop: "4px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 800,
              color: "#1A2420",
              letterSpacing: "-1px",
              marginBottom: "6px",
            }}
          >
            Research Chatbot
          </h1>

          <p style={{ fontSize: "15px", color: "#6B7280" }}>
            Ask questions and get answers grounded only in your selected paper.
          </p>
        </div>

        <div style={{ width: "300px", flexShrink: 0 }}>
          <label
            htmlFor="paper-selector"
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.4px",
              color: "#6B7280",
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            Select a paper
          </label>

          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                display: "flex",
                zIndex: 1,
              }}
            >
              <PaperIcon size={17} />
            </div>

            <select
              id="paper-selector"
              value={selectedPaperId}
              onChange={handlePaperChange}
              disabled={loadingPapers}
              style={{
                width: "100%",
                height: "48px",
                appearance: "none",
                WebkitAppearance: "none",
                padding: "0 40px 0 43px",
                borderRadius: "10px",
                border: "1px solid #DCD7CB",
                backgroundColor: "#FFFFFF",
                color: selectedPaper ? "#1A2420" : "#9CA3AF",
                fontSize: "13px",
                fontWeight: 600,
                outline: "none",
                cursor: loadingPapers ? "wait" : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <option value="">
                {loadingPapers ? "Loading papers..." : "Choose an uploaded paper"}
              </option>

              {papers.map((paper) => (
                <option key={paper.id} value={paper.id}>
                  {paper.title || paper.filename || `Paper #${paper.id}`}
                </option>
              ))}
            </select>

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B7280"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      <div
        style={{
          height: "calc(100vh - 250px)",
          minHeight: "520px",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E8E4DA",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #F0EDE6",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <BotIcon />

          <div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#1A2420" }}>
              Paper Assistant
            </p>

            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
              {selectedPaper
                ? `Chatting about: ${
                    selectedPaper.title || selectedPaper.filename
                  }`
                : "Select a paper above to begin"}
            </p>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px 24px",
            backgroundColor: "#FCFBF8",
          }}
        >
          {!selectedPaper ? (
            <div
              style={{
                height: "100%",
                minHeight: "300px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "18px",
                  backgroundColor: "var(--primary-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "18px",
                }}
              >
                <PaperIcon size={30} />
              </div>

              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#1A2420",
                  marginBottom: "8px",
                }}
              >
                Select a paper to start chatting
              </h2>

              <p
                style={{
                  maxWidth: "390px",
                  fontSize: "14px",
                  lineHeight: 1.65,
                  color: "#6B7280",
                }}
              >
                Your questions will be answered using the content of the one paper
                you choose—no mystery ingredients.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div
              style={{
                height: "100%",
                minHeight: "300px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <BotIcon />

              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#1A2420",
                  margin: "16px 0 8px",
                }}
              >
                What would you like to know?
              </h2>

              <p
                style={{
                  maxWidth: "440px",
                  fontSize: "14px",
                  lineHeight: 1.65,
                  color: "#6B7280",
                }}
              >
                Ask about the paper’s methodology, findings, limitations, key
                concepts, or any specific section.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "22px",
                }}
              >
                {[
                  "What is the main contribution?",
                  "Summarize the methodology.",
                  "What are the key findings?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setInput(suggestion)}
                    style={{
                      padding: "9px 13px",
                      border: "1px solid #E8E4DA",
                      borderRadius: "8px",
                      backgroundColor: "#FFFFFF",
                      color: "var(--primary)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                maxWidth: "100%",
                padding: "0 20px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              {messages.map((message, index) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={`${message.role}-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                      gap: "10px",
                      alignItems: "flex-start",
                    }}
                  >
                    {!isUser && <BotIcon />}

                    <div
                      style={{
                        maxWidth: "80%",
                        padding: "13px 16px",
                        borderRadius: isUser
                          ? "14px 14px 3px 14px"
                          : "14px 14px 14px 3px",
                        background: isUser
                          ? "linear-gradient(135deg, var(--primary), var(--primary-light))"
                          : "#FFFFFF",
                        color: isUser ? "#FFFFFF" : "#374151",
                        border: isUser ? "none" : "1px solid #E8E4DA",
                        boxShadow: isUser
                          ? "0 3px 10px rgba(var(--primary-rgb),0.18)"
                          : "0 1px 3px rgba(0,0,0,0.03)",
                        whiteSpace: "pre-wrap",
                        fontSize: "14px",
                        lineHeight: 1.65,
                      }}
                    >
                      {message.content}
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <BotIcon />

                  <div
                    style={{
                      padding: "13px 16px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E8E4DA",
                      borderRadius: "14px 14px 14px 3px",
                      color: "#6B7280",
                      fontSize: "13px",
                    }}
                  >
                    Reading the selected paper…
                  </div>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div
            style={{
              margin: "14px 24px 0",
              padding: "11px 13px",
              borderRadius: "9px",
              backgroundColor: "#FFF4F2",
              border: "1px solid #F4C7C1",
              color: "#B42318",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSend}
          style={{
            padding: "18px 24px",
            borderTop: "1px solid #F0EDE6",
            display: "flex",
            gap: "12px",
            backgroundColor: "#FFFFFF",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={!selectedPaper || sending}
            placeholder={
              selectedPaper
                ? "Ask a question about this paper..."
                : "Select a paper first to start chatting"
            }
            style={{
              flex: 1,
              minWidth: 0,
              padding: "13px 15px",
              borderRadius: "10px",
              border: "1px solid #DCD7CB",
              backgroundColor: selectedPaper ? "#FFFFFF" : "#F8F6F0",
              color: "#1A2420",
              fontSize: "14px",
              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={!selectedPaper || !input.trim() || sending}
            style={{
              width: "48px",
              height: "48px",
              border: "none",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              background:
                selectedPaper && input.trim() && !sending
                  ? "linear-gradient(135deg, var(--primary), var(--primary-light))"
                  : "#C9C5BC",
              cursor:
                selectedPaper && input.trim() && !sending
                  ? "pointer"
                  : "not-allowed",
              boxShadow:
                selectedPaper && input.trim() && !sending
                  ? "0 3px 10px rgba(var(--primary-rgb),0.28)"
                  : "none",
              flexShrink: 0,
            }}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}