// One-shot: apply Oct-03 sweep verifications (60+5 records).
// Only deterministic facts: schema presence, llms 404, one record fill.
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, '..', 'workspace', 'prospects_data.js');
let t = fs.readFileSync(F, 'utf8');

function recSpan(id) {
  const s = t.indexOf('"id": "' + id + '"');
  if (s === -1) { console.log(id + ': RECORD NOT FOUND'); return null; }
  let e = t.indexOf('"id": "p-', s + 10);
  if (e === -1) e = t.length;
  return { start: s, end: e, text: t.slice(s, e) };
}
function setRec(id, rec) {
  const s = t.indexOf('"id": "' + id + '"');
  let e = t.indexOf('"id": "p-', s + 10);
  if (e === -1) e = t.length;
  t = t.slice(0, s) + rec + t.slice(e);
}

// 1. Schema: record says Unstructured but markup measured -> flip (13 ids)
const toStructured = ['p-2', 'p-10', 'p-13', 'p-15', 'p-19', 'p-20', 'p-25', 'p-26', 'p-28', 'p-29', 'p-33', 'p-38', 'p-60'];
for (const id of toStructured) {
  const r = recSpan(id);
  if (!r) continue;
  const a = '"schemaStatus": "Unstructured DOM"';
  if (!r.text.includes(a)) { console.log(id + ': schema anchor MISS'); continue; }
  setRec(id, r.text.split(a).join('"schemaStatus": "Structured markup present (depth unaudited, Oct 03 sweep)"'));
  console.log(id + ': schema -> structured');
}
// 2. Schema: record says Partial Microdata but page is bare -> Unstructured (p-44, p-48)
for (const id of ['p-44', 'p-48']) {
  const r = recSpan(id);
  if (!r) continue;
  const a = '"schemaStatus": "Partial Microdata"';
  if (!r.text.includes(a)) { console.log(id + ': schema anchor MISS'); continue; }
  setRec(id, r.text.split(a).join('"schemaStatus": "Unstructured DOM"'));
  console.log(id + ': schema -> unstructured');
}
// 3. p-51 llms Present -> Missing (measured 404)
{
  const r = recSpan('p-51');
  if (r) {
    const m = r.text.match(/"llmsStatus": "([^"]*)"/);
    console.log('p-51 llms current: ' + (m && m[1]));
    if (m && /present|live/i.test(m[1])) {
      setRec('p-51', r.text.split(m[0]).join('"llmsStatus": "Missing (/llms.txt 404, verified Oct 03)"'));
      console.log('p-51: llms -> missing');
    }
  }
}
// 4. p-57: add missing schemaStatus (measured has-markup)
{
  const r = recSpan('p-57');
  if (r) {
    if (r.text.includes('"schemaStatus"')) { console.log('p-57: already has schemaStatus, skip'); }
    else {
      const lm = r.text.match(/"llmsStatus": "([^"]*)",/);
      if (!lm) { console.log('p-57: no llms anchor'); }
      else {
        setRec('p-57', r.text.replace(lm[0], lm[0] + '\n    "schemaStatus": "Structured markup present (depth unaudited, Oct 03 sweep)",'));
        console.log('p-57: schema added');
      }
    }
  }
}
fs.writeFileSync(F, t, 'utf8');
console.log('sweep apply done');
