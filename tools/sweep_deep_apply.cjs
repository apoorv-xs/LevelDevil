// One-shot: apply Oct-03 deep-sweep (2-run) findings per record. Reports MISS/EXISTS.
const fs = require('fs');
const path = require('path');
function span(t, id, nextPrefix) {
  const s = t.indexOf('"id": "' + id + '"');
  if (s === -1) { console.log(id + ': RECORD NOT FOUND'); return null; }
  let e = t.indexOf('"id": "' + nextPrefix, s + 10);
  if (e === -1) e = t.length;
  return { start: s, end: e, text: t.slice(s, e) };
}
function setField(rec, key, val) {
  const re = new RegExp('"' + key + '": "[^"]*"');
  if (!re.test(rec)) { console.log('  field ' + key + ' MISS'); return rec; }
  return rec.replace(re, '"' + key + '": "' + val + '"');
}
function addFlaw(rec, line) {
  if (rec.includes(line.slice(0, 40))) { console.log('  flaw EXISTS, skip'); return rec; }
  return rec.replace(/("flaws": \[\s*)"([^"]+)",/, '$1"' + line + '",\n      "$2",');
}

let t = fs.readFileSync(path.join(__dirname, '..', 'workspace', 'prospects_data.js'), 'utf8');
function applyMain(id, fn) {
  const r = span(t, id, 'p-');
  if (!r) return;
  const out = fn(r.text);
  t = t.slice(0, r.start) + out + t.slice(r.end);
  console.log(id + ': updated');
}
// slow confirmations (both runs Poor, contradict record)
applyMain('p-6', rec => {
  rec = setField(rec, 'speedScore', '10/100 (Mobile, 2-run measured Oct 03)');
  rec = setField(rec, 'lcpTime', 'LCP: 12s typical (10-15s, 2 runs)');
  return addFlaw(rec, 'Measured LCP 12s typical across 2 runs with 21.4MB payload (Oct 03 sweep)');
});
applyMain('p-33', rec => {
  rec = setField(rec, 'speedScore', '25/100 (Mobile, 2-run measured Oct 03)');
  rec = setField(rec, 'lcpTime', 'LCP: 6.5s typical (2 runs)');
  return addFlaw(rec, 'Measured LCP 6.5s on both runs with 8.5MB payload (Oct 03 sweep)');
});
// template rot (verified in DOM)
applyMain('p-15', rec => addFlaw(rec, 'Latin dummy text present in live DOM (verified Oct 03 sweep)'));
applyMain('p-21', rec => addFlaw(rec, 'Latin dummy text present in live DOM (verified Oct 03 sweep)'));
applyMain('p-45', rec => addFlaw(rec, 'Latin dummy text present in live DOM (verified Oct 03 sweep)'));
applyMain('p-29', rec => addFlaw(rec, "Unrendered template shortcode ('[filter_...') in live DOM (verified Oct 03 sweep)"));
applyMain('p-44', rec => addFlaw(rec, "'Our Qoutes' typo live on site (verified Oct 03 sweep)"));
applyMain('p-53', rec => addFlaw(rec, "'APPOINMENT' typo live on site (verified Oct 03 sweep)"));
applyMain('p-13', rec => addFlaw(rec, "Keyboard-smash placeholder text ('dfgxcbxcb') in live DOM (verified Oct 03 sweep)"));
// p-4 generator tag flipped 7.1.2 -> 6.9.9 (unstable, stop pinning version)
applyMain('p-4', rec => {
  const a = 'WordPress (generator declares bogus 7.1.2; Booking Calendar + Contact Form 7, 77 scripts, 9.5MB payload)';
  if (!rec.includes(a)) { console.log('  p-4 tech anchor MISS'); return rec; }
  return rec.split(a).join('WordPress (generator tag unstable across crawls: 7.1.2 then 6.9.9; Booking Calendar + Contact Form 7, 77 scripts, 9.5MB payload)');
});
fs.writeFileSync(path.join(__dirname, '..', 'workspace', 'prospects_data.js'), t, 'utf8');

// SDL-001 Jaccuzi check
let c = fs.readFileSync(path.join(__dirname, '..', 'workspace', 'custom_prospects.js'), 'utf8');
{
  const s = c.indexOf('"id": "SDL-001"');
  let e = c.indexOf('"id": "SDL-002"', s);
  let rec = c.slice(s, e);
  if (/jaccuzi/i.test(rec)) console.log('SDL-001: Jaccuzi already in record');
  else {
    rec = rec.replace(/("flaws": \[\s*)"([^"]+)",/, '$1"Unedited \'Jaccuzi\' brand reference in live copy — verify spelling vs Jacuzzi trademark (Oct 03 sweep)",\n      "$2",');
    c = c.slice(0, s) + rec + c.slice(e);
    console.log('SDL-001: Jaccuzi flaw added');
  }
}
fs.writeFileSync(path.join(__dirname, '..', 'workspace', 'custom_prospects.js'), c, 'utf8');
console.log('deep apply done');
