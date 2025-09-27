import React from "react";

export default function SummarySection({
  currency,
  leverValues,
  enabled,
  totalBenefits,
  pendoAnnualCost,
  netValue,
  roi,
  paybackMonths,
  minutesPerYear,
  effectiveCostPerMinute,
  box,
  summaryNum,
  currencyFmt,
}) {
  const leverTitles = {
    analytics: "License Optimization (Analytics)",
    guides: "Email Deflection (Guides)",
    feedback: "Capture at Scale (Feedback)",
    surveys: "Automate Collection (NPS & Surveys)",
    replay: "Faster Triage (Session Replay)",
    onboarding: "Onboarding Acceleration (Guides, Analytics)",
    productEff: "Product Team Efficiency (Analytics)",
    tickets: "Ticket Deflection (Guides, Session Replay)",
    trialUplift: "Trial→Paid / Upsell Uplift - PLG (Guides, Analytics)",
    expansion: "Expansion via Feature Adoption (Guides, Analytics)",
    mttr: "MTTR & Time-to-Reproduce Reduction (Session Replay, Analytics, Jira)",
    research: "Research/Recruitment Cost Avoidance (Guides, Surveys, Feedback)",
    training: "Training Content Shift - Formal → Just-in-Time (Guides)",
    consolidation:
      "Tool Consolidation (Analytics, Guides, NPS & Surveys, Feedback, Session Replay)",
    appStore: "App Store Rating & Review Lift (Pendo Mobile, Guides)",
    churn: "Churn Reduction from Detractor Workflows (NPS, Analytics)",
    release:
      "Release Validation & Hotfix Avoidance (Analytics, Session Replay, Guides)",
    sunsetting:
      "Feature Sunsetting & Maintenance Cost Reduction (Analytics, Feedback)",
    compliance: "Compliance & Risk Mitigation (Guides, Analytics)",
    licenseCompliance: "Internal SaaS License Compliance (Analytics)",
    commsCPM: "Per-Email Comms Cost Avoidance (In-App Announcements)",
  };

  const rows = Object.keys(leverValues)
    .filter((id) => enabled[id])
    .map((id) => ({
      label: leverTitles[id] || id,
      value: leverValues[id],
    }));

  return (
    <div
      id="tab-breakdown"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(600px, 1fr))",
        gap: 16,
        marginTop: 16,
      }}
    >
      <div style={box}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Annual Value Breakdown
        </div>

        {rows.map((r) => (
          <BreakdownRow
            key={r.label}
            label={r.label}
            value={r.value}
            currency={currency}
          />
        ))}

        <div style={{ height: 1, background: "#e5e7eb", margin: "8px 0" }} />

        <BreakdownRow
          label="Total benefits"
          value={totalBenefits}
          strong
          currency={currency}
        />
        <BreakdownRow
          label="Pendo annual cost"
          value={-pendoAnnualCost}
          currency={currency}
        />
        <BreakdownRow
          label="Net value"
          value={netValue}
          strong
          currency={currency}
        />
      </div>

      <div style={box}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          ROI Snapshot
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            fontSize: 14,
          }}
        >
          <Stat label="ROI" value={`${(roi * 100).toFixed(0)}%`} />
          <Stat
            label="Payback (months)"
            value={Number.isFinite(paybackMonths) ? paybackMonths.toFixed(1) : "–"}
          />
          <Stat label="Minutes / year (per FTE)" value={minutesPerYear.toLocaleString()} />
          <Stat label="Effective $/minute" value={currencyFmt(effectiveCostPerMinute, currency)} />
          <Stat
            label="Levers enabled"
            value={`${rows.length}/${Object.keys(leverValues).length}`}
          />
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value, strong = false, currency = "GBP" }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        margin: "6px 0",
      }}
    >
      <div style={{ color: "#475569", fontWeight: strong ? 600 : 400 }}>{label}</div>
      <div
        style={{
          fontWeight: strong ? 700 : 500,
          color: value >= 0 ? "#0f172a" : "#be123c",
        }}
      >
        {new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
        }).format(Number.isFinite(value) ? value : 0)}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
      <div style={{ color: "#64748b", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
