// src/components/Login.jsx
import React from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../auth/AuthProvider";
import dino from "../pendo-dino.png";

export default function Login() {
  const { setGuestMode } = useAuth();
  const [nameOrEmail, setNameOrEmail] = React.useState(""); // <-- can be name OR email
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const resolveEmail = async (input) => {
    const val = (input || "").trim();
    if (!val) return null;

    // If they typed an email, skip RPC
    if (val.includes("@")) return val;

    // Otherwise look up by full_name via RPC (bypasses RLS)
    const { data, error } = await supabase.rpc("login_email_for_name", {
      p_name: val,
    });
    if (error) throw error;
    return data || null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const email = await resolveEmail(nameOrEmail);
      if (!email) {
        setErr("No account found with that name.");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setErr(error.message);
    } catch (e2) {
      setErr(e2.message || "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  const continueAsGuest = async () => {
    try { await supabase.auth.signOut(); } catch {}
    setGuestMode(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#ffe4ec",
        fontFamily:
          "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial",
        padding: 16,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          width: "min(960px, 100%)",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          border: "1px solid #f4d0da",
          background: "#fff",
        }}
      >
        {/* Visual */}
        <div
          style={{
            background: "linear-gradient(135deg, #ffd1df 0%, #ffc1d4 50%, #ffb3ca 100%)",
            display: "grid",
            placeItems: "center",
            padding: 24,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <img src={dino} alt="Pendo Dino" style={{ width: 520, maxWidth: "80%" }} />
            <h1 style={{ margin: "12px 0 0", fontSize: 22, fontWeight: 800, color: "#8a1238" }}>
              Pendo Value & ROI Calculator
            </h1>
            <p style={{ color: "#7a2a44", margin: "6px 0 0", fontSize: 13 }}>
              Sign in to load & save customer presets — or explore as a guest.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} style={{ padding: 28, display: "grid", gap: 10, maxWidth: 520, width: "100%", margin: "0 auto" }}>
          <div>
            <label style={{ fontSize: 12, color: "#475569" }}>Name (or Email)</label>
            <input
              required
              value={nameOrEmail}
              onChange={(e) => setNameOrEmail(e.target.value)}
              placeholder="e.g. Admin or admin@example.com"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                marginTop: 4,
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#475569" }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                marginTop: 4,
                outline: "none",
              }}
            />
          </div>

          {err && <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 2 }}>{err}</div>}
          <div style={{ textAlign: "center"}}>
            <button
              type="submit"
              disabled={busy}
              style={{
                width: "70%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "none",
                background: "#ff3366",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                marginTop: 6,
              }}
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </div>
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, margin: "8px 0" }}>
            — or —
          </div>
          <div style={{ textAlign: "center"}}>
            <button
              type="button"
              onClick={continueAsGuest}
              style={{
                width: "70%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Continue as guest
            </button>
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 6 }}>
            Guests can explore everything but can’t save to a customer.
          </div>
        </form>
      </div>
    </div>
  );
}
