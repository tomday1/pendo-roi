// scripts/emit-kb.mjs
// Build-time emitter that reads ESM exports and writes JSON files to ./kb
// Works with Node 18+ (ESM). Your server can stay CommonJS.

// Usage:  node scripts/emit-kb.mjs
// Add an npm script:  "emit:kb": "node scripts/emit-kb.mjs"

import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "kb");

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function resolveOne(candidates) {
  for (const rel of candidates) {
    const abs = path.join(ROOT, rel);
    if (await exists(abs)) return abs;
  }
  return null;
}

async function dynImport(absPath) {
  const url = pathToFileURL(absPath).href;
  return import(url);
}

function writeJSON(absPath, data) {
  return fs.writeFile(absPath, JSON.stringify(data, null, 2), "utf8");
}

function count(objOrArr) {
  return Array.isArray(objOrArr) ? objOrArr.length : Object.keys(objOrArr || {}).length;
}

(async () => {
  await ensureDir(OUT_DIR);

  // --- 1) Problem → Use Cases ---
  // Preferred: keep data in code so both UI and server reuse the SAME source.
  // Try these (in order); if not found, fall back to an existing JSON if present.
  const p2uPath = await resolveOne([
    "src/data/problemToUseCases.js",    // recommended new file (see below)
    "src/problemToUseCases.js"
  ]);
  let problemToUseCases = null;
  if (p2uPath) {
    const mod = await dynImport(p2uPath);
    problemToUseCases = mod.PROBLEM_TO_USE_CASES || mod.default;
  } else {
    const jsonFallback = await resolveOne([
      "kb/problemToUseCases.json",
      "public/problemToUseCases.json"
    ]);
    if (jsonFallback) {
      problemToUseCases = JSON.parse(await fs.readFile(jsonFallback, "utf8"));
    } else {
      throw new Error(
        "Could not find PROBLEM_TO_USE_CASES. Create src/data/problemToUseCases.js (exporting PROBLEM_TO_USE_CASES) or place kb/problemToUseCases.json."
      );
    }
  }

  // --- 2) Problem Synonyms (optional in code; else keep your JSON) ---
  const synPath = await resolveOne([
    "src/data/problemSynonyms.js",
    "src/problemSynonyms.js"
  ]);
  let problemSynonyms = null;
  if (synPath) {
    const mod = await dynImport(synPath);
    problemSynonyms = mod.PROBLEM_SYNONYMS || mod.default;
  } else {
    const jsonFallback = await resolveOne([
      "kb/problemSynonyms.json",
      "public/problemSynonyms.json"
    ]);
    problemSynonyms = jsonFallback
      ? JSON.parse(await fs.readFile(jsonFallback, "utf8"))
      : {}; // ok to be empty if you don't use synonyms yet
  }

  // --- 3) Lever catalog (ESM) ---
  const leverPath = await resolveOne([
    "src/data/leverCatalog.js",
    "src/leverCatalog.js",
    "leverCatalog.js"
  ]);
  if (!leverPath) throw new Error("leverCatalog.js not found (expected under src/data or project root).");
  const leverMod = await dynImport(leverPath);
  // Expecting: export const LEVER_META = { ... }
  const leverCatalog = leverMod.LEVER_META || leverMod.default;
  if (!leverCatalog || typeof leverCatalog !== "object") {
    throw new Error("LEVER_META not found/exported in leverCatalog.js");
  }

  // --- 4) Customer stories (ESM) ---
  const storiesPath = await resolveOne([
    "src/customerStories.js",
    "src/data/customerStories.js",
    "customerStories.js"
  ]);
  if (!storiesPath) throw new Error("customerStories.js not found (expected under src/ or src/data/).");
  const storiesMod = await dynImport(storiesPath);
  const customerStories = storiesMod.default || storiesMod.customerStories || storiesMod.CUSTOMER_STORIES;
  if (!Array.isArray(customerStories)) {
    throw new Error("customerStories array not found/exported in customerStories.js");
  }

  // --- Write outputs ---
  await writeJSON(path.join(OUT_DIR, "problemToUseCases.json"), problemToUseCases);
  await writeJSON(path.join(OUT_DIR, "problemSynonyms.json"), problemSynonyms);
  await writeJSON(path.join(OUT_DIR, "leverCatalog.json"), leverCatalog);
  await writeJSON(path.join(OUT_DIR, "customerStories.json"), customerStories);

  // --- Log summary ---
  const synCount = Object.values(problemSynonyms || {}).reduce((n, arr) => n + (arr?.length || 0), 0);
  console.log(JSON.stringify({
    ok: true,
    outDir: OUT_DIR,
    counts: {
      problemToUseCases: count(problemToUseCases),
      problemSynonyms: synCount,
      leverCatalog: count(leverCatalog),
      customerStories: count(customerStories),
    }
  }, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
