import React from "react";
import { inputCss, labelCss } from "../styles";
import { num } from "../utils/format";

export function NumInput({ label, value, onChange, step = 1 }) {
  return (
    <div>
      <div style={labelCss}>{label}</div>
      <input
        inputMode="numeric"
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(num(e.target.value, 0))}
        style={inputCss}
      />
    </div>
  );
}

export function CurrencyInput({ label, value, onChange, currency = "GBP", disabled = false }) {
  return (
    <div>
      <div style={labelCss}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 8 }}>
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: "8px 10px",
            background: "#f8fafc",
            fontSize: 12,
            color: "#475569",
            minWidth: 58,
            textAlign: "center",
          }}
        >
          {currency}
        </div>
        <input
          inputMode="decimal"
          type="number"
          step={0.01}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(num(e.target.value, 0))}
          style={{ ...inputCss, opacity: disabled ? 0.6 : 1 }}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export function RangeInput({ label, value, onChange, step = 0.01, min = 0, max = 1 }) {
  return (
    <div>
      <div style={{ ...labelCss, display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        <span>{(value * 100).toFixed(0)}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(num(e.target.value, 0))}
        style={{ width: "100%" }}
      />
    </div>
  );
}
