// Client Radar — Executive Admin Workbench, Call Logs, Local Dispositions & Programmatic Agent API (Subsystem 16)
// Strictly On Apoorv's Behalf

(function(root) {
  const escapeHTML = (typeof root.escapeHTML === 'function') ? root.escapeHTML : function(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  };

  function getGlobalProspects() {
    return (typeof root.PROSPECTS !== 'undefined' && Array.isArray(root.PROSPECTS))
      ? root.PROSPECTS
      : ((typeof global !== 'undefined' && Array.isArray(global.PROSPECTS)) ? global.PROSPECTS : []);
  }

  function getCurrentUser() {
    return (typeof root.currentUser !== 'undefined' && root.currentUser)
      ? root.currentUser
      : ((typeof global !== 'undefined' && global.currentUser) ? global.currentUser : null);
  }

  function isApoorvOwnerEmailHelper(email) {
    if (typeof root.isApoorvOwnerEmail === 'function') return root.isApoorvOwnerEmail(email);
    if (typeof global !== 'undefined' && typeof global.isApoorvOwnerEmail === 'function') return global.isApoorvOwnerEmail(email);
    if (!email || typeof email !== 'string') return false;
    const n = email.toLowerCase().trim().replace(/\./g, '');
    return n === 'apoorvxs@gmailcom';
  }

  function isOwnerUserHelper(u) {
    if (typeof root.isOwnerUser === 'function') return root.isOwnerUser(u);
    if (typeof global !== 'undefined' && typeof global.isOwnerUser === 'function') return global.isOwnerUser(u);
    if (!u) return false;
    return u.role === 'owner' || isApoorvOwnerEmailHelper(u.email);
  }

  function playSFX(type) {
    if (typeof root.playSound === 'function') root.playSound(type);
    else if (typeof global !== 'undefined' && typeof global.playSound === 'function') global.playSound(type);
  }

  function notify(msg, type) {
    if (typeof root.showNotification === 'function') root.showNotification(msg, type);
    else if (typeof global !== 'undefined' && typeof global.showNotification === 'function') global.showNotification(msg, type);
  }

  function selectProspectHelper(id) {
    if (typeof root.selectProspect === 'function') return root.selectProspect(id);
    if (typeof global !== 'undefined' && typeof global.selectProspect === 'function') return global.selectProspect(id);
  }

  function renderQueueHelper() {
    if (typeof root.renderQueue === 'function') return root.renderQueue();
    if (typeof global !== 'undefined' && typeof global.renderQueue === 'function') return global.renderQueue();
  }

  function recordPartnerActivityHelper(type, id, details) {
    if (typeof root.recordPartnerActivity === 'function') return root.recordPartnerActivity(type, id, details);
    if (typeof global !== 'undefined' && typeof global.recordPartnerActivity === 'function') return global.recordPartnerActivity(type, id, details);
  }

  function stopBrainTelemetryPollingHelper() {
    if (typeof root.stopBrainTelemetryPolling === 'function') return root.stopBrainTelemetryPolling();
    if (typeof global !== 'undefined' && typeof global.stopBrainTelemetryPolling === 'function') return global.stopBrainTelemetryPolling();
  }

  function initGoogleSheetsUIHelper() {
    if (typeof root.initGoogleSheetsUI === 'function') return root.initGoogleSheetsUI();
    if (typeof global !== 'undefined' && typeof global.initGoogleSheetsUI === 'function') return global.initGoogleSheetsUI();
  }

  function initGeminiSettingsUIHelper() {
    if (typeof root.initGeminiSettingsUI === 'function') return root.initGeminiSettingsUI();
    if (typeof global !== 'undefined' && typeof global.initGeminiSettingsUI === 'function') return global.initGeminiSettingsUI();
  }

  function initFirebaseSyncHelper() {
    if (typeof root.initFirebaseSync === 'function') return root.initFirebaseSync();
    if (typeof global !== 'undefined' && typeof global.initFirebaseSync === 'function') return global.initFirebaseSync();
  }

  function renderAdminUsersListHelper() {
    if (typeof root.renderAdminUsersList === 'function') return root.renderAdminUsersList();
    if (typeof global !== 'undefined' && typeof global.renderAdminUsersList === 'function') return global.renderAdminUsersList();
  }

  function renderBrainStudioHelper() {
    if (typeof root.renderBrainStudio === 'function') return root.renderBrainStudio();
    if (typeof global !== 'undefined' && typeof global.renderBrainStudio === 'function') return global.renderBrainStudio();
  }

  function calculateUpgradeFeeHelper(techStack, lcpTime, flaws, category) {
    if (typeof root.calculateUpgradeFee === 'function') return root.calculateUpgradeFee(techStack, lcpTime, flaws, category);
    if (typeof global !== 'undefined' && typeof global.calculateUpgradeFee === 'function') return global.calculateUpgradeFee(techStack, lcpTime, flaws, category);
    return '₹50,000';
  }

  function deriveWastedSubscriptionsHelper(category, techStack, lcpTime, city, siteUrl) {
    if (typeof root.deriveWastedSubscriptions === 'function') return root.deriveWastedSubscriptions(category, techStack, lcpTime, city, siteUrl);
    if (typeof global !== 'undefined' && typeof global.deriveWastedSubscriptions === 'function') return global.deriveWastedSubscriptions(category, techStack, lcpTime, city, siteUrl);
    return { wastedSpend: 'N/A', wastedBreakdown: [], callerCheatSheet: {} };
  }

  function deriveSecurityVulnerabilitiesHelper(category, techStack, siteUrl) {
    if (typeof root.deriveSecurityVulnerabilities === 'function') return root.deriveSecurityVulnerabilities(category, techStack, siteUrl);
    if (typeof global !== 'undefined' && typeof global.deriveSecurityVulnerabilities === 'function') return global.deriveSecurityVulnerabilities(category, techStack, siteUrl);
    return { grade: 'MODERATE', score: '58/100' };
  }

  function deriveAdvancedGradingHelper(category, techStack, lcpTime, siteUrl) {
    if (typeof root.deriveAdvancedGrading === 'function') return root.deriveAdvancedGrading(category, techStack, lcpTime, siteUrl);
    if (typeof global !== 'undefined' && typeof global.deriveAdvancedGrading === 'function') return global.deriveAdvancedGrading(category, techStack, lcpTime, siteUrl);
    return {};
  }

  function getDialsTodayHelper() {
    if (typeof root.dialsToday !== 'undefined') return Number(root.dialsToday) || 0;
    if (typeof global !== 'undefined' && typeof global.dialsToday !== 'undefined') return Number(global.dialsToday) || 0;
    try {
      return parseInt(localStorage.getItem('sprintdial_dials_today') || '0', 10) || 0;
    } catch(e) {
      return 0;
    }
  }

  function setDialsTodayHelper(val) {
    if (typeof root.dialsToday !== 'undefined') root.dialsToday = val;
    if (typeof global !== 'undefined') global.dialsToday = val;
    try {
      const todayKey = `sprintdial_dials_${new Date().toISOString().slice(0, 10)}`;
      localStorage.setItem(todayKey, String(val));
      localStorage.setItem('sprintdial_dials_today', String(val));
    } catch(e) {}
  }

  function initEmailWarmupUIHelper() {
    if (typeof root.initEmailWarmupUI === 'function') return root.initEmailWarmupUI();
    if (typeof global !== 'undefined' && typeof global.initEmailWarmupUI === 'function') return global.initEmailWarmupUI();
  }

function saveDialsToday() {
  setDialsTodayHelper(getDialsTodayHelper());
}

function openAdminModal() {
  playSFX('click');
  const modal = document.getElementById('adminModal');
  if (!modal) return;
  initGoogleSheetsUIHelper();

  // Enforce executive access check
  const user = getCurrentUser();
  if (!isOwnerUserHelper(user)) {
    notify('Access denied. Admin Console is restricted exclusively to Apoorv (Owner).', 'error');
    return;
  }

  // Compute live metrics
  const prospects = getGlobalProspects();
  const totalLeads = prospects.length;
  const bookedLeads = prospects.filter(p => p.status === 'discovery_booked');
  const bookedCount = bookedLeads.length;
  const callbackCount = prospects.filter(p => p.status === 'connected_callback').length;
  const dncCount = prospects.filter(p => p.status === 'blacklisted').length;
  
  const pipelineVal = prospects.reduce((acc, p) => {
    const n = parseInt(String(p.fee || '50000').replace(/[^0-9]/g, ''), 10) || 50000;
    return acc + n;
  }, 0);
  const bookedVal = bookedLeads.reduce((acc, p) => {
    const n = parseInt(String(p.fee || '50000').replace(/[^0-9]/g, ''), 10) || 50000;
    return acc + n;
  }, 0);

  const elTotal = document.getElementById('adminTotalLeads');
  if (elTotal) elTotal.innerText = totalLeads;
  const elPipe = document.getElementById('adminPipelineVal');
  if (elPipe) elPipe.innerText = `₹${pipelineVal.toLocaleString('en-IN')} Pipeline`;
  const elDials = document.getElementById('adminDialsToday');
  if (elDials) elDials.innerText = getDialsTodayHelper();
  const elBooked = document.getElementById('adminBookedCount');
  if (elBooked) elBooked.innerText = bookedCount;
  const elBookedVal = document.getElementById('adminBookedVal');
  if (elBookedVal) elBookedVal.innerText = `₹${bookedVal.toLocaleString('en-IN')} Booked Value`;
  const elCb = document.getElementById('adminCallbackCount');
  if (elCb) elCb.innerText = callbackCount;
  const elDnc = document.getElementById('adminDncCount');
  if (elDnc) elDnc.innerText = `${dncCount} DNC Blacklisted`;

  // Populate Call Logs & Lead Explorer Table
  renderAdminCallLogs();

  modal.classList.remove('hidden');
}

function renderAdminCallLogs() {
  const tbody = document.getElementById('adminCallLogsBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const displayLeads = getGlobalProspects();

  displayLeads.forEach(p => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-white/[0.04] transition";

    let statusBadge = "bg-white/5 text-gray-400 border border-white/5";
    if (p.status === 'discovery_booked') statusBadge = "bg-emerald-950/60 text-emerald-300 border border-emerald-700";
    else if (p.status === 'connected_callback') statusBadge = "bg-blue-950/60 text-blue-300 border border-blue-700";
    else if (p.status === 'blacklisted') statusBadge = "bg-rose-950/60 text-rose-300 border border-rose-700";
    else if (p.status === 'gatekeeper_rejection') statusBadge = "bg-amber-950/60 text-amber-300 border border-amber-700";

    const isCustom = (p.id && String(p.id).startsWith('custom-')) || (typeof window !== 'undefined' && window.CUSTOM_PROSPECTS && window.CUSTOM_PROSPECTS.some(cp => cp.id === p.id));
    const sourceBadge = isCustom
      ? '<span class="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800 text-[9px] font-bold whitespace-nowrap">▲ Custom Ingest</span>'
      : '<span class="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-[9px] font-bold whitespace-nowrap">● Core Dataset</span>';

    const safeName = escapeHTML(p.name);
    const safeCity = escapeHTML(p.city);
    const safePtype = escapeHTML(p.ptype);
    const safeDm = escapeHTML(p.dm);
    const safePhone = escapeHTML(p.phone);
    const safeStatus = escapeHTML((p.status || 'available').replace('_', ' '));
    const safeNotes = p.notes ? `"${escapeHTML(p.notes)}"` : '';
    const safeDiscovery = p.discoveryTime ? `<div class="text-emerald-400 text-[10px] mt-0.5">CAL // ${escapeHTML(p.discoveryTime)}</div>` : '';

    tr.innerHTML = `
      <td class="p-2.5 sm:p-3">
        <div class="font-bold text-white text-xs sm:text-sm leading-tight">${safeName}</div>
        <div class="text-[10px] text-gray-400 mt-0.5">${safeCity} • ${safePtype}</div>
      </td>
      <td class="p-2.5 sm:p-3">
        <div class="text-gray-300 text-xs">${safeDm}</div>
        <div class="text-[10px] text-gray-500">${safePhone || 'No direct phone'}</div>
      </td>
      <td class="p-2.5 sm:p-3">
        <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold ${statusBadge}">
          ${safeStatus}
        </span>
      </td>
      <td class="p-2.5 sm:p-3 text-[10px]">
        <div>${sourceBadge}</div>
        ${safeNotes ? `<div class="text-slate-400 mt-1 truncate max-w-[180px] italic">${safeNotes}</div>` : ''}
        ${safeDiscovery}
      </td>
      <td class="p-2.5 sm:p-3 text-right">
        <button class="open-lead-btn px-2.5 py-1 rounded bg-blue-600/40 hover:bg-blue-600 text-white border border-blue-400/50 text-[10px] font-bold transition cursor-pointer whitespace-nowrap">
          Open Lead →
        </button>
      </td>
    `;
    const openBtn = tr.querySelector('.open-lead-btn');
    if (openBtn) {
      openBtn.onclick = () => selectProspectFromAdmin(p.id);
    }
    tbody.appendChild(tr);
  });
}

function closeAdminModal() {
  playSFX('click');
  stopBrainTelemetryPollingHelper();
  const modal = document.getElementById('adminModal');
  if (modal) modal.classList.add('hidden');
}

function selectProspectFromAdmin(id) {
  closeAdminModal();
  selectProspectHelper(id);
}

function switchAdminTab(tab) {
  playSFX('click');
  const tabLogs = document.getElementById('adminTabLogs');
  const tabIngest = document.getElementById('adminTabIngest');
  const tabGemini = document.getElementById('adminTabGemini');
  const tabSync = document.getElementById('adminTabSync');
  const tabUsers = document.getElementById('adminTabUsers');
  const tabBrain = document.getElementById('adminTabBrain');
  const tabWarmup = document.getElementById('adminTabWarmup');
  const btnLogs = document.getElementById('btnAdminTabLogs');
  const btnIngest = document.getElementById('btnAdminTabIngest');
  const btnGemini = document.getElementById('btnAdminTabGemini');
  const btnSync = document.getElementById('btnAdminTabSync');
  const btnUsers = document.getElementById('btnAdminTabUsers');
  const btnBrain = document.getElementById('btnAdminTabBrain');
  const btnWarmup = document.getElementById('btnAdminTabWarmup');

  // Hide all tabs
  if (tabLogs) tabLogs.classList.add('hidden');
  if (tabIngest) tabIngest.classList.add('hidden');
  if (tabGemini) tabGemini.classList.add('hidden');
  if (tabSync) tabSync.classList.add('hidden');
  if (tabUsers) tabUsers.classList.add('hidden');
  if (tabBrain) tabBrain.classList.add('hidden');
  if (tabWarmup) tabWarmup.classList.add('hidden');

  // Reset button styles
  const inactiveBtnClass = "admin-tab-btn px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium text-neutral-400 hover:text-white transition flex items-center gap-1 border border-transparent shrink-0";
  const activeBtnClass = "admin-tab-btn active px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold text-neutral-950 bg-white shadow-sm transition flex items-center gap-1 shrink-0";

  if (btnLogs) btnLogs.className = inactiveBtnClass;
  if (btnIngest) btnIngest.className = inactiveBtnClass;
  if (btnGemini) btnGemini.className = inactiveBtnClass;
  if (btnSync) btnSync.className = inactiveBtnClass;
  if (btnUsers) btnUsers.className = inactiveBtnClass;
  if (btnBrain) btnBrain.className = inactiveBtnClass;
  if (btnWarmup) btnWarmup.className = inactiveBtnClass;

  if (tab === 'gemini') {
    if (tabGemini) tabGemini.classList.remove('hidden');
    if (btnGemini) btnGemini.className = activeBtnClass;
    initGeminiSettingsUIHelper();
  } else if (tab === 'ingest') {
    if (tabIngest) tabIngest.classList.remove('hidden');
    if (btnIngest) btnIngest.className = activeBtnClass;
  } else if (tab === 'sync') {
    if (tabSync) tabSync.classList.remove('hidden');
    if (btnSync) btnSync.className = activeBtnClass;
    initFirebaseSyncHelper();
  } else if (tab === 'users') {
    if (tabUsers) tabUsers.classList.remove('hidden');
    if (btnUsers) btnUsers.className = activeBtnClass;
    renderAdminUsersListHelper();
  } else if (tab === 'brain') {
    if (tabBrain) tabBrain.classList.remove('hidden');
    if (btnBrain) btnBrain.className = activeBtnClass;
    renderBrainStudioHelper();
  } else if (tab === 'warmup') {
    if (tabWarmup) tabWarmup.classList.remove('hidden');
    if (btnWarmup) btnWarmup.className = activeBtnClass;
    initEmailWarmupUIHelper();
  } else {
    if (tabLogs) tabLogs.classList.remove('hidden');
    if (btnLogs) btnLogs.className = activeBtnClass;
    if (typeof root.renderAdminAuditTable === 'function') root.renderAdminAuditTable();
    else if (typeof global !== 'undefined' && typeof global.renderAdminAuditTable === 'function') global.renderAdminAuditTable();
    renderAdminCallLogs();
  }
}

function exportCallDataToCSV() {
  playSFX('click');
  const allLeads = getGlobalProspects();
  recordPartnerActivityHelper('CSV_EXPORT', null, { count: allLeads.length, territory: 'Admin All Leads' });
  const headers = ['ID', 'City', 'Name', 'Decision Maker', 'Phone', 'Website', 'Category', 'Project Type', 'Status', 'Call Notes', 'Discovery Meeting Time', 'Fee'];
  const rows = allLeads.map(p => [
    `"${p.id}"`,
    `"${p.city}"`,
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${(p.dm || '').replace(/"/g, '""')}"`,
    `"${p.phone || ''}"`,
    `"${p.site || ''}"`,
    `"${p.cat || ''}"`,
    `"${p.ptype || ''}"`,
    `"${p.status || 'available'}"`,
    `"${(p.notes || '').replace(/"/g, '""')}"`,
    `"${p.discoveryTime || ''}"`,
    `"${p.fee || '₹50,000'}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `workbench_report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  notify('[EXPORT] CSV Report exported successfully!');
}

function resetLocalDispositions() {
  if (confirm('Are you sure you want to reset all local dispositions, notes, and dials today?')) {
    localStorage.removeItem('sprintdial_lead_overrides');
    localStorage.removeItem('sprintdial_dials_today');
    const todayKey = `sprintdial_dials_${new Date().toISOString().slice(0, 10)}`;
    localStorage.removeItem(todayKey);
    setDialsTodayHelper(0);
    if (typeof root.updateDialProgress === 'function') root.updateDialProgress();
    else if (typeof global !== 'undefined' && typeof global.updateDialProgress === 'function') global.updateDialProgress();
    location.reload();
  }
}

function insertSampleProspectTemplate() {
  const sample = {
    "city": "Kochi",
    "name": "Aster Medcity Specialty Dental, Cheranallur",
    "dm": "Dr. Varghese Mathew (Head of Dental Sciences)",
    "phone": "+91 94477 99881",
    "site": "https://www.astermedcity.com/dental",
    "cat": "clinic",
    "ptype": "UPGRADE",
    "fee": "₹50,000",
    "speedScore": "🔴 29/100 (Mobile)",
    "lcpTime": "LCP: 4.6s",
    "techStack": "Drupal / Custom CMS",
    "flaws": [
      "Mobile LCP 4.6s (Drupal cellular 4G latency)",
      "Static appointment inquiry forms with zero calendar sync",
      "Missing interactive 3D treatment procedure showcase"
    ],
    "scripts": {
      "speed": {
        "en": "Good morning, calling on Apoorv's behalf for Dr. Varghese Mathew. Apoorv audited your mobile website and noted loading takes 4.6s, causing high-intent prospective patients to drop off before booking. Apoorv prepared an executive mobile performance teardown (normally our ₹4,999 audit, which we're sharing complimentary) to maximize direct patient intake.",
        "ml": "നമസ്കാരം, ഞാൻ അപൂർവിന് വേണ്ടിയാണ് വിളിക്കുന്നത് (on Apoorv's behalf). ഡോ. വർഗീസ് മാത്യുവിനോട് ഒരു മിനിറ്റ് സംസാരിക്കാമോ? നിങ്ങളുടെ വെബ്സൈറ്റിന്റെ മൊബൈൽ സ്പീഡും ഡയറക്ട് ബുക്കിംഗും വർദ്ധിപ്പിക്കാൻ അപൂർവ് തയ്യാറാക്കിയ എക്സിക്യൂട്ടീവ് പെർഫോമൻസ് ഓഡിറ്റ് (സാധാരണ ₹4,999 ചാർജ് ചെയ്യുന്നത് സൗജന്യമായി) പങ്കുവെക്കാനാണ്.",
        "manglish": "Namaskaram, njan Apoorv-nu vendiyanu vilikkunnathu. Dr. Varghese Mathew-nodu website mobile speed-um direct booking-um maximize cheyyaan Apoorv tayyarakkiya technical audit (normally ₹4,999 value ullathaanu, complimentary aayi share cheyyaam) discuss cheyyan samayam undo?"
      },
      "commission": {
        "en": "Good morning, calling on Apoorv's behalf. We help premier clinics stop bleeding 20% commission to Practo by converting direct website visitors instantly into confirmed appointments.",
        "ml": "നമസ്കാരം, പ്രാക്ടോ പോലുള്ള അഗ്രിഗേറ്ററുകൾക്ക് 20% കമ്മീഷൻ കൊടുക്കുന്നത് ഒഴിവാക്കി നേരിട്ട് വെബ്സൈറ്റിലൂടെ പേഷ്യന്റ് ബുക്കിംഗ് നേടാൻ സഹായിക്കുന്ന സിസ്റ്റത്തെ കുറിച്ച് സംസാരിക്കാനാണ്.",
        "manglish": "Namaskaram, Practo commission ozhivakki direct intake portals vazhi direct bookings nedan Apoorv-umayi samsarikkan samayam tharamo?"
      },
      "visual": {
        "en": "Good morning, calling on Apoorv's behalf. For an institution of your prestige, flat text no longer commands attention. Apoorv designs interactive 3D treatment showcases that elevate brand authority.",
        "ml": "നമസ്കാരം, അപൂർവിന് വേണ്ടിയാണ് വിളിക്കുന്നത്. പ്രീമിയം ബ്രാൻഡുകൾക്ക് രോഗികൾക്ക് വിഷ്വൽ എക്സ്പീരിയൻസ് നൽകുന്ന 3D ഇന്ററാക്ടീവ് വെബ്സൈറ്റുകളാണ് അപൂർവ് ഡിസൈൻ ചെയ്യുന്നത്.",
        "manglish": "Namaskaram, Aster polulla premium brand-nu flat site alla, high-end 3D web experience aanu Apoorv build cheyyunnathu."
      },
      "gatekeeper": "Good morning, I'm calling on Apoorv's behalf for Dr. Varghese Mathew regarding patient appointment drop-offs on your mobile website. Could you connect me to their desk?"
    },
    "waMessage": "നമസ്കാരം Dr. Varghese Mathew, Aster Medcity Specialty Dental-ന്റെ വെബ്സൈറ്റ് പെർഫോമൻസിനെ കുറിച്ച് അപൂർവിന് വേണ്ടി വിളിച്ചിരുന്നു. മൊബൈൽ സ്പീഡും ഡയറക്ട് ബുക്കിംഗും വർദ്ധിപ്പിക്കാൻ അപൂർവ് തയ്യാറാക്കിയ എക്സിക്യൂട്ടീവ് പെർഫോമൻസ് ഓഡിറ്റ് (സാധാരണ ₹4,999 ചാർജ് ചെയ്യുന്നത്, കോംപ്ലിമെന്ററിയായി) ഷെയർ ചെയ്യാനാണ്. ഈ വ്യാഴാഴ്ച 10 മിനിറ്റ് ഡിസ്കവറി കോളിനായി എപ്പോഴാണ് സമയം ലഭിക്കുക? - അപൂർവിന് വേണ്ടി."
  };

  const agentInput = document.getElementById('agentJsonInput');
  if (agentInput) agentInput.value = JSON.stringify(sample, null, 2);
}

function ingestAgentProspects() {
  const agentInput = document.getElementById('agentJsonInput');
  const raw = agentInput ? agentInput.value.trim() : '';
  if (!raw) {
    alert('Please enter or paste valid prospect JSON.');
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : [parsed];
    let addedCount = 0;

    items.forEach(item => {
      const added = (typeof window !== 'undefined' && window.sprintdial?.addProspect)
        ? window.sprintdial.addProspect(item)
        : (typeof root.sprintdial?.addProspect ? root.sprintdial.addProspect(item) : null);
      if (added) addedCount++;
    });

    if (agentInput) agentInput.value = '';
    switchAdminTab('logs');
    openAdminModal();
    notify(`[AI] Successfully ingested ${addedCount} prospect(s) into the queue!`);
  } catch (err) {
    alert(`Invalid JSON format: ${err.message}`);
  }
}

// Fee Calculator based on Work Needed & Technical Scope
// Intelligence Derivation & Grading Helpers (Delegated to workspace/queue_engine.js)
function calculateUpgradeFee(techStack, lcpTime, flaws, category) {
  const fn = (typeof window !== "undefined" && window.WorkspaceQueueEngine?.calculateUpgradeFee) || (typeof global !== "undefined" && global.WorkspaceQueueEngine?.calculateUpgradeFee);
  if (fn) return fn(techStack, lcpTime, flaws, category);
  return "₹50,000";
}

function deriveWastedSubscriptions(category, techStack, lcpTime, city, siteUrl) {
  const fn = (typeof window !== "undefined" && window.WorkspaceQueueEngine?.deriveWastedSubscriptions) || (typeof global !== "undefined" && global.WorkspaceQueueEngine?.deriveWastedSubscriptions);
  if (fn) return fn(category, techStack, lcpTime, city, siteUrl);
  return { wastedSpend: "₹42,000/yr", wastedBreakdown: [], callerCheatSheet: {} };
}

function deriveSecurityVulnerabilities(category, techStack, siteUrl) {
  const fn = (typeof window !== "undefined" && window.WorkspaceQueueEngine?.deriveSecurityVulnerabilities) || (typeof global !== "undefined" && global.WorkspaceQueueEngine?.deriveSecurityVulnerabilities);
  if (fn) return fn(category, techStack, siteUrl);
  return { grade: "MODERATE", score: "58/100" };
}

function deriveAdvancedGrading(category, techStack, lcpTime, siteUrl) {
  const fn = (typeof window !== "undefined" && window.WorkspaceQueueEngine?.deriveAdvancedGrading) || (typeof global !== "undefined" && global.WorkspaceQueueEngine?.deriveAdvancedGrading);
  if (fn) return fn(category, techStack, lcpTime, siteUrl);
  return {};
}

// ==========================================
// EXPOSED API FOR GEMINI SPARK & AGENTIC TOOLS
// ==========================================
window.sprintdial = {
  addProspect: function(data) {
    if (!data.name || !data.city || !data.phone) {
      console.error('Prospect must have at least name, city, and phone');
      return null;
    }

    const cleanPhone = String(data.phone).replace(/[^0-9]/g, '');
    const isNoSite = !data.site || data.site === '#' || data.ptype === 'STARTER' || (data.techStack && data.techStack.toLowerCase().includes('no owned'));
    const calculatedFee = data.fee || (isNoSite ? "₹50,000" : calculateUpgradeFee(data.techStack, data.lcpTime, data.flaws, data.cat));
    const wasteIntel = deriveWastedSubscriptions(data.cat, data.techStack, data.lcpTime, data.city, isNoSite ? '#' : data.site);
    const secIntel = deriveSecurityVulnerabilities(data.cat, data.techStack, isNoSite ? '#' : data.site);
    const advGrading = deriveAdvancedGrading(data.cat, data.techStack, data.lcpTime, isNoSite ? '#' : data.site);
    const prospect = {
      id: data.id || `custom-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      city: data.city,
      name: data.name,
      dm: data.dm || "Management / Owner",
      phone: data.phone,
      tel: data.tel || (cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`),
      wa: data.wa || (cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`),
      site: isNoSite ? "#" : data.site,
      ptype: isNoSite ? "STARTER" : (data.ptype || "UPGRADE"),
      fee: calculatedFee,
      cat: data.cat || "general",
      wastedSpend: data.wastedSpend || wasteIntel.wastedSpend,
      wastedBreakdown: data.wastedBreakdown || wasteIntel.wastedBreakdown,
      callerCheatSheet: data.callerCheatSheet || wasteIntel.callerCheatSheet,
      securityAudit: data.securityAudit || secIntel,
      revenueLeak: data.revenueLeak || advGrading.revenueLeak,
      revenueLeakNumeric: data.revenueLeakNumeric || advGrading.revenueLeakNumeric,
      dpdpCompliance: data.dpdpCompliance || advGrading.dpdpCompliance,
      thumbZone: data.thumbZone || advGrading.thumbZone,
      bookingFriction: data.bookingFriction || advGrading.bookingFriction,
      reputationBridge: data.reputationBridge || advGrading.reputationBridge,
      speedScore: data.speedScore || (isNoSite ? "N/A (No Owned Site)" : "🔴 30/100 (Mobile)"),
      lcpTime: data.lcpTime || (isNoSite ? "LCP: N/A" : "LCP: 4.5s"),
      techStack: data.techStack || (isNoSite ? "No Owned Domain (Aggregators Only)" : "WordPress / Elementor"),
      status: "available",
      lockedBy: null,
      lockedEmail: null,
      flaws: data.flaws || (isNoSite ? [
        "Zero owned domain (100% trapped on aggregator directory)",
        "No direct 1-tap WhatsApp consultation intake",
        "Competitors advertised directly beneath your Google profile",
        "Zero patient data ownership & DPDP compliance vulnerability"
      ] : [
        (data.lcpTime || "LCP: 4.5s") + " (Mobile cellular 4G drag)",
        "Passive intake form with zero calendar sync",
        "Lacks full-screen 3D interactive showcase"
      ]),
      scripts: data.scripts || (isNoSite ? {
        speed: {
          en: `Good morning, calling on Apoorv's behalf for ${data.dm || 'the Director'} regarding ${data.name}. When customers search for you on Google, you currently lack an owned direct website—forcing customers into middleman aggregators. Apoorv prepared an executive digital intake teardown (normally a $1,500 diagnostic, shared complimentary) showing how to capture direct bookings with zero commissions. Would you have 10 minutes this Thursday?`,
          ml: `നമസ്കാരം, ഞാൻ അപൂർവിന് വേണ്ടിയാണ് വിളിക്കുന്നത് (calling on Apoorv's behalf). ${data.dm}-നോട് ഒരു മിനിറ്റ് സംസാരിക്കാമോ? ഗൂഗിളിൽ നിങ്ങളുടെ സ്ഥാപനം തിരയുന്നവർക്ക് നേരിട്ട് ബുക്ക് ചെയ്യാൻ സ്വന്തമായി വെബ്‌സൈറ്റില്ലാത്തതിനാൽ അഗ്രിഗേറ്ററുകൾക്ക് 15-25% കമ്മീഷൻ നൽകേണ്ടിവരുന്നത് ഒഴിവാക്കാൻ അപൂർവ് തയ്യാറാക്കിയ എക്സിക്യൂട്ടീവ് ഡിജിറ്റൽ ഇൻടേക്ക് ഓഡിറ്റ് (സാധാരണ $1,500 വാല്യൂ ഉള്ളത് സൗജന്യമായി) പങ്കുവെക്കാനാണ്.`,
          manglish: `Namaskaram, Apoorv-nu vendiyaanu njan vilikkunnathu. ${data.dm}-nodu own website illathathinaal aggregator commission bleed ozhivakki direct bookings capture cheyyaan Apoorv tayyarakkiya digital intake audit (normally $1,500 value ullathaanu, complimentary aayi share cheyyaam) discuss cheyyan samayam tharamo?`
        },
        commission: {
          en: `Good morning, calling on Apoorv's behalf for ${data.dm}. We build direct client intake portals that eliminate 15-25% aggregator commission bleed. Would you be open to a 10-minute call this week?`,
          ml: `നമസ്കാരം, അപൂർവിന് വേണ്ടിയാണ് വിളിക്കുന്നത്. അഗ്രിഗേറ്ററുകൾക്ക് 15-25% കമ്മീഷൻ കൊടുക്കുന്നത് ഒഴിവാക്കി നേരിട്ട് വെബ്സൈറ്റിലൂടെ ബുക്കിംഗ് നേടാൻ സഹായിക്കുന്ന സംവിധാനങ്ങളെ കുറിച്ച് സംസാരിക്കാനാണ്.`,
          manglish: `Namaskaram, aggregator commission ozhivakki direct intake portals vazhi revenue kootan Apoorv-umayi samsarikkan samayam labhikkumo?`
        },
        visual: {
          en: `Good morning, calling on Apoorv's behalf for ${data.dm}. Apoorv specializes in modern interactive 3D web experiences that elevate brand prestige and justify high-ticket pricing. Can I share a sample?`,
          ml: `നമസ്കാരം, അപൂർവിന് വേണ്ടിയാണ് വിളിക്കുന്നത്. ${data.name} പോലൊരു പ്രീമിയം ബ്രാൻഡിന് കസ്റ്റമേഴ്‌സിന് നേരിട്ട് അനുഭവിക്കാൻ പറ്റുന്ന 3D ഇന്ററാക്ടീവ് വെബ്‌സൈറ്റുകളാണ് അപൂർവ് ഡിസൈൻ ചെയ്യുന്നത്.`,
          manglish: `Namaskaram, ${data.name}-nu interactive 3D web experience design cheyyunnathu kaanichutharan 10 minute samayam tharamo?`
        },
        gatekeeper: `Good morning, I'm calling on Apoorv's behalf for ${data.dm} regarding client appointment drop-offs to third-party aggregators. Could you connect me to their office?`
      } : {
        speed: {
          en: `Good morning, calling on Apoorv's behalf for ${data.dm || 'the Director'}. Apoorv audited your mobile website and noted slow loading causing high drop-off. Apoorv prepared an executive performance teardown (normally our $1,500 audit, shared complimentary) to maximize direct bookings. Would you have 10 minutes this Thursday?`,
          ml: `നമസ്കാരം, ഞാൻ അപൂർവിന് വേണ്ടിയാണ് വിളിക്കുന്നത് (calling on Apoorv's behalf). ${data.dm}-നോട് ഒരു മിനിറ്റ് സംസാരിക്കാമോ? നിങ്ങളുടെ വെബ്സൈറ്റ് സ്പീഡും ഡയറക്ട് ബുക്കിംഗും വർദ്ധിപ്പിക്കാൻ അപൂർവ് തയ്യാറാക്കിയ എക്സിക്യൂട്ടീവ് പെർഫോമൻസ് ഓഡിറ്റ് (സാധാരണ $1,500 വാല്യൂ ഉള്ളത് സൗജന്യമായി) പങ്കുവെക്കാനാണ്.`,
          manglish: `Namaskaram, Apoorv-nu vendiyaanu njan vilikkunnathu. ${data.dm}-nodu website speed-um direct bookings-um maximize cheyyaan Apoorv tayyarakkiya technical audit (normally $1,500 value ullathaanu, complimentary aayi share cheyyaam) discuss cheyyan samayam tharamo?`
        },
        commission: {
          en: `Good morning, calling on Apoorv's behalf for ${data.dm}. We build direct client intake portals that eliminate 15-25% aggregator commission bleed. Would you be open to a 10-minute call this week?`,
          ml: `നമസ്കാരം, അപൂർവിന് വേണ്ടിയാണ് വിളിക്കുന്നത്. അഗ്രിഗേറ്ററുകൾക്ക് 15-25% കമ്മീഷൻ കൊടുക്കുന്നത് ഒഴിവാക്കി നേരിട്ട് വെബ്സൈറ്റിലൂടെ ബുക്കിംഗ് നേടാൻ സഹായിക്കുന്ന സംവിധാനങ്ങളെ കുറിച്ച് സംസാരിക്കാനാണ്.`,
          manglish: `Namaskaram, aggregator commission ozhivakki direct intake portals vazhi revenue kootan Apoorv-umayi samsarikkan samayam labhikkumo?`
        },
        visual: {
          en: `Good morning, calling on Apoorv's behalf for ${data.dm}. Apoorv specializes in modern interactive 3D web experiences that elevate brand prestige and justify high-ticket pricing. Can I share a sample?`,
          ml: `നമസ്കാരം, അപൂർവിന് വേണ്ടിയാണ് വിളിക്കുന്നത്. ${data.name} പോലൊരു പ്രീമിയം ബ്രാൻഡിന് കസ്റ്റമേഴ്‌സിന് നേരിട്ട് അനുഭവിക്കാൻ പറ്റുന്ന 3D ഇന്ററാക്ടീവ് വെബ്‌സൈറ്റുകളാണ് അപൂർവ് ഡിസൈൻ ചെയ്യുന്നത്.`,
          manglish: `Namaskaram, ${data.name}-nu interactive 3D web experience design cheyyunnathu kaanichutharan 10 minute samayam tharamo?`
        },
        gatekeeper: `Good morning, I'm calling on Apoorv's behalf for ${data.dm} regarding client drop-offs on your mobile website. Could you connect me to their office?`
      }),
      waMessage: data.waMessage || (isNoSite ? (data.city === 'Kochi'
        ? `നമസ്കാരം ${(data.dm || 'Doctor / Owner').split('(')[0].trim()}, ${(data.name || 'Establishment').split(',')[0].trim()}-ന്റെ ഡിജിറ്റൽ ഇൻടേക്കിനെ കുറിച്ച് അപൂർവിന് വേണ്ടി വിളിച്ചിരുന്നു. സ്വന്തമായി വെബ്‌സൈറ്റില്ലാത്തതിനാൽ അഗ്രിഗേറ്ററുകൾക്ക് 15-25% കമ്മീഷൻ നഷ്ടപ്പെടുന്നതും (${wasteIntel.wastedSpend || 'N/A'}), ഡാറ്റ കസ്റ്റഡി ഇല്ലാത്തതും ഒഴിവാക്കാൻ അപൂർവ് തയ്യാറാക്കിയ ₹4,999 ഓഡിറ്റ് സൗജന്യമായി പങ്കുവെക്കാനാണ്. ഈ വ്യാഴാഴ്ച 10 മിനിറ്റ് സംസാരിക്കാമോ? - അപൂർവിന് വേണ്ടി.`
        : `Hi ${(data.dm || 'Doctor / Owner').split('(')[0].trim()}, following up on our call on Apoorv's behalf regarding ${(data.name || 'Establishment').split(',')[0].trim()}. Apoorv noted you currently lack an owned direct website, leaving bookings at risk to aggregators (${wasteIntel.wastedSpend || 'N/A'}). Apoorv prepared an executive audit covering direct intake portals (${calculatedFee} turnkey package, ₹4,999 audit waived). Would Thursday 4 PM suit you for a brief 10-min walkthrough with Apoorv?`)
        : (data.city === 'Kochi'
        ? `നമസ്കാരം ${(data.dm || 'Doctor / Owner').split('(')[0].trim()}, ${(data.name || 'Establishment').split(',')[0].trim()}-ന്റെ വെബ്സൈറ്റ് പെർഫോമൻസിനെ കുറിച്ച് അപൂർവിന് വേണ്ടി വിളിച്ചിരുന്നു. മൊബൈലിൽ ${data.lcpTime || 'N/A'} 4G ലേറ്റൻസിയും (${advGrading.revenueLeak || 'N/A'} നഷ്ടം), ${wasteIntel.wastedSpend || 'N/A'} പാഴാകുന്നതും ശ്രദ്ധയിൽപ്പെട്ടു. കൂടാതെ DPDP Act (${advGrading.dpdpCompliance?.status || 'N/A'}) കംപ്ലയൻസും ${calculatedFee} ബജറ്റിൽ നേരിട്ടുള്ള ബുക്കിംഗ് സിസ്റ്റവും ഒരുക്കാൻ അപൂർവ് തയ്യാറാക്കിയ ₹4,999 ഓഡിറ്റ് സൗജന്യമായി പങ്കുവെക്കാനാണ്. ഈ വ്യാഴാഴ്ച 10 മിനിറ്റ് സംസാരിക്കാമോ? - അപൂർവിന് വേണ്ടി.`
        : `Hi ${(data.dm || 'Doctor / Owner').split('(')[0].trim()}, following up on our call on Apoorv's behalf regarding ${(data.name || 'Establishment').split(',')[0].trim()}. Apoorv noted your mobile LCP takes ${data.lcpTime || 'N/A'} on 4G (est. ${advGrading.revenueLeak || 'N/A'} drop-off) and ${wasteIntel.wastedSpend || 'N/A'} aggregator bleed. Apoorv prepared an executive audit covering DPDP Act compliance (${advGrading.dpdpCompliance?.status || 'N/A'}) and direct intake portals (${calculatedFee} scope, ₹4,999 audit waived). Would Thursday 4 PM suit you for a brief 10-min walkthrough with Apoorv?`))
    };

    const allLeads = getGlobalProspects();
    allLeads.unshift(prospect);

    // Save to localStorage
    try {
      const customList = JSON.parse(localStorage.getItem('sprintdial_custom_prospects') || '[]');
      customList.unshift(prospect);
      localStorage.setItem('sprintdial_custom_prospects', JSON.stringify(customList));
    } catch(e) {}

    renderQueueHelper();
    selectProspectHelper(prospect.id);
    return prospect;
  },

  getProspects: function() {
    return getGlobalProspects();
  },

  exportCSV: function() {
    exportCallDataToCSV();
  },

  getStats: function() {
    const allLeads = getGlobalProspects();
    return {
      total: allLeads.length,
      dialsToday: getDialsTodayHelper(),
      booked: allLeads.filter(p => p.status === 'discovery_booked').length,
      callbacks: allLeads.filter(p => p.status === 'connected_callback').length,
      blacklisted: allLeads.filter(p => p.status === 'blacklisted').length,
      available: allLeads.filter(p => p.status === 'available').length
    };
  }
};
window.clientRadar = window.sprintdial;


  const WorkspaceAdminConsole = {
    saveDialsToday,
    openAdminModal,
    renderAdminCallLogs,
    closeAdminModal,
    selectProspectFromAdmin,
    switchAdminTab,
    exportCallDataToCSV,
    resetLocalDispositions,
    insertSampleProspectTemplate,
    ingestAgentProspects
  };

  root.WorkspaceAdminConsole = WorkspaceAdminConsole;
  root.saveDialsToday = saveDialsToday;
  root.openAdminModal = openAdminModal;
  root.renderAdminCallLogs = renderAdminCallLogs;
  root.closeAdminModal = closeAdminModal;
  root.selectProspectFromAdmin = selectProspectFromAdmin;
  root.switchAdminTab = switchAdminTab;
  root.exportCallDataToCSV = exportCallDataToCSV;
  root.resetLocalDispositions = resetLocalDispositions;
  root.insertSampleProspectTemplate = insertSampleProspectTemplate;
  root.ingestAgentProspects = ingestAgentProspects;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkspaceAdminConsole;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
