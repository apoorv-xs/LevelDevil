import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

require('../workspace/prospects_data.js');
require('../workspace/custom_prospects.js');

const defaultList = (typeof global !== 'undefined' && global.DEFAULT_PROSPECTS) ? global.DEFAULT_PROSPECTS : [];
const customList = (typeof global !== 'undefined' && global.CUSTOM_PROSPECTS) ? global.CUSTOM_PROSPECTS : [];
const list = [...customList, ...defaultList];

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).replace(/"/g, '""');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str}"`;
  }
  return str;
}

const headers = [
  'ID',
  'City',
  'Company Name',
  'Decision Maker',
  'Phone',
  'WhatsApp',
  'Website',
  'Category',
  'Fee',
  'Status',
  'Speed Score',
  'LCP Time',
  'Tech Stack',
  'Flaws',
  'Notes',
  'Last Call Time',
  'Caller'
];

const rows = [headers.join(',')];

list.forEach(p => {
  const row = [
    escapeCsv(p.id),
    escapeCsv(p.city),
    escapeCsv(p.name),
    escapeCsv(p.dm),
    escapeCsv(p.phone),
    escapeCsv(p.wa),
    escapeCsv(p.site),
    escapeCsv(p.cat),
    escapeCsv(p.fee),
    escapeCsv(p.status || 'available'),
    escapeCsv(p.speedScore),
    escapeCsv(p.lcpTime),
    escapeCsv(p.techStack),
    escapeCsv((p.flaws || []).join('; ')),
    escapeCsv(p.notes || ''),
    escapeCsv(p.lastCallTime || ''),
    escapeCsv(p.lockedBy || '')
  ];
  rows.push(row.join(','));
});

const outPath = path.resolve(__dirname, '../SprintDial_Prospects_GoogleSheet_Template.csv');
fs.writeFileSync(outPath, rows.join('\n'), 'utf8');
console.log(`✅ Generated ${outPath} with ${list.length} accounts ready for Google Sheets!`);
