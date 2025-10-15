// src/components/TopBanner.jsx
import React from "react";
import { useAuth } from "../auth/AuthProvider";
import { supabase } from "../utils/supabaseClient";
import { listCustomers } from "../utils/presetsRemote";

const barCss = {
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 12,
  background: "#f9fafd",
  width: "100%",
  padding: "8px 12px",
  position: "sticky",
  top: 0,
  zIndex: 50,
  position: "relative",
};

const iconBtn = {
  height: 36,
  width: 36,
  borderRadius: "999px",
  border: "1px solid #e5e7eb",
  background: "#fff",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",position: "relative",
  right: 80,
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

const line = { display: "flex", justifyContent: "space-between", gap: 8, margin: "6px 0" };
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

  // Resolve customer name from ID
  React.useEffect(() => {
    let cancelled = false;

    async function resolveName() {
      if (!currentCustomerId) {
        if (!cancelled) setCustomerName("");
        return;
      }
      try {
        const list = await listCustomers(); // expects [{ id, name }, ...]
        const match = Array.isArray(list)
          ? list.find((c) => c.id === currentCustomerId)
          : null;
        if (!cancelled) {
          setCustomerName(match?.name || "");
        }
      } catch {
        if (!cancelled) setCustomerName("");
      }
    }

    resolveName();
    return () => {
      cancelled = true;
    };
  }, [currentCustomerId]);

  const initials = React.useMemo(() => {
    const email = user?.email || "G";
    const ch = email.trim()[0]?.toUpperCase() || "G";
    return ch;
  }, [user]);

  const role =
    (user?.user_metadata && (user.user_metadata.role || user.user_metadata.Role)) ||
    "Member";

  return (
    <div style={barCss}>
      <div
        style={{ position: "relative" }}
        onMouseEnter={() => setOpenProfile(true)}
        onMouseLeave={() => setOpenProfile(false)}
      >
        <button aria-label="Profile" title="Profile" style={iconBtn}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{initials}</span>
        </button>

        {openProfile && (
          <div style={popover}>
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
                <button style={pill} onClick={() => supabase.auth.signOut()}>
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
