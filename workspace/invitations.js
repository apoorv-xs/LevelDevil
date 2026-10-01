// Client Radar — Sales Rep Email Invitation & Onboarding Engine (Subsystem 5.4)
// Strictly On Apoorv's Behalf

(function(root) {
  'use strict';

  const INVITATIONS_STORAGE_KEY = 'apoorv_sales_invitations_v1';

  const escapeHTML = (typeof root.escapeHTML === 'function') ? root.escapeHTML : function(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  };

  function playSoundHelper(sound) {
    if (typeof root.playSound === 'function') root.playSound(sound);
    else if (typeof global !== 'undefined' && typeof global.playSound === 'function') global.playSound(sound);
  }

  function showNotificationHelper(msg, type) {
    if (typeof root.showNotification === 'function') root.showNotification(msg, type);
    else if (typeof global !== 'undefined' && typeof global.showNotification === 'function') global.showNotification(msg, type);
  }

  function getCurrentUser() {
    return (typeof root.currentUser !== 'undefined' && root.currentUser)
      ? root.currentUser
      : ((typeof global !== 'undefined' && global.currentUser) ? global.currentUser : null);
  }

  function getCustomWorkersHelper() {
    if (typeof root.getCustomWorkers === 'function') return root.getCustomWorkers();
    if (typeof global !== 'undefined' && typeof global.getCustomWorkers === 'function') return global.getCustomWorkers();
    return root.customWorkers || (typeof global !== 'undefined' ? global.customWorkers : null) || {};
  }

  function saveCustomWorkersHelper(workers) {
    if (typeof root.saveCustomWorkers === 'function') return root.saveCustomWorkers(workers);
    if (typeof global !== 'undefined' && typeof global.saveCustomWorkers === 'function') return global.saveCustomWorkers(workers);
    root.customWorkers = workers;
    if (typeof global !== 'undefined') global.customWorkers = workers;
  }

  function handleWorkspaceGoogleAuthHelper() {
    if (typeof root.handleWorkspaceGoogleAuth === 'function') return root.handleWorkspaceGoogleAuth();
    if (typeof global !== 'undefined' && typeof global.handleWorkspaceGoogleAuth === 'function') return global.handleWorkspaceGoogleAuth();
  }

  function updateProfileDropdownUIHelper() {
    if (typeof root.updateProfileDropdownUI === 'function') return root.updateProfileDropdownUI();
    if (typeof global !== 'undefined' && typeof global.updateProfileDropdownUI === 'function') return global.updateProfileDropdownUI();
  }

  function renderAdminInvitesListHelper() {
    if (typeof root.renderAdminInvitesList === 'function') return root.renderAdminInvitesList();
    if (typeof global !== 'undefined' && typeof global.renderAdminInvitesList === 'function') return global.renderAdminInvitesList();
  }

  function getStoredInvitations() {
    try {
      const storage = (typeof localStorage !== 'undefined') ? localStorage : (root.localStorage || null);
      if (!storage) return [];
      const raw = storage.getItem(INVITATIONS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveStoredInvitations(invites) {
    try {
      const storage = (typeof localStorage !== 'undefined') ? localStorage : (root.localStorage || null);
      if (storage) {
        storage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(invites));
      }
    } catch (e) {
      console.warn("Could not save invitations:", e);
    }
  }

  async function handleSendSalesRepInvite(mode = 'email') {
    playSoundHelper('click');
    const doc = (typeof document !== 'undefined') ? document : (root.document || null);
    const emailInput = doc ? doc.getElementById('inviteSalesRepEmail') : null;
    const notesInput = doc ? doc.getElementById('inviteSalesRepNotes') : null;
    const roleSelect = doc ? doc.getElementById('inviteSalesRepRole') : null;

    const rawEmails = emailInput ? emailInput.value.trim() : '';
    if (!rawEmails) {
      if (typeof alert === 'function') alert('Please enter at least one recipient email address.');
      if (emailInput && typeof emailInput.focus === 'function') emailInput.focus();
      return;
    }

    // Parse comma, semicolon, space, or newline separated emails
    const emails = rawEmails
      .split(/[\s,;]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e && e.includes('@') && e.includes('.'));

    if (emails.length === 0) {
      if (typeof alert === 'function') alert('Please enter valid email address(es) (e.g. colleague@firm.com).');
      return;
    }

    const territoryNotes = notesInput ? notesInput.value.trim() : '';
    const selectedRole = roleSelect ? roleSelect.value : 'sales_rep_15';
    const is15Percent = selectedRole === 'sales_rep_15';
    const roleTitle = is15Percent ? 'Outreach Partner (15% Commission)' : 'Referral Affiliate (10% Commission)';
    const commissionRate = is15Percent ? '15%' : '10%';
    const commissionFloor = is15Percent ? '₹7,500' : '₹5,000';

    const existingInvites = getStoredInvitations();
    const createdInvites = [];
    const inviteLinks = [];

    const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'https://apoorv.qzz.io';

    for (const email of emails) {
      const token = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : ('inv_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36));

      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(); // 72 hours
      const inviteUrl = `${origin}/workspace/?invite=${token}`;

      const newInvite = {
        id: 'inv_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
        email: email,
        role: is15Percent ? 'sales_rep' : 'affiliate',
        roleTitle: roleTitle,
        commissionRate: commissionRate,
        commissionFloor: commissionFloor,
        territory: territoryNotes || 'Global / High-Value Sectors',
        token: token,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt,
        redeemedBy: null,
        redeemedAt: null
      };

      // Optionally notify managed backend endpoint
      try {
        const platformAuth = (typeof window !== 'undefined' && window.SALES_PLATFORM_AUTH) || root.SALES_PLATFORM_AUTH;
        if (platformAuth?.getAuth) {
          const auth = await platformAuth.getAuth();
          const tokenStr = await auth?.currentUser?.getIdToken?.();
          if (tokenStr && typeof fetch === 'function') {
            fetch('/api/owner-invitation', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenStr}`
              },
              body: JSON.stringify({ email, expiresAt })
            }).catch(() => {});
          }
        }
      } catch (err) {}

      existingInvites.unshift(newInvite);
      createdInvites.push(newInvite);
      inviteLinks.push({ email, inviteUrl });
    }

    saveStoredInvitations(existingInvites);
    renderAdminInvitationsList();

    if (emailInput) emailInput.value = '';
    if (notesInput) notesInput.value = '';

    const primaryInvite = createdInvites[0];
    const primaryUrl = inviteLinks[0].inviteUrl;

    // Copy primary invite link to clipboard
    const navClipboard = (typeof navigator !== 'undefined' && navigator.clipboard) ? navigator.clipboard : null;
    if (navClipboard && navClipboard.writeText) {
      navClipboard.writeText(primaryUrl).catch(() => {});
    }

    // Display primary link in #inviteGeneratedBox for immediate visibility & copying
    const genBox = doc ? doc.getElementById('inviteGeneratedBox') : null;
    const genInput = doc ? doc.getElementById('inviteGeneratedInput') : null;
    if (genBox && genInput) {
      genInput.value = primaryUrl;
      genBox.classList.remove('hidden');
      if (typeof genInput.select === 'function') genInput.select();
    }

    if (mode === 'email') {
      const subject = `Invitation: Join Apoorv A S as an Outreach Partner / Sales Rep`;
      const body = `Hi,

You have been invited by Apoorv A S to join the Client Radar workspace as an Authorized Sales Rep.

Position & Commercial Overview:
• Role: ${primaryInvite.roleTitle}
• Commission: ${primaryInvite.commissionRate} per closed deal (Floor: ${primaryInvite.commissionFloor} on ₹50,000 project floor; up to ₹30,000+ on enterprise)
• Direct Closing: Full authority to issue instant proposal teardowns and lock client deposits
• Focus / Sector: ${primaryInvite.territory}
• Moat: 60 FPS WebGL/WebGPU Spatial Portfolios, Web Performance & DPDP Act 2023 Compliance
• Client Radar Cockpit: Real-time dossiers, phone-verified decision-maker contacts, and live pitch teardowns

Activate your account and accept your invitation using this secure 1-click link:
${primaryUrl}

(Note: This invitation link is unique to you and expires in 72 hours.)

Best regards,
Apoorv A S
Creative Technologist & 3D WebUI Architect
apoorvxs@gmail.com | https://apoorv.qzz.io`;

      const mailtoUrl = `mailto:${encodeURIComponent(emails.join(','))}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      if (typeof window !== 'undefined' && window.open) {
        const mailWindow = window.open(mailtoUrl, '_blank');
        if (!mailWindow || mailWindow.closed || typeof mailWindow.closed === 'undefined') {
          if (window.location) window.location.href = mailtoUrl;
        }
      }

      showNotificationHelper(`[MAIL] Invitation generated! Link copied & displayed below.`);
    } else {
      showNotificationHelper(`[COPIED] Invitation generated! Link copied & displayed below.`);
    }
  }

  function copyGeneratedInviteFromBox() {
    playSoundHelper('click');
    const doc = (typeof document !== 'undefined') ? document : (root.document || null);
    const genInput = doc ? doc.getElementById('inviteGeneratedInput') : null;
    const btn = doc ? doc.getElementById('btnCopyGeneratedInvite') : null;
    if (!genInput || !genInput.value) return;

    const url = genInput.value;
    const navClipboard = (typeof navigator !== 'undefined' && navigator.clipboard) ? navigator.clipboard : null;
    if (navClipboard && navClipboard.writeText) {
      navClipboard.writeText(url).then(() => {
        showNotificationHelper('[COPIED] Invitation link copied to clipboard!');
        if (btn) {
          const oldText = btn.innerText;
          btn.innerText = 'Copied!';
          setTimeout(() => { btn.innerText = oldText; }, 2000);
        }
      }).catch(() => {
        if (typeof prompt === 'function') prompt('Copy invitation link:', url);
      });
    } else {
      if (typeof prompt === 'function') prompt('Copy invitation link:', url);
    }
  }

  function resendInviteEmail(inviteId) {
    playSoundHelper('click');
    const invites = getStoredInvitations();
    const inv = invites.find(i => i.id === inviteId || i.token === inviteId);
    if (!inv) return;

    const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'https://apoorv.qzz.io';
    const inviteUrl = `${origin}/workspace/?invite=${inv.token}`;
    const subject = `Invitation: Join Apoorv A S as an Outreach Partner / Sales Rep`;
    const body = `Hi,

You have been invited by Apoorv A S to join the Client Radar workspace as an Authorized Sales Rep.

Position & Commercial Overview:
• Role: ${inv.roleTitle || 'Outreach Partner (15% Commission)'}
• Commission: ${inv.commissionRate || '15%'} per closed deal (Floor: ${inv.commissionFloor || '₹7,500'} on ₹50,000 project floor; up to ₹30,000+ on enterprise)
• Direct Closing: Full authority to issue instant proposal teardowns and lock client deposits
• Focus / Sector: ${inv.territory || 'Global / High-Value Sectors'}
• Moat: 60 FPS WebGL/WebGPU Spatial Portfolios, Web Performance & DPDP Act 2023 Compliance
• Client Radar Cockpit: Real-time dossiers, phone-verified decision-maker contacts, and live pitch teardowns

Activate your account and accept your invitation using this secure 1-click link:
${inviteUrl}

(Note: This invitation link is unique to you and expires in 72 hours.)

Best regards,
Apoorv A S
Creative Technologist & 3D WebUI Architect
apoorvxs@gmail.com | https://apoorv.qzz.io`;

    const mailtoUrl = `mailto:${encodeURIComponent(inv.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (typeof window !== 'undefined' && window.open) {
      window.open(mailtoUrl, '_blank');
    }

    const navClipboard = (typeof navigator !== 'undefined' && navigator.clipboard) ? navigator.clipboard : null;
    if (navClipboard && navClipboard.writeText) {
      navClipboard.writeText(inviteUrl).catch(() => {});
    }
    showNotificationHelper(`[MAIL] Mail composer opened for ${inv.email} & link copied to clipboard.`);
  }

  function copyInviteLink(token) {
    playSoundHelper('click');
    const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'https://apoorv.qzz.io';
    const inviteUrl = `${origin}/workspace/?invite=${token}`;
    const navClipboard = (typeof navigator !== 'undefined' && navigator.clipboard) ? navigator.clipboard : null;
    if (navClipboard && navClipboard.writeText) {
      navClipboard.writeText(inviteUrl).then(() => {
        showNotificationHelper('[COPIED] Invite link copied to clipboard!');
      }).catch(() => {
        if (typeof prompt === 'function') prompt('Copy invite link:', inviteUrl);
      });
    } else {
      if (typeof prompt === 'function') prompt('Copy invite link:', inviteUrl);
    }
  }

  function revokeInvite(inviteId) {
    if (typeof confirm === 'function' && !confirm('Are you sure you want to revoke this invitation? The invitee will not be able to redeem it.')) return;
    playSoundHelper('click');
    const invites = getStoredInvitations();
    const inv = invites.find(i => i.id === inviteId || i.token === inviteId);
    if (inv) {
      inv.status = 'revoked';
      saveStoredInvitations(invites);
      renderAdminInvitationsList();
      showNotificationHelper('[BLOCKED] Invitation revoked.');
    }
  }

  function renderAdminInvitationsList() {
    const doc = (typeof document !== 'undefined') ? document : (root.document || null);
    if (!doc) return;
    const container = doc.getElementById('adminInvitationsList');
    const badge = doc.getElementById('adminPendingInvitesBadge');
    if (!container) return;

    const invites = getStoredInvitations();
    const activeCount = invites.filter(i => i.status === 'pending' && new Date(i.expiresAt) > new Date()).length;
    if (badge) badge.innerText = `${activeCount} Active`;

    if (invites.length === 0) {
      container.innerHTML = `<div class="text-xs text-neutral-500 font-mono italic">No invitations generated yet. Enter an email above to dispatch your first invite.</div>`;
      return;
    }

    container.innerHTML = '';
    invites.forEach(inv => {
      const isExpired = new Date(inv.expiresAt) <= new Date();
      const isRedeemed = inv.status === 'redeemed';
      const isRevoked = inv.status === 'revoked';
      const isPending = inv.status === 'pending' && !isExpired;

      let statusHtml = '';
      if (isRedeemed) {
        statusHtml = `<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">🟢 Redeemed</span>`;
      } else if (isRevoked) {
        statusHtml = `<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-500 border border-neutral-800">⚪ Revoked</span>`;
      } else if (isExpired) {
        statusHtml = `<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/40">🔴 Expired</span>`;
      } else {
        const hoursLeft = Math.max(0, Math.round((new Date(inv.expiresAt) - new Date()) / (1000 * 60 * 60)));
        statusHtml = `<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">🟡 Pending (${hoursLeft}h left)</span>`;
      }

      const card = doc.createElement('div');
      card.className = "flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 gap-2.5 text-xs hover:border-white/10 transition";
      card.innerHTML = `
        <div class="min-w-0 flex-1 space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-white font-mono truncate">${escapeHTML(inv.email)}</span>
            <span class="px-1.5 py-0.2 rounded bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[10px] font-mono">${escapeHTML(inv.roleTitle || 'Sales Rep')}</span>
            ${statusHtml}
          </div>
          <div class="text-[11px] text-slate-400 font-mono flex items-center gap-2 flex-wrap">
            <span>Territory: <span class="text-slate-300">${escapeHTML(inv.territory || 'Global')}</span></span>
            <span>•</span>
            <span>Created: <span class="text-slate-300">${new Date(inv.createdAt).toLocaleDateString()}</span></span>
            ${inv.redeemedBy ? `<span>• Redeemed by: <span class="text-emerald-300">${escapeHTML(inv.redeemedBy)}</span></span>` : ''}
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          <button onclick="copyInviteLink('${inv.token}')" class="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] transition flex items-center gap-1 cursor-pointer" title="Copy 1-Click Link">
            <span>[LINK]</span><span>Copy Link</span>
          </button>
          ${isPending ? `
            <button onclick="resendInviteEmail('${inv.id}')" class="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 font-mono text-[11px] transition flex items-center gap-1 cursor-pointer" title="Resend Email">
              <span>[MAIL]</span><span>Resend</span>
            </button>
            <button onclick="revokeInvite('${inv.id}')" class="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 font-mono text-[11px] transition cursor-pointer" title="Revoke">
              ✕
            </button>
          ` : ''}
        </div>
      `;
      container.appendChild(card);
    });
  }

  function claimActiveInvite(token) {
    if (!token) return;
    const currentUser = getCurrentUser();
    const session = (typeof sessionStorage !== 'undefined') ? sessionStorage : (typeof window !== 'undefined' ? window.sessionStorage : null);
    if (!currentUser) {
      if (session) session.setItem('sprintdial_active_invite_token', token);
      handleWorkspaceGoogleAuthHelper();
      return;
    }
    const storedInvites = getStoredInvitations();
    const inv = storedInvites.find(i => i.token === token && i.status === 'pending');
    if (!inv) {
      showNotificationHelper('[ALERT] Invitation is invalid or expired.');
      return;
    }
    inv.status = 'redeemed';
    inv.redeemedBy = currentUser.email;
    inv.redeemedAt = new Date().toISOString();
    saveStoredInvitations(storedInvites);
    if (session) session.removeItem('sprintdial_active_invite_token');

    const userSlug = (currentUser.email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const customWorkers = getCustomWorkersHelper();
    customWorkers[userSlug] = {
      name: currentUser.displayName || currentUser.name || userSlug,
      email: currentUser.email,
      role: 'caller',
      commissionTier: inv.commissionRate || '15%',
      picture: currentUser.photoURL || currentUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || userSlug)}&background=1E3A8A&color=60A5FA&bold=true`,
      createdAt: new Date().toISOString()
    };
    saveCustomWorkersHelper(customWorkers);
    if (typeof root.customWorkers !== 'undefined') {
      root.customWorkers[userSlug] = customWorkers[userSlug];
    }
    if (typeof global !== 'undefined' && global.customWorkers) {
      global.customWorkers[userSlug] = customWorkers[userSlug];
    }

    const doc = (typeof document !== 'undefined') ? document : (root.document || null);
    const banner = doc ? doc.getElementById('inviteRedemptionBanner') : null;
    if (banner) banner.remove();

    showNotificationHelper(`[SUCCESS] Invitation claimed! Activated as Outreach Partner (${inv.commissionRate || '15%'} tier).`);
    updateProfileDropdownUIHelper();
    renderAdminInvitesListHelper();
  }

  function handleInviteToken(token) {
    if (!token) return;
    const doc = (typeof document !== 'undefined') ? document : (root.document || null);
    if (!doc || !doc.body) return;

    const invites = getStoredInvitations();
    const inv = invites.find(i => i.token === token);

    const existingBanner = doc.getElementById('inviteRedemptionBanner');
    if (existingBanner) existingBanner.remove();

    const inviteBanner = doc.createElement('div');
    inviteBanner.id = 'inviteRedemptionBanner';
    inviteBanner.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-lg w-[95%] p-4 font-mono';
    inviteBanner.style.cssText = 'background: #17120f !important; color: #fffdf1 !important; border: 3px solid #17120f !important; box-shadow: 6px 6px 0 rgba(23, 18, 15, 0.5) !important;';

    const currentUser = getCurrentUser();
    const session = (typeof sessionStorage !== 'undefined') ? sessionStorage : (typeof window !== 'undefined' ? window.sessionStorage : null);

    if (inv && inv.status === 'pending' && new Date(inv.expiresAt) > new Date()) {
      if (session) session.setItem('sprintdial_active_invite_token', token);
      const claimButtonHtml = currentUser ? `
        <button type="button" onclick="claimActiveInvite('${escapeHTML(token)}')" class="px-4 py-2 bg-[#4deeea] text-[#17120f] hover:bg-[#38d4d0] border-2 border-[#17120f] font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-[2px_2px_0_#17120f] cursor-pointer">
          <span>[CLAIM]</span><span>Claim as ${escapeHTML(currentUser.displayName || currentUser.name || currentUser.email)}</span>
        </button>
      ` : `
        <button type="button" onclick="handleWorkspaceGoogleAuth()" class="px-4 py-2 bg-[#fce566] text-[#17120f] hover:bg-[#fffdf1] border-2 border-[#17120f] font-mono text-xs font-bold transition flex items-center gap-2 shadow-[2px_2px_0_#17120f] cursor-pointer">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/></svg>
          <span>Sign in with Google to Claim</span>
        </button>
      `;

      inviteBanner.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1.5 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-emerald-400">[INVITED]</span>
              <span class="text-xs sm:text-sm font-bold text-[#fce566] font-arcade tracking-wider">SALES REP INVITATION</span>
            </div>
            <p class="text-xs text-[#fff4c9] font-mono leading-relaxed mt-1">
              You've been invited by Apoorv as an <strong class="text-[#4deeea] font-mono">${escapeHTML(inv.roleTitle || 'Outreach Partner')}</strong>. Claim your invitation to activate your 15% revenue-share commission tier.
            </p>
            <div class="pt-2 flex flex-wrap items-center gap-2">
              ${claimButtonHtml}
              <button type="button" onclick="this.closest('#inviteRedemptionBanner').remove()" class="px-3 py-2 bg-[#fffdf1] text-[#17120f] hover:bg-[#fce566] border-2 border-[#17120f] font-mono text-xs font-bold transition shadow-[2px_2px_0_#17120f] cursor-pointer">
                Dismiss
              </button>
            </div>
          </div>
          <button type="button" onclick="this.closest('#inviteRedemptionBanner').remove()" class="text-[#fce566] hover:text-white text-xs px-2 py-1 cursor-pointer font-bold">✕</button>
        </div>
      `;
    } else if (inv && inv.status === 'redeemed') {
      inviteBanner.innerHTML = `
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-[#fce566] font-mono">ℹ️ This invitation has already been redeemed. Please sign in with your authorized account.</div>
          <button type="button" onclick="this.closest('#inviteRedemptionBanner').remove()" class="text-[#fce566] hover:text-white text-xs px-2 py-1 cursor-pointer font-bold">✕</button>
        </div>
      `;
    } else {
      if (session) session.setItem('sprintdial_active_invite_token', token);
      inviteBanner.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1.5 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-amber-400">[ACCESS]</span>
              <span class="text-xs sm:text-sm font-bold text-[#fce566] font-arcade tracking-wider">OUTREACH PARTNER INVITE</span>
            </div>
            <p class="text-xs text-[#fff4c9] font-mono leading-relaxed mt-1">
              Sign in with Google to claim your Sales Rep invitation and access the Client Radar Cockpit.
            </p>
            <div class="pt-2 flex flex-wrap items-center gap-2">
              <button type="button" onclick="handleWorkspaceGoogleAuth()" class="px-4 py-2 bg-[#fce566] text-[#17120f] hover:bg-[#fffdf1] border-2 border-[#17120f] font-mono text-xs font-bold transition flex items-center gap-2 shadow-[2px_2px_0_#17120f] cursor-pointer">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/></svg>
                <span>Sign in with Google</span>
              </button>
              <button type="button" onclick="this.closest('#inviteRedemptionBanner').remove()" class="px-3 py-2 bg-[#fffdf1] text-[#17120f] hover:bg-[#fce566] border-2 border-[#17120f] font-mono text-xs font-bold transition shadow-[2px_2px_0_#17120f] cursor-pointer">
                Dismiss
              </button>
            </div>
          </div>
          <button type="button" onclick="this.closest('#inviteRedemptionBanner').remove()" class="text-[#fce566] hover:text-white text-xs px-2 py-1 cursor-pointer font-bold">✕</button>
        </div>
      `;
    }
    doc.body.appendChild(inviteBanner);
  }

  function triggerDirectGoogleAuth() {
    handleWorkspaceGoogleAuthHelper();
  }

  const exports = {
    INVITATIONS_STORAGE_KEY,
    getStoredInvitations,
    saveStoredInvitations,
    handleSendSalesRepInvite,
    resendInviteEmail,
    copyInviteLink,
    revokeInvite,
    renderAdminInvitationsList,
    claimActiveInvite,
    handleInviteToken,
    triggerDirectGoogleAuth,
    copyGeneratedInviteFromBox
  };

  root.WorkspaceInvitationsEngine = exports;

  for (const key in exports) {
    root[key] = exports[key];
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
