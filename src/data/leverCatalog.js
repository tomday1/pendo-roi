// src/data/leverCatalog.js

// Primary Business Outcome (PBO) palette
export const PBO_META = {
  rev:  { key: "rev",  label: "Increase Revenue", color: "#d4ecbd" },
  cost: { key: "cost", label: "Cut Costs",        color: "#ffc7aa" },
  risk: { key: "risk", label: "Mitigate Risk",    color: "#fee5a0" },
};

// Map each lever to: label, PBO, modules used, and related use cases.
// Keep the keys exactly matching your lever IDs.
export const LEVER_META = {
  analytics: {
    label: "License Optimization (Analytics)",
    pbo: "cost",
    modules: ["Analytics"],
    useCases: [
      "Optimize Software Spend",
      "Optimize Revenue & Hiring Focus",
      "Connect Eng Work to Business Outcomes",
      "Understand Internal Product Usage",
    ],
  },
  guides: {
    label: "Email Deflection (Guides)",
    pbo: "cost",
    modules: ["Guides"],
    useCases: ["Reduce Customer Support Costs", "Reduce Customer Support Costs – Mktg"],
  },
  feedback: {
    label: "Capture at Scale (Feedback)",
    pbo: "cost",
    modules: ["Feedback"],
    useCases: [
      "Improve Roadmap Decisions – Cost",
      "Optimize Revenue & Hiring Focus",
      "Understand Customer Sentiment",
    ],
  },
  surveys: {
    label: "Automate Collection (NPS & Surveys)",
    pbo: "risk",
    modules: ["Surveys/NPS"],
    useCases: [
      "Understand Customer Sentiment",
      "Improve Roadmap Decisions – Risk",
      "Improve Forecasting Accuracy",
    ],
  },
  replay: {
    label: "Faster Triage (Session Replay)",
    pbo: "cost",
    modules: ["Session Replay"],
    useCases: ["Reduce Customer Support Costs", "Reduce Support Costs – IT", "Reduce Engineering Costs – Mktg"],
  },
  onboarding: {
    label: "Onboarding Acceleration (Guides, Analytics)",
    pbo: "risk",
    modules: ["Guides", "Analytics"],
    useCases: ["Improve Employee Onboarding", "Reduce Training Costs", "Optimize Major Systems Rollouts"],
  },
  productEff: {
    label: "Product Team Efficiency (Analytics)",
    pbo: "cost",
    modules: ["Analytics"],
    useCases: ["Improve Roadmap Decisions – Cost", "Connect Eng Work to Business Outcomes"],
  },
  tickets: {
    label: "Ticket Deflection (Guides, Session Replay)",
    pbo: "cost",
    modules: ["Guides", "Session Replay"],
    useCases: ["Reduce Customer Support Costs", "Reduce Support Costs – IT", "Improve Product Experience"],
  },
  trialUplift: {
    label: "Trial→Paid / Upsell Uplift (Guides, Analytics)",
    pbo: "rev",
    modules: ["Guides", "Analytics"],
    useCases: [
      "Improve Trial Conversion Rate",
      "Drive Product-Led Growth – Mktg",
      "Increase Upsell Revenue",
      "Drive Cross-Sell",
    ],
  },
  expansion: {
    label: "Expansion via Feature Adoption (Guides, Analytics)",
    pbo: "rev",
    modules: ["Guides", "Analytics"],
    useCases: ["Increase Product Adoption", "Improve Feature Adoption – Mktg", "Increase Upsell Revenue"],
  },
  mttr: {
    label: "MTTR & Time-to-Reproduce Reduction (Session Replay, Analytics, Jira)",
    pbo: "risk",
    modules: ["Session Replay", "Analytics"],
    useCases: ["Improve Product Experience", "Minimize Churn", "Improve Team Productivity"],
  },
  research: {
    label: "Research/Recruitment Cost Avoidance (Guides, Surveys, Feedback)",
    pbo: "cost",
    modules: ["Guides", "Surveys/NPS", "Feedback"],
    useCases: ["Improve Roadmap Decisions – Cost", "Optimize Revenue & Hiring Focus"],
  },
  training: {
    label: "Training Content Shift (Guides)",
    pbo: "cost",
    modules: ["Guides"],
    useCases: ["Reduce Training Costs", "Reduce M&A Costs", "Improve Employee Productivity w/ AI"],
  },
  consolidation: {
    label: "Tool Consolidation (Analytics, Guides, NPS & Surveys, Feedback, Session Replay)",
    pbo: "cost",
    modules: ["Analytics", "Guides", "Surveys/NPS", "Feedback", "Session Replay"],
    useCases: ["Optimize Software Spend", "Reduce Engineering Costs – Mktg"],
  },
  appStore: {
    label: "App Store Rating & Review Lift (Pendo Mobile, Guides)",
    pbo: "rev",
    modules: ["Mobile", "Guides"],
    useCases: ["Increase App Retention", "Improve Feature Adoption – Mktg"],
  },
  churn: {
    label: "Churn Reduction from Detractor Workflows (NPS, Analytics)",
    pbo: "risk",
    modules: ["Surveys/NPS", "Analytics"],
    useCases: ["Minimize Churn", "Reduce Churn – Revenue", "Improve Customer Satisfaction"],
  },
  release: {
    label: "Release Validation & Hotfix Avoidance (Analytics, Session Replay, Guides)",
    pbo: "risk",
    modules: ["Analytics", "Session Replay", "Guides"],
    useCases: ["Improve Product Experience", "Improve Roadmap Decisions – Risk"],
  },
  sunsetting: {
    label: "Feature Sunsetting & Maintenance Cost Reduction (Analytics, Feedback)",
    pbo: "cost",
    modules: ["Analytics", "Feedback"],
    useCases: ["Connect Eng Work to Business Outcomes", "Improve Roadmap Decisions – Cost"],
  },
  compliance: {
    label: "Compliance & Risk Mitigation (Guides, Analytics)",
    pbo: "risk",
    modules: ["Guides", "Analytics"],
    useCases: ["Ensure Compliance", "Avoid Legal Issues", "Minimize Security Risk"],
  },
  licenseCompliance: {
    label: "Internal SaaS License Compliance (Analytics)",
    pbo: "cost",
    modules: ["Analytics"],
    useCases: ["Optimize Software Spend", "Identify Software Gaps"],
  },
  commsCPM: {
    label: "Per-Email Comms Cost Avoidance (Guides, Orchestrate)",
    pbo: "cost",
    modules: ["Guides", "Orchestrate"],
    useCases: ["Lower CAC", "Reduce Customer Support Costs – Mktg", "Optimize Messaging"],
  },
};

// Convenience: build unique lists for filter dropdowns
export const ALL_MODULES = Array.from(
  new Set(Object.values(LEVER_META).flatMap((m) => m.modules))
).sort();

export const ALL_USE_CASES = Array.from(
  new Set(Object.values(LEVER_META).flatMap((m) => m.useCases))
).sort();
