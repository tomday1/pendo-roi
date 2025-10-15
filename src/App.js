// src/App.js
import React from "react";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import Login from "./components/Login";
import PendoValueCalculator from "./PendoValueCalculator";
import { supabase } from "./utils/supabaseClient";
import PendoInit from "./components/PendoInit";
import TopBanner from "./components/TopBanner";
import ChatPanel from "./components/ChatPanel";

function Shell() {
  const { loading, user, guestMode } = useAuth();
  const [showBot, setShowBot] = React.useState(false);
  const [currentCustomerId, setCurrentCustomerId] = React.useState(null);

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user && !guestMode) return <Login />;

  const isGuest = !user;

  return (
    <>
      <TopBanner
        isGuest={isGuest}
        currentCustomerId={currentCustomerId}
        onOpenBot={() => setShowBot(true)}
      />

      <PendoInit user={user || null} />

      <PendoValueCalculator
        isGuest={isGuest}
        currentCustomerId={currentCustomerId}
        setCurrentCustomerId={setCurrentCustomerId}
      />

      <ChatPanel open={showBot} onClose={() => setShowBot(false)} />
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
