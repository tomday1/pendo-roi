// src/data/problemSynonyms.js
// Flexible phrasings that should map to your canonical problem labels.
// All matching is intended to be case-insensitive in the server.

export const PROBLEM_SYNONYMS = {
  "Low adoption": [
    "low adoption",
    "poor adoption",
    "low uptake",
    "poor uptake",
    "users not adopting",
    "no one uses",
    "nobody uses",
    "low activation",
    "low usage",
    "usage problem",
    "engagement low",
    "adoption lag",
    "adoption problem",
    "feature adoption low",
    "nobody using this feature",
    "feature not used"
  ],

  "Poor trial conversion": [
    "trial conversion low",
    "poor trial conversion",
    "free to paid low",
    "trial not converting",
    "low activation during trial",
    "conversion to paid problem",
    "trial drop-off",
    "trial churn",
    "trial to paid problem",
    "trial not converting to paid"
  ],

  "Churn risk": [
    "churn problem",
    "high churn",
    "customers leaving",
    "users leaving",
    "cancellations",
    "cancellation rate",
    "retention problem",
    "retention drop",
    "attrition",
    "churn spike",
    "lose customers",
    "customer loss",
    "downgrades",
    "lots of cancellations"
  ],

  "High support volume": [
    "many tickets",
    "too many tickets",
    "support volume high",
    "support load",
    "support costs high",
    "zendesk tickets high",
    "lots of support requests",
    "ticket backlog",
    "case backlog",
    "too many support cases",
    "deflect tickets"
  ],

  "Slow incident resolution (MTTR)": [
    "slow incident resolution",
    "mttr high",
    "mean time to repair high",
    "mean time to resolve high",
    "incidents take long",
    "slow to fix issues",
    "slow bug fixes",
    "slow time to resolution",
    "time to resolution high",
    "slow ttr",
    "slow triage"
  ],

  "Inefficient onboarding/training": [
    "onboarding problem",
    "training problem",
    "users confused onboarding",
    "employee onboarding slow",
    "need training",
    "onboarding too long",
    "training costs high",
    "slow enablement",
    "new hires take too long to ramp"
  ],

  "Inefficient roadmap/R&D decisions": [
    "roadmap decisions",
    "what to build",
    "feature prioritization",
    "r&d inefficient",
    "prioritize features",
    "decide what to build next",
    "resource prioritization",
    "engineering priorities misaligned",
    "build the right things"
  ],

  "Tool sprawl / high software spend": [
    "tool sprawl",
    "too many tools",
    "software spend high",
    "license waste",
    "shelfware",
    "consolidate tools",
    "optimize software spend",
    "duplicate tools",
    "redundant tools"
  ],

  "Compliance / legal / security risk": [
    "compliance risk",
    "legal risk",
    "security risk",
    "audit issues",
    "gdpr",
    "hipaa",
    "sox",
    "data privacy",
    "consent issues",
    "governance risk",
    "policy violations"
  ],

  "Revenue team productivity": [
    "sales productivity",
    "revenue team productivity",
    "ae productivity",
    "revops efficiency",
    "rep efficiency",
    "seller productivity",
    "sales efficiency",
    "reps not productive"
  ],

  "AI adoption lag": [
    "ai adoption lag",
    "slow ai adoption",
    "ai not adopted",
    "llm rollout slow",
    "not using ai",
    "ai uptake low",
    "ai usage low"
  ],

  "Low NPS/CSAT": [
    "low nps",
    "nps drop",
    "low csat",
    "customer satisfaction low",
    "bad reviews",
    "satisfaction problem",
    "detractors high",
    "poor customer feedback"
  ]
};

export default PROBLEM_SYNONYMS;
