// One-shot migration: ingest Client_Radar_GoogleSheet_Export_2026-10-02-latest.csv
// - prospects_data.js: refresh 56 overlapping p-IDs (STARTER rows keep STARTER shape)
// - custom_prospects.js/.json: replace stale 70-record set with 5 new SDL leads
// Preserves test invariants: >=60 prospects, ratings 4-5, STARTER shape for no-site rows.
const fs = require('fs');
const path = require('path');

const CSV = 'Client Radar Prospects - Client_Radar_GoogleSheet_Export_2026-10-02-latest.csv';
const raw = fs.readFileSync(path.join(__dirname, '..', CSV), 'utf8');

function parseCSV(text) {
  const rows = []; let row = [], cur = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], next = text[i + 1];
    if (c === '"') {
      if (inQuotes && next === '"') { cur += '"'; i++; } else inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) { row.push(cur.trim()); cur = ''; }
    else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      row.push(cur.trim()); cur = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else cur += c;
  }
  if (cur.length > 0 || row.length > 0) { row.push(cur.trim()); rows.push(row); }
  return rows;
}

const parsed = parseCSV(raw);
const byId = {};
for (let i = 1; i < parsed.length; i++) {
  const r = parsed[i];
  if (!r || r.length < 8 || !r[0] || !r[2]) continue;
  byId[r[0]] = {
    id: r[0], city: r[1] || 'Kochi', name: r[2], dm: r[3] || 'Director',
    phone: r[4] || '', waRaw: r[5] || '', site: r[6] || '',
    cat: (r[7] || 'clinic').toLowerCase(), fee: r[8] || '',
    status: r[9] || 'available', speed: r[10] || '', lcp: r[11] || '',
    tech: r[12] || '', flawsRaw: r[13] || '', notes: r[14] || '',
    lastCall: r[15] || '', caller: r[16] || '',
    geo: r[17] || '', llms: r[18] || '', schema: r[19] || '', gun: r[20] || ''
  };
}
console.log('CSV rows indexed: ' + Object.keys(byId).length);

const esc = v => String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const digits = v => String(v).replace(/[^0-9]/g, '');

function buildScripts(d) {
  const cleanDm = d.dm.split('(')[0].trim();
  const cleanName = d.name.split(',')[0].trim();
  const rawLcp = d.lcp.replace(/LCP:\s*/i, '').trim() || d.lcp;
  return {
    speed: {
      en: `Good morning, calling on Apoorv's behalf for ${d.dm}. Apoorv audited ${cleanName}'s mobile web presence and noted that mobile loading takes ${rawLcp}, causing high-intent prospective clients to drop off before booking. Apoorv prepared an executive mobile performance teardown (normally our \u20B94,999 audit, shared complimentary) to secure direct bookings. Would ${cleanDm} have 10 minutes for a brief discovery screen share with Apoorv this Thursday?`,
      ml: `\u0D28\u0D2E\u0D38\u0D4D\u0D15\u0D3E\u0D30\u0D02, \u0D07\u0D24\u0D4D ${cleanName} \u0D05\u0D32\u0D4D\u0D32\u0D47? \u0D1E\u0D3E\u0D7B \u0D05\u0D2A\u0D42\u0D7C\u0D35\u0D3F\u0D7B \u0D35\u0D47\u0D23\u0D4D\u0D1F\u0D3F\u0D2F\u0D3E\u0D23\u0D4D \u0D35\u0D3F\u0D33\u0D3F\u0D15\u0D4D\u0D15\u0D41\u0D28\u0D4D\u0D28\u0D24\u0D4D (calling on Apoorv's behalf). ${d.dm}-\u0D28\u0D4B\u0D1F\u0D4D \u0D38\u0D02\u0D38\u0D3E\u0D30\u0D3F\u0D15\u0D4D\u0D15\u0D3E\u0D7B \u0D38\u0D3E\u0D27\u0D3F\u0D15\u0D4D\u0D15\u0D41\u0D2E\u0D4B? \u0D28\u0D3F\u0D19\u0D4D\u0D19\u0D33\u0D41\u0D1F\u0D46 \u0D35\u0D46\u0D2C\u0D4D\u0D38\u0D48\u0D1E\u0D4D\u0D1F\u0D46 \u0D2E\u0D4A\u0D2C\u0D48\u0D7C \u0D38\u0D4D\u0D2A\u0D40\u0D21\u0D41\u0D02 (${rawLcp}) \u0D21\u0D2F\u0D31\u0D15\u0D4D\u0D1F\u0D4D \u0D2C\u0D41\u0D15\u0D4D\u0D15\u0D3F\u0D02\u0D17\u0D41\u0D02 \u0D35\u0D7C\u0D27\u0D3F\u0D2A\u0D4D\u0D2A\u0D3F\u0D15\u0D4D\u0D15\u0D3E\u0D7B \u0D05\u0D2A\u0D42\u0D7C\u0D35\u0D4D \u0D24\u0D2F\u0D4D\u0D2F\u0D3E\u0D31\u0D3E\u0D15\u0D4D\u0D15\u0D3F\u0D2F \u0D0E\u0D15\u0D4D\u0D38\u0D3F\u0D15\u0D4D\u0D2F\u0D42\u0D1F\u0D4D\u0D1F\u0D3F\u0D35\u0D4D \u0D2A\u0D46\u0D7C\u0D2B\u0D4B\u0D7C\u0D2E\u0D7B\u0D38\u0D4D \u0D13\u0D21\u0D3F\u0D1F\u0D4D\u0D1F\u0D4D \u0D37\u0D46\u0D2F\u0D7C \u0D1A\u0D46\u0D2F\u0D4D\u0D2F\u0D3E\u0D28\u0D4D. \u0D05\u0D2A\u0D42\u0D7C\u0D35\u0D41\u0D2E\u0D3E\u0D23\u0D3F \u0D38\u0D02\u0D38\u0D3E\u0D30\u0D3F\u0D15\u0D4D\u0D15\u0D3E\u0D7B \u0D08 \u0D35\u0D4D\u0D2F\u0D3E\u0D34\u0D3E\u0D34\u0D4D\u0D1A 10 \u0D2E\u0D3F\u0D28\u0D3F\u0D31\u0D4D\u0D1F\u0D4D \u0D38\u0D2E\u0D2F\u0D02 \u0D24\u0D30\u0D3E\u0D2E\u0D4B?`,
      manglish: `Namaskaram, ithu ${cleanName} alle? Njan Apoorv-nu vendiyanu vilikkunnathu. ${d.dm}-nodu oru minute samsarikkan sadhikkumo? Ningalude website mobile loading ${rawLcp} edukkunnathinaal drop-off undavunnu. Direct bookings maximize cheyyaan Apoorv thayyaraakkiya technical audit share cheyyaam. 10 minute samayam tharaamo?`
    },
    commission: {
      en: `Good morning, calling on Apoorv's behalf for ${d.dm}. Premier establishments in ${d.city} are currently surrendering 15% to 25% of client revenue to aggregators because their own direct website lacks an instant, friction-free booking engine. Apoorv builds high-conversion direct portals that eliminate middleman commission bleed. Would ${cleanDm} be open to a 10-minute strategy call with Apoorv this week?`,
      ml: `\u0D28\u0D2E\u0D38\u0D4D\u0D15\u0D3E\u0D30\u0D02, \u0D1E\u0D3E\u0D7B \u0D05\u0D2A\u0D42\u0D7C\u0D35\u0D3F\u0D7B \u0D35\u0D47\u0D23\u0D4D\u0D1F\u0D3F\u0D2F\u0D3E\u0D23\u0D4D \u0D35\u0D3F\u0D33\u0D3F\u0D15\u0D4D\u0D15\u0D41\u0D28\u0D4D\u0D28\u0D24\u0D4D. \u0D05\u0D17\u0D4D\u0D30\u0D3F\u0D17\u0D47\u0D31\u0D4D\u0D1F\u0D30\u0D41\u0D15\u0D7E\u0D15\u0D4D\u0D15\u0D4D 15-25% \u0D15\u0D2E\u0D4D\u0D2E\u0D40\u0D37\u0D7B \u0D15\u0D4A\u0D1F\u0D41\u0D15\u0D4D\u0D15\u0D41\u0D28\u0D4D\u0D28\u0D24\u0D4D \u0D12\u0D34\u0D3F\u0D35\u0D3E\u0D15\u0D4D\u0D15\u0D3F, \u0D28\u0D47\u0D30\u0D3F\u0D1F\u0D4D\u0D1F\u0D4D \u0D35\u0D46\u0D2C\u0D4D\u0D38\u0D48\u0D1E\u0D4D\u0D1F\u0D3F\u0D32\u0D42\u0D1F\u0D46 \u0D2C\u0D41\u0D15\u0D4D\u0D15\u0D3F\u0D02 \u0D28\u0D47\u0D1F\u0D3E\u0D7B \u0D38\u0D39\u0D3E\u0D2F\u0D3F\u0D15\u0D4D\u0D15\u0D41\u0D28\u0D4D\u0D28 \u0D38\u0D02\u0D35\u0D3F\u0D27\u0D3E\u0D28\u0D19\u0D19\u0D46 \u0D15\u0D41\u0D31\u0D3F\u0D1A\u0D4D\u0D1A\u0D4D ${d.dm}-\u0D28\u0D4B\u0D1F\u0D4D \u0D38\u0D02\u0D38\u0D3E\u0D30\u0D3F\u0D15\u0D4D\u0D15\u0D3E\u0D28\u0D3E\u0D23\u0D4D.`,
      manglish: `Namaskaram, njan Apoorv-nu vendiyanu vilikkunnathu. Aggregators-nu 15-25% commission kodukkate, direct client bookings nedan sahayikkunna portals-ne kurichu ${d.dm}-nodu samsarikkaanaanu. Epozhannu samayam labhikkuka?`
    },
    visual: {
      en: `Good morning, calling on Apoorv's behalf for ${d.dm}. For an established brand like ${cleanName}, flat static pages no longer convey premium authority. Apoorv specializes in modern interactive 60 FPS 3D spatial web experiences and WebGPU interfaces that immediately convert high-ticket clients. Would ${cleanDm} have 10 minutes to review a custom proof-of-concept?`,
      ml: `\u0D28\u0D2E\u0D38\u0D4D\u0D15\u0D3E\u0D30\u0D02, \u0D05\u0D2A\u0D42\u0D7C\u0D35\u0D3F\u0D7B \u0D35\u0D47\u0D23\u0D4D\u0D1F\u0D3F\u0D2F\u0D3E\u0D23\u0D4D \u0D1E\u0D3E\u0D7B \u0D35\u0D3F\u0D33\u0D3F\u0D15\u0D4D\u0D15\u0D41\u0D28\u0D4D\u0D28\u0D24\u0D4D. ${cleanName} \u0D2A\u0D4B\u0D32\u0D4A\u0D30\u0D41 \u0D2A\u0D4D\u0D30\u0D40\u0D2E\u0D3F\u0D2F\u0D02 \u0D2C\u0D4D\u0D30\u0D3E\u0D23\u0D4D\u0D1F\u0D3F\u0D28\u0D4D \u0D06\u0D27\u0D41\u0D28\u0D3F\u0D15 3D \u0D07\u0D28\u0D4D\u0D1F\u0D31\u0D3E\u0D15\u0D4D\u0D1F\u0D40\u0D35\u0D4D \u0D35\u0D46\u0D2C\u0D4D\u0D38\u0D48\u0D1E\u0D41\u0D15\u0D33\u0D3E\u0D23\u0D4D \u0D05\u0D2A\u0D42\u0D7C\u0D35\u0D4D \u0D21\u0D3F\u0D38\u0D48\u0D7B \u0D1A\u0D46\u0D2F\u0D4D\u0D2F\u0D41\u0D28\u0D4D\u0D28\u0D24\u0D4D.`,
      manglish: `Namaskaram, Apoorv-nu vendiyaanu njan vilikkunnathu. ${cleanName} poloru premium brand-nu flat website alla, modern 3D interactive web experiences aanu Apoorv design cheyyunnathu. Sample kaanaan 10 minute samayam tharaamo?`
    },
    gatekeeper: `Good morning, I\u2019m calling on Apoorv's behalf for ${d.dm} regarding mobile booking drop-offs and the 2026 AI search audit for ${cleanName}. Is ${cleanDm} currently between consultations or should I reach their personal desk?`
  };
}

function buildWa(d) {
  const cleanDm = d.dm.split('(')[0].trim();
  const cleanName = d.name.split(',')[0].trim();
  const rawLcp = d.lcp.replace(/LCP:\s*/i, '').trim() || d.lcp;
  return `Hi ${cleanDm}, following up on our call on Apoorv's behalf regarding ${cleanName}. Apoorv prepared an executive mobile performance teardown (normally our \u20B94,999 audit, shared complimentary) showing key conversion bottlenecks (${rawLcp}). Would Thursday 4 PM suit you for a brief 10-minute walkthrough?`;
}

function strBlock(obj, baseIndent) {
  return JSON.stringify(obj, null, 2).split('\n').map((l, i) => i === 0 ? l : baseIndent + l).join('\n');
}

// ---------- 1. prospects_data.js ----------
const mainPath = path.join(__dirname, '..', 'workspace', 'prospects_data.js');
let main = fs.readFileSync(mainPath, 'utf8');
fs.writeFileSync('B:/scratch/prospects_data.js.pre-oct02.bak', main, 'utf8');

const CONVERT = { 'p-4': 1, 'p-5': 1, 'p-7': 1, 'p-11': 1 };
let updated = 0, converted = 0, kept = 0, skipped = 0;
const missing = [];

const idRe = /\{\s*"id": "([^"]+)"/g;
let m; const spans = [];
while ((m = idRe.exec(main)) !== null) spans.push({ id: m[1], start: m.index });
for (let s = 0; s < spans.length; s++) {
  const end = s + 1 < spans.length ? spans[s + 1].start : main.length;
  let rec = main.slice(spans[s].start, end);
  const d = byId[spans[s].id];
  if (!d) { if (/^p-/.test(spans[s].id)) missing.push(spans[s].id); skipped++; continue; }
  const setStr = (key, val) => {
    const re = new RegExp('"' + key + '": "[^"]*"');
    if (!re.test(rec)) return false;
    rec = rec.replace(re, '"' + key + '": "' + esc(val) + '"');
    return true;
  };
  const isStarter = /"ptype": "STARTER"/.test(rec);
  const willConvert = isStarter && CONVERT[spans[s].id];
  setStr('city', d.city); setStr('name', d.name); setStr('dm', d.dm);
  setStr('phone', d.phone);
  setStr('tel', d.phone ? '+' + digits(d.phone) : '');
  setStr('wa', d.waRaw ? digits(d.waRaw) : (d.phone ? digits(d.phone) : ''));
  setStr('cat', d.cat); setStr('status', d.status);
  if (d.fee) setStr('fee', d.fee);
  if (!isStarter || willConvert) {
    setStr('site', d.site); setStr('speedScore', d.speed); setStr('lcpTime', d.lcp); setStr('techStack', d.tech);
    if (willConvert) rec = rec.replace(/"ptype": "STARTER"/, '"ptype": "UPGRADE"');
    const flawsArr = (d.flawsRaw ? d.flawsRaw.split(';').map(x => x.trim()).filter(Boolean) : []).slice(0, 6);
    if (flawsArr.length) {
      rec = rec.replace(/"flaws": \[\s*(?:"[^"]*",?\s*)+\],/, '"flaws": [\n      ' + flawsArr.map(f => '"' + esc(f) + '"').join(',\n      ') + '\n    ],');
    }
    rec = rec.replace(/"scripts": \{[\s\S]*?\n    \},\n/, '"scripts": ' + strBlock(buildScripts(d), '    ') + ',\n');
    rec = rec.replace(/"waMessage": "[^"]*"/, '"waMessage": "' + esc(buildWa(d)) + '"');
    if (d.gun) rec = rec.replace(/("callerCheatSheet": \{\s*"icebreaker": ")[^"]*(")/, '$1' + esc(d.gun) + '$2');
  }
  // geo/agentic telemetry fields (insert after status line)
  const geoBlock = '\n    "geoScore": "' + esc(d.geo || '') + '",\n    "llmsStatus": "' + esc(d.llms || '') + '",\n    "schemaStatus": "' + esc(d.schema || '') + '",\n    "smokingGun": "' + esc(d.gun || '') + '",\n    "notes": "' + esc(d.notes || '') + '",\n    "lastCallTime": "' + esc(d.lastCall || '') + '",';
  rec = rec.replace(/(\n    "status": "[^"]*",)/, '$1' + geoBlock);
  main = main.slice(0, spans[s].start) + rec + main.slice(end);
  // re-index spans after length change
  const delta = rec.length - (end - spans[s].start);
  for (let k = s + 1; k < spans.length; k++) spans[k].start += delta;
  if (willConvert) converted++; else updated++;
}
console.log('main updated=' + updated + ' converted=' + converted + ' skipped(absent from CSV)=' + skipped + ' missing=' + missing.join(','));
fs.writeFileSync(mainPath, main, 'utf8');

// ---------- 2. custom_prospects.js/.json : 5 SDL leads ----------
const sdlIds = Object.keys(byId).filter(id => id.indexOf('SDL') === 0);
const sdl = sdlIds.map(id => {
  const d = byId[id];
  const flawsArr = (d.flawsRaw ? d.flawsRaw.split(';').map(x => x.trim()).filter(Boolean) : ['Mobile performance drag', 'Missing /llms.txt discovery', 'Zero instant booking triage']).slice(0, 6);
  return {
    id: d.id, rating: 4.8, city: d.city, name: d.name, dm: d.dm,
    phone: d.phone, tel: d.phone ? '+' + digits(d.phone) : '', wa: d.waRaw ? digits(d.waRaw) : '',
    site: d.site, cat: d.cat, ptype: 'UPGRADE', fee: d.fee || '\u20B950,000',
    status: d.status, speedScore: d.speed, lcpTime: d.lcp, techStack: d.tech,
    flaws: flawsArr, geoScore: d.geo, llmsStatus: d.llms, schemaStatus: d.schema,
    smokingGun: d.gun, scripts: buildScripts(d), waMessage: buildWa(d),
    wastedSpend: '\u20B955,000/yr on aggregator directories & ads',
    wastedBreakdown: ['\u20B935,000/yr third-party aggregator listings', '\u20B912,000/yr maintenance & slow hosting', '\u20B98,000/yr wasted ad spend on high-bounce mobile traffic'],
    callerCheatSheet: {
      icebreaker: d.gun || 'How many monthly bookings come straight from your website versus aggregators?',
      laymanAnalogy: 'Slow mobile site leaks high-intent guests to whoever answers first on an aggregator.',
      competitorEdge: 'Top properties use 60 FPS portals and /llms.txt for direct bookings.'
    },
    notes: d.notes, lastCallTime: d.lastCall, lockedBy: null, lockedEmail: null
  };
});
const jsonPath = path.join(__dirname, '..', 'workspace', 'custom_prospects.json');
fs.writeFileSync(jsonPath, JSON.stringify(sdl, null, 2), 'utf8');
const jsContent = '// Client Radar \u2014 Ingested SDL leads from Oct-02 Google Sheet export\n// Generated at: ' + new Date().toISOString() + '\n// Total SDL Accounts: ' + sdl.length + '\n(function(root) {\n  const dataset = ' + JSON.stringify(sdl, null, 2) + ';\n\n  if (typeof module !== \'undefined\' && module.exports) {\n    module.exports = dataset;\n  }\n  if (typeof window !== \'undefined\') {\n    window.CUSTOM_PROSPECTS = dataset;\n  }\n  if (typeof global !== \'undefined\') {\n    global.CUSTOM_PROSPECTS = dataset;\n  }\n})(typeof window !== \'undefined\' ? window : this);\n';
const jsPath = path.join(__dirname, '..', 'workspace', 'custom_prospects.js');
fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log('custom SDL records=' + sdl.length);
