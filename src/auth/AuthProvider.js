// src/auth/AuthProvider.jsx
import React from "react";
import { supabase } from "../utils/supabaseClient";

const Ctx = React.createContext(null);
export const useAuth = () => React.useContext(Ctx);

export function AuthProvider({ children }) {
  const [session, setSession] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [guestMode, setGuestMode] = React.useState(false); // default OFF

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_ev, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) setGuestMode(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider value={{ session, user, loading, guestMode, setGuestMode }}>
      {children}
    </Ctx.Provider>
  );
}
