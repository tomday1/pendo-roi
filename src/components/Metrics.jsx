import React from "react";
import { currencyFmt } from "../utils/format";

export function BreakdownRow({ label, value, strong = false, currency = "GBP" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "6px 0" }}>
      <div style={{ color: "#475569", fontWeight: strong ? 600 : 400 }}>{label}</div>
      <div style={{ fontWeight: strong ? 700 : 500, color: value >= 0 ? "#0f172a" : "#be123c" }}>
        {currencyFmt(value, currency)}
      </div>
    </div>
  );
}

export function Stat({ label, value }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
      <div style={{ color: "#64748b", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
