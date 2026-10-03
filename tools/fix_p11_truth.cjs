// One-shot: p-11 (Biryani Store) measured truth Oct 02 — site fast (1.2s LCP), HSTS on,
// no JSON-LD, llms.txt 403, zero online forms. Replaces stale STARTER-era template claims.
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, '..', 'workspace', 'prospects_data.js');
let t = fs.readFileSync(F, 'utf8');
const start = t.indexOf('"id": "p-11"');
if (start === -1) throw new Error('p-11 not found');
let end = t.indexOf('"id": "p-', start + 10);
if (end === -1) end = t.length;
let rec = t.slice(start, end);
const before = rec;
const rep = (a, b) => {
  if (!rec.includes(a)) { console.log('MISS: ' + a.slice(0, 70)); return; }
  rec = rec.split(a).join(b);
};
rep('"geoScore": "0%",', '"geoScore": "10% (llms.txt blocked, no JSON-LD)",');
rep('"revenueLeak": "\u20B91,00,000/mo Est. Cover Leak",\n    "revenueLeakNumeric": 100000,',
  '"revenueLeak": "\u20B930,000/mo Est. Cover Leak",\n    "revenueLeakNumeric": 30000,');
rep('Timeout (>10s)', '1.2s (measured Oct 02)');
rep('"grade": "\u2620\uFE0F HIGH RISK",\n      "score": "15/100 (Unprotected)",\n      "issues": [\n        "No owned SSL domain; zero patient data privacy encryption",\n        "Directory aggregator hijacking customer inquiries",\n        "Vulnerable to unauthorized Google Business profile impersonation"\n      ],\n      "callerTalkingPoint": "Because they lack an owned HTTPS domain, any competitor or aggregator can intercept patient calls with zero privacy protection."',
  '"grade": "LOW RISK",\n      "score": "70/100 (HSTS active, fast site)",\n      "issues": [\n        "/llms.txt blocked with 403 (measured Oct 02)",\n        "No JSON-LD menu schema for AI assistants",\n        "Zero online ordering forms"\n      ],\n      "callerTalkingPoint": "Their site is fast with HSTS preloaded, but AI assistants cannot read the menu and orders happen only by phone."');
rep('"laymanAnalogy": "Relying solely on food delivery apps is like paying a 25% toll gate right outside your dining room door to greet guests who specifically came for your food."',
  '"laymanAnalogy": "Relying solely on food delivery apps is like paying a toll at your own dining room door to greet guests who came for your food."');
rep('"icebreaker": "Website unresolvable over standard web protocols; 100% of takeaway and catering revenue surrendered to Swiggy/Zomato commissions.",',
  '"icebreaker": "Site is fast (1.2s LCP measured Oct 02) but has no JSON-LD menu schema and blocks /llms.txt \u2014 AI assistants cannot read the menu, so orders default to Swiggy/Zomato listings.",');
rep('"status": "\uD83D\uDD34 Zero DPDP Guardrails",\n      "risk": "Unshielded Patient Inquiries",\n      "detail": "Aggregators and open unencrypted channels intercept patient inquiries without any data fiduciary protections."',
  '"status": "No browser intake to govern",\n      "risk": "Manual phone process",\n      "detail": "Zero online forms found Oct 02: no order data is collected in the browser, so consent burden sits with manual phone handling."');
rep('"status": "\u274C No Sticky Action Bar",\n      "detail": "No 1-tap thumb call or WhatsApp bar at screen bottom; client must pinch-zoom or scroll to find phone number."',
  '"status": "Call-bar presence unaudited",\n      "detail": "Sticky call-bar presence not verified Oct 02; 1 tap-to-call link found site-wide."');
rep('"steps": "9 Friction Steps",\n      "severity": "\uD83D\uDD34 Maximum Friction",\n      "detail": "Patient forced through aggregator directory listings, ads, and competing clinic recommendations."',
  '"steps": "Zero online forms",\n      "severity": "Phone-only ordering",\n      "detail": "No ordering form exists: every takeaway order must happen over phone, with no slot or confirmation visibility."');
rep('"status": "\u2620\uFE0F Reputation Disconnect",',
  '"status": "Unverified review equity",');
rep('"detail": "Strong Google review ratings (4.5\u2605+) are wasted because incoming mobile visitors encounter a slow, static website with zero live booking bridge."',
  '"detail": "No Google rating confirmed Oct 02; the fast 1.2s load means visitors reach the call button \u2014 reviews, if strong, can convert."');
if (rec === before) throw new Error('no replacements made');
t = t.slice(0, start) + rec + t.slice(end);
fs.writeFileSync(F, t, 'utf8');
console.log('p-11 truth applied');
