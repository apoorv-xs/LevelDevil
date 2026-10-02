// One-shot: SDL-003 monthly funnel spend (matches p-1 precedent + funnel model).
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
rec = rec.split('"wastedSpend": "\u20B955,000/yr at risk to aggregator directories"').join('"wastedSpend": "\u20B940,000/mo funnel exposure (funnel model, 10% cut)"');
if (rec === before) throw new Error('no replacement made');
t = t.slice(0, start) + rec + t.slice(end);
fs.writeFileSync(F, t, 'utf8');
console.log('SDL-003 spend updated');
