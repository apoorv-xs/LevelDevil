// Client Radar — Google Sheets Two-Way Bridge & CSV Ingestion Engine
// Strictly On Apoorv's Behalf

(function(root) {
  function getGoogleSheetsWebhookUrl() {
    try {
      return localStorage.getItem('sprintdial_gsheet_webhook_url') || '';
    } catch(e) {
      return '';
    }
  }

  function initGoogleSheetsUI() {
    const url = getGoogleSheetsWebhookUrl();
    const input = document.getElementById('gsheetWebhookUrlInput');
    const badge = document.getElementById('gsheetSyncStatusBadge');
    if (input && url) input.value = url;
    if (badge) {
      if (url) {
        badge.className = "text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 font-bold";
        badge.innerText = "● Webhook Connected";
      } else {
        badge.className = "text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/5";
        badge.innerText = "Webhook Standby";
      }
    }
  }

  function saveGoogleSheetsWebhookUI() {
    const input = document.getElementById('gsheetWebhookUrlInput');
    const url = input ? input.value.trim() : '';
    if (url) {
      if (!url.startsWith('https://script.google.com/')) {
        alert('Validation Error: Google Apps Script Webhook must start with https://script.google.com/');
        return;
      }
      localStorage.setItem('sprintdial_gsheet_webhook_url', url);
      if (typeof root.showNotification === 'function') {
        root.showNotification('[SHEETS] Google Sheets Webhook URL saved & connected!');
      }
    } else {
      localStorage.removeItem('sprintdial_gsheet_webhook_url');
      if (typeof root.showNotification === 'function') {
        root.showNotification('Google Sheets Webhook URL removed.');
      }
    }
    initGoogleSheetsUI();
  }

  async function pullFromGoogleSheetUI() {
    const url = getGoogleSheetsWebhookUrl() || (document.getElementById('gsheetWebhookUrlInput') ? document.getElementById('gsheetWebhookUrlInput').value.trim() : '');
    if (!url) {
      alert('Please enter and save your Google Apps Script Web App URL first.');
      return;
    }

    if (typeof root.showNotification === 'function') {
      root.showNotification('⏳ Pulling latest prospects from Google Sheet...');
    }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to reach Google Sheet Webhook`);
      const data = await res.json();
      if (!data.success || !Array.isArray(data.prospects) || data.prospects.length === 0) {
        throw new Error(data.error || 'No prospects returned from Google Sheet.');
      }

      const list = root.PROSPECTS || [];
      let addedCount = 0;
      let updatedCount = 0;
      data.prospects.forEach(rawP => {
        const sheetP = {
          id: rawP.id || 'p-sheet-' + Date.now(),
          city: rawP.city || 'Kochi',
          name: rawP.name || rawP.companyname || rawP.company || 'Business',
          dm: rawP.dm || rawP.decisionmaker || 'Director',
          phone: rawP.phone || '',
          wa: rawP.wa || rawP.whatsapp || (rawP.phone ? String(rawP.phone).replace(/[^0-9]/g, '') : ''),
          site: rawP.site || rawP.website || '',
          cat: rawP.cat || rawP.category || 'general',
          fee: rawP.fee || '₹50,000',
          status: rawP.status || 'available',
          speedScore: rawP.speedScore || rawP.speedscore || '🔴 32/100 (Mobile)',
          lcpTime: rawP.lcpTime || rawP.lcptime || 'LCP: 4.4s',
          techStack: rawP.techStack || rawP.techstack || 'WordPress',
          flaws: Array.isArray(rawP.flaws) ? rawP.flaws : (typeof rawP.flaws === 'string' ? rawP.flaws.split(';').map(s=>s.trim()).filter(Boolean) : []),
          notes: rawP.notes || ''
        };
        const idx = list.findIndex(p => p.id === sheetP.id || (p.site && sheetP.site && p.site === sheetP.site) || (p.phone && sheetP.phone && p.phone === sheetP.phone));
        if (idx !== -1) {
          const localP = list[idx];
          // Preserve ongoing caller lock and halt state to avoid overwriting human tele-dials
          if (localP.lockedBy) {
            sheetP.lockedBy = localP.lockedBy;
            sheetP.lockedEmail = localP.lockedEmail;
            sheetP.status = 'locked';
          }
          if (localP.aiHalted) {
            sheetP.aiHalted = true;
            sheetP.aiHaltedReason = localP.aiHaltedReason;
          }
          Object.assign(list[idx], sheetP);
          updatedCount++;
        } else {
          list.push(sheetP);
          addedCount++;
        }
      });

      if (typeof root.renderQueue === 'function') root.renderQueue();
      if (typeof root.selectProspect === 'function') root.selectProspect(list[0]?.id || "p-1");

      // Also sync to Cloud Firestore if active
      if (window.SALES_PLATFORM_AUTH?.getFirestore && root.currentUser) {
        try {
          const db = await window.SALES_PLATFORM_AUTH.getFirestore();
          const batch = db.batch();
          data.prospects.forEach(p => {
            const docRef = db.collection('prospects').doc(p.id);
            batch.set(docRef, p, { merge: true });
          });
          await batch.commit();
        } catch (fsErr) {
          console.warn('Firestore sync during Sheet pull:', fsErr.message);
        }
      }

      if (typeof root.showNotification === 'function') {
        root.showNotification(`[SUCCESS] Synced with Google Sheet! (${addedCount} added, ${updatedCount} updated)`);
      }
    } catch (err) {
      alert(`Google Sheets Sync Error: ${err.message}`);
    }
  }

  async function syncCallOutcomeToGoogleSheet(prospectId, updateData) {
    const url = getGoogleSheetsWebhookUrl();
    if (!url) return;
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          id: prospectId,
          status: updateData.status || '',
          notes: updateData.notes || '',
          lastCallTime: updateData.updatedAt || new Date().toISOString(),
          caller: updateData.updatedBy || root.currentUser?.name || 'Caller'
        })
      });
    } catch (e) {
      console.warn('Google Sheet background outcome sync:', e);
    }
  }

  function exportToGoogleSheetsCSV() {
    function escapeCsv(val) {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str}"`;
      return str;
    }

    const headers = ['ID', 'City', 'Company Name', 'Decision Maker', 'Phone', 'WhatsApp', 'Website', 'Category', 'Fee', 'Status', 'Speed Score', 'LCP Time', 'Tech Stack', 'Flaws', 'Notes', 'Last Call Time', 'Caller'];
    const rows = [headers.join(',')];

    const list = root.PROSPECTS || [];
    list.forEach(p => {
      rows.push([
        escapeCsv(p.id),
        escapeCsv(p.city),
        escapeCsv(p.name),
        escapeCsv(p.dm),
        escapeCsv(p.phone || p.tel || ''),
        escapeCsv(p.wa || p.whatsapp || p.phone || p.tel || ''),
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
      ].join(','));
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Client_Radar_GoogleSheet_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof root.showNotification === 'function') {
      root.showNotification('[SHEETS] Exported CSV for Google Sheets!');
    }
  }

  function openGoogleSheet1Click() {
    exportToGoogleSheetsCSV();
    window.open('https://sheets.new', '_blank');
    if (typeof root.showNotification === 'function') {
      root.showNotification('[SHEETS] Opening Google Sheets! In your new sheet, click File -> Import -> Upload and select the downloaded CSV.');
    }
  }

  function copyGoogleSheetsFormula() {
    const formula = `=IMPORTDATA("${window.location.origin}/Client_Radar_Prospects_GoogleSheet_Template.csv")`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(formula);
      if (typeof root.showNotification === 'function') {
        root.showNotification('[COPIED] Copied formula to clipboard! Paste in Cell A1 of your Google Sheet.');
      }
    } else {
      prompt('Copy this formula into Cell A1 of Google Sheets:', formula);
    }
  }

  function openCsvImportModal() {
    const modal = document.getElementById('csvImportModal');
    if (modal) modal.classList.remove('hidden');
  }

  function closeCsvImportModal() {
    const modal = document.getElementById('csvImportModal');
    if (modal) modal.classList.add('hidden');
  }

  function processCsvImportUI() {
    const textarea = document.getElementById('csvImportTextarea');
    const text = textarea ? textarea.value.trim() : '';
    if (!text) {
      alert('Please paste CSV text to import.');
      return;
    }

    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      alert('Invalid CSV format: Requires at least a header row and one data row.');
      return;
    }

    function parseCsvLine(line) {
      const result = [];
      let insideQuotes = false;
      let field = '';
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (insideQuotes && line[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            insideQuotes = !insideQuotes;
          }
        } else if (c === ',' && !insideQuotes) {
          result.push(field.trim());
          field = '';
        } else {
          field += c;
        }
      }
      result.push(field.trim());
      return result;
    }

    const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const idIdx = headers.findIndex(h => h === 'id');
    const cityIdx = headers.findIndex(h => h === 'city');
    const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('company'));
    const dmIdx = headers.findIndex(h => h.includes('dm') || h.includes('decision'));
    const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile'));
    const siteIdx = headers.findIndex(h => h.includes('site') || h.includes('web'));
    const catIdx = headers.findIndex(h => h.includes('cat'));
    const feeIdx = headers.findIndex(h => h.includes('fee'));
    const statusIdx = headers.findIndex(h => h.includes('status'));

    const list = root.PROSPECTS || [];
    let imported = 0;
    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i]);
      const name = nameIdx !== -1 ? row[nameIdx] : row[1];
      if (!name) continue;

      const id = (idIdx !== -1 && row[idIdx]) ? row[idIdx] : ('p-imp-' + Date.now() + '-' + i);
      const existingIdx = list.findIndex(p => p.id === id);

      const prospectObj = {
        id,
        city: (cityIdx !== -1 && row[cityIdx]) ? row[cityIdx] : 'Bangalore',
        name: name,
        dm: (dmIdx !== -1 && row[dmIdx]) ? row[dmIdx] : 'Director',
        phone: (phoneIdx !== -1 && row[phoneIdx]) ? row[phoneIdx] : '',
        wa: (phoneIdx !== -1 && row[phoneIdx]) ? row[phoneIdx].replace(/[^0-9]/g, '') : '',
        site: (siteIdx !== -1 && row[siteIdx]) ? row[siteIdx] : '',
        cat: (catIdx !== -1 && row[catIdx]) ? row[catIdx] : 'general',
        fee: (feeIdx !== -1 && row[feeIdx]) ? row[feeIdx] : '₹50,000',
        status: (statusIdx !== -1 && row[statusIdx]) ? row[statusIdx] : 'available',
        speedScore: '🔴 32/100 (Mobile)',
        lcpTime: 'LCP: 4.4s',
        techStack: 'WordPress',
        flaws: [],
        notes: ''
      };

      if (existingIdx !== -1) {
        Object.assign(list[existingIdx], prospectObj);
      } else {
        list.unshift(prospectObj);
      }
      imported++;
    }

    if (typeof root.saveCustomWorkers === 'function' && typeof root.getCustomWorkers === 'function') {
      root.saveCustomWorkers(root.getCustomWorkers());
    }
    if (typeof root.renderQueue === 'function') root.renderQueue();
    if (typeof root.selectProspect === 'function') root.selectProspect(list[0]?.id || "p-1");
    closeCsvImportModal();
    if (textarea) textarea.value = '';
    if (typeof root.showNotification === 'function') {
      root.showNotification(`[SUCCESS] Ingested ${imported} accounts from CSV into workspace!`);
    }
  }

  const WorkspaceSheetsEngine = {
    getGoogleSheetsWebhookUrl,
    initGoogleSheetsUI,
    saveGoogleSheetsWebhookUI,
    pullFromGoogleSheetUI,
    syncCallOutcomeToGoogleSheet,
    exportToGoogleSheetsCSV,
    openGoogleSheet1Click,
    copyGoogleSheetsFormula,
    openCsvImportModal,
    closeCsvImportModal,
    processCsvImportUI
  };

  root.WorkspaceSheetsEngine = WorkspaceSheetsEngine;
  root.getGoogleSheetsWebhookUrl = getGoogleSheetsWebhookUrl;
  root.initGoogleSheetsUI = initGoogleSheetsUI;
  root.saveGoogleSheetsWebhookUI = saveGoogleSheetsWebhookUI;
  root.pullFromGoogleSheetUI = pullFromGoogleSheetUI;
  root.syncCallOutcomeToGoogleSheet = syncCallOutcomeToGoogleSheet;
  root.exportToGoogleSheetsCSV = exportToGoogleSheetsCSV;
  root.openGoogleSheet1Click = openGoogleSheet1Click;
  root.copyGoogleSheetsFormula = copyGoogleSheetsFormula;
  root.openCsvImportModal = openCsvImportModal;
  root.closeCsvImportModal = closeCsvImportModal;
  root.processCsvImportUI = processCsvImportUI;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkspaceSheetsEngine;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
