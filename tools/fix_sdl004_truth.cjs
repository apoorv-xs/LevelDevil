// One-shot: SDL-004 (Livglam) measured truth Oct 02 — Moto G, 2 runs.
// Dummy/typo claims VERIFIED (raw HTML where innerText missed). Scoped to SDL-004.
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, '..', 'workspace', 'custom_prospects.js');
let t = fs.readFileSync(F, 'utf8');
const start = t.indexOf('"id": "SDL-004"');
if (start === -1) throw new Error('SDL-004 not found');
let end = t.indexOf('"id": "SDL-005"', start);
if (end === -1) end = t.length;
let rec = t.slice(start, end);
const before = rec;
const rep = (a, b) => {
  if (!rec.includes(a)) { console.log('MISS: ' + a.slice(0, 70)); return; }
  rec = rec.split(a).join(b);
};

rep('"speedScore": "42/100"', '"speedScore": "5/100 (Mobile, cold-load measured Oct 02)"');
rep('"lcpTime": "3.9s"', '"lcpTime": "LCP: 13.5s cold, 1.8s warm (2 runs, Moto G)"');
rep('"techStack": "WordPress / Custom Aesthetic Theme"',
  '"techStack": "Custom theme, LiteSpeed server (no WP markers; 87 requests, 11.8MB payload)"');
rep('"schemaStatus": "Partial Microdata"',
  '"schemaStatus": "LocalBusiness JSON-LD present; no procedure/pricing depth (verified Oct 02)"');
rep('3.9s', '13.5s cold (1.8s warm)');
if (rec === before) throw new Error('no replacements made');
t = t.slice(0, start) + rec + t.slice(end);
fs.writeFileSync(F, t, 'utf8');
console.log('SDL-004 fields updated');
