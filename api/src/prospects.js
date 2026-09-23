import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

let cachedProspects = null;
let cachedCustom = null;

export function getStoredProspects() {
  if (cachedProspects) return cachedProspects;
  try {
    const prospectsPath = path.resolve(__dirname, "../../workspace/prospects_data.js");
    require(prospectsPath);
    cachedProspects = (typeof global !== "undefined" && global.DEFAULT_PROSPECTS) ? global.DEFAULT_PROSPECTS : [];
  } catch (err) {
    cachedProspects = [];
  }
  return cachedProspects;
}

export function getStoredCustomProspects() {
  if (cachedCustom) return cachedCustom;
  try {
    const customPath = path.resolve(__dirname, "../../workspace/custom_prospects.js");
    require(customPath);
    cachedCustom = (typeof global !== "undefined" && global.CUSTOM_PROSPECTS) ? global.CUSTOM_PROSPECTS : [];
  } catch (err) {
    cachedCustom = [];
  }
  return cachedCustom;
}
