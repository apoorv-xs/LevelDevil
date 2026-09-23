/**
 * ============================================================================
 * SPRINTDIAL ⟷ GOOGLE SHEETS LIVE BRIDGE (100% FREE)
 * ============================================================================
 * Instructions:
 * 1. Open your Google Sheet (e.g. titled "SprintDial - Client Intelligence Core").
 * 2. File -> Import -> Upload: Select "SprintDial_Prospects_GoogleSheet_Template.csv".
 * 3. Extensions -> Apps Script.
 * 4. Paste this ENTIRE code into `Code.gs`.
 * 5. Update SECRET_KEY below with your private secret (e.g. a random passphrase).
 * 6. Click "Deploy" -> "New deployment" -> Select type "Web app".
 *    - Description: "SprintDial Bridge"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (secured by SECRET_KEY parameter)
 * 7. Copy the Web App URL (e.g. https://script.google.com/macros/s/.../exec).
 * 8. In your SprintDial 3D Workspace, open Admin Console -> Cloud Sync -> Paste the URL!
 * ============================================================================
 */

// Set your private secret key here
const SECRET_KEY = "sprintdial_apoorv_lead_vault_2026";

/**
 * Custom Menu in Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚡ SprintDial CRM')
    .addItem('🔄 Push Sheet Rows to Workspace', 'syncToSprintDialWorkspace')
    .addItem('📊 Format Sheet Colors & Badges', 'applyBrutalFormatting')
    .addToUi();
}

/**
 * Web App GET: SprintDial pulls live prospects from Google Sheets
 * Call with: https://script.google.com/macros/s/.../exec?key=YOUR_SECRET_KEY
 */
function doGet(e) {
  const key = e.parameter ? e.parameter.key : '';
  if (key !== SECRET_KEY) {
    return ContentService.createTextOutput(JSON.stringify({
      error: "Unauthorized: Invalid secret key."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    return ContentService.createTextOutput(JSON.stringify({ prospects: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = data[0].map(h => String(h).trim().toLowerCase());
  const prospects = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Skip empty rows

    const p = {};
    headers.forEach((h, colIdx) => {
      p[h] = row[colIdx];
    });

    prospects.push({
      id: String(p['id'] || 'p-' + i),
      city: String(p['city'] || 'Kochi'),
      name: String(p['company name'] || p['name'] || ''),
      dm: String(p['decision maker'] || p['dm'] || ''),
      phone: String(p['phone'] || ''),
      wa: String(p['whatsapp'] || p['wa'] || String(p['phone'] || '').replace(/[^0-9]/g, '')),
      site: String(p['website'] || p['site'] || ''),
      cat: String(p['category'] || p['cat'] || 'general'),
      fee: String(p['fee'] || '₹50,000'),
      status: String(p['status'] || 'available'),
      speedScore: String(p['speed score'] || '🔴 32/100 (Mobile)'),
      lcpTime: String(p['lcp time'] || 'LCP: 4.4s'),
      techStack: String(p['tech stack'] || 'WordPress'),
      flaws: p['flaws'] ? String(p['flaws']).split(';').map(f => f.trim()) : [],
      notes: String(p['notes'] || ''),
      lastCallTime: p['last call time'] ? String(p['last call time']) : null,
      lockedBy: p['caller'] || null
    });
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    total: prospects.length,
    prospects: prospects
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Web App POST: SprintDial sends live call logs and status updates back into Google Sheets
 */
function doPost(e) {
  try {
    const key = e.parameter ? e.parameter.key : '';
    if (key !== SECRET_KEY) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Unauthorized" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const payload = JSON.parse(e.postData.contents || '{}');
    const prospectId = payload.id;
    if (!prospectId) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Missing prospect id" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).trim().toLowerCase());

    const idCol = headers.indexOf('id');
    const statusCol = headers.indexOf('status');
    const notesCol = headers.indexOf('notes');
    const callTimeCol = headers.indexOf('last call time');
    const callerCol = headers.indexOf('caller');

    let updatedRow = -1;
    for (let r = 1; r < data.length; r++) {
      if (String(data[r][idCol]) === String(prospectId)) {
        updatedRow = r + 1; // 1-indexed in Sheets
        break;
      }
    }

    if (updatedRow > 0) {
      if (statusCol !== -1 && payload.status) {
        sheet.getRange(updatedRow, statusCol + 1).setValue(payload.status);
      }
      if (notesCol !== -1 && payload.notes) {
        sheet.getRange(updatedRow, notesCol + 1).setValue(payload.notes);
      }
      if (callTimeCol !== -1 && payload.lastCallTime) {
        sheet.getRange(updatedRow, callTimeCol + 1).setValue(payload.lastCallTime);
      }
      if (callerCol !== -1 && payload.caller) {
        sheet.getRange(updatedRow, callerCol + 1).setValue(payload.caller);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, updatedRow: updatedRow }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ error: "Prospect ID not found in sheet" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Apply Clean Styling to Sheet
 */
function applyBrutalFormatting() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getDataRange();
  
  // Format Header
  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  header.setBackground('#17120f')
        .setFontColor('#fffdf1')
        .setFontWeight('bold')
        .setFontFamily('Consolas');
  
  sheet.setFrozenRows(1);
  SpreadsheetApp.getActiveSpreadsheet().toast('✅ Sheet formatted with SprintDial canonical styling!');
}
