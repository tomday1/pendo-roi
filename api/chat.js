// /api/chat.js — Vercel serverless (Node 18+)

// ----- CORS (needed when the RC runs on https://app.pendo.io) -----
const ALLOW_ORIGINS = new Set([
  "https://app.pendo.io",             // Pendo Resource Center
  "https://pendo-roi.vercel.app",     // your site (useful for testing the embed on your site)
  "http://localhost:3000"             // local testing
]);

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOW_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    // If you don't use cookies/Authorization, keep credentials off.
    // res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// ----- Config -----
const path = require("node:path");
const ALLOW_EXTERNAL = String(process.env.ALLOW_EXTERNAL || "false").toLowerCase() === "true";
const MODEL = process.env.GENAI_MODEL || "gemini-2.5-flash";

// ----- Load KB JSONs written by your emitter (or committed under /kb) -----
function load(rel, fallback) {
  try { return require(path.join(process.cwd(), "kb", rel)); }
  catch { return fallback; }
}
const PROBLEM_TO_USE_CASES = load("problemToUseCases.json", {});
const PROBLEM_SYNONYMS     = load("problemSynonyms.json", {});
const LEVER_CATALOG        = load("leverCatalog.json", {});
const CUSTOMER_STORIES     = load("customerStories.json", []);

// ----- Helpers -----
const clean  = (s='') => s.toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
const tokens = (s) => new Set(clean(s).split(' ').filter(Boolean));
const jaccard = (a,b) => {
  const A=tokens(a), B=tokens(b);
  const inter=[...A].filter(t=>B.has(t)).length;
  const uni=new Set([...A,...B]).size || 1;
  return inter/uni;
};

function findProblem(prompt) {
  const p = clean(prompt);
  const candidates = [];

  for (const key of Object.keys(PROBLEM_TO_USE_CASES)) {
    const base = clean(key);
    if (base) candidates.push({ problem:key, phrase:base, boost:1.0 });
    const syns = (PROBLEM_SYNONYMS[key] || []).map(clean).filter(Boolean);
    for (const s of syns) candidates.push({ problem:key, phrase:s, boost:0.95 });
  }

  // direct substring wins
  for (const c of candidates.sort((a,b)=>a.phrase.length-b.phrase.length)) {
    if (p.includes(c.phrase)) return c.problem;
  }

  // fuzzy
  const P = tokens(p);
  let best = { problem:null, score:0 };
  for (const c of candidates) {
    const C = tokens(c.phrase);
    const hit = [...C].filter(t => P.has(t)).length;
    const overlap = hit / Math.max(1, C.size);
    const score = (0.7 * overlap + 0.3 * jaccard(c.phrase, p)) * c.boost;
    if (score > best.score) best = { problem:c.problem, score };
  }
  return best.score >= 0.28 ? best.problem : null;
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

function renderAnswer({ problem, useCases, levers, stories }) {
  const uc = useCases.map(u => `• ${u}`).join('\n');
  const lv = levers.slice(0,5).map(({meta}) =>
    `• ${meta.label}  —  Modules: ${meta.modules?.join(', ') || '—'}`
  ).join('\n');
  const cs = stories.map(st => `• ${st.customer}: ${st.story}  (${st.url})`).join('\n');

  return [
    problem ? `I detected the problem: **${problem}**.` : null,
    useCases.length ? `Recommended use cases:\n${uc}` : null,
    levers.length ? `Value levers to consider:\n${lv}` : null,
    stories.length ? `Relevant customer stories:\n${cs}` : null,
    !useCases.length && !levers.length && !stories.length
      ? `I didn’t find a match in the Pendo ROI knowledge yet. Try naming a known problem (e.g., “Low adoption”, “Churn risk”), or expand the in-house mappings.`
      : `If you'd like, I can expand on any of the above.`
  ].filter(Boolean).join('\n\n');
}

// ----- Handler -----
module.exports = async (req, res) => {
  setCors(req, res);                          // CORS for RC
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")  return res.status(405).json({ error: "Method not allowed" });

  const prompt = (req.body?.prompt || '').toString();
  let mode     = (req.body?.mode || 'hybrid').toLowerCase();

  // If external isn’t allowed, force KB mode
  if (!ALLOW_EXTERNAL) mode = 'kb';

  try {
    // KB-first
    const problem  = findProblem(prompt);
    const useCases = problem ? (PROBLEM_TO_USE_CASES[problem] || []) : [];
    const levers   = useCases.length ? rankLeversByUseCases(useCases) : [];
    const stories  = useCases.length ? findStoriesForUseCases(useCases) : [];
    const hasKB    = useCases.length || levers.length || stories.length;

    res.setHeader('x-roi-mode', mode);
    res.setHeader('x-roi-path', hasKB ? 'kb' : (mode === 'kb' ? 'kb-nohit' : 'fallback-ai'));

    if (hasKB) {
      return res.status(200).json({ text: renderAnswer({ problem, useCases, levers, stories }) });
    }

    if (mode === 'kb') {
      return res.status(200).json({
        text: "I didn’t find a match in the Pendo ROI knowledge yet. Try naming a known problem (e.g., “Low adoption”, “Churn risk”), or expand the in-house mappings."
      });
    }

    // ===== AI fallback (only when ALLOW_EXTERNAL=true and GEMINI_API_KEY is set) =====
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        text: "Web/AI fallback isn’t configured (missing GEMINI_API_KEY). Ask an admin to enable it, or switch to In-house only."
      });
    }

    const { GoogleGenAI } = require("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const out = await ai.models.generateContent({
      model: MODEL,
      contents: [
        { role: "user", parts: [{ text: `User question: ${prompt}\n\nReturn a concise, plain-text answer.` }] }
      ]
    });

    return res.status(200).json({ text: out.text || "No response." });

  } catch (e) {
    console.error("api/chat error", e);
    res.setHeader('x-roi-path','error');
    return res.status(500).json({ text: "Assistant error. Check logs." });
  }
};
