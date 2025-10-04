// src/App.js
import React from "react";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import Login from "./components/Login";
import PendoValueCalculator from "./PendoValueCalculator";
import { supabase } from "./utils/supabaseClient";
import PendoInit from "./components/PendoInit";

function Shell() {
  const { loading, user, guestMode, setGuestMode } = useAuth();

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user && !guestMode) return <Login />;

  const isGuest = !user;

  return (
    <>
      {/* small auth widget */}
      <div
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          display: "flex",
          gap: 8,
          fontSize: 12,
          color: "#475569",
        }}
      >
        {isGuest ? (
          <>
            <span>Guest mode (local only)</span>
            <button
              onClick={() => setGuestMode(false)}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "4px 8px",
                background: "#fff",
              }}
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            <span style={{ alignItems: "center", display: "flex", gap: 4 }}>
              User: {user.email}
            </span>
            <button
              onClick={() => supabase.auth.signOut()}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "4px 8px",
                background: "#fff",
              }}
            >
              Sign out
            </button>
          </>
        )}
      </div>

      {/* PendoInit will fetch identity itself and initialize with correct values on first load */}
      <PendoInit user={user || null} />

      <PendoValueCalculator isGuest={isGuest} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
