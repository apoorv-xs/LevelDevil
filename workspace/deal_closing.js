// Client Radar — Two-Track Deal Closing & Sovereign In-Call Payment Terminal
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

  function getSelectedId() {
    return (typeof root.selectedProspectId !== 'undefined' && root.selectedProspectId)
      ? root.selectedProspectId
      : ((typeof global !== 'undefined' && global.selectedProspectId) ? global.selectedProspectId : 'p-1');
  }

  function getCurrentUser() {
    return (typeof root.currentUser !== 'undefined' && root.currentUser)
      ? root.currentUser
      : ((typeof global !== 'undefined' && global.currentUser) ? global.currentUser : null);
  }

  function playSFX(type) {
    if (typeof root.playSound === 'function') root.playSound(type);
    else if (typeof global !== 'undefined' && typeof global.playSound === 'function') global.playSound(type);
  }

  function notify(msg) {
    if (typeof root.showNotification === 'function') root.showNotification(msg);
    else if (typeof global !== 'undefined' && typeof global.showNotification === 'function') global.showNotification(msg);
  }

// TWO-TRACK DEAL CLOSING ENGINE & SOVEREIGN IN-CALL PAYMENT TERMINAL
// Track 1: Direct Partner Close (15% commission) with 50% UPI QR code
// Track 2: Principal Escalation (10% safety net) with Executive Handoff Brief
// ==========================================================================
let currentDealTier = 1;

const DEAL_TIERS = {
  1: {
    tierNum: 1,
    name: "Tier 1: Speed & Direct Booking Engine",
    total: 50000,
    advance: 25000,
    commission: 7500,
    summary: "0.8s mobile paint, 1-tap WhatsApp consultation booking, DPDP Act 2023 compliance shield, 60 FPS performance floor."
  },
  2: {
    tierNum: 2,
    name: "Tier 2: Interactive 3D Showcase & Spatial UI",
    total: 100000,
    advance: 50000,
    commission: 15000,
    summary: "All Tier 1 features plus bespoke Three.js 3D spatial interactive showcase, dynamic lighting, and mobile 60 FPS guarantee."
  },
  3: {
    tierNum: 3,
    name: "Tier 3: Flagship Custom WebGPU Engine",
    total: 200000,
    advance: 100000,
    commission: 30000,
    summary: "Full WebGPU custom procedural shaders, real-time 3D configurator, multi-channel direct intake, and dedicated SLA handover."
  }
};

function selectDealTier(tierNum) {
  currentDealTier = tierNum;
  playSound('click');
  [1, 2, 3].forEach(t => {
    const btn = document.getElementById(`dealTier${t}`);
    if (btn) {
      if (t === tierNum) {
        btn.classList.add('active', 'bg-[#fce566]');
        btn.classList.remove('bg-[#fffdf1]');
        btn.setAttribute('aria-checked', 'true');
      } else {
        btn.classList.remove('active', 'bg-[#fce566]');
        btn.classList.add('bg-[#fffdf1]');
        btn.setAttribute('aria-checked', 'false');
      }
    }
  });

  const p = PROSPECTS.find(item => item.id === selectedProspectId);
  const tier = DEAL_TIERS[tierNum] || DEAL_TIERS[1];

  const totalEl = document.getElementById('dealSummaryTotal');
  const advEl = document.getElementById('dealSummaryAdvance');
  const commEl = document.getElementById('dealSummaryCommission');
  const shareInput = document.getElementById('dealShareUrl');
  const qrImg = document.getElementById('dealUpiQrImg');

  if (totalEl) totalEl.innerText = `₹${tier.total.toLocaleString('en-IN')}`;
  if (advEl) advEl.innerText = `₹${tier.advance.toLocaleString('en-IN')}`;
  if (commEl) commEl.innerText = `₹${tier.commission.toLocaleString('en-IN')}`;

  const clientName = p ? p.name : 'Client';
  const cleanId = p ? p.id : 'deal';
  const upiIntent = `upi://pay?pa=apoorvxs@okaxis&pn=Apoorv%20A%20S&am=${tier.advance}&cu=INR&tn=${encodeURIComponent(`50% Advance ${clientName.slice(0, 20)}`)}`;
  
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(upiIntent)}`;
  }

  const callerUser = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : (window.currentUser || {});
  const partnerId = callerUser.sub || callerUser.uid || 'partner';
  const clientProposalUrl = `https://apoorv.qzz.io/sales?proposal=${encodeURIComponent(cleanId)}&fee=${tier.total}&partner=${encodeURIComponent(partnerId)}`;
  if (shareInput) shareInput.value = clientProposalUrl;
}

function openDealCommitmentModal(prospectId) {
  const p = PROSPECTS.find(item => item.id === (prospectId || selectedProspectId));
  if (!p) return;
  playSound('click');

  const nameEl = document.getElementById('dealClientName');
  const dmEl = document.getElementById('dealClientDm');
  if (nameEl) nameEl.innerText = p.name;
  if (dmEl) dmEl.innerText = (p.dm || 'Decision Maker').split('(')[0].trim();

  selectDealTier(1);
  const modal = document.getElementById('dealCommitmentModal');
  if (modal) modal.classList.remove('hidden');
}

function closeDealCommitmentModal() {
  playSound('click');
  const modal = document.getElementById('dealCommitmentModal');
  if (modal) modal.classList.add('hidden');
}

function copyUpiId() {
  playSound('click');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText('apoorvxs@okaxis').then(() => {
      showNotification('[COPIED] UPI ID apoorvxs@okaxis copied!');
    });
  }
}

function copyDealProposalLink() {
  playSound('click');
  const shareInput = document.getElementById('dealShareUrl');
  const url = shareInput?.value || '';
  if (!url) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      playSound('chime');
      showNotification('[SYS] Client Proposal & 50% Deposit URL copied to clipboard!');
    });
  } else {
    shareInput?.select();
    showNotification('[COPIED] Link selected — press Ctrl+C / Cmd+C to copy');
  }
}

function sendWhatsAppDealCommitment() {
  const p = PROSPECTS.find(item => item.id === selectedProspectId);
  if (!p) return;
  playSound('click');

  const tier = DEAL_TIERS[currentDealTier] || DEAL_TIERS[1];
  const callerUser = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : (window.currentUser || {});
  const callerName = callerUser.displayName || callerUser.name || 'Authorized Outreach Partner';
  const partnerId = callerUser.sub || callerUser.uid || 'partner';
  const url = `https://apoorv.qzz.io/sales?proposal=${encodeURIComponent(p.id)}&fee=${tier.total}&partner=${encodeURIComponent(partnerId)}`;

  const cleanPhone = (p.phone || '').replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const cleanDm = (p.dm || 'Director').split('(')[0].trim();
  const cleanName = (p.name || 'Establishment').split(',')[0].trim();

  const msg = `Namaste ${cleanDm},\n\nFollowing our discussion regarding ${cleanName}:\n\nHere is your official Executive Proposal & 1-Page Milestone SOW from Apoorv A S (Creative Technologist & 3D WebUI Architect):\n\nPackage: ${tier.name}\nTotal Investment: ₹${tier.total.toLocaleString('en-IN')}\n50% Kickoff Advance: ₹${tier.advance.toLocaleString('en-IN')}\n\n60 FPS PERFORMANCE SLA GUARANTEE:\nIf your delivered site fails to achieve a locked 60 FPS floor or Core Web Vitals pass on modern mobile, Apoorv guarantees a 100% full refund of your deposit.\n\nReview Proposal & Pay Deposit via UPI/Card:\n${url}\n\nUPI ID: apoorvxs@okaxis\n\nWarm regards,\n${callerName}\nOffice of Apoorv A S | https://apoorv.qzz.io`;

  const waLink = targetPhone
    ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;

  if (typeof recordPartnerActivity === 'function') {
    recordPartnerActivity('PROPOSAL_DISPATCH', selectedProspectId, { client: p.name, tier: currentDealTier, url });
  }

  if (typeof window !== "undefined") {
    window.open(waLink, '_blank');
  }
}

function confirmDealDepositReceived() {
  const p = PROSPECTS.find(item => item.id === selectedProspectId);
  if (!p) return;
  playSound('chime');

  const tier = DEAL_TIERS[currentDealTier] || DEAL_TIERS[1];
  p.status = 'closed_won';
  p.closedTier = tier.tierNum;
  p.depositPaid = tier.advance;
  p.notes = (p.notes ? `${p.notes}\n` : '') + `[CLOSED WON] Deposit of ₹${tier.advance.toLocaleString('en-IN')} confirmed on ${new Date().toLocaleDateString('en-IN')}. Commission: ₹${tier.commission.toLocaleString('en-IN')}.`;

  saveLeadOverride(p.id, {
    status: 'closed_won',
    closedTier: tier.tierNum,
    depositPaid: tier.advance,
    notes: p.notes
  });

  if (typeof recordPartnerActivity === 'function') {
    recordPartnerActivity('DEAL_CLOSED', p.id, {
      client: p.name,
      tier: tier.tierNum,
      fee: tier.total,
      advance: tier.advance,
      commission: tier.commission
    });
  }

  if (window.SFX && typeof window.SFX.playCelebrate === 'function') {
    try { window.SFX.playCelebrate(); } catch(e) {}
  }
  if (window.Player3D && typeof window.Player3D.celebrateVictory === 'function') {
    try { window.Player3D.celebrateVictory(); } catch(e) {}
  }
  if (typeof window.triggerHaptic === 'function') {
    window.triggerHaptic([50, 100, 50, 100]);
  }

  showNotification(`[SUCCESS] 50% Deposit Confirmed! Deal Closed & Commission of ₹${tier.commission.toLocaleString('en-IN')} Unlocked!`);
  closeDealCommitmentModal();
  updateProfileDropdownUI();
}

// Track 2: Executive Handoff to Apoorv
function openExecutiveHandoffModal(prospectId) {
  const p = PROSPECTS.find(item => item.id === (prospectId || selectedProspectId));
  if (!p) return;
  playSound('click');

  const nameEl = document.getElementById('handoffClientName');
  if (nameEl) nameEl.innerText = `${p.name} (${(p.dm || 'Owner').split('(')[0].trim()})`;

  const timeInp = document.getElementById('handoffMeetingTime');
  if (timeInp && !timeInp.value) {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    tomorrow.setHours(15, 0, 0, 0);
    const pad = n => String(n).padStart(2, '0');
    timeInp.value = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
  }

  const notesEl = document.getElementById('handoffContextNotes');
  if (notesEl && (!notesEl.value || notesEl.value.trim() === '')) {
    const callNotes = document.getElementById('callNotesInput')?.value?.trim();
    notesEl.value = callNotes || `Client interested in 60 FPS mobile overhaul; requested Google Meet walkthrough with Apoorv regarding ${p.techStack || 'web'} architecture.`;
  }

  updateHandoffBriefPreview();
  const modal = document.getElementById('executiveHandoffModal');
  if (modal) modal.classList.remove('hidden');
}

function closeExecutiveHandoffModal() {
  playSound('click');
  const modal = document.getElementById('executiveHandoffModal');
  if (modal) modal.classList.add('hidden');
}

function getExecutiveHandoffBriefText() {
  const p = PROSPECTS.find(item => item.id === selectedProspectId);
  if (!p) return '';

  const callerUser = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : (window.currentUser || {});
  const callerName = callerUser.displayName || callerUser.name || 'Authorized Partner';
  const partnerId = callerUser.sub || callerUser.uid || 'partner';

  const timeVal = document.getElementById('handoffMeetingTime')?.value || 'Tomorrow at 3:00 PM';
  const formattedTime = new Date(timeVal).toLocaleString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const contextNotes = document.getElementById('handoffContextNotes')?.value?.trim() || 'Client requested direct architecture walkthrough with Apoorv.';

  return `EXECUTIVE HANDOFF BRIEF FOR APOORV
Target Enterprise: ${p.name}
Decision Maker: ${p.dm} (Phone: ${p.phone || 'N/A'})
Meeting Slot: ${formattedTime} (Google Meet)
Referred By: ${callerName} (ID: ${partnerId}) -> 10% Referral Safety Net Active

DETECTED TELEMETRY & BOTTLENECKS:
- Detected Stack: ${p.techStack || 'WordPress'}
- Mobile 4G LCP: ${p.lcpTime || '4.4s'} (Benchmark: < 0.8s)
- Est. Revenue Leak: ${p.revenueLeak || '₹1,80,000/mo'}
- Aggregator Bleed: ${p.wastedSpend || '₹42,000/yr'}

KEY QUESTIONS & DISCUSSION CONTEXT:
${contextNotes}

LIVE WEAPONS & CLOSING RAILS:
- Interactive Teardown: https://apoorv.qzz.io/sales?prospect=${encodeURIComponent(p.id)}&ref=${encodeURIComponent(partnerId)}
- Live Closing Terminal: https://apoorv.qzz.io/sales?proposal=${encodeURIComponent(p.id)}&fee=50000&partner=${encodeURIComponent(partnerId)}`;
}

function updateHandoffBriefPreview() {
  const previewEl = document.getElementById('handoffBriefPreview');
  if (previewEl) {
    previewEl.textContent = getExecutiveHandoffBriefText();
  }
}

function copyHandoffBriefText() {
  playSound('click');
  const text = getExecutiveHandoffBriefText();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      playSound('chime');
      showNotification('[COPIED] Executive Handoff Brief copied to clipboard!');
    });
  }
}

function generateApoorvMeetInvite() {
  playSound('click');
  const p = PROSPECTS.find(item => item.id === selectedProspectId);
  if (!p) return;

  const timeVal = document.getElementById('handoffMeetingTime')?.value;
  const startDate = timeVal ? new Date(timeVal) : new Date(Date.now() + 24 * 3600 * 1000);
  const endDate = new Date(startDate.getTime() + 15 * 60 * 1000);
  const formatGCalDate = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const callerUser = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : (window.currentUser || {});
  const partnerEmail = callerUser.email || '';

  const title = encodeURIComponent(`15-Min Strategy Walkthrough: ${p.name} & Apoorv A S`);
  const details = encodeURIComponent(getExecutiveHandoffBriefText());
  const location = encodeURIComponent('Google Meet Video Call');
  const dates = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;

  let gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  gcalUrl += `&add=apoorvxs@gmail.com`;
  if (partnerEmail) gcalUrl += `&add=${encodeURIComponent(partnerEmail)}`;

  if (typeof window !== "undefined") {
    window.open(gcalUrl, '_blank');
  }
}

function sendHandoffBriefToApoorv() {
  playSound('click');
  const brief = getExecutiveHandoffBriefText();
  const waUrl = `https://wa.me/?text=${encodeURIComponent(brief)}`;
  if (typeof window !== "undefined") {
    window.open(waUrl, '_blank');
  }
}

function saveHandoffAndAdvance() {
  const p = PROSPECTS.find(item => item.id === selectedProspectId);
  if (!p) return;
  playSound('chime');

  const timeVal = document.getElementById('handoffMeetingTime')?.value;
  const formattedTime = timeVal ? new Date(timeVal).toLocaleString('en-IN') : 'Tomorrow';
  const contextNotes = document.getElementById('handoffContextNotes')?.value?.trim() || '';

  p.status = 'discovery_booked';
  p.discoveryTime = formattedTime;
  p.notes = (p.notes ? `${p.notes}\n` : '') + `[FORWARDED TO APOORV] Discovery Call at ${formattedTime}. Notes: ${contextNotes}`;

  saveLeadOverride(p.id, {
    status: 'discovery_booked',
    discoveryTime: formattedTime,
    notes: p.notes
  });

  const discInput = document.getElementById('discoveryInput');
  if (discInput) discInput.value = formattedTime;

  closeExecutiveHandoffModal();
  showNotification(`[ESCALATED] Handoff scheduled for ${p.name}! Advancing lead...`);
  saveAndNext();
}


  const WorkspaceDealClosingEngine = {
    DEAL_TIERS,
    selectDealTier,
    openDealCommitmentModal,
    closeDealCommitmentModal,
    copyUpiId,
    copyDealProposalLink,
    sendWhatsAppDealCommitment,
    confirmDealDepositReceived,
    openExecutiveHandoffModal,
    closeExecutiveHandoffModal,
    getExecutiveHandoffBriefText,
    updateHandoffBriefPreview,
    copyHandoffBriefText,
    generateApoorvMeetInvite,
    sendHandoffBriefToApoorv,
    saveHandoffAndAdvance
  };

  root.DEAL_TIERS = DEAL_TIERS;
  root.selectDealTier = selectDealTier;
  root.openDealCommitmentModal = openDealCommitmentModal;
  root.closeDealCommitmentModal = closeDealCommitmentModal;
  root.copyUpiId = copyUpiId;
  root.copyDealProposalLink = copyDealProposalLink;
  root.sendWhatsAppDealCommitment = sendWhatsAppDealCommitment;
  root.confirmDealDepositReceived = confirmDealDepositReceived;
  root.openExecutiveHandoffModal = openExecutiveHandoffModal;
  root.closeExecutiveHandoffModal = closeExecutiveHandoffModal;
  root.getExecutiveHandoffBriefText = getExecutiveHandoffBriefText;
  root.updateHandoffBriefPreview = updateHandoffBriefPreview;
  root.copyHandoffBriefText = copyHandoffBriefText;
  root.generateApoorvMeetInvite = generateApoorvMeetInvite;
  root.sendHandoffBriefToApoorv = sendHandoffBriefToApoorv;
  root.saveHandoffAndAdvance = saveHandoffAndAdvance;
  root.WorkspaceDealClosingEngine = WorkspaceDealClosingEngine;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkspaceDealClosingEngine;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
