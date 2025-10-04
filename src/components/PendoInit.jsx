// src/components/PendoInit.jsx
import { useEffect, useRef } from "react";
import { supabase } from "../utils/supabaseClient";

// Helper to generate a random GUID (for guests)
function generateGUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Load the Pendo agent exactly once and await it
function loadPendoAgent(apiKey) {
  return new Promise((resolve) => {
    // Already injected and loaded
    if (window.pendo?.isAgentLoaded?.()) return resolve(window.pendo);

    // Already injected but not necessarily loaded – wait a tick
    if (window.pendo && typeof window.pendo.initialize === "function") {
      const check = () => {
        if (window.pendo?.isAgentLoaded?.()) resolve(window.pendo);
        else setTimeout(check, 50);
      };
      return check();
    }

    // Inject
    (function (p, e, n, d, o) {
      var v, w, x, y, z;
      o = p[d] = p[d] || {};
      o._q = o._q || [];
      v = ["initialize", "identify", "updateOptions", "pageLoad", "track"];
      for (w = 0, x = v.length; w < x; ++w)
        (function (m) {
          o[m] =
            o[m] ||
            function () {
              o._q[m === v[0] ? "unshift" : "push"]([
                m,
                ...Array.prototype.slice.call(arguments, 0),
              ]);
            };
        })(v[w]);
      y = e.createElement(n);
      y.async = true;
      y.src = "https://cdn.pendo.io/agent/static/" + apiKey + "/pendo.js";
      y.onload = () => resolve(window.pendo);
      z = e.getElementsByTagName(n)[0];
      z.parentNode.insertBefore(y, z);
    })(window, document, "script", "pendo");
  });
}

// Fetch profile & customer access (joined to customers for name)
async function fetchIdentityFromSupabase(userId) {
  // profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  // access rows with joined customer names
  const { data: accessRows } = await supabase
    .from("customer_access")
    .select(
      `
      role,
      customer_id,
      customers!inner (
        id,
        name
      )
    `
    )
    .eq("user_id", userId);

  let currentAccess = null;
  if (Array.isArray(accessRows) && accessRows.length) {
    // Prefer "Pendo" when present
    currentAccess =
      accessRows.find((r) => r.customers?.name === "Pendo") || accessRows[0];
  }

  return { profile: profile || null, currentAccess };
}

/**
 * Props:
 *  - user: Supabase user object or null
 *  - currentCustomerName (optional): if you already know it; otherwise we’ll read from DB
 */
export default function PendoInit({ user, currentCustomerName }) {
  const lastSigRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const apiKey = "23446339-1e69-4a79-a236-a6569c099656";

      // 1) Build metadata FIRST (from Supabase), then init Pendo
      const isGuest = !user;
      let payload;

      if (isGuest) {
        // Guest path – no DB fetch
        const visitorId = generateGUID();
        payload = {
          visitor: {
            id: visitorId,
            email: "guest@example.com",
            full_name: "Guest User",
            role: "guest",
          },
          account: {
            id: "Guest Account",
            name: "Guest Account",
          },
        };
      } else {
        // Logged-in path – fetch from DB
        const { profile, currentAccess } = await fetchIdentityFromSupabase(user.id);

        const email = user.email;
        const fullName =
          profile?.full_name ||
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          (email ? email.split("@")[0] : "User");

        const role =
          currentAccess?.role || user?.user_metadata?.role || "user";

        const accountName =
          currentCustomerName ||
          currentAccess?.customers?.name ||
          "Unknown Account";

        payload = {
          visitor: {
            id: user.id,
            email,
            full_name: fullName,
            role,
          },
          account: {
            id: accountName,
            name: accountName,
          },
        };
      }

      if (cancelled) return;

      // 2) Avoid redundant inits (compare signature)
      const sig = JSON.stringify(payload);
      if (sig === lastSigRef.current && window.pendo?.isAgentInitialized?.()) {
        return;
      }
      lastSigRef.current = sig;

      // 3) Ensure agent is loaded, then teardown (if supported) and initialize with our payload
      await loadPendoAgent(apiKey);

      try {
        if (window.pendo?.isAgentInitialized?.() && typeof window.pendo.teardown === "function") {
          window.pendo.teardown();
        }
      } catch {
        // ignore
      }

      window.pendo.initialize(payload);
      window.pendo.pageLoad?.();

      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.log("Pendo Install Validation (first init, no refresh needed):", payload);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, currentCustomerName]);

  return null;
}
