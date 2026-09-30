// Client Radar — Persistence & Cloud Data Engine (Subsystems 12 & 14)
// Strictly On Apoorv's Behalf

(function(root) {
  'use strict';

  let prospectsLoadPromise = null;
  let unsubscribeFirestore = null;
  let isBootstrappingFirestore = false;

  function getLocalStorage() {
    if (typeof localStorage !== 'undefined') return localStorage;
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    if (typeof global !== 'undefined' && global.localStorage) return global.localStorage;
    return null;
  }

  function getGlobalProspects() {
    return (typeof root.PROSPECTS !== 'undefined' && Array.isArray(root.PROSPECTS))
      ? root.PROSPECTS
      : ((typeof window !== 'undefined' && Array.isArray(window.PROSPECTS))
        ? window.PROSPECTS
        : ((typeof global !== 'undefined' && Array.isArray(global.PROSPECTS))
          ? global.PROSPECTS
          : ((typeof window !== 'undefined' && Array.isArray(window.DEFAULT_PROSPECTS))
            ? window.DEFAULT_PROSPECTS
            : ((typeof global !== 'undefined' && Array.isArray(global.DEFAULT_PROSPECTS))
              ? global.DEFAULT_PROSPECTS
              : []))));
  }

  function setGlobalProspects(val) {
    root.PROSPECTS = val;
    if (typeof window !== 'undefined') window.PROSPECTS = val;
    if (typeof global !== 'undefined') global.PROSPECTS = val;
  }

  function getCurrentUser() {
    return (typeof root.currentUser !== 'undefined' && root.currentUser)
      ? root.currentUser
      : ((typeof window !== 'undefined' && window.currentUser)
        ? window.currentUser
        : ((typeof global !== 'undefined' && global.currentUser) ? global.currentUser : null));
  }

  function getSelectedProspectId() {
    return (typeof root.selectedProspectId !== 'undefined' && root.selectedProspectId)
      ? root.selectedProspectId
      : ((typeof window !== 'undefined' && window.selectedProspectId)
        ? window.selectedProspectId
        : ((typeof global !== 'undefined' && global.selectedProspectId) ? global.selectedProspectId : null));
  }

  function getActiveCityFilter() {
    if (typeof root.activeCityFilter !== 'undefined') return root.activeCityFilter;
    if (typeof window !== 'undefined' && typeof window.activeCityFilter !== 'undefined') return window.activeCityFilter;
    if (typeof global !== 'undefined' && typeof global.activeCityFilter !== 'undefined') return global.activeCityFilter;
    if (root.WorkspaceQueueEngine && typeof root.WorkspaceQueueEngine.activeCityFilter !== 'undefined') return root.WorkspaceQueueEngine.activeCityFilter;
    return 'All';
  }

  function isApoorvOwnerEmailHelper(email) {
    if (typeof root.isApoorvOwnerEmail === 'function') return root.isApoorvOwnerEmail(email);
    if (typeof window !== 'undefined' && typeof window.isApoorvOwnerEmail === 'function') return window.isApoorvOwnerEmail(email);
    if (typeof global !== 'undefined' && typeof global.isApoorvOwnerEmail === 'function') return global.isApoorvOwnerEmail(email);
    if (!email || typeof email !== 'string') return false;
    const n = email.toLowerCase().trim().replace(/\./g, '');
    return n === 'apoorvxs@gmailcom';
  }

  function isOwnerUser(user) {
    if (typeof root.isOwnerUser === 'function') return root.isOwnerUser(user);
    if (typeof window !== 'undefined' && typeof window.isOwnerUser === 'function') return window.isOwnerUser(user);
    if (typeof global !== 'undefined' && typeof global.isOwnerUser === 'function') return global.isOwnerUser(user);
    if (!user) return false;
    const email = (user.email || '').toLowerCase().trim();
    const role = (user.role || '').toLowerCase().trim();
    return isApoorvOwnerEmailHelper(email) || (role === 'owner' && isApoorvOwnerEmailHelper(email));
  }

  function renderQueueHelper() {
    if (typeof root.renderQueue === 'function') return root.renderQueue();
    if (typeof window !== 'undefined' && typeof window.renderQueue === 'function') return window.renderQueue();
    if (typeof global !== 'undefined' && typeof global.renderQueue === 'function') return global.renderQueue();
  }

  function renderActiveProspectHelper() {
    if (typeof root.renderActiveProspect === 'function') return root.renderActiveProspect();
    if (typeof window !== 'undefined' && typeof window.renderActiveProspect === 'function') return window.renderActiveProspect();
    if (typeof global !== 'undefined' && typeof global.renderActiveProspect === 'function') return global.renderActiveProspect();
  }

  function selectProspectHelper(id) {
    if (typeof root.selectProspect === 'function') return root.selectProspect(id);
    if (typeof window !== 'undefined' && typeof window.selectProspect === 'function') return window.selectProspect(id);
    if (typeof global !== 'undefined' && typeof global.selectProspect === 'function') return global.selectProspect(id);
  }

  function updateProfileDropdownUIHelper() {
    if (typeof root.updateProfileDropdownUI === 'function') return root.updateProfileDropdownUI();
    if (typeof window !== 'undefined' && typeof window.updateProfileDropdownUI === 'function') return window.updateProfileDropdownUI();
    if (typeof global !== 'undefined' && typeof global.updateProfileDropdownUI === 'function') return global.updateProfileDropdownUI();
  }

  function matchSearchHelper(item) {
    if (typeof root.matchSearch === 'function') return root.matchSearch(item);
    if (typeof window !== 'undefined' && typeof window.matchSearch === 'function') return window.matchSearch(item);
    if (typeof global !== 'undefined' && typeof global.matchSearch === 'function') return global.matchSearch(item);
    return true;
  }

  function playSoundHelper(sound) {
    if (typeof root.playSound === 'function') return root.playSound(sound);
    if (typeof window !== 'undefined' && typeof window.playSound === 'function') return window.playSound(sound);
    if (typeof global !== 'undefined' && typeof global.playSound === 'function') return global.playSound(sound);
  }

  function showNotificationHelper(msg) {
    if (typeof root.showNotification === 'function') return root.showNotification(msg);
    if (typeof window !== 'undefined' && typeof window.showNotification === 'function') return window.showNotification(msg);
    if (typeof global !== 'undefined' && typeof global.showNotification === 'function') return global.showNotification(msg);
  }

  function recordPartnerActivityHelper(action, prospectId, meta) {
    if (typeof root.recordPartnerActivity === 'function') return root.recordPartnerActivity(action, prospectId, meta);
    if (typeof window !== 'undefined' && typeof window.recordPartnerActivity === 'function') return window.recordPartnerActivity(action, prospectId, meta);
    if (typeof global !== 'undefined' && typeof global.recordPartnerActivity === 'function') return global.recordPartnerActivity(action, prospectId, meta);
  }

  function syncCallOutcomeToGoogleSheetHelper(id, data) {
    if (typeof root.syncCallOutcomeToGoogleSheet === 'function') return root.syncCallOutcomeToGoogleSheet(id, data);
    if (typeof window !== 'undefined' && typeof window.syncCallOutcomeToGoogleSheet === 'function') return window.syncCallOutcomeToGoogleSheet(id, data);
    if (typeof global !== 'undefined' && typeof global.syncCallOutcomeToGoogleSheet === 'function') return global.syncCallOutcomeToGoogleSheet(id, data);
  }

  function initFirestoreRealtimeListener(db) {
    if (unsubscribeFirestore || !db) return;
    try {
      unsubscribeFirestore = db.collection('prospects').onSnapshot((snapshot) => {
        let changed = false;
        const prospects = getGlobalProspects();
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          if (!data || !data.id) return;
          const idx = prospects.findIndex(p => p.id === data.id);
          if (change.type === 'added' && idx === -1) {
            prospects.push(data);
            changed = true;
          } else if (change.type === 'modified' && idx !== -1) {
            Object.assign(prospects[idx], data);
            changed = true;
          } else if (change.type === 'removed' && idx !== -1) {
            prospects.splice(idx, 1);
            changed = true;
          }
        });
        if (changed) {
          renderQueueHelper();
          const selectedId = getSelectedProspectId();
          if (selectedId) {
            renderActiveProspectHelper();
          }
        }
      }, (err) => {
        console.warn('Firestore realtime listener error:', err.message);
      });
    } catch (e) {}
  }

  async function ensureProspectsLoaded() {
    let prospects = getGlobalProspects();
    if (prospects && prospects.length > 0) return Promise.resolve(prospects);
    if (prospectsLoadPromise) return prospectsLoadPromise;
    prospectsLoadPromise = (async () => {
      // 0. Synchronous dataset check (if loaded via static script tag or already in window)
      if (typeof window !== 'undefined' && window.DEFAULT_PROSPECTS && window.DEFAULT_PROSPECTS.length) {
        setGlobalProspects([...window.DEFAULT_PROSPECTS]);
        initPersistence();
        renderQueueHelper();
        const currentList = getGlobalProspects();
        const initialId = currentList.find(p => p.id === "p-1")?.id || currentList[0]?.id;
        if (initialId) selectProspectHelper(initialId);
        updateProfileDropdownUIHelper();
        return currentList;
      }

      // 1. Try Cloud Firestore (Spark Plan Free Tier) with real-time sync (skipped in test/mock mode)
      const storage = getLocalStorage();
      const currentUser = getCurrentUser();
      const isTestMode = (typeof window !== 'undefined' && window.__TEST_MODE__) ||
        (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('sprintdial_test_mode') === 'true') ||
        (storage && storage.getItem('sprintdial_test_mode') === 'true') ||
        currentUser?.sub?.startsWith('mock');
      const auth = (typeof window !== 'undefined' && window.SALES_PLATFORM_AUTH) || (typeof root.SALES_PLATFORM_AUTH !== 'undefined' && root.SALES_PLATFORM_AUTH);
      if (!isTestMode && auth?.getFirestore && currentUser) {
        try {
          const db = await Promise.race([
            auth.getFirestore(),
            new Promise((_, rej) => setTimeout(() => rej(new Error('Firestore init timeout')), 1000))
          ]);
          const snapshot = await Promise.race([
            db.collection('prospects').get(),
            new Promise((_, rej) => setTimeout(() => rej(new Error('Firestore query timeout')), 1200))
          ]);
          if (!snapshot.empty) {
            const firestoreList = [];
            snapshot.forEach(doc => firestoreList.push(doc.data()));
            if (firestoreList.length > 0) {
              setGlobalProspects(firestoreList);
              initPersistence();
              renderQueueHelper();
              const currentList = getGlobalProspects();
              const initialId = currentList.find(p => p.id === "p-1")?.id || currentList[0]?.id;
              if (initialId) selectProspectHelper(initialId);
              initFirestoreRealtimeListener(db);
              if (typeof document !== 'undefined') {
                const badge = document.getElementById('firestoreSyncStatusBadge');
                if (badge) {
                  badge.className = "text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 font-bold";
                  badge.innerText = `● Cloud Firestore Active (${currentList.length})`;
                }
              }
              return currentList;
            }
          }
        } catch (fsErr) {
          console.warn('Cloud Firestore lookup or permission check:', fsErr.message);
        }
      }

      // 2. Local Script Fallback (Dynamic Lazy Load for Verified Users)
      const loadScript = (src) => new Promise((resolve, reject) => {
        if (typeof document === 'undefined' || !document.createElement) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve();
        s.onerror = (e) => reject(e);
        if (document.body) {
          document.body.appendChild(s);
        } else {
          resolve();
        }
      });

      let currentList = getGlobalProspects();
      if (!currentList || !currentList.length) {
        try {
          await loadScript('/workspace/prospects_data.js').catch(() => loadScript('prospects_data.js'));
          if (typeof window !== 'undefined' && window.DEFAULT_PROSPECTS) {
            setGlobalProspects([...window.DEFAULT_PROSPECTS]);
          }
        } catch(err) {
          console.warn('Unable to load prospects dataset', err);
        }
      }

      if (typeof window !== 'undefined' && !window.CUSTOM_PROSPECTS) {
        try {
          await loadScript('/workspace/custom_prospects.js').catch(() => loadScript('custom_prospects.js'));
        } catch(e) {}
      }

      currentList = getGlobalProspects();
      if (currentList && currentList.length) {
        initPersistence();
        renderQueueHelper();
        const initialId = currentList.find(p => p.id === "p-1")?.id || currentList[0]?.id;
        if (initialId) selectProspectHelper(initialId);
        updateProfileDropdownUIHelper();
        if (!isTestMode && auth?.getFirestore && currentUser && isOwnerUser(currentUser)) {
          autoBootstrapFirestore(currentList);
        }
        return currentList;
      } else {
        prospectsLoadPromise = null;
      }
    })();
    return prospectsLoadPromise;
  }

  function initPersistence() {
    try {
      const storage = getLocalStorage();
      const prospects = getGlobalProspects();

      // 0. Load custom prospects from background worker file (custom_prospects.js)
      if (typeof window !== 'undefined' && window.CUSTOM_PROSPECTS && Array.isArray(window.CUSTOM_PROSPECTS)) {
        window.CUSTOM_PROSPECTS.forEach(cp => {
          if (!prospects.find(existing => existing.id === cp.id)) {
            prospects.unshift(cp);
          }
        });
      }

      // 1. Load custom prospects added by AI Agent or Admin
      try {
        const rawCustom = storage ? storage.getItem('sprintdial_custom_prospects') : null;
        if (rawCustom) {
          const customList = JSON.parse(rawCustom);
          if (Array.isArray(customList)) {
            customList.forEach(cp => {
              if (!prospects.find(existing => existing.id === cp.id)) {
                prospects.unshift(cp);
              }
            });
          }
        }
      } catch (e) {
        console.warn('[STORAGE] Failed to parse custom prospects:', e);
      }

      // 2. Load lead overrides (status, notes, discoveryTime)
      try {
        const rawOverrides = storage ? storage.getItem('sprintdial_lead_overrides') : null;
        if (rawOverrides) {
          const overrides = JSON.parse(rawOverrides);
          if (overrides && typeof overrides === 'object') {
            Object.keys(overrides).forEach(id => {
              const p = prospects.find(item => item.id === id);
              if (p) {
                Object.assign(p, overrides[id]);
              }
            });
          }
        }
      } catch (e) {
        console.warn('[STORAGE] Failed to parse lead overrides:', e);
      }

      // 3. Load daily dials counter
      if (storage) {
        const todayKey = `sprintdial_dials_${new Date().toISOString().slice(0, 10)}`;
        const savedDials = storage.getItem(todayKey) || storage.getItem('sprintdial_dials_today');
        if (savedDials) {
          const dials = parseInt(savedDials, 10) || 0;
          root.dialsToday = dials;
          if (typeof window !== 'undefined') window.dialsToday = dials;
          if (typeof global !== 'undefined') global.dialsToday = dials;
        }
      }
    } catch (e) {
      console.warn('Error initializing persistence:', e);
    }
  }

  function saveLeadOverride(id, updates) {
    try {
      const storage = getLocalStorage();
      const currentUser = getCurrentUser();
      const raw = storage ? storage.getItem('sprintdial_lead_overrides') || '{}' : '{}';
      const overrides = JSON.parse(raw);
      overrides[id] = Object.assign({}, overrides[id] || {}, updates, {
        updatedBy: currentUser?.name || 'Caller',
        updatedEmail: currentUser?.email || '',
        updatedAt: new Date().toISOString()
      });
      if (storage) {
        storage.setItem('sprintdial_lead_overrides', JSON.stringify(overrides));
      }
      const prospects = getGlobalProspects();
      const p = prospects.find(item => item.id === id);
      if (p) {
        Object.assign(p, overrides[id]);
      }
      syncProspectUpdateToFirestore(id, overrides[id]);
      syncCallOutcomeToGoogleSheetHelper(id, overrides[id]);
    } catch (e) {
      console.warn('Failed to save lead override:', e);
    }
  }

  async function syncProspectUpdateToFirestore(prospectId, updateFields) {
    const auth = (typeof window !== 'undefined' && window.SALES_PLATFORM_AUTH) || (typeof root.SALES_PLATFORM_AUTH !== 'undefined' && root.SALES_PLATFORM_AUTH);
    const currentUser = getCurrentUser();
    if (!auth?.getFirestore || !currentUser) return;
    try {
      const db = await auth.getFirestore();
      await db.collection('prospects').doc(prospectId).set(updateFields, { merge: true });
    } catch (err) {
      console.warn('Firestore background update sync:', err.message);
    }
  }

  async function autoBootstrapFirestore(prospectsList) {
    if (isBootstrappingFirestore) return;
    const auth = (typeof window !== 'undefined' && window.SALES_PLATFORM_AUTH) || (typeof root.SALES_PLATFORM_AUTH !== 'undefined' && root.SALES_PLATFORM_AUTH);
    const currentUser = getCurrentUser();
    if (!auth?.getFirestore || !currentUser || !isOwnerUser(currentUser)) return;
    if (!prospectsList || !prospectsList.length) return;
    isBootstrappingFirestore = true;
    try {
      const db = await Promise.race([
        auth.getFirestore(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore init timeout')), 4000))
      ]);
      const existing = await Promise.race([
        db.collection('prospects').limit(1).get(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore query timeout')), 4000))
      ]);
      if (!existing.empty) {
        initFirestoreRealtimeListener(db);
        if (typeof document !== 'undefined') {
          const badge = document.getElementById('firestoreSyncStatusBadge');
          if (badge) {
            badge.className = "text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 font-bold";
            badge.innerText = `● Cloud Firestore Active (${getGlobalProspects().length})`;
          }
        }
        return;
      }

      const batch = db.batch();
      prospectsList.forEach(p => {
        const ref = db.collection('prospects').doc(p.id);
        batch.set(ref, p, { merge: true });
      });
      await Promise.race([
        batch.commit(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore batch commit timeout')), 5000))
      ]);
      initFirestoreRealtimeListener(db);
      if (typeof document !== 'undefined') {
        const badge = document.getElementById('firestoreSyncStatusBadge');
        if (badge) {
          badge.className = "text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 font-bold";
          badge.innerText = `● Cloud Firestore Active (${prospectsList.length})`;
        }
        const seedBtn = document.getElementById('seedFirestoreBtn');
        if (seedBtn) {
          seedBtn.innerHTML = `<span>[SYNC] 100% Synced to Cloud</span>`;
          seedBtn.classList.remove('bg-blue-600', 'hover:bg-blue-500');
          seedBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-500');
        }
      }
      showNotificationHelper(`[SYS] Cloud Firestore active: ${prospectsList.length} accounts synced to your private cloud.`);
    } catch (err) {
      console.warn('Auto Firestore bootstrap:', err.message);
    } finally {
      isBootstrappingFirestore = false;
    }
  }

  async function uploadProspectsToFirestore() {
    const btn = (typeof document !== 'undefined') ? document.getElementById('seedFirestoreBtn') : null;
    const auth = (typeof window !== 'undefined' && window.SALES_PLATFORM_AUTH) || (typeof root.SALES_PLATFORM_AUTH !== 'undefined' && root.SALES_PLATFORM_AUTH);
    const currentUser = getCurrentUser();
    if (!auth?.getFirestore) {
      if (typeof alert === 'function') alert('Firebase Auth/Firestore service is initializing. Please try again in a moment.');
      return;
    }
    if (!currentUser || !isOwnerUser(currentUser)) {
      if (typeof alert === 'function') alert('Permission Denied: Only the verified owner (apoorvxs@gmail.com) can push prospects to Firestore.');
      return;
    }
    const prospects = getGlobalProspects();
    if (typeof confirm === 'function' && !confirm(`Upload all ${prospects.length} prospects to Cloud Firestore under project 'apoorv-sales'?`)) return;

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>⏳ Uploading to Firestore...</span>`;
    }

    try {
      const db = await Promise.race([
        auth.getFirestore(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore initialization timed out (6s). Check project configuration.')), 6000))
      ]);
      const batch = db.batch();
      prospects.forEach(p => {
        const ref = db.collection('prospects').doc(p.id);
        batch.set(ref, p, { merge: true });
      });
      await Promise.race([
        batch.commit(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore write timed out (8s). Make sure Cloud Firestore database is created in the Firebase console and security rules allow write access.')), 8000))
      ]);
      showNotificationHelper(`[SUCCESS] Successfully uploaded ${prospects.length} accounts to Cloud Firestore!`);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>[SYNC] 100% Synced to Firestore</span>`;
        btn.classList.remove('bg-blue-600', 'hover:bg-blue-500');
        btn.classList.add('bg-emerald-600', 'hover:bg-emerald-500');
      }
      if (typeof document !== 'undefined') {
        const badge = document.getElementById('firestoreSyncStatusBadge');
        if (badge) {
          badge.innerText = `● Cloud Firestore Active (${prospects.length})`;
        }
      }
      initFirestoreRealtimeListener(db);
    } catch (err) {
      if (typeof alert === 'function') alert(`Firestore Sync Notice: ${err.message}\n\nNote: Your leads remain 100% safe locally and sync via Firebase Realtime Database.`);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>[SYNC] Force Re-Sync to Firestore</span>`;
      }
    }
  }

  function exportProspectsJSON() {
    const prospects = getGlobalProspects();
    if (typeof Blob !== 'undefined' && typeof URL !== 'undefined' && URL.createObjectURL && typeof document !== 'undefined' && document.createElement) {
      const blob = new Blob([JSON.stringify(prospects, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `client_radar_prospects_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    showNotificationHelper('[EXPORT] Prospects JSON backup downloaded.');
  }

  function exportActiveQueueCsv() {
    playSoundHelper('click');
    const user = getCurrentUser();
    if (!isOwnerUser(user)) {
      showNotificationHelper('[LOCKED] CSV export is restricted to Owner/Admin sessions.');
      return;
    }
    const prospects = getGlobalProspects();
    const cityFilter = getActiveCityFilter();
    const filtered = prospects.filter(item => (cityFilter === 'All' || item.city === cityFilter) && matchSearchHelper(item));
    if (!filtered.length) {
      showNotificationHelper('[ALERT] No matching prospects in current queue to export.');
      return;
    }

    recordPartnerActivityHelper('CSV_EXPORT', null, { count: filtered.length, territory: cityFilter });

    const headers = [
      "ID",
      "Name",
      "Decision Maker",
      "Phone",
      "City",
      "Category",
      "Prospect Type",
      "Status",
      "Floor Fee",
      "Speed Score",
      "LCP Time",
      "Tech Stack",
      "Website",
      "Notes",
      "Discovery Time",
      "Locked By",
      "Updated At"
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const text = String(str).replace(/"/g, '""');
      return `"${text}"`;
    };

    const rows = filtered.map(p => [
      escapeCsv(p.id),
      escapeCsv(p.name),
      escapeCsv(p.dm),
      escapeCsv(p.phone || p.tel),
      escapeCsv(p.city),
      escapeCsv(p.cat),
      escapeCsv(p.ptype),
      escapeCsv(p.status),
      escapeCsv(p.fee),
      escapeCsv(p.speedScore),
      escapeCsv(p.lcpTime),
      escapeCsv(p.techStack),
      escapeCsv(p.site),
      escapeCsv(p.notes),
      escapeCsv(p.discoveryTime),
      escapeCsv(p.lockedBy),
      escapeCsv(p.updatedAt || new Date().toISOString())
    ].join(','));

    const csvContent = [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');
    if (typeof Blob !== 'undefined' && typeof URL !== 'undefined' && URL.createObjectURL && typeof document !== 'undefined' && document.createElement) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const territoryTag = cityFilter.toLowerCase().replace(/\s+/g, '_');
      const dateTag = new Date().toISOString().slice(0, 10);
      a.download = `client_radar_prospects_${territoryTag}_${dateTag}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    playSoundHelper('chime');
    showNotificationHelper(`[EXPORT] Exported ${filtered.length} leads (${cityFilter}) to CSV!`);
  }

  const exports = {
    initFirestoreRealtimeListener,
    ensureProspectsLoaded,
    initPersistence,
    saveLeadOverride,
    syncProspectUpdateToFirestore,
    autoBootstrapFirestore,
    uploadProspectsToFirestore,
    exportProspectsJSON,
    exportActiveQueueCsv
  };

  root.WorkspacePersistenceEngine = exports;
  if (typeof global !== 'undefined' && global !== root) {
    global.WorkspacePersistenceEngine = exports;
  }

  for (const key in exports) {
    root[key] = exports[key];
    if (typeof global !== 'undefined' && global !== root) {
      global[key] = exports[key];
    }
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
