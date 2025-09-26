import React, { useMemo, useState, useEffect } from "react";
import ExportMenu from "./ExportMenu";

// --- Tiny style system (no external UI libs) ---
const font = {
  fontFamily:
    "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
};
const page = { minHeight: "100vh", background: "#f8fafc", padding: 24, ...font };
const container = { maxWidth: 1800, margin: "0 auto" };
const box = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};
const hstack = { display: "flex", alignItems: "center", gap: 12 };
const summaryNum = { fontSize: 22, fontWeight: 600 };
const labelCss = { fontSize: 12, color: "#475569", marginBottom: 4 };
const inputCss = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "10px 12px",
  width: "90%",
  background: "#fff",
};
const selectCss = { ...inputCss, width: 120 };
const tabBtn = (active) => ({
  ...inputCss,
  width: "auto",
  padding: "8px 12px",
  background: active ? "#111827" : "#fff",
  color: active ? "#fff" : "#111827",
  cursor: "pointer",
});

// --- Helpers ---
const currencyFmt = (n, currency) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
    Number.isFinite(n) ? n : 0
  );

const pctFmt = (n) => `${(n * 100).toFixed(0)}%`;

const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// LocalStorage-backed state (JS)
const useLocal = (key, initial) => {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
};

export default function PendoValueCalculator() {
  const [currency, setCurrency] = useLocal("pendo.currency", "GBP");

  // --- Global / workforce assumptions ---
  const [pmSalary, setPmSalary] = useLocal("pendo.pmSalary", 100000);
  const [workDays, setWorkDays] = useLocal("pendo.workDays", 261);
  const [hoursPerDay, setHoursPerDay] = useLocal("pendo.hoursPerDay", 7.5);
  const [overrideMinCost, setOverrideMinCost] = useLocal("pendo.overrideMinCost", true);
  const [costPerMinute, setCostPerMinute] = useLocal("pendo.costPerMinute", 1.0);
  const hourlyFromMinute =
    (overrideMinCost ? costPerMinute : pmSalary / (workDays * hoursPerDay * 60)) * 60;

  // --- Enable/disable levers ---
  const [enabled, setEnabled] = useLocal("pendo.enabledLevers", {
    analytics: true,
    guides: true,
    feedback: true,
    surveys: true,
    replay: true,
    // New levers default off (toggle on as needed)
    onboarding: false,
    productEff: false,
    tickets: false,
    trialUplift: false,
    expansion: false,
    mttr: false,
    research: false,
    training: false,
    consolidation: false,
    appStore: false,
    churn: false,
    release: false,
    sunsetting: false,
    compliance: false,
    licenseCompliance: false,
    commsCPM: false,
  });
  const toggleLever = (k) => setEnabled({ ...enabled, [k]: !enabled[k] });
  const selectAll = () =>
    setEnabled(Object.fromEntries(Object.keys(enabled).map((k) => [k, true])));
  const selectNone = () =>
    setEnabled(Object.fromEntries(Object.keys(enabled).map((k) => [k, false])));

  // --- Existing: Analytics license optimization ---
  const [licenseCostPerUserMo, setLicenseCostPerUserMo] = useLocal(
    "pendo.licenseCostPerUserMo",
    50
  );
  const [analyticsUsers, setAnalyticsUsers] = useLocal(
    "pendo.analyticsUsers",
    1000
  );
  const [licenseOptPct, setLicenseOptPct] = useLocal(
    "pendo.licenseOptPct",
    0.1
  ); // 10%
  const licenseCostPerUserYr = licenseCostPerUserMo * 12;
  const analyticsSavings = analyticsUsers * licenseCostPerUserYr * licenseOptPct;

  // --- Existing: Guides (email deflection) ---
  const [emailCost, setEmailCost] = useLocal("pendo.emailCost", 2.6);
  const [emailsDeflected, setEmailsDeflected] = useLocal(
    "pendo.emailsDeflected",
    50000
  );
  const guidesSavings = emailsDeflected * emailCost;

  // --- Existing: Feedback ---
  const [feedbackUnitCost, setFeedbackUnitCost] = useLocal(
    "pendo.feedbackUnitCost",
    15
  );
  const [feedbackCount, setFeedbackCount] = useLocal(
    "pendo.feedbackCount",
    10000
  );
  const feedbackSavings = feedbackCount * feedbackUnitCost;

  // --- Existing: NPS / Surveys ---
  const [surveyUnitCost, setSurveyUnitCost] = useLocal(
    "pendo.surveyUnitCost",
    5
  );
  const [surveyCount, setSurveyCount] = useLocal("pendo.surveyCount", 20000);
  const surveySavings = surveyCount * surveyUnitCost;

  // --- Existing: Session Replay (useful replays) ---
  const [replayUnitSaving, setReplayUnitSaving] = useLocal(
    "pendo.replayUnitSaving",
    120
  );
  const [totalReplays, setTotalReplays] = useLocal("pendo.totalReplays", 5000);
  const [replayUsefulPct, setReplayUsefulPct] = useLocal(
    "pendo.replayUsefulPct",
    0.1
  ); // 10%
  const replaySavings = totalReplays * replayUsefulPct * replayUnitSaving;

  // === New Levers ===
  // 1) Onboarding Acceleration
  const [onUsers, setOnUsers] = useLocal("pendo.on.users", 5000);
  const [onHoursBase, setOnHoursBase] = useLocal("pendo.on.hoursBase", 6);
  const [onReduction, setOnReduction] = useLocal("pendo.on.reduction", 0.5);
  const [onHrCost, setOnHrCost] = useLocal("pendo.on.hrCost", Math.round(hourlyFromMinute));
  const [onRecap, setOnRecap] = useLocal("pendo.on.recap", 0.5);
  const onboardingSavings =
    onUsers * onHoursBase * onReduction * onHrCost * onRecap;

  // 2) Product Team Efficiency (Analytics) (self-serve analytics)
  const [pteCount, setPteCount] = useLocal("pendo.pte.count", 60);
  const [pteCost, setPteCost] = useLocal("pendo.pte.cost", 140000);
  const [ptePct, setPtePct] = useLocal("pendo.pte.pct", 0.05);
  const productEffSavings = pteCount * pteCost * ptePct;

  // 3) Ticket Deflection at Scale (Guides, Session Replay) (+ faster handling)
  const [tdBase, setTdBase] = useLocal("pendo.td.base", 20000);
  const [tdDeflect, setTdDeflect] = useLocal("pendo.td.deflect", 0.3);
  const [tdHrs, setTdHrs] = useLocal("pendo.td.hrs", 0.75);
  const [tdCostHr, setTdCostHr] = useLocal("pendo.td.costHr", 30);
  const [tdRecap, setTdRecap] = useLocal("pendo.td.recap", 0.5);
  const [tdTimeReduction, setTdTimeReduction] = useLocal(
    "pendo.td.timeRed",
    0.25
  );
  const tdAvoided = tdBase * tdDeflect;
  const tdRemain = tdBase - tdAvoided;
  const ticketDeflectSavings =
    tdAvoided * tdHrs * tdCostHr * tdRecap +
    tdRemain * tdHrs * tdTimeReduction * tdCostHr * tdRecap;

  // 4) Trial→Paid / Upsell Uplift (Guides, Analytics) (PLG)
  const [plgTrials, setPlgTrials] = useLocal("pendo.plg.trials", 10000);
  const [plgBaseConv, setPlgBaseConv] = useLocal("pendo.plg.baseConv", 0.2);
  const [plgUplift, setPlgUplift] = useLocal("pendo.plg.uplift", 0.1);
  const [plgArpaMo, setPlgArpaMo] = useLocal("pendo.plg.arpaMo", 120);
  const [plgGM, setPlgGM] = useLocal("pendo.plg.gm", 0.85);
  const trialUpliftRevenue =
    plgTrials * plgBaseConv * plgUplift * plgArpaMo * 12 * plgGM;

  // 5) Expansion via Feature Adoption(Guides, Analytics)
  const [expEligible, setExpEligible] = useLocal("pendo.exp.eligible", 20000);
  const [expPre, setExpPre] = useLocal("pendo.exp.pre", 0.1);
  const [expPost, setExpPost] = useLocal("pendo.exp.post", 0.2);
  const [expPriceMo, setExpPriceMo] = useLocal("pendo.exp.priceMo", 15);
  const [expGM, setExpGM] = useLocal("pendo.exp.gm", 0.85);
  const expansionRevenue =
    expEligible * Math.max(0, expPost - expPre) * expPriceMo * 12 * expGM;

  // 6) MTTR & Time-to-Reproduce Reduction
  const [mttrTickets, setMttrTickets] = useLocal("pendo.mttr.tickets", 8000);
  const [mttrBeforeH, setMttrBeforeH] = useLocal("pendo.mttr.beforeH", 2.25);
  const [mttrAfterH, setMttrAfterH] = useLocal("pendo.mttr.afterH", 0.25);
  const [mttrCostHr, setMttrCostHr] = useLocal("pendo.mttr.costHr", 40);
  const [mttrRecap, setMttrRecap] = useLocal("pendo.mttr.recap", 0.5);
  const mttrOpsSavings =
    Math.max(0, mttrBeforeH - mttrAfterH) * mttrTickets * mttrCostHr * mttrRecap;
  const [incidents, setIncidents] = useLocal("pendo.mttr.incidents", 50);
  const [mttrBefore, setMttrBefore] = useLocal("pendo.mttr.before", 8);
  const [mttrAfter, setMttrAfter] = useLocal("pendo.mttr.after", 6);
  const [revPerHourAtRisk, setRevPerHourAtRisk] = useLocal(
    "pendo.mttr.revPerHour",
    5000
  );
  const mttrRevenueProtected =
    Math.max(0, mttrBefore - mttrAfter) * incidents * revPerHourAtRisk;
  const mttrTotalSavings = mttrOpsSavings + mttrRevenueProtected;

  // 7) Research/Recruitment Cost Avoidance
  const [resRecruits, setResRecruits] = useLocal("pendo.res.recruits", 600);
  const [resPanelCost, setResPanelCost] = useLocal("pendo.res.panelCost", 80);
  const [resHoursSaved, setResHoursSaved] = useLocal(
    "pendo.res.hoursSaved",
    200
  );
  const [resCostHr, setResCostHr] = useLocal("pendo.res.costHr", 40);
  const researchSavings = resRecruits * resPanelCost + resHoursSaved * resCostHr;

  // 8) Training Content Shift (Guides)
  const [trainHoursFormal, setTrainHoursFormal] = useLocal(
    "pendo.train.hoursFormal",
    10000
  );
  const [trainReduction, setTrainReduction] = useLocal(
    "pendo.train.reduction",
    0.5
  );
  const [trainCostHr, setTrainCostHr] = useLocal("pendo.train.costHr", 30);
  const [trainTravelAvoided, setTrainTravelAvoided] = useLocal(
    "pendo.train.travel",
    0
  );
  const trainingSavings =
    trainHoursFormal * trainReduction * trainCostHr + trainTravelAvoided;

  // 9) Tool Consolidation
  const [consRetiredCost, setConsRetiredCost] = useLocal(
    "pendo.cons.retiredCost",
    100000
  );
  const [consAdminHours, setConsAdminHours] = useLocal(
    "pendo.cons.adminHours",
    500
  );
  const [consAdminCostHr, setConsAdminCostHr] = useLocal(
    "pendo.cons.adminCostHr",
    40
  );
  const consolidationSavings = consRetiredCost + consAdminHours * consAdminCostHr;

  // 10) App Store Rating & Review Lift
  const [appTraffic, setAppTraffic] = useLocal("pendo.app.traffic", 500000);
  const [appCvrBefore, setAppCvrBefore] = useLocal("pendo.app.cvrBefore", 0.05);
  const [appCvrAfter, setAppCvrAfter] = useLocal("pendo.app.cvrAfter", 0.055);
  const [appArpuYear, setAppArpuYear] = useLocal("pendo.app.arpuYear", 20);
  const appStoreRevenue =
    Math.max(0, appCvrAfter - appCvrBefore) * appTraffic * appArpuYear;

  // 11) Churn Reduction
  const [crAccts, setCrAccts] = useLocal("pendo.cr.accts", 2000);
  const [crBase, setCrBase] = useLocal("pendo.cr.base", 0.1);
  const [crPost, setCrPost] = useLocal("pendo.cr.post", 0.08);
  const [crArpaYear, setCrArpaYear] = useLocal("pendo.cr.arpaYear", 3000);
  const [crGM, setCrGM] = useLocal("pendo.cr.gm", 0.85);
  const churnRetainedRevenue =
    Math.max(0, crBase - crPost) * crAccts * crArpaYear * crGM;

  // 12) Release Validation & Hotfix Avoidance
  const [relHotfixesAvoided, setRelHotfixesAvoided] = useLocal(
    "pendo.rel.hotfixes",
    20
  );
  const [relCostPerHotfix, setRelCostPerHotfix] = useLocal(
    "pendo.rel.costHotfix",
    10000
  );
  const [relBugHoursSaved, setRelBugHoursSaved] = useLocal(
    "pendo.rel.bugHours",
    1000
  );
  const [relCostHr, setRelCostHr] = useLocal("pendo.rel.costHr", 60);
  const releaseSavings =
    relHotfixesAvoided * relCostPerHotfix + relBugHoursSaved * relCostHr;

  // 13) Feature Sunsetting & Maintenance Cost Reduction
  const [sunEngHoursPerSprint, setSunEngHoursPerSprint] = useLocal(
    "pendo.sun.engHrsPerSprint",
    200
  );
  const [sunSprintsPerYear, setSunSprintsPerYear] = useLocal(
    "pendo.sun.sprints",
    6
  );
  const [sunCostHr, setSunCostHr] = useLocal("pendo.sun.costHr", 70);
  const [sunInfraAvoided, setSunInfraAvoided] = useLocal(
    "pendo.sun.infra",
    20000
  );
  const sunsettingSavings =
    sunEngHoursPerSprint * sunSprintsPerYear * sunCostHr + sunInfraAvoided;

  // 14) Compliance & Risk Mitigation (expected value)
  const [compProb, setCompProb] = useLocal("pendo.comp.prob", 0.02);
  const [compImpact, setCompImpact] = useLocal("pendo.comp.impact", 500000);
  const [compReduction, setCompReduction] = useLocal(
    "pendo.comp.reduction",
    0.3
  );
  const complianceSavings = compProb * compImpact * compReduction;

  // 15) Internal SaaS License Compliance
  const [lcInactive, setLcInactive] = useLocal("pendo.lc.inactive", 1000);
  const [lcBuffer, setLcBuffer] = useLocal("pendo.lc.buffer", 100);
  const [lcCostSeat, setLcCostSeat] = useLocal("pendo.lc.costSeat", 300);
  const lcSeatsReclaimed = Math.max(0, lcInactive - lcBuffer);
  const licenseComplianceSavings = lcSeatsReclaimed * lcCostSeat;

  // 16) Per-Email Comms Cost Avoidance (CPM + hours)
  const [cpmEmailsAvoided, setCpmEmailsAvoided] = useLocal(
    "pendo.cpm.emails",
    100000
  );
  const [cpmRate, setCpmRate] = useLocal("pendo.cpm.rate", 26); // cost per 1k emails
  const [cpmHoursAvoided, setCpmHoursAvoided] = useLocal("pendo.cpm.hours", 0);
  const [cpmCostHr, setCpmCostHr] = useLocal("pendo.cpm.costHr", 30);
  const commsCpmSavings =
    (cpmEmailsAvoided / 1000) * cpmRate + cpmHoursAvoided * cpmCostHr;

  // --- Cost of Pendo ---
  const [pendoAnnualCost, setPendoAnnualCost] = useLocal(
    "pendo.annualCost",
    250000
  );

  // === Derived totals ===
  const minutesPerYear = useMemo(
    () => workDays * hoursPerDay * 60,
    [workDays, hoursPerDay]
  );
  const derivedCostPerMinute = useMemo(
    () => pmSalary / minutesPerYear,
    [pmSalary, minutesPerYear]
  );
  const effectiveCostPerMinute = overrideMinCost
    ? costPerMinute
    : derivedCostPerMinute;

  const leverValues = {
    analytics: analyticsSavings,
    guides: guidesSavings,
    feedback: feedbackSavings,
    surveys: surveySavings,
    replay: replaySavings,
    onboarding: onboardingSavings,
    productEff: productEffSavings,
    tickets: ticketDeflectSavings,
    trialUplift: trialUpliftRevenue,
    expansion: expansionRevenue,
    mttr: mttrTotalSavings,
    research: researchSavings,
    training: trainingSavings,
    consolidation: consolidationSavings,
    appStore: appStoreRevenue,
    churn: churnRetainedRevenue,
    release: releaseSavings,
    sunsetting: sunsettingSavings,
    compliance: complianceSavings,
    licenseCompliance: licenseComplianceSavings,
    commsCPM: commsCpmSavings,
  };

  const totalBenefits = Object.entries(leverValues)
    .filter(([k]) => enabled[k])
    .reduce((acc, [, v]) => acc + v, 0);

  const netValue = totalBenefits - pendoAnnualCost;
  const roi = pendoAnnualCost > 0 ? netValue / pendoAnnualCost : 0;
  const paybackMonths =
    totalBenefits > 0
      ? Math.max(0, (pendoAnnualCost / totalBenefits) * 12)
      : Infinity;

  const resetAll = () => {
    // wipe everything including enable flags
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("pendo."));
    keys.forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  const [tab, setTab] = useState("levers");
  const [showSelector, setShowSelector] = useState(false);

  // --- Header config (NEW) ---
  const [logoUrl, setLogoUrl] = useLocal("pendo.logoUrl", "");
  const [showSettings, setShowSettings] = useState(false);

  const leverListMeta = [
    { id: "analytics", label: "License Optimization (Analytics)" },
    { id: "guides", label: "Email Deflection (Guides)" },
    { id: "feedback", label: "Capture at Scale (Feedback)" },
    { id: "surveys", label: "Automate Collection (NPS & Surveys)" },
    { id: "replay", label: "Faster Triage (Session Replay)" },
    { id: "onboarding", label: "Onboarding Acceleration (Guides, Analytics)" },
    { id: "productEff", label: "Product Team Efficiency (Analytics)" },
    { id: "tickets", label: "Ticket Deflection (Guides, Session Replay)" },
    { id: "trialUplift", label: "Trial→Paid / Upsell Uplift (Guides, Analytics)" },
    { id: "expansion", label: "Expansion via Feature Adoption (Guides, Analytics)" },
    { id: "mttr", label: "MTTR & Time-to-Reproduce Reduction (Session Replay, Analytics, Jira)" },
    { id: "research", label: "Research/Recruitment Cost Avoidance (Guides, Surveys, Feedback)" },
    { id: "training", label: "Training Content Shift (Guides)" },
    { id: "consolidation", label: "Tool Consolidation (Analytics, Guides, NPS & Surveys, Feedback, Session Replay)" },
    { id: "appStore", label: "App Store Rating & Review Lift (Pendo Mobile, Guides)" },
    { id: "churn", label: "Churn Reduction from Detractor Workflows (NPS, Analytics)" },
    { id: "release", label: "Release Validation & Hotfix Avoidance (Analytics, Session Replay, Guides)" },
    { id: "sunsetting", label: "Feature Sunsetting & Maintenance Cost Reduction (Analytics, Feedback)" },
    { id: "compliance", label: "Compliance & Risk Mitigation (Guides, Analytics)" },
    { id: "licenseCompliance", label: "Internal SaaS License Compliance (Analytics)" },
    { id: "commsCPM", label: "Per-Email Comms Cost Avoidance (Guides, Orchestrate)" },
  ];

  // Build export snapshot for current tab
  const buildSnapshot = () => {
    const enabledLevers = leverListMeta
      .filter((l) => enabled[l.id])
      .map((l) => ({ label: l.label, value: leverValues[l.id] }));

    return {
      tab,
      currency,
      kpis: {
        totalBenefits,
        pendoAnnualCost,
        netValue,
        roiPct: roi * 100,
        paybackMonths: Number.isFinite(paybackMonths) ? paybackMonths : null,
      },
      assumptions: {
        pmSalary,
        workDays,
        hoursPerDay,
        costPerMinute: effectiveCostPerMinute, // effective $/min in use
        effectiveHourly: Math.round(effectiveCostPerMinute * 60),
      },
      levers: enabledLevers,
    };
  };
  
  // Switch tabs and wait for the DOM to paint (used by export)
  const switchToTab = async (id) => {
    if (tab !== id) setTab(id);
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <div style={page}>
      <div style={container}>
        <header
          id="app-header"
          style={{
            ...hstack,
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 16,
          }}
        >
          <div>
            {/* Title (UPDATED with optional custom logo) */}
            <h1 style={{ fontSize: 28, fontWeight: 600, alignItems: "center", display: "flex", gap: 12, textAlign: "left" }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Customer logo" style={{ height: 100, width: 100, objectFit: "contain" }} />
              ) : null}
              <img src="/pendo.png" alt="Pendo" style={{ height: 100, width: 100, objectFit: "contain" }} />
              Value & ROI Calculator
            </h1>
            <p style={{ color: "#64748b", marginTop: 6 }}>
              Interactive model aligned to PBO levers: Increase Revenue, Cut
              Cost, Mitigate Risk.
            </p>
          </div>
          <div style={hstack}>
            <select
              style={selectCss}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Currency"
            >
              <option>GBP</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
            <button
              onClick={() => setShowSelector(!showSelector)}
              style={{ ...inputCss, width: "auto", cursor: "pointer" }}
            >
              {showSelector ? "Hide Levers" : "Choose Levers"}
            </button>
            <button
              onClick={resetAll}
              style={{ ...inputCss, width: 120, cursor: "pointer" }}
            >
              Reset
            </button>

            {/* Settings cog (NEW) */}
            <button
              onClick={() => setShowSettings(true)}
              aria-label="Settings"
              title="Settings"
              style={{ ...inputCss, width: 44, cursor: "pointer", display: "grid", placeItems: "center" }}
            >
              ⚙️
            </button>

            <ExportMenu
              buildSnapshot={buildSnapshot}
              tab={tab}
              inputCss={inputCss}
              sectionSelectors={["#tab-levers", "#tab-assumptions", "#tab-breakdown"]}
              tabIds={["levers", "assumptions", "summary"]}
              switchToTab={switchToTab}
            />

          </div>
        </header>

        {/* KPI Summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <div style={box}>
            <div style={{ fontSize: 14, color: "#475569", marginBottom: 8 }}>
              Total Annual Benefits
            </div>
            <div style={summaryNum}>{currencyFmt(totalBenefits, currency)}</div>
          </div>
          <div style={box}>
            <div style={{ fontSize: 14, color: "#475569", marginBottom: 8 }}>
              Pendo Annual Cost
            </div>
            <div style={summaryNum}>{currencyFmt(pendoAnnualCost, currency)}</div>
          </div>
          <div style={box}>
            <div style={{ fontSize: 14, color: "#475569", marginBottom: 8 }}>
              Net Value
            </div>
            <div
              style={{
                ...summaryNum,
                color: netValue >= 0 ? "#047857" : "#be123c",
              }}
            >
              {currencyFmt(netValue, currency)}
            </div>
          </div>
          <div style={box}>
            <div style={{ fontSize: 14, color: "#475569", marginBottom: 8 }}>
              ROI & Payback
            </div>
            <div style={summaryNum}>{(roi * 100).toFixed(0)}%</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Payback ≈ {Number.isFinite(paybackMonths) ? paybackMonths.toFixed(1) : "–"} months
            </div>
          </div>
        </div>

        {/* Lever multi-select */}
        {showSelector && (
          <div style={{ ...box, marginTop: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 600 }}>Select value levers</div>
              <div style={hstack}>
                <button
                  style={{ ...inputCss, width: "auto", cursor: "pointer" }}
                  onClick={selectAll}
                >
                  Select all
                </button>
                <button
                  style={{ ...inputCss, width: "auto", cursor: "pointer" }}
                  onClick={selectNone}
                >
                  None
                </button>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 8,
              }}
            >
              {leverListMeta.map((l) => (
                <label
                  key={l.id}
                  style={{
                    display: "flex",
                    alignItems: "left",
                    textAlign: "left",
                    gap: 8,
                    fontSize: 14,
                    color: "#0f172a",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!enabled[l.id]}
                    onChange={() => toggleLever(l.id)}
                  />
                  <span>{l.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ ...hstack, marginTop: 16, flexWrap: "wrap" }}>
          {[
            { id: "levers", label: "Value Levers" },
            { id: "assumptions", label: "Assumptions" },
            { id: "summary", label: "Breakdown" },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={tabBtn(tab === t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "levers" && (
          <div
            id="tab-levers"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: 16,
              marginTop: 16,
            }}
          >
            {enabled.analytics && (
              <ModuleCard
                title="License Optimization (Analytics)"
                description="Rightsize analytics licenses and cross-charge accurately using Pendo usage + metadata."
                value={analyticsSavings}
                currency={currency}
                info={
                  <>
                    <div><code>Analytics savings = users × (cost/user/year) × optimization%</code></div>
                    <div style={{ marginTop: 6 }}>
                      Where <em>cost/user/year</em> = <code>{licenseCostPerUserMo} × 12</code> and optimization% = <code>{(licenseOptPct*100).toFixed(0)}%</code>.
                    </div>
                  </>
                }
              >
                <NumInput
                  label="Users with analytics licenses"
                  value={analyticsUsers}
                  onChange={setAnalyticsUsers}
                />
                <CurrencyInput
                  label="License cost per user / month"
                  value={licenseCostPerUserMo}
                  onChange={setLicenseCostPerUserMo}
                  currency={currency}
                />
                <RangeInput
                  label={`Optimization rate (${pctFmt(licenseOptPct)})`}
                  value={licenseOptPct}
                  onChange={setLicenseOptPct}
                  step={0.01}
                  min={0}
                  max={0.6}
                />
              </ModuleCard>
            )}

            {enabled.guides && (
              <ModuleCard
                title="Email Deflection (Guides)"
                description="Replace costly broadcast emails with in-app guidance."
                value={guidesSavings}
                currency={currency}
                info={<div><code>Guides savings = emails shifted × cost/email</code></div>}
              >
                <NumInput
                  label="# of emails shifted to Guides / yr"
                  value={emailsDeflected}
                  onChange={setEmailsDeflected}
                />
                <CurrencyInput
                  label="Cost per email avoided"
                  value={emailCost}
                  onChange={setEmailCost}
                  currency={currency}
                />
              </ModuleCard>
            )}

            {enabled.feedback && (
              <ModuleCard
                title="Capture at Scale (Feedback)"
                description="Collect structured feedback with minutes instead of meetings."
                value={feedbackSavings}
                currency={currency}
                info={<div><code>Feedback savings = feedback count × saving per feedback</code></div>}
              >
                <NumInput
                  label="# of feedback items / yr"
                  value={feedbackCount}
                  onChange={setFeedbackCount}
                />
                <CurrencyInput
                  label="Saving per feedback"
                  value={feedbackUnitCost}
                  onChange={setFeedbackUnitCost}
                  currency={currency}
                />
              </ModuleCard>
            )}

            {enabled.surveys && (
              <ModuleCard
                title="Automate Collection (NPS & Surveys)"
                description="Automate sentiment capture and reduce manual survey ops."
                value={surveySavings}
                currency={currency}
                info={<div><code>Survey savings = surveys via Pendo × saving per survey</code></div>}
              >
                <NumInput
                  label="# of surveys via Pendo / yr"
                  value={surveyCount}
                  onChange={setSurveyCount}
                />
                <CurrencyInput
                  label="Saving per survey"
                  value={surveyUnitCost}
                  onChange={setSurveyUnitCost}
                  currency={currency}
                />
              </ModuleCard>
            )}

            {enabled.replay && (
              <ModuleCard
                title="Faster Triage (Session Replay)"
                description="Use replays to cut investigation time for bugs and issues."
                value={replaySavings}
                currency={currency}
                info={
                  <div>
                    <div><code>Replay savings = total replays × useful% × saving per useful replay</code></div>
                    <div style={{ marginTop: 6 }}><em>useful%</em> here is {(replayUsefulPct*100).toFixed(0)}%.</div>
                  </div>
                }
              >
                <NumInput
                  label="Total replays captured / yr"
                  value={totalReplays}
                  onChange={setTotalReplays}
                />
                <RangeInput
                  label={`Replays used for fixes (${pctFmt(replayUsefulPct)})`}
                  value={replayUsefulPct}
                  onChange={setReplayUsefulPct}
                  step={0.01}
                  min={0}
                  max={0.8}
                />
                <CurrencyInput
                  label="Saving per useful replay"
                  value={replayUnitSaving}
                  onChange={setReplayUnitSaving}
                  currency={currency}
                />
              </ModuleCard>
            )}

            {enabled.onboarding && (
              <ModuleCard
                title="Onboarding Acceleration (Guides, Analytics)"
                description="Cut training/onboarding time via in-app onboarding & help center."
                value={onboardingSavings}
                currency={currency}
                info={
                  <>
                    <div><code>Onboarding savings = users × baseline hours × reduction% × hourly cost × productivity recapture%</code></div>
                    <div style={{ marginTop: 6 }}>
                      Using: users={onUsers}, baseline hours={onHoursBase}, reduction={(onReduction*100).toFixed(0)}%, hourly cost≈{currencyFmt(onHrCost, currency)}, recapture={(onRecap*100).toFixed(0)}%.
                    </div>
                  </>
                }
              >
                <NumInput label="Users onboarded / yr" value={onUsers} onChange={setOnUsers} />
                <NumInput label="Hours onboarding (baseline)" value={onHoursBase} onChange={setOnHoursBase} step={0.25} />
                <RangeInput label={`Time reduction (${pctFmt(onReduction)})`} value={onReduction} onChange={setOnReduction} />
                <CurrencyInput label="Hourly cost" value={onHrCost} onChange={setOnHrCost} currency={currency} />
                <RangeInput label={`Productivity recapture (${pctFmt(onRecap)})`} value={onRecap} onChange={setOnRecap} />
              </ModuleCard>
            )}

            {enabled.productEff && (
              <ModuleCard
                title="Product Team Efficiency (Analytics)"
                description="Fewer BI/eng asks; faster decisions with self-serve analytics."
                value={productEffSavings}
                currency={currency}
                info={<div><code>Efficiency savings = roles × fully burdened cost/yr × efficiency uplift%</code></div>}
              >
                <NumInput label="# of PM/Design/Analyst roles" value={pteCount} onChange={setPteCount} />
                <CurrencyInput label="Fully burdened cost per person / yr" value={pteCost} onChange={setPteCost} currency={currency} />
                <RangeInput label={`Efficiency uplift (${pctFmt(ptePct)})`} value={ptePct} onChange={setPtePct} max={0.2} />
              </ModuleCard>
            )}

            {enabled.tickets && (
              <ModuleCard
                title="Ticket Deflection (Guides, Session Replay)"
                description="In-app help + replay reduces tickets and speeds handling."
                value={ticketDeflectSavings}
                currency={currency}
                info={
                  <>
                    <div><code>Deflection savings = avoided tickets × hrs/ticket × $/hr × recapture%</code></div>
                    <div><code>Faster handling savings = remaining tickets × hrs/ticket × time reduction% × $/hr × recapture%</code></div>
                    <div style={{ marginTop: 6 }}>Avoided = baseline × deflection%.</div>
                  </>
                }
              >
                <NumInput label="Tickets per year (baseline)" value={tdBase} onChange={setTdBase} />
                <RangeInput label={`Deflection rate (${pctFmt(tdDeflect)})`} value={tdDeflect} onChange={setTdDeflect} />
                <NumInput label="Hours per ticket" value={tdHrs} onChange={setTdHrs} step={0.25} />
                <CurrencyInput label="Cost per hour" value={tdCostHr} onChange={setTdCostHr} currency={currency} />
                <RangeInput label={`Time recapture (${pctFmt(tdRecap)})`} value={tdRecap} onChange={setTdRecap} />
                <RangeInput label={`Faster handling on remaining (${pctFmt(tdTimeReduction)})`} value={tdTimeReduction} onChange={setTdTimeReduction} />
              </ModuleCard>
            )}

            {enabled.trialUplift && (
              <ModuleCard
                title="Trial→Paid / Upsell Uplift - PLG (Guides, Analytics)"
                description="Nudges lift conversion at moments of value; marginized ARR."
                value={trialUpliftRevenue}
                currency={currency}
                info={
                  <div>
                    <code>Revenue = trials × base conversion% × uplift% × ARPA/mo × 12 × GM%</code>
                  </div>
                }
              >
                <NumInput label="# of trials" value={plgTrials} onChange={setPlgTrials} />
                <RangeInput label={`Base conversion (${pctFmt(plgBaseConv)})`} value={plgBaseConv} onChange={setPlgBaseConv} max={1} />
                <RangeInput label={`Uplift (${pctFmt(plgUplift)})`} value={plgUplift} onChange={setPlgUplift} max={0.5} />
                <CurrencyInput label="ARPA / month" value={plgArpaMo} onChange={setPlgArpaMo} currency={currency} />
                <RangeInput label={`Gross margin (${pctFmt(plgGM)})`} value={plgGM} onChange={setPlgGM} max={1} />
              </ModuleCard>
            )}

            {enabled.expansion && (
              <ModuleCard
                title="Expansion via Feature Adoption (Guides, Analytics)"
                description="Targeted education increases attach of premium features."
                value={expansionRevenue}
                currency={currency}
                info={
                  <div>
                    <code>Revenue = eligible users × (post - pre adoption) × price/mo × 12 × GM%</code>
                  </div>
                }
              >
                <NumInput label="Users eligible" value={expEligible} onChange={setExpEligible} />
                <RangeInput label={`Adoption pre (${pctFmt(expPre)})`} value={expPre} onChange={setExpPre} max={1} />
                <RangeInput label={`Adoption post (${pctFmt(expPost)})`} value={expPost} onChange={setExpPost} max={1} />
                <CurrencyInput label="Premium attach price / month" value={expPriceMo} onChange={setExpPriceMo} currency={currency} />
                <RangeInput label={`Gross margin (${pctFmt(expGM)})`} value={expGM} onChange={setExpGM} max={1} />
              </ModuleCard>
            )}

            {enabled.mttr && (
              <ModuleCard
                title="MTTR & Time-to-Reproduce Reduction (Session Replay, Analytics, Jira)"
                description="Replay shortens investigation and protects revenue during incidents."
                value={mttrTotalSavings}
                currency={currency}
                info={
                  <>
                    <div><code>Ops savings = (hrs before - hrs after) × tickets × $/hr × recapture%</code></div>
                    <div><code>Revenue protected = (MTTR before - after) × incidents × $/hr at risk</code></div>
                  </>
                }
              >
                <NumInput label="# of tickets" value={mttrTickets} onChange={setMttrTickets} />
                <NumInput label="Hours before" value={mttrBeforeH} onChange={setMttrBeforeH} step={0.25} />
                <NumInput label="Hours after" value={mttrAfterH} onChange={setMttrAfterH} step={0.25} />
                <CurrencyInput label="Ops cost / hour" value={mttrCostHr} onChange={setMttrCostHr} currency={currency} />
                <RangeInput label={`Time recapture (${pctFmt(mttrRecap)})`} value={mttrRecap} onChange={setMttrRecap} />
                <div style={{ height: 1, background: "#e5e7eb", margin: "6px 0" }} />
                <NumInput label="# of incidents (revenue at risk)" value={incidents} onChange={setIncidents} />
                <NumInput label="MTTR before (hrs)" value={mttrBefore} onChange={setMttrBefore} />
                <NumInput label="MTTR after (hrs)" value={mttrAfter} onChange={setMttrAfter} />
                <CurrencyInput label="Revenue / hour at risk" value={revPerHourAtRisk} onChange={setRevPerHourAtRisk} currency={currency} />
              </ModuleCard>
            )}

            {enabled.research && (
              <ModuleCard
                title="Research/Recruitment Cost Avoidance (Guides, Surveys, Feedback)"
                description="Slash panel fees and lead times using in-app recruitment."
                value={researchSavings}
                currency={currency}
                info={
                  <div>
                    <code>Research savings = recruits × panel cost + research hours saved × $/hr</code>
                  </div>
                }
              >
                <NumInput label="# of recruits" value={resRecruits} onChange={setResRecruits} />
                <CurrencyInput label="Panel cost per recruit" value={resPanelCost} onChange={setResPanelCost} currency={currency} />
                <NumInput label="Research hours saved" value={resHoursSaved} onChange={setResHoursSaved} />
                <CurrencyInput label="Cost / hour" value={resCostHr} onChange={setResCostHr} currency={currency} />
              </ModuleCard>
            )}

            {enabled.training && (
              <ModuleCard
                title="Training Content Shift - Formal → Just-in-Time (Guides)"
                description="Reduce formal training hours and travel/venue spend."
                value={trainingSavings}
                currency={currency}
                info={
                  <div>
                    <code>Training savings = formal hours × reduction% × $/hr + travel/venue avoided</code>
                  </div>
                }
              >
                <NumInput label="Formal training hours / yr" value={trainHoursFormal} onChange={setTrainHoursFormal} />
                <RangeInput label={`Hours reduced (${pctFmt(trainReduction)})`} value={trainReduction} onChange={setTrainReduction} max={1} />
                <CurrencyInput label="Cost / hour" value={trainCostHr} onChange={setTrainCostHr} currency={currency} />
                <CurrencyInput label="Travel/venue avoided" value={trainTravelAvoided} onChange={setTrainTravelAvoided} currency={currency} />
              </ModuleCard>
            )}

            {enabled.consolidation && (
              <ModuleCard
                title="Tool Consolidation (Analytics, Guides, NPS & Surveys, Feedback, Session Replay)"
                description="Retire overlapping tools and reduce admin time."
                value={consolidationSavings}
                currency={currency}
                info={<div><code>Consolidation savings = retired tool cost + (admin hours × $/hr)</code></div>}
              >
                <CurrencyInput label="Retired tool cost (annual)" value={consRetiredCost} onChange={setConsRetiredCost} currency={currency} />
                <NumInput label="Admin hours saved" value={consAdminHours} onChange={setConsAdminHours} />
                <CurrencyInput label="Admin cost / hour" value={consAdminCostHr} onChange={setConsAdminCostHr} currency={currency} />
              </ModuleCard>
            )}

            {enabled.appStore && (
              <ModuleCard
                title="App Store Rating & Review Lift (Pendo Mobile, Guides)"
                description="Higher ratings improve conversion and installs."
                value={appStoreRevenue}
                currency={currency}
                info={<div><code>Revenue = (CVR after - CVR before) × store traffic × ARPU/year</code></div>}
              >
                <NumInput label="Store traffic (visits)" value={appTraffic} onChange={setAppTraffic} />
                <RangeInput label={`CVR before (${(appCvrBefore * 100).toFixed(1)}%)`} value={appCvrBefore} onChange={setAppCvrBefore} max={1} />
                <RangeInput label={`CVR after (${(appCvrAfter * 100).toFixed(1)}%)`} value={appCvrAfter} onChange={setAppCvrAfter} max={1} />
                <CurrencyInput label="ARPU / user / year" value={appArpuYear} onChange={setAppArpuYear} currency={currency} />
              </ModuleCard>
            )}

            {enabled.churn && (
              <ModuleCard
                title="Churn Reduction from Detractor Workflows (NPS, Analytics)"
                description="Automated saves on detractors reduce attrition; marginized ARR retained."
                value={churnRetainedRevenue}
                currency={currency}
                info={<div><code>Revenue retained = (churn base - churn post) × accounts × ARPA/year × GM%</code></div>}
              >
                <NumInput label="Accounts exposed" value={crAccts} onChange={setCrAccts} />
                <RangeInput label={`Churn baseline (${pctFmt(crBase)})`} value={crBase} onChange={setCrBase} max={1} />
                <RangeInput label={`Churn post (${pctFmt(crPost)})`} value={crPost} onChange={setCrPost} max={1} />
                <CurrencyInput label="ARPA / year" value={crArpaYear} onChange={setCrArpaYear} currency={currency} />
                <RangeInput label={`Gross margin (${pctFmt(crGM)})`} value={crGM} onChange={setCrGM} max={1} />
              </ModuleCard>
            )}

            {enabled.release && (
              <ModuleCard
                title="Release Validation & Hotfix Avoidance (Analytics, Session Replay, Guides)"
                description="Pre/post checks and guides reduce hotfixes and bug time."
                value={releaseSavings}
                currency={currency}
                info={
                  <div>
                    <div><code>Hotfix savings = hotfixes avoided × cost/hotfix</code></div>
                    <div><code>Bug fix savings = bug hours saved × $/hr</code></div>
                  </div>
                }
              >
                <NumInput label="# hotfixes avoided" value={relHotfixesAvoided} onChange={setRelHotfixesAvoided} />
                <CurrencyInput label="Cost per hotfix" value={relCostPerHotfix} onChange={setRelCostPerHotfix} currency={currency} />
                <NumInput label="Bug hours saved" value={relBugHoursSaved} onChange={setRelBugHoursSaved} />
                <CurrencyInput label="Cost / hour" value={relCostHr} onChange={setRelCostHr} currency={currency} />
              </ModuleCard>
            )}

            {enabled.sunsetting && (
              <ModuleCard
                title="Feature Sunsetting & Maintenance Cost Reduction (Analytics, Feedback)"
                description="Retire low-use features to reduce tech debt and infra."
                value={sunsettingSavings}
                currency={currency}
                info={
                  <div>
                    <code>Sunsetting savings = (eng hours/sprint × sprints/yr × $/hr) + infra avoided</code>
                  </div>
                }
              >
                <NumInput label="Eng. hours / sprint on feature" value={sunEngHoursPerSprint} onChange={setSunEngHoursPerSprint} />
                <NumInput label="Sprints per year" value={sunSprintsPerYear} onChange={setSunSprintsPerYear} />
                <CurrencyInput label="Eng. cost / hour" value={sunCostHr} onChange={setSunCostHr} currency={currency} />
                <CurrencyInput label="Infra cost avoided" value={sunInfraAvoided} onChange={setSunInfraAvoided} currency={currency} />
              </ModuleCard>
            )}

            {enabled.compliance && (
              <ModuleCard
                title="Compliance & Risk Mitigation (Guides, Analytics)"
                description="Prevent risky actions and reduce incident probability."
                value={complianceSavings}
                currency={currency}
                info={<div><code>Expected savings = probability × impact × reduction%</code></div>}
              >
                <RangeInput label={`Incident probability (${pctFmt(compProb)})`} value={compProb} onChange={setCompProb} max={1} />
                <CurrencyInput label="Impact (annual)" value={compImpact} onChange={setCompImpact} currency={currency} />
                <RangeInput label={`Reduction from nudges (${pctFmt(compReduction)})`} value={compReduction} onChange={setCompReduction} max={1} />
              </ModuleCard>
            )}

            {enabled.licenseCompliance && (
              <ModuleCard
                title="Internal SaaS License Compliance (Analytics)"
                description="Right-size named seats based on usage analytics."
                value={licenseComplianceSavings}
                currency={currency}
                info={<div><code>Savings = max(0, inactive - buffer) × cost/seat</code></div>}
              >
                <NumInput label="Inactive >90d" value={lcInactive} onChange={setLcInactive} />
                <NumInput label="Safety buffer" value={lcBuffer} onChange={setLcBuffer} />
                <CurrencyInput label="Cost per seat" value={lcCostSeat} onChange={setLcCostSeat} currency={currency} />
              </ModuleCard>
            )}

            {enabled.commsCPM && (
              <ModuleCard
                title="Per-Email Comms Cost Avoidance (In-App Announcements)"
                description="Shift email blasts to in-app announcements."
                value={commsCpmSavings}
                currency={currency}
                info={<div><code>Savings = (emails avoided/1000 × CPM) + (hours avoided × $/hr)</code></div>}
              >
                <NumInput label="Emails avoided" value={cpmEmailsAvoided} onChange={setCpmEmailsAvoided} />
                <CurrencyInput label="CPM (per 1,000 emails)" value={cpmRate} onChange={setCpmRate} currency={currency} />
                <NumInput label="Hours avoided (creative/QA)" value={cpmHoursAvoided} onChange={setCpmHoursAvoided} />
                <CurrencyInput label="Cost / hour" value={cpmCostHr} onChange={setCpmCostHr} currency={currency} />
              </ModuleCard>
            )}

            {/* Always include cost of Pendo card */}
            <ModuleCard
              title="Cost of Pendo"
              description="Enter your annual investment to compute ROI & payback."
              value={-pendoAnnualCost}
              currency={currency}
              info={<div><code>Entered directly; subtracts from total benefits to get net value</code></div>}
            >
              <CurrencyInput label="Pendo annual cost" value={pendoAnnualCost} onChange={setPendoAnnualCost} currency={currency} />
            </ModuleCard>
          </div>
        )}

        {tab === "assumptions" && (
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
              <CurrencyInput label="PM salary (annual)" value={pmSalary} onChange={setPmSalary} currency={currency} />
              <NumInput label="Working days / yr" value={workDays} onChange={setWorkDays} />
              <NumInput label="Hours per day" step={0.25} value={hoursPerDay} onChange={setHoursPerDay} />
              <div>
                <div style={labelCss}>Cost per minute (derived or override)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                  <input style={inputCss} type="number" step="0.01" value={overrideMinCost ? costPerMinute : derivedCostPerMinute} onChange={(e) => setCostPerMinute(num(e.target.value, 0))} disabled={!overrideMinCost} />
                  <label style={{ ...hstack, fontSize: 12, color: "#475569" }}>
                    <input type="checkbox" checked={overrideMinCost} onChange={(e) => setOverrideMinCost(e.target.checked)} />
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
              />
            </div>

            <div style={{ marginTop: 12, fontSize: 13, color: "#475569" }}>
              Defaults mirror your examples and TEI-style benchmarks. Adjust anything to match reality.
            </div>
          </div>
        )}

        {tab === "summary" && (
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
              {leverListMeta
                .filter((l) => enabled[l.id])
                .map((l) => (
                  <BreakdownRow key={l.id} label={l.label} value={leverValues[l.id]} currency={currency} />
                ))}
              <div style={{ height: 1, background: "#e5e7eb", margin: "8px 0" }} />
              <BreakdownRow label="Total benefits" value={totalBenefits} strong currency={currency} />
              <BreakdownRow label="Pendo annual cost" value={-pendoAnnualCost} currency={currency} />
              <BreakdownRow label="Net value" value={netValue} strong currency={currency} />
            </div>

            <div style={box}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                ROI Snapshot
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14 }}>
                <Stat label="ROI" value={`${(roi * 100).toFixed(0)}%`} />
                <Stat label="Payback (months)" value={Number.isFinite(paybackMonths) ? paybackMonths.toFixed(1) : "–"} />
                <Stat label="Minutes / year (per FTE)" value={minutesPerYear.toLocaleString()} />
                <Stat label="Effective $/minute" value={currencyFmt(effectiveCostPerMinute, currency)} />
                <Stat label="Levers enabled" value={`${leverListMeta.filter((l) => enabled[l.id]).length}/${leverListMeta.length}`} />
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal (NEW) */}
        {showSettings && (
          <SettingsModal
            initialUrl={logoUrl}
            onSave={(url) => { setLogoUrl(url.trim()); setShowSettings(false); }}
            onClose={() => setShowSettings(false)}
          />
        )}

        <footer style={{ fontSize: 12, color: "#64748b", paddingTop: 16 }}>
          Built by Tom Day. Feedback Welcome! Save state persists locally in your browser.
        </footer>
      </div>
    </div>
  );
}

function ModuleCard({ title, description, value, children, currency, info }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ ...box, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}>
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
                width: 20, height: 20, lineHeight: "18px",
                fontSize: 12, background: "#fff", cursor: "pointer",
                color: "#0f172a", textAlign: "center", padding: 0
              }}
            >
              i
            </button>
          ) : null}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: value >= 0 ? "#047857" : "#be123c" }}>
          {value >= 0 ? "+" : ""}{currencyFmt(value, currency)}
        </div>
      </div>

      {open && info && (
        <div
          role="dialog"
          aria-label={`${title} calculation`}
          style={{
            position: "absolute", top: 36, right: 8, zIndex: 30, width: 340,
            background: "#111827", color: "#fff", borderRadius: 12, padding: 12,
            boxShadow: "0 6px 16px rgba(0,0,0,0.25)"
          }}
          onClick={() => setOpen(false)}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>How this is calculated</div>
          <div style={{ fontSize: 12, lineHeight: 1.5, color: "#e5e7eb" }}>{info}</div>
          <div style={{ fontSize: 11, marginTop: 8, color: "#cbd5e1" }}>
            (Click to dismiss)
          </div>
        </div>
      )}

      <p style={{ color: "#64748b", fontSize: 10, marginTop: 6, textAlign: "left" }}>{description}</p>
      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>{children}</div>
    </div>
  );
}

function BreakdownRow({ label, value, strong = false, currency = "GBP" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "6px 0" }}>
      <div style={{ color: "#475569", fontWeight: strong ? 600 : 400 }}>{label}</div>
      <div style={{ fontWeight: strong ? 700 : 500, color: value >= 0 ? "#0f172a" : "#be123c" }}>
        {currencyFmt(value, currency)}
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

// ---- Settings Modal (NEW) ----
function SettingsModal({ initialUrl, onSave, onClose }) {
  const [url, setUrl] = React.useState(initialUrl || "");
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "grid", placeItems: "center", zIndex: 50
    }}>
      <div style={{ ...box, width: 520, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Settings</div>
          <button onClick={onClose} style={{ ...inputCss, width: "auto", cursor: "pointer" }}>Close</button>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={labelCss}>Custom logo URL (appears left of Pendo logo)</div>
          <input
            type="url"
            placeholder="https://example.com/logo.png"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={inputCss}
          />
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
            Leave blank to hide the custom logo.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button onClick={() => onSave("")} style={{ ...inputCss, width: "auto", cursor: "pointer" }}>
            Remove Logo
          </button>
          <button onClick={() => onSave(url)} style={{ ...inputCss, width: "auto", cursor: "pointer" }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function NumInput({ label, value, onChange, step = 1 }) {
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

function CurrencyInput({ label, value, onChange, currency = "GBP", disabled = false }) {
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

function RangeInput({ label, value, onChange, step = 0.01, min = 0, max = 1 }) {
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

// ---- Lightweight console-only tests to guard formulas (non-blocking) ----
(function selfTest() {
  try {
    const close = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;
    // Analytics license optimization example from defaults
    console.assert(close(1000 * (50 * 12) * 0.1, 60000), "Analytics optimization calc");
    // Guides email deflection default
    console.assert(close(50000 * 2.6, 130000), "Guides deflection calc");
    // Feedback default
    console.assert(close(10000 * 15, 150000), "Feedback calc");
    // Surveys default
    console.assert(close(20000 * 5, 100000), "Surveys calc");
    // Replay default
    console.assert(close(5000 * 0.1 * 120, 60000), "Replay calc");
  } catch (e) {
    console.warn("Pendo calculator self-test warning:", e);
  }
})();
