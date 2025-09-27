import React from "react";

export default function AssumptionsSection({
  currency,
  pmSalary,
  setPmSalary,
  workDays,
  setWorkDays,
  hoursPerDay,
  setHoursPerDay,
  overrideMinCost,
  setOverrideMinCost,
  costPerMinute,
  setCostPerMinute,
  derivedCostPerMinute,
  effectiveCostPerMinute,
  inputCss,
  labelCss,
  hstack,
  box,
  currencyFmt,
}) {
  return (
    <div id="tab-assumptions" style={{ ...box, marginTop: 16 }}>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
        Workforce Cost Basis
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        <CurrencyInput
          label="PM salary (annual)"
          value={pmSalary}
          onChange={setPmSalary}
          currency={currency}
          inputCss={inputCss}
          labelCss={labelCss}
        />
        <NumInput
          label="Working days / yr"
          value={workDays}
          onChange={setWorkDays}
          inputCss={inputCss}
          labelCss={labelCss}
        />
        <NumInput
          label="Hours per day"
          step={0.25}
          value={hoursPerDay}
          onChange={setHoursPerDay}
          inputCss={inputCss}
          labelCss={labelCss}
        />

        <div>
          <div style={labelCss}>Cost per minute (derived or override)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <input
              style={inputCss}
              type="number"
              step="0.01"
              value={overrideMinCost ? costPerMinute : derivedCostPerMinute}
              onChange={(e) => setCostPerMinute(num(e.target.value, 0))}
              disabled={!overrideMinCost}
            />
            <label style={{ ...hstack, fontSize: 12, color: "#475569" }}>
              <input
                type="checkbox"
                checked={overrideMinCost}
                onChange={(e) => setOverrideMinCost(e.target.checked)}
              />
              Manual
            </label>
          </div>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
            Derived: {currencyFmt(derivedCostPerMinute, currency)} from salary and calendar.
          </p>
        </div>
      </div>

      <div style={{ height: 1, background: "#e5e7eb", margin: "16px 0" }} />

      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
        Hourly Cost
      </div>
      <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>
        These are used as sensible defaults for hourly cost fields in modules (you can override inside each card).
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        <CurrencyInput
          label="Derived hourly cost (from $/min × 60)"
          value={Math.round(effectiveCostPerMinute * 60)}
          onChange={() => {}}
          currency={currency}
          disabled
          inputCss={inputCss}
          labelCss={labelCss}
        />
      </div>

      <div style={{ marginTop: 12, fontSize: 13, color: "#475569" }}>
        Defaults mirror your examples and TEI-style benchmarks. Adjust anything to match reality.
      </div>
    </div>
  );
}

// --- Small helpers for this file only ---
const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function NumInput({ label, value, onChange, step = 1, inputCss, labelCss }) {
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

function CurrencyInput({
  label,
  value,
  onChange,
  currency = "GBP",
  disabled = false,
  inputCss,
  labelCss,
}) {
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
