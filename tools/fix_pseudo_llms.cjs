// One-shot: precise llms status where /llms.txt serves robots-style text, not a manifest.
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, '..', 'workspace', 'prospects_data.js');
let t = fs.readFileSync(F, 'utf8');
function span(id) {
  const s = t.indexOf('"id": "' + id + '"');
  if (s === -1) { console.log(id + ': NOT FOUND'); return null; }
  let e = t.indexOf('"id": "p-', s + 10);
  if (e === -1) e = t.length;
  return { start: s, end: e, text: t.slice(s, e) };
}
for (const id of ['p-36', 'p-49']) {
  const r = span(id);
  if (!r) continue;
  const a = '"llmsStatus": "Present (/llms.txt live, verified Oct 02)"';
  if (!r.text.includes(a)) { console.log(id + ': anchor MISS'); continue; }
  const rec = r.text.split(a).join('"llmsStatus": "llms.txt serves robots-style directives only (no markdown manifest, Oct 03)"');
  t = t.slice(0, r.start) + rec + t.slice(r.end);
  console.log(id + ': reframed');
}
fs.writeFileSync(F, t, 'utf8');
console.log('done');
