// server.js (hardened)
// Start: node server.js
// curl test:
// curl -s http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"prompt":"I have a low adoption problem—what can I do","mode":"kb"}'

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const ALLOWLIST = [
  'http://localhost:3000',              
  'https://pendo-roi-bot.vercel.app',     
  'https://app.pendo.io'           
];

const corsOptions = {
  origin: function (origin, cb) {
    // allow same-origin or tools that omit Origin
    if (!origin) return cb(null, true);
    return cb(null, ALLOWLIST.includes(origin));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // set to false if you don’t send cookies/auth headers
};

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

const ALLOW_EXTERNAL = String(process.env.ALLOW_EXTERNAL || 'false').toLowerCase() === 'true';

// ---------- KB loading ----------
function loadJSON(relPath, fallback) {
  try { return require(path.join(__dirname, relPath)); }
  catch (e) { console.warn(`[KB] ${relPath} not found; using seed. (${e.message})`); return fallback; }
}

const SEED_PROBLEM_TO_USE_CASES = {
  "Low adoption": ["Increase Product Adoption","Improve Feature Adoption – Mktg","Increase App Retention"],
  "Poor trial conversion": ["Improve Trial Conversion Rate","Drive Product-Led Growth – Mktg"],
  "Churn risk": ["Minimize Churn","Reduce Churn – Revenue","Increase App Retention","Improve Customer Satisfaction"],
  "High support volume": ["Reduce Customer Support Costs","Reduce Support Costs – IT","Reduce Customer Support Costs – Mktg","Improve Product Experience"],
  "Low NPS/CSAT": ["Understand Customer Sentiment","Improve Customer Satisfaction","Optimize Messaging"]
};
const SEED_LEVER_CATALOG = {
  guides:{label:"In-app Guides",pbo:"increase",modules:["Guides"],useCases:["Increase Product Adoption","Improve Trial Conversion Rate","Increase App Retention","Reduce Customer Support Costs – Mktg","Optimize Messaging"]},
  analytics:{label:"Product Analytics",pbo:"cost",modules:["Analytics"],useCases:["Reduce Customer Support Costs","Understand Customer Sentiment","Improve Product Experience","Optimize Software Spend"]},
  feedback:{label:"Feedback",pbo:"cost",modules:["Feedback"],useCases:["Improve Roadmap Decisions – Cost","Understand Customer Sentiment","Identify Software Gaps"]}
};
const SEED_CUSTOMER_STORIES = [
  { story:"Global Payments uses Pendo product insights to prioritize the right fixes", customer:"Global Payments", industry:"Financial Services", useCase:"Decide what to build next", results:"Identified a friction point affecting ~50% of users; prioritized and built a fix", modules:["Analytics"], url:"https://www.pendo.io/customers/how-global-payments-uses-pendo-to-make-data-driven-decisions/" },
  { story:"Kajabi turns Feedback into a marketplace of ideas", customer:"Kajabi", industry:"Marketing", useCase:"Decide what to build next", results:"10% engagement in 1 month; 1,000 feature requests captured", modules:["Listen"], url:"https://www.pendo.io/customers/kajabi-uses-pendo-feedback-to-create-marketplace-of-ideas-improve-customer-loyalty-and-ltv/" }
];

const SEED_PROBLEM_SYNONYMS = {
  "Low adoption": [
    "low adoption","poor adoption","low uptake","poor uptake",
    "users not adopting","no one uses","nobody uses",
    "low activation","low usage","usage problem","engagement low",
    "adoption lag","adoption problem","feature adoption low"
  ],
  "Churn risk": [
    "churn problem","high churn","customers leaving","users leaving",
    "cancellations","cancellation rate","retention problem","retention drop",
    "attrition","churn spike","lose customers","customer loss","downgrades"
  ],
  "High support volume": [
    "many tickets","too many tickets","support volume high","support load",
    "support costs high","lots of support requests","zendesk tickets high"
  ],
  "Inefficient onboarding/training": [
    "onboarding problem","training problem","users confused onboarding",
    "employee onboarding slow","need training","onboarding too long"
  ],
  "Poor trial conversion": [
    "trial conversion low","free to paid low","trial not converting",
    "low activation during trial","conversion to paid problem"
  ],
  "Low NPS/CSAT": [
    "low nps","nps drop","low csat","customer satisfaction low",
    "bad reviews","satisfaction problem"
  ]
};
const PROBLEM_TO_USE_CASES = loadJSON('kb/problemToUseCases.json', SEED_PROBLEM_TO_USE_CASES);
const LEVER_CATALOG       = loadJSON('kb/leverCatalog.json',       SEED_LEVER_CATALOG);
const CUSTOMER_STORIES    = loadJSON('kb/customerStories.json',    SEED_CUSTOMER_STORIES);
const PROBLEM_SYNONYMS = loadJSON('kb/problemSynonyms.json', SEED_PROBLEM_SYNONYMS);

// ---------- Helpers ----------
const clean = (s='') => s.toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
const tokens = (s) => new Set(clean(s).split(' ').filter(Boolean));
const jaccard = (a,b) => { const A=tokens(a),B=tokens(b); const inter=[...A].filter(t=>B.has(t)).length; const uni=new Set([...A,...B]).size||1; return inter/uni; };

function findProblem(prompt) {
  const p = clean(prompt);

  // compile candidates: canonical name + synonyms
  const candidates = [];
  for (const key of Object.keys(PROBLEM_TO_USE_CASES)) {
    const keyNorm = clean(key);
    if (keyNorm) candidates.push({ problem: key, phrase: keyNorm, boost: 1.0 });
    const syns = (PROBLEM_SYNONYMS[key] || []).map(clean).filter(Boolean);
    for (const s of syns) candidates.push({ problem: key, phrase: s, boost: 0.95 });
  }

  // 1) substring hit wins
  for (const c of candidates.sort((a,b) => a.phrase.length - b.phrase.length)) {
    if (p.includes(c.phrase)) return c.problem;
  }

  // 2) fuzzy scoring
  const P_TOK = tokens(p);
  let best = { problem: null, score: 0 };
  for (const c of candidates) {
    const C_TOK = tokens(c.phrase);
    const hit = [...C_TOK].filter(t => P_TOK.has(t)).length;
    const overlap = hit / Math.max(1, C_TOK.size);
    const jac = jaccard(c.phrase, p);
    const score = (0.7 * overlap + 0.3 * jac) * c.boost;
    if (score > best.score) best = { problem: c.problem, score };
  }
  return best.score >= 0.28 ? best.problem : null; // lower threshold catches “cancellations”, “nobody uses…”
}

function rankLeversByUseCases(useCases){
  return Object.entries(LEVER_CATALOG)
    .map(([id,meta]) => ({ id, meta, score:(meta.useCases||[]).filter(u=>useCases.includes(u)).length }))
    .filter(x => x.score>0)
    .sort((a,b)=> b.score - a.score || a.meta.label.localeCompare(b.meta.label));
}

function findStoriesForUseCases(useCases, limit=3){
  return (CUSTOMER_STORIES||[])
    .map(s=>({ s, score: useCases.includes(s.useCase) ? 1 : 0 }))
    .filter(x=>x.score>0)
    .slice(0,limit)
    .map(x=>x.s);
}

function renderAnswer({ problem, useCases, levers, stories }){
  const uc = useCases.map(u=>`• ${u}`).join('\n');
  const lv = levers.slice(0,5).map(({meta})=>`• ${meta.label}  —  Modules: ${meta.modules?.join(', ') || '—'}`).join('\n');
  const cs = stories.map(st=>`• ${st.customer}: ${st.story}  (${st.url})`).join('\n');

  return [
    problem ? `I detected the problem: **${problem}**.` : null,
    useCases.length ? `Recommended use cases:\n${uc}` : null,
    levers.length ? `Value levers to consider:\n${lv}` : null,
    stories.length ? `Relevant customer stories:\n${cs}` : null,
    !useCases.length && !levers.length && !stories.length
      ? `I couldn't find a match in the in-house knowledge yet. Try another phrasing, or add mappings/stories.`
      : ``
  ].filter(Boolean).join('\n\n');
}

// ---------- Routes ----------
app.get('/api/health', (_req, res) => {
  res.set('x-roi-allow-external', String(ALLOW_EXTERNAL));
  const synCount = Object.values(PROBLEM_SYNONYMS).reduce((n, arr) => n + (arr?.length || 0), 0);
  res.json({
    ok: true,
    allowExternal: ALLOW_EXTERNAL,
    kb: {
      problems: Object.keys(PROBLEM_TO_USE_CASES).length,
      levers: Object.keys(LEVER_CATALOG).length,
      stories: (CUSTOMER_STORIES || []).length,
      synonyms: synCount
    }
  });
});

app.post('/api/chat', async (req, res) => {
  const prompt = (req.body?.prompt || '').toString();
  let mode = (req.body?.mode || 'hybrid').toLowerCase();
  if (!ALLOW_EXTERNAL) mode = 'kb'; // hard override unless you opt in via env

  try {
    // In-house KB path
    const problem = findProblem(prompt);
    const useCases = problem ? (PROBLEM_TO_USE_CASES[problem] || []) : [];
    const levers = useCases.length ? rankLeversByUseCases(useCases) : [];
    const stories = useCases.length ? findStoriesForUseCases(useCases) : [];
    const hasKB = useCases.length || levers.length || stories.length;

    res.set('x-roi-mode', mode);
    res.set('x-roi-path', hasKB ? 'kb' : (mode === 'kb' ? 'kb-nohit' : 'fallback'));

    if (hasKB) {
      return res.status(200).json({ text: renderAnswer({ problem, useCases, levers, stories }) });
    }

    if (mode === 'kb') {
      return res.status(200).json({
        text: "I didn’t find a match in the Pendo ROI knowledge yet. Try naming a known problem (e.g., “Low adoption”, “Churn risk”), or expand the in-house mappings."
      });
    }

    // --- Optional Gemini fallback (only runs if ALLOW_EXTERNAL=true AND mode==='hybrid') ---
    // const { GoogleGenAI } = require('@google/genai');
    // const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    // const out = await ai.models.generateContent({
    //   model: 'gemini-2.5-flash',
    //   contents: `User: ${prompt}\n\nNo internal KB match. Provide concise, Pendo-style guidance.`
    // });
    // return res.status(200).json({ text: out.text || 'No response.' });

    return res.status(200).json({
      text: "No in-house match; broaden your query or switch scope to “In-house → Web/AI”."
    });
  } catch (e) {
    console.error(e);
    res.set('x-roi-path','error');
    return res.status(500).json({ text: 'Assistant error. Check server logs.' });
  }
});

// Export for tests; listen when run directly
module.exports = app;
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`ROI bot listening on http://localhost:${port}`));
}
