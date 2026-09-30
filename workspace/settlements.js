// Client Radar — Partner Gamification, Commission Wallet & Retention Engine (Category C)
// Strictly On Apoorv's Behalf

(function(root) {
  function getSettledCommissionIds() {
    try {
      const raw = (typeof localStorage !== 'undefined' && localStorage.getItem('sprintdial_settled_commissions')) || '[]';
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  function getDialMilestone(dials) {
    const d = Number(dials) || 0;
    if (d >= 20) return { level: 4, name: 'Target Crushed', badge: '[TARGET MET]', class: 'bg-[#fce566] text-[#17120f] font-bold' };
    if (d >= 15) return { level: 3, name: 'Power Hour', badge: '[PEAK]', class: 'bg-purple-900 text-purple-200 font-bold' };
    if (d >= 10) return { level: 2, name: 'Flow State', badge: '[FLOW]', class: 'bg-emerald-900 text-emerald-200 font-bold' };
    if (d >= 5)  return { level: 1, name: 'Warm Up', badge: '[WARM]', class: 'bg-amber-900 text-amber-200 font-bold' };
    return { level: 0, name: 'Ready', badge: '[QUEUE]', class: 'bg-white/10 text-gray-400 font-medium' };
  }

  function updateShiftStreakOnDial() {
    try {
      if (typeof localStorage === 'undefined') return 1;
      const today = new Date().toISOString().slice(0, 10);
      const raw = localStorage.getItem('sprintdial_streak_data');
      let streakData = raw ? JSON.parse(raw) : { lastDate: '', count: 0 };

      if (streakData.lastDate === today) {
        return streakData.count || 1;
      }

      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (streakData.lastDate === yesterday) {
        streakData.count = (streakData.count || 0) + 1;
      } else {
        streakData.count = 1;
      }
      streakData.lastDate = today;
      localStorage.setItem('sprintdial_streak_data', JSON.stringify(streakData));
      return streakData.count;
    } catch (e) {
      return 1;
    }
  }

  function getShiftStreak() {
    try {
      if (typeof localStorage === 'undefined') return 1;
      const raw = localStorage.getItem('sprintdial_streak_data');
      if (!raw) return 1;
      const streakData = JSON.parse(raw);
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (streakData.lastDate === today || streakData.lastDate === yesterday) {
        return streakData.count || 1;
      }
      return 1;
    } catch (e) {
      return 1;
    }
  }

  function sendCallbackNudgeWhatsApp(prospectId) {
    const targetId = prospectId || root.selectedProspectId;
    const allLeads = root.PROSPECTS || [];
    const p = allLeads.find(item => item.id === targetId);
    if (!p) {
      if (typeof root.showNotification === 'function') {
        root.showNotification('[ALERT] Please select a prospect first.');
      }
      return;
    }
    if (typeof root.playSound === 'function') root.playSound('click');

    const cleanPhone = (p.phone || '').replace(/[^0-9]/g, '');
    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const cleanDm = (p.dm || 'Director').split('(')[0].trim();
    const cleanName = (p.name || 'Establishment').split(',')[0].trim();

    const callerUser = root.currentUser || (window.currentUser || {});
    const callerName = callerUser.displayName || callerUser.name || 'Outreach Partner';
    const partnerId = callerUser.sub || callerUser.uid || 'partner';
    const teardownUrl = `https://apoorv.qzz.io/sales?prospect=${encodeURIComponent(p.id)}&partner=${encodeURIComponent(partnerId)}`;

    const msg = `Namaste ${cleanDm},\n\nFollowing up on our brief conversation regarding ${cleanName}.\n\nDid you get an opportunity to review the 60 FPS performance comparison & revenue leak audit we prepared?\nAudit Link: ${teardownUrl}\n\nApoorv A S (Creative Technologist & 3D WebUI Architect) has a brief 10-minute window today at 3:30 PM for a screen share to show how your direct inquiries can increase by 25%.\n\nDoes 3:30 PM today work for you?\n\nWarm regards,\n${callerName}\nOffice of Apoorv A S | https://apoorv.qzz.io`;

    const waLink = targetPhone
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    if (typeof root.recordPartnerActivity === 'function') {
      root.recordPartnerActivity('CALLBACK_NUDGE_SENT', p.id, { client: p.name, phone: targetPhone });
    }

    if (typeof root.showNotification === 'function') {
      root.showNotification(`[WA] Prepared WhatsApp Callback Nudge for ${cleanDm}!`);
    }
    if (typeof window !== "undefined") {
      window.open(waLink, '_blank');
    }
  }

  function openPartnerWalletModal(playSoundEffect = true) {
    if (playSoundEffect && typeof root.playSound === 'function') root.playSound('click');
    const modal = document.getElementById('partnerWalletModal');
    if (modal) {
      modal.classList.remove('hidden');
      updateWalletModalUI();
    }
  }

  function closePartnerWalletModal(playSoundEffect = true) {
    if (playSoundEffect && typeof root.playSound === 'function') root.playSound('click');
    const modal = document.getElementById('partnerWalletModal');
    if (modal) modal.classList.add('hidden');
  }

  function savePartnerUpiId(val) {
    if (typeof localStorage !== 'undefined' && val) {
      localStorage.setItem('sprintdial_partner_upi', val.trim());
    }
  }

  function updateWalletModalUI() {
    const telemetry = (typeof root.getProfileTelemetry === 'function') ? root.getProfileTelemetry() : {};
    const clearedEl = document.getElementById('walletClearedBalance');
    const pendingEl = document.getElementById('walletPendingBalance');
    const settledEl = document.getElementById('walletSettledBalance');
    const upiInput = document.getElementById('partnerUpiInput');
    const ledgerList = document.getElementById('walletLedgerList');
    const ownerActions = document.getElementById('walletOwnerActions');

    if (clearedEl) clearedEl.textContent = `₹${(telemetry.clearedCommission || 0).toLocaleString('en-IN')}`;
    if (pendingEl) pendingEl.textContent = `₹${(telemetry.pendingCommission || 0).toLocaleString('en-IN')}`;
    if (settledEl) settledEl.textContent = `₹${(telemetry.settledCommission || 0).toLocaleString('en-IN')}`;

    if (upiInput && !upiInput.value) {
      const savedUpi = (typeof localStorage !== 'undefined' && localStorage.getItem('sprintdial_partner_upi')) || '';
      if (savedUpi) upiInput.value = savedUpi;
    }

    const user = root.currentUser || (window.currentUser || {});
    const isOwner = (typeof root.isOwnerUser === 'function') ? root.isOwnerUser(user) : false;

    if (ownerActions) {
      if (isOwner) {
        ownerActions.classList.remove('hidden');
      } else {
        ownerActions.classList.add('hidden');
      }
    }

    if (ledgerList) {
      ledgerList.innerHTML = '';
      if (!telemetry.ledger || telemetry.ledger.length === 0) {
        ledgerList.innerHTML = `
          <div class="p-4 bg-white/5 border border-white/10 text-center font-mono text-xs text-neutral-400 space-y-1">
            <p>No commission ledger records yet.</p>
            <p class="text-[10px] text-neutral-500">Close deals directly on call for 15% instant commission, or forward discovery walkthroughs for 10% referral safety net.</p>
          </div>
        `;
        return;
      }

      const escape = root.escapeHTML || (s => s);
      telemetry.ledger.forEach(item => {
        const row = document.createElement('div');
        const isWon = item.type === 'closed_won';
        row.className = `p-3 bg-[#fffdf1] border-2 border-[#17120f] shadow-[2px_2px_0_#17120f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[#17120f]`;

        let statusBadge = '';
        if (item.isSettled) {
          statusBadge = `<span class="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-500 font-arcade text-[8px] font-bold">● SETTLED</span>`;
        } else if (isWon) {
          statusBadge = `<span class="px-2 py-0.5 bg-[#fce566] text-[#17120f] border border-[#17120f] font-arcade text-[8px] font-bold">● CLEARED (15%)</span>`;
        } else {
          statusBadge = `<span class="px-2 py-0.5 bg-blue-100 text-blue-900 border border-blue-400 font-arcade text-[8px] font-bold">⏳ PENDING (10%)</span>`;
        }

        const clientName = escape(item.name);
        const tierName = escape(item.tierName);
        const commStr = `+₹${item.commission.toLocaleString('en-IN')}`;

        let ownerActionBtn = '';
        if (isOwner && isWon && !item.isSettled) {
          ownerActionBtn = `
            <button type="button" onclick="settleDealCommission('${item.id}')" title="Mark as settled" class="px-2 py-1 bg-[#17120f] hover:bg-black text-[#fce566] font-arcade text-[8px] font-bold shadow-[1px_1px_0_#17120f] transition active:translate-x-[1px] active:translate-y-[1px]">
              MARK SETTLED
            </button>
          `;
        }

        row.innerHTML = `
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-xs truncate max-w-[220px]">${clientName}</span>
              ${statusBadge}
            </div>
            <div class="text-[10px] text-neutral-600 font-mono mt-0.5">
              ${tierName} • Advance: ₹${(item.advancePaid || 0).toLocaleString('en-IN')} • Total: ₹${(item.totalFee || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div class="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <span class="font-arcade text-xs font-black ${item.isSettled ? 'text-neutral-500 line-through' : (isWon ? 'text-[#155724]' : 'text-blue-800')}">
              ${commStr}
            </span>
            ${ownerActionBtn}
          </div>
        `;

        ledgerList.appendChild(row);
      });
    }
  }

  function requestUpiSettlement() {
    if (typeof root.playSound === 'function') root.playSound('click');
    const telemetry = (typeof root.getProfileTelemetry === 'function') ? root.getProfileTelemetry() : {};
    const cleared = telemetry.clearedCommission || 0;

    if (cleared <= 0) {
      if (typeof root.showNotification === 'function') {
        root.showNotification('[ALERT] No cleared commission balance available for settlement yet.');
      }
      return;
    }

    const upiInput = document.getElementById('partnerUpiInput');
    const upiId = upiInput?.value.trim() || ((typeof localStorage !== 'undefined') ? localStorage.getItem('sprintdial_partner_upi') : '') || '';
    if (!upiId || !upiId.includes('@')) {
      if (typeof root.showNotification === 'function') {
        root.showNotification('[ALERT] Please enter a valid UPI ID (e.g. partner@okaxis) to request payout.');
      }
      upiInput?.focus();
      return;
    }

    const callerUser = root.currentUser || (window.currentUser || {});
    const callerName = callerUser.displayName || callerUser.name || 'Outreach Partner';
    const callerEmail = callerUser.email || '';

    const clearedDeals = (telemetry.ledger || []).filter(d => d.type === 'closed_won' && !d.isSettled);
    const ledgerLines = clearedDeals.map(d => `• ${d.name} (${d.tierName}) → Commission: ₹${d.commission.toLocaleString('en-IN')}`).join('\n');

    const msg = `[REQUEST] OUTREACH PARTNER COMMISSION SETTLEMENT\n\nPartner: ${callerName} (${callerEmail})\nRegistered UPI: ${upiId}\nRequested Payout: ₹${cleared.toLocaleString('en-IN')}\n\nVerified Deal Ledger:\n${ledgerLines}\n\nTotal Cleared Balance: ₹${cleared.toLocaleString('en-IN')}\n\nPlease transfer and mark settled.\nOffice of Apoorv A S | SprintDial Cockpit`;

    const waLink = `https://wa.me/919495462450?text=${encodeURIComponent(msg)}`;

    if (typeof root.recordPartnerActivity === 'function') {
      root.recordPartnerActivity('SETTLEMENT_REQUESTED', 'wallet', {
        amount: cleared,
        upiId,
        dealsCount: clearedDeals.length
      });
    }

    if (typeof root.showNotification === 'function') {
      root.showNotification('[SYS] Opening WhatsApp to dispatch verified settlement request to Apoorv...');
    }
    if (typeof window !== "undefined") {
      window.open(waLink, '_blank');
    }
  }

  function settleDealCommission(prospectId) {
    const user = root.currentUser || (window.currentUser || {});
    if (typeof root.isOwnerUser === 'function' && !root.isOwnerUser(user)) {
      if (typeof root.showNotification === 'function') {
        root.showNotification('[RESTRICTED] Only the Owner (Apoorv) can clear commission settlements.');
      }
      return;
    }
    if (typeof root.playSound === 'function') root.playSound('chime');
    const settled = getSettledCommissionIds();
    if (!settled.includes(prospectId)) {
      settled.push(prospectId);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sprintdial_settled_commissions', JSON.stringify(settled));
      }
    }
    if (typeof root.showNotification === 'function') {
      root.showNotification('[SAVED] Deal commission marked as SETTLED!');
    }
    updateWalletModalUI();
    if (typeof root.updateProfileDropdownUI === 'function') root.updateProfileDropdownUI();
  }

  function settleAllClearedCommissions() {
    const user = root.currentUser || (window.currentUser || {});
    if (typeof root.isOwnerUser === 'function' && !root.isOwnerUser(user)) {
      if (typeof root.showNotification === 'function') {
        root.showNotification('[RESTRICTED] Only the Owner (Apoorv) can clear commission settlements.');
      }
      return;
    }
    if (typeof root.playSound === 'function') root.playSound('chime');
    const telemetry = (typeof root.getProfileTelemetry === 'function') ? root.getProfileTelemetry() : {};
    const clearedDeals = (telemetry.ledger || []).filter(d => d.type === 'closed_won' && !d.isSettled);
    if (clearedDeals.length === 0) {
      if (typeof root.showNotification === 'function') {
        root.showNotification('ℹ️ No cleared deals pending settlement.');
      }
      return;
    }
    const settled = getSettledCommissionIds();
    clearedDeals.forEach(d => {
      if (!settled.includes(d.id)) settled.push(d.id);
    });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sprintdial_settled_commissions', JSON.stringify(settled));
    }
    if (typeof root.showNotification === 'function') {
      root.showNotification(`[SAVED] Successfully settled ₹${(telemetry.clearedCommission || 0).toLocaleString('en-IN')} across ${clearedDeals.length} deals!`);
    }
    updateWalletModalUI();
    if (typeof root.updateProfileDropdownUI === 'function') root.updateProfileDropdownUI();
  }

  const WorkspaceSettlementsEngine = {
    getSettledCommissionIds,
    getDialMilestone,
    updateShiftStreakOnDial,
    getShiftStreak,
    sendCallbackNudgeWhatsApp,
    openPartnerWalletModal,
    closePartnerWalletModal,
    savePartnerUpiId,
    updateWalletModalUI,
    requestUpiSettlement,
    settleDealCommission,
    settleAllClearedCommissions
  };

  root.WorkspaceSettlementsEngine = WorkspaceSettlementsEngine;
  root.getSettledCommissionIds = getSettledCommissionIds;
  root.getDialMilestone = getDialMilestone;
  root.updateShiftStreakOnDial = updateShiftStreakOnDial;
  root.getShiftStreak = getShiftStreak;
  root.sendCallbackNudgeWhatsApp = sendCallbackNudgeWhatsApp;
  root.openPartnerWalletModal = openPartnerWalletModal;
  root.closePartnerWalletModal = closePartnerWalletModal;
  root.savePartnerUpiId = savePartnerUpiId;
  root.updateWalletModalUI = updateWalletModalUI;
  root.requestUpiSettlement = requestUpiSettlement;
  root.settleDealCommission = settleDealCommission;
  root.settleAllClearedCommissions = settleAllClearedCommissions;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkspaceSettlementsEngine;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
