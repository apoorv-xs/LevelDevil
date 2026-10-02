// One-shot: p-1 measured truth (Moto G, Oct 02, 3 runs: LCP 27.6/9.1/15.9s).
// Crash claim unreproduced -> reframed to measured facts. Scoped to p-1 only.
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, '..', 'workspace', 'prospects_data.js');
let t = fs.readFileSync(F, 'utf8');
const start = t.indexOf('"id": "p-1"');
if (start === -1) throw new Error('p-1 not found');
let end = t.indexOf('"id": "p-2"', start);
if (end === -1) end = t.length;
let rec = t.slice(start, end);
const before = rec;
const rep = (a, b) => { rec = rec.split(a).join(b); };

rep('"speedScore": "42/100"', '"speedScore": "5/100 (Mobile, measured Oct 02)"');
rep('"lcpTime": "3.8s"', '"lcpTime": "LCP: 16s typical (9-28s, 3 runs)"');
rep('"techStack": "WordPress / PHP (Kots Media / Booking Calendar)"',
  '"techStack": "WordPress 7.1.2 (Contact Form 7 booking, 77 scripts, 9.5MB payload)"');
rep('"schemaStatus": "Unstructured DOM"',
  '"schemaStatus": "Structured (Dentist JSON-LD x2, verified Oct 02)"');
rep('Live PHP GD library error disables online appointment booking; missing /llms.txt and entity schema causes high-value dental implant patients to bounce.',
  'Measured 16s typical mobile load, 28s worst cold-start (Moto G, Oct 02, 3 runs): 122 requests, 9.5MB payload, 77 scripts; 9 failed requests (404s + dead DNS); Contact Form 7 booking present but page sheds assets first; /llms.txt 404.');
rep('"flaws": [\n      "Live PHP GD-Library error on online booking form (\'CAPTCHA requires GD library activated\')",\n      "broken YouTube video embed in hero section",\n      "100% manual front-desk callback dependency."\n    ],',
  '"flaws": [\n      "Measured LCP 16s typical, 28s worst cold-start (Moto G 4G, Oct 02, 3 runs)",\n      "122 requests, 9.5MB payload, 9 failed requests (404s + dead DNS host)",\n      "Contact Form 7 booking exists but assets fail before patients reach it"\n    ],');
rep('3.8s', '16s');
rep('taking 4.4 seconds to open', 'taking 16 seconds to open');
rep('"revenueLeak": "\u20B91,80,000/mo Est. Revenue Leak",\n    "revenueLeakNumeric": 180000,',
  '"revenueLeak": "\u20B96,70,000/mo Est. Revenue Leak",\n    "revenueLeakNumeric": 670000,');
rec = rec.replace(/"securityAudit": \{[^}]+"issues": \[[^\]]+\][^}]+"callerTalkingPoint": "[^"]*"\s*\},/,
  `"securityAudit": {
      "grade": "MODERATE RISK",
      "score": "42/100 (heavy payload, version disclosed)",
      "issues": [
        "WordPress 7.1.2 version disclosed + 77 render-blocking scripts (measured Oct 02)",
        "9 failed sub-requests (404s, dead DNS host) shedding assets before booking",
        "No WhatsApp booking path found; 6 tap-to-call links only"
      ],
      "callerTalkingPoint": "Their WordPress version is public, 77 scripts block rendering, and 9 page assets fail outright before a patient ever reaches the booking form."
    },`);
rec = rec.replace(/"dpdpCompliance": \{[^}]+\},/,
  `"dpdpCompliance": {
      "status": "Intake consent unaudited",
      "risk": "Contact Form 7 data handling",
      "detail": "A 15-field Contact Form 7 intake exists; consent-checkbox posture not yet verified Oct 02."
    },`);
rec = rec.replace(/"thumbZone": \{[^}]+\},/,
  `"thumbZone": {
      "status": "Sticky bars present, no WhatsApp path",
      "detail": "3 fixed bottom bars and 6 tap-to-call links detected Oct 02; 0 WhatsApp links site-wide."
    },`);
rec = rec.replace(/"bookingFriction": \{[^}]+\},/,
  `"bookingFriction": {
      "steps": "15-field form, no calendar sync",
      "severity": "High friction",
      "detail": "One 15-field Contact Form 7 with no visible calendar availability or slot confirmation; booking-calendar page exists separately."
    },`);
rec = rec.replace(/"reputationBridge": \{[^}]+\}/,
  `"reputationBridge": {
      "status": "Unverified review equity",
      "detail": "No Google rating confirmed Oct 02; whatever reputation they carry cannot survive a 16s first impression."
    },`);
if (rec === before) throw new Error('no replacements made');
t = t.slice(0, start) + rec + t.slice(end);
fs.writeFileSync(F, t, 'utf8');
console.log('p-1 truth applied');
