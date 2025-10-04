import React from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../auth/AuthProvider";

export default function Login() {
  const { setGuestMode } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(error.message);
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f8fafc" }}>
      <form onSubmit={onSubmit} style={{ background: "#fff", padding: 24, borderRadius: 16, width: 360, boxShadow: "0 6px 16px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>Sign in</h2>

        <label style={{ fontSize: 12, color: "#475569" }}>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
               style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb", marginBottom: 10 }} />

        <label style={{ fontSize: 12, color: "#475569" }}>Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
               style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb", marginBottom: 12 }} />

        {error && <div style={{ color: "#b91c1c", fontSize: 12, marginBottom: 12 }}>{error}</div>}

        <button type="submit" disabled={busy}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>
          {busy ? "Signing in…" : "Sign in"}
        </button>

        {/* NEW: guest mode */}
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <div style={{ textAlign: "center", fontSize: 12, color: "#94a3b8" }}>— or —</div>
          <button
            type="button"
            onClick={() => setGuestMode(true)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}
          >
            Continue as guest
          </button>
        </div>
      </form>
    </div>
  );
}
