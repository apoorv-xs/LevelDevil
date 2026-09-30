// Client Radar — Guided In-Call Workflow & Mandatory Disposition Gate Engine (Subsystem 18)
// Strictly On Apoorv's Behalf

(function(root) {
  const escapeHTML = (typeof root.escapeHTML === 'function') ? root.escapeHTML : function(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  };

  let activeScriptMode = "pitch"; // "pitch" or "gatekeeper"
  let activeAngle = "speed"; // "speed", "commission", "visual"
  let activeLang = "en";
  let analogyLang = "en";
  let activeAnalogyKey = "lcp";
  let activeObjectionIndex = null;
  let objectionLang = "en";

  let callTimerInterval = null;
  let callSeconds = 0;
  let isCallActive = false;
  let callPendingDisposition = false;
  let activeCallProspectId = null;
  let currentCallReach = null;
  let currentCallOutcome = null;

  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;
  let recordedAudioBlob = null;

  function getGlobalProspects() {
    return (typeof root.PROSPECTS !== 'undefined' && Array.isArray(root.PROSPECTS))
      ? root.PROSPECTS
      : ((typeof global !== 'undefined' && Array.isArray(global.PROSPECTS)) ? global.PROSPECTS : []);
  }

  function getSelectedId() {
    return (typeof root.selectedProspectId !== 'undefined' && root.selectedProspectId)
      ? root.selectedProspectId
      : ((typeof global !== 'undefined' && global.selectedProspectId) ? global.selectedProspectId : 'p-1');
  }

  function getDialsToday() {
    if (typeof root.dialsToday !== 'undefined') return Number(root.dialsToday) || 0;
    if (typeof global !== 'undefined' && typeof global.dialsToday !== 'undefined') return Number(global.dialsToday) || 0;
    return 0;
  }

  function setDialsToday(val) {
    root.dialsToday = val;
    if (typeof window !== 'undefined') window.dialsToday = val;
    if (typeof global !== 'undefined') global.dialsToday = val;
  }

  function saveDialsTodayHelper() {
    if (typeof root.saveDialsToday === 'function') root.saveDialsToday();
    else if (typeof global !== 'undefined' && typeof global.saveDialsToday === 'function') global.saveDialsToday();
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

  function notify(msg) {
    if (typeof root.showNotification === 'function') root.showNotification(msg);
    else if (typeof global !== 'undefined' && typeof global.showNotification === 'function') global.showNotification(msg);
  }

  function saveLeadOverrideHelper(id, updates) {
    if (typeof root.saveLeadOverride === 'function') return root.saveLeadOverride(id, updates);
    if (typeof global !== 'undefined' && typeof global.saveLeadOverride === 'function') return global.saveLeadOverride(id, updates);
  }

  function broadcastLockHelper(id) {
    if (typeof root.broadcastLock === 'function') return root.broadcastLock(id);
    if (typeof global !== 'undefined' && typeof global.broadcastLock === 'function') return global.broadcastLock(id);
  }

  function broadcastUnlockHelper(id, status) {
    if (typeof root.broadcastUnlock === 'function') return root.broadcastUnlock(id, status);
    if (typeof global !== 'undefined' && typeof global.broadcastUnlock === 'function') return global.broadcastUnlock(id, status);
  }

  function broadcastDNCHelper(id) {
    if (typeof root.broadcastDNC === 'function') return root.broadcastDNC(id);
    if (typeof global !== 'undefined' && typeof global.broadcastDNC === 'function') return global.broadcastDNC(id);
  }

  function renderActiveProspectHelper() {
    if (typeof root.renderActiveProspect === 'function') return root.renderActiveProspect();
    if (typeof global !== 'undefined' && typeof global.renderActiveProspect === 'function') return global.renderActiveProspect();
  }

  function renderQueueHelper() {
    if (typeof root.renderQueue === 'function') return root.renderQueue();
    if (typeof global !== 'undefined' && typeof global.renderQueue === 'function') return global.renderQueue();
  }

  function recordPartnerActivityHelper(type, id, details) {
    if (typeof root.recordPartnerActivity === 'function') return root.recordPartnerActivity(type, id, details);
    if (typeof global !== 'undefined' && typeof global.recordPartnerActivity === 'function') return global.recordPartnerActivity(type, id, details);
  }

  function getCallWorkflowState() {
    return { isCallActive, callPendingDisposition, activeCallProspectId, currentCallReach, currentCallOutcome };
  }

  function setCallWorkflowState(s) {
    if (!s) return;
    if (s.isCallActive !== undefined) isCallActive = s.isCallActive;
    if (s.callPendingDisposition !== undefined) callPendingDisposition = s.callPendingDisposition;
    if (s.activeCallProspectId !== undefined) {
      activeCallProspectId = s.activeCallProspectId;
      if (typeof root.setSelectedProspectId === 'function') root.setSelectedProspectId(s.activeCallProspectId);
      else root.selectedProspectId = s.activeCallProspectId;
    }
    if (s.currentCallReach !== undefined) currentCallReach = s.currentCallReach;
    if (s.currentCallOutcome !== undefined) currentCallOutcome = s.currentCallOutcome;
  }

function startCallTimer() {
  clearInterval(callTimerInterval);
  callSeconds = 0;
  const timerBox = document.getElementById('callTimerBox');
  const timerDigits = document.getElementById('callTimerDigits');
  if (timerBox) {
    timerBox.classList.remove('hidden');
    timerBox.classList.add('flex');
  }

  if (typeof window !== 'undefined' && window.System1Brain) {
    window.System1Brain.onCallStateChange?.(true, 0);
  }

  callTimerInterval = setInterval(() => {
    callSeconds++;
    const mins = String(Math.floor(callSeconds / 60)).padStart(2, '0');
    const secs = String(callSeconds % 60).padStart(2, '0');
    if (timerDigits) {
      timerDigits.innerText = `${mins}:${secs}`;
    }
    if (callSeconds % 15 === 0 && typeof window !== 'undefined' && window.System1Brain) {
      window.System1Brain.callDuration = callSeconds;
    }
  }, 1000);
}

function stopCallTimer() {
  clearInterval(callTimerInterval);
  isCallActive = false;
  const timerBox = document.getElementById('callTimerBox');
  if (timerBox) {
    timerBox.classList.add('hidden');
    timerBox.classList.remove('flex');
  }
  if (typeof window !== 'undefined' && window.System1Brain) {
    window.System1Brain.onCallStateChange?.(false, callSeconds);
  }
  updateCallHUDState();
}

// ============================================================================
// GUIDED IN-CALL WORKFLOW & MANDATORY DISPOSITION GATE SUBSYSTEM 18
// ============================================================================

function setCallReach(reachType) {
  currentCallReach = reachType;
  updateReachUI();
  updateOutcomeOptionsUI();
  updateCallHUDState();
  playSound('click');
}

function setCallOutcome(outcomeType) {
  currentCallOutcome = outcomeType;
  updateOutcomeUI();
  updateCallHUDState();
  playSound('click');

  if (outcomeType === 'discovery_booked') {
    if (typeof openExecutiveHandoffModal === 'function') {
      openExecutiveHandoffModal(getSelectedId());
    } else {
      const discInput = document.getElementById('discoveryInput');
      if (discInput) discInput.focus();
    }
  } else if (outcomeType === 'closed_won' || outcomeType === 'deal_closed_direct') {
    if (typeof openDealCommitmentModal === 'function') {
      openDealCommitmentModal(getSelectedId());
    }
  } else if (outcomeType === 'teardown_sent') {
    const p = getGlobalProspects().find(item => item.id === getSelectedId());
    if (p) {
      showNotification(`🔗 Generated 3D teardown brief for ${p.name}`);
    }
  }
}

function appendNoteTag(tagText) {
  const notesEl = document.getElementById('callNotesInput');
  if (!notesEl) return;
  const tagFormatted = `[${tagText}]`;
  if (!notesEl.value.includes(tagFormatted)) {
    notesEl.value = notesEl.value ? `${notesEl.value.trim()} ${tagFormatted}` : tagFormatted;
  }
  saveNotesLocally();
  playSound('click');
  showNotification(`Added tag: ${tagFormatted}`);
}

function cancelActiveDial() {
  playSound('click');
  stopCallTimer();
  const prospectId = activeCallProspectId || getSelectedId();
  const prospectsList = getGlobalProspects();
  const p = prospectsList.find(item => item.id === prospectId);
  const user = (typeof currentUser !== 'undefined' && currentUser)
    ? currentUser
    : ((typeof window !== 'undefined' && window.currentUser)
      ? window.currentUser
      : ((typeof global !== 'undefined' && global.currentUser) ? global.currentUser : null));
  if (p && p.status === 'locked' && (!p.lockedEmail || p.lockedEmail === user?.email)) {
    p.status = 'ready';
    p.lockedBy = null;
    p.lockedEmail = null;
    broadcastUnlockHelper(p.id, 'ready');
  }
  resetCallWorkflowState();
  showNotification('↩ Dial cancelled (misclick). No penalty recorded.');
  renderQueueHelper();
  renderActiveProspectHelper();
}

function resetCallWorkflowState() {
  isCallActive = false;
  callPendingDisposition = false;
  activeCallProspectId = null;
  currentCallReach = null;
  currentCallOutcome = null;
  updateCallHUDState();
  updateReachUI();
  updateOutcomeUI();
}

function validateCallDisposition() {
  return Boolean(currentCallReach && currentCallOutcome);
}

function updateCallHUDState() {
  const badge = document.getElementById('callFlightBadge');
  const dot = document.getElementById('callFlightDot');
  const statusText = document.getElementById('callFlightStatusText');
  const cancelBtn = document.getElementById('btnCancelDial');
  const reachIndicator = document.getElementById('reachValidationIndicator');
  const outcomeIndicator = document.getElementById('outcomeValidationIndicator');
  const handoffBtn = document.getElementById('btnNextLeadHandoff');

  const user = (typeof currentUser !== 'undefined' && currentUser)
    ? currentUser
    : ((typeof window !== 'undefined' && window.currentUser)
      ? window.currentUser
      : ((typeof global !== 'undefined' && global.currentUser) ? global.currentUser : null));
  const isOwner = typeof isApoorvOwnerEmail === 'function' && isApoorvOwnerEmail(user?.email);

  if (cancelBtn) {
    if (isCallActive || callPendingDisposition) {
      cancelBtn.classList.remove('hidden');
      cancelBtn.classList.add('flex');
    } else {
      cancelBtn.classList.add('hidden');
      cancelBtn.classList.remove('flex');
    }
  }

  if (isCallActive) {
    if (badge) {
      badge.className = "px-2 py-0.5 font-arcade text-[9px] font-bold border border-[#17120f] bg-[#fce566] text-[#17120f] shadow-[1px_1px_0_#17120f] flex items-center gap-1.5";
    }
    if (dot) {
      dot.className = "w-2 h-2 rounded-full bg-rose-600 animate-ping inline-block";
    }
    if (statusText) {
      statusText.innerText = "● IN-CALL ACTIVE";
    }
  } else if (callPendingDisposition) {
    if (badge) {
      badge.className = "px-2 py-0.5 font-arcade text-[9px] font-bold border border-[#17120f] bg-rose-100 text-rose-800 shadow-[1px_1px_0_#17120f] flex items-center gap-1.5";
    }
    if (dot) {
      dot.className = "w-2 h-2 rounded-full bg-rose-600 inline-block";
    }
    if (statusText) {
      statusText.innerText = "⚠️ DISPOSITION PENDING";
    }
  } else {
    if (badge) {
      badge.className = "px-2 py-0.5 font-arcade text-[9px] font-bold border border-[#17120f] bg-[#fff3cd] text-[#856404] shadow-[1px_1px_0_#17120f] flex items-center gap-1.5";
    }
    if (dot) {
      dot.className = "w-2 h-2 rounded-full bg-amber-500 inline-block";
    }
    if (statusText) {
      statusText.innerText = "READY TO DIAL";
    }
  }

  if (reachIndicator) {
    if (callPendingDisposition && !currentCallReach) {
      reachIndicator.classList.remove('hidden');
    } else {
      reachIndicator.classList.add('hidden');
    }
  }

  if (outcomeIndicator) {
    if (callPendingDisposition && currentCallReach && !currentCallOutcome) {
      outcomeIndicator.classList.remove('hidden');
    } else {
      outcomeIndicator.classList.add('hidden');
    }
  }

  if (handoffBtn) {
    if (callPendingDisposition && !isOwner) {
      if (!validateCallDisposition()) {
        handoffBtn.innerHTML = `⚠️ Log Disposition &rarr; (Space)`;
        handoffBtn.classList.add('border-rose-600');
      } else {
        handoffBtn.innerHTML = `Complete & Next &rarr; (Space)`;
        handoffBtn.classList.remove('border-rose-600');
      }
    } else {
      handoffBtn.innerHTML = `Save & Next &rarr; (Space)`;
      handoffBtn.classList.remove('border-rose-600');
    }
  }

  // Manage Progressive Disclosure Pre-Call state on #callWrapCard
  const callCard = document.getElementById('callWrapCard');
  const hudToggleText = document.getElementById('hudToggleText');
  if (callCard) {
    if (isCallActive || callPendingDisposition) {
      callCard.classList.remove('cockpit-pre-call');
      if (hudToggleText) hudToggleText.innerText = "Collapse ▲";
    } else if (!callCard.classList.contains('hud-manually-expanded')) {
      callCard.classList.add('cockpit-pre-call');
      if (hudToggleText) hudToggleText.innerText = "Expand ▼";
    }
  }
}

function toggleCallHUDSteps() {
  const card = document.getElementById('callWrapCard');
  const toggleText = document.getElementById('hudToggleText');
  if (!card) return;
  if (card.classList.contains('cockpit-pre-call')) {
    card.classList.toggle('hud-manually-expanded');
    const isExpanded = card.classList.contains('hud-manually-expanded');
    if (toggleText) toggleText.innerText = isExpanded ? "Collapse ▲" : "Expand ▼";
  }
}

function switchDossierTab(tabName) {
  const tabTalk = document.getElementById('dossierTabTalk');
  const tabAudit = document.getElementById('dossierTabAudit');
  const contentTalk = document.getElementById('dossierTabContentTalk');
  const contentAudit = document.getElementById('dossierTabContentAudit');

  if (tabName === 'audit') {
    if (contentTalk) contentTalk.classList.add('hidden');
    if (contentAudit) contentAudit.classList.remove('hidden');
    if (tabTalk) {
      tabTalk.className = "dossier-tab-btn px-2.5 py-1 rounded font-medium text-neutral-400 hover:text-white transition cursor-pointer";
    }
    if (tabAudit) {
      tabAudit.className = "dossier-tab-btn active px-2.5 py-1 rounded font-bold text-white bg-white/[0.12] transition cursor-pointer";
    }
  } else {
    if (contentTalk) contentTalk.classList.remove('hidden');
    if (contentAudit) contentAudit.classList.add('hidden');
    if (tabTalk) {
      tabTalk.className = "dossier-tab-btn active px-2.5 py-1 rounded font-bold text-white bg-white/[0.12] transition cursor-pointer";
    }
    if (tabAudit) {
      tabAudit.className = "dossier-tab-btn px-2.5 py-1 rounded font-medium text-neutral-400 hover:text-white transition cursor-pointer";
    }
  }

  try {
    localStorage.setItem('sprintdial_dossier_tab', tabName);
  } catch (e) {}
}

function toggleDossierCollapse() {
  const dossier = document.getElementById('dossierPane');
  const icon = document.getElementById('dossierCollapseIcon');
  if (!dossier) return;
  const isCollapsed = dossier.classList.toggle('dossier-pane-collapsed');
  if (icon) {
    icon.innerText = isCollapsed ? "▶" : "◀";
  }
}

if (typeof window !== 'undefined') {
  window.switchDossierTab = switchDossierTab;
  window.toggleDossierCollapse = toggleDossierCollapse;
  window.toggleCallHUDSteps = toggleCallHUDSteps;
}

function updateReachUI() {
  const reachBtns = {
    dm_connected: document.getElementById('btnReachDM'),
    gatekeeper: document.getElementById('btnReachGK'),
    no_answer: document.getElementById('btnReachNoAns'),
    invalid_number: document.getElementById('btnReachInvalid')
  };

  Object.entries(reachBtns).forEach(([key, btn]) => {
    if (!btn) return;
    if (key === currentCallReach) {
      btn.classList.add('reach-btn-active');
    } else {
      btn.classList.remove('reach-btn-active');
    }
  });
}

function updateOutcomeUI() {
  const container = document.getElementById('outcomeOptionsContainer');
  if (!container) return;
  const outcomeBtns = container.querySelectorAll('.outcome-btn');
  outcomeBtns.forEach(btn => {
    const oc = btn.getAttribute('data-outcome') || '';
    if (oc && oc === currentCallOutcome) {
      btn.classList.add('outcome-btn-active');
    } else {
      btn.classList.remove('outcome-btn-active');
    }
  });
}

function updateOutcomeOptionsUI() {
  const container = document.getElementById('outcomeOptionsContainer');
  const title = document.getElementById('outcomeStepTitle');
  if (!container) return;

  if (currentCallReach === 'dm_connected') {
    if (title) title.innerText = "DECISION MAKER OUTCOME";
    container.innerHTML = `
      <button type="button" data-outcome="discovery_booked" onclick="setCallOutcome('discovery_booked')" class="outcome-btn px-1 py-1 bg-[#fff3cd] hover:bg-[#ffeeba] text-[#856404] border border-[#17120f] font-arcade text-[7.5px] font-bold shadow-[1px_1px_0_#17120f] transition flex items-center justify-center gap-1 truncate" title="Forward to Apoorv (10% Referral Cut) [Hotkey: 1]">
        <span>🤝</span> <span>[1] FORWARD (10%)</span>
      </button>
      <button type="button" data-outcome="closed_won" onclick="setCallOutcome('closed_won')" class="outcome-btn px-1 py-1 bg-[#d4edda] hover:bg-[#c3e6cb] text-[#155724] border border-[#17120f] font-arcade text-[7.5px] font-bold shadow-[1px_1px_0_#17120f] transition flex items-center justify-center gap-1 truncate" title="Close Deal on Call (15% Direct Cut) [Hotkey: 2]">
        <span>💰</span> <span>[2] CLOSE (15%)</span>
      </button>
      <button type="button" data-outcome="teardown_sent" onclick="setCallOutcome('teardown_sent')" class="outcome-btn px-1 py-1 bg-[#cce5ff] hover:bg-[#b8daff] text-[#004085] border border-[#17120f] font-arcade text-[7.5px] font-bold shadow-[1px_1px_0_#17120f] transition flex items-center justify-center gap-1 truncate" title="Sent 3D Teardown [Hotkey: 3]">
        <span>🔗</span> <span>[3] TEARDOWN</span>
      </button>
      <button type="button" data-outcome="connected_callback" onclick="setCallOutcome('connected_callback')" class="outcome-btn px-1 py-1 bg-[#e2e3e5] hover:bg-[#d6d8db] text-[#383d41] border border-[#17120f] font-arcade text-[7.5px] font-bold shadow-[1px_1px_0_#17120f] transition flex items-center justify-center gap-1 truncate" title="Callback Requested [Hotkey: 4]">
        <span>📅</span> <span>[4] CALLBACK</span>
      </button>
      <button type="button" data-outcome="not_interested" onclick="setCallOutcome('not_interested')" class="outcome-btn px-1 py-1 bg-[#f8d7da] hover:bg-[#f5c6cb] text-[#721c24] border border-[#17120f] font-arcade text-[7.5px] font-bold shadow-[1px_1px_0_#17120f] transition flex items-center justify-center gap-1 truncate" title="Disqualified [Hotkey: 5]">
        <span>❌</span> <span>[5] DISQUAL</span>
      </button>
    `;
  } else if (currentCallReach === 'gatekeeper') {
    if (title) title.innerText = "GATEKEEPER OUTCOME";
    container.innerHTML = `
      <button type="button" data-outcome="gatekeeper_callback" onclick="setCallOutcome('gatekeeper_callback')" class="outcome-btn px-1.5 py-1 bg-[#fff3cd] hover:bg-[#ffeeba] text-[#856404] border border-[#17120f] font-arcade text-[8px] font-bold shadow-[1px_1px_0_#17120f] transition flex items-center justify-center gap-1 truncate" title="Callback Later [Hotkey: 1]">
        <span>📞</span> <span>[1] CB LATER</span>
      </button>
      <button type="button" data-outcome="gatekeeper_info" onclick="setCallOutcome('gatekeeper_info')" class="outcome-btn px-1.5 py-1 bg-[#e2e3e5] hover:bg-[#d6d8db] text-[#383d41] border border-[#17120f] font-arcade text-[8px] font-bold shadow-[1px_1px_0_#17120f] transition flex items-center justify-center gap-1 truncate" title="Desk Email Sent [Hotkey: 2]">
        <span>📧</span> <span>[2] EMAIL SENT</span>
      </button>
      <button type="button" data-outcome="gatekeeper_rejection" onclick="setCallOutcome('gatekeeper_rejection')" class="outcome-btn px-1.5 py-1 bg-[#f8d7da] hover:bg-[#f5c6cb] text-[#721c24] border border-[#17120f] font-arcade text-[8px] font-bold shadow-[1px_1px_0_#17120f] transition flex items-center justify-center gap-1 truncate" title="Gatekeeper Block [Hotkey: 3]">
        <span>🚫</span> <span>[3] GK BLOCK</span>
      </button>
      <button type="button" data-outcome="not_interested" onclick="setCallOutcome('not_interested')" class="outcome-btn px-1.5 py-1 bg-[#fffdf1] hover:bg-[#fce566] text-[#17120f] border border-[#17120f] font-arcade text-[8px] font-bold shadow-[1px_1px_0_#17120f] transition flex items-center justify-center gap-1 truncate" title="Disqualified">
        <span>❌</span> <span>DISQUAL</span>
      </button>
    `;
  } else if (currentCallReach === 'no_answer') {
    if (title) title.innerText = "NO ANSWER OUTCOME";
    container.innerHTML = `
      <button type="button" data-outcome="callback" onclick="setCallOutcome('callback')" class="outcome-btn px-1.5 py-1 bg-[#fff3cd] hover:bg-[#ffeeba] text-[#856404] border border-[#17120f] font-arcade text-[8px] font-bold shadow-[1px_1px_0_#17120f] transition flex items-center justify-center gap-1 truncate" title="Requeue Tomorrow [Hotkey: 1]">
        <span>🔁</span> <span>[1] REQUEUE TOMORROW</span>
      </button>
      <button type="button" data-outcome="no_answer_retry" onclick="setCallOutcome('no_answer_retry')" class="outcome-btn px-1.5 py-1 bg-[#e2e3e5] hover:bg-[#d6d8db] text-[#383d41] border border-[#17120f] font-arcade text-[8px] font-bold shadow-[1px_1px_0_#17120f] transition flex items-center justify-center gap-1 truncate" title="Retry Later Today [Hotkey: 2]">
        <span>📞</span> <span>[2] RETRY TODAY</span>
      </button>
      <button type="button" data-outcome="not_interested" onclick="setCallOutcome('not_interested')" class="outcome-btn px-1.5 py-1 bg-[#f8d7da] hover:bg-[#f5c6cb] text-[#721c24] border border-[#17120f] font-arcade text-[8px] font-bold shadow-[1px_1px_0_#17120f] transition flex items-center justify-center gap-1 truncate" title="Disqualify [Hotkey: 3]">
        <span>❌</span> <span>[3] DISQUAL</span>
      </button>
    `;
  } else if (currentCallReach === 'invalid_number') {
    if (title) title.innerText = "INVALID NUMBER OUTCOME";
    container.innerHTML = `
      <button type="button" data-outcome="blacklisted" onclick="setCallOutcome('blacklisted')" class="outcome-btn px-1.5 py-1 bg-[#f8d7da] hover:bg-[#f5c6cb] text-[#721c24] border border-[#17120f] font-arcade text-[8px] font-bold shadow-[1px_1px_0_#17120f] transition flex items-center justify-center gap-1 truncate" title="Blacklist Invalid # [Hotkey: 1]">
        <span>🚫</span> <span>[1] EXCLUDE / DEAD #</span>
      </button>
      <button type="button" data-outcome="gatekeeper_rejection" onclick="setCallOutcome('gatekeeper_rejection')" class="outcome-btn px-1.5 py-1 bg-[#e2e3e5] hover:bg-[#d6d8db] text-[#383d41] border border-[#17120f] font-arcade text-[8px] font-bold shadow-[1px_1px_0_#17120f] transition flex items-center justify-center gap-1 truncate" title="Wrong Number [Hotkey: 2]">
        <span>🔍</span> <span>[2] WRONG #</span>
      </button>
    `;
  }
  updateOutcomeUI();
}

function flashDispositionGateWarning(msg) {
  playSound('click');
  if (typeof window !== "undefined" && typeof window.triggerHaptic === "function") {
    window.triggerHaptic([50, 50, 50]);
  }
  const card = document.getElementById('callWrapCard');
  if (card) {
    card.classList.remove('shake-card');
    void card.offsetWidth; // trigger reflow
    card.classList.add('shake-card');
    setTimeout(() => {
      card?.classList.remove('shake-card');
    }, 500);
  }
  showNotification(msg || "⚠️ Complete call disposition before proceeding.");
}

function canAdvanceLead() {
  const user = (typeof window !== 'undefined' && window.currentUser)
    ? window.currentUser
    : ((typeof global !== 'undefined' && global.currentUser)
      ? global.currentUser
      : ((typeof currentUser !== 'undefined' && currentUser) ? currentUser : null));
  const isOwner = (typeof isApoorvOwnerEmail === 'function' && isApoorvOwnerEmail(user?.email)) || (user?.email === 'apoorvxs@gmail.com');
  if (isOwner) return true;

  const curProspectId = getSelectedId();

  if (callPendingDisposition && (activeCallProspectId === curProspectId || !activeCallProspectId)) {
    if (!validateCallDisposition()) {
      flashDispositionGateWarning("⚠️ Complete call disposition (Reach + Outcome) before proceeding to next prospect.");
      return false;
    }
  }
  return true;
}

// Teleprompter Angles
function setAngle(angle) {
  playSound('click');
  activeAngle = angle;
  ['speed', 'commission', 'visual'].forEach(a => {
    const btn = document.getElementById(`btnAngle${a.charAt(0).toUpperCase() + a.slice(1)}`);
    if (btn) {
      if (a === angle) {
        btn.className = "px-2.5 py-1 rounded-md bg-white/[0.1] text-white border border-white/[0.15] font-medium transition";
      } else {
        btn.className = "px-2.5 py-1 rounded-md text-neutral-400 hover:text-white border border-transparent font-medium transition";
      }
    }
  });
  const p = getGlobalProspects().find(item => item.id === getSelectedId());
  if (p) updateScriptUI(p);
}

function setScriptMode(mode) {
  playSound('click');
  activeScriptMode = mode;
  const btnPitch = document.getElementById('tabModePitch');
  const btnGk = document.getElementById('tabModeGatekeeper');
  const btnChallenge = document.getElementById('tabModeChallenge');
  const langSelector = document.getElementById('scriptLangSelector');
  const angleRow = document.getElementById('angleSwitcherRow');

  if (btnPitch) btnPitch.className = "px-2.5 py-1 rounded font-medium text-neutral-400 hover:text-white transition";
  if (btnGk) btnGk.className = "px-2.5 py-1 rounded font-medium text-neutral-400 hover:text-white transition";
  if (btnChallenge) btnChallenge.className = "px-2.5 py-1 rounded font-medium text-amber-300 hover:text-amber-200 transition flex items-center gap-1";

  if (mode === 'gatekeeper') {
    if (btnGk) btnGk.className = "px-2.5 py-1 rounded font-semibold text-neutral-950 bg-white shadow-sm transition";
    if (langSelector) langSelector.classList.add('hidden');
    if (angleRow) angleRow.classList.add('hidden');
  } else if (mode === 'challenge') {
    if (btnChallenge) btnChallenge.className = "px-2.5 py-1 rounded font-semibold text-amber-200 bg-amber-500/20 border border-amber-500/30 shadow-sm transition flex items-center gap-1";
    if (langSelector) langSelector.classList.remove('hidden');
    if (angleRow) angleRow.classList.add('hidden');
  } else {
    if (btnPitch) btnPitch.className = "px-2.5 py-1 rounded font-semibold text-neutral-950 bg-white shadow-sm transition";
    if (langSelector) langSelector.classList.remove('hidden');
    if (angleRow) angleRow.classList.remove('hidden');
  }

  const p = getGlobalProspects().find(item => item.id === getSelectedId());
  if (p) updateScriptUI(p);
}

function toggleLivePhoneChallenge() {
  if (activeScriptMode === 'challenge') {
    setScriptMode('pitch');
  } else {
    setScriptMode('challenge');
  }
}

function triggerLivePhoneChallenge() {
  toggleLivePhoneChallenge();
}

function setLang(lang) {
  playSound('click');
  activeLang = lang;
  ['ml', 'manglish', 'en'].forEach(l => {
    const btn = document.getElementById(`btnLang${l.charAt(0).toUpperCase() + l.slice(1)}`);
    if (btn) {
      if (l === lang) {
        btn.className = "px-2.5 py-0.5 rounded font-semibold text-neutral-950 bg-white shadow-sm transition";
      } else {
        btn.className = "px-2.5 py-0.5 rounded font-medium text-neutral-400 hover:text-white transition";
      }
    }
  });

  // Synchronize open objection text if active
  if (activeObjectionIndex !== null && OBJECTIONS[activeObjectionIndex]) {
    const obj = OBJECTIONS[activeObjectionIndex];
    const textEl = document.getElementById('objectionText');
    const langIndicator = document.getElementById('objectionLangIndicator');
    if (textEl) textEl.innerText = (lang === 'ml' && obj.ml) ? obj.ml : obj.en;
    if (langIndicator) langIndicator.innerText = lang === 'ml' ? 'Malayalam (മലയാളം)' : (lang === 'manglish' ? 'Manglish' : 'English');
  }

  // Synchronize open layman analogy text if modal is open
  if (activeAnalogyKey && LAYMAN_ANALOGIES[activeAnalogyKey]) {
    const item = LAYMAN_ANALOGIES[activeAnalogyKey];
    const metaphor = document.getElementById('laymanAnalogyMetaphor');
    const talkingPoint = document.getElementById('laymanAnalogyTalkingPoint');
    if (metaphor) metaphor.innerText = (lang === 'ml' && item.metaphorMl) ? item.metaphorMl : item.metaphor;
    if (talkingPoint) talkingPoint.innerText = (lang === 'ml' && item.talkingPointMl) ? item.talkingPointMl : item.talkingPoint;
  }

  const p = getGlobalProspects().find(item => item.id === getSelectedId());
  if (p) updateScriptUI(p);
}

function showLaymanAnalogy(key) {
  playSound('click');
  const modal = document.getElementById('laymanAnalogyModal');
  if (!modal) return;
  activeAnalogyKey = key || activeAnalogyKey || 'lcp';
  const item = LAYMAN_ANALOGIES[activeAnalogyKey];
  if (!item) return;

  const iconEl = document.getElementById('laymanAnalogyIcon');
  const titleEl = document.getElementById('laymanAnalogyTitle');
  const catEl = document.getElementById('laymanAnalogyCategory');
  const metaphorEl = document.getElementById('laymanAnalogyMetaphor');
  const talkingPointEl = document.getElementById('laymanAnalogyTalkingPoint');
  const contrastBadEl = document.getElementById('laymanAnalogyContrastBad');
  const killshotEl = document.getElementById('laymanAnalogyKillshot');

  if (iconEl) iconEl.innerText = item.icon || '⚡';
  if (titleEl) titleEl.innerText = item.title || 'Technical Concept';
  if (catEl) catEl.innerText = item.category || 'ARCHITECTURE';
  if (metaphorEl) metaphorEl.innerText = (activeLang === 'ml' && item.metaphorMl) ? item.metaphorMl : item.metaphor;
  if (talkingPointEl) talkingPointEl.innerText = (activeLang === 'ml' && item.talkingPointMl) ? item.talkingPointMl : item.talkingPoint;
  if (contrastBadEl) contrastBadEl.innerText = (activeLang === 'ml' && item.contrastBadMl) ? item.contrastBadMl : (item.contrastBad || 'Generic IT specifications.');
  if (killshotEl) killshotEl.innerText = (activeLang === 'ml' && item.killshotQuestionMl) ? item.killshotQuestionMl : (item.killshotQuestion || 'Ask the client to test this live on their phone.');

  // Update analogy pill buttons inside modal
  if (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') {
    document.querySelectorAll('.analogy-pill-btn').forEach(btn => {
      const btnKey = btn.getAttribute('data-analogy-key');
      if (btnKey === activeAnalogyKey) {
        btn.classList.add('bg-[#fce566]', 'text-[#17120f]', 'font-bold');
        btn.classList.remove('bg-white/[0.04]', 'text-neutral-300');
      } else {
        btn.classList.remove('bg-[#fce566]', 'text-[#17120f]', 'font-bold');
        btn.classList.add('bg-white/[0.04]', 'text-neutral-300');
      }
    });
  }

  // Update modal language buttons
  const btnEn = document.getElementById('analogyModalLangEn');
  const btnMl = document.getElementById('analogyModalLangMl');
  if (btnEn && btnMl) {
    if (activeLang === 'en') {
      btnEn.className = "px-2 py-0.5 rounded font-bold text-xs bg-[#fce566] text-[#17120f] border border-[#17120f]";
      btnMl.className = "px-2 py-0.5 rounded text-xs bg-white/[0.06] text-neutral-400 hover:text-white border border-white/[0.1]";
    } else {
      btnMl.className = "px-2 py-0.5 rounded font-bold text-xs bg-[#fce566] text-[#17120f] border border-[#17120f]";
      btnEn.className = "px-2 py-0.5 rounded text-xs bg-white/[0.06] text-neutral-400 hover:text-white border border-white/[0.1]";
    }
  }

  modal.classList.remove('hidden');
}

function switchAnalogyLang(lang) {
  activeLang = lang;
  if (typeof window !== 'undefined') window.activeLang = lang;
  showLaymanAnalogy(activeAnalogyKey || 'lcp');
}

function speakCurrentAnalogy() {
  const item = LAYMAN_ANALOGIES[activeAnalogyKey];
  if (!item) return;
  const textToSpeak = (activeLang === 'ml' && item.talkingPointMl) ? item.talkingPointMl : item.talkingPoint;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = activeLang === 'ml' ? 'ml-IN' : 'en-US';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      showNotification('🔊 Playing conversational script...');
    } catch(e) {
      playSound('chime');
    }
  } else {
    playSound('chime');
  }
}

function copyCurrentAnalogy() {
  const item = LAYMAN_ANALOGIES[activeAnalogyKey];
  if (!item) return;
  const textToCopy = (activeLang === 'ml' && item.talkingPointMl) ? item.talkingPointMl : item.talkingPoint;
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      showNotification('[COPIED] Conversational script copied to clipboard!');
      playSound('click');
    }).catch(() => {});
  }
}

function appendCurrentAnalogyToNotes() {
  const item = LAYMAN_ANALOGIES[activeAnalogyKey];
  if (!item) return;
  const text = (activeLang === 'ml' && item.talkingPointMl) ? item.talkingPointMl : item.talkingPoint;
  if (typeof appendObjectionToNotes === 'function') {
    appendObjectionToNotes(item.title, text);
  }
}

function closeLaymanAnalogy() {
  playSound('click');
  const modal = document.getElementById('laymanAnalogyModal');
  if (modal) modal.classList.add('hidden');
  activeAnalogyKey = null;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function switchDossierLang(lang) {
  playSound('click');
  activeLang = lang;
  if (typeof window !== 'undefined') window.activeLang = lang;

  const btnEn = document.getElementById('btnDossierLangEn');
  const btnMl = document.getElementById('btnDossierLangMl');
  if (btnEn && btnMl) {
    if (lang === 'en') {
      btnEn.className = "px-2 py-0.5 rounded font-bold text-[9px] font-mono bg-white/[0.18] text-white border border-white/20 transition cursor-pointer";
      btnMl.className = "px-2 py-0.5 rounded font-medium text-[9px] font-mono text-neutral-400 hover:text-white transition cursor-pointer";
    } else {
      btnMl.className = "px-2 py-0.5 rounded font-bold text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 transition cursor-pointer";
      btnEn.className = "px-2 py-0.5 rounded font-medium text-[9px] font-mono text-neutral-400 hover:text-white transition cursor-pointer";
    }
  }
  renderActiveProspectHelper();
}

function copyTalkTrack(trackIndex) {
  let text = '';
  if (trackIndex === 1) text = document.getElementById('callerIcebreakerText')?.innerText || '';
  else if (trackIndex === 2) text = document.getElementById('callerLaymanAnalogy')?.innerText || '';
  else if (trackIndex === 3) text = document.getElementById('callerSecurityHook')?.innerText || '';
  else if (trackIndex === 4) text = document.getElementById('callerCompetitorEdge')?.innerText || '';

  if (!text) return;
  text = text.replace(/^"|"$/g, '').trim();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('[COPIED] Talk track copied to clipboard!');
      playSound('click');
    }).catch(() => {});
  }
}

function speakTalkTrack(trackIndex) {
  let text = '';
  if (trackIndex === 1) text = document.getElementById('callerIcebreakerText')?.innerText || '';
  else if (trackIndex === 2) text = document.getElementById('callerLaymanAnalogy')?.innerText || '';
  else if (trackIndex === 3) text = document.getElementById('callerSecurityHook')?.innerText || '';
  else if (trackIndex === 4) text = document.getElementById('callerCompetitorEdge')?.innerText || '';

  if (!text) return;
  text = text.replace(/^"|"$/g, '').trim();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = activeLang === 'ml' ? 'ml-IN' : 'en-US';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      showNotification('🔊 Playing talk track audio...');
    } catch(e) {
      playSound('chime');
    }
  } else {
    playSound('chime');
  }
}

function updateScriptUI(p) {
  const box = document.getElementById('scriptContentBox');
  if (!box) return;

  if (activeScriptMode === 'gatekeeper') {
    box.innerHTML = `
      <div class="space-y-2">
        <span class="text-xs font-mono text-neutral-300 uppercase tracking-wider font-semibold block">Gatekeeper / Receptionist Hook:</span>
        <p class="text-base text-gray-100 font-medium leading-relaxed">${escapeHTML(p.scripts?.gatekeeper)}</p>
      </div>
    `;
  } else if (activeScriptMode === 'challenge') {
    const isNoSite = !p.site || p.site === '#' || p.ptype === 'STARTER';
    const cleanSite = escapeHTML(isNoSite ? 'your business listing' : ((p.site || '').replace(/^https?:\/\//, '').replace(/\/$/, '') || 'your website'));
    const lcpSec = escapeHTML((p.lcpTime || '4.4s').replace(/[^0-9.]/g, '') || '4.4');
    const dmName = escapeHTML(p.dm || 'Doctor');
    const pNameShort = escapeHTML((p.name || '').split(',')[0]);

    let scriptHtml = '';
    if (activeLang === 'ml') {
      if (isNoSite) {
        scriptHtml = `
        <div class="space-y-3">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <span class="text-xs font-mono text-amber-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <span>🔥</span> 15-സെക്കൻഡ് ലൈവ് ഫോൺ ചലഞ്ച് (Google Aggregator Search Challenge)
            </span>
            <span class="text-[10px] font-mono text-slate-400">15-Sec Spoken Test</span>
          </div>
          <p class="text-base leading-relaxed text-gray-100 font-medium">
            "${dmName}, നമ്മൾ സംസാരിക്കുന്നതിനിടയിൽ സ്വന്തം മൊബൈലിൽ ഗൂഗിളിൽ നിങ്ങളുടെ സ്ഥാപനത്തിന്റെ പേര് (<span class="text-amber-300 underline">${pNameShort}</span>) ഒന്ന് സേർച്ച് ചെയ്തു നോക്കാമോ? സ്വന്തം വെബ്സൈറ്റില്ലാത്തതുകൊണ്ട് എന്താണ് സംഭവിക്കുന്നതെന്ന് ഒരുമിച്ച് കാണാം..."
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <div class="bg-black/40 border border-white/10 rounded-lg p-2.5">
              <span class="text-amber-400 font-bold block text-[11px] font-mono">1. അഗ്രിഗേറ്റർ ട്രാഫിക് ലീക്ക് (സ്പീഡ് ടെസ്റ്റ്)</span>
              <span class="text-gray-300 text-[11px] block mt-0.5">"നോക്കൂ, നിങ്ങളുടെ പേരിന് മുകളിൽ പ്രാക്ടോ/ഡയറക്ടറിയാണ് വരുന്നത്. രോഗികൾ അവരുടെ ആപ്പിലേക്ക് പോയി എതിരാളികളെ തിരഞ്ഞെടുക്കുന്നു."</span>
            </div>
            <div class="bg-black/40 border border-white/10 rounded-lg p-2.5">
              <span class="text-neutral-300 font-semibold block text-[11px] font-mono">2. തമ്പ് ബാർ ടെസ്റ്റ് (No Direct Bar)</span>
              <span class="text-gray-300 text-[11px] block mt-0.5">"നിങ്ങളിലേക്ക് നേരിട്ട് എത്താൻ സ്വന്തമായി 1-ടാപ്പ് തമ്പ് ബാർ വാട്സാപ്പ് ഇൻടേക്ക് ഇല്ല. ഇടനിലക്കാർക്ക് 20% കമ്മീഷൻ പോകുന്നു."</span>
            </div>
            <div class="bg-black/40 border border-white/10 rounded-lg p-2.5">
              <span class="text-neutral-300 font-semibold block text-[11px] font-mono">3. DPDP പ്രൈവസി റിസ്ക്</span>
              <span class="text-gray-300 text-[11px] block mt-0.5">"രോഗികളുടെ വിവരങ്ങളും നമ്പറുകളും അഗ്രിഗേറ്ററുകൾ കൈവശം വെക്കുന്നു; സ്വന്തം ഡാറ്റാ കസ്റ്റഡി പൂജ്യമാണ്."</span>
            </div>
          </div>
        </div>
        `;
      } else {
        scriptHtml = `
        <div class="space-y-3">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <span class="text-xs font-mono text-amber-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <span>🔥</span> 15-സെക്കൻഡ് ലൈവ് ഫോൺ ചലഞ്ച് (Doctor / Owner Live Phone Challenge)
            </span>
            <span class="text-[10px] font-mono text-slate-400">15-Sec Spoken Test</span>
          </div>
          <p class="text-base leading-relaxed text-gray-100 font-medium">
            "${dmName}, നമ്മൾ സംസാരിക്കുന്നതിനിടയിൽ സ്വന്തം മൊബൈലിൽ (വൈഫൈ അല്ലാതെ 4G ഡാറ്റയിൽ) നിങ്ങളുടെ വെബ്‌സൈറ്റ് (<span class="text-amber-300 underline">${cleanSite}</span>) ഒന്ന് ഓപ്പൺ ചെയ്തു നോക്കാമോ? നമുക്ക് ഒരുമിച്ച് സെക്കൻഡുകൾ എണ്ണാം..."
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <div class="bg-black/40 border border-white/10 rounded-lg p-2.5">
              <span class="text-amber-400 font-bold block text-[11px] font-mono">1. സ്പീഡ് ടെസ്റ്റ് (${lcpSec}s ലാഗ്)</span>
              <span class="text-gray-300 text-[11px] block mt-0.5">"നോക്കൂ ഡോക്ടർ, പേജ് പൂർണ്ണമായി വരാൻ ${lcpSec} സെക്കൻഡ് വെള്ള സ്ക്രീൻ കാണിക്കുന്നു. പേഷ്യന്റ്സ് ഈ സമയം കൊണ്ട് ബാക്ക് അടിച്ചുപോകും."</span>
            </div>
            <div class="bg-black/40 border border-white/10 rounded-lg p-2.5">
              <span class="text-neutral-300 font-semibold block text-[11px] font-mono">2. തമ്പ് ബാർ ടെസ്റ്റ്</span>
              <span class="text-gray-300 text-[11px] block mt-0.5">"സ്ക്രീനിന്റെ താഴെ തമ്പ് വെച്ച് 1-ടാപ്പിൽ വിളിക്കാനോ വാട്സാപ്പ് ചെയ്യാനോ ബട്ടണില്ല. നമ്പർ കാണാൻ താഴേക്ക് സ്ക്രോൾ ചെയ്യണം."</span>
            </div>
            <div class="bg-black/40 border border-white/10 rounded-lg p-2.5">
              <span class="text-neutral-300 font-semibold block text-[11px] font-mono">3. DPDP പ്രൈവസി റിസ്ക്</span>
              <span class="text-gray-300 text-[11px] block mt-0.5">"രോഗികളുടെ ഫോൺ നമ്പർ വാങ്ങുന്ന ഫോമിൽ പുതിയ നിയമപ്രകാരമുള്ള കൺസെന്റ് ബോക്സുകളില്ല."</span>
            </div>
          </div>
        </div>
        `;
      }
    } else if (activeLang === 'manglish') {
      if (isNoSite) {
        scriptHtml = `
        <div class="space-y-3">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <span class="text-xs font-mono text-amber-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <span>🔥</span> 15-Second Live Phone Challenge (Manglish)
            </span>
            <span class="text-[10px] font-mono text-slate-400">Spoken Hook</span>
          </div>
          <p class="text-sm italic font-mono text-neutral-300 leading-relaxed">
            "${dmName}, call-il irikkumpol thanne mobile data-yil ningalude brand Google-il search cheythu nokkamo? Own website illathathinaal Practo/Justdial ranks above you. Screen-inte bottom-il direct sticky thumb intake button illa, plus patient data-kku DPDP privacy protection-um illa."
          </p>
        </div>
        `;
      } else {
        scriptHtml = `
        <div class="space-y-3">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <span class="text-xs font-mono text-amber-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <span>🔥</span> 15-Second Live Phone Challenge (Manglish)
            </span>
            <span class="text-[10px] font-mono text-slate-400">Spoken Hook</span>
          </div>
          <p class="text-sm italic font-mono text-neutral-300 leading-relaxed">
            "${dmName}, call-il irikkumpol thanne mobile data-yil ningalude site (<span class="text-amber-300">${cleanSite}</span>) onnu open cheythu nokkamo? Let's count the seconds together... Look, main page load aavan ${lcpSec} seconds edukkunnu. Screen-inte bottom-il sticky thumb call button illa, plus appointment form-il DPDP privacy protection-um illa."
          </p>
        </div>
        `;
      }
    } else {
      if (isNoSite) {
        scriptHtml = `
        <div class="space-y-3">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <span class="text-xs font-mono text-amber-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <span>🔥</span> 15-Second Live Phone Challenge (English)
            </span>
            <span class="text-[10px] font-mono text-slate-400">15-Sec Spoken Test</span>
          </div>
          <p class="text-sm sm:text-base leading-relaxed text-gray-100 font-medium">
            "${dmName}, while we are on the line, could you take 15 seconds to search your business on your phone? Notice that without an owned website, aggregators rank above you and bleed your inquiries..."
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <div class="bg-black/40 border border-white/10 rounded-lg p-2.5">
              <span class="text-rose-400 font-bold block text-[11px] font-mono">1. Latency & Discovery Hijack</span>
              <span class="text-gray-300 text-[11px] block mt-0.5">"Aggregator portals intercept your direct clients, displaying competitors right below your profile."</span>
            </div>
            <div class="bg-black/40 border border-white/10 rounded-lg p-2.5">
              <span class="text-neutral-300 font-semibold block text-[11px] font-mono">2. Thumb-Zone Disconnect</span>
              <span class="text-gray-300 text-[11px] block mt-0.5">"You have zero owned 1-tap WhatsApp or Call bar where client thumbs rest, surrendering direct intake."</span>
            </div>
            <div class="bg-black/40 border border-white/10 rounded-lg p-2.5">
              <span class="text-neutral-300 font-semibold block text-[11px] font-mono">3. DPDP Data Custody</span>
              <span class="text-gray-300 text-[11px] block mt-0.5">"You have zero custody over client phone numbers captured by third-party directories under DPDP rules."</span>
            </div>
          </div>
        </div>
        `;
      } else {
        scriptHtml = `
        <div class="space-y-3">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <span class="text-xs font-mono text-amber-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <span>🔥</span> 15-Second Live Phone Challenge (English)
            </span>
            <span class="text-[10px] font-mono text-slate-400">15-Sec Spoken Test</span>
          </div>
          <p class="text-sm sm:text-base leading-relaxed text-gray-100 font-medium">
            "${dmName}, while we are on the line, could you take just 15 seconds to open <span class="text-amber-300 underline font-mono">${cleanSite}</span> on your phone's cellular network? Let's count the seconds together..."
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <div class="bg-black/40 border border-white/10 rounded-lg p-2.5">
              <span class="text-rose-400 font-bold block text-[11px] font-mono">1. Latency (${lcpSec}s Drag)</span>
              <span class="text-gray-300 text-[11px] block mt-0.5">"Notice the blank screen for over ${lcpSec} seconds. Prospective clients bounce right back to Google."</span>
            </div>
            <div class="bg-black/40 border border-white/10 rounded-lg p-2.5">
              <span class="text-neutral-300 font-semibold block text-[11px] font-mono">2. Thumb-Zone Friction</span>
              <span class="text-gray-300 text-[11px] block mt-0.5">"Notice there is no sticky 1-tap WhatsApp or Call button at the bottom of your screen where the thumb naturally rests."</span>
            </div>
            <div class="bg-black/40 border border-white/10 rounded-lg p-2.5">
              <span class="text-neutral-300 font-semibold block text-[11px] font-mono">3. DPDP Compliance</span>
              <span class="text-gray-300 text-[11px] block mt-0.5">"Your patient inquiry form captures phone numbers without statutory consent checkboxes required by the DPDP Act."</span>
            </div>
          </div>
        </div>
        `;
      }
    }
    box.innerHTML = scriptHtml;
  } else {
    const angleScripts = (p.scripts && (p.scripts[activeAngle] || p.scripts.speed)) || {};
    if (activeLang === 'ml' && angleScripts.ml) {
      box.innerHTML = `<p class="text-base leading-loose font-normal text-gray-100">${escapeHTML(angleScripts.ml)}</p>`;
    } else if (activeLang === 'manglish' && angleScripts.manglish) {
      box.innerHTML = `<p class="text-sm italic font-mono text-blue-200 leading-relaxed">${escapeHTML(angleScripts.manglish)}</p>`;
    } else if (angleScripts.en) {
      box.innerHTML = `<p class="text-sm sm:text-base leading-relaxed text-gray-200">${escapeHTML(angleScripts.en)}</p>`;
    } else {
      box.innerHTML = `<p class="text-sm sm:text-base leading-relaxed text-gray-200">${escapeHTML(p.script || '')}</p>`;
    }
  }
}

function toggleObjection(index) {
  playSound('click');
  const box = document.getElementById('objectionBox');
  const textEl = document.getElementById('objectionText');
  const langIndicator = document.getElementById('objectionLangIndicator');

  // Clear active styling on all 6 buttons
  const btnObj0 = document.getElementById('btnObj0');
  const btnObj1 = document.getElementById('btnObj1');
  const btnObj2 = document.getElementById('btnObj2');
  const btnObj3 = document.getElementById('btnObj3');
  const btnObj4 = document.getElementById('btnObj4');
  const btnObj5 = document.getElementById('btnObj5');
  const allBtns = [btnObj0, btnObj1, btnObj2, btnObj3, btnObj4, btnObj5];
  
  allBtns.forEach(btn => {
    if (btn) {
      btn.className = "objection-btn text-left text-[10px] px-2 py-1 rounded-none bg-[#fffdf1] hover:bg-[#fce566] text-[#17120f] border border-[#17120f] font-mono transition truncate";
    }
  });

  if (activeObjectionIndex === index) {
    if (box) box.classList.add('hidden');
    activeObjectionIndex = null;
  } else {
    activeObjectionIndex = index;
    if (box) box.classList.remove('hidden');
    const obj = OBJECTIONS[index];
    if (obj && textEl) {
      textEl.innerText = (activeLang === 'ml' && obj.ml) ? obj.ml : obj.en;
    }
    if (langIndicator) {
      langIndicator.innerText = activeLang === 'ml' ? 'Malayalam (മലയാളം)' : (activeLang === 'manglish' ? 'Manglish' : 'English');
    }
    const activeBtn = allBtns[index];
    if (activeBtn) {
      activeBtn.className = "objection-btn text-left text-[10px] px-2 py-1 rounded-none bg-[#fce566] text-[#17120f] border-2 border-[#17120f] font-bold font-mono shadow-[1px_1px_0_#17120f] transition truncate";
    }
    const statusEl = document.getElementById('astromechStatusText');
    if (statusEl) statusEl.textContent = 'REBUTTAL';
    if (window.System1Brain && typeof window.System1Brain.emitThought === 'function' && obj) {
      window.System1Brain.emitThought(`💡 Rebuttal: "${obj.title}"`, 3600);
    }
    if (window.Player3D && typeof window.Player3D.nod === 'function') {
      window.Player3D.nod();
    }
  }
}

function closeObjectionBox() {
  const box = document.getElementById('objectionBox');
  if (box) box.classList.add('hidden');
  activeObjectionIndex = null;
  const statusEl = document.getElementById('astromechStatusText');
  if (statusEl) statusEl.textContent = 'STANDBY';
  const btnObjs = [
    document.getElementById('btnObj0'),
    document.getElementById('btnObj1'),
    document.getElementById('btnObj2'),
    document.getElementById('btnObj3'),
    document.getElementById('btnObj4'),
    document.getElementById('btnObj5')
  ];
  btnObjs.forEach(btn => {
    if (btn) {
      btn.className = "objection-btn text-left text-[10px] px-2 py-1 rounded-none bg-[#fffdf1] hover:bg-[#fce566] text-[#17120f] border border-[#17120f] font-mono transition truncate";
    }
  });
}

function toggleObjectionLang() {
  setLang(activeLang === 'ml' ? 'en' : 'ml');
}

function appendActiveObjectionToNotes() {
  if (activeObjectionIndex === null || !OBJECTIONS[activeObjectionIndex]) return;
  const obj = OBJECTIONS[activeObjectionIndex];
  const rebuttal = (activeLang === 'ml' && obj.ml) ? obj.ml : obj.en;
  if (typeof appendObjectionToNotes === 'function') {
    appendObjectionToNotes(obj.title, rebuttal);
  }
}

function showNotesSaveIndicator() {
  const ind = document.getElementById('notesSavedIndicator');
  if (!ind) return;
  ind.classList.remove('opacity-0');
  ind.classList.add('opacity-100');
  clearTimeout(window._notesSavedTimeout);
  window._notesSavedTimeout = setTimeout(() => {
    ind.classList.remove('opacity-100');
    ind.classList.add('opacity-0');
  }, 1200);
}

function saveNotesLocally() {
  const p = getGlobalProspects().find(item => item.id === getSelectedId());
  const notesInput = document.getElementById('callNotesInput');
  if (p && notesInput) {
    p.notes = notesInput.value;
    saveLeadOverrideHelper(p.id, { notes: p.notes });
    showNotesSaveIndicator();
    if (typeof recordPartnerActivity === 'function') {
      recordPartnerActivityHelper('NOTE_SAVED', p.id, { client: p.name, notesLength: p.notes.length });
    }
  }
}



// Outcome Logging & Progress Bar
function logOutcome(status) {
  stopCallTimer();
  const p = getGlobalProspects().find(item => item.id === getSelectedId());
  if (!p) return;

  p.status = status;
  p.lockedBy = null;
  p.lockedEmail = null;
  broadcastUnlockHelper(p.id, status);

  if (typeof recordPartnerActivity === 'function') {
    recordPartnerActivityHelper('OUTCOME_LOGGED', getSelectedId(), { client: p.name, status });
  }

  // Update Daily Dial Progress & Shift Streak
  const currentDials = getDialsToday() + 1;
  setDialsToday(currentDials);
  saveDialsTodayHelper();
  if (typeof updateShiftStreakOnDial === 'function') {
    updateShiftStreakOnDial();
  }
  updateDialProgress();

  // Dial Milestone Celebrations
  if (currentDials === 5 || currentDials === 10 || currentDials === 15 || currentDials === 20) {
    const ms = typeof getDialMilestone === 'function' ? getDialMilestone(currentDials) : { name: `${currentDials} Dials` };
    playSound('chime');
    if (window.SFX && typeof window.SFX.playCelebrate === 'function') {
      try { window.SFX.playCelebrate(); } catch(e) {}
    }
    showNotification(`🔥 MILESTONE UNLOCKED: ${currentDials} Dials — ${ms.name}!`);
  }

  saveLeadOverrideHelper(p.id, { status });

  if (status === 'discovery_booked') {
    playSound('chime');
    if (typeof window !== "undefined" && typeof window.triggerHaptic === "function") {
      window.triggerHaptic([35, 50, 35]);
    }
    if (window.Player3D && typeof window.Player3D.celebrateVictory === "function") {
      window.Player3D.celebrateVictory();
    }
    if (window.System1Brain && typeof window.System1Brain.emitThought === "function") {
      window.System1Brain.emitThought("⚡ DISCOVERY BOOKED! HARD-LIGHT SALUTE ONLINE!");
    }
    alert(`🎉 DISCOVERY BOOKED WITH ${p.name}! Set the time below and tap "Open Google Calendar & Meet Invite".`);
  } else {
    if (typeof window !== "undefined" && typeof window.triggerHaptic === "function") {
      window.triggerHaptic([35, 40, 35]);
    }
    playSound('click');
    const user = getCurrentUser();
    showNotification(`Logged outcome '${status.replace('_', ' ')}' by ${user?.name || 'Caller'}`);
  }
  resetCallWorkflowState();
  renderQueueHelper();
  renderActiveProspectHelper();
  updateProfileDropdownUIHelper();
}

function markDNC() {
  const p = getGlobalProspects().find(item => item.id === getSelectedId());
  if (!p) return;
  if (confirm(`Permanently exclude ${p.name} from active client radar outreach?`)) {
    stopCallTimer();
    resetCallWorkflowState();
    p.status = 'blacklisted';
    saveLeadOverrideHelper(p.id, { status: 'blacklisted' });
    broadcastDNCHelper(p.id);
    renderQueueHelper();
    renderActiveProspectHelper();
    updateProfileDropdownUIHelper();
  }
}

function updateDialProgress() {
  const dials = getDialsToday();
  const maxGoal = 20;
  const pct = Math.min(100, Math.round((dials / maxGoal) * 100));
  const bar = document.getElementById('dialProgressBar');
  if (bar) bar.style.width = `${pct}%`;
  const countEl = document.getElementById('dialCountText');
  if (countEl) countEl.innerText = `${dials} / ${maxGoal}`;
}

// 1-Click Google Calendar & Meet Invite Generator
function generateGoogleCalendarInvite() {
  playSound('click');
  const p = getGlobalProspects().find(item => item.id === getSelectedId());
  const dateInput = document.getElementById('discoveryInput').value;
  if (!p) return;

  if (typeof recordPartnerActivity === 'function') {
    recordPartnerActivityHelper('DISCOVERY_BOOKED', getSelectedId(), { client: p.name, discoveryTime: dateInput || 'tomorrow' });
  }

  let startTime = '';
  let endTime = '';

  if (dateInput) {
    const d = new Date(dateInput);
    const end = new Date(d.getTime() + 15 * 60000); // 15 mins
    startTime = d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    endTime = end.toISOString().replace(/-|:|\.\d\d\d/g, '');
  } else {
    const tomorrow = new Date(Date.now() + 86400000);
    tomorrow.setHours(16, 0, 0, 0);
    const end = new Date(tomorrow.getTime() + 15 * 60000);
    startTime = tomorrow.toISOString().replace(/-|:|\.\d\d\d/g, '');
    endTime = end.toISOString().replace(/-|:|\.\d\d\d/g, '');
  }

  const title = encodeURIComponent(`Apoorv <> ${p.name} | Website Performance Walkthrough`);
  const details = encodeURIComponent(
    `Walkthrough on Apoorv's behalf with ${p.dm} (${p.name}).\n` +
    `Focus: Mobile speed optimization, conversion triage, and high-performance UI.\n` +
    `Booked by: ${currentUser?.name || 'Caller'} (${currentUser?.email || 'studio'}).\n` +
    `Join with Google Meet: https://meet.google.com/new`
  );
  const location = encodeURIComponent('Google Meet Video Call');

  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
  window.open(gcalUrl, '_blank');
}

// 15-Second Voice Memo Debrief
async function toggleVoiceRecording() {
  const btn = document.getElementById('recordVoiceBtn');
  const dot = document.getElementById('recordDot');
  const text = document.getElementById('recordText');
  const audio = document.getElementById('audioPlayback');

  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        recordedAudioBlob = audioBlob;
        const audioUrl = URL.createObjectURL(audioBlob);
        audio.src = audioUrl;
        audio.classList.remove('hidden');
        const aiBtn = document.getElementById('aiTranscribeBtn');
        if (aiBtn) aiBtn.classList.remove('hidden');
        showNotification('[AUDIO] 15s Voice Memo recorded and attached to lead notes!');
      };

      mediaRecorder.start();
      isRecording = true;
      dot.classList.add('animate-ping');
      text.innerText = 'Recording (Tap to Stop)...';
      btn.classList.add('bg-rose-950/60', 'border-rose-500');

      setTimeout(() => {
        if (isRecording) toggleVoiceRecording();
      }, 20000);
    } catch(e) {
      alert('Microphone access denied or not available in browser.');
    }
  } else {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    isRecording = false;
    dot.classList.remove('animate-ping');
    text.innerText = 'Record New Memo';
    btn.classList.remove('bg-rose-950/60', 'border-rose-500');
  }
}


  function selectProspectHelper(id) {
    if (typeof root.selectProspect === 'function') root.selectProspect(id);
    else if (typeof global !== 'undefined' && typeof global.selectProspect === 'function') global.selectProspect(id);
  }

  function updateProfileDropdownUIHelper() {
    if (typeof root.updateProfileDropdownUI === 'function') root.updateProfileDropdownUI();
    else if (typeof global !== 'undefined' && typeof global.updateProfileDropdownUI === 'function') global.updateProfileDropdownUI();
  }

  function saveAndNext() {
    const user = getCurrentUser();
    const isOwner = isOwnerUserHelper(user);
    const selId = getSelectedId();

    if (callPendingDisposition && activeCallProspectId === selId && !isOwner) {
      if (!validateCallDisposition()) {
        flashDispositionGateWarning("⚠️ Complete call disposition (Reach + Outcome) before proceeding to next prospect.");
        return;
      }
    }

    if (currentCallOutcome) {
      logOutcome(currentCallOutcome);
    }

    resetCallWorkflowState();

    if (typeof root !== "undefined" && typeof root.triggerHaptic === "function") {
      root.triggerHaptic([35, 40, 35]);
    }
    playSFX('click');
    stopCallTimer();

    const prospects = getGlobalProspects();
    const p = prospects.find(item => item.id === selId);
    const notesInput = (typeof document !== 'undefined') ? document.getElementById('callNotesInput') : null;
    const discoveryInput = (typeof document !== 'undefined') ? document.getElementById('discoveryInput') : null;
    const notes = notesInput ? notesInput.value : '';
    const discoveryTime = discoveryInput ? discoveryInput.value : '';

    if (p) {
      p.notes = notes;
      p.discoveryTime = discoveryTime;
      if (p.status === 'closed_won' || currentCallOutcome === 'closed_won') {
        p.status = 'closed_won';
        broadcastUnlockHelper(p.id, 'closed_won');
        saveLeadOverrideHelper(p.id, { status: 'closed_won', notes, closedTier: p.closedTier || 1, depositPaid: p.depositPaid || 25000 });
        playSFX('chime');
        if (typeof root.SFX !== 'undefined' && typeof root.SFX.playCelebrate === 'function') {
          try { root.SFX.playCelebrate(); } catch(e) {}
        }
        if (typeof root.Player3D !== 'undefined' && typeof root.Player3D.celebrateVictory === "function") {
          root.Player3D.celebrateVictory();
        }
        notify(`[SUCCESS] 50% Deposit & Deal Closed for ${p.name}!`);
      } else if (discoveryTime) {
        p.status = 'discovery_booked';
        broadcastUnlockHelper(p.id, 'discovery_booked');
        saveLeadOverrideHelper(p.id, { status: 'discovery_booked', notes, discoveryTime });
        playSFX('chime');
        if (typeof root.Player3D !== 'undefined' && typeof root.Player3D.celebrateVictory === "function") {
          root.Player3D.celebrateVictory();
        }
        notify(`[SUCCESS] Discovery booked for ${p.name} at ${discoveryTime}!`);
      } else {
        broadcastUnlockHelper(p.id, p.status);
        saveLeadOverrideHelper(p.id, { status: p.status, notes });
      }
    }

    if (notesInput) notesInput.value = '';
    if (discoveryInput) discoveryInput.value = '';
    updateProfileDropdownUIHelper();

    const activeCity = (typeof root.activeCityFilter !== 'undefined') ? root.activeCityFilter : 'All';
    const matchSearchFn = (typeof root.matchSearch === 'function') ? root.matchSearch : () => true;
    const filtered = prospects.filter(item => (activeCity === 'All' || item.city === activeCity) && matchSearchFn(item));
    const curIdx = filtered.findIndex(item => item.id === selId);
    if (curIdx < filtered.length - 1) {
      selectProspectHelper(filtered[curIdx + 1].id);
    }
  }

  const WorkspaceInCallEngine = {
    startCallTimer,
    stopCallTimer,
    setCallReach,
    setCallOutcome,
    appendNoteTag,
    cancelActiveDial,
    resetCallWorkflowState,
    validateCallDisposition,
    updateCallHUDState,
    toggleCallHUDSteps,
    switchDossierTab,
    toggleDossierCollapse,
    updateReachUI,
    updateOutcomeUI,
    updateOutcomeOptionsUI,
    flashDispositionGateWarning,
    canAdvanceLead,
    setAngle,
    setScriptMode,
    toggleLivePhoneChallenge,
    triggerLivePhoneChallenge,
    setLang,
    showLaymanAnalogy,
    switchAnalogyLang,
    speakCurrentAnalogy,
    copyCurrentAnalogy,
    appendCurrentAnalogyToNotes,
    closeLaymanAnalogy,
    switchDossierLang,
    copyTalkTrack,
    speakTalkTrack,
    updateScriptUI,
    toggleObjection,
    closeObjectionBox,
    toggleObjectionLang,
    appendActiveObjectionToNotes,
    showNotesSaveIndicator,
    saveNotesLocally,
    logOutcome,
    markDNC,
    updateDialProgress,
    generateGoogleCalendarInvite,
    toggleVoiceRecording,
    getCallWorkflowState,
    setCallWorkflowState,
    saveAndNext
  };

  root.WorkspaceInCallEngine = WorkspaceInCallEngine;
  root.saveAndNext = saveAndNext;
  root.startCallTimer = startCallTimer;
  root.stopCallTimer = stopCallTimer;
  root.setCallReach = setCallReach;
  root.setCallOutcome = setCallOutcome;
  root.appendNoteTag = appendNoteTag;
  root.cancelActiveDial = cancelActiveDial;
  root.resetCallWorkflowState = resetCallWorkflowState;
  root.validateCallDisposition = validateCallDisposition;
  root.updateCallHUDState = updateCallHUDState;
  root.toggleCallHUDSteps = toggleCallHUDSteps;
  root.switchDossierTab = switchDossierTab;
  root.toggleDossierCollapse = toggleDossierCollapse;
  root.updateReachUI = updateReachUI;
  root.updateOutcomeUI = updateOutcomeUI;
  root.updateOutcomeOptionsUI = updateOutcomeOptionsUI;
  root.flashDispositionGateWarning = flashDispositionGateWarning;
  root.canAdvanceLead = canAdvanceLead;
  root.setAngle = setAngle;
  root.setScriptMode = setScriptMode;
  root.toggleLivePhoneChallenge = toggleLivePhoneChallenge;
  root.triggerLivePhoneChallenge = triggerLivePhoneChallenge;
  root.setLang = setLang;
  root.showLaymanAnalogy = showLaymanAnalogy;
  root.switchAnalogyLang = switchAnalogyLang;
  root.speakCurrentAnalogy = speakCurrentAnalogy;
  root.copyCurrentAnalogy = copyCurrentAnalogy;
  root.appendCurrentAnalogyToNotes = appendCurrentAnalogyToNotes;
  root.closeLaymanAnalogy = closeLaymanAnalogy;
  root.switchDossierLang = switchDossierLang;
  root.copyTalkTrack = copyTalkTrack;
  root.speakTalkTrack = speakTalkTrack;
  root.updateScriptUI = updateScriptUI;
  root.toggleObjection = toggleObjection;
  root.closeObjectionBox = closeObjectionBox;
  root.toggleObjectionLang = toggleObjectionLang;
  root.appendActiveObjectionToNotes = appendActiveObjectionToNotes;
  root.showNotesSaveIndicator = showNotesSaveIndicator;
  root.saveNotesLocally = saveNotesLocally;
  root.logOutcome = logOutcome;
  root.markDNC = markDNC;
  root.updateDialProgress = updateDialProgress;
  root.generateGoogleCalendarInvite = generateGoogleCalendarInvite;
  root.toggleVoiceRecording = toggleVoiceRecording;
  root.getCallWorkflowState = getCallWorkflowState;
  root.setCallWorkflowState = setCallWorkflowState;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkspaceInCallEngine;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
