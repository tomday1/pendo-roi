import React from "react";

// Local styles (mirrors your tiny system)
const box = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};
const labelCss = { fontSize: 12, color: "#475569", marginBottom: 4 };
const inputCss = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "10px 12px",
  width: "90%",
  background: "#fff",
};

// Helpers
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

// ========== Metadata mapping (Use Case ↔ Lever ↔ PBO/Module) ==========
/**
 * For each lever, we annotate:
 * - pbo: "Increase Revenue" | "Cut Costs" | "Mitigate Risk" (main PBO)
 * - modules: string[] (e.g., ["Analytics","Guides"])
 * - useCases: string[] from the list you provided (1:1 where possible)
 */
// --- Use Case ↔ Lever ↔ PBO/Module mapping (enriched) ---
export const LEVERS_META = [
  {
    id: "analytics",
    title: "License Optimization (Analytics)",
    description:
      "Rightsize analytics licenses and cross-charge accurately using Pendo usage + metadata.",
    pbo: "Cut Costs",
    modules: ["Analytics", "Session Replay", "Listen", "Sentiment"],
    useCases: [
      "Optimize Software Spend",
      "Connect Eng Work to Business Outcomes",
      "Improve Roadmap Decisions – Cost",
      "Improve Roadmap Decisions – Risk",
      "Identify Software Gaps",
      "Understand Internal Product Usage",
    ],
  },
  {
    id: "guides",
    title: "Email Deflection (Guides)",
    description: "Replace costly broadcast emails with in-app guidance.",
    pbo: "Cut Costs",
    modules: ["Guides", "Orchestrate", "Analytics", "Listen", "Sentiment"],
    useCases: [
      "Reduce Customer Support Costs",
      "Reduce Customer Success Costs",
      "Reduce Support Costs – IT",
      "Reduce Customer Support Costs – Mktg",
      "Lower CAC",
    ],
  },
  {
    id: "listen",
    title: "Capture at Scale (Listen)",
    description: "Collect structured feedback with minutes instead of meetings.",
    pbo: "Cut Costs",
    modules: ["Listen", "Sentiment", "Analytics"],
    useCases: [
      "Understand Customer Sentiment",
      "Improve Roadmap Decisions – Cost",
      "Improve Roadmap Decisions – Risk",
      "Improve Customer Satisfaction",
      "Identify Software Gaps",
    ],
  },
  {
    id: "surveys",
    title: "Automate Collection (NPS & Surveys)",
    description: "Automate sentiment capture and reduce manual survey ops.",
    pbo: "Mitigate Risk",
    modules: ["NPS & Surveys", "Listen", "Sentiment", "Analytics"],
    useCases: [
      "Understand Customer Sentiment",
      "Improve Customer Satisfaction",
      "Reduce Churn – Revenue",
    ],
  },
  {
    id: "replay",
    title: "Faster Triage (Session Replay)",
    description: "Use replays to cut investigation time for bugs and issues.",
    pbo: "Cut Costs",
    modules: ["Session Replay", "Analytics", "Listen", "Sentiment"],
    useCases: [
      "Reduce Customer Support Costs",
      "Reduce Support Costs – IT",
      "Improve Roadmap Decisions – Risk",
      "Improve Product Experience",
      "Optimize Major Systems Rollouts",
    ],
  },
  {
    id: "onboarding",
    title: "Onboarding Acceleration (Guides, Analytics)",
    description: "Cut training/onboarding time via in-app onboarding & help center.",
    pbo: "Mitigate Risk",
    modules: ["Guides", "Analytics", "Orchestrate", "Session Replay"],
    useCases: [
      "Improve Employee Onboarding",
      "Improve Application Migrations",
      "Optimize Major Systems Rollouts",
      "Optimize Software Migration (M&A)",
    ],
  },
  {
    id: "productEff",
    title: "Product Team Efficiency (Analytics)",
    description: "Fewer BI/eng asks; faster decisions with self-serve analytics.",
    pbo: "Cut Costs",
    modules: ["Analytics", "Session Replay", "Listen", "Sentiment"],
    useCases: [
      "Improve Roadmap Decisions – Cost",
      "Reduce Engineering Costs – Mktg",
      "Connect Eng Work to Business Outcomes",
    ],
  },
  {
    id: "tickets",
    title: "Ticket Deflection (Guides, Session Replay)",
    description: "In-app help + replay reduces tickets and speeds handling.",
    pbo: "Cut Costs",
    modules: ["Guides", "Session Replay", "Analytics", "Listen", "Sentiment", "Orchestrate"],
    useCases: [
      "Reduce Customer Support Costs",
      "Reduce Support Costs – IT",
      "Reduce Customer Support Costs – Mktg",
      "Improve Product Experience",
    ],
  },
  {
    id: "trialUplift",
    title: "Trial→Paid / Upsell Uplift - PLG (Guides, Analytics)",
    description: "Nudges lift conversion at moments of value; marginized ARR.",
    pbo: "Increase Revenue",
    modules: ["Guides", "Analytics", "Orchestrate", "Session Replay", "Listen", "Sentiment"],
    useCases: [
      "Improve Trial Conversion Rate",
      "Drive Product-Led Growth – Mktg",
      "Increase Product Adoption",
      "Optimize Product Revenue",
    ],
  },
  {
    id: "expansion",
    title: "Expansion via Feature Adoption (Guides, Analytics)",
    description: "Targeted education increases attach of premium features.",
    pbo: "Increase Revenue",
    modules: ["Guides", "Analytics", "Orchestrate", "Listen", "Session Replay", "Sentiment"],
    useCases: [
      "Increase Product Adoption",
      "Improve Feature Adoption – Mktg",
      "Drive Cross-Sell",
      "Optimize Messaging",
      "Increase Upsell Revenue",
    ],
  },
  {
    id: "mttr",
    title: "MTTR & Time-to-Reproduce Reduction (Session Replay, Analytics)",
    description: "Replay shortens investigation and protects revenue during incidents.",
    pbo: "Mitigate Risk",
    modules: ["Session Replay", "Analytics", "Listen", "Sentiment"],
    useCases: [
      "Minimize Security Risk",
      "Improve Forecasting Accuracy",
      "Optimize Major Systems Rollouts",
      "Improve Product Experience",
    ],
  },
  {
    id: "research",
    title: "Research/Recruitment Cost Avoidance (Guides, Surveys, Listen)",
    description: "Slash panel fees and lead times using in-app recruitment.",
    pbo: "Cut Costs",
    modules: ["Guides", "NPS & Surveys", "Listen", "Sentiment", "Analytics"],
    useCases: [
      "Improve Roadmap Decisions – Cost",
      "Improve Roadmap Decisions – Risk",
      "Understand Customer Sentiment",
    ],
  },
  {
    id: "training",
    title: "Training Content Shift - Formal → Just-in-Time (Guides)",
    description: "Reduce formal training hours and travel/venue spend.",
    pbo: "Cut Costs",
    modules: ["Guides", "Analytics", "Session Replay"],
    useCases: ["Reduce Training Costs", "Improve Employee Onboarding"],
  },
  {
    id: "consolidation",
    title: "Tool Consolidation (Analytics, Guides, NPS & Surveys, Listen, Session Replay)",
    description: "Retire overlapping tools and reduce admin time.",
    pbo: "Cut Costs",
    modules: ["Analytics", "Guides", "NPS & Surveys", "Listen", "Session Replay"],
    useCases: [
      "Optimize Software Spend",
      "Reduce Engineering Costs – Mktg",
      "Identify Software Gaps",
    ],
  },
  {
    id: "appStore",
    title: "App Store Rating & Review Lift (Pendo Mobile, Guides)",
    description: "Higher ratings improve conversion and installs.",
    pbo: "Increase Revenue",
    modules: ["Mobile", "Guides", "Analytics"],
    useCases: ["Increase Product Adoption"],
  },
  {
    id: "churn",
    title: "Churn Reduction from Detractor Workflows (NPS, Analytics)",
    description: "Automated saves on detractors reduce attrition; marginized ARR retained.",
    pbo: "Mitigate Risk",
    modules: ["NPS & Surveys", "Analytics", "Listen", "Sentiment", "Orchestrate"],
    useCases: [
      "Minimize Churn",
      "Reduce Churn – Revenue",
      "Increase App Retention",
      "Improve Customer Satisfaction",
    ],
  },
  {
    id: "release",
    title:
      "Release Validation & Hotfix Avoidance (Analytics, Session Replay, Guides)",
    description: "Pre/post checks and guides reduce hotfixes and bug time.",
    pbo: "Cut Costs",
    modules: ["Analytics", "Session Replay", "Guides", "Listen", "Sentiment"],
    useCases: [
      "Connect Eng Work to Business Outcomes",
      "Optimize Major Systems Rollouts",
      "Improve Product Experience",
      "Reduce Engineering Costs – Mktg",
    ],
  },
  {
    id: "sunsetting",
    title: "Feature Sunsetting & Maintenance Cost Reduction (Analytics, Listen)",
    description: "Retire low-use features to reduce tech debt and infra.",
    pbo: "Cut Costs",
    modules: ["Analytics", "Listen", "Sentiment"],
    useCases: [
      "Connect Eng Work to Business Outcomes",
      "Identify Software Gaps",
      "Optimize Software Spend",
    ],
  },
  {
    id: "compliance",
    title: "Compliance & Risk Mitigation (Guides, Analytics)",
    description: "Prevent risky actions and reduce incident probability.",
    pbo: "Mitigate Risk",
    modules: ["Guides", "Analytics", "Session Replay", "Listen"],
    useCases: [
      "Ensure Compliance",
      "Avoid Legal Issues",
      "Minimize Security Risk",
      "Improve Application Migrations",
    ],
  },
  {
    id: "licenseCompliance",
    title: "Internal SaaS License Compliance (Analytics)",
    description: "Right-size named seats based on usage analytics.",
    pbo: "Cut Costs",
    modules: ["Analytics"],
    useCases: ["Optimize Software Spend", "Understand Internal Product Usage"],
  },
  {
    id: "commsCPM",
    title: "Per-Email Comms Cost Avoidance (In-App Announcements)",
    description: "Shift email blasts to in-app announcements.",
    pbo: "Cut Costs",
    modules: ["Guides", "Orchestrate", "Analytics"],
    useCases: ["Lower CAC", "Reduce Customer Support Costs – Mktg"],
  },
  {
  id: "aiAdoption",
  title: "AI Feature Adoption Uplift",
  description: "Faster ROI and revenue by accelerating adoption of AI-powered features.",
  pbo: "Increase Revenue",
  modules: ["Analytics", "Session Replay", "Guides", "Orchestrate", "Listen", "Sentiment"],
  useCases: ["Accelerate AI Adoption", "Improve Trial Conversion Rate", "Increase Product Adoption"],
},
{
  id: "aiProductivity",
  title: "AI Productivity Boost (Employees/CS/PMs)",
  description: "Streamline workflows with AI copilots and in-context guidance, reducing OpEx.",
  pbo: "Cut Costs",
  modules: ["Analytics", "Guides", "Orchestrate", "Listen", "Sentiment"],
  useCases: ["Improve Employee Productivity w/ AI", "Optimize Revenue Teams – IT", "Improve Team Productivity"],
},
{
  id: "aiSupportDeflection",
  title: "AI Support Deflection",
  description: "Use AI-driven in-app answers and nudges to reduce ticket volume.",
  pbo: "Cut Costs",
  modules: ["Guides", "Analytics", "Session Replay", "Listen", "Sentiment"],
  useCases: ["Reduce Support Costs – IT", "Reduce Customer Success Costs"],
},
{
  id: "aiRiskMitigation",
  title: "AI Risk Mitigation & Forecast Accuracy",
  description: "Improve forecasts and reduce risk with AI-powered insights on usage and revenue correlation.",
  pbo: "Mitigate Risk",
  modules: ["Analytics", "Listen", "NPS & Surveys", "Sentiment"],
  useCases: ["Improve Forecasting Accuracy", "Optimize Revenue & Hiring Focus"],
},
];

// ========== Component ==========
export default function LeversSection({
  currency,
  enabled,

  // analytics
  analyticsSavings,
  analyticsUsers,
  setAnalyticsUsers,
  licenseCostPerUserMo,
  setLicenseCostPerUserMo,
  licenseOptPct,
  setLicenseOptPct,

  // guides
  guidesSavings,
  emailsDeflected,
  setEmailsDeflected,
  emailCost,
  setEmailCost,

  // feedback
  feedbackSavings,
  feedbackCount,
  setFeedbackCount,
  feedbackUnitCost,
  setFeedbackUnitCost,

  // surveys
  surveySavings,
  surveyCount,
  setSurveyCount,
  surveyUnitCost,
  setSurveyUnitCost,

  // replay
  replaySavings,
  totalReplays,
  setTotalReplays,
  replayUsefulPct,
  setReplayUsefulPct,
  replayUnitSaving,
  setReplayUnitSaving,

  // onboarding
  onboardingSavings,
  onUsers,
  setOnUsers,
  onHoursBase,
  setOnHoursBase,
  onReduction,
  setOnReduction,
  onHrCost,
  setOnHrCost,
  onRecap,
  setOnRecap,

  // product efficiency
  productEffSavings,
  pteCount,
  setPteCount,
  pteCost,
  setPteCost,
  ptePct,
  setPtePct,

  // tickets
  ticketDeflectSavings,
  tdBase,
  setTdBase,
  tdDeflect,
  setTdDeflect,
  tdHrs,
  setTdHrs,
  tdCostHr,
  setTdCostHr,
  tdRecap,
  setTdRecap,
  tdTimeReduction,
  setTdTimeReduction,

  // PLG
  trialUpliftRevenue,
  plgTrials,
  setPlgTrials,
  plgBaseConv,
  setPlgBaseConv,
  plgUplift,
  setPlgUplift,
  plgArpaMo,
  setPlgArpaMo,
  plgGM,
  setPlgGM,

  // expansion
  expansionRevenue,
  expEligible,
  setExpEligible,
  expPre,
  setExpPre,
  expPost,
  setExpPost,
  expPriceMo,
  setExpPriceMo,
  expGM,
  setExpGM,

  // mttr
  mttrTotalSavings,
  mttrTickets,
  setMttrTickets,
  mttrBeforeH,
  setMttrBeforeH,
  mttrAfterH,
  setMttrAfterH,
  mttrCostHr,
  setMttrCostHr,
  mttrRecap,
  setMttrRecap,
  incidents,
  setIncidents,
  mttrBefore,
  setMttrBefore,
  mttrAfter,
  setMttrAfter,
  revPerHourAtRisk,
  setRevPerHourAtRisk,

  // research
  researchSavings,
  resRecruits,
  setResRecruits,
  resPanelCost,
  setResPanelCost,
  resHoursSaved,
  setResHoursSaved,
  resCostHr,
  setResCostHr,

  // training
  trainingSavings,
  trainHoursFormal,
  setTrainHoursFormal,
  trainReduction,
  setTrainReduction,
  trainCostHr,
  setTrainCostHr,
  trainTravelAvoided,
  setTrainTravelAvoided,

  // consolidation
  consolidationSavings,
  consRetiredCost,
  setConsRetiredCost,
  consAdminHours,
  setConsAdminHours,
  consAdminCostHr,
  setConsAdminCostHr,

  // app store
  appStoreRevenue,
  appTraffic,
  setAppTraffic,
  appCvrBefore,
  setAppCvrBefore,
  appCvrAfter,
  setAppCvrAfter,
  appArpuYear,
  setAppArpuYear,

  // churn
  churnRetainedRevenue,
  crAccts,
  setCrAccts,
  crBase,
  setCrBase,
  crPost,
  setCrPost,
  crArpaYear,
  setCrArpaYear,
  crGM,
  setCrGM,

  // release
  releaseSavings,
  relHotfixesAvoided,
  setRelHotfixesAvoided,
  relCostPerHotfix,
  setRelCostPerHotfix,
  relBugHoursSaved,
  setRelBugHoursSaved,
  relCostHr,
  setRelCostHr,

  // sunsetting
  sunsettingSavings,
  sunEngHoursPerSprint,
  setSunEngHoursPerSprint,
  sunSprintsPerYear,
  setSunSprintsPerYear,
  sunCostHr,
  setSunCostHr,
  sunInfraAvoided,
  setSunInfraAvoided,

  // compliance
  complianceSavings,
  compProb,
  setCompProb,
  compImpact,
  setCompImpact,
  compReduction,
  setCompReduction,

  // license compliance
  licenseComplianceSavings,
  lcInactive,
  setLcInactive,
  lcBuffer,
  setLcBuffer,
  lcCostSeat,
  setLcCostSeat,

  // comms CPM
  commsCpmSavings,
  cpmEmailsAvoided,
  setCpmEmailsAvoided,
  cpmRate,
  setCpmRate,
  cpmHoursAvoided,
  setCpmHoursAvoided,
  cpmCostHr,
  setCpmCostHr,

  // --- AI ADOPTION
  aiAdoptionRevenue,
  aiEligible,          
  setAiEligible,
  aiPre,                    
  setAiPre,
  aiPost,                  
  setAiPost,
  aiPriceMo,           
  setAiPriceMo,
  aiGM,                       
  setAiGM,

  // --- AI PRODUCTIVITY
  aiProductivitySavings,
  aiRoles,              
  setAiRoles,
  aiRoleCost,         
  setAiRoleCost,
  aiEffPct,           
  setAiEffPct,

  // --- AI SUPPORT DEFLECTION
  aiSupportDeflectionSavings,
  aiBaseTickets,    
  setAiBaseTickets,
  aiDeflect,            
  setAiDeflect,
  aiHrs,                    
  setAiHrs,
  aiCostHr,             
  setAiCostHr,
  aiRecap,               
  setAiRecap,

  // --- AI RISK MITIGATION
  aiRiskMitigationSavings,
  aiProb,                  
  setAiProb,
  aiImpact,             
  setAiImpact,
  aiReduction,        
  setAiReduction,

  // cost of pendo
  pendoAnnualCost,
  setPendoAnnualCost,

  // NEW filters + colors
  pboFilter = "All",
  moduleFilter = "All Pendo Modules",
  useCaseFilter = "All Use Cases",
  pboColors = {},
}) {
  const valuesById = {
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

  const matchesPbo = (lever) => pboFilter === "All" || lever.pbo === pboFilter;
  const matchesModule = (lever) =>
    moduleFilter === "All Pendo Modules" || (lever.modules || []).includes(moduleFilter);
  const matchesUseCase = (lever) =>
    useCaseFilter === "All Use Cases" || (lever.useCases || []).includes(useCaseFilter);

  const visibleLevers = LEVERS_META
    .filter((m) => enabled[m.id])
    .filter(matchesPbo)
    .filter(matchesModule)
    .filter(matchesUseCase);

  return (
    <div
      id="tab-levers"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        gap: 16,
        marginTop: 16,
      }}
    >
      {visibleLevers.map((m) => {
        switch (m.id) {
          case "analytics":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={
                  <>
                    <div>
                      <code>
                        Analytics savings = users × (cost/user/year) × optimization%
                      </code>
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
            );
          case "guides":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
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
            );
          case "listen":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Feedback savings = feedback count × saving per feedback</code></div>}
              >
                <NumInput label="# of feedback items / yr" value={feedbackCount} onChange={setFeedbackCount} />
                <CurrencyInput label="Saving per feedback" value={feedbackUnitCost} onChange={setFeedbackUnitCost} currency={currency} />
              </ModuleCard>
            );
          case "surveys":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Survey savings = surveys via Pendo × saving per survey</code></div>}
              >
                <NumInput label="# of surveys via Pendo / yr" value={surveyCount} onChange={setSurveyCount} />
                <CurrencyInput label="Saving per survey" value={surveyUnitCost} onChange={setSurveyUnitCost} currency={currency} />
              </ModuleCard>
            );
          case "replay":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={
                  <div>
                    <div><code>Replay savings = total replays × useful% × saving per useful replay</code></div>
                  </div>
                }
              >
                <NumInput label="Total replays captured / yr" value={totalReplays} onChange={setTotalReplays} />
                <RangeInput label={`Replays used for fixes (${pctFmt(replayUsefulPct)})`} value={replayUsefulPct} onChange={setReplayUsefulPct} step={0.01} min={0} max={0.8} />
                <CurrencyInput label="Saving per useful replay" value={replayUnitSaving} onChange={setReplayUnitSaving} currency={currency} />
              </ModuleCard>
            );
          case "onboarding":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={
                  <>
                    <div><code>Onboarding savings = users × baseline hours × reduction% × $/hr × recapture%</code></div>
                  </>
                }
              >
                <NumInput label="Users onboarded / yr" value={onUsers} onChange={setOnUsers} />
                <NumInput label="Hours onboarding (baseline)" value={onHoursBase} onChange={setOnHoursBase} step={0.25} />
                <RangeInput label={`Time reduction (${pctFmt(onReduction)})`} value={onReduction} onChange={setOnReduction} />
                <CurrencyInput label="Hourly cost" value={onHrCost} onChange={setOnHrCost} currency={currency} />
                <RangeInput label={`Productivity recapture (${pctFmt(onRecap)})`} value={onRecap} onChange={setOnRecap} />
              </ModuleCard>
            );
          case "productEff":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Efficiency savings = roles × fully burdened cost/yr × efficiency uplift%</code></div>}
              >
                <NumInput label="# of PM/Design/Analyst roles" value={pteCount} onChange={setPteCount} />
                <CurrencyInput label="Fully burdened cost per person / yr" value={pteCost} onChange={setPteCost} currency={currency} />
                <RangeInput label={`Efficiency uplift (${pctFmt(ptePct)})`} value={ptePct} onChange={setPtePct} max={0.2} />
              </ModuleCard>
            );
          case "tickets":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={
                  <>
                    <div><code>Deflection savings = avoided tickets × hrs/ticket × $/hr × recapture%</code></div>
                    <div><code>Faster handling = remaining × hrs × time reduction% × $/hr × recapture%</code></div>
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
            );
          case "trialUplift":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Revenue = trials × base% × uplift% × ARPA/mo × 12 × GM%</code></div>}
              >
                <NumInput label="# of trials" value={plgTrials} onChange={setPlgTrials} />
                <RangeInput label={`Base conversion (${pctFmt(plgBaseConv)})`} value={plgBaseConv} onChange={setPlgBaseConv} max={1} />
                <RangeInput label={`Uplift (${pctFmt(plgUplift)})`} value={plgUplift} onChange={setPlgUplift} max={0.5} />
                <CurrencyInput label="ARPA / month" value={plgArpaMo} onChange={setPlgArpaMo} currency={currency} />
                <RangeInput label={`Gross margin (${pctFmt(plgGM)})`} value={plgGM} onChange={setPlgGM} max={1} />
              </ModuleCard>
            );
          case "expansion":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Revenue = eligible × (post - pre) × price/mo × 12 × GM%</code></div>}
              >
                <NumInput label="Users eligible" value={expEligible} onChange={setExpEligible} />
                <RangeInput label={`Adoption pre (${pctFmt(expPre)})`} value={expPre} onChange={setExpPre} max={1} />
                <RangeInput label={`Adoption post (${pctFmt(expPost)})`} value={expPost} onChange={setExpPost} max={1} />
                <CurrencyInput label="Premium attach price / month" value={expPriceMo} onChange={setExpPriceMo} currency={currency} />
                <RangeInput label={`Gross margin (${pctFmt(expGM)})`} value={expGM} onChange={setExpGM} max={1} />
              </ModuleCard>
            );
          case "mttr":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
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
            );
          case "research":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Research savings = recruits × panel cost + hours saved × $/hr</code></div>}
              >
                <NumInput label="# of recruits" value={resRecruits} onChange={setResRecruits} />
                <CurrencyInput label="Panel cost per recruit" value={resPanelCost} onChange={setResPanelCost} currency={currency} />
                <NumInput label="Research hours saved" value={resHoursSaved} onChange={setResHoursSaved} />
                <CurrencyInput label="Cost / hour" value={resCostHr} onChange={setResCostHr} currency={currency} />
              </ModuleCard>
            );
          case "training":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Training savings = formal hours × reduction% × $/hr + travel avoided</code></div>}
              >
                <NumInput label="Formal training hours / yr" value={trainHoursFormal} onChange={setTrainHoursFormal} />
                <RangeInput label={`Hours reduced (${pctFmt(trainReduction)})`} value={trainReduction} onChange={setTrainReduction} max={1} />
                <CurrencyInput label="Cost / hour" value={trainCostHr} onChange={setTrainCostHr} currency={currency} />
                <CurrencyInput label="Travel/venue avoided" value={trainTravelAvoided} onChange={setTrainTravelAvoided} currency={currency} />
              </ModuleCard>
            );
          case "consolidation":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Consolidation = retired tool cost + (admin hours × $/hr)</code></div>}
              >
                <CurrencyInput label="Retired tool cost (annual)" value={consRetiredCost} onChange={setConsRetiredCost} currency={currency} />
                <NumInput label="Admin hours saved" value={consAdminHours} onChange={setConsAdminHours} />
                <CurrencyInput label="Admin cost / hour" value={consAdminCostHr} onChange={setConsAdminCostHr} currency={currency} />
              </ModuleCard>
            );
          case "appStore":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Revenue = (CVR after - before) × store traffic × ARPU/year</code></div>}
              >
                <NumInput label="Store traffic (visits)" value={appTraffic} onChange={setAppTraffic} />
                <RangeInput label={`CVR before (${(appCvrBefore * 100).toFixed(1)}%)`} value={appCvrBefore} onChange={setAppCvrBefore} max={1} />
                <RangeInput label={`CVR after (${(appCvrAfter * 100).toFixed(1)}%)`} value={appCvrAfter} onChange={setAppCvrAfter} max={1} />
                <CurrencyInput label="ARPU / user / year" value={appArpuYear} onChange={setAppArpuYear} currency={currency} />
              </ModuleCard>
            );
          case "churn":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Retained = (churn base - post) × accounts × ARPA/year × GM%</code></div>}
              >
                <NumInput label="Accounts exposed" value={crAccts} onChange={setCrAccts} />
                <RangeInput label={`Churn baseline (${pctFmt(crBase)})`} value={crBase} onChange={setCrBase} max={1} />
                <RangeInput label={`Churn post (${pctFmt(crPost)})`} value={crPost} onChange={setCrPost} max={1} />
                <CurrencyInput label="ARPA / year" value={crArpaYear} onChange={setCrArpaYear} currency={currency} />
                <RangeInput label={`Gross margin (${pctFmt(crGM)})`} value={crGM} onChange={setCrGM} max={1} />
              </ModuleCard>
            );
          case "release":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
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
            );
          case "sunsetting":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Sunsetting = (eng hours × sprints × $/hr) + infra avoided</code></div>}
              >
                <NumInput label="Eng. hours / sprint on feature" value={sunEngHoursPerSprint} onChange={setSunEngHoursPerSprint} />
                <NumInput label="Sprints per year" value={sunSprintsPerYear} onChange={setSunSprintsPerYear} />
                <CurrencyInput label="Eng. cost / hour" value={sunCostHr} onChange={setSunCostHr} currency={currency} />
                <CurrencyInput label="Infra cost avoided" value={sunInfraAvoided} onChange={setSunInfraAvoided} currency={currency} />
              </ModuleCard>
            );
          case "compliance":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Expected = probability × impact × reduction%</code></div>}
              >
                <RangeInput label={`Incident probability (${pctFmt(compProb)})`} value={compProb} onChange={setCompProb} max={1} />
                <CurrencyInput label="Impact (annual)" value={compImpact} onChange={setCompImpact} currency={currency} />
                <RangeInput label={`Reduction from nudges (${pctFmt(compReduction)})`} value={compReduction} onChange={setCompReduction} max={1} />
              </ModuleCard>
            );
          case "licenseCompliance":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Savings = max(0, inactive - buffer) × cost/seat</code></div>}
              >
                <NumInput label="Inactive >90d" value={lcInactive} onChange={setLcInactive} />
                <NumInput label="Safety buffer" value={lcBuffer} onChange={setLcBuffer} />
                <CurrencyInput label="Cost per seat" value={lcCostSeat} onChange={setLcCostSeat} currency={currency} />
              </ModuleCard>
            );
          case "commsCPM":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Savings = (emails/1000 × CPM) + (hours × $/hr)</code></div>}
              >
                <NumInput label="Emails avoided" value={cpmEmailsAvoided} onChange={setCpmEmailsAvoided} />
                <CurrencyInput label="CPM (per 1,000 emails)" value={cpmRate} onChange={setCpmRate} currency={currency} />
                <NumInput label="Hours avoided (creative/QA)" value={cpmHoursAvoided} onChange={setCpmHoursAvoided} />
                <CurrencyInput label="Cost / hour" value={cpmCostHr} onChange={setCpmCostHr} currency={currency} />
              </ModuleCard>
            );
          case "aiAdoption":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Revenue = eligible × (post - pre) × price/mo × 12 × GM%</code></div>}
              >
                <NumInput label="Eligible users" value={aiEligible} onChange={setAiEligible} />
                <RangeInput label={`Adoption pre (${(aiPre*100).toFixed(0)}%)`} value={aiPre} onChange={setAiPre} max={1} />
                <RangeInput label={`Adoption post (${(aiPost*100).toFixed(0)}%)`} value={aiPost} onChange={setAiPost} max={1} />
                <CurrencyInput label="AI add-on price / month" value={aiPriceMo} onChange={setAiPriceMo} currency={currency} />
                <RangeInput label={`Gross margin (${(aiGM*100).toFixed(0)}%)`} value={aiGM} onChange={setAiGM} max={1} />
              </ModuleCard>
            );

          case "aiProductivity":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Savings = roles × fully burdened cost/yr × efficiency uplift%</code></div>}
              >
                <NumInput label="# roles impacted" value={aiRoles} onChange={setAiRoles} />
                <CurrencyInput label="Fully burdened cost / role / yr" value={aiRoleCost} onChange={setAiRoleCost} currency={currency} />
                <RangeInput label={`Efficiency uplift (${(aiEffPct*100).toFixed(0)}%)`} value={aiEffPct} onChange={setAiEffPct} max={0.25} />
              </ModuleCard>
            );

          case "aiSupportDeflection":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Savings = avoided tickets × hrs/ticket × $/hr × recapture%</code></div>}
              >
                <NumInput label="Tickets per year (baseline)" value={aiBaseTickets} onChange={setAiBaseTickets} />
                <RangeInput label={`Deflection rate (${(aiDeflect*100).toFixed(0)}%)`} value={aiDeflect} onChange={setAiDeflect} />
                <NumInput label="Hours per ticket" value={aiHrs} onChange={setAiHrs} step={0.25} />
                <CurrencyInput label="Cost per hour" value={aiCostHr} onChange={setAiCostHr} currency={currency} />
                <RangeInput label={`Time recapture (${(aiRecap*100).toFixed(0)}%)`} value={aiRecap} onChange={setAiRecap} />
              </ModuleCard>
            );

          case "aiRiskMitigation":
            return (
              <ModuleCard
                key={m.id}
                title={m.title}
                description={m.description}
                value={valuesById[m.id]}
                currency={currency}
                cardBg={pboColors[m.pbo]}
                info={<div><code>Expected = probability × impact × reduction%</code></div>}
              >
                <RangeInput label={`Incident probability (${(aiProb*100).toFixed(0)}%)`} value={aiProb} onChange={setAiProb} max={1} />
                <CurrencyInput label="Impact (annual)" value={aiImpact} onChange={setAiImpact} currency={currency} />
                <RangeInput label={`Reduction from AI insights (${(aiReduction*100).toFixed(0)}%)`} value={aiReduction} onChange={setAiReduction} max={1} />
              </ModuleCard>
            );
            default:
            return null;
        }
      })}

      {/* Always include cost of Pendo card */}
      <ModuleCard
        title="Cost of Pendo"
        description="Enter your annual investment to compute ROI & payback."
        value={-pendoAnnualCost}
        currency={currency}
        cardBg={"#ff4775"}
        info={<div><code>Entered directly; subtracts from total benefits to get net value</code></div>}
      >
        <CurrencyInput
          label="Pendo annual cost"
          value={pendoAnnualCost}
          onChange={setPendoAnnualCost}
          currency={currency}
        />
      </ModuleCard>
    </div>
  );
}

// ---------- Multi-select subcomponent (kept same API) ----------
LeversSection.MultiSelect = function MultiSelect({ enabled, toggleLever }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 8,
      }}
    >
      {LEVERS_META.map((l) => (
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
          <span>{l.title}</span>
        </label>
      ))}
    </div>
  );
};

// ---------- Card + Inputs ----------
function ModuleCard({ title, description, value, children, currency, info, cardBg }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ ...box, position: "relative", background: cardBg || "#fff" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          
          {info ? (
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={`Info for ${title}`}
              title="Show calculation details"
              style={{
              cursor: "pointer",
              fontSize: 16,   // nice readable size
              lineHeight: 1,
              fontFamily: "sans-serif", // 👈 forces plain font rendering
              background: "none",       // 👈 kills any platform button styling
              border: "none",           // 👈 no box/border
              padding: 0,
            }}
          >
            ℹ️
            </button>
          ) : null}
          <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: value >= 0 ? "#047857" : "#be123c",
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

      <p style={{ color: "#64748b", fontSize: 10, marginTop: 6, textAlign: "left" }}>
        {description}
      </p>
      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>{children}</div>
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
