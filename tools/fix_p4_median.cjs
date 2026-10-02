// One-shot: correct p-4 to 3-run median truth (LCP 4.8s typical, 10.8s cold-start).
// First probe caught a server stall; this replaces worst-case-only wording.
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
const rep = (a, b) => { rec = rec.split(a).join(b); };
rep('LCP: 10.8s', 'LCP: 4.8s typical (10.8s cold-start)');
rep('10/100 (Mobile)', '30/100 (Mobile, from 4.8s LCP)');
rep('10.8s (measured Oct 02)', '4.8s typical (10.8s cold-start, measured Oct 02)');
rep('(10.8s measured Oct 02)', '(4.8s typical, 10.8s cold-start)');
rep('10.8s measured Oct 02', '4.8s typical (10.8s cold-start), measured Oct 02');
rep('Measured 10.8s mobile load (Moto G, Oct 02): 125 requests, 10.3MB payload, 38 scripts, 61 images; /llms.txt and /robots.txt both 404.',
  'Measured 4.8s typical mobile load, 10.8s cold-start (Moto G, Oct 02, 3 runs): 110-125 requests, 4.6-10.3MB payload, 38 scripts, 61 images; origin TTFB swings 2-10s; /llms.txt and /robots.txt both 404.');
rep('Measured LCP 10.8s on Moto G 4G (125 requests, 10.3MB payload, Oct 02)',
  'Measured LCP 4.8s typical, 10.8s cold-start (Moto G 4G, Oct 02, 3 runs)');
rep('38 render-blocking scripts plus 61 images with zero payload discipline',
  '38 render-blocking scripts plus 61 images; payload swings 4.6-10.3MB run to run');
rep('Her homepage weighs 10.3MB across 125 requests and takes 10.8 seconds to show content on a phone \u2014 like making every patient wait outside the clinic door for eleven seconds before it opens.',
  'Her homepage swings between 4.6 and 10MB and takes about 5 seconds to show content \u201411 on a cold start \u2014 like making every patient wait outside the clinic door.');
rep('Custom (38 scripts, 61 images, 10.3MB payload)',
  'WordPress 6.9.9 (110+ requests, up to 10MB payload, 61 images)');
if (rec === before) throw new Error('no replacements made');
t = t.slice(0, start) + rec + t.slice(end);
fs.writeFileSync(F, t, 'utf8');
console.log('p-4 median truth applied');
