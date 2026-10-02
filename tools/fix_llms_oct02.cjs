// One-shot: flip llmsStatus to Present where /llms.txt verified live Oct 02 (28 URLs,
// content-checked non-HTML). Fix p-24 dead domain. Unflag p-31 (alive again).
const fs = require('fs');
const path = require('path');

const LIVE = [
  'http://www.aandh.co.in/', 'http://www.carafina.in/', 'http://www.d-aisle.com/',
  'http://www.jayantireddy.com/', 'http://www.lanadesignerboutique.com/',
  'http://www.parisdeboutique.com/', 'https://angadiheritage.com/',
  'https://anushreereddydesign.com/', 'https://calicutsilky.com/', 'https://depanache.in/',
  'https://facecoclinic.com/', 'https://grasshopper.co.in/', 'https://pageacademy.com/',
  'https://urbanzen.in/', 'https://www.cinnamonthestore.in/',
  'https://www.dentalsolutionsclinic.com/', 'https://www.dermiqclinic.com/',
  'https://www.drdixitcosmeticdermatology.com/', 'https://www.drgowddental.com/',
  'https://www.farmlore.in/', 'https://www.fmsdental.com/',
  'https://www.khoslaandanand.com/', 'https://www.livglam.com/',
  'https://www.mrunalinirao.com/', 'https://www.playsalon.in/',
  'https://www.varunchakkilam.in/', 'https://www.waterwoods.in/', 'https://www.zero40.com/'
];
const norm = u => String(u).toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
const liveSet = new Set(LIVE.map(norm));

function processFile(rel) {
  const F = path.join(__dirname, '..', rel);
  const t = fs.readFileSync(F, 'utf8');
  const parts = t.split(/(\{\s*"id": "[^"]+")/);
  let flips = 0, unflags = 0, seen = 0;
  const out = [parts[0]];
  for (let i = 1; i < parts.length; i += 2) {
    let rec = parts[i] + (parts[i + 1] || '');
    seen++;
    const sm = rec.match(/"site": "([^"]*)"/);
    if (sm && liveSet.has(norm(sm[1]))) {
      const before = rec;
      rec = rec.replace(/"llmsStatus": "Missing \(\/llms\.txt 404\)"/, '"llmsStatus": "Present (/llms.txt live, verified Oct 02)"');
      if (rec !== before) flips++;
    }
    if (/\[SITE DEAD - VERIFY\]/.test(rec)) {
      const siteNorm = norm((rec.match(/"site": "([^"]*)"/) || [])[1] || '');
      if (liveSet.has(siteNorm)) {
        rec = rec.replace(' [SITE DEAD - VERIFY]', '');
        unflags++;
      }
    }
    out.push(rec);
  }
  fs.writeFileSync(F, out.join(''), 'utf8');
  console.log(rel + ': seen=' + seen + ' llms flips=' + flips + ' unflags=' + unflags);
}

processFile('workspace/prospects_data.js');
processFile('workspace/custom_prospects.js');
// NOTE: p-24 already carries the verified dentalsolutionsclinic.com domain (via Oct-02 CSV ingest).
