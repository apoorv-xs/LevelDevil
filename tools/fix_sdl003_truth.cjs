// One-shot: SDL-003 (Faceco) measured truth Oct 02 — Moto G, 2 runs.
// Dummy-content gun NOT found on homepage; phone on site differs from record.
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, '..', 'workspace', 'custom_prospects.js');
let t = fs.readFileSync(F, 'utf8');
const start = t.indexOf('"id": "SDL-003"');
if (start === -1) throw new Error('SDL-003 not found');
let end = t.indexOf('"id": "SDL-004"', start);
if (end === -1) end = t.length;
let rec = t.slice(start, end);
const before = rec;
const rep = (a, b) => {
  if (!rec.includes(a)) { console.log('MISS: ' + a.slice(0, 70)); return; }
  rec = rec.split(a).join(b);
};

rep('"speedScore": "38/100"', '"speedScore": "15/100 (Mobile, cold-load measured Oct 02)"');
rep('"lcpTime": "4.2s"', '"lcpTime": "LCP: 8.4s cold, 0.9s warm (2 runs, Moto G)"');
rep('"techStack": "WordPress / Elementor"',
  '"techStack": "WordPress (generator declares bogus 7.1.2; 94 requests, 3.5MB payload)"');
rep('"schemaStatus": "Unstructured DOM"',
  '"schemaStatus": "Generic SEO schema only (no Dentist entity, verified Oct 02)"');
rep('4.2s', '8.4s cold (0.9s warm)');
rep(`"notes": "Verified Edappally clinic line via Google Maps"`,
  `"notes": "Verified Edappally clinic line via Google Maps. Site lists +91 81292 20630; record holds Maps number +91 81380 03200 - confirm on call."`);
if (rec === before) throw new Error('no replacements made');
t = t.slice(0, start) + rec + t.slice(end);
fs.writeFileSync(F, t, 'utf8');
console.log('SDL-003 fields updated');
