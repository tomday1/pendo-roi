import React from "react";
import { useAuth } from "../auth/AuthProvider";
import { supabase } from "../utils/supabaseClient";
import { listCustomers } from "../utils/presetsRemote";

const barCss = {
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 0,
  background: "#f9fafd",
  padding: "0px 12px",
  position: "sticky",
  top: 0,
  zIndex: 50,
  position: "relative",
};

const iconBtn = {
  height: 50,
  width: 50,
  borderRadius: "999px",
  border: "1px solid #e5e7eb",
  background: "#fff",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  position: "relative",
  right: 50,
  marginTop: 12,
  marginRight: 12,
};

const popover = {
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  minWidth: 260,
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
  zIndex: 60,
  fontSize: 13,
  color: "#0f172a",
};

const line = { display: "flex", justifyContent: "space-between", gap: 8, margin: "6px 0", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" };
const label = { color: "#64748b" };
const pill = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: "4px 8px",
  background: "#fff",
  cursor: "pointer",
};

export default function TopBanner({ isGuest, currentCustomerId, onOpenBot }) {
  const { user } = useAuth();
  const [openProfile, setOpenProfile] = React.useState(false);
  const [customerName, setCustomerName] = React.useState("");
  const wrapperRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  const popoverId = "profile-popover";

  // Resolve customer name from ID
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!currentCustomerId) {
        if (!cancelled) setCustomerName("");
        return;
      }
      try {
        const list = await listCustomers(); // expects [{ id, name }, ...]
        const match = Array.isArray(list) ? list.find(c => c.id === currentCustomerId) : null;
        if (!cancelled) setCustomerName(match?.name || "");
      } catch {
        if (!cancelled) setCustomerName("");
      }
    })();
    return () => { cancelled = true; };
  }, [currentCustomerId]);

  const initials = React.useMemo(() => {
    const email = user?.email || "G";
    const ch = email.trim()[0]?.toUpperCase() || "G";
    return ch;
  }, [user]);

  const role =
    (user?.user_metadata && (user.user_metadata.role || user.user_metadata.Role)) ||
    "Member";

  // Click outside to close
  React.useEffect(() => {
    function onDocDown(e) {
      if (!openProfile) return;
      const el = wrapperRef.current;
      if (el && !el.contains(e.target)) setOpenProfile(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpenProfile(false);
    }
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("touchstart", onDocDown, { passive: true });
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("touchstart", onDocDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [openProfile]);

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      // Optional: force refresh or route to login
      // window.location.reload();
    } catch (e) {
      console.error("Sign out failed", e);
    }
  }

  return (
    <div style={barCss}>
      {/* Profile wrapper (CLICK to toggle; no hover handlers) */}
      <div style={{ position: "relative" }} ref={wrapperRef}>
        <button
          ref={buttonRef}
          aria-label="Profile"
          title="Profile"
          style={iconBtn}
          onClick={() => setOpenProfile(v => !v)}
          aria-haspopup="menu"
          aria-expanded={openProfile}
          aria-controls={openProfile ? popoverId : undefined}
        >
          <span style={{ fontWeight: 600, fontSize: 14 }}>{initials}</span>
        </button>

        {openProfile && (
          <div
            id={popoverId}
            role="menu"
            style={popover}
            tabIndex={-1}
            onKeyDown={(e) => { if (e.key === "Escape") setOpenProfile(false); }}
          >
            <div style={line}>
              <span style={label}>User</span>
              <span>{user?.email || "Guest"}</span>
            </div>
            <div style={line}>
              <span style={label}>Customer</span>
              <span
                style={{
                  maxWidth: 160,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={customerName || (currentCustomerId ? String(currentCustomerId) : "None")}
              >
                {customerName || (currentCustomerId ? "Unknown customer" : "None selected")}
              </span>
            </div>
            <div style={line}>
              <span style={label}>Role</span>
              <span>{role}</span>
            </div>

            {!isGuest && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <button style={pill} onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        aria-label="Open assistant"
        title="Open assistant"
        style={iconBtn}
        onClick={onOpenBot}
      >
        🤖
      </button>
    </div>
  );
}
