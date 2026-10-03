// One-shot: restore real phones where Oct-02 CSV carried spreadsheet #ERROR! values.
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, '..', 'workspace', 'prospects_data.js');
const B = 'B:/scratch/prospects_data.js.pre-oct02.bak';
let t = fs.readFileSync(F, 'utf8');
const bak = fs.readFileSync(B, 'utf8');
function recOf(src, id) {
  const s = src.indexOf('"id": "' + id + '"');
  if (s === -1) throw new Error(id + ' not found');
  let e = src.indexOf('"id": "p-', s + 10);
  if (e === -1) e = src.length;
  return { start: s, end: e, text: src.slice(s, e) };
}
for (const id of ['p-23', 'p-35', 'p-46']) {
  const cur = recOf(t, id);
  if (!cur.text.includes('"phone": "#ERROR!"')) { console.log(id + ': no #ERROR!, skipped'); continue; }
  const old = recOf(bak, id);
  let fixed = cur.text;
  for (const k of ['phone', 'tel', 'wa']) {
    const mOld = old.text.match(new RegExp('"' + k + '": "([^"]*)"'));
    const mCur = fixed.match(new RegExp('"' + k + '": "([^"]*)"'));
    if (mOld && mCur) fixed = fixed.replace(mCur[0], '"' + k + '": "' + mOld[1] + '"');
  }
  t = t.slice(0, cur.start) + fixed + t.slice(cur.end);
  console.log(id + ': restored ' + (recOf(bak, id).text.match(/"phone": "([^"]*)"/) || [])[1]);
}
fs.writeFileSync(F, t, 'utf8');
console.log('phone restore done');
