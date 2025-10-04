import React, { useMemo, useState, useEffect } from "react";
import ExportMenu from "./ExportMenu";
import LeversSection, { LEVERS_META } from "./sections/LeversSection";
import AssumptionsSection from "./sections/AssumptionsSection";
import SummarySection from "./sections/SummarySection";
import CustomerStoriesSection from "./sections/CustomerStoriesSection";
import {
  savePreset, loadPreset, deletePreset,
  readAllPresets, exportPresets, importPresets
} from "./utils/presetsStorage";
import CustomerBar from "./components/CustomerBar";


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

const PENDO_PINK = "#ff3366";

const tabBtn = (active) => ({
  ...inputCss,
  width: "auto",
  padding: "8px 12px",
  background: active ? PENDO_PINK : "#fff",
  color: active ? "#fff" : "#111827",
  cursor: "pointer",
  border: `1px solid ${active ? PENDO_PINK : "#e5e7eb"}`,
});
// single pill look used everywhere in header
const PILL_HEIGHT = 40;
const pillLook = {
  borderRadius: 999,
  padding: "8px 14px",
  height: PILL_HEIGHT,
};

const pillBtn = (active, bg) => ({
  ...inputCss,
  ...pillLook,
  width: "auto",
  cursor: "pointer",
  background: active && bg ? bg : "#fff",
  borderColor: active ? "#94a3b8" : "#e5e7eb",
  color: "#0f172a",
});

function FilterPill({ label, active, badge, onClick }) {
  return (
    <button onClick={onClick} style={pillBtn(active)} title={label}>
      {label}
      {badge ? <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.75 }}>{badge}</span> : null}
    </button>
  );
}
// --- Helpers ---
const currencyFmt = (n, currency) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);


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

// PBO color map (shared with LeversSection via props)
export const PBO_COLORS = {
  "Increase Revenue": "#d4ecbd",
  "Cut Costs": "#ffc7aa",
  "Mitigate Risk": "#fee5a0",
};
const PBO_PILLS = ["All", "Increase Revenue", "Cut Costs", "Mitigate Risk"];
const COST_PINK = "#ff4775";

// Module & Use Case dropdown sources
const PENDO_MODULES = [
  "All Pendo Modules",
  "Analytics",
  "Guides",
  "Listen",
  "NPS & Surveys",
  "Session Replay",
  "Orchestrate",
  "Mobile",
];
// Pretty labels for modules (used only for display)
const MODULE_LABELS = {
  Analytics: "📊 Analytics",
  Guides: "🧭 Guides",
  Listen: "👂 Listen",
  "NPS & Surveys": "📝 NPS & Surveys",
  "Session Replay": "🎥 Session Replay",
  Orchestrate: "🎼 Orchestrate",
  Mobile: "📱 Mobile",
};


const USE_CASES = [
  // Revenue
  "Increase Product Adoption",
  "Optimize Product Revenue",
  "Drive Cross-Sell",
  "Increase Upsell Revenue",
  "Reduce Churn – Revenue",
  "Improve Team Productivity",
  "Accelerate AI Adoption",
  "Optimize Revenue Teams – IT",
  "Improve Feature Adoption – Mktg",
  "Drive Product-Led Growth – Mktg",
  "Improve Trial Conversion Rate",
  // Cost
  "Connect Eng Work to Business Outcomes",
  "Reduce Customer Support Costs",
  "Improve Roadmap Decisions – Cost",
  "Reduce Training Costs",
  "Reduce Customer Success Costs",
  "Optimize Revenue & Hiring Focus",
  "Improve Employee Productivity w/ AI",
  "Optimize Software Spend",
  "Reduce Support Costs – IT",
  "Reduce M&A Costs",
  "Reduce Engineering Costs – Mktg",
  "Lower CAC",
  // Risk
  "Minimize Churn",
  "Improve Roadmap Decisions – Risk",
  "Improve Product Experience",
  "Improve Employee Onboarding",
  "Understand Customer Sentiment",
  "Optimize Software Migration (M&A)",
  "Improve Application Migrations",
  "Ensure Compliance",
  "Improve Forecasting Accuracy",
  "Avoid Legal Issues",
  "Minimize Security Risk",
  "Optimize Major Systems Rollouts",
  "Identify Software Gaps",
  "Understand Internal Product Usage",
  "Improve Customer Satisfaction",
  "Optimize Messaging",
  "Increase App Retention",
];

// Problem taxonomy (editable)
const PROBLEMS = [
  "Low adoption",
  "Poor trial conversion",
  "Churn risk",
  "High support volume",
  "Slow incident resolution (MTTR)",
  "Inefficient onboarding/training",
  "Inefficient roadmap/R&D decisions",
  "Tool sprawl / high software spend",
  "Compliance / legal / security risk",
  "Revenue team productivity",
  "AI adoption lag",
  "Low NPS/CSAT",
];

// Problem ➜ Use Cases mapping (inclusive union)
const PROBLEM_TO_USE_CASES = {
  "Low adoption": ["Increase Product Adoption", "Improve Feature Adoption – Mktg", "Increase App Retention"],
  "Poor trial conversion": ["Improve Trial Conversion Rate", "Drive Product-Led Growth – Mktg"],
  "Churn risk": ["Minimize Churn", "Reduce Churn – Revenue", "Increase App Retention", "Improve Customer Satisfaction"],
  "High support volume": ["Reduce Customer Support Costs", "Reduce Support Costs – IT", "Reduce Customer Support Costs – Mktg", "Improve Product Experience"],
  "Slow incident resolution (MTTR)": ["Optimize Major Systems Rollouts", "Improve Product Experience", "Minimize Security Risk"],
  "Inefficient onboarding/training": ["Improve Employee Onboarding", "Reduce Training Costs", "Improve Application Migrations"],
  "Inefficient roadmap/R&D decisions": ["Connect Eng Work to Business Outcomes", "Improve Roadmap Decisions – Cost", "Improve Roadmap Decisions – Risk", "Identify Software Gaps"],
  "Tool sprawl / high software spend": ["Optimize Software Spend", "Reduce Engineering Costs – Mktg", "Identify Software Gaps"],
  "Compliance / legal / security risk": ["Ensure Compliance", "Avoid Legal Issues", "Minimize Security Risk", "Improve Forecasting Accuracy"],
  "Revenue team productivity": ["Optimize Revenue Teams – IT", "Improve Team Productivity", "Optimize Revenue & Hiring Focus"],
  "AI adoption lag": ["Accelerate AI Adoption", "Increase Product Adoption", "Improve Trial Conversion Rate"],
  "Low NPS/CSAT": ["Understand Customer Sentiment", "Improve Customer Satisfaction", "Optimize Messaging"],
};

export default function PendoValueCalculator({ isGuest = false }) {
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
  // Define your default lever state once
  const DEFAULT_ENABLED_LEVERS = {
    analytics: true,
    guides: false,
    listen: false,
    surveys: false,
    replay: false,
    onboarding: true,
    productEff: false,
    tickets: false,
    trialUplift: true,
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
    aiAdoption: false,
    aiProductivity: false,
    aiSupportDeflection: false,
    aiRiskMitigation: false,
  };

  // One place of truth for initial values (mirrors your useLocal defaults)
  const DEFAULTS = {
  // filters + misc
  currency: "GBP",
  pboFilter: "All",
  moduleFilter: "All Pendo Modules",
  useCaseFilters: [],
  problemFilters: [],
  logoUrl: "",

  // assumptions
  pmSalary: 100000,
  workDays: 261,
  hoursPerDay: 7.5,
  overrideMinCost: true,
  costPerMinute: 1.0,

  // analytics
  analyticsUsers: 1000,
  licenseCostPerUserMo: 50,
  licenseOptPct: 0.1,

  // guides
  emailsDeflected: 50000,
  emailCost: 2.6,

  // listen
  feedbackCount: 10000,
  feedbackUnitCost: 15,

  // surveys
  surveyCount: 20000,
  surveyUnitCost: 5,

  // replay
  totalReplays: 5000,
  replayUsefulPct: 0.1,
  replayUnitSaving: 120,

  // onboarding
  onUsers: 5000,
  onHoursBase: 6,
  onReduction: 0.5,
  onHrCost: Math.round(((true ? 1.0 : 100000 / (261 * 7.5 * 60)) * 60)),
  onRecap: 0.5,

  // product efficiency
  pteCount: 60,
  pteCost: 140000,
  ptePct: 0.05,

  // tickets
  tdBase: 20000,
  tdDeflect: 0.3,
  tdHrs: 0.75,
  tdCostHr: 30,
  tdRecap: 0.5,
  tdTimeReduction: 0.25,

  // PLG
  plgTrials: 5000,
  plgBaseConv: 0.2,
  plgUplift: 0.1,
  plgArpaMo: 120,
  plgGM: 0.85,

  // expansion
  expEligible: 20000,
  expPre: 0.1,
  expPost: 0.2,
  expPriceMo: 15,
  expGM: 0.85,

  // MTTR
  mttrTickets: 8000,
  mttrBeforeH: 2.25,
  mttrAfterH: 0.25,
  mttrCostHr: 40,
  mttrRecap: 0.5,
  incidents: 50,
  mttrBefore: 8,
  mttrAfter: 6,
  revPerHourAtRisk: 5000,

  // research
  resRecruits: 600,
  resPanelCost: 80,
  resHoursSaved: 200,
  resCostHr: 40,

  // training
  trainHoursFormal: 10000,
  trainReduction: 0.5,
  trainCostHr: 30,
  trainTravelAvoided: 0,

  // consolidation
  consRetiredCost: 100000,
  consAdminHours: 500,
  consAdminCostHr: 40,

  // app store
  appTraffic: 500000,
  appCvrBefore: 0.05,
  appCvrAfter: 0.055,
  appArpuYear: 20,

  // churn
  crAccts: 2000,
  crBase: 0.1,
  crPost: 0.08,
  crArpaYear: 3000,
  crGM: 0.85,

  // release
  relHotfixesAvoided: 20,
  relCostPerHotfix: 10000,
  relBugHoursSaved: 1000,
  relCostHr: 60,

  // sunsetting
  sunEngHoursPerSprint: 200,
  sunSprintsPerYear: 6,
  sunCostHr: 70,
  sunInfraAvoided: 20000,

  // compliance
  compProb: 0.02,
  compImpact: 500000,
  compReduction: 0.3,

  // license compliance
  lcInactive: 1000,
  lcBuffer: 100,
  lcCostSeat: 300,

  // comms CPM
  cpmEmailsAvoided: 100000,
  cpmRate: 26,
  cpmHoursAvoided: 0,
  cpmCostHr: 30,

  // AI adoption
  aiEligible: 20000,
  aiPre: 0.08,
  aiPost: 0.16,
  aiPriceMo: 20,
  aiGM: 0.85,

  // AI productivity
  aiRoles: 200,
  aiRoleCost: 90000,
  aiEffPct: 0.04,

  // AI support deflection
  aiBaseTickets: 30000,
  aiDeflect: 0.15,
  aiHrs: 0.75,
  aiCostHr: 30,
  aiRecap: 0.5,

  // AI risk mitigation
  aiProb: 0.02,
  aiImpact: 400000,
  aiReduction: 0.25,

  // cost of pendo
  pendoAnnualCost: 250000,
  };
  
  const resetAll = () => {
  // write all defaults back into state (no reload, no sign-out)
  const pairs = [
    // filters + logo
    [setCurrency, DEFAULTS.currency],
    [setPboFilter, DEFAULTS.pboFilter],
    [setModuleFilter, DEFAULTS.moduleFilter],
    [setUseCaseFilters, DEFAULTS.useCaseFilters],
    [setProblemFilters, DEFAULTS.problemFilters],
    [setLogoUrl, DEFAULTS.logoUrl],

    // toggles
    [setEnabled, DEFAULT_ENABLED_LEVERS],

    // assumptions
    [setPmSalary, DEFAULTS.pmSalary],
    [setWorkDays, DEFAULTS.workDays],
    [setHoursPerDay, DEFAULTS.hoursPerDay],
    [setOverrideMinCost, DEFAULTS.overrideMinCost],
    [setCostPerMinute, DEFAULTS.costPerMinute],

    // analytics
    [setAnalyticsUsers, DEFAULTS.analyticsUsers],
    [setLicenseCostPerUserMo, DEFAULTS.licenseCostPerUserMo],
    [setLicenseOptPct, DEFAULTS.licenseOptPct],

    // guides
    [setEmailsDeflected, DEFAULTS.emailsDeflected],
    [setEmailCost, DEFAULTS.emailCost],

    // listen
    [setFeedbackCount, DEFAULTS.feedbackCount],
    [setFeedbackUnitCost, DEFAULTS.feedbackUnitCost],

    // surveys
    [setSurveyCount, DEFAULTS.surveyCount],
    [setSurveyUnitCost, DEFAULTS.surveyUnitCost],

    // replay
    [setTotalReplays, DEFAULTS.totalReplays],
    [setReplayUsefulPct, DEFAULTS.replayUsefulPct],
    [setReplayUnitSaving, DEFAULTS.replayUnitSaving],

    // onboarding
    [setOnUsers, DEFAULTS.onUsers],
    [setOnHoursBase, DEFAULTS.onHoursBase],
    [setOnReduction, DEFAULTS.onReduction],
    [setOnHrCost, DEFAULTS.onHrCost],
    [setOnRecap, DEFAULTS.onRecap],

    // product efficiency
    [setPteCount, DEFAULTS.pteCount],
    [setPteCost, DEFAULTS.pteCost],
    [setPtePct, DEFAULTS.ptePct],

    // tickets
    [setTdBase, DEFAULTS.tdBase],
    [setTdDeflect, DEFAULTS.tdDeflect],
    [setTdHrs, DEFAULTS.tdHrs],
    [setTdCostHr, DEFAULTS.tdCostHr],
    [setTdRecap, DEFAULTS.tdRecap],
    [setTdTimeReduction, DEFAULTS.tdTimeReduction],

    // PLG
    [setPlgTrials, DEFAULTS.plgTrials],
    [setPlgBaseConv, DEFAULTS.plgBaseConv],
    [setPlgUplift, DEFAULTS.plgUplift],
    [setPlgArpaMo, DEFAULTS.plgArpaMo],
    [setPlgGM, DEFAULTS.plgGM],

    // expansion
    [setExpEligible, DEFAULTS.expEligible],
    [setExpPre, DEFAULTS.expPre],
    [setExpPost, DEFAULTS.expPost],
    [setExpPriceMo, DEFAULTS.expPriceMo],
    [setExpGM, DEFAULTS.expGM],

    // MTTR
    [setMttrTickets, DEFAULTS.mttrTickets],
    [setMttrBeforeH, DEFAULTS.mttrBeforeH],
    [setMttrAfterH, DEFAULTS.mttrAfterH],
    [setMttrCostHr, DEFAULTS.mttrCostHr],
    [setMttrRecap, DEFAULTS.mttrRecap],
    [setIncidents, DEFAULTS.incidents],
    [setMttrBefore, DEFAULTS.mttrBefore],
    [setMttrAfter, DEFAULTS.mttrAfter],
    [setRevPerHourAtRisk, DEFAULTS.revPerHourAtRisk],

    // research
    [setResRecruits, DEFAULTS.resRecruits],
    [setResPanelCost, DEFAULTS.resPanelCost],
    [setResHoursSaved, DEFAULTS.resHoursSaved],
    [setResCostHr, DEFAULTS.resCostHr],

    // training
    [setTrainHoursFormal, DEFAULTS.trainHoursFormal],
    [setTrainReduction, DEFAULTS.trainReduction],
    [setTrainCostHr, DEFAULTS.trainCostHr],
    [setTrainTravelAvoided, DEFAULTS.trainTravelAvoided],

    // consolidation
    [setConsRetiredCost, DEFAULTS.consRetiredCost],
    [setConsAdminHours, DEFAULTS.consAdminHours],
    [setConsAdminCostHr, DEFAULTS.consAdminCostHr],

    // app store
    [setAppTraffic, DEFAULTS.appTraffic],
    [setAppCvrBefore, DEFAULTS.appCvrBefore],
    [setAppCvrAfter, DEFAULTS.appCvrAfter],
    [setAppArpuYear, DEFAULTS.appArpuYear],

    // churn
    [setCrAccts, DEFAULTS.crAccts],
    [setCrBase, DEFAULTS.crBase],
    [setCrPost, DEFAULTS.crPost],
    [setCrArpaYear, DEFAULTS.crArpaYear],
    [setCrGM, DEFAULTS.crGM],

    // release
    [setRelHotfixesAvoided, DEFAULTS.relHotfixesAvoided],
    [setRelCostPerHotfix, DEFAULTS.relCostPerHotfix],
    [setRelBugHoursSaved, DEFAULTS.relBugHoursSaved],
    [setRelCostHr, DEFAULTS.relCostHr],

    // sunsetting
    [setSunEngHoursPerSprint, DEFAULTS.sunEngHoursPerSprint],
    [setSunSprintsPerYear, DEFAULTS.sunSprintsPerYear],
    [setSunCostHr, DEFAULTS.sunCostHr],
    [setSunInfraAvoided, DEFAULTS.sunInfraAvoided],

    // compliance
    [setCompProb, DEFAULTS.compProb],
    [setCompImpact, DEFAULTS.compImpact],
    [setCompReduction, DEFAULTS.compReduction],

    // license compliance
    [setLcInactive, DEFAULTS.lcInactive],
    [setLcBuffer, DEFAULTS.lcBuffer],
    [setLcCostSeat, DEFAULTS.lcCostSeat],

    // comms CPM
    [setCpmEmailsAvoided, DEFAULTS.cpmEmailsAvoided],
    [setCpmRate, DEFAULTS.cpmRate],
    [setCpmHoursAvoided, DEFAULTS.cpmHoursAvoided],
    [setCpmCostHr, DEFAULTS.cpmCostHr],

    // AI adoption
    [setAiEligible, DEFAULTS.aiEligible],
    [setAiPre, DEFAULTS.aiPre],
    [setAiPost, DEFAULTS.aiPost],
    [setAiPriceMo, DEFAULTS.aiPriceMo],
    [setAiGM, DEFAULTS.aiGM],

    // AI productivity
    [setAiRoles, DEFAULTS.aiRoles],
    [setAiRoleCost, DEFAULTS.aiRoleCost],
    [setAiEffPct, DEFAULTS.aiEffPct],

    // AI support deflection
    [setAiBaseTickets, DEFAULTS.aiBaseTickets],
    [setAiDeflect, DEFAULTS.aiDeflect],
    [setAiHrs, DEFAULTS.aiHrs],
    [setAiCostHr, DEFAULTS.aiCostHr],
    [setAiRecap, DEFAULTS.aiRecap],

    // AI risk mitigation
    [setAiProb, DEFAULTS.aiProb],
    [setAiImpact, DEFAULTS.aiImpact],
    [setAiReduction, DEFAULTS.aiReduction],

    // cost of pendo
    [setPendoAnnualCost, DEFAULTS.pendoAnnualCost],
  ];

  pairs.forEach(([setter, value]) => setter(value));

  Object.keys(localStorage)
     .filter((k) => k.startsWith("pendo.") && k !== "pendo.currentCustomerId")
     .forEach((k) => localStorage.removeItem(k));
  };

  const [enabled, setEnabled] = useLocal("pendo.enabledLevers", DEFAULT_ENABLED_LEVERS);
  const toggleLever = (k) => setEnabled({ ...enabled, [k]: !enabled[k] });
   const selectAll = React.useCallback(() => {
   const next = {};
   LEVERS_META.forEach((m) => { next[m.id] = true; });
   setEnabled(next);
 }, [setEnabled]);

 const selectNone = React.useCallback(() => {
   const next = {};
   LEVERS_META.forEach((m) => { next[m.id] = false; });
   setEnabled(next);
 }, [setEnabled]);

  const setEnabledByPbo = (pbo) => {
    if (pbo === "All") {
      selectAll();
      return;
    }
    const ids = new Set(LEVERS_META.filter(m => m.pbo === pbo).map(m => m.id));
    const next = Object.fromEntries(Object.keys(enabled).map(k => [k, ids.has(k)]));
    setEnabled(next);
  };

  // --- Existing lever states/calcs (unchanged from your app) ---
  const [licenseCostPerUserMo, setLicenseCostPerUserMo] = useLocal("pendo.licenseCostPerUserMo", 50);
  const [analyticsUsers, setAnalyticsUsers] = useLocal("pendo.analyticsUsers", 1000);
  const [licenseOptPct, setLicenseOptPct] = useLocal("pendo.licenseOptPct", 0.1);
  const licenseCostPerUserYr = licenseCostPerUserMo * 12;
  const analyticsSavings = analyticsUsers * licenseCostPerUserYr * licenseOptPct;

  const [emailCost, setEmailCost] = useLocal("pendo.emailCost", 2.6);
  const [emailsDeflected, setEmailsDeflected] = useLocal("pendo.emailsDeflected", 50000);
  const guidesSavings = emailsDeflected * emailCost;

  const [feedbackUnitCost, setFeedbackUnitCost] = useLocal("pendo.feedbackUnitCost", 15);
  const [feedbackCount, setFeedbackCount] = useLocal("pendo.feedbackCount", 10000);
  const feedbackSavings = feedbackCount * feedbackUnitCost;

  const [surveyUnitCost, setSurveyUnitCost] = useLocal("pendo.surveyUnitCost", 5);
  const [surveyCount, setSurveyCount] = useLocal("pendo.surveyCount", 20000);
  const surveySavings = surveyCount * surveyUnitCost;

  const [replayUnitSaving, setReplayUnitSaving] = useLocal("pendo.replayUnitSaving", 120);
  const [totalReplays, setTotalReplays] = useLocal("pendo.totalReplays", 5000);
  const [replayUsefulPct, setReplayUsefulPct] = useLocal("pendo.replayUsefulPct", 0.1);
  const replaySavings = totalReplays * replayUsefulPct * replayUnitSaving;

  // Onboarding
  const [onUsers, setOnUsers] = useLocal("pendo.on.users", 5000);
  const [onHoursBase, setOnHoursBase] = useLocal("pendo.on.hoursBase", 6);
  const [onReduction, setOnReduction] = useLocal("pendo.on.reduction", 0.5);
  const [onHrCost, setOnHrCost] = useLocal("pendo.on.hrCost", Math.round(hourlyFromMinute));
  const [onRecap, setOnRecap] = useLocal("pendo.on.recap", 0.5);
  const onboardingSavings = onUsers * onHoursBase * onReduction * onHrCost * onRecap;

  // Product team efficiency
  const [pteCount, setPteCount] = useLocal("pendo.pte.count", 60);
  const [pteCost, setPteCost] = useLocal("pendo.pte.cost", 140000);
  const [ptePct, setPtePct] = useLocal("pendo.pte.pct", 0.05);
  const productEffSavings = pteCount * pteCost * ptePct;

  // Ticket deflection
  const [tdBase, setTdBase] = useLocal("pendo.td.base", 20000);
  const [tdDeflect, setTdDeflect] = useLocal("pendo.td.deflect", 0.3);
  const [tdHrs, setTdHrs] = useLocal("pendo.td.hrs", 0.75);
  const [tdCostHr, setTdCostHr] = useLocal("pendo.td.costHr", 30);
  const [tdRecap, setTdRecap] = useLocal("pendo.td.recap", 0.5);
  const [tdTimeReduction, setTdTimeReduction] = useLocal("pendo.td.timeRed", 0.25);
  const tdAvoided = tdBase * tdDeflect;
  const tdRemain = tdBase - tdAvoided;
  const ticketDeflectSavings = tdAvoided * tdHrs * tdCostHr * tdRecap + tdRemain * tdHrs * tdTimeReduction * tdCostHr * tdRecap;

  // Trial uplift (revenue)
  const [plgTrials, setPlgTrials] = useLocal("pendo.plg.trials", 5000);
  const [plgBaseConv, setPlgBaseConv] = useLocal("pendo.plg.baseConv", 0.2);
  const [plgUplift, setPlgUplift] = useLocal("pendo.plg.uplift", 0.1);
  const [plgArpaMo, setPlgArpaMo] = useLocal("pendo.plg.arpaMo", 120);
  const [plgGM, setPlgGM] = useLocal("pendo.plg.gm", 0.85);
  const trialUpliftRevenue = plgTrials * plgBaseConv * plgUplift * plgArpaMo * 12 * plgGM;

  // Expansion revenue
  const [expEligible, setExpEligible] = useLocal("pendo.exp.eligible", 20000);
  const [expPre, setExpPre] = useLocal("pendo.exp.pre", 0.1);
  const [expPost, setExpPost] = useLocal("pendo.exp.post", 0.2);
  const [expPriceMo, setExpPriceMo] = useLocal("pendo.exp.priceMo", 15);
  const [expGM, setExpGM] = useLocal("pendo.exp.gm", 0.85);
  const expansionRevenue = expEligible * Math.max(0, expPost - expPre) * expPriceMo * 12 * expGM;

  // MTTR / incidents
  const [mttrTickets, setMttrTickets] = useLocal("pendo.mttr.tickets", 8000);
  const [mttrBeforeH, setMttrBeforeH] = useLocal("pendo.mttr.beforeH", 2.25);
  const [mttrAfterH, setMttrAfterH] = useLocal("pendo.mttr.afterH", 0.25);
  const [mttrCostHr, setMttrCostHr] = useLocal("pendo.mttr.costHr", 40);
  const [mttrRecap, setMttrRecap] = useLocal("pendo.mttr.recap", 0.5);
  const mttrOpsSavings = Math.max(0, mttrBeforeH - mttrAfterH) * mttrTickets * mttrCostHr * mttrRecap;
  const [incidents, setIncidents] = useLocal("pendo.mttr.incidents", 50);
  const [mttrBefore, setMttrBefore] = useLocal("pendo.mttr.before", 8);
  const [mttrAfter, setMttrAfter] = useLocal("pendo.mttr.after", 6);
  const [revPerHourAtRisk, setRevPerHourAtRisk] = useLocal("pendo.mttr.revPerHour", 5000);
  const mttrRevenueProtected = Math.max(0, mttrBefore - mttrAfter) * incidents * revPerHourAtRisk;
  const mttrTotalSavings = mttrOpsSavings + mttrRevenueProtected;

  // Research
  const [resRecruits, setResRecruits] = useLocal("pendo.res.recruits", 600);
  const [resPanelCost, setResPanelCost] = useLocal("pendo.res.panelCost", 80);
  const [resHoursSaved, setResHoursSaved] = useLocal("pendo.res.hoursSaved", 200);
  const [resCostHr, setResCostHr] = useLocal("pendo.res.costHr", 40);
  const researchSavings = resRecruits * resPanelCost + resHoursSaved * resCostHr;

  // Training
  const [trainHoursFormal, setTrainHoursFormal] = useLocal("pendo.train.hoursFormal", 10000);
  const [trainReduction, setTrainReduction] = useLocal("pendo.train.reduction", 0.5);
  const [trainCostHr, setTrainCostHr] = useLocal("pendo.train.costHr", 30);
  const [trainTravelAvoided, setTrainTravelAvoided] = useLocal("pendo.train.travel", 0);
  const trainingSavings = trainHoursFormal * trainReduction * trainCostHr + trainTravelAvoided;

  // Consolidation
  const [consRetiredCost, setConsRetiredCost] = useLocal("pendo.cons.retiredCost", 100000);
  const [consAdminHours, setConsAdminHours] = useLocal("pendo.cons.adminHours", 500);
  const [consAdminCostHr, setConsAdminCostHr] = useLocal("pendo.cons.adminCostHr", 40);
  const consolidationSavings = consRetiredCost + consAdminHours * consAdminCostHr;

  // App store
  const [appTraffic, setAppTraffic] = useLocal("pendo.app.traffic", 500000);
  const [appCvrBefore, setAppCvrBefore] = useLocal("pendo.app.cvrBefore", 0.05);
  const [appCvrAfter, setAppCvrAfter] = useLocal("pendo.app.cvrAfter", 0.055);
  const [appArpuYear, setAppArpuYear] = useLocal("pendo.app.arpuYear", 20);
  const appStoreRevenue = Math.max(0, appCvrAfter - appCvrBefore) * appTraffic * appArpuYear;

  // Churn retained revenue
  const [crAccts, setCrAccts] = useLocal("pendo.cr.accts", 2000);
  const [crBase, setCrBase] = useLocal("pendo.cr.base", 0.1);
  const [crPost, setCrPost] = useLocal("pendo.cr.post", 0.08);
  const [crArpaYear, setCrArpaYear] = useLocal("pendo.cr.arpaYear", 3000);
  const [crGM, setCrGM] = useLocal("pendo.cr.gm", 0.85);
  const churnRetainedRevenue = Math.max(0, crBase - crPost) * crAccts * crArpaYear * crGM;

  // Release validation
  const [relHotfixesAvoided, setRelHotfixesAvoided] = useLocal("pendo.rel.hotfixes", 20);
  const [relCostPerHotfix, setRelCostPerHotfix] = useLocal("pendo.rel.costHotfix", 10000);
  const [relBugHoursSaved, setRelBugHoursSaved] = useLocal("pendo.rel.bugHours", 1000);
  const [relCostHr, setRelCostHr] = useLocal("pendo.rel.costHr", 60);
  const releaseSavings = relHotfixesAvoided * relCostPerHotfix + relBugHoursSaved * relCostHr;

  // Sunsetting
  const [sunEngHoursPerSprint, setSunEngHoursPerSprint] = useLocal("pendo.sun.engHrsPerSprint", 200);
  const [sunSprintsPerYear, setSunSprintsPerYear] = useLocal("pendo.sun.sprints", 6);
  const [sunCostHr, setSunCostHr] = useLocal("pendo.sun.costHr", 70);
  const [sunInfraAvoided, setSunInfraAvoided] = useLocal("pendo.sun.infra", 20000);
  const sunsettingSavings = sunEngHoursPerSprint * sunSprintsPerYear * sunCostHr + sunInfraAvoided;

  // Compliance (expected value)
  const [compProb, setCompProb] = useLocal("pendo.comp.prob", 0.02);
  const [compImpact, setCompImpact] = useLocal("pendo.comp.impact", 500000);
  const [compReduction, setCompReduction] = useLocal("pendo.comp.reduction", 0.3);
  const complianceSavings = compProb * compImpact * compReduction;

  // License compliance
  const [lcInactive, setLcInactive] = useLocal("pendo.lc.inactive", 1000);
  const [lcBuffer, setLcBuffer] = useLocal("pendo.lc.buffer", 100);
  const [lcCostSeat, setLcCostSeat] = useLocal("pendo.lc.costSeat", 300);
  const lcSeatsReclaimed = Math.max(0, lcInactive - lcBuffer);
  const licenseComplianceSavings = lcSeatsReclaimed * lcCostSeat;

  // Comms CPM
  const [cpmEmailsAvoided, setCpmEmailsAvoided] = useLocal("pendo.cpm.emails", 100000);
  const [cpmRate, setCpmRate] = useLocal("pendo.cpm.rate", 26);
  const [cpmHoursAvoided, setCpmHoursAvoided] = useLocal("pendo.cpm.hours", 0);
  const [cpmCostHr, setCpmCostHr] = useLocal("pendo.cpm.costHr", 30);
  const commsCpmSavings = (cpmEmailsAvoided / 1000) * cpmRate + cpmHoursAvoided * cpmCostHr;

  // --- AI ADOPTION (revenue) ---
  const [aiEligible, setAiEligible] = useLocal("pendo.ai.eligible", 20000);
  const [aiPre, setAiPre]         = useLocal("pendo.ai.pre", 0.08);     // 8% current adoption
  const [aiPost, setAiPost]       = useLocal("pendo.ai.post", 0.16);    // 16% with Pendo
  const [aiPriceMo, setAiPriceMo] = useLocal("pendo.ai.priceMo", 20);   // £/$ per month per AI add-on
  const [aiGM, setAiGM]           = useLocal("pendo.ai.gm", 0.85);
  const aiAdoptionRevenue = aiEligible * Math.max(0, aiPost - aiPre) * aiPriceMo * 12 * aiGM;

  // --- AI PRODUCTIVITY (OpEx savings) ---
  const [aiRoles, setAiRoles]       = useLocal("pendo.ai.roles", 200);   // people impacted
  const [aiRoleCost, setAiRoleCost] = useLocal("pendo.ai.roleCost", 90000);
  const [aiEffPct, setAiEffPct]     = useLocal("pendo.ai.effPct", 0.04); // 4% productivity lift
  const aiProductivitySavings = aiRoles * aiRoleCost * aiEffPct;

  // --- AI SUPPORT DEFLECTION (ticket savings) ---
  const [aiBaseTickets, setAiBaseTickets] = useLocal("pendo.ai.baseTickets", 30000);
  const [aiDeflect, setAiDeflect]         = useLocal("pendo.ai.deflect", 0.15); // % deflected by AI
  const [aiHrs, setAiHrs]                 = useLocal("pendo.ai.hrs", 0.75);
  const [aiCostHr, setAiCostHr]           = useLocal("pendo.ai.costHr", 30);
  const [aiRecap, setAiRecap]             = useLocal("pendo.ai.recap", 0.5);
  const aiTicketsAvoided = aiBaseTickets * aiDeflect;
  const aiSupportDeflectionSavings = aiTicketsAvoided * aiHrs * aiCostHr * aiRecap;

  // --- AI RISK MITIGATION (expected value reduction) ---
  const [aiProb, setAiProb]           = useLocal("pendo.ai.prob", 0.02);     // annual probability
  const [aiImpact, setAiImpact]       = useLocal("pendo.ai.impact", 400000); // financial impact
  const [aiReduction, setAiReduction] = useLocal("pendo.ai.reduction", 0.25);
  const aiRiskMitigationSavings = aiProb * aiImpact * aiReduction;

  // --- Cost of Pendo ---
  const [pendoAnnualCost, setPendoAnnualCost] = useLocal("pendo.annualCost", 250000);

  // --- Carbon Footprint ---
  const carbonFootprintSaved = emailsDeflected * 0.2 / 1000;
  
  // === Derived totals ===
  const minutesPerYear = useMemo(
    () => workDays * hoursPerDay * 60,
    [workDays, hoursPerDay]
  );
  const derivedCostPerMinute = useMemo(
    () => pmSalary / minutesPerYear,
    [pmSalary, minutesPerYear]
  );
  const effectiveCostPerMinute = overrideMinCost ? costPerMinute : derivedCostPerMinute;

  const leverValues = {
    analytics: analyticsSavings,
    guides: guidesSavings,
    listen: feedbackSavings,
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
    aiAdoption: aiAdoptionRevenue,
    aiProductivity: aiProductivitySavings,
    aiSupportDeflection: aiSupportDeflectionSavings,
    aiRiskMitigation: aiRiskMitigationSavings,
  };

  const [tab, setTab] = useState("levers");
  const [showSelector, setShowSelector] = useState(false);

  // --- Header config ---
  const [logoUrl, setLogoUrl] = useLocal("pendo.logoUrl", "");
  const [showSettings, setShowSettings] = useState(false);

  // --- Filters (NEW) ---
  // single-select PBO pill
  const [pboFilter, setPboFilter] = useLocal("pendo.filter.pbo", "All");

  // module dropdown (keeps "All Pendo Modules")
  const [moduleFilter, setModuleFilter] = useLocal("pendo.filter.module", "All Pendo Modules");

  // multi-selects
  const [useCaseFilters, setUseCaseFilters] = useLocal("pendo.filter.usecases", []);   // string[]
  const [problemFilters, setProblemFilters] = useLocal("pendo.filter.problems", []);   // string[]

  const [showProblem, setShowProblem] = useState(false);
  const [showUseCases, setShowUseCases] = useState(false);
  
  // Build UseCase -> {levers, modules, pbo} from LEVERS_META
  const UC_TO_LEVERS = React.useMemo(() => {
    const map = {};
    LEVERS_META.forEach(l => {
      (l.useCases || []).forEach(uc => {
        if (!map[uc]) map[uc] = { levers: new Set(), modules: new Set(), pbo: new Set() };
        map[uc].levers.add(l.id);
        (l.modules || []).forEach(m => map[uc].modules.add(m));
        map[uc].pbo.add(l.pbo);
      });
    });
    return map;
  }, []);

  // Build a quick lookup for lever meta
  const META_BY_ID = React.useMemo(() => {
    const m = {};
    LEVERS_META.forEach(l => (m[l.id] = l));
    return m;
  }, []);

  const allowedUseCases = React.useMemo(() => {
    if (!problemFilters.length) return new Set(USE_CASES);
    const s = new Set();
    problemFilters.forEach(p => {
      (PROBLEM_TO_USE_CASES[p] || []).forEach(uc => s.add(uc));
    });
    return s;
  }, [problemFilters]);

  const activeUseCases = React.useMemo(() => {
    const base = allowedUseCases;
    if (!useCaseFilters.length) return base;
    const s = new Set();
    useCaseFilters.forEach(uc => { if (base.has(uc)) s.add(uc); });
    return s.size ? s : base;
  }, [allowedUseCases, useCaseFilters]);

  const allowedLevers = React.useMemo(() => {
    const s = new Set();
    activeUseCases.forEach(uc => {
      const m = UC_TO_LEVERS[uc];
      if (m) m.levers.forEach(id => s.add(id));
    });
    return (problemFilters.length || useCaseFilters.length) ? s : new Set(LEVERS_META.map(x => x.id));
  }, [activeUseCases, problemFilters.length, useCaseFilters.length, UC_TO_LEVERS]);

  const allowedModules = React.useMemo(() => {
    const s = new Set();
    activeUseCases.forEach(uc => {
      const m = UC_TO_LEVERS[uc];
      if (m) m.modules.forEach(id => s.add(id));
    });
    return s.size ? s : new Set(PENDO_MODULES.slice(1));
  }, [activeUseCases, UC_TO_LEVERS]);

  const allowedPbos = React.useMemo(() => {
    const s = new Set();
    activeUseCases.forEach(uc => {
      const m = UC_TO_LEVERS[uc];
      if (m) m.pbo.forEach(id => s.add(id));
    });
    return s.size ? s : new Set(["Increase Revenue", "Cut Costs", "Mitigate Risk"]);
  }, [activeUseCases, UC_TO_LEVERS]);

  // Helper to check if a lever is allowed by ALL current filters
  const leverPassesAllFilters = (id) => {
    const meta = META_BY_ID[id];
    if (!meta) return false;

    // Problem/Use-case mask
    if (!allowedLevers.has(id)) return false;

    // Module mask
    if (moduleFilter && moduleFilter !== "All Pendo Modules") {
      if (!(meta.modules || []).includes(moduleFilter)) return false;
    }

    // PBO mask
    if (pboFilter && pboFilter !== "All") {
      if (meta.pbo !== pboFilter) return false;
    }

    return true;
  };



  // Is this lever currently visible given filters?
  const isLeverVisible = React.useCallback((id) => {
  // 1) constrained by Problem/Use Case
  if (!allowedLevers.has(id)) return false;

  const meta = META_BY_ID[id] || {};

  // 2) Module filter (if not "All Pendo Modules")
  if (moduleFilter && moduleFilter !== "All Pendo Modules") {
    const mods = meta.modules || [];
    if (!mods.includes(moduleFilter)) return false;
  }

  // 3) PBO pill (if not "All")
  if (pboFilter && pboFilter !== "All") {
    if (meta.pbo !== pboFilter) return false;
  }

  return true;
  }, [allowedLevers, moduleFilter, pboFilter, META_BY_ID]);

    const activeLeverIds = Object.keys(leverValues)
  .filter((id) => enabled[id] && isLeverVisible(id));
  
  const visibleLeverIds = React.useMemo(
  () => LEVERS_META.map(m => m.id).filter(isLeverVisible),
  [isLeverVisible]
  );

  const filteredLeverValues = Object.fromEntries(
    activeLeverIds.map((id) => [id, leverValues[id]])
  );

  const totalBenefits = activeLeverIds.reduce((sum, id) => sum + leverValues[id], 0);

  const netValue = totalBenefits - pendoAnnualCost;
  const roi = pendoAnnualCost > 0 ? netValue / pendoAnnualCost : 0;
  const paybackMonths = totalBenefits > 0
    ? Math.max(0, (pendoAnnualCost / totalBenefits) * 12)
    : Infinity;



  // Build export snapshot for current tab
  const buildSnapshot = () => {
    const leverListMeta = []; // kept empty for export snapshot brevity; your ExportMenu uses DOM capture for visuals
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
        costPerMinute: effectiveCostPerMinute,
        effectiveHourly: Math.round(effectiveCostPerMinute * 60),
      },
      levers: enabledLevers,
    };
  };

  const switchToTab = async (id) => {
    if (tab !== id) setTab(id);
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );
    window.scrollTo({ top: 0, behavior: "instant" });
  };


// For dropdown inputs
const [presetName, setPresetName] = React.useState("");
const [allPresetNames, setAllPresetNames] = React.useState(Object.keys(readAllPresets()).sort());

const [currentCustomerId, setCurrentCustomerId] = React.useState(null);

// ---------- CAPTURE FULL MODEL ----------
const getModelState = React.useCallback(() => ({
  // currency + filters
  currency,
  pboFilter,
  moduleFilter,
  useCaseFilters,
  problemFilters,
  logoUrl,

  // lever toggles
  enabled,                // { [leverId]: boolean }

  // ---- analytics
  analyticsUsers, licenseCostPerUserMo, licenseOptPct,

  // guides
  emailsDeflected, emailCost,

  // feedback (Listen)
  feedbackCount, feedbackUnitCost,

  // surveys
  surveyCount, surveyUnitCost,

  // replay
  totalReplays, replayUsefulPct, replayUnitSaving,

  // onboarding
  onUsers, onHoursBase, onReduction, onHrCost, onRecap,

  // product team efficiency
  pteCount, pteCost, ptePct,

  // tickets
  tdBase, tdDeflect, tdHrs, tdCostHr, tdRecap, tdTimeReduction,

  // PLG
  plgTrials, plgBaseConv, plgUplift, plgArpaMo, plgGM,

  // expansion
  expEligible, expPre, expPost, expPriceMo, expGM,

  // mttr
  mttrTickets, mttrBeforeH, mttrAfterH, mttrCostHr, mttrRecap,
  incidents, mttrBefore, mttrAfter, revPerHourAtRisk,

  // research
  resRecruits, resPanelCost, resHoursSaved, resCostHr,

  // training
  trainHoursFormal, trainReduction, trainCostHr, trainTravelAvoided,

  // consolidation
  consRetiredCost, consAdminHours, consAdminCostHr,

  // app store
  appTraffic, appCvrBefore, appCvrAfter, appArpuYear,

  // churn
  crAccts, crBase, crPost, crArpaYear, crGM,

  // release
  relHotfixesAvoided, relCostPerHotfix, relBugHoursSaved, relCostHr,

  // sunsetting
  sunEngHoursPerSprint, sunSprintsPerYear, sunCostHr, sunInfraAvoided,

  // compliance
  compProb, compImpact, compReduction,

  // license compliance
  lcInactive, lcBuffer, lcCostSeat,

  // comms CPM
  cpmEmailsAvoided, cpmRate, cpmHoursAvoided, cpmCostHr,

  // AI adoption
  aiEligible, aiPre, aiPost, aiPriceMo, aiGM,

  // AI productivity
  aiRoles, aiRoleCost, aiEffPct,

  // AI support deflection
  aiBaseTickets, aiDeflect, aiHrs, aiCostHr, aiRecap,

  // AI risk mitigation
  aiProb, aiImpact, aiReduction,

  // cost of Pendo
  pendoAnnualCost,
}), [
  currency, pboFilter, moduleFilter, useCaseFilters, problemFilters, logoUrl, enabled,
  analyticsUsers, licenseCostPerUserMo, licenseOptPct,
  emailsDeflected, emailCost,
  feedbackCount, feedbackUnitCost,
  surveyCount, surveyUnitCost,
  totalReplays, replayUsefulPct, replayUnitSaving,
  onUsers, onHoursBase, onReduction, onHrCost, onRecap,
  pteCount, pteCost, ptePct,
  tdBase, tdDeflect, tdHrs, tdCostHr, tdRecap, tdTimeReduction,
  plgTrials, plgBaseConv, plgUplift, plgArpaMo, plgGM,
  expEligible, expPre, expPost, expPriceMo, expGM,
  mttrTickets, mttrBeforeH, mttrAfterH, mttrCostHr, mttrRecap,
  incidents, mttrBefore, mttrAfter, revPerHourAtRisk,
  resRecruits, resPanelCost, resHoursSaved, resCostHr,
  trainHoursFormal, trainReduction, trainCostHr, trainTravelAvoided,
  consRetiredCost, consAdminHours, consAdminCostHr,
  appTraffic, appCvrBefore, appCvrAfter, appArpuYear,
  crAccts, crBase, crPost, crArpaYear, crGM,
  relHotfixesAvoided, relCostPerHotfix, relBugHoursSaved, relCostHr,
  sunEngHoursPerSprint, sunSprintsPerYear, sunCostHr, sunInfraAvoided,
  compProb, compImpact, compReduction,
  lcInactive, lcBuffer, lcCostSeat,
  cpmEmailsAvoided, cpmRate, cpmHoursAvoided, cpmCostHr,
  aiEligible, aiPre, aiPost, aiPriceMo, aiGM,
  aiRoles, aiRoleCost, aiEffPct,
  aiBaseTickets, aiDeflect, aiHrs, aiCostHr, aiRecap,
  aiProb, aiImpact, aiReduction,
  pendoAnnualCost,
]);

// ---------- RESTORE FULL MODEL ----------
const setIf = (setter, v) => typeof setter === "function" && v !== undefined && setter(v);

function safe(obj, key, fallback) {
  return obj && Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : fallback;
}

const applyModelState = React.useCallback((s = {}) => {
  // filters
  setIf(setCurrency, safe(s, "currency", currency));
  setIf(setPboFilter, safe(s, "pboFilter", pboFilter));
  setIf(setModuleFilter, safe(s, "moduleFilter", moduleFilter));
  setIf(setUseCaseFilters, safe(s, "useCaseFilters", useCaseFilters));
  setIf(setProblemFilters, safe(s, "problemFilters", problemFilters));
  setIf(setLogoUrl, s.logoUrl);

  // lever toggles
  if (s.enabled) setEnabled(s.enabled);

  // analytics
  setIf(setAnalyticsUsers, s.analyticsUsers);
  setIf(setLicenseCostPerUserMo, s.licenseCostPerUserMo);
  setIf(setLicenseOptPct, s.licenseOptPct);

  // guides
  setIf(setEmailsDeflected, s.emailsDeflected);
  setIf(setEmailCost, s.emailCost);

  // listen
  setIf(setFeedbackCount, s.feedbackCount);
  setIf(setFeedbackUnitCost, s.feedbackUnitCost);

  // surveys
  setIf(setSurveyCount, s.surveyCount);
  setIf(setSurveyUnitCost, s.surveyUnitCost);

  // replay
  setIf(setTotalReplays, s.totalReplays);
  setIf(setReplayUsefulPct, s.replayUsefulPct);
  setIf(setReplayUnitSaving, s.replayUnitSaving);

  // onboarding
  setIf(setOnUsers, s.onUsers);
  setIf(setOnHoursBase, s.onHoursBase);
  setIf(setOnReduction, s.onReduction);
  setIf(setOnHrCost, s.onHrCost);
  setIf(setOnRecap, s.onRecap);

  // product efficiency
  setIf(setPteCount, s.pteCount);
  setIf(setPteCost, s.pteCost);
  setIf(setPtePct, s.ptePct);

  // tickets
  setIf(setTdBase, s.tdBase);
  setIf(setTdDeflect, s.tdDeflect);
  setIf(setTdHrs, s.tdHrs);
  setIf(setTdCostHr, s.tdCostHr);
  setIf(setTdRecap, s.tdRecap);
  setIf(setTdTimeReduction, s.tdTimeReduction);

  // plg
  setIf(setPlgTrials, s.plgTrials);
  setIf(setPlgBaseConv, s.plgBaseConv);
  setIf(setPlgUplift, s.plgUplift);
  setIf(setPlgArpaMo, s.plgArpaMo);
  setIf(setPlgGM, s.plgGM);

  // expansion
  setIf(setExpEligible, s.expEligible);
  setIf(setExpPre, s.expPre);
  setIf(setExpPost, s.expPost);
  setIf(setExpPriceMo, s.expPriceMo);
  setIf(setExpGM, s.expGM);

  // mttr
  setIf(setMttrTickets, s.mttrTickets);
  setIf(setMttrBeforeH, s.mttrBeforeH);
  setIf(setMttrAfterH, s.mttrAfterH);
  setIf(setMttrCostHr, s.mttrCostHr);
  setIf(setMttrRecap, s.mttrRecap);
  setIf(setIncidents, s.incidents);
  setIf(setMttrBefore, s.mttrBefore);
  setIf(setMttrAfter, s.mttrAfter);
  setIf(setRevPerHourAtRisk, s.revPerHourAtRisk);

  // research
  setIf(setResRecruits, s.resRecruits);
  setIf(setResPanelCost, s.resPanelCost);
  setIf(setResHoursSaved, s.resHoursSaved);
  setIf(setResCostHr, s.resCostHr);

  // training
  setIf(setTrainHoursFormal, s.trainHoursFormal);
  setIf(setTrainReduction, s.trainReduction);
  setIf(setTrainCostHr, s.trainCostHr);
  setIf(setTrainTravelAvoided, s.trainTravelAvoided);

  // consolidation
  setIf(setConsRetiredCost, s.consRetiredCost);
  setIf(setConsAdminHours, s.consAdminHours);
  setIf(setConsAdminCostHr, s.consAdminCostHr);

  // app store
  setIf(setAppTraffic, s.appTraffic);
  setIf(setAppCvrBefore, s.appCvrBefore);
  setIf(setAppCvrAfter, s.appCvrAfter);
  setIf(setAppArpuYear, s.appArpuYear);

  // churn
  setIf(setCrAccts, s.crAccts);
  setIf(setCrBase, s.crBase);
  setIf(setCrPost, s.crPost);
  setIf(setCrArpaYear, s.crArpaYear);
  setIf(setCrGM, s.crGM);

  // release
  setIf(setRelHotfixesAvoided, s.relHotfixesAvoided);
  setIf(setRelCostPerHotfix, s.relCostPerHotfix);
  setIf(setRelBugHoursSaved, s.relBugHoursSaved);
  setIf(setRelCostHr, s.relCostHr);

  // sunsetting
  setIf(setSunEngHoursPerSprint, s.sunEngHoursPerSprint);
  setIf(setSunSprintsPerYear, s.sunSprintsPerYear);
  setIf(setSunCostHr, s.sunCostHr);
  setIf(setSunInfraAvoided, s.sunInfraAvoided);

  // compliance
  setIf(setCompProb, s.compProb);
  setIf(setCompImpact, s.compImpact);
  setIf(setCompReduction, s.compReduction);

  // license compliance
  setIf(setLcInactive, s.lcInactive);
  setIf(setLcBuffer, s.lcBuffer);
  setIf(setLcCostSeat, s.lcCostSeat);

  // comms CPM
  setIf(setCpmEmailsAvoided, s.cpmEmailsAvoided);
  setIf(setCpmRate, s.cpmRate);
  setIf(setCpmHoursAvoided, s.cpmHoursAvoided);
  setIf(setCpmCostHr, s.cpmCostHr);

  // AI adoption
  setIf(setAiEligible, s.aiEligible);
  setIf(setAiPre, s.aiPre);
  setIf(setAiPost, s.aiPost);
  setIf(setAiPriceMo, s.aiPriceMo);
  setIf(setAiGM, s.aiGM);

  // AI productivity
  setIf(setAiRoles, s.aiRoles);
  setIf(setAiRoleCost, s.aiRoleCost);
  setIf(setAiEffPct, s.aiEffPct);

  // AI support deflection
  setIf(setAiBaseTickets, s.aiBaseTickets);
  setIf(setAiDeflect, s.aiDeflect);
  setIf(setAiHrs, s.aiHrs);
  setIf(setAiCostHr, s.aiCostHr);
  setIf(setAiRecap, s.aiRecap);

  // AI risk mitigation
  setIf(setAiProb, s.aiProb);
  setIf(setAiImpact, s.aiImpact);
  setIf(setAiReduction, s.aiReduction);

  // cost
  setIf(setPendoAnnualCost, s.pendoAnnualCost);
}, [
  currency, pboFilter, moduleFilter, useCaseFilters, problemFilters,
  // (no need to list setters in deps; React handles stable setters)
]);



function btn(variant) {
  const base = {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "8px 12px",
    background: "#fff",
    fontSize: 13,
    cursor: "pointer",
  };
  if (variant === "danger") {
    return { ...base, borderColor: "#fecaca", background: "#fff1f2" };
  }
  return base;
}

// --- Admin preset UI state ---
const [adminOpen, setAdminOpen] = React.useState(false);
const [adminAuthed, setAdminAuthed] = React.useState(false);

// optional: persist auth for this tab while page is open
React.useEffect(() => {
  const onKey = (e) => {
    const keyK = e.key?.toLowerCase() === "k";
    const combo = (e.metaKey || e.ctrlKey) && e.shiftKey && keyK; // Cmd/Ctrl + Shift + K
    if (!combo) return;

    e.preventDefault();

    // 1) Show password prompt if not already authed
    if (!adminAuthed) {
      const expected =
        window.__ADMIN_PASSWORD__ || process.env.REACT_APP_ADMIN_PASSWORD || "pendo123";
      const entered = window.prompt("Enter admin password");
      if (!entered) return;
      if (entered === expected) {
        setAdminAuthed(true);
        setAdminOpen(true); // open after first successful auth
        alert("Admin tools unlocked");
      } else {
        alert("Incorrect password");
      }
      return;
    }

    // 2) Already authed -> toggle visibility
    setAdminOpen((v) => !v);
  };

  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [adminAuthed]);

// savePreset(name, data)
function savePresetLocal(presetKey, data, payload) {
localStorage.setItem(`pendo_preset_${presetKey}`, JSON.stringify(data))};

function normalizePreset(p) {
  if (!p) return null;
  return {
    version: p.version || 1,
    inputs: p.inputs || p, // backward-compat if old saves stored only inputs
    leversEnabled: p.leversEnabled || {},
    filters: p.filters || {},
  };
}



return (
    <div style={page}>
      <div style={container}>
        <header
          id="app-header"
          style={{
            display: "grid",
            gridTemplateRows: "auto auto",
            rowGap: 8,
            marginBottom: 8,
          }}
>
  {/* Row 1: Logo + Title (single line) */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 0,
    }}
  >
    {logoUrl ? (
      <img
        src={logoUrl}
        alt="Customer logo"
        style={{ height: 100, width: 100, objectFit: "contain", flexShrink: 0 }}
      />
    ) : null}
    <img
    src="https://cdn.builder.io/api/v1/image/assets%2F6a96e08774184353b3aa88032e406411%2Fbd51e370ecda496498d96c17e3a31034?format=webp"
    alt="Pendo"
    style={{ height: 100, width: 100, objectFit: "contain", flexShrink: 0 }}
    />
    <h1
      style={{
        margin: 0,
        fontSize: 32,
        fontWeight: 700,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      Value & ROI Calculator
    </h1>
  </div>
  {/* Row 1: Customer presets */}
  {!isGuest && (
    <div style ={{ justifyContent: "flex-end", display: "flex", width: "100%" }}>
    <CustomerBar
      currentCustomerId={currentCustomerId}
      setCurrentCustomerId={setCurrentCustomerId}
      getModelState={getModelState}
      applyModelState={applyModelState}
    />
    </div>
  )}

  {isGuest && (
    <div style={{
      marginTop: 8,
      marginBottom: 8,
      padding: "8px 12px",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      background: "#fff7ed",
      color: "#7c2d12",
      fontSize: 12,
      display: "grid",
      alignContent: "center",
      justifyContent: "center",
    }}>
      You’re in guest mode — changes are saved only in this browser. Sign in to enable customer presets.
    </div>
  )}
  {/* Row 2: Tagline (left) + Filters/actions (right) */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      flexWrap: "nowrap",
    }}
  >
    {/* Left: tagline */}
    <p style={{ color: "#64748b", margin: 0 }}>
      Interactive model aligned to PBO levers:
    </p>

    {/* Right: controls */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
        flexWrap: "wrap",       // allows wrapping of controls if really narrow
        justifyContent: "flex-end",
      }}
    >
      

 {/* Problem pill  popover */}
 <div style={{ position: "relative" }}>
   <FilterPill
     label="Problem"
     active={showProblem || problemFilters.length > 0}
     badge={problemFilters.length ? `${problemFilters.length}` : undefined}
     onClick={() => {
       setShowProblem(v => !v);
       setShowUseCases(false);
     }}
   />
   {showProblem && (
     <div
       style={{
         position: "absolute",
         top: "calc(100% + 8px)",
         left: 0,
         zIndex: 60,
         background: "#fff",
         border: "1px solid #e5e7eb",
         borderRadius: 16,
         boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
       }}
       onKeyDown={(e) => e.key === "Escape" && setShowProblem(false)}
     >
       <MultiSelectSearch
         label="Problem"
         options={PROBLEMS}
         selected={problemFilters}
         onChange={(vals) => {
           setProblemFilters(vals);
         }}
         placeholder="Search problems…"
       />
     </div>
   )}
 </div>

 {/* Use Cases pill  popover (options constrained by Problem) */}
 <div style={{ position: "relative" }}>
   <FilterPill
     label="Use Cases"
     active={showUseCases || useCaseFilters.length > 0}
     badge={useCaseFilters.length ? `${useCaseFilters.length}` : undefined}
     onClick={() => {
       setShowUseCases(v => !v);
       setShowProblem(false);
     }}
   />
   {showUseCases && (
     <div
       style={{
         position: "absolute",
         top: "calc(100% + 8px)",
         left: 0,
         zIndex: 60,
         background: "#fff",
         border: "1px solid #e5e7eb",
         borderRadius: 16,
         boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
       }}
       onKeyDown={(e) => e.key === "Escape" && setShowUseCases(false)}
     >
       <MultiSelectSearch
         label="Use Cases"
         options={USE_CASES.filter(uc => allowedUseCases.has(uc))}
         selected={useCaseFilters}
         onChange={(vals) => {
           setUseCaseFilters(vals);
         }}
         placeholder="Search use cases…"
       />
     </div>
   )}
 </div>


      {/* PBO pills — constrained by Problem/Use Case (disable if not allowed) */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {PBO_PILLS.map((p) => {
          const enabledPbo =
            p === "All" ? true : allowedPbos.has(p);
          return (
            <button
              key={p}
              onClick={() => {
                if (!enabledPbo) return;
                setPboFilter(p);
                if (p === "All") {
                // Explicitly enable all levers; the masks will still control visibility & math
                selectAll();
                }
              }}
              title={p === "All" ? "Show all PBOs" : `Filter by ${p}`}
              style={{
                ...pillBtn(
                  pboFilter && pboFilter === p,
                  p === "All"
                    ? COST_PINK
                    : p === "Increase Revenue"
                    ? PBO_COLORS["Increase Revenue"]
                    : p === "Cut Costs"
                    ? PBO_COLORS["Cut Costs"]
                    : p === "Mitigate Risk"
                    ? PBO_COLORS["Mitigate Risk"]
                    : "#fff"
                ),
                opacity: enabledPbo ? 1 : 0.45,
                cursor: enabledPbo ? "pointer" : "not-allowed",
              }}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Choose levers toggle */}
      <button
        onClick={() => setShowSelector(!showSelector)}
        style={{ ...inputCss, ...pillLook, width: "auto", cursor: "pointer" }}
      >
        {showSelector ? "Hide Levers" : "Choose Levers"}
      </button>

      {/* Pendo Modules — constrained by Problem/Use Case */}
      <select
        value={moduleFilter}
        onChange={(e) => setModuleFilter(e.target.value)}
        aria-label="Filter by Pendo module"
        style={{ ...selectCss, width: 180 }}
        title="Filter by Pendo module"
      >
        {/* Always include the "All" option */}
        <option value="All Pendo Modules">All Pendo Modules</option>

        {/* Only include allowed canonical values, but show emoji labels */}
        {PENDO_MODULES.slice(1)
          .filter((m) => allowedModules.has(m))
          .map((m) => (
            <option key={m} value={m}>
              {MODULE_LABELS[m] || m}
            </option>
          ))}
      </select>



      {/* Currency */}
      <select
        style={{ ...selectCss, ...pillLook, width: 120 }}
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        aria-label="Currency"
      >
        <option>GBP</option>
        <option>USD</option>
        <option>EUR</option>
      </select>

      {/* Reset */}
      <button
        onClick={resetAll}
        style={{ ...inputCss, ...pillLook, width: 100, cursor: "pointer" }}
      >
        Reset
      </button>

      {/* Settings */}
      <button
        onClick={() => setShowSettings(true)}
        aria-label="Settings"
        title="Settings"
         style={{
          ...inputCss,
          ...pillLook,
          width: "auto",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
        }}
      >
        ⚙️
      </button>

      {/* Export */}
      <ExportMenu
        buildSnapshot={buildSnapshot}
        tab={tab}
        inputCss={inputCss}
        pillLook={pillLook}
        sectionSelectors={["#tab-levers", "#tab-assumptions", "#tab-breakdown"]}
        tabIds={["levers", "assumptions", "summary"]}
        switchToTab={switchToTab}
      />
    </div>
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
          {/* ROI & Payback */}
          <div style={box}>
            <div style={{ fontSize: 14, color: "#475569", marginBottom: 8 }}>
              ROI & Payback
            </div>
            <div style={summaryNum}>{(roi * 100).toFixed(0)}%</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Payback ≈{" "}
              {Number.isFinite(paybackMonths) ? paybackMonths.toFixed(1) : "–"} months
            </div>
          </div>
          {/* ✅ Carbon footprint (HSBC only) */}
          {currentCustomerId === "05184e3b-cea6-4241-9de6-365e9c317e0d" && (
            <div style={box}>
              <div style={{ fontSize: 14, color: "#475569", marginBottom: 8 }}>Carbon Footprint Saved</div>
              <div style={summaryNum}>{carbonFootprintSaved.toFixed(0).toLocaleString()} KG</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Based on email deflection × 0.2kg per email</div>
            </div>
          )}
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
            <LeversSection.MultiSelect enabled={enabled} toggleLever={toggleLever} visibleIds={new Set(visibleLeverIds)}/>
          </div>
        )}

        {/* Tabs */}
        <div style={{ ...hstack, marginTop: 16, flexWrap: "wrap" }}>
          {[
            { id: "levers", label: "💰 Value Levers" },
            { id: "assumptions", label: "🤔 Assumptions" },
            { id: "summary", label: "📑 Breakdown" },
            { id: "stories", label: "❤️ Customer Stories" },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={tabBtn(tab === t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "levers" && (
          <LeversSection
            enabled={enabled}
            setEnabled={setEnabled}
            currency={currency}
            setCurrency={setCurrency}
            // analytics
            analyticsSavings={analyticsSavings}
            analyticsUsers={analyticsUsers}
            setAnalyticsUsers={setAnalyticsUsers}
            licenseCostPerUserMo={licenseCostPerUserMo}
            setLicenseCostPerUserMo={setLicenseCostPerUserMo}
            licenseOptPct={licenseOptPct}
            setLicenseOptPct={setLicenseOptPct}
            // guides
            guidesSavings={guidesSavings}
            emailsDeflected={emailsDeflected}
            setEmailsDeflected={setEmailsDeflected}
            emailCost={emailCost}
            setEmailCost={setEmailCost}
            // feedback
            feedbackSavings={feedbackSavings}
            feedbackCount={feedbackCount}
            setFeedbackCount={setFeedbackCount}
            feedbackUnitCost={feedbackUnitCost}
            setFeedbackUnitCost={setFeedbackUnitCost}
            // surveys
            surveySavings={surveySavings}
            surveyCount={surveyCount}
            setSurveyCount={setSurveyCount}
            surveyUnitCost={surveyUnitCost}
            setSurveyUnitCost={setSurveyUnitCost}
            // replay
            replaySavings={replaySavings}
            totalReplays={totalReplays}
            setTotalReplays={setTotalReplays}
            replayUsefulPct={replayUsefulPct}
            setReplayUsefulPct={setReplayUsefulPct}
            replayUnitSaving={replayUnitSaving}
            setReplayUnitSaving={setReplayUnitSaving}
            // onboarding
            onboardingSavings={onboardingSavings}
            onUsers={onUsers}
            setOnUsers={setOnUsers}
            onHoursBase={onHoursBase}
            setOnHoursBase={setOnHoursBase}
            onReduction={onReduction}
            setOnReduction={setOnReduction}
            onHrCost={onHrCost}
            setOnHrCost={setOnHrCost}
            onRecap={onRecap}
            setOnRecap={setOnRecap}
            // product efficiency
            productEffSavings={productEffSavings}
            pteCount={pteCount}
            setPteCount={setPteCount}
            pteCost={pteCost}
            setPteCost={setPteCost}
            ptePct={ptePct}
            setPtePct={setPtePct}
            // tickets
            ticketDeflectSavings={ticketDeflectSavings}
            tdBase={tdBase}
            setTdBase={setTdBase}
            tdDeflect={tdDeflect}
            setTdDeflect={setTdDeflect}
            tdHrs={tdHrs}
            setTdHrs={setTdHrs}
            tdCostHr={tdCostHr}
            setTdCostHr={setTdCostHr}
            tdRecap={tdRecap}
            setTdRecap={setTdRecap}
            tdTimeReduction={tdTimeReduction}
            setTdTimeReduction={setTdTimeReduction}
            // PLG
            trialUpliftRevenue={trialUpliftRevenue}
            plgTrials={plgTrials}
            setPlgTrials={setPlgTrials}
            plgBaseConv={plgBaseConv}
            setPlgBaseConv={setPlgBaseConv}
            plgUplift={plgUplift}
            setPlgUplift={setPlgUplift}
            plgArpaMo={plgArpaMo}
            setPlgArpaMo={setPlgArpaMo}
            plgGM={plgGM}
            setPlgGM={setPlgGM}
            // expansion
            expansionRevenue={expansionRevenue}
            expEligible={expEligible}
            setExpEligible={setExpEligible}
            expPre={expPre}
            setExpPre={setExpPre}
            expPost={expPost}
            setExpPost={setExpPost}
            expPriceMo={expPriceMo}
            setExpPriceMo={setExpPriceMo}
            expGM={expGM}
            setExpGM={setExpGM}
            // mttr
            mttrTotalSavings={mttrTotalSavings}
            mttrTickets={mttrTickets}
            setMttrTickets={setMttrTickets}
            mttrBeforeH={mttrBeforeH}
            setMttrBeforeH={setMttrBeforeH}
            mttrAfterH={mttrAfterH}
            setMttrAfterH={setMttrAfterH}
            mttrCostHr={mttrCostHr}
            setMttrCostHr={setMttrCostHr}
            mttrRecap={mttrRecap}
            setMttrRecap={setMttrRecap}
            incidents={incidents}
            setIncidents={setIncidents}
            mttrBefore={mttrBefore}
            setMttrBefore={setMttrBefore}
            mttrAfter={mttrAfter}
            setMttrAfter={setMttrAfter}
            revPerHourAtRisk={revPerHourAtRisk}
            setRevPerHourAtRisk={setRevPerHourAtRisk}
            // research
            researchSavings={researchSavings}
            resRecruits={resRecruits}
            setResRecruits={setResRecruits}
            resPanelCost={resPanelCost}
            setResPanelCost={setResPanelCost}
            resHoursSaved={resHoursSaved}
            setResHoursSaved={setResHoursSaved}
            resCostHr={resCostHr}
            setResCostHr={setResCostHr}
            // training
            trainingSavings={trainingSavings}
            trainHoursFormal={trainHoursFormal}
            setTrainHoursFormal={setTrainHoursFormal}
            trainReduction={trainReduction}
            setTrainReduction={setTrainReduction}
            trainCostHr={trainCostHr}
            setTrainCostHr={setTrainCostHr}
            trainTravelAvoided={trainTravelAvoided}
            setTrainTravelAvoided={setTrainTravelAvoided}
            // consolidation
            consolidationSavings={consolidationSavings}
            consRetiredCost={consRetiredCost}
            setConsRetiredCost={setConsRetiredCost}
            consAdminHours={consAdminHours}
            setConsAdminHours={setConsAdminHours}
            consAdminCostHr={consAdminCostHr}
            setConsAdminCostHr={setConsAdminCostHr}
            // app store
            appStoreRevenue={appStoreRevenue}
            appTraffic={appTraffic}
            setAppTraffic={setAppTraffic}
            appCvrBefore={appCvrBefore}
            setAppCvrBefore={setAppCvrBefore}
            appCvrAfter={appCvrAfter}
            setAppCvrAfter={setAppCvrAfter}
            appArpuYear={appArpuYear}
            setAppArpuYear={setAppArpuYear}
            // churn
            churnRetainedRevenue={churnRetainedRevenue}
            crAccts={crAccts}
            setCrAccts={setCrAccts}
            crBase={crBase}
            setCrBase={setCrBase}
            crPost={crPost}
            setCrPost={setCrPost}
            crArpaYear={crArpaYear}
            setCrArpaYear={setCrArpaYear}
            crGM={crGM}
            setCrGM={setCrGM}
            // release
            releaseSavings={releaseSavings}
            relHotfixesAvoided={relHotfixesAvoided}
            setRelHotfixesAvoided={setRelHotfixesAvoided}
            relCostPerHotfix={relCostPerHotfix}
            setRelCostPerHotfix={setRelCostPerHotfix}
            relBugHoursSaved={relBugHoursSaved}
            setRelBugHoursSaved={setRelBugHoursSaved}
            relCostHr={relCostHr}
            setRelCostHr={setRelCostHr}
            // sunsetting
            sunsettingSavings={sunsettingSavings}
            sunEngHoursPerSprint={sunEngHoursPerSprint}
            setSunEngHoursPerSprint={setSunEngHoursPerSprint}
            sunSprintsPerYear={sunSprintsPerYear}
            setSunSprintsPerYear={setSunSprintsPerYear}
            sunCostHr={sunCostHr}
            setSunCostHr={setSunCostHr}
            sunInfraAvoided={sunInfraAvoided}
            setSunInfraAvoided={setSunInfraAvoided}
            // compliance
            complianceSavings={complianceSavings}
            compProb={compProb}
            setCompProb={setCompProb}
            compImpact={compImpact}
            setCompImpact={setCompImpact}
            compReduction={compReduction}
            setCompReduction={setCompReduction}
            // license compliance
            licenseComplianceSavings={licenseComplianceSavings}
            lcInactive={lcInactive}
            setLcInactive={setLcInactive}
            lcBuffer={lcBuffer}
            setLcBuffer={setLcBuffer}
            lcCostSeat={lcCostSeat}
            setLcCostSeat={setLcCostSeat}
            // comms CPM
            commsCpmSavings={commsCpmSavings}
            cpmEmailsAvoided={cpmEmailsAvoided}
            setCpmEmailsAvoided={setCpmEmailsAvoided}
            cpmRate={cpmRate}
            setCpmRate={setCpmRate}
            cpmHoursAvoided={cpmHoursAvoided}
            setCpmHoursAvoided={setCpmHoursAvoided}
            cpmCostHr={cpmCostHr}
            setCpmCostHr={setCpmCostHr}

            // --- AI ADOPTION
            aiAdoptionRevenue={aiAdoptionRevenue}
            aiEligible={aiEligible}           
            setAiEligible={setAiEligible}
            aiPre={aiPre}                     
            setAiPre={setAiPre}
            aiPost={aiPost}                   
            setAiPost={setAiPost}
            aiPriceMo={aiPriceMo}             
            setAiPriceMo={setAiPriceMo}
            aiGM={aiGM}                       
            setAiGM={setAiGM}

            // --- AI PRODUCTIVITY
            aiProductivitySavings={aiProductivitySavings}
            aiRoles={aiRoles}                 
            setAiRoles={setAiRoles}
            aiRoleCost={aiRoleCost}           
            setAiRoleCost={setAiRoleCost}
            aiEffPct={aiEffPct}               
            setAiEffPct={setAiEffPct}

            // --- AI SUPPORT DEFLECTION
            aiSupportDeflectionSavings={aiSupportDeflectionSavings}
            aiBaseTickets={aiBaseTickets}     
            setAiBaseTickets={setAiBaseTickets}
            aiDeflect={aiDeflect}             
            setAiDeflect={setAiDeflect}
            aiHrs={aiHrs}                     
            setAiHrs={setAiHrs}
            aiCostHr={aiCostHr}               
            setAiCostHr={setAiCostHr}
            aiRecap={aiRecap}                 
            setAiRecap={setAiRecap}

            // --- AI RISK MITIGATION
            aiRiskMitigationSavings={aiRiskMitigationSavings}
            aiProb={aiProb}                   
            setAiProb={setAiProb}
            aiImpact={aiImpact}               
            setAiImpact={setAiImpact}
            aiReduction={aiReduction}         
            setAiReduction={setAiReduction}

            // cost of pendo
            pendoAnnualCost={pendoAnnualCost}
            setPendoAnnualCost={setPendoAnnualCost}
            // NEW filters + colors
            
            pboFilter={pboFilter}
            moduleFilter={moduleFilter}
            useCaseFilters={useCaseFilters}
            problemFilters={problemFilters}
            allowedLevers={allowedLevers}
            pboColors={PBO_COLORS}
            

          />
        )}

        {tab === "assumptions" && (
          <AssumptionsSection
            currency={currency}
            pmSalary={pmSalary}
            setPmSalary={setPmSalary}
            workDays={workDays}
            setWorkDays={setWorkDays}
            hoursPerDay={hoursPerDay}
            setHoursPerDay={setHoursPerDay}
            overrideMinCost={overrideMinCost}
            setOverrideMinCost={setOverrideMinCost}
            costPerMinute={costPerMinute}
            setCostPerMinute={setCostPerMinute}
            derivedCostPerMinute={derivedCostPerMinute}
            effectiveCostPerMinute={effectiveCostPerMinute}
            inputCss={inputCss}
            labelCss={labelCss}
            hstack={hstack}
            box={box}
            currencyFmt={currencyFmt}
          />
        )}

        {tab === "summary" && (
          <SummarySection
            currency={currency}
            leverValues={filteredLeverValues}
            enabled={enabled}
            totalBenefits={totalBenefits}
            pendoAnnualCost={pendoAnnualCost}
            netValue={netValue}
            roi={roi}
            paybackMonths={paybackMonths}
            minutesPerYear={minutesPerYear}
            effectiveCostPerMinute={effectiveCostPerMinute}
            box={box}
            summaryNum={summaryNum}
            currencyFmt={currencyFmt}
          />
        )}
        
        {tab === "stories" && (
          <CustomerStoriesSection />
        )}

        {/* Settings Modal */}
        {showSettings && (
          <SettingsModal
            initialUrl={logoUrl}
            onSave={(url) => {
              setLogoUrl(url.trim());
              setShowSettings(false);
            }}
            onClose={() => setShowSettings(false)}
          />
        )}

        <footer style={{ fontSize: 12, color: "#64748b", paddingTop: 16, display: "grid", alignContent: "center", justifyItems: "center" }}>
          Unofficial ROI tool, built by Tom Day. Feedback Welcome! Save state persists locally in your browser.
        </footer>
      </div>
    </div>
  );
}

function MultiSelectSearch({ label, options, selected, onChange, placeholder = "Search..." }) {
  const [q, setQ] = React.useState("");
  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    return !qq ? options : options.filter(o => o.toLowerCase().includes(qq));
  }, [options, q]);

  const toggle = (val) => {
    const set = new Set(selected);
    if (set.has(val)) set.delete(val);
    else set.add(val);
    onChange(Array.from(set));
  };

  const clearAll = () => onChange([]);

  return (
    <div style={{ ...inputCss, width: "auto", padding: 8 }}>
      <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>{label}</div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputCss, width: 260 }}
      />
      <div style={{ maxHeight: 400, overflow: "auto", marginTop: 6, border: "1px solid #e5e7eb", borderRadius: 12, padding: 8, background: "#fff", width: 300 }}>
        {filtered.map((opt) => {
          const isChecked = selected.includes(opt);
          return (
            <label key={opt} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "4px 0" }}>
              <input type="checkbox" checked={isChecked} onChange={() => toggle(opt)} />
              <span>{opt}</span>
            </label>
          );
        })}
        {!filtered.length && <div style={{ fontSize: 12, color: "#94a3b8" }}>No matches</div>}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        <button onClick={clearAll} style={{ ...inputCss, width: "auto", cursor: "pointer" }}>Clear</button>
        <div style={{ fontSize: 12, color: "#64748b", alignSelf: "center" }}>
          {selected.length ? `${selected.length} selected` : "All"}
        </div>
      </div>
    </div>
  );
}

// ---- Settings Modal ----
function SettingsModal({ initialUrl, onSave, onClose }) {
  const [url, setUrl] = React.useState(initialUrl || "");

  // Close on ESC
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      // Click backdrop to close
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        // Prevent clicks inside the modal from closing it
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 20,
          background: "#fff",
          width: 520,
          boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Settings</div>
          <button onClick={onClose} style={{ ...inputCss, width: "auto", cursor: "pointer" }}>
            Close
          </button>
        </div>

        {/* Input */}
        <div style={{ marginTop: 12 }}>
          <div style={labelCss}>Custom logo URL (appears left of Pendo logo)</div>
          <input
            type="url"
            placeholder="https://example.com/logo.png"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={inputCss}
          />
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
            Leave blank to hide the custom logo.
          </div>
        </div>

        {/* Footer buttons */}
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
