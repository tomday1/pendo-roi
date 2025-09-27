import React from "react";
import { PBO_COLORS } from "../data/mappings";

// base card style
const cardBase = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const currencyFmt = (n, currency = "GBP") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
    Number.isFinite(n) ? n : 0
  );

export default function ModuleCard({
  title,
  description,
  value,
  currency = "GBP",
  info,
  pbo, // "increase" | "cost" | "risk" (optional for neutral cards)
  children,
}) {
  const [open, setOpen] = React.useState(false);
  const bg = pbo && PBO_COLORS[pbo] ? PBO_COLORS[pbo] : "#fff";

  return (
    <div style={{ ...cardBase, background: bg, position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "left",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
          {info ? (
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={`Info for ${title}`}
              title="Show calculation details"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 999,
                width: 20,
                height: 20,
                lineHeight: "18px",
                fontSize: 12,
                background: "#fff",
                cursor: "pointer",
                color: "#0f172a",
                textAlign: "center",
                padding: 0,
              }}
            >
              i
            </button>
          ) : null}
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: value >= 0 ? "#047857" : "#be123c",
            whiteSpace: "nowrap",
          }}
        >
          {value >= 0 ? "+" : ""}
          {currencyFmt(value, currency)}
        </div>
      </div>

      {open && info && (
        <div
          role="dialog"
          aria-label={`${title} calculation`}
          style={{
            position: "absolute",
            top: 36,
            right: 8,
            zIndex: 30,
            width: 340,
            background: "#111827",
            color: "#fff",
            borderRadius: 12,
            padding: 12,
            boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
          }}
          onClick={() => setOpen(false)}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            How this is calculated
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.5, color: "#e5e7eb" }}>
            {info}
          </div>
          <div style={{ fontSize: 11, marginTop: 8, color: "#cbd5e1" }}>
            (Click to dismiss)
          </div>
        </div>
      )}

      <p
        style={{
          color: "#64748b",
          fontSize: 10,
          marginTop: 6,
          textAlign: "left",
        }}
      >
        {description}
      </p>
      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>{children}</div>
    </div>
  );
}
