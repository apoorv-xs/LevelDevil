(function(root) {
  'use strict';

  let isAuthenticatingGoogle = false;

  function initGuestMode() {
    root.currentUser = null;
    const overlay = document.getElementById('authGateOverlay');
    if (overlay) overlay.classList.add('hidden');

    const signInBtn = document.getElementById('workspaceSignInBtnHeader');
    if (signInBtn) {
      signInBtn.classList.remove('hidden');
      signInBtn.classList.add('flex');
    }

    const userChip = document.getElementById('userChipHeader');
    if (userChip) {
      userChip.classList.add('hidden');
      userChip.classList.remove('flex');
    }

    const adminBtn = document.getElementById('adminBtnHeader');
    if (adminBtn) {
      adminBtn.classList.add('hidden');
      adminBtn.classList.remove('flex');
    }

    // Viewport Role Gating: Guests see Restricted Access Gate only
    const cockpit = document.getElementById('workspaceCockpitContainer');
    if (cockpit) cockpit.classList.add('hidden');

    const mobileTabs = document.getElementById('mobileSwitcherTabs');
    if (mobileTabs) mobileTabs.classList.add('hidden');

    const applicant = document.getElementById('workspaceApplicantContainer');
    if (applicant) applicant.classList.add('hidden');

    if (typeof root.updateInstallAppVisibility === 'function') root.updateInstallAppVisibility();

    const gate = document.getElementById('workspaceGateContainer');
    if (gate) gate.classList.remove('hidden');

    // Do NOT load confidential client dossiers into DOM for unauthenticated guests
  }

  function handleUserAuthResolved(user) {
    if (!user || !user.email) {
      initGuestMode();
      return;
    }
    const email = (user.email || '').toLowerCase().trim();
    const isOwner = root.isApoorvOwnerEmail(email);
    const customWorkers = getCustomWorkers();
    const isAuthorizedCaller = Object.values(customWorkers).some(w => (w.email || '').toLowerCase() === email);

    const photo = user.photoURL || user.picture || (user.providerData && user.providerData[0]?.photoURL) || '';
    const displayName = user.displayName || user.name || (email ? email.split('@')[0] : 'User');

    if (isOwner) {
      // Tier 1: Owner (Apoorv)
      root.currentUser = {
        name: displayName,
        displayName: displayName,
        email: user.email,
        picture: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=fff1bd&color=17120f`,
        photoURL: photo || '',
        role: 'owner',
        sub: user.uid || Date.now().toString()
      };
      localStorage.setItem('sprintdial_user', JSON.stringify(root.currentUser));
      localStorage.setItem('sprintdial_google_user', JSON.stringify(root.currentUser));
      if (typeof root.onAuthVerified === 'function') root.onAuthVerified();
    } else if (isAuthorizedCaller) {
      // Tier 2: Outreach Partner (Authorized Referral Affiliate)
      root.currentUser = {
        name: displayName,
        displayName: displayName,
        email: user.email,
        picture: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1E3A8A&color=60A5FA&bold=true`,
        photoURL: photo || '',
        role: 'caller',
        sub: user.uid || Date.now().toString()
      };
      localStorage.setItem('sprintdial_user', JSON.stringify(root.currentUser));
      localStorage.setItem('sprintdial_google_user', JSON.stringify(root.currentUser));
      if (typeof root.onAuthVerified === 'function') root.onAuthVerified();
    } else {
      // Check for pending Sales Rep invitation
      const activeInviteToken = (typeof sessionStorage !== 'undefined') ? sessionStorage.getItem('sprintdial_active_invite_token') : null;
      const storedInvites = typeof root.getStoredInvitations === 'function' ? root.getStoredInvitations() : [];
      const matchedInvite = storedInvites.find(i => 
        (activeInviteToken && i.token === activeInviteToken && i.status === 'pending') ||
        (i.email && i.email.toLowerCase() === email && i.status === 'pending' && new Date(i.expiresAt) > new Date())
      );

      if (matchedInvite && !isOwner) {
        matchedInvite.status = 'redeemed';
        matchedInvite.redeemedBy = email;
        matchedInvite.redeemedAt = new Date().toISOString();
        if (typeof root.saveStoredInvitations === 'function') root.saveStoredInvitations(storedInvites);
        if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('sprintdial_active_invite_token');

        const userSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        customWorkers[userSlug] = {
          name: displayName,
          email: email,
          role: 'caller',
          commissionTier: matchedInvite.commissionRate || '15%',
          picture: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1E3A8A&color=60A5FA&bold=true`,
          createdAt: new Date().toISOString()
        };
        saveCustomWorkers(customWorkers);

        root.currentUser = {
          name: displayName,
          displayName: displayName,
          email: user.email,
          picture: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1E3A8A&color=60A5FA&bold=true`,
          photoURL: photo || '',
          role: 'caller',
          commissionTier: matchedInvite.commissionRate || '15%',
          sub: user.uid || Date.now().toString()
        };
        localStorage.setItem('sprintdial_user', JSON.stringify(root.currentUser));
        localStorage.setItem('sprintdial_google_user', JSON.stringify(root.currentUser));
        if (typeof root.onAuthVerified === 'function') root.onAuthVerified();
        if (typeof root.showNotification === 'function') root.showNotification(`[SUCCESS] Welcome ${displayName}! Your Sales Rep invitation has been verified and redeemed.`);
        return;
      }

      // Tier 3: Authenticated Google User (Applicant / Normal Visitor)
      root.currentUser = {
        name: displayName,
        displayName: displayName,
        email: user.email,
        picture: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=fff1bd&color=17120f&bold=true`,
        photoURL: photo || '',
        role: 'applicant',
        sub: user.uid || Date.now().toString()
      };
      localStorage.setItem('sprintdial_user', JSON.stringify(root.currentUser));
      localStorage.setItem('sprintdial_google_user', JSON.stringify(root.currentUser));
      renderApplicantView(root.currentUser);
    }
  }

  function renderApplicantView(user) {
    if (!user) return;
    root.currentUser = user;

    const overlay = document.getElementById('authGateOverlay');
    if (overlay) overlay.classList.add('hidden');

    // Gated Viewports: Hide Gate & Cockpit, Display Dedicated Applicant Portal
    const gate = document.getElementById('workspaceGateContainer');
    if (gate) gate.classList.add('hidden');

    const cockpit = document.getElementById('workspaceCockpitContainer');
    if (cockpit) cockpit.classList.add('hidden');

    const mobileTabs = document.getElementById('mobileSwitcherTabs');
    if (mobileTabs) mobileTabs.classList.add('hidden');

    const applicantContainer = document.getElementById('workspaceApplicantContainer');
    if (applicantContainer) applicantContainer.classList.remove('hidden');

    // Topbar Updates: User Chip Visible, Sign In Button Hidden
    const signInBtn = document.getElementById('workspaceSignInBtnHeader');
    if (signInBtn) {
      signInBtn.classList.add('hidden');
      signInBtn.classList.remove('flex');
    }

    const displayName = user.name || user.displayName || (user.email ? user.email.split('@')[0] : 'User');
    const userTopName = document.getElementById('userTopName');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userImg = document.getElementById('userImg');
    if (userTopName) userTopName.innerText = displayName;
    if (userName) userName.innerText = displayName;
    if (userEmail) userEmail.innerText = user.email || '';
    const currentImgSrc = user.picture || user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=fff1bd&color=17120f`;
    if (userImg) {
      userImg.referrerPolicy = "no-referrer";
      userImg.src = currentImgSrc;
    }
    const ddImg1 = document.getElementById('dropdownUserImg');
    if (ddImg1) {
      ddImg1.referrerPolicy = "no-referrer";
      ddImg1.src = currentImgSrc;
    }

    const userChip = document.getElementById('userChipHeader');
    if (userChip) {
      userChip.classList.remove('hidden');
      userChip.classList.add('flex');
    }

    const adminBtn = document.getElementById('adminBtnHeader');
    if (adminBtn) {
      adminBtn.classList.add('hidden');
      adminBtn.classList.remove('flex');
    }

    if (typeof root.updateInstallAppVisibility === 'function') root.updateInstallAppVisibility();

    // Populate In-Viewport Portal Information
    const pImg = document.getElementById('portalApplicantImg');
    const pName = document.getElementById('portalApplicantName');
    const pEmail = document.getElementById('portalApplicantEmail');
    if (pImg) pImg.src = user.picture;
    if (pName) pName.innerText = user.name;
    if (pEmail) pEmail.innerText = user.email;

    // Check Existing Applications on File
    const apps = getStoredApplications();
    const existing = apps.find(a => (a.email || '').toLowerCase() === (user.email || '').toLowerCase());
    const form = document.getElementById('portalApplicationForm');
    const statusBox = document.getElementById('portalApplicantStatusBox');
    const statusTerritory = document.getElementById('portalApplicantStatusTerritory');
    const statusDate = document.getElementById('portalApplicantStatusDate');

    if (existing) {
      if (form) form.classList.add('hidden');
      if (statusBox) statusBox.classList.remove('hidden');
      if (statusTerritory) statusTerritory.innerText = existing.territory || 'Remote / Global';
      if (statusDate) {
        try {
          statusDate.innerText = new Date(existing.timestamp).toLocaleString();
        } catch (e) {
          statusDate.innerText = existing.timestamp || 'Recently';
        }
      }
    } else {
      if (form) form.classList.remove('hidden');
      if (statusBox) statusBox.classList.add('hidden');
    }

    // Also sync modal applicant elements if modal is ever opened
    const mImg = document.getElementById('applicantImg');
    const mName = document.getElementById('applicantName');
    const mEmail = document.getElementById('applicantEmail');
    if (mImg) mImg.src = user.picture;
    if (mName) mName.innerText = user.name;
    if (mEmail) mEmail.innerText = user.email;
  }

  function openAuthGate() {
    const overlay = document.getElementById('authGateOverlay');
    const signInBox = document.getElementById('authGateSignInBox');
    const applicantBox = document.getElementById('authGateApplicantBox');
    if (overlay) overlay.classList.remove('hidden');
    if (root.currentUser && root.currentUser.role === 'applicant') {
      if (signInBox) signInBox.classList.add('hidden');
      if (applicantBox) applicantBox.classList.remove('hidden');
    } else {
      if (signInBox) signInBox.classList.remove('hidden');
      if (applicantBox) applicantBox.classList.add('hidden');
    }
  }

  function showAuthGate() {
    openAuthGate();
  }

  function closeAuthGate() {
    const overlay = document.getElementById('authGateOverlay');
    if (overlay) overlay.classList.add('hidden');
  }

  function handleAuthBackdropClick(e) {
    if (e && e.target && e.target.id === 'authGateOverlay') {
      closeAuthGate();
    }
  }

  function showApplicantPortal(user) {
    const overlay = document.getElementById('authGateOverlay');
    const signInBox = document.getElementById('authGateSignInBox');
    const applicantBox = document.getElementById('authGateApplicantBox');
    if (overlay) overlay.classList.remove('hidden');
    if (signInBox) signInBox.classList.add('hidden');
    if (applicantBox) {
      applicantBox.classList.remove('hidden');
      const img = document.getElementById('applicantImg');
      const name = document.getElementById('applicantName');
      const email = document.getElementById('applicantEmail');
      if (img) img.src = user.picture;
      if (name) name.innerText = user.name;
      if (email) email.innerText = user.email;

      const apps = getStoredApplications();
      const existing = apps.find(a => (a.email || '').toLowerCase() === user.email.toLowerCase());
      const form = document.getElementById('repApplicationForm');
      const successMsg = document.getElementById('applicantSuccessMsg');
      if (existing) {
        if (form) form.classList.add('hidden');
        if (successMsg) {
          successMsg.classList.remove('hidden');
          successMsg.innerHTML = `[ON FILE] Application on file (<strong>${root.escapeHTML(existing.territory || 'General')}</strong>)! Status: <strong class="text-white">PENDING REVIEW</strong>. Apoorv will review and grant your partner access.`;
        }
      } else {
        if (form) form.classList.remove('hidden');
        if (successMsg) successMsg.classList.add('hidden');
      }
    }
  }

  function handleRepApplicationSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!root.currentUser || !root.currentUser.email) return;

    const portalConsent = document.getElementById('portalApplicantConsent');
    if (portalConsent && !portalConsent.checked) {
      alert("Please acknowledge the DPDP statutory consent before submitting your application.");
      portalConsent.focus();
      return;
    }

    const territory = document.getElementById('portalApplicantTerritory')?.value ||
                      document.getElementById('applicantTerritory')?.value || 'Remote / Global';
    const pitch = document.getElementById('portalApplicantPitch')?.value?.trim() ||
                  document.getElementById('applicantPitch')?.value?.trim() || '';
    const phone = document.getElementById('portalApplicantPhone')?.value?.trim() ||
                  document.getElementById('applicantPhone')?.value?.trim() || '';

    const appRecord = {
      id: `app_${Date.now()}`,
      name: root.currentUser.name,
      email: root.currentUser.email,
      picture: root.currentUser.picture,
      territory,
      pitch,
      phone,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    const apps = getStoredApplications();
    apps.unshift(appRecord);
    saveStoredApplications(apps);

    // Persist to Firestore if initialized
    if (typeof window !== 'undefined' && window.SALES_PLATFORM_AUTH?.getFirestore) {
      window.SALES_PLATFORM_AUTH.getFirestore().then(db => {
        db.collection('applications').doc(appRecord.id).set(appRecord).catch(() => {});
      }).catch(() => {});
    }

    // Update modal success message if open
    const form = document.getElementById('repApplicationForm');
    const successMsg = document.getElementById('applicantSuccessMsg');
    if (form) form.classList.add('hidden');
    if (successMsg) {
      successMsg.classList.remove('hidden');
      successMsg.innerHTML = `[SUBMITTED] Application submitted! Status: <strong class="text-white">PENDING REVIEW</strong>. Apoorv will review your profile and unlock your workstation access.`;
    }

    // Update in-viewport portal
    renderApplicantView(root.currentUser);
    if (typeof root.showNotification === 'function') root.showNotification('Application submitted to Apoorv for review.');
  }

  function getStoredApplications() {
    try {
      const raw = localStorage.getItem('sprintdial_applications');
      return raw ? JSON.parse(raw) : [];
    } catch(e) {
      return [];
    }
  }

  function saveStoredApplications(apps) {
    try {
      localStorage.setItem('sprintdial_applications', JSON.stringify(apps));
    } catch(e) {}
  }

  function approveApplicationAsWorker(appId) {
    if (typeof root.isOwnerUser === 'function' && !root.isOwnerUser(root.currentUser)) return;
    const apps = getStoredApplications();
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    const workers = getCustomWorkers();
    const username = (app.email.split('@')[0] || `rep_${Date.now()}`).toLowerCase().replace(/[^a-z0-9_]/g, '');
    workers[username] = {
      name: app.name,
      email: app.email,
      picture: app.picture,
      password: `rep_${Math.random().toString(36).slice(2, 8)}`,
      approvedAt: new Date().toISOString()
    };
    saveCustomWorkers(workers);

    app.status = 'approved';
    saveStoredApplications(apps);

    if (typeof window !== 'undefined' && window.SALES_PLATFORM_AUTH?.getFirestore) {
      window.SALES_PLATFORM_AUTH.getFirestore().then(db => {
        db.collection('applications').doc(appId).update({ status: 'approved' }).catch(() => {});
      }).catch(() => {});
    }

    renderAdminUsersList();
    if (typeof root.showNotification === 'function') root.showNotification(`[SAVED] Approved ${app.name} (${app.email}) as authorized outreach partner!`);
  }

  // Caller accounts registered dynamically by the Owner via Admin Console
  function getCustomWorkers() {
    try {
      const raw = localStorage.getItem('sprintdial_custom_workers');
      return raw ? JSON.parse(raw) : {};
    } catch(e) {
      return {};
    }
  }

  function saveCustomWorkers(workers) {
    try {
      localStorage.setItem('sprintdial_custom_workers', JSON.stringify(workers));
    } catch(e) {}
  }

  function getAllAuthorizedAccounts() {
    return getCustomWorkers();
  }

  async function handleWorkspaceGoogleAuth() {
    if (isAuthenticatingGoogle) return;
    isAuthenticatingGoogle = true;

    const errEl = document.getElementById('loginErrorMsg');
    const gateErrEl = document.getElementById('gateErrorMsg');
    if (errEl) errEl.classList.add('hidden');
    if (gateErrEl) gateErrEl.classList.add('hidden');

    const gateBtn = document.getElementById('gateGoogleSignInBtn');
    const modalBtn = document.getElementById('googleSignInBtn');
    if (gateBtn) gateBtn.disabled = true;
    if (modalBtn) modalBtn.disabled = true;

    try {
      const auth = typeof window !== 'undefined' ? window.SALES_PLATFORM_AUTH : null;
      if (!auth?.signIn) {
        throw new Error("Google authentication service is initializing. Please refresh and try again.");
      }
      const result = await auth.signIn();
      if (result?.user) {
        handleUserAuthResolved(result.user);
      }
    } catch (err) {
      const msg = err.message || 'Authentication failed.';
      if (errEl) {
        errEl.innerText = msg;
        errEl.classList.remove('hidden');
      }
      if (gateErrEl) {
        gateErrEl.innerText = msg;
        gateErrEl.classList.remove('hidden');
      }
    } finally {
      isAuthenticatingGoogle = false;
      if (gateBtn) gateBtn.disabled = false;
      if (modalBtn) modalBtn.disabled = false;
    }
  }

  function handleCredentialsAuth(e) {
    if (e && e.preventDefault) e.preventDefault();
    const userInput = document.getElementById('loginUsernameInput');
    const passInput = document.getElementById('loginPasswordInput');
    const errEl = document.getElementById('loginErrorMsg');

    const rawUser = userInput ? userInput.value.trim().toLowerCase() : '';
    const rawPass = passInput ? passInput.value.trim() : '';

    if (errEl) errEl.classList.add('hidden');

    const customWorkers = getCustomWorkers();
    const matched = customWorkers[rawUser];

    if (matched) {
      const validPasswords = Array.isArray(matched.password) ? matched.password : [matched.password];
      if (validPasswords.includes(rawPass)) {
        root.currentUser = {
          name: matched.name || rawUser,
          username: rawUser,
          email: matched.email || `${rawUser}@workspace.local`,
          picture: matched.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawUser)}&background=1E3A8A&color=60A5FA&bold=true`,
          role: 'caller',
          callerToken: Math.random().toString(36).slice(2) + Date.now().toString(36),
          tokenExp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
          sub: Date.now().toString()
        };
        localStorage.setItem('sprintdial_user', JSON.stringify(root.currentUser));
        localStorage.setItem('sprintdial_google_user', JSON.stringify(root.currentUser));
        if (typeof root.onAuthVerified === 'function') root.onAuthVerified();
        return;
      }
    }

    // Failed Auth
    if (errEl) {
      errEl.innerText = 'Invalid credentials. Only authorized logins created by Admin can sign in.';
      errEl.classList.remove('hidden');
    }
  }

  function handleCreateWorkerAccount(e) {
    if (e && e.preventDefault) e.preventDefault();
    const userInput = document.getElementById('newWorkerUsername');
    const passInput = document.getElementById('newWorkerPassword');
    const nameInput = document.getElementById('newWorkerDisplayName');

    const username = userInput ? userInput.value.trim().toLowerCase() : '';
    const password = passInput ? passInput.value.trim() : '';
    const displayName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : (username.charAt(0).toUpperCase() + username.slice(1));

    if (!username || !password) {
      alert('Please provide both username and password.');
      return;
    }

    if (username === 'apoorv' || username.includes('admin')) {
      alert('Cannot override primary Admin/Owner identity.');
      return;
    }

    const workers = getCustomWorkers();
    workers[username] = {
      password: [password],
      name: displayName,
      email: `${username}@clientradar.internal`,
      role: 'caller',
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1E293B&color=94A3B8`,
      createdAt: new Date().toISOString()
    };

    saveCustomWorkers(workers);

    if (userInput) userInput.value = '';
    if (passInput) passInput.value = '';
    if (nameInput) nameInput.value = '';

    renderAdminUsersList();
    if (typeof root.showNotification === 'function') root.showNotification(`[SAVED] Partner account "@${username}" created successfully!`);
  }

  function deleteWorkerAccount(username) {
    if (!confirm(`Are you sure you want to delete partner account "@${username}"?`)) return;
    const workers = getCustomWorkers();
    if (workers[username]) {
      delete workers[username];
      saveCustomWorkers(workers);
      renderAdminUsersList();
      if (typeof root.showNotification === 'function') root.showNotification(`[REMOVED] Partner account "@${username}" removed.`);
    }
  }

  function renderAdminUsersList() {
    const container = document.getElementById('adminUsersList');
    if (!container) return;

    const allAccounts = getAllAuthorizedAccounts();
    const customWorkers = getCustomWorkers();

    container.innerHTML = '';

    // Render Owner First
    const ownerEl = document.createElement('div');
    ownerEl.className = "flex items-center justify-between p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs";
    ownerEl.innerHTML = `
      <div class="flex items-center gap-3">
        <img src="https://ui-avatars.com/api/?name=Apoorv&background=1E3A8A&color=60A5FA&bold=true" class="w-7 h-7 rounded-full border border-blue-500/50">
        <div>
          <div class="font-bold text-white flex items-center gap-1.5 font-mono">
            <span>Apoorv</span>
            <span class="px-1.5 py-0.2 rounded bg-blue-600 text-[10px] text-white font-mono">OWNER / ADMIN</span>
          </div>
          <div class="text-[11px] text-slate-400 font-mono">Account: <span class="text-blue-300">apoorv</span> • Auth: <span class="text-emerald-400">Google SSO</span></div>
        </div>
      </div>
      <span class="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">Active System</span>
    `;
    container.appendChild(ownerEl);

    // Render Registered Custom Worker Accounts
    Object.keys(customWorkers).forEach(userKey => {
      const acc = customWorkers[userKey] || {};
      const safeUserKey = root.escapeHTML ? root.escapeHTML(userKey) : userKey;
      const safeName = root.escapeHTML ? root.escapeHTML(acc.name || userKey) : (acc.name || userKey);
      const safePicture = (typeof acc.picture === 'string' && (acc.picture.startsWith('https://') || acc.picture.startsWith('http://')))
        ? (root.escapeHTML ? root.escapeHTML(acc.picture) : acc.picture)
        : ('https://ui-avatars.com/api/?name=' + encodeURIComponent(userKey));

      const el = document.createElement('div');
      el.className = "flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 text-xs hover:border-white/10 transition";
      el.innerHTML = `
        <div class="flex items-center gap-3">
          <img src="${safePicture}" class="w-7 h-7 rounded-full border border-slate-700">
          <div>
            <div class="font-bold text-white flex items-center gap-1.5 font-mono">
              <span>${safeName}</span>
              <span class="px-1.5 py-0.2 rounded bg-white/10 text-[10px] text-slate-300 font-mono">CALLER</span>
              <span class="text-[9px] text-blue-400 bg-blue-950/40 px-1.5 py-0.2 rounded border border-blue-800/40">Custom</span>
            </div>
            <div class="text-[11px] text-slate-400 font-mono">Username: <span class="text-white">${safeUserKey}</span></div>
          </div>
        </div>
        <div>
          <button class="delete-worker-btn px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-[11px] font-mono transition cursor-pointer">
            Delete
          </button>
        </div>
      `;
      const deleteBtn = el.querySelector('.delete-worker-btn');
      if (deleteBtn) {
        deleteBtn.onclick = () => deleteWorkerAccount(userKey);
      }
      container.appendChild(el);
    });

    renderAdminApplicationsList();
    if (typeof root.renderAdminInvitationsList === 'function') root.renderAdminInvitationsList();
  }

  function renderAdminApplicationsList() {
    const container = document.getElementById('adminApplicationsList');
    const badge = document.getElementById('adminPendingAppsBadge');
    if (!container) return;

    const apps = getStoredApplications().filter(a => a.status === 'pending');
    if (badge) badge.innerText = `${apps.length} Pending`;

    if (apps.length === 0) {
      container.innerHTML = `<div class="text-xs text-neutral-500 font-mono italic">No pending sales applications.</div>`;
      return;
    }

    container.innerHTML = '';
    apps.forEach(app => {
      const el = document.createElement('div');
      el.className = "flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-black/40 border border-blue-900/30 text-xs gap-3";
      el.innerHTML = `
        <div class="space-y-1 flex-1">
          <div class="flex items-center gap-2">
            <img src="${root.escapeHTML ? root.escapeHTML(app.picture || '') : (app.picture || '')}" class="w-6 h-6 rounded-full border border-blue-400">
            <span class="font-bold text-white font-mono">${root.escapeHTML ? root.escapeHTML(app.name) : app.name}</span>
            <span class="text-[10px] text-blue-300 font-mono">(${root.escapeHTML ? root.escapeHTML(app.email) : app.email})</span>
            <span class="px-1.5 py-0.5 rounded bg-blue-950 text-[10px] text-blue-300 border border-blue-800 font-mono">${root.escapeHTML ? root.escapeHTML(app.territory) : app.territory}</span>
          </div>
          <div class="text-[11px] text-slate-300 font-mono pl-8 italic">"${root.escapeHTML ? root.escapeHTML(app.pitch) : app.pitch}"</div>
          ${app.phone ? `<div class="text-[10px] text-slate-400 font-mono pl-8">Phone: ${root.escapeHTML ? root.escapeHTML(app.phone) : app.phone}</div>` : ''}
        </div>
        <div class="shrink-0 flex gap-2 sm:self-center pl-8 sm:pl-0">
          <button class="approve-rep-btn px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition cursor-pointer">
            ✓ Approve as Outreach Partner
          </button>
        </div>
      `;
      const btn = el.querySelector('.approve-rep-btn');
      if (btn) {
        btn.onclick = () => approveApplicationAsWorker(app.id);
      }
      container.appendChild(el);
    });
  }

  let firebaseObserverInitialized = false;
  async function initFirebaseSessionObserver() {
    if (firebaseObserverInitialized) return;
    firebaseObserverInitialized = true;

    try {
      const authHelper = (typeof window !== 'undefined') ? window.SALES_PLATFORM_AUTH : null;
      if (authHelper?.getAuth) {
        const auth = await authHelper.getAuth();

        if (typeof authHelper.resume === 'function') {
          try {
            const redirectSession = await authHelper.resume();
            if (redirectSession?.user) {
              handleUserAuthResolved(redirectSession.user);
              return;
            }
          } catch (redirectErr) {
            console.warn("Auth redirect resume note:", redirectErr);
          }
        }

        auth.onAuthStateChanged((user) => {
          if (user && user.email) {
            handleUserAuthResolved(user);
          } else {
            checkLocalCredentialsOrGate();
          }
        });
        return;
      }
    } catch (err) {
      console.warn("Firebase Auth init error:", err);
    }

    checkLocalCredentialsOrGate();
  }

  function checkLocalCredentialsOrGate() {
    const savedUser = (typeof localStorage !== 'undefined')
      ? (localStorage.getItem('sprintdial_user') || localStorage.getItem('sprintdial_google_user'))
      : null;
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'caller') {
          const customWorkers = getCustomWorkers();
          const username = (parsed.username || parsed.name || '').toLowerCase();
          const email = (parsed.email || '').toLowerCase();
          const isCustomWorker = customWorkers[username] || Object.values(customWorkers).some(w => (w.email || '').toLowerCase() === email);
          if (parsed.callerToken && parsed.tokenExp && parsed.tokenExp > Date.now()) {
            root.currentUser = parsed;
            if (typeof root.onAuthVerified === 'function') root.onAuthVerified();
            return;
          } else if (isCustomWorker || parsed.email) {
            root.currentUser = parsed;
            if (typeof root.onAuthVerified === 'function') root.onAuthVerified();
            return;
          }
        }
        const isOwnerEmail = (typeof root.isApoorvOwnerEmail === 'function') ? root.isApoorvOwnerEmail : () => false;
        if (parsed && parsed.email && isOwnerEmail(parsed.email)) {
          root.currentUser = parsed;
          if (typeof root.onAuthVerified === 'function') root.onAuthVerified();
          return;
        }
        if (parsed && parsed.role === 'applicant' && parsed.email) {
          root.currentUser = parsed;
          renderApplicantView(parsed);
          return;
        }
      } catch(e) {}
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('sprintdial_user');
      localStorage.removeItem('sprintdial_google_user');
    }
    root.currentUser = null;
    initGuestMode();
  }

  function signOut() {
    root.currentUser = null;
    if (typeof global !== 'undefined') global.currentUser = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('sprintdial_user');
      localStorage.removeItem('sprintdial_google_user');
    }
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('sprintdial_owner_unlocked');
      }
    } catch(e) {}
    if (typeof window !== 'undefined' && typeof window.firebase?.auth === 'function') {
      try { window.firebase.auth().signOut(); } catch(e) {}
    }
    if (typeof window !== 'undefined' && typeof window.SALES_PLATFORM_AUTH?.getAuth === 'function') {
      window.SALES_PLATFORM_AUTH.getAuth().then(a => a.signOut?.()).catch(() => {});
    }
    if (typeof location !== 'undefined' && typeof location.reload === 'function') {
      location.reload();
    }
  }

  function signOutGoogle() {
    signOut();
  }

  const exports = {
    initGuestMode,
    handleUserAuthResolved,
    renderApplicantView,
    openAuthGate,
    showAuthGate,
    closeAuthGate,
    handleAuthBackdropClick,
    showApplicantPortal,
    handleRepApplicationSubmit,
    getStoredApplications,
    saveStoredApplications,
    approveApplicationAsWorker,
    getCustomWorkers,
    saveCustomWorkers,
    getAllAuthorizedAccounts,
    handleWorkspaceGoogleAuth,
    handleCredentialsAuth,
    handleCreateWorkerAccount,
    deleteWorkerAccount,
    renderAdminUsersList,
    renderAdminApplicationsList,
    initFirebaseSessionObserver,
    checkLocalCredentialsOrGate,
    signOut,
    signOutGoogle
  };

  root.WorkspaceAuthEngine = exports;

  for (const key in exports) {
    root[key] = exports[key];
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
