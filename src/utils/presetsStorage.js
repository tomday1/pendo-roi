// src/utils/presetsStorage.js
const KEY = "pendoRoi.customerPresets.v1";

// read all presets (object keyed by customer name)
export function readAllPresets() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function writeAllPresets(all) {
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function savePreset(name, data) {
  const all = readAllPresets();
  all[name] = { ...data, _updatedAt: Date.now() };
  writeAllPresets(all);
}

export function loadPreset(name) {
  const all = readAllPresets();
  return all[name] || null;
}

export function deletePreset(name) {
  const all = readAllPresets();
  delete all[name];
  writeAllPresets(all);
}

export function exportPresets() {
  return JSON.stringify(readAllPresets(), null, 2);
}

export function importPresets(json) {
  const next = JSON.parse(json);
  if (!next || typeof next !== "object") throw new Error("Invalid JSON");
  // shallow sanity check
  writeAllPresets(next);
}
