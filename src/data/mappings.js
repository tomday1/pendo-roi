// --- PBO constants & colors ---
export const PBO = {
  INCREASE: "increase",   // Increase Revenue
  COST: "cost",           // Cut Costs
  RISK: "risk",           // Mitigate Risk (aka Reduce Risk)
};

export const PBO_LABEL = {
  [PBO.INCREASE]: "Increase Revenue",
  [PBO.COST]: "Cut Costs",
  [PBO.RISK]: "Mitigate Risk",
};

// Card background colours by PBO
export const PBO_COLORS = {
  [PBO.INCREASE]: "#d4ecbd",
  [PBO.COST]: "#ffc7aa",
  [PBO.RISK]: "#fee5a0",
};

// --- Use cases (normalized to ids/slugs) ---
export const USE_CASES = [
  { id: "increase-product-adoption", label: "Increase Product Adoption", pbo: PBO.INCREASE },
  { id: "optimize-product-revenue", label: "Optimize Product Revenue", pbo: PBO.INCREASE },
  { id: "drive-cross-sell", label: "Drive Cross-Sell", pbo: PBO.INCREASE },
  { id: "connect-eng-work-business-outcomes", label: "Connect Eng Work to Business Outcomes", pbo: PBO.COST },
  { id: "reduce-customer-support-costs", label: "Reduce Customer Support Costs", pbo: PBO.COST },
  { id: "improve-roadmap-decisions-cost", label: "Improve Roadmap Decisions – Cost", pbo: PBO.COST },
  { id: "minimize-churn", label: "Minimize Churn", pbo: PBO.RISK },
  { id: "improve-roadmap-decisions-risk", label: "Improve Roadmap Decisions – Risk", pbo: PBO.RISK },
  { id: "improve-product-experience", label: "Improve Product Experience", pbo: PBO.RISK },
  { id: "improve-employee-onboarding", label: "Improve Employee Onboarding", pbo: PBO.RISK },
  { id: "understand-customer-sentiment", label: "Understand Customer Sentiment", pbo: PBO.RISK },
  { id: "optimize-software-migration-ma", label: "Optimize Software Migration (M&A)", pbo: PBO.RISK },
  { id: "improve-application-migrations", label: "Improve Application Migrations", pbo: PBO.RISK },
  { id: "increase-upsell-revenue", label: "Increase Upsell Revenue", pbo: PBO.INCREASE },
  { id: "reduce-churn-revenue", label: "Reduce Churn – Revenue", pbo: PBO.INCREASE },
  { id: "improve-team-productivity", label: "Improve Team Productivity", pbo: PBO.INCREASE },
  { id: "reduce-training-costs", label: "Reduce Training Costs", pbo: PBO.COST },
  { id: "reduce-customer-success-costs", label: "Reduce Customer Success Costs", pbo: PBO.COST },
  { id: "optimize-revenue-hiring-focus", label: "Optimize Revenue & Hiring Focus", pbo: PBO.COST },
  { id: "ensure-compliance", label: "Ensure Compliance", pbo: PBO.RISK },
  { id: "improve-forecasting-accuracy", label: "Improve Forecasting Accuracy", pbo: PBO.RISK },
  { id: "avoid-legal-issues", label: "Avoid Legal Issues", pbo: PBO.RISK },
  { id: "accelerate-ai-adoption", label: "Accelerate AI Adoption", pbo: PBO.INCREASE },
  { id: "optimize-revenue-teams-it", label: "Optimize Revenue Teams – IT", pbo: PBO.INCREASE },
  { id: "improve-employee-productivity-ai", label: "Improve Employee Productivity w/ AI", pbo: PBO.COST },
  { id: "optimize-software-spend", label: "Optimize Software Spend", pbo: PBO.COST },
  { id: "reduce-support-costs-it", label: "Reduce Support Costs – IT", pbo: PBO.COST },
  { id: "reduce-ma-costs", label: "Reduce M&A Costs", pbo: PBO.COST },
  { id: "minimize-security-risk", label: "Minimize Security Risk", pbo: PBO.RISK },
  { id: "optimize-major-systems-rollouts", label: "Optimize Major Systems Rollouts", pbo: PBO.RISK },
  { id: "identify-software-gaps", label: "Identify Software Gaps", pbo: PBO.RISK },
  { id: "understand-internal-product-usage", label: "Understand Internal Product Usage", pbo: PBO.RISK },
  { id: "improve-feature-adoption-mktg", label: "Improve Feature Adoption – Mktg", pbo: PBO.INCREASE },
  { id: "drive-plg-mktg", label: "Drive Product-Led Growth – Mktg", pbo: PBO.INCREASE },
  { id: "improve-trial-conversion-rate", label: "Improve Trial Conversion Rate", pbo: PBO.INCREASE },
  { id: "reduce-engineering-costs-mktg", label: "Reduce Engineering Costs – Mktg", pbo: PBO.COST },
  { id: "lower-cac", label: "Lower CAC", pbo: PBO.COST },
  { id: "reduce-support-costs-mktg", label: "Reduce Customer Support Costs – Mktg", pbo: PBO.COST },
  { id: "improve-customer-satisfaction", label: "Improve Customer Satisfaction", pbo: PBO.RISK },
  { id: "optimize-messaging", label: "Optimize Messaging", pbo: PBO.RISK },
  { id: "increase-app-retention", label: "Increase App Retention", pbo: PBO.RISK },
];

// --- Pendo modules list (used by filters) ---
export const ALL_MODULES = [
  "Analytics",
  "Guides",
  "Listen",
  "NPS & Surveys",
  "Session Replay",
  "Orchestrate",
  "Mobile",
];

// --- Lever metadata: main PBO, modules, and mapped use-cases ---
export const LEVER_ORDER = [
  "analytics",
  "guides",
  "listen",
  "surveys",
  "replay",
  "onboarding",
  "productEff",
  "tickets",
  "trialUplift",
  "expansion",
  "mttr",
  "research",
  "training",
  "consolidation",
  "appStore",
  "churn",
  "release",
  "sunsetting",
  "compliance",
  "licenseCompliance",
  "commsCPM",
];

export const LEVER_MAP = {
  analytics: {
    label: "License Optimization (Analytics)",
    pbo: PBO.COST,
    modules: ["Analytics"],
    useCases: ["optimize-software-spend", "optimize-revenue-hiring-focus"],
  },
  guides: {
    label: "Email Deflection (Guides)",
    pbo: PBO.COST,
    modules: ["Guides"],
    useCases: [
      "reduce-customer-support-costs",
      "reduce-support-costs-it",
      "reduce-support-costs-mktg",
      "lower-cac",
    ],
  },
  listen: {
    label: "Capture at Scale (Feedback)",
    pbo: PBO.COST,
    modules: ["Listen"],
    useCases: ["improve-roadmap-decisions-cost", "optimize-revenue-hiring-focus"],
  },
  surveys: {
    label: "Automate Collection (NPS & Surveys)",
    pbo: PBO.RISK,
    modules: ["NPS & Surveys"],
    useCases: [
      "understand-customer-sentiment",
      "improve-roadmap-decisions-risk",
      "improve-customer-satisfaction",
    ],
  },
  replay: {
    label: "Faster Triage (Session Replay)",
    pbo: PBO.COST,
    modules: ["Session Replay"],
    useCases: [
      "reduce-support-costs-it",
      "reduce-engineering-costs-mktg",
      "improve-product-experience",
    ],
  },
  onboarding: {
    label: "Onboarding Acceleration (Guides, Analytics)",
    pbo: PBO.RISK,
    modules: ["Guides", "Analytics"],
    useCases: ["improve-employee-onboarding", "optimize-major-systems-rollouts"],
  },
  productEff: {
    label: "Product Team Efficiency (Analytics)",
    pbo: PBO.COST,
    modules: ["Analytics"],
    useCases: [
      "improve-employee-productivity-ai",
      "improve-roadmap-decisions-cost",
      "optimize-revenue-hiring-focus",
    ],
  },
  tickets: {
    label: "Ticket Deflection (Guides, Session Replay)",
    pbo: PBO.COST,
    modules: ["Guides", "Session Replay"],
    useCases: [
      "reduce-customer-support-costs",
      "reduce-support-costs-it",
      "reduce-support-costs-mktg",
    ],
  },
  trialUplift: {
    label: "Trial→Paid / Upsell Uplift (Guides, Analytics)",
    pbo: PBO.INCREASE,
    modules: ["Guides", "Analytics"],
    useCases: [
      "improve-trial-conversion-rate",
      "increase-upsell-revenue",
      "drive-plg-mktg",
    ],
  },
  expansion: {
    label: "Expansion via Feature Adoption (Guides, Analytics)",
    pbo: PBO.INCREASE,
    modules: ["Guides", "Analytics"],
    useCases: [
      "increase-product-adoption",
      "improve-feature-adoption-mktg",
      "drive-cross-sell",
    ],
  },
  mttr: {
    label: "MTTR & Time-to-Reproduce Reduction (Session Replay, Analytics, Jira)",
    pbo: PBO.COST,
    modules: ["Session Replay", "Analytics"],
    useCases: [
      "reduce-engineering-costs-mktg",
      "reduce-support-costs-it",
      "improve-product-experience",
    ],
  },
  research: {
    label:
      "Research/Recruitment Cost Avoidance (Guides, Surveys, Feedback)",
    pbo: PBO.COST,
    modules: ["Guides", "NPS & Surveys", "Feedback"],
    useCases: [
      "improve-roadmap-decisions-cost",
      "understand-internal-product-usage",
    ],
  },
  training: {
    label: "Training Content Shift (Guides)",
    pbo: PBO.COST,
    modules: ["Guides"],
    useCases: ["reduce-training-costs", "improve-employee-onboarding"],
  },
  consolidation: {
    label:
      "Tool Consolidation (Analytics, Guides, NPS & Surveys, Feedback, Session Replay)",
    pbo: PBO.COST,
    modules: [
      "Analytics",
      "Guides",
      "NPS & Surveys",
      "Feedback",
      "Session Replay",
    ],
    useCases: ["optimize-software-spend", "reduce-ma-costs"],
  },
  appStore: {
    label: "App Store Rating & Review Lift (Pendo Mobile, Guides)",
    pbo: PBO.INCREASE,
    modules: ["Mobile", "Guides"],
    useCases: ["improve-trial-conversion-rate", "increase-product-adoption"],
  },
  churn: {
    label: "Churn Reduction from Detractor Workflows (NPS, Analytics)",
    pbo: PBO.INCREASE,
    modules: ["NPS & Surveys", "Analytics"],
    useCases: [
      "reduce-churn-revenue",
      "minimize-churn",
      "increase-app-retention",
    ],
  },
  release: {
    label:
      "Release Validation & Hotfix Avoidance (Analytics, Session Replay, Guides)",
    pbo: PBO.RISK,
    modules: ["Analytics", "Session Replay", "Guides"],
    useCases: [
      "optimize-major-systems-rollouts",
      "improve-product-experience",
    ],
  },
  sunsetting: {
    label:
      "Feature Sunsetting & Maintenance Cost Reduction (Analytics, Feedback)",
    pbo: PBO.COST,
    modules: ["Analytics", "Feedback"],
    useCases: [
      "connect-eng-work-business-outcomes",
      "improve-roadmap-decisions-cost",
    ],
  },
  compliance: {
    label: "Compliance & Risk Mitigation (Guides, Analytics)",
    pbo: PBO.RISK,
    modules: ["Guides", "Analytics"],
    useCases: [
      "ensure-compliance",
      "avoid-legal-issues",
      "minimize-security-risk",
    ],
  },
  licenseCompliance: {
    label: "Internal SaaS License Compliance (Analytics)",
    pbo: PBO.COST,
    modules: ["Analytics"],
    useCases: ["optimize-software-spend"],
  },
  commsCPM: {
    label: "Per-Email Comms Cost Avoidance (Guides, Orchestrate)",
    pbo: PBO.COST,
    modules: ["Guides", "Orchestrate"],
    useCases: ["lower-cac", "reduce-support-costs-mktg"],
  },
};

// Array form for selector UIs
export const LEVER_LIST = LEVER_ORDER.map((id) => ({
  id,
  label: LEVER_MAP[id].label,
}));

// Helpers for filters
export const USE_CASE_OPTIONS = USE_CASES.map(({ id, label }) => ({ id, label }));
export const PBO_OPTIONS = Object.values(PBO).map((id) => ({
  id,
  label: PBO_LABEL[id],
  color: PBO_COLORS[id],
}));

export function leverPassesFilters(leverId, { pbo = [], useCases = [], modules = [] }) {
  const meta = LEVER_MAP[leverId];
  if (!meta) return true;
  if (pbo.length && !pbo.includes(meta.pbo)) return false;
  if (useCases.length && !meta.useCases.some((u) => useCases.includes(u))) return false;
  if (modules.length && !meta.modules.some((m) => modules.includes(m))) return false;
  return true;
}
