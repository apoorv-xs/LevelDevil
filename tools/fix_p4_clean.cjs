// One-shot phase 2: strip measurement labels from p-4 display fields (provenance -> notes),
// rewrite aggregator spend to verified-framed claims (Practo presence unconfirmed Oct 02).
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, '..', 'workspace', 'prospects_data.js');
let t = fs.readFileSync(F, 'utf8');
const start = t.indexOf('"id": "p-4"');
if (start === -1) throw new Error('p-4 not found');
let end = t.indexOf('"id": "p-5"', start);
if (end === -1) end = t.length;
let rec = t.slice(start, end);
const before = rec;
rec = rec.split('10/100 (Mobile, measured Oct 02)').join('10/100 (Mobile)');
rec = rec.split('LCP: 10.8s (measured Oct 02, Moto G 4G)').join('LCP: 10.8s');
rec = rec.split('5% (no llms.txt/robots.txt, 10.8s LCP measured)').join('5%');
rec = rec.split('10.8s (measured Oct 02)').join('10.8s');
rec = rec.split('(10.8s measured Oct 02)').join('(10.8s)');
// provenance into notes
rec = rec.replace(/("notes": "Verified via Google Maps: Owns clouddental\.in)/,
  '$1. Measured Oct 02 on Moto G 4G: LCP 10.8s, 125 requests, 10.3MB payload, 38 scripts, 61 images; /llms.txt 404, /robots.txt 404; Practo/Justdial listing unconfirmed');
// verified-framed aggregator spend (old Practo-bill figures were template residue, never measured)
rec = rec.split('"wastedSpend": "\u20B948,000/yr on Practo listings & commission bleed"').join(
  '"wastedSpend": "Patient bookings lost to Practo-listed Kakkanad rivals during 10.8s load"');
rec = rec.split('"wastedBreakdown": [\n      "\u20B932,000/yr Practo listing & per-booking lead commissions",\n      "\u20B910,500/yr Justdial & Sulekha shared patient inquiry packages",\n      "\u20B95,500/yr SMS OTP & unverified receptionist callback costs"\n    ],').join(
  '"wastedBreakdown": [\n      "Smile-n-Shine, Orchid Dental & Good Dentist take bookings on Practo; her own listing unconfirmed",\n      "10.8s mobile load with 10.3MB payload bounces high-intent implant patients",\n      "No /llms.txt or /robots.txt: invisible when patients ask AI where to go"\n    ],');
if (rec === before) throw new Error('no replacements made');
t = t.slice(0, start) + rec + t.slice(end);
fs.writeFileSync(F, t, 'utf8');
console.log('p-4 display cleanup applied');
