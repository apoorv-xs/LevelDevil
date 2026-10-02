// One-shot: p-1 CAPTCHA crash VERIFIED in live DOM (verbatim), bogus generator tag,
// dead YouTube embed (oEmbed 404). Corrects the earlier downgrade. Scoped to p-1.
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

rep('"techStack": "WordPress 7.1.2 (Contact Form 7 booking, 77 scripts, 9.5MB payload)"',
  '"techStack": "WordPress (generator tag declares bogus 7.1.2; Booking Calendar + Contact Form 7, 77 scripts, 9.5MB payload)"');
rep('Measured 16s typical mobile load, 28s worst cold-start (Moto G, Oct 02, 3 runs): 122 requests, 9.5MB payload, 77 scripts; 9 failed requests (404s + dead DNS); Contact Form 7 booking present but page sheds assets first; /llms.txt 404.',
  'VERIFIED live Oct 02: Booking Calendar form renders "Error! CAPTCHA requires the GD library activated in your PHP configuration" (server lacks PHP GD extension). Measured 16s typical load, 28s worst cold-start (Moto G, 3 runs): 122 requests, 9.5MB payload, 77 scripts; hero YouTube embed unresolvable (oEmbed 404); /llms.txt 404.');
rep('"flaws": [\n      "Measured LCP 16s typical, 28s worst cold-start (Moto G 4G, Oct 02, 3 runs)",\n      "122 requests, 9.5MB payload, 9 failed requests (404s + dead DNS host)",\n      "Contact Form 7 booking exists but assets fail before patients reach it"\n    ],',
  '"flaws": [\n      "VERIFIED live: Booking Calendar CAPTCHA dead with on-page GD-library error (no server-side booking validation possible)",\n      "Hero YouTube embed unresolvable (oEmbed 404 on embedded video ID)",\n      "Measured LCP 16s typical, 28s worst cold-start (Moto G 4G, Oct 02, 3 runs)",\n      "122 requests, 9.5MB payload, 9 failed requests (404s + dead DNS host)"\n    ],');
rep('"issues": [\n        "WordPress 7.1.2 version disclosed + 77 render-blocking scripts (measured Oct 02)",',
  '"issues": [\n        "Booking Calendar CAPTCHA dead: server lacks PHP GD extension (verbatim on-page error, Oct 02)",\n        "Generator tag declares bogus WordPress 7.1.2 (no such release) + 77 render-blocking scripts",');
if (rec === before) throw new Error('no replacements made');
t = t.slice(0, start) + rec + t.slice(end);
fs.writeFileSync(F, t, 'utf8');
console.log('p-1 captcha truth applied');
