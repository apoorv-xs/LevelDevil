// Client Radar — Partner Anti-Theft Surveillance, Audit & Profile Telemetry Engine (Category C)
// Strictly On Apoorv's Behalf

(function(root) {
  const escapeHTML = (typeof root.escapeHTML === 'function') ? root.escapeHTML : function(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  };

  const isApoorvOwnerEmail = (typeof root.isApoorvOwnerEmail === 'function') ? root.isApoorvOwnerEmail : function(e) {
    if (!e || typeof e !== 'string') return false;
    const n = e.toLowerCase().trim().replace(/\./g, '');
    return n === 'apoorvxs@gmailcom';
  };

  const isOwnerUser = (typeof root.isOwnerUser === 'function') ? root.isOwnerUser : function(u) {
    if (!u) return false;
    return u.role === 'owner' || isApoorvOwnerEmail(u.email);
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

  function getDialsToday() {
    return (typeof root.dialsToday !== 'undefined')
      ? root.dialsToday
      : ((typeof global !== 'undefined' && typeof global.dialsToday !== 'undefined') ? global.dialsToday : 0);
  }

  function getSettledIds() {
    if (typeof root.getSettledCommissionIds === 'function') return root.getSettledCommissionIds();
    if (typeof global !== 'undefined' && typeof global.getSettledCommissionIds === 'function') return global.getSettledCommissionIds();
    try {
      return JSON.parse((typeof localStorage !== 'undefined' && localStorage.getItem('sprintdial_settled_commissions')) || '[]');
    } catch (e) {
      return [];
    }
  }

  function getDialMilestoneHelper(dials) {
    if (typeof root.getDialMilestone === 'function') return root.getDialMilestone(dials);
    if (typeof global !== 'undefined' && typeof global.getDialMilestone === 'function') return global.getDialMilestone(dials);
    return { level: 0, name: 'Ready', badge: '[QUEUE]', class: 'bg-white/10 text-gray-400 font-medium' };
  }

  function getShiftStreakHelper() {
    if (typeof root.getShiftStreak === 'function') return root.getShiftStreak();
    if (typeof global !== 'undefined' && typeof global.getShiftStreak === 'function') return global.getShiftStreak();
    return 1;
  }

  function showNotification(msg) {
    const bar = (typeof document !== 'undefined' && document.getElementById) ? document.getElementById('lockNotificationBar') : null;
    const msgSpan = (typeof document !== 'undefined' && document.getElementById) ? document.getElementById('liveStatusMsg') : null;
    if (msgSpan) msgSpan.innerText = msg;
    if (bar && bar.classList && typeof bar.classList.add === 'function') {
      bar.classList.add('bg-rose-950/80', 'text-rose-200');
    }
    if (typeof global !== 'undefined' && typeof global.showNotification === 'function' && global.showNotification !== showNotification) {
      try { global.showNotification(msg); } catch (e) {}
    } else if (typeof root.showNotification === 'function' && root.showNotification !== showNotification) {
      try { root.showNotification(msg); } catch (e) {}
    }
  }

  function notify(msg) {
    showNotification(msg);
  }

  function playSFX(type) {
    if (typeof root.playSound === 'function') root.playSound(type);
    else if (typeof global !== 'undefined' && typeof global.playSound === 'function') global.playSound(type);
  }

// -------------------------------------------------------------
// PARTNER ANTI-THEFT SURVEILLANCE & ACTIVITY AUDIT ENGINE
// -------------------------------------------------------------
const AUDIT_LOG_KEY = 'sprintdial_audit_log';

function getAuditLogs() {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // Strictly filter out owner account records from partner surveillance
    return parsed.filter(l => !l.isOwner && !isApoorvOwnerEmail(l.callerEmail));
  } catch (e) {
    console.warn('[Surveillance] Failed to read audit logs:', e);
    return [];
  }
}

function saveAuditLogs(logs) {
  try {
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
  } catch (e) {
    console.warn('[Surveillance] Failed to persist audit logs:', e);
  }
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'just now';
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function recordPartnerActivity(actionType, prospectId, details = {}) {
  try {
    const user = (typeof currentUser !== 'undefined' && currentUser)
      ? currentUser
      : ((typeof window !== 'undefined' && window.currentUser)
        ? window.currentUser
        : ((typeof global !== 'undefined' && global.currentUser) ? global.currentUser : null));
    const isOwner = isOwnerUser(user);
    // GUARD: Never record owner's own activity in partner surveillance
    if (isOwner || isApoorvOwnerEmail(user?.email)) return;
    const callerEmail = user?.email || 'guest-caller@internal';
    const callerName = user?.displayName || user?.name || (user?.email && !user.email.includes('internal')
      ? user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : 'Partner Rep');

    const p = prospectId ? (typeof PROSPECTS !== 'undefined' && Array.isArray(PROSPECTS) ? PROSPECTS.find(item => item.id === prospectId) : null) : null;
    const prospectName = p?.name || details?.client || details?.prospectName || 'Workspace Queue';
    const city = p?.city || details?.city || 'All';

    let isRisk = false;
    let riskLabel = 'ACTIVITY';
    let riskBadge = '[LOG] LOGGED';
    let description = `${callerName} executed ${actionType} on ${prospectName}`;

    switch (actionType) {
      case 'CSV_EXPORT':
        isRisk = true;
        riskLabel = 'CRITICAL LEAK ALERT';
        riskBadge = '[ALERT] CSV EXPORT';
        description = `${callerName} exported ${details.count || 'leads'} records to CSV (${details.territory || city})`;
        break;
      case 'TEARDOWN_PITCH':
        isRisk = !isOwner;
        riskLabel = isRisk ? 'UNAUTHORIZED PITCH' : '3D PITCH CREATED';
        riskBadge = '[LINK] TEARDOWN LINK';
        description = `${callerName} generated 3D teardown pitch link for ${prospectName}`;
        break;
      case 'CALL_INITIATED':
        isRisk = false;
        riskLabel = 'OUTREACH TOUCH';
        riskBadge = '[DIAL] CALL STARTED';
        description = `${callerName} dialed ${prospectName} (${p?.dm || 'DM'})`;
        break;
      case 'DOSSIER_VIEW':
        isRisk = false;
        riskLabel = 'DOSSIER RECON';
        riskBadge = '[VIEW] VIEWED LEAD';
        description = `${callerName} viewed dossier for ${prospectName} (${city})`;
        break;
      case 'OUTCOME_LOGGED':
        isRisk = false;
        riskLabel = 'STATUS MUTATION';
        riskBadge = `[STATUS] ${(details.status || 'outcome').toUpperCase().replace('_', ' ')}`;
        description = `${callerName} marked ${prospectName} as ${details.status || 'updated'}`;
        break;
      case 'NOTE_SAVED':
        isRisk = false;
        riskLabel = 'NOTE APPENDED';
        riskBadge = '[SAVE] NOTE SAVED';
        description = `${callerName} updated notes on ${prospectName}`;
        break;
      case 'DISCOVERY_BOOKED':
        isRisk = false;
        riskLabel = 'CALENDAR INVITE';
        riskBadge = '[CAL] DISCOVERY SET';
        description = `${callerName} booked discovery invite for ${prospectName}`;
        break;
      case 'CONTACT_UNMASKED':
        isRisk = false;
        riskLabel = 'PHONE REVEALED';
        riskBadge = '[REVEAL] PHONE REVEAL';
        description = `${callerName} unmasked direct phone for ${prospectName}${details.remaining !== undefined ? ' (' + details.remaining + ' left)' : ''}`;
        break;
      case 'UNMASK_VELOCITY_EXCEEDED':
        isRisk = true;
        riskLabel = 'VELOCITY BREACH';
        riskBadge = '[ALERT] RATE LIMIT';
        description = `${callerName} exceeded hourly unmask velocity (${details.velocityCount || '10'}/${details.limit || '10'})`;
        break;
      case 'CLIPBOARD_TAINT_EXPORT':
        isRisk = !isOwner;
        riskLabel = isRisk ? 'SUSPECT PITCH COPY' : 'PITCH COPIED';
        riskBadge = '[COPY] COPIED PITCH';
        description = `${callerName} copied ${details.contentType || 'dossier brief'} with steganographic fingerprint`;
        break;
      default:
        description = `${callerName} performed ${actionType} on ${prospectName}`;
    }

    const entry = {
      id: 'aud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
      callerEmail,
      callerName,
      isOwner,
      actionType,
      prospectId: p?.id || prospectId || null,
      prospectName,
      city,
      isRisk,
      riskLabel,
      riskBadge,
      description,
      details
    };

    if (!isOwner) {
      const logs = getAuditLogs();
      logs.unshift(entry);
      if (logs.length > 200) logs.length = 200;
      saveAuditLogs(logs);

      // Concurrency Broadcast across tabs
      try {
        if (typeof syncChannel !== 'undefined' && syncChannel && typeof syncChannel.postMessage === 'function') {
          syncChannel.postMessage({ type: 'PARTNER_AUDIT_ACTIVITY', entry });
        }
      } catch (bcErr) {
        console.warn('[Surveillance] Broadcast error:', bcErr);
      }
    }

    // Backup to Cloud Firestore if active
    if (window.SALES_PLATFORM_AUTH?.getFirestore && !isOwner) {
      window.SALES_PLATFORM_AUTH.getFirestore().then(db => {
        db.collection('partner_activity_logs').add(entry).catch(() => {});
      }).catch(() => {});
    }

    // Real-time update of Owner Profile Dropdown or Admin surveillance table
    if (isOwner) {
      const dropdown = document.getElementById('userProfileDropdown');
      if (dropdown && !dropdown.classList.contains('hidden')) {
        updateProfileDropdownUI();
      }
      const adminModal = document.getElementById('adminModal');
      const tabLogs = document.getElementById('adminTabLogs');
      if (adminModal && !adminModal.classList.contains('hidden') && tabLogs && !tabLogs.classList.contains('hidden')) {
        renderAdminAuditTable();
      }
    }

    return entry;
  } catch (err) {
    console.warn('[Surveillance] Failed to record partner activity:', err);
    return null;
  }
}

function handleIncomingAuditEntry(entry) {
  if (!entry || !entry.id) return;
  const logs = getAuditLogs();
  if (logs.some(l => l.id === entry.id)) return;
  logs.unshift(entry);
  if (logs.length > 200) logs.length = 200;
  saveAuditLogs(logs);

  const user = (typeof currentUser !== 'undefined' && currentUser)
    ? currentUser
    : ((typeof window !== 'undefined' && window.currentUser)
      ? window.currentUser
      : ((typeof global !== 'undefined' && global.currentUser) ? global.currentUser : null));

  if (isOwnerUser(user)) {
    if (entry.isRisk && !entry.isOwner) {
      showNotification(`[SECURITY] SURVEILLANCE RADAR: ${entry.callerName} (${entry.callerEmail}) triggered ${entry.riskBadge}!`);
      if (typeof playSound === 'function') playSound('chime');
    }
    const dropdown = document.getElementById('userProfileDropdown');
    if (dropdown && !dropdown.classList.contains('hidden')) {
      updateProfileDropdownUI();
    }
    const adminModal = document.getElementById('adminModal');
    const tabLogs = document.getElementById('adminTabLogs');
    if (adminModal && !adminModal.classList.contains('hidden') && tabLogs && !tabLogs.classList.contains('hidden')) {
      renderAdminAuditTable();
    }
  }
}

// -------------------------------------------------------------
// PROFILE TELEMETRY & DROPDOWN ENGINE
// -------------------------------------------------------------
function getProfileTelemetry() {
  const allLeads = (typeof PROSPECTS !== 'undefined' && Array.isArray(PROSPECTS)) ? PROSPECTS : [];

  // 1. Successes: closed_won, discovery_booked, interested
  const closedWon = allLeads.filter(p => p.status === 'closed_won');
  const booked = allLeads.filter(p => p.status === 'discovery_booked');
  const interested = allLeads.filter(p => p.status === 'interested');
  const totalSuccess = closedWon.length + booked.length + interested.length;

  // 2. Rejections: not_interested, gatekeeper_rejection, blacklisted
  const notInterested = allLeads.filter(p => p.status === 'not_interested');
  const gatekeeper = allLeads.filter(p => p.status === 'gatekeeper_rejection');
  const blacklisted = allLeads.filter(p => p.status === 'blacklisted');
  const totalRejections = notInterested.length + gatekeeper.length + blacklisted.length;

  // 3. Callbacks / in-flight
  const callbacks = allLeads.filter(p => p.status === 'connected_callback' || p.status === 'callback');

  // 4. Dials today vs daily target
  const currentDials = typeof dialsToday !== 'undefined' ? dialsToday : 0;
  const maxGoal = 20;
  const dialPct = Math.min(100, Math.round((currentDials / maxGoal) * 100));

  // 5. Booked Pipeline Value
  const bookedVal = booked.reduce((sum, p) => sum + (Number(p.targetFee) || 50000), 0) +
                    closedWon.reduce((sum, p) => sum + (Number(p.targetFee) || (typeof DEAL_TIERS !== 'undefined' && DEAL_TIERS[p.closedTier]?.total) || 50000), 0);

  // 6. Win Rate Percentage (Conversions / (Conversions + Rejections))
  const totalDecided = totalSuccess + totalRejections;
  const winRate = totalDecided > 0 ? Math.round((totalSuccess / totalDecided) * 100) : 0;

  // 7. Commission Wallet Ledger & Balances
  const settledIds = typeof getSettledCommissionIds === 'function' ? getSettledCommissionIds() : [];

  let clearedCommission = 0;
  let settledCommission = 0;
  let pendingCommission = 0;
  const ledger = [];

  // Process closed_won deals (15% direct commission)
  closedWon.forEach(p => {
    const tierNum = p.closedTier || 1;
    const tierInfo = (typeof DEAL_TIERS !== 'undefined' && DEAL_TIERS[tierNum])
      ? DEAL_TIERS[tierNum]
      : { name: `Tier ${tierNum}`, total: Number(p.targetFee) || 50000, advance: 25000, commission: Math.round((Number(p.targetFee) || 50000) * 0.15) };
    const commAmount = p.commission || tierInfo.commission || Math.round(tierInfo.total * 0.15);
    const isSettled = settledIds.includes(p.id);

    if (isSettled) {
      settledCommission += commAmount;
    } else {
      clearedCommission += commAmount;
    }

    ledger.push({
      id: p.id,
      name: p.name || 'Prospect',
      city: p.city || '',
      dm: p.dm || '',
      type: 'closed_won',
      tierNum,
      tierName: tierInfo.name,
      totalFee: tierInfo.total,
      advancePaid: p.depositPaid || tierInfo.advance,
      commission: commAmount,
      isSettled,
      statusText: isSettled ? 'SETTLED' : 'CLEARED',
      updatedAt: p.updatedAt || new Date().toISOString()
    });
  });

  // Process discovery_booked deals (10% referral safety net)
  booked.forEach(p => {
    const targetFee = Number(p.targetFee) || 50000;
    const commAmount = Math.round(targetFee * 0.10); // 10% safety net
    pendingCommission += commAmount;

    ledger.push({
      id: p.id,
      name: p.name || 'Prospect',
      city: p.city || '',
      dm: p.dm || '',
      type: 'discovery_booked',
      tierNum: null,
      tierName: 'Discovery Handoff',
      totalFee: targetFee,
      advancePaid: 0,
      commission: commAmount,
      isSettled: false,
      statusText: 'PENDING_WALKTHROUGH',
      updatedAt: p.updatedAt || new Date().toISOString()
    });
  });

  const streak = typeof getShiftStreak === 'function' ? getShiftStreak() : 1;
  const milestone = typeof getDialMilestone === 'function' ? getDialMilestone(currentDials) : { level: 0, name: 'Ready', badge: '[QUEUE]', class: 'bg-white/10 text-gray-400 font-medium' };

  return {
    dialsToday: currentDials,
    maxGoal,
    dialPct,
    closedWonCount: closedWon.length,
    bookedCount: booked.length,
    interestedCount: interested.length,
    totalSuccess,
    notInterestedCount: notInterested.length,
    gatekeeperCount: gatekeeper.length,
    blacklistedCount: blacklisted.length,
    totalRejections,
    callbackCount: callbacks.length,
    bookedVal,
    winRate,
    clearedCommission,
    pendingCommission,
    settledCommission,
    totalLifetimeCommission: clearedCommission + settledCommission,
    ledger,
    streak,
    milestone
  };
}

function updateProfileDropdownUI() {
  const user = (typeof currentUser !== 'undefined' && currentUser)
    ? currentUser
    : ((typeof window !== 'undefined' && window.currentUser)
      ? window.currentUser
      : ((typeof global !== 'undefined' && global.currentUser) ? global.currentUser : null));
  if (!user) return;
  const telemetry = getProfileTelemetry();

  // Topbar Wallet Pill Synchronization
  const topbarWalletPill = document.getElementById('topbarWalletPill');
  const topbarWalletAmount = document.getElementById('topbarWalletAmount');
  if (topbarWalletAmount) {
    topbarWalletAmount.textContent = `₹${(telemetry.clearedCommission || 0).toLocaleString('en-IN')}`;
  }
  if (topbarWalletPill) {
    topbarWalletPill.classList.remove('hidden');
    topbarWalletPill.classList.add('flex');
  }

  // Profile Identity info
  const nameEl = document.getElementById('dropdownUserName');
  const emailEl = document.getElementById('dropdownUserEmail');
  const imgEl = document.getElementById('dropdownUserImg');
  const triggerImg = document.getElementById('userImg');
  const rolePill = document.getElementById('dropdownRolePill');
  const roleBadge = document.getElementById('userRoleBadge');
  const adminBtn = document.getElementById('dropdownAdminBtn');

  if (nameEl) nameEl.textContent = user.name || 'Operator';
  if (emailEl) emailEl.textContent = user.email || '';
  if (imgEl && user.picture) imgEl.src = user.picture;
  if (triggerImg && user.picture) triggerImg.src = user.picture;

  const isOwner = isOwnerUser(user);
  const roleText = isOwner ? 'OWNER' : (user.role === 'caller' ? 'PARTNER' : 'USER');
  if (rolePill) {
    rolePill.textContent = roleText;
    rolePill.className = isOwner
      ? 'text-[8px] font-arcade px-1.5 py-0.5 bg-[#fce566] border border-[#17120f] text-[#17120f] shrink-0 font-bold'
      : 'text-[8px] font-arcade px-1.5 py-0.5 bg-[#d4edda] border border-[#17120f] text-[#155724] shrink-0 font-bold';
  }
  if (roleBadge) {
    roleBadge.textContent = roleText;
    roleBadge.className = 'topbar-user-badge';
  }

  // Telemetry View Labels & Containers
  const cockpitTitleEl = document.getElementById('profileCockpitTitle');
  const card1TitleEl = document.getElementById('profileCard1Title');
  const card2TitleEl = document.getElementById('profileCard2Title');
  const card3TitleEl = document.getElementById('profileCard3Title');
  const card4TitleEl = document.getElementById('profileCard4Title');
  const callbackSubtitleEl = document.getElementById('profileCallbackSubtitle');
  const ownerSummaryStrip = document.getElementById('ownerFleetSummaryStrip');
  const ownerStreamContainer = document.getElementById('ownerSurveillanceStreamContainer');
  const ownerActionButtons = document.getElementById('ownerActionButtons');
  const callerActionButtons = document.getElementById('callerActionButtons');

  // Telemetry: Dials
  const dialsTodayEl = document.getElementById('profileDialsToday');
  const dialsGoalTextEl = document.getElementById('profileDialsGoalText');
  const dialProgressBar = document.getElementById('profileDialProgressBar');

  // Telemetry: Booked & Successes
  const successCountEl = document.getElementById('profileSuccessCount');
  const winRateBadgeEl = document.getElementById('profileWinRateBadge');
  const bookedValEl = document.getElementById('profileBookedValue');

  // Telemetry: Rejections
  const rejectionCountEl = document.getElementById('profileRejectionCount');
  const rejectionBreakdownEl = document.getElementById('profileRejectionBreakdown');

  // Telemetry: Callbacks
  const callbackCountEl = document.getElementById('profileCallbackCount');

  if (isOwner) {
    // Owner Executive Fleet Radar & Anti-Theft Surveillance Mode
    if (cockpitTitleEl) cockpitTitleEl.textContent = 'RADAR // PARTNER AUDIT TRAIL';
    if (card1TitleEl) card1TitleEl.textContent = 'OUTREACH // FLEET DIALS';
    if (card2TitleEl) card2TitleEl.textContent = 'PIPELINE // FLEET VALUE';
    if (card3TitleEl) card3TitleEl.textContent = 'DISQUALIFIED';
    if (card4TitleEl) card4TitleEl.textContent = 'CALLBACKS // IN-FLIGHT';
    if (callbackSubtitleEl) callbackSubtitleEl.textContent = 'Active Queued';

    if (ownerSummaryStrip) ownerSummaryStrip.classList.remove('hidden');
    if (ownerStreamContainer) ownerStreamContainer.classList.remove('hidden');
    if (ownerActionButtons) ownerActionButtons.classList.remove('hidden');
    if (callerActionButtons) callerActionButtons.classList.add('hidden');
    const streakBadgeEl = document.getElementById('profileStreakBadge');
    if (streakBadgeEl) streakBadgeEl.classList.add('hidden');
    const milestoneBadgeEl = document.getElementById('profileMilestoneBadge');
    if (milestoneBadgeEl) milestoneBadgeEl.classList.add('hidden');
    if (adminBtn) {
      // Redundant with topbar Admin console button - keep hidden in dropdown for Owner
      adminBtn.classList.add('hidden');
      adminBtn.classList.remove('flex');
    }

    const logs = getAuditLogs();
    const auditTouches = logs.filter(l => l.actionType === 'CALL_INITIATED' || l.actionType === 'OUTCOME_LOGGED').length;
    const allTouchedLeads = (typeof PROSPECTS !== 'undefined' && Array.isArray(PROSPECTS))
      ? PROSPECTS.filter(p => p.status && p.status !== 'available').length
      : 0;
    const fleetTotalDials = Math.max(telemetry.dialsToday, auditTouches, allTouchedLeads);

    if (dialsTodayEl) dialsTodayEl.textContent = fleetTotalDials;
    if (dialsGoalTextEl) dialsGoalTextEl.textContent = `${fleetTotalDials} Touches`;
    if (dialProgressBar) dialProgressBar.style.width = '100%';

    if (successCountEl) successCountEl.textContent = telemetry.totalSuccess;
    if (winRateBadgeEl) winRateBadgeEl.textContent = `${telemetry.winRate}% WIN`;
    if (bookedValEl) bookedValEl.textContent = `₹${telemetry.bookedVal.toLocaleString('en-IN')} Pipeline`;

    if (rejectionCountEl) rejectionCountEl.textContent = telemetry.totalRejections;
    if (rejectionBreakdownEl) {
      rejectionBreakdownEl.textContent = `${telemetry.notInterestedCount} Disq • ${telemetry.gatekeeperCount} GK`;
    }

    if (callbackCountEl) callbackCountEl.textContent = telemetry.callbackCount;

    // Unique partner count (non-owner callers)
    const uniquePartnerEmails = new Set(logs.filter(l => !l.isOwner && l.callerEmail && !l.callerEmail.includes('apoorv')).map(l => l.callerEmail));
    const activePartnersCount = uniquePartnerEmails.size || (window.SALES_REP_INVITATIONS ? Object.keys(window.SALES_REP_INVITATIONS).length : 0);
    const activePartnersEl = document.getElementById('ownerActivePartnersCount');
    if (activePartnersEl) activePartnersEl.textContent = activePartnersCount;

    // Leak Radar Count
    const leakCount = logs.filter(l => l.isRisk).length;
    const leakBadgeEl = document.getElementById('ownerLeakRadarBadge');
    if (leakBadgeEl) {
      if (leakCount > 0) {
        leakBadgeEl.className = 'px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-500 font-mono text-[8px] font-bold animate-pulse';
        leakBadgeEl.textContent = `■ ${leakCount} LEAK ALERT${leakCount > 1 ? 'S' : ''}`;
      } else {
        leakBadgeEl.className = 'px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500 font-mono text-[8px] font-bold';
        leakBadgeEl.textContent = '● 0 LEAK ALERTS';
      }
    }

    // Render Recent Audit Trail Stream (Top 5)
    const trailListEl = document.getElementById('ownerAuditTrailList');
    if (trailListEl) {
      trailListEl.innerHTML = '';
      const partnerLogs = (logs || []).filter(l => !l.isOwner && !isApoorvOwnerEmail(l.callerEmail));
      if (!partnerLogs || partnerLogs.length === 0) {
        trailListEl.innerHTML = `<div class="p-2 bg-[#fffdf1] border border-[#17120f]/20 text-neutral-600 text-[10px] font-mono leading-relaxed" style="color: #17120f !important;"><span class="font-bold text-emerald-800">● Live Radar Active:</span> No external partner activity logged yet. All actions from partners will appear here in real-time.</div>`;
      } else {
        const recent = partnerLogs.slice(0, 5);
        recent.forEach(item => {
          const div = document.createElement('div');
          div.className = item.isRisk
            ? 'p-2 bg-[#f8d7da] border-2 border-[#721c24] text-[#721c24] space-y-1 shadow-[1px_1px_0_#721c24]'
            : 'p-2 bg-[#fffdf1] border-2 border-[#17120f]/30 text-[#17120f] space-y-1 shadow-[1px_1px_0_#17120f]';

          const timeAgo = formatTimeAgo(item.timestamp);
          // Prioritize human name over email
          const callerDisplay = item.callerName && item.callerName !== 'Partner Rep' && item.callerName !== 'Caller'
            ? item.callerName
            : (item.callerEmail && !item.callerEmail.includes('internal')
                ? item.callerEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                : (item.callerName || 'Outreach Partner'));

          div.innerHTML = `
            <div class="flex items-center justify-between text-[10px] font-bold">
              <span class="truncate max-w-[170px]" style="color: #17120f !important;">${item.isRisk ? '■ ' : '› '}${escapeHTML(callerDisplay)}</span>
              <span class="font-mono text-neutral-600 text-[9px]">${timeAgo}</span>
            </div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="text-[8px] font-arcade px-1.5 py-0.5 border border-[#17120f] font-bold shrink-0" style="${item.isRisk ? 'background: #721c24 !important; color: #ffffff !important;' : 'background: #17120f !important; color: #fce566 !important;'}">${escapeHTML(item.riskBadge || item.actionType)}</span>
              <span class="text-[11px] font-mono truncate font-semibold" style="color: #17120f !important;">${escapeHTML(item.prospectName || 'Queue')}</span>
            </div>
          `;
          trailListEl.appendChild(div);
        });
      }
    }
  } else {
    // Partner Caller Telemetry View
    if (cockpitTitleEl) cockpitTitleEl.textContent = 'TELEMETRY // REVENUE RADAR';
    const streakBadgeEl = document.getElementById('profileStreakBadge');
    if (streakBadgeEl) {
      streakBadgeEl.textContent = `STREAK // ${telemetry.streak}D`;
      streakBadgeEl.classList.remove('hidden');
    }
    const milestoneBadgeEl = document.getElementById('profileMilestoneBadge');
    if (milestoneBadgeEl) {
      milestoneBadgeEl.textContent = telemetry.milestone.badge;
      milestoneBadgeEl.className = `text-[8px] font-arcade border border-[#17120f] px-1 py-0.5 ${telemetry.milestone.class}`;
      milestoneBadgeEl.classList.remove('hidden');
    }
    if (card1TitleEl) card1TitleEl.textContent = 'OUTREACH // DIALS';
    if (card2TitleEl) card2TitleEl.textContent = 'CONVERTED // BOOKED';
    if (card3TitleEl) card3TitleEl.textContent = 'DISQUALIFIED // GATEKEEPER';
    if (card4TitleEl) card4TitleEl.textContent = 'CALLBACKS // IN-FLIGHT';
    if (callbackSubtitleEl) callbackSubtitleEl.textContent = 'Follow-ups';

    if (ownerSummaryStrip) ownerSummaryStrip.classList.add('hidden');
    if (ownerStreamContainer) ownerStreamContainer.classList.add('hidden');
    if (ownerActionButtons) ownerActionButtons.classList.add('hidden');
    if (callerActionButtons) callerActionButtons.classList.remove('hidden');

    if (dialsTodayEl) dialsTodayEl.textContent = telemetry.dialsToday;
    if (dialsGoalTextEl) dialsGoalTextEl.textContent = `${telemetry.dialsToday}/${telemetry.maxGoal}`;
    if (dialProgressBar) dialProgressBar.style.width = `${telemetry.dialPct}%`;

    if (successCountEl) successCountEl.textContent = telemetry.totalSuccess;
    if (winRateBadgeEl) {
      if (telemetry.pendingCommission > 0) {
        winRateBadgeEl.textContent = `+₹${telemetry.pendingCommission.toLocaleString('en-IN')} PEND`;
      } else {
        winRateBadgeEl.textContent = `${telemetry.winRate}% WIN`;
      }
    }
    if (bookedValEl) {
      if (telemetry.clearedCommission > 0) {
        bookedValEl.textContent = `₹${telemetry.clearedCommission.toLocaleString('en-IN')} Earned`;
      } else {
        bookedValEl.textContent = `₹${telemetry.bookedVal.toLocaleString('en-IN')} Value`;
      }
    }

    if (rejectionCountEl) rejectionCountEl.textContent = telemetry.totalRejections;
    if (rejectionBreakdownEl) {
      rejectionBreakdownEl.textContent = `${telemetry.notInterestedCount} Disq • ${telemetry.gatekeeperCount} GK`;
    }

    if (callbackCountEl) callbackCountEl.textContent = telemetry.callbackCount;
  }

  // Shift date
  const dateEl = document.getElementById('profileShiftDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

function toggleProfileDropdown() {
  const dropdown = document.getElementById('userProfileDropdown');
  if (!dropdown) return;
  if (dropdown.classList.contains('hidden')) {
    openProfileDropdown();
  } else {
    closeProfileDropdown();
  }
}

function openProfileDropdown() {
  const dropdown = document.getElementById('userProfileDropdown');
  const trigger = document.getElementById('userProfileTrigger');
  const caret = document.getElementById('profileDropdownCaret');
  if (!dropdown) return;
  updateProfileDropdownUI();
  dropdown.classList.remove('hidden');
  if (trigger) trigger.setAttribute('aria-expanded', 'true');
  if (caret) caret.classList.add('rotate-180');
}

function closeProfileDropdown() {
  const dropdown = document.getElementById('userProfileDropdown');
  const trigger = document.getElementById('userProfileTrigger');
  const caret = document.getElementById('profileDropdownCaret');
  if (!dropdown) return;
  dropdown.classList.add('hidden');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
  if (caret) caret.classList.remove('rotate-180');
}

function resetShiftDials() {
  if (confirm("Reset today's dial counter back to 0?")) {
    dialsToday = 0;
    saveDialsToday();
    updateDialProgress();
    updateProfileDropdownUI();
    showNotification("Shift dials reset to 0.");
  }
}

function openAdminSurveillanceLogs() {
  closeProfileDropdown();
  openAdminModal();
  switchAdminTab('logs');
  const section = document.getElementById('adminSurveillanceLogsSection');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

function exportAuditLogsToCSV() {
  if (typeof playSound === 'function') playSound('click');
  const logs = getAuditLogs();
  if (!logs || !logs.length) {
    showNotification('[ALERT] No partner activity logged yet to export.');
    return;
  }

  const headers = [
    'Log ID',
    'Timestamp (ISO)',
    'Date Time (Local)',
    'Caller Name',
    'Caller Email',
    'Role',
    'Action Type',
    'Risk Flag',
    'Risk Label',
    'Prospect ID',
    'Prospect Name',
    'City',
    'Description',
    'Payload Details'
  ];

  const escapeCsv = (str) => {
    if (str === null || str === undefined) return '""';
    const text = String(str).replace(/"/g, '""');
    return `"${text}"`;
  };

  const rows = logs.map(entry => [
    escapeCsv(entry.id),
    escapeCsv(new Date(entry.timestamp).toISOString()),
    escapeCsv(new Date(entry.timestamp).toLocaleString()),
    escapeCsv(entry.callerName),
    escapeCsv(entry.callerEmail),
    escapeCsv(entry.isOwner ? 'OWNER' : 'PARTNER'),
    escapeCsv(entry.actionType),
    escapeCsv(entry.isRisk ? 'HIGH_RISK' : 'NORMAL'),
    escapeCsv(entry.riskLabel),
    escapeCsv(entry.prospectId),
    escapeCsv(entry.prospectName),
    escapeCsv(entry.city),
    escapeCsv(entry.description),
    escapeCsv(JSON.stringify(entry.details || {}))
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `surveillance_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showNotification('[EXPORT] Partner Surveillance Audit CSV exported successfully!');
}

function clearAuditLogs() {
  if (!isOwnerUser(currentUser)) {
    showNotification('[LOCKED] Only Owner (Apoorv) can clear surveillance audit logs.');
    return;
  }
  if (confirm('Permanently clear all partner activity and surveillance logs?')) {
    localStorage.removeItem(AUDIT_LOG_KEY);
    renderAdminAuditTable();
    updateProfileDropdownUI();
    showNotification('[CLEARED] Surveillance audit trail cleared.');
  }
}

function renderAdminAuditTable() {
  const tbody = document.getElementById('adminSurveillanceLogsBody');
  const totalTouchesEl = document.getElementById('adminSurveillanceTotalTouches');
  const activeCallersEl = document.getElementById('adminSurveillanceActiveCallers');
  const teardownCountEl = document.getElementById('adminSurveillanceTeardownCount');
  const leakCountEl = document.getElementById('adminSurveillanceLeakCount');

  const logs = getAuditLogs();

  const teardownCount = logs.filter(l => l.actionType === 'TEARDOWN_PITCH').length;
  const leakCount = logs.filter(l => l.isRisk).length;
  const uniqueCallers = new Set(logs.filter(l => !l.isOwner && l.callerEmail).map(l => l.callerEmail)).size;

  if (totalTouchesEl) totalTouchesEl.textContent = logs.length;
  if (activeCallersEl) activeCallersEl.textContent = uniqueCallers;
  if (teardownCountEl) teardownCountEl.textContent = teardownCount;
  if (leakCountEl) leakCountEl.textContent = leakCount;

  if (!tbody) return;
  tbody.innerHTML = '';

  if (logs.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5" class="p-4 text-center text-neutral-400 italic font-mono text-xs">🟢 No partner activities recorded yet. All surveillance systems operational.</td>`;
    tbody.appendChild(tr);
    return;
  }

  logs.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = item.isRisk ? 'bg-rose-950/20 hover:bg-rose-950/30 transition' : 'hover:bg-white/[0.04] transition';

    const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

    let riskBadgeHtml = `<span class="px-1.5 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/10 text-[9px] font-bold">${escapeHTML(item.riskBadge || item.actionType)}</span>`;
    if (item.actionType === 'CSV_EXPORT') {
      riskBadgeHtml = `<span class="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-600 text-[9px] font-bold">⚠️ EXPORTED CSV</span>`;
    } else if (item.actionType === 'TEARDOWN_PITCH') {
      riskBadgeHtml = `<span class="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600 text-[9px] font-bold">🔗 TEARDOWN LINK</span>`;
    } else if (item.actionType === 'CALL_INITIATED') {
      riskBadgeHtml = `<span class="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-600 text-[9px] font-bold">📞 CALLED</span>`;
    } else if (item.actionType === 'DOSSIER_VIEW') {
      riskBadgeHtml = `<span class="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-600 text-[9px] font-bold">👁️ DOSSIER</span>`;
    } else if (item.actionType === 'OUTCOME_LOGGED') {
      riskBadgeHtml = `<span class="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 text-[9px] font-bold">📝 OUTCOME</span>`;
    }

    const callerBadge = item.isOwner
      ? `<span class="px-1.5 py-0.2 bg-[#fce566] text-[#17120f] font-bold text-[8px] border border-[#17120f] rounded">OWNER</span>`
      : `<span class="px-1.5 py-0.2 bg-blue-950 text-blue-300 font-bold text-[8px] border border-blue-700 rounded">PARTNER</span>`;

    tr.innerHTML = `
      <td class="p-2 sm:p-2.5 whitespace-nowrap text-neutral-400">
        <div>${timeStr}</div>
        <div class="text-[9px] text-neutral-500">${dateStr}</div>
      </td>
      <td class="p-2 sm:p-2.5">
        <div class="flex items-center gap-1.5">
          <span class="font-bold text-white">${escapeHTML(item.callerName || 'Partner')}</span>
          ${callerBadge}
        </div>
        <div class="text-[10px] text-neutral-400 font-mono truncate max-w-[180px]">${escapeHTML(item.callerEmail || '')}</div>
      </td>
      <td class="p-2 sm:p-2.5 whitespace-nowrap">
        ${riskBadgeHtml}
      </td>
      <td class="p-2 sm:p-2.5">
        <div class="font-bold text-neutral-200 text-xs truncate max-w-[200px]">${escapeHTML(item.prospectName || 'Workspace')}</div>
        <div class="text-[10px] text-neutral-500">${escapeHTML(item.city || 'All')}</div>
      </td>
      <td class="p-2 sm:p-2.5 text-neutral-400">
        <div class="text-[11px]">${escapeHTML(item.description || '')}</div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Global outside-click listener to dismiss profile dropdown
window.addEventListener('click', (e) => {
  const trigger = document.getElementById('userProfileTrigger');
  const dropdown = document.getElementById('userProfileDropdown');
  if (dropdown && !dropdown.classList.contains('hidden')) {
    if (trigger && !trigger.contains(e.target) && !dropdown.contains(e.target)) {
      closeProfileDropdown();
    }
  }
});

// Export globally
if (typeof window !== 'undefined') {
  window.toggleProfileDropdown = toggleProfileDropdown;
  window.openProfileDropdown = openProfileDropdown;
  window.closeProfileDropdown = closeProfileDropdown;
  window.resetShiftDials = resetShiftDials;
  window.getProfileTelemetry = getProfileTelemetry;
  window.updateProfileDropdownUI = updateProfileDropdownUI;
  window.recordPartnerActivity = recordPartnerActivity;
  window.getAuditLogs = getAuditLogs;
  window.exportAuditLogsToCSV = exportAuditLogsToCSV;
  window.clearAuditLogs = clearAuditLogs;
  window.openAdminSurveillanceLogs = openAdminSurveillanceLogs;
  window.renderAdminAuditTable = renderAdminAuditTable;
}


  const WorkspaceTelemetryEngine = {
    getAuditLogs,
    saveAuditLogs,
    formatTimeAgo,
    recordPartnerActivity,
    handleIncomingAuditEntry,
    getProfileTelemetry,
    updateProfileDropdownUI,
    toggleProfileDropdown,
    openProfileDropdown,
    closeProfileDropdown,
    resetShiftDials,
    openAdminSurveillanceLogs,
    exportAuditLogsToCSV,
    clearAuditLogs,
    renderAdminAuditTable
  };

  root.WorkspaceTelemetryEngine = WorkspaceTelemetryEngine;
  root.getAuditLogs = getAuditLogs;
  root.saveAuditLogs = saveAuditLogs;
  root.formatTimeAgo = formatTimeAgo;
  root.recordPartnerActivity = recordPartnerActivity;
  root.handleIncomingAuditEntry = handleIncomingAuditEntry;
  root.getProfileTelemetry = getProfileTelemetry;
  root.updateProfileDropdownUI = updateProfileDropdownUI;
  root.toggleProfileDropdown = toggleProfileDropdown;
  root.openProfileDropdown = openProfileDropdown;
  root.closeProfileDropdown = closeProfileDropdown;
  root.resetShiftDials = resetShiftDials;
  root.openAdminSurveillanceLogs = openAdminSurveillanceLogs;
  root.exportAuditLogsToCSV = exportAuditLogsToCSV;
  root.clearAuditLogs = clearAuditLogs;
  root.renderAdminAuditTable = renderAdminAuditTable;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkspaceTelemetryEngine;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
