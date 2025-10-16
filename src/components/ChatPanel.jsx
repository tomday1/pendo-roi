// src/components/ChatPanel.jsx
import React from "react";

const wrap = {
  position: "fixed",
  bottom: 10,
  right: 16,
  width: "min(800px, calc(100vw - 32px))",
  height: "min(90vh, calc(100vh - 20px))",
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  display: "grid",
  gridTemplateRows: "42px 1fr auto",
  overflow: "hidden",
  zIndex: 70,
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

const header = {
  background: "#ff3366",
  color: "#fff",
  fontWeight: 600,
  padding: "0 12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const closeBtn = {
  border: "none",
  background: "transparent",
  color: "#fff",
  fontSize: 18,
  cursor: "pointer",
};

const thread = { padding: 12, overflowY: "auto", background: "#fff" };
const bubble = (role) => ({
  maxWidth: "80%",
  padding: "8px 10px",
  borderRadius: 12,
  margin: "6px 0",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  alignSelf: role === "user" ? "flex-end" : "flex-start",
  background: role === "user" ? "#f1f5f9" : "#fba8c4ff",
  color: "#0f172a",
});
const inputBar = { padding: 10, borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 };
const inputCss = { flex: 1, border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 12px" };
const sendBtn = { border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 14px", background: "#ff3366", color: "#fff", cursor: "pointer" };
const scopeWrap = { display: "flex", gap: 6, alignItems: "center" };
const scopePill = (active) => ({
  border: "1px solid #e5e7eb",
  borderRadius: 999,
  padding: "4px 10px",
  fontSize: 12,
  background: active ? "#fba8c4ff" : "#fff",
  cursor: "pointer"
});

function agentUrl() {
  // Safe reference (SSR/RC-friendly)
  const loc =
    typeof window !== "undefined" && window.location
      ? window.location
      : { hostname: "", host: "", search: "" };

  const params = new URLSearchParams(loc.search || "");
  const override =
    params.get("agent") ||
    (typeof window !== "undefined" &&
      window.localStorage &&
      window.localStorage.getItem("roi-agent-url"));

  if (override) return override;

  // Vercel prod: same-origin API
  const isVercel = /\.vercel\.app$/i.test(loc.host || "");
  if (isVercel) return "/api/chat";

  // Local dev fallback
  const isLocal = loc.hostname === "localhost" || loc.hostname === "127.0.0.1";
  return isLocal ? "http://localhost:3000/api/chat" : "/api/chat";
}



export default function ChatPanel({ open, onClose }) {
  const [q, setQ] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [msgs, setMsgs] = React.useState([
    { role: "assistant", text: "Hi! Ask me about the ROI calculator." },
  ]);

  // NEW: knowledge scope state ('kb' = in-house only, 'hybrid' = KB first then web/AI)
  const [scope, setScope] = React.useState(() => localStorage.getItem("roi-scope") || "kb");
  const url = React.useMemo(agentUrl, []);

  React.useEffect(() => {
    if (!open) return;
    const el = document.getElementById("roi-chat-thread");
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, msgs.length]);

  // Persist scope
  React.useEffect(() => {
    localStorage.setItem("roi-scope", scope);
  }, [scope]);

  async function send() {
    const text = q.trim();
    if (!text || busy) return;
    setQ("");
    setMsgs((m) => [...m, { role: "user", text }]);
    setBusy(true);

    try {
      const res = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, mode: scope }), // <-- include mode
      });

      let data = null;
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        const friendly = data?.text || `Assistant error (HTTP ${res.status}). Check the agent server logs.`;
        setMsgs((m) => [...m, { role: "assistant", text: friendly }]);
        return;
      }

      const reply = data?.text || "Sorry, I couldn’t reach the assistant.";
      setMsgs((m) => [...m, { role: "assistant", text: reply }]);
    } catch (e) {
      console.error("Chat fetch failed:", e);
      setMsgs((m) => [...m, { role: "assistant", text: "Network error reaching the assistant." }]);
    } finally {
      setBusy(false);
    }
  }

  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  if (!open) return null;

  return (
    <div style={wrap} role="dialog" aria-label="ROI Assistant">
      <div style={header}>
        <span>ROI Assistant</span>

        {/* NEW: knowledge scope pills */}
        <div style={scopeWrap} aria-label="Knowledge scope">
          <button
            style={scopePill(scope === "kb")}
            onClick={() => setScope("kb")}
            title="Answer only from Pendo ROI knowledge">
            In-house only
          </button>
          <button
            style={scopePill(scope === "hybrid")}
            onClick={() => setScope("hybrid")}
            title="Use in-house knowledge first, then broader web/AI if no match">
            In-house → Web/AI
          </button>
        </div>

        <button style={closeBtn} aria-label="Close" onClick={onClose}>×</button>
      </div>

      <div id="roi-chat-thread" style={thread}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={bubble(m.role)}>{m.text}</div>
          </div>
        ))}
      </div>

      <div style={inputBar}>
        <textarea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ask about the ROI calculator…"
          style={inputCss}
          rows={2}
        />
        <button style={sendBtn} onClick={send} disabled={busy}>Send</button>
      </div>
    </div>
  );
}
