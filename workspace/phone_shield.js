// Client Radar — Sovereign Anti-Theft Moat, Contact Masking & Steganography Engine
// Strictly On Apoorv's Behalf

(function(root) {
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

  function isApoorvOwnerEmail(email) {
    if (typeof root.isApoorvOwnerEmail === 'function' && root.isApoorvOwnerEmail !== isApoorvOwnerEmail) return root.isApoorvOwnerEmail(email);
    if (typeof global !== 'undefined' && typeof global.isApoorvOwnerEmail === 'function' && global.isApoorvOwnerEmail !== isApoorvOwnerEmail) return global.isApoorvOwnerEmail(email);
    if (!email || typeof email !== 'string') return false;
    const n = email.toLowerCase().trim().replace(/\./g, '');
    return n === 'apoorvxs@gmailcom';
  }

  function showNotification(msg) {
    const bar = (typeof document !== 'undefined' && document.getElementById) ? document.getElementById('lockNotificationBar') : null;
    const msgSpan = (typeof document !== 'undefined' && document.getElementById) ? document.getElementById('liveStatusMsg') : null;
    if (msgSpan) msgSpan.innerText = msg;
    if (bar && bar.classList && typeof bar.classList.add === 'function') {
      bar.classList.add('bg-rose-950/80', 'text-rose-200');
    }
    if (typeof global !== 'undefined' && typeof global.showNotification === 'function') {
      try { global.showNotification(msg); } catch (e) {}
    } else if (typeof root.showNotification === 'function') {
      try { root.showNotification(msg); } catch (e) {}
    }
  }

  function notify(msg) {
    showNotification(msg);
  }

  function recordActivity(action, id, details) {
    if (typeof root.recordPartnerActivity === 'function') root.recordPartnerActivity(action, id, details);
    else if (typeof global !== 'undefined' && typeof global.recordPartnerActivity === 'function') global.recordPartnerActivity(action, id, details);
  }

/* ==========================================================================
   SOVEREIGN ANTI-THEFT MOAT & CONTACT MASKING RELAY
   Role-based phone masking, hourly velocity limit, and steganography
   ========================================================================== */
const sessionUnmaskedProspects = new Set();
const UNMASK_LIMIT_PER_HOUR = 10;

function maskPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return '--';
  const clean = phone.trim();
  if (clean.length <= 5) return '•••••';
  const prefix = clean.slice(0, clean.length - 5);
  return `${prefix}•••••`;
}

function isProspectPhoneUnmasked(prospectId) {
  if (!prospectId) return false;
  return sessionUnmaskedProspects.has(prospectId);
}

function checkUnmaskVelocity() {
  const user = (typeof window !== 'undefined' && window.currentUser)
    ? window.currentUser
    : ((typeof global !== 'undefined' && global.currentUser)
      ? global.currentUser
      : ((typeof currentUser !== 'undefined' && currentUser) ? currentUser : null));
  const email = user?.email || 'guest';
  if ((typeof isApoorvOwnerEmail === 'function' && isApoorvOwnerEmail(email)) || (email === 'apoorvxs@gmail.com')) {
    return { allowed: true, count: 0, limit: UNMASK_LIMIT_PER_HOUR };
  }

  const key = `sprintdial_unmask_velocity_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  let history = [];
  try {
    if (typeof localStorage !== 'undefined') {
      history = JSON.parse(localStorage.getItem(key) || '[]');
    }
  } catch (e) {
    history = [];
  }

  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  history = history.filter(ts => ts > oneHourAgo);

  if (history.length >= UNMASK_LIMIT_PER_HOUR) {
    return { allowed: false, count: history.length, limit: UNMASK_LIMIT_PER_HOUR };
  }
  return { allowed: true, count: history.length, limit: UNMASK_LIMIT_PER_HOUR };
}

function recordUnmaskVelocity(prospectId) {
  const user = (typeof window !== 'undefined' && window.currentUser)
    ? window.currentUser
    : ((typeof global !== 'undefined' && global.currentUser)
      ? global.currentUser
      : ((typeof currentUser !== 'undefined' && currentUser) ? currentUser : null));
  const email = user?.email || 'guest';
  const key = `sprintdial_unmask_velocity_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  let history = [];
  try {
    if (typeof localStorage !== 'undefined') {
      history = JSON.parse(localStorage.getItem(key) || '[]');
    }
  } catch (e) {
    history = [];
  }
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  history = history.filter(ts => ts > oneHourAgo);
  history.push(now);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(history));
    }
  } catch (e) {}
}

function unmaskProspectPhone(prospectId) {
  if (!prospectId && typeof selectedProspectId !== 'undefined') {
    prospectId = selectedProspectId;
  }
  if (!prospectId) return false;

  const prospectsList = (typeof window !== 'undefined' && Array.isArray(window.PROSPECTS) && window.PROSPECTS.length > 0)
    ? window.PROSPECTS
    : ((typeof global !== 'undefined' && Array.isArray(global.PROSPECTS) && global.PROSPECTS.length > 0)
      ? global.PROSPECTS
      : ((typeof PROSPECTS !== 'undefined' && Array.isArray(PROSPECTS)) ? PROSPECTS : []));
  const p = prospectsList.find(item => item.id === prospectId);
  if (!p) return false;

  const user = (typeof window !== 'undefined' && window.currentUser)
    ? window.currentUser
    : ((typeof global !== 'undefined' && global.currentUser)
      ? global.currentUser
      : ((typeof currentUser !== 'undefined' && currentUser) ? currentUser : null));
  const email = user?.email || '';
  const isOwner = (typeof isApoorvOwnerEmail === 'function' && isApoorvOwnerEmail(email)) || (email === 'apoorvxs@gmail.com');

  if (isOwner || sessionUnmaskedProspects.has(prospectId)) {
    sessionUnmaskedProspects.add(prospectId);
    if (typeof renderActiveProspect === 'function') renderActiveProspect();
    return true;
  }

  const check = checkUnmaskVelocity();
  if (!check.allowed) {
    if (typeof showNotification === 'function') {
      showNotification(`[ALERT] Unmask rate limit reached (${check.count}/${check.limit} per hr). Contact Apoorv for bulk clearance.`);
    }
    if (typeof recordPartnerActivity === 'function') {
      recordPartnerActivity('UNMASK_VELOCITY_EXCEEDED', prospectId, {
        prospectName: p.name,
        velocityCount: check.count,
        limit: check.limit
      });
    }
    return false;
  }

  recordUnmaskVelocity(prospectId);
  sessionUnmaskedProspects.add(prospectId);

  const remaining = check.limit - (check.count + 1);
  if (typeof recordPartnerActivity === 'function') {
    recordPartnerActivity('CONTACT_UNMASKED', prospectId, {
      prospectName: p.name,
      phone: p.phone || p.tel,
      remaining
    });
  }

  if (typeof showNotification === 'function') {
    showNotification(`[UNMASK] Contact unmasked (${remaining} unmasks remaining this hour)`);
  }
  if (typeof renderActiveProspect === 'function') renderActiveProspect();
  return true;
}

function toggleUnmaskActiveProspectPhone() {
  if (typeof selectedProspectId !== 'undefined' && selectedProspectId) {
    if (sessionUnmaskedProspects.has(selectedProspectId)) {
      sessionUnmaskedProspects.delete(selectedProspectId);
      if (typeof renderActiveProspect === 'function') renderActiveProspect();
    } else {
      unmaskProspectPhone(selectedProspectId);
    }
  }
}

function handleCallAction(event) {
  if (event && event.preventDefault) event.preventDefault();
  const prospectsList = (typeof PROSPECTS !== 'undefined' && Array.isArray(PROSPECTS)) ? PROSPECTS : [];
  const p = prospectsList.find(item => item.id === selectedProspectId);
  if (!p) return;
  const unmasked = unmaskProspectPhone(p.id);
  if (unmasked) {
    handleCallInitiated();
    if (p.tel && typeof window !== 'undefined') {
      window.location.href = `tel:${p.tel}`;
    }
  }
}

function handleWhatsAppAction(event) {
  if (event && event.preventDefault) event.preventDefault();
  const prospectsList = (typeof PROSPECTS !== 'undefined' && Array.isArray(PROSPECTS)) ? PROSPECTS : [];
  const p = prospectsList.find(item => item.id === selectedProspectId);
  if (!p) return;
  const unmasked = unmaskProspectPhone(p.id);
  if (unmasked) {
    if (typeof recordPartnerActivity === 'function') {
      recordPartnerActivity('TEARDOWN_PITCH', p.id, { client: p.name, mode: 'whatsapp_brief' });
    }
    const waUrl = generateWhatsAppBrief(p);
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    }
  }
}

/* ==========================================================================
   CRYPTOGRAPHIC & STEGANOGRAPHIC CLIPBOARD TAINTING
   Zero-width unicode watermarking for leak forensics
   ========================================================================== */
const ZW_SPACE = '\u200B';        // binary 0
const ZW_NON_JOINER = '\u200C';   // binary 1
const ZW_JOINER = '\u200D';       // delimiter

function encodeSteganographicTag(payload) {
  if (!payload || typeof payload !== 'string') return '';
  let binary = '';
  for (let i = 0; i < payload.length; i++) {
    binary += payload.charCodeAt(i).toString(2).padStart(8, '0');
  }
  let encoded = '';
  for (let i = 0; i < binary.length; i++) {
    encoded += (binary[i] === '1') ? ZW_NON_JOINER : ZW_SPACE;
  }
  return ZW_JOINER + encoded + ZW_JOINER;
}

function decodeSteganographicTag(text) {
  if (!text || typeof text !== 'string') return null;
  const start = text.indexOf(ZW_JOINER);
  if (start === -1) return null;
  const end = text.lastIndexOf(ZW_JOINER);
  if (end <= start) return null;

  const encoded = text.substring(start + 1, end);
  let binary = '';
  for (let i = 0; i < encoded.length; i++) {
    const ch = encoded[i];
    if (ch === ZW_NON_JOINER) binary += '1';
    else if (ch === ZW_SPACE) binary += '0';
  }
  if (binary.length === 0 || binary.length % 8 !== 0) return null;

  let decoded = '';
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substr(i, 8);
    decoded += String.fromCharCode(parseInt(byte, 2));
  }
  return decoded;
}

function taintAttributedText(originalText, contentType = 'brief') {
  if (!originalText || typeof originalText !== 'string') return originalText || '';
  const user = (typeof currentUser !== 'undefined' && currentUser)
    ? currentUser
    : ((typeof window !== 'undefined' && window.currentUser)
      ? window.currentUser
      : ((typeof global !== 'undefined' && global.currentUser) ? global.currentUser : null));
  const email = user?.email || 'outreach-partner';
  const isOwner = typeof isApoorvOwnerEmail === 'function' && isApoorvOwnerEmail(email);
  if (isOwner) return originalText;

  const sessionId = (typeof window !== 'undefined' && window._shieldSessionId) ||
    ((typeof window !== 'undefined') ? (window._shieldSessionId = Math.random().toString(36).substring(2, 8).toUpperCase()) : 'SEC99');
  const timestamp = Date.now();
  const tagPayload = `OP:${email}:${sessionId}:${timestamp}`;
  const stegoTag = encodeSteganographicTag(tagPayload);

  if (typeof recordPartnerActivity === 'function' && typeof selectedProspectId !== 'undefined') {
    recordPartnerActivity('CLIPBOARD_TAINT_EXPORT', selectedProspectId, { contentType, sessionId });
  }

  const attributionFooter = `\n\n---\nVerified Client Brief • Authorized via Apoorv A S (apoorv.qzz.io) • Ref #${sessionId}`;
  return originalText + stegoTag + attributionFooter;
}

// Global copy interception on confidential areas
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('copy', (e) => {
    const user = (typeof currentUser !== 'undefined' && currentUser)
      ? currentUser
      : ((typeof window !== 'undefined' && window.currentUser)
        ? window.currentUser
        : ((typeof global !== 'undefined' && global.currentUser) ? global.currentUser : null));
    const email = user?.email || '';
    if (typeof isApoorvOwnerEmail === 'function' && isApoorvOwnerEmail(email)) {
      return; // Never taint owner's manual copy
    }

    const selection = (typeof window !== 'undefined' && window.getSelection) ? window.getSelection() : null;
    if (!selection || selection.rangeCount === 0) return;
    const selectedText = selection.toString();
    if (!selectedText || selectedText.trim().length < 10) return;

    const anchorNode = selection.anchorNode;
    const targetEl = (anchorNode && anchorNode.nodeType === 1) ? anchorNode : anchorNode?.parentElement;
    if (!targetEl) return;

    const isProtected = targetEl.closest && targetEl.closest('#dossierPane, #proposalModal, #clientTeardownModal, #callConsolePane, #objectionBox');
    if (isProtected && e.clipboardData) {
      e.preventDefault();
      const tainted = taintAttributedText(selectedText, 'manual_selection_copy');
      e.clipboardData.setData('text/plain', tainted);
      if (typeof showNotification === 'function') {
        showNotification('[COPIED] Text copied with cryptographic attribution footer');
      }
    }
  });
}


  const WorkspacePhoneShield = {
    sessionUnmaskedProspects,
    UNMASK_LIMIT_PER_HOUR,
    maskPhoneNumber,
    isProspectPhoneUnmasked,
    checkUnmaskVelocity,
    recordUnmaskVelocity,
    unmaskProspectPhone,
    toggleUnmaskActiveProspectPhone,
    handleCallAction,
    handleWhatsAppAction,
    encodeSteganographicTag,
    decodeSteganographicTag,
    taintAttributedText
  };

  root.WorkspacePhoneShield = WorkspacePhoneShield;
  root.maskPhoneNumber = maskPhoneNumber;
  root.isProspectPhoneUnmasked = isProspectPhoneUnmasked;
  root.checkUnmaskVelocity = checkUnmaskVelocity;
  root.recordUnmaskVelocity = recordUnmaskVelocity;
  root.unmaskProspectPhone = unmaskProspectPhone;
  root.toggleUnmaskActiveProspectPhone = toggleUnmaskActiveProspectPhone;
  root.handleCallAction = handleCallAction;
  root.handleWhatsAppAction = handleWhatsAppAction;
  root.encodeSteganographicTag = encodeSteganographicTag;
  root.decodeSteganographicTag = decodeSteganographicTag;
  root.taintAttributedText = taintAttributedText;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkspacePhoneShield;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
