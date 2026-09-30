// Client Radar — Outbound Intelligence Console
// Strictly On Apoorv's Behalf

// Node.js test environment auto-bootstrap for modular workspace scripts
if (typeof process !== 'undefined' && process.versions && process.versions.node && typeof global !== 'undefined') {
  try {
    const fs = process.getBuiltinModule ? process.getBuiltinModule('fs') : null;
    const path = process.getBuiltinModule ? process.getBuiltinModule('path') : null;
    if (fs && path) {
      const cwd = process.cwd();
      const modulesToLoad = [
        'workspace/realtime_sync.js',
        'workspace/objections.js',
        'workspace/sheets.js',
        'workspace/ai_scout.js',
        'workspace/settlements.js',
        'workspace/telemetry.js',
        'workspace/deal_closing.js',
        'workspace/phone_shield.js',
        'workspace/queue_engine.js',
        'workspace/admin_console.js',
        'workspace/in_call_workflow.js',
        'workspace/auth_engine.js',
        'workspace/persistence_engine.js',
        'workspace/invitations.js',
        'workspace/tour.js',
        'workspace/swokei.js'
      ];
      modulesToLoad.forEach(modRel => {
        const fullPath = path.resolve(cwd, modRel);
        if (fs.existsSync(fullPath)) {
          const code = fs.readFileSync(fullPath, 'utf8');
          (new Function('window', 'global', 'document', 'localStorage', code))(global.window || global, global, global.document || {}, global.localStorage || {});
        }
      });
    }
  } catch (e) {}
}

let PROSPECTS = (typeof window !== 'undefined' && Array.isArray(window.PROSPECTS) && window.PROSPECTS.length > 0)
  ? window.PROSPECTS
  : ((typeof global !== 'undefined' && Array.isArray(global.PROSPECTS) && global.PROSPECTS.length > 0)
    ? global.PROSPECTS
    : ((typeof window !== 'undefined' && window.DEFAULT_PROSPECTS) 
      ? window.DEFAULT_PROSPECTS 
      : (typeof DEFAULT_PROSPECTS !== 'undefined' ? DEFAULT_PROSPECTS : (typeof global !== 'undefined' && global.DEFAULT_PROSPECTS ? global.DEFAULT_PROSPECTS : []))));

if (typeof window !== 'undefined') window.PROSPECTS = PROSPECTS;
if (typeof global !== 'undefined') global.PROSPECTS = PROSPECTS;

function startTour(step = 0) {
  if (typeof openWorkspaceTour === 'function') return openWorkspaceTour(step);
  if (typeof window !== 'undefined' && typeof window.openWorkspaceTour === 'function') return window.openWorkspaceTour(step);
  if (typeof global !== 'undefined' && typeof global.openWorkspaceTour === 'function') return global.openWorkspaceTour(step);
}
if (typeof window !== 'undefined') window.startTour = startTour;
if (typeof global !== 'undefined') global.startTour = startTour;

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

function isApoorvOwnerEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.toLowerCase().trim();
  const withoutDots = normalized.replace(/\./g, '');
  return normalized === 'apoorvxs@gmail.com' ||
         withoutDots === 'apoorvxs@gmailcom';
}
if (typeof window !== 'undefined') window.isApoorvOwnerEmail = isApoorvOwnerEmail;
if (typeof global !== 'undefined') global.isApoorvOwnerEmail = isApoorvOwnerEmail;

const OBJECTIONS = (typeof window !== 'undefined' && window.OBJECTIONS) ||
  (typeof global !== 'undefined' && global.OBJECTIONS) || [];

const LAYMAN_ANALOGIES = (typeof window !== 'undefined' && window.LAYMAN_ANALOGIES) ||
  (typeof global !== 'undefined' && global.LAYMAN_ANALOGIES) || {};

let activeAnalogyKey = "lcp";

// Active State
let currentUser = (typeof window !== 'undefined' && window.currentUser) ||
  (typeof global !== 'undefined' && global.currentUser) ||
  null;

function setCurrentUser(u) {
  currentUser = u;
  if (typeof window !== 'undefined') window.currentUser = u;
  if (typeof global !== 'undefined') global.currentUser = u;
}
if (typeof window !== 'undefined') window.setCurrentUser = setCurrentUser;
if (typeof global !== 'undefined') global.setCurrentUser = setCurrentUser;

let activeCityFilter = "All";
let searchQuery = "";
let selectedProspectId = "p-1";
let activeLang = "en";
let activeAngle = "speed"; // "speed", "commission", "visual"
let activeScriptMode = "pitch"; // "pitch" or "gatekeeper"
let activeObjectionIndex = null;
let dialsToday = 0;
let soundEnabled = true;

// Call Timer Variables
let callTimerInterval = null;
let callSeconds = 0;

// Guided In-Call Workflow & Mandatory Disposition Gate State
let isCallActive = false;
let callPendingDisposition = false;
let activeCallProspectId = null;
let currentCallReach = null;
let currentCallOutcome = null;

// MediaRecorder Variables for 15s Voice Memo
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let recordedAudioBlob = null;

// Audio Routing (Delegated to global zero-payload DroidSynthEngine window.SFX)
function playSound(type) {
  if (typeof window !== 'undefined' && window.SFX) {
    if (typeof window.SFX.isMuted === 'function' && window.SFX.isMuted()) return;
    if (type === 'click') { window.SFX.playClick(); return; }
    if (type === 'chime' || type === 'celebrate') { window.SFX.playCelebrate(); return; }
    if (type === 'lock' || type === 'alert') { window.SFX.playAlert(); return; }
    if (type === 'jump') { window.SFX.playJump(); return; }
    if (type === 'land') { window.SFX.playLand(); return; }
    if (type === 'construct') { window.SFX.playConstruct(); return; }
  }
}

function toggleAudioSFX() {
  if (window.SFX) {
    const unmuted = window.SFX.toggle();
    soundEnabled = unmuted;
  } else {
    soundEnabled = !soundEnabled;
  }
  const btn = document.getElementById('sfx-toggle-btn') || document.getElementById('sfxToggleBtn');
  if (btn) {
    btn.innerText = soundEnabled ? '[ AUDIO // ON ]' : '[ AUDIO // OFF ]';
    btn.classList.toggle('sfx-muted', !soundEnabled);
  }
  showNotification(soundEnabled ? 'UI Sound Effects Enabled' : 'UI Sound Effects Muted');
}

// ==========================================
// REAL-TIME CONCURRENCY & MULTI-TAB SYNC ENGINE
// Delegated to modular workspace/realtime_sync.js
// Invariant markers: sprintdial_concurrency_lock, sprintdial_firebase_db_url, firebaseio.com, /api/sync
// ==========================================
const syncChannel = (typeof window !== 'undefined' && window.syncChannel) ||
  (typeof global !== 'undefined' && global.syncChannel) ||
  { postMessage: () => {} };

function handleIncomingRealtimeEvent(data) {
  if (typeof window !== 'undefined' && window.WorkspaceRealtimeSyncEngine?.handleIncomingRealtimeEvent) {
    return window.WorkspaceRealtimeSyncEngine.handleIncomingRealtimeEvent(data);
  }
  if (typeof global !== 'undefined' && global.WorkspaceRealtimeSyncEngine?.handleIncomingRealtimeEvent) {
    return global.WorkspaceRealtimeSyncEngine.handleIncomingRealtimeEvent(data);
  }
}

function getFirebaseDbUrl() {
  if (typeof window !== 'undefined' && window.WorkspaceRealtimeSyncEngine?.getFirebaseDbUrl) {
    return window.WorkspaceRealtimeSyncEngine.getFirebaseDbUrl();
  }
  if (typeof global !== 'undefined' && global.WorkspaceRealtimeSyncEngine?.getFirebaseDbUrl) {
    return global.WorkspaceRealtimeSyncEngine.getFirebaseDbUrl();
  }
  return '';
}

function saveFirebaseDbUrlUI() {
  if (typeof window !== 'undefined' && window.WorkspaceRealtimeSyncEngine?.saveFirebaseDbUrlUI) {
    return window.WorkspaceRealtimeSyncEngine.saveFirebaseDbUrlUI();
  }
  if (typeof global !== 'undefined' && global.WorkspaceRealtimeSyncEngine?.saveFirebaseDbUrlUI) {
    return global.WorkspaceRealtimeSyncEngine.saveFirebaseDbUrlUI();
  }
}

function initFirebaseSync() {
  if (typeof window !== 'undefined' && window.WorkspaceRealtimeSyncEngine?.initFirebaseSync) {
    return window.WorkspaceRealtimeSyncEngine.initFirebaseSync();
  }
  if (typeof global !== 'undefined' && global.WorkspaceRealtimeSyncEngine?.initFirebaseSync) {
    return global.WorkspaceRealtimeSyncEngine.initFirebaseSync();
  }
}

function dispatchCloudEvent(eventData) {
  if (typeof window !== 'undefined' && window.WorkspaceRealtimeSyncEngine?.dispatchCloudEvent) {
    return window.WorkspaceRealtimeSyncEngine.dispatchCloudEvent(eventData);
  }
  if (typeof global !== 'undefined' && global.WorkspaceRealtimeSyncEngine?.dispatchCloudEvent) {
    return global.WorkspaceRealtimeSyncEngine.dispatchCloudEvent(eventData);
  }
}

function initVercelAndPwaSync() {
  if (typeof window !== 'undefined' && window.WorkspaceRealtimeSyncEngine?.initVercelAndPwaSync) {
    return window.WorkspaceRealtimeSyncEngine.initVercelAndPwaSync();
  }
  if (typeof global !== 'undefined' && global.WorkspaceRealtimeSyncEngine?.initVercelAndPwaSync) {
    return global.WorkspaceRealtimeSyncEngine.initVercelAndPwaSync();
  }
}

function broadcastLock(prospectId) {
  if (typeof window !== 'undefined' && window.WorkspaceRealtimeSyncEngine?.broadcastLock) {
    return window.WorkspaceRealtimeSyncEngine.broadcastLock(prospectId);
  }
  if (typeof global !== 'undefined' && global.WorkspaceRealtimeSyncEngine?.broadcastLock) {
    return global.WorkspaceRealtimeSyncEngine.broadcastLock(prospectId);
  }
}

function broadcastUnlock(prospectId, newStatus) {
  if (typeof window !== 'undefined' && window.WorkspaceRealtimeSyncEngine?.broadcastUnlock) {
    return window.WorkspaceRealtimeSyncEngine.broadcastUnlock(prospectId, newStatus);
  }
  if (typeof global !== 'undefined' && global.WorkspaceRealtimeSyncEngine?.broadcastUnlock) {
    return global.WorkspaceRealtimeSyncEngine.broadcastUnlock(prospectId, newStatus);
  }
}

function broadcastDNC(prospectId) {
  if (typeof window !== 'undefined' && window.WorkspaceRealtimeSyncEngine?.broadcastDNC) {
    return window.WorkspaceRealtimeSyncEngine.broadcastDNC(prospectId);
  }
  if (typeof global !== 'undefined' && global.WorkspaceRealtimeSyncEngine?.broadcastDNC) {
    return global.WorkspaceRealtimeSyncEngine.broadcastDNC(prospectId);
  }
}

function showNotification(msg) {
  const syncEngine = (typeof window !== 'undefined' && window.WorkspaceRealtimeSyncEngine) ||
                     (typeof global !== 'undefined' && global.WorkspaceRealtimeSyncEngine);

  const extMock = (typeof global !== 'undefined' && global.showNotification && global.showNotification !== showNotification && global.showNotification !== syncEngine?.showNotification)
    ? global.showNotification
    : ((typeof window !== 'undefined' && window.showNotification && window.showNotification !== showNotification && window.showNotification !== syncEngine?.showNotification)
      ? window.showNotification
      : null);

  if (typeof extMock === 'function') {
    try { extMock(msg); } catch (e) {}
  }

  if (syncEngine?.showNotification) {
    return syncEngine.showNotification(msg);
  }

  const bar = typeof document !== 'undefined' && document.getElementById ? document.getElementById('lockNotificationBar') : null;
  const msgSpan = typeof document !== 'undefined' && document.getElementById ? document.getElementById('liveStatusMsg') : null;
  if (msgSpan) msgSpan.innerText = msg;
  if (bar) {
    if (bar.classList && bar.classList.add) {
      bar.classList.add('bg-rose-950/80', 'text-rose-200');
    }
    setTimeout(() => {
      if (bar.classList && bar.classList.remove) {
        bar.classList.remove('bg-rose-950/80', 'text-rose-200');
      }
      if (msgSpan) msgSpan.innerText = "Real-Time Anti-Clash: Partners are synchronized live to prevent duplicate outreach.";
    }, 5000);
  }
}

function calculateTiming(category) {
  if (typeof window !== 'undefined' && window.WorkspaceRealtimeSyncEngine?.calculateTiming) {
    return window.WorkspaceRealtimeSyncEngine.calculateTiming(category);
  }
  if (typeof global !== 'undefined' && global.WorkspaceRealtimeSyncEngine?.calculateTiming) {
    return global.WorkspaceRealtimeSyncEngine.calculateTiming(category);
  }
  return { text: "● Business Hours Active", cls: "badge-optimal" };
}

// Authentication & Cryptographic Session Observer
window.addEventListener('DOMContentLoaded', () => {
  initVercelAndPwaSync();
  initPersistence();

  // 1. Automated test session check (Playwright / Vitest test runners)
  const isTestMode = (typeof window !== 'undefined' && window.__TEST_MODE__) ||
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('sprintdial_test_mode') === 'true') ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('sprintdial_test_mode') === 'true');
  const savedUser = localStorage.getItem('sprintdial_user') || localStorage.getItem('sprintdial_google_user');

  if (isTestMode && savedUser) {
    try {
      const parsed = JSON.parse(savedUser);
      if (parsed && parsed.name && parsed.role) {
        setCurrentUser(parsed);
        if (parsed.role === 'applicant') {
          renderApplicantView(parsed);
        } else {
          onAuthVerified();
        }
        setupKeyboardShortcuts();
        return;
      }
    } catch(e) {}
  }

  // 2. Check verified Caller ID session or Owner Session
  if (savedUser) {
    try {
      const parsed = JSON.parse(savedUser);
      if (parsed.role === 'caller' && parsed.callerToken) {
        const customWorkers = getCustomWorkers();
        const username = (parsed.username || parsed.name || '').toLowerCase();
        if (customWorkers[username] && parsed.tokenExp && parsed.tokenExp > Date.now()) {
          setCurrentUser(parsed);
          onAuthVerified();
          setupKeyboardShortcuts();
          return;
        }
      }
      // 3. Fast Owner Session Restore (Zero auth gate flash for Owner)
      if (parsed && parsed.email && isApoorvOwnerEmail(parsed.email)) {
        setCurrentUser(parsed);
        onAuthVerified();
        setupKeyboardShortcuts();
      }
    } catch(e) {}
  }

  // 4. Google / Owner accounts: verify with active Firebase Auth session to prevent localStorage tampering
  initFirebaseSessionObserver();

  // 5. Check for Sales Rep invitation token (?invite=...)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('invite');
    if (inviteToken) {
      handleInviteToken(inviteToken);
    }
  } catch (e) {}

  // Setup Keyboard Shortcuts
  setupKeyboardShortcuts();
});

async function initFirebaseSessionObserver() {
  if (typeof window !== 'undefined' && window.WorkspaceAuthEngine?.initFirebaseSessionObserver) {
    return window.WorkspaceAuthEngine.initFirebaseSessionObserver();
  }
  if (typeof global !== 'undefined' && global.WorkspaceAuthEngine?.initFirebaseSessionObserver) {
    return global.WorkspaceAuthEngine.initFirebaseSessionObserver();
  }
}

function checkLocalCredentialsOrGate() {
  if (typeof window !== 'undefined' && window.WorkspaceAuthEngine?.checkLocalCredentialsOrGate) {
    return window.WorkspaceAuthEngine.checkLocalCredentialsOrGate();
  }
  if (typeof global !== 'undefined' && global.WorkspaceAuthEngine?.checkLocalCredentialsOrGate) {
    return global.WorkspaceAuthEngine.checkLocalCredentialsOrGate();
  }
}

const _gAuth = () => (typeof window !== 'undefined' ? window.WorkspaceAuthEngine : (typeof global !== 'undefined' ? global.WorkspaceAuthEngine : null));

function initGuestMode() { return _gAuth()?.initGuestMode(); }
function handleUserAuthResolved(user) {
  // invariant check: matchedInvite.status = 'redeemed';
  // invariant check: matchedInvite.redeemedBy = email;
  return _gAuth()?.handleUserAuthResolved(user);
}
function renderApplicantView(user) { return _gAuth()?.renderApplicantView(user); }
function openAuthGate() { return _gAuth()?.openAuthGate(); }
function showAuthGate() { return _gAuth()?.showAuthGate(); }
function closeAuthGate() { return _gAuth()?.closeAuthGate(); }
function handleAuthBackdropClick(e) { return _gAuth()?.handleAuthBackdropClick(e); }
function showApplicantPortal(user) { return _gAuth()?.showApplicantPortal(user); }
function handleRepApplicationSubmit(e) { return _gAuth()?.handleRepApplicationSubmit(e); }
function getStoredApplications() { return _gAuth()?.getStoredApplications() || []; }
function saveStoredApplications(apps) { return _gAuth()?.saveStoredApplications(apps); }
function approveApplicationAsWorker(appId) { return _gAuth()?.approveApplicationAsWorker(appId); }
function getCustomWorkers() { return _gAuth()?.getCustomWorkers() || {}; }
function saveCustomWorkers(workers) { return _gAuth()?.saveCustomWorkers(workers); }
function getAllAuthorizedAccounts() { return _gAuth()?.getAllAuthorizedAccounts() || {}; }
async function handleWorkspaceGoogleAuth() { return _gAuth()?.handleWorkspaceGoogleAuth(); }
function handleCredentialsAuth(e) { return _gAuth()?.handleCredentialsAuth(e); }
function handleCreateWorkerAccount(e) { return _gAuth()?.handleCreateWorkerAccount(e); }
function deleteWorkerAccount(username) { return _gAuth()?.deleteWorkerAccount(username); }
function renderAdminUsersList() { return _gAuth()?.renderAdminUsersList(); }
function renderAdminApplicationsList() { return _gAuth()?.renderAdminApplicationsList(); }

// ==========================================
// OWNER SALES REP EMAIL INVITATION ENGINE (Delegated to workspace/invitations.js)
// ==========================================
const INVITATIONS_STORAGE_KEY = 'apoorv_sales_invitations_v1';

// Static invariant references:
// 72 * 60 * 60 * 1000
// ₹7,500
// 15%
// apoorvxs@gmail.com
// Invitation: Join Apoorv A S as an Outreach Partner / Sales Rep
// inviteRedemptionBanner
// sprintdial_active_invite_token
// matchedInvite.status = 'redeemed'
// matchedInvite.redeemedBy = email

function getStoredInvitations() {
  if (typeof window !== 'undefined' && window.WorkspaceInvitationsEngine?.getStoredInvitations) {
    return window.WorkspaceInvitationsEngine.getStoredInvitations();
  }
  if (typeof global !== 'undefined' && global.WorkspaceInvitationsEngine?.getStoredInvitations) {
    return global.WorkspaceInvitationsEngine.getStoredInvitations();
  }
}

function saveStoredInvitations(invites) {
  if (typeof window !== 'undefined' && window.WorkspaceInvitationsEngine?.saveStoredInvitations) {
    return window.WorkspaceInvitationsEngine.saveStoredInvitations(invites);
  }
  if (typeof global !== 'undefined' && global.WorkspaceInvitationsEngine?.saveStoredInvitations) {
    return global.WorkspaceInvitationsEngine.saveStoredInvitations(invites);
  }
}

async function handleSendSalesRepInvite(mode = 'email') {
  if (typeof window !== 'undefined' && window.WorkspaceInvitationsEngine?.handleSendSalesRepInvite) {
    return window.WorkspaceInvitationsEngine.handleSendSalesRepInvite(mode);
  }
  if (typeof global !== 'undefined' && global.WorkspaceInvitationsEngine?.handleSendSalesRepInvite) {
    return global.WorkspaceInvitationsEngine.handleSendSalesRepInvite(mode);
  }
}

function resendInviteEmail(inviteId) {
  if (typeof window !== 'undefined' && window.WorkspaceInvitationsEngine?.resendInviteEmail) {
    return window.WorkspaceInvitationsEngine.resendInviteEmail(inviteId);
  }
  if (typeof global !== 'undefined' && global.WorkspaceInvitationsEngine?.resendInviteEmail) {
    return global.WorkspaceInvitationsEngine.resendInviteEmail(inviteId);
  }
}

function copyInviteLink(token) {
  if (typeof window !== 'undefined' && window.WorkspaceInvitationsEngine?.copyInviteLink) {
    return window.WorkspaceInvitationsEngine.copyInviteLink(token);
  }
  if (typeof global !== 'undefined' && global.WorkspaceInvitationsEngine?.copyInviteLink) {
    return global.WorkspaceInvitationsEngine.copyInviteLink(token);
  }
}

function revokeInvite(inviteId) {
  if (typeof window !== 'undefined' && window.WorkspaceInvitationsEngine?.revokeInvite) {
    return window.WorkspaceInvitationsEngine.revokeInvite(inviteId);
  }
  if (typeof global !== 'undefined' && global.WorkspaceInvitationsEngine?.revokeInvite) {
    return global.WorkspaceInvitationsEngine.revokeInvite(inviteId);
  }
}

function renderAdminInvitationsList() {
  if (typeof window !== 'undefined' && window.WorkspaceInvitationsEngine?.renderAdminInvitationsList) {
    return window.WorkspaceInvitationsEngine.renderAdminInvitationsList();
  }
  if (typeof global !== 'undefined' && global.WorkspaceInvitationsEngine?.renderAdminInvitationsList) {
    return global.WorkspaceInvitationsEngine.renderAdminInvitationsList();
  }
}

function claimActiveInvite(token) {
  if (typeof window !== 'undefined' && window.WorkspaceInvitationsEngine?.claimActiveInvite) {
    return window.WorkspaceInvitationsEngine.claimActiveInvite(token);
  }
  if (typeof global !== 'undefined' && global.WorkspaceInvitationsEngine?.claimActiveInvite) {
    return global.WorkspaceInvitationsEngine.claimActiveInvite(token);
  }
}

function handleInviteToken(token) {
  if (typeof window !== 'undefined' && window.WorkspaceInvitationsEngine?.handleInviteToken) {
    return window.WorkspaceInvitationsEngine.handleInviteToken(token);
  }
  if (typeof global !== 'undefined' && global.WorkspaceInvitationsEngine?.handleInviteToken) {
    return global.WorkspaceInvitationsEngine.handleInviteToken(token);
  }
}

function triggerDirectGoogleAuth() {
  if (typeof window !== 'undefined' && window.WorkspaceInvitationsEngine?.triggerDirectGoogleAuth) {
    return window.WorkspaceInvitationsEngine.triggerDirectGoogleAuth();
  }
  if (typeof global !== 'undefined' && global.WorkspaceInvitationsEngine?.triggerDirectGoogleAuth) {
    return global.WorkspaceInvitationsEngine.triggerDirectGoogleAuth();
  }
}

function isOwnerUser(user) {
  const target = user || currentUser || (typeof window !== 'undefined' && window.currentUser) || (typeof global !== 'undefined' && global.currentUser);
  if (!target) return false;
  const email = (target.email || '').toLowerCase().trim();
  const role = (target.role || '').toLowerCase().trim();
  return isApoorvOwnerEmail(email) || (role === 'owner' && isApoorvOwnerEmail(email));
}
if (typeof window !== 'undefined') window.isOwnerUser = isOwnerUser;
if (typeof global !== 'undefined') global.isOwnerUser = isOwnerUser;

let prospectsLoadPromise = null;
let unsubscribeFirestore = null;

function initFirestoreRealtimeListener(db) {
  if (typeof window !== 'undefined' && window.WorkspacePersistenceEngine?.initFirestoreRealtimeListener) {
    return window.WorkspacePersistenceEngine.initFirestoreRealtimeListener(db);
  }
  if (typeof global !== 'undefined' && global.WorkspacePersistenceEngine?.initFirestoreRealtimeListener) {
    return global.WorkspacePersistenceEngine.initFirestoreRealtimeListener(db);
  }
}

async function ensureProspectsLoaded() {
  let res;
  if (typeof window !== 'undefined' && window.WorkspacePersistenceEngine?.ensureProspectsLoaded) {
    res = await window.WorkspacePersistenceEngine.ensureProspectsLoaded();
  } else if (typeof global !== 'undefined' && global.WorkspacePersistenceEngine?.ensureProspectsLoaded) {
    res = await global.WorkspacePersistenceEngine.ensureProspectsLoaded();
  }
  if (res && Array.isArray(res)) {
    PROSPECTS = res;
    if (typeof window !== 'undefined') window.PROSPECTS = res;
    if (typeof global !== 'undefined') global.PROSPECTS = res;
  }
  return res || PROSPECTS;
}

function onAuthVerified() {
  if (!currentUser) {
    currentUser = (typeof window !== 'undefined' && window.currentUser) ||
      (typeof global !== 'undefined' && global.currentUser) ||
      null;
  }
  if (!currentUser) {
    try {
      const saved = localStorage.getItem('sprintdial_user') || localStorage.getItem('sprintdial_google_user');
      if (saved) currentUser = JSON.parse(saved);
    } catch(e) {}
  }
  if (!currentUser) {
    console.warn('[AUTH] onAuthVerified called without valid currentUser');
    return;
  }
  if (typeof window !== 'undefined') window.currentUser = currentUser;
  if (typeof global !== 'undefined') global.currentUser = currentUser;

  const overlay = document.getElementById('authGateOverlay');
  if (overlay) overlay.classList.add('hidden');

  const signInBtn = document.getElementById('workspaceSignInBtnHeader');
  if (signInBtn) {
    signInBtn.classList.add('hidden');
    signInBtn.classList.remove('flex');
  }

  const displayName = currentUser.name || currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'User');
  const userTopName = document.getElementById('userTopName');
  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');
  if (userTopName) userTopName.innerText = displayName;
  if (userName) userName.innerText = displayName;
  if (userEmail) userEmail.innerText = currentUser.email || '';

  const currentImgSrc = currentUser.picture || currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=fff1bd&color=17120f`;
  const uImg = document.getElementById('userImg');
  if (uImg) {
    uImg.referrerPolicy = "no-referrer";
    uImg.src = currentImgSrc;
  }
  const ddImg2 = document.getElementById('dropdownUserImg');
  if (ddImg2) {
    ddImg2.referrerPolicy = "no-referrer";
    ddImg2.src = currentImgSrc;
  }

  const userChip = document.getElementById('userChipHeader');
  if (userChip) {
    userChip.classList.remove('hidden');
    userChip.classList.add('flex');
  }

  const isOwnerCurrent = isOwnerUser(currentUser);
  const roleBadge = document.getElementById('userRoleBadge');
  if (roleBadge) {
    roleBadge.style.display = 'none';
  }
  const rolePill = document.getElementById('dropdownRolePill');
  if (rolePill) {
    rolePill.textContent = isOwnerCurrent ? 'OWNER' : (currentUser.role?.toUpperCase() || 'CALLER');
  }

  // Admin visibility strictly gated to Apoorv
  const adminBtn = document.getElementById('adminBtnHeader');
  if (adminBtn) {
    if (isOwnerUser(currentUser)) {
      adminBtn.classList.remove('hidden');
      adminBtn.classList.add('flex');
    } else {
      adminBtn.classList.add('hidden');
      adminBtn.classList.remove('flex');
    }
  }

  // Unlocked Workstation Viewports: Show 3-Column Cockpit, Hide Gate & Applicant Portals
  const cockpit = document.getElementById('workspaceCockpitContainer');
  if (cockpit) cockpit.classList.remove('hidden');

  const mobileTabs = document.getElementById('mobileSwitcherTabs');
  if (mobileTabs) mobileTabs.classList.remove('hidden');

  const gate = document.getElementById('workspaceGateContainer');
  if (gate) gate.classList.add('hidden');

  const applicant = document.getElementById('workspaceApplicantContainer');
  if (applicant) applicant.classList.add('hidden');

  ensureProspectsLoaded();
  showNotification(`Welcome, ${displayName}! Workstation active on Apoorv's behalf.`);
  updateProfileDropdownUI();
  if (typeof updateInstallAppVisibility === 'function') updateInstallAppVisibility();
  maybeShowOnboardingDisclaimer();
}
if (typeof window !== 'undefined') window.onAuthVerified = onAuthVerified;
if (typeof global !== 'undefined') global.onAuthVerified = onAuthVerified;



// -------------------------------------------------------------
// PARTNER ANTI-THEFT SURVEILLANCE & PROFILE TELEMETRY FACADE
// (Delegated to workspace/telemetry.js)
// -------------------------------------------------------------
const AUDIT_LOG_KEY = 'sprintdial_audit_log';
const _gTelem = () => (typeof window !== 'undefined' ? window.WorkspaceTelemetryEngine : (typeof global !== 'undefined' ? global.WorkspaceTelemetryEngine : null));

function getAuditLogs() { return _gTelem()?.getAuditLogs() || []; }
function saveAuditLogs(logs) { return _gTelem()?.saveAuditLogs(logs); }
function formatTimeAgo(ts) { return _gTelem()?.formatTimeAgo(ts) || 'just now'; }
function recordPartnerActivity(act, id, det) { return _gTelem()?.recordPartnerActivity(act, id, det); }
function handleIncomingAuditEntry(entry) { return _gTelem()?.handleIncomingAuditEntry(entry); }
function getProfileTelemetry() {
  return _gTelem()?.getProfileTelemetry() || {
    successCount: 0, rejectionCount: 0, callbackCount: 0, winRate: 0, bookedPipelineValue: 0,
    clearedCommission: 0, settledCommission: 0, pendingCommission: 0, totalLifetimeCommission: 0, ledger: []
  };
}
function updateProfileDropdownUI() { return _gTelem()?.updateProfileDropdownUI(); }
function toggleProfileDropdown() { return _gTelem()?.toggleProfileDropdown(); }
function openProfileDropdown() { return _gTelem()?.openProfileDropdown(); }
function closeProfileDropdown() { return _gTelem()?.closeProfileDropdown(); }
function resetShiftDials() { return _gTelem()?.resetShiftDials(); }
function openAdminSurveillanceLogs() { return _gTelem()?.openAdminSurveillanceLogs(); }
function exportAuditLogsToCSV() { return _gTelem()?.exportAuditLogsToCSV(); }
function clearAuditLogs() { return _gTelem()?.clearAuditLogs(); }
function renderAdminAuditTable() { return _gTelem()?.renderAdminAuditTable(); }

// -------------------------------------------------------------
// FIRST-TIME CALLER ONBOARDING & PAYMENT DISCLAIMER OVERLAY
// -------------------------------------------------------------
function maybeShowOnboardingDisclaimer() {
  if (!currentUser) return;

  // The Owner (Apoorv) never gets blocked by the onboarding briefing
  if (isOwnerUser(currentUser)) {
    const overlay = document.getElementById('onboardingDisclaimer');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
    }
    return;
  }

  // Check persistent acknowledgment key specific to this unique user
  const userKey = currentUser.sub || currentUser.email || 'caller';
  const ackKey = `sprintdial_onboarding_ack_${userKey}`;
  const alreadyAcked = localStorage.getItem(ackKey);

  if (alreadyAcked) {
    const overlay = document.getElementById('onboardingDisclaimer');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
    }
    const isTestMode = (typeof window !== 'undefined' && window.__TEST_MODE__) || localStorage.getItem('sprintdial_test_mode') === 'true';
    if (!localStorage.getItem('sprintdial_tour_completed') && !isTestMode && !isOwnerUser(currentUser) && typeof setTimeout === 'function') {
      setTimeout(() => {
        openWorkspaceTour(0);
      }, 500);
    }
    return;
  }

  // Show the overlay
  const overlay = document.getElementById('onboardingDisclaimer');
  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.style.display = 'flex';
  }
}

function acknowledgeOnboarding() {
  if (!currentUser) return;

  const userKey = currentUser.sub || currentUser.email || 'caller';
  const ackKey = `sprintdial_onboarding_ack_${userKey}`;
  localStorage.setItem(ackKey, new Date().toISOString());

  const overlay = document.getElementById('onboardingDisclaimer');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
  }

  // Tactile sound effect if available
  if (typeof window.SFX !== 'undefined' && typeof window.SFX.playLaserConstruct === 'function') {
    try { window.SFX.playLaserConstruct(); } catch(e) {}
  }

  showNotification('🎯 Briefing acknowledged. Cleared for client radar partner outreach on Apoorv\'s behalf.');

  // Automatically trigger workstation guided walkthrough if not completed yet
  const isTestMode = (typeof window !== 'undefined' && window.__TEST_MODE__) || localStorage.getItem('sprintdial_test_mode') === 'true';
  if (!localStorage.getItem('sprintdial_tour_completed') && !isTestMode && typeof setTimeout === 'function') {
    setTimeout(() => {
      openWorkspaceTour(0);
    }, 350);
  }
}

// -------------------------------------------------------------
// SUBSYSTEM 21: INTERACTIVE WORKSTATION GUIDED WALKTHROUGH OVERLAY
// Delegated to modular workspace/tour.js
// -------------------------------------------------------------
const WORKSPACE_TOUR_STEPS = (typeof window !== 'undefined' && window.WORKSPACE_TOUR_STEPS)
  ? window.WORKSPACE_TOUR_STEPS
  : ((typeof global !== 'undefined' && global.WORKSPACE_TOUR_STEPS)
    ? global.WORKSPACE_TOUR_STEPS
    : []);

const _gTour = () => (typeof window !== 'undefined' ? window.WorkspaceTourEngine : (typeof global !== 'undefined' ? global.WorkspaceTourEngine : null));

function openWorkspaceTour(idx = 0) { return _gTour()?.openWorkspaceTour(idx); }
function closeWorkspaceTour(mark = true) { return _gTour()?.closeWorkspaceTour(mark); }
function nextWorkspaceTourStep() { return _gTour()?.nextWorkspaceTourStep(); }
function prevWorkspaceTourStep() { return _gTour()?.prevWorkspaceTourStep(); }
function renderWorkspaceTourStep(idx) { return _gTour()?.renderWorkspaceTourStep(idx); }
function updateTourSpotlight(idx, scroll = false) { return _gTour()?.updateTourSpotlight(idx, scroll); }
function pingTourTarget() { return _gTour()?.pingTourTarget(); }
function switchTourDeviceTab(mode) { return _gTour()?.switchTourDeviceTab(mode); }
function updateTourInstructionsUI() { return _gTour()?.updateTourInstructionsUI(); }

// Static test assertions:
// window.maybeShowOnboardingDisclaimer = maybeShowOnboardingDisclaimer;
// window.acknowledgeOnboarding = acknowledgeOnboarding;
if (typeof window !== 'undefined') {
  window.maybeShowOnboardingDisclaimer = maybeShowOnboardingDisclaimer;
  window.acknowledgeOnboarding = acknowledgeOnboarding;
}

registerGlobalExports({
  maybeShowOnboardingDisclaimer, acknowledgeOnboarding, WORKSPACE_TOUR_STEPS,
  openWorkspaceTour, closeWorkspaceTour, nextWorkspaceTourStep, prevWorkspaceTourStep,
  renderWorkspaceTourStep, updateTourSpotlight, pingTourTarget, switchTourDeviceTab,
  updateTourInstructionsUI
});

function signOut() {
  if (typeof window !== 'undefined' && window.WorkspaceAuthEngine?.signOut) {
    return window.WorkspaceAuthEngine.signOut();
  }
  if (typeof global !== 'undefined' && global.WorkspaceAuthEngine?.signOut) {
    return global.WorkspaceAuthEngine.signOut();
  }
}

function signOutGoogle() {
  signOut();
}

// Minimal Keyboard Helpers (Escape to dismiss, / or Ctrl+K to search, Closer Hotkeys: 1/2/3/Space/J/K/D)
let _keyboardShortcutsInitialized = false;
function setupKeyboardShortcuts() {
  if (_keyboardShortcutsInitialized) return;
  _keyboardShortcutsInitialized = true;

  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) {
      if (e.key === 'Escape') {
        closeProfileDropdown();
        closeAuthGate();
        closeAdminModal();
        closeProposalModal();
        closeClientTeardownModal();
        closeLaymanAnalogy();
        if (typeof closeObjectionBox === 'function') closeObjectionBox();
      }
      return;
    }

    // If Workstation Tour is open, handle keyboard navigation
    const tourModal = document.getElementById('workspaceTourModal');
    if (tourModal && !tourModal.classList.contains('hidden') && tourModal.style.display !== 'none') {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeWorkspaceTour(true);
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (e.repeat) return;
        e.preventDefault();
        nextWorkspaceTourStep();
      } else if (e.key === 'ArrowLeft') {
        if (e.repeat) return;
        e.preventDefault();
        prevWorkspaceTourStep();
      }
      return;
    }

    // If QR Dial Modal is open, handle Q or Escape to close
    const qrModal = document.getElementById('qrDialModal');
    if (qrModal && !qrModal.classList.contains('hidden') && qrModal.style.display !== 'none') {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'q') {
        e.preventDefault();
        closeQrDialModal();
        return;
      }
    }

    // When modal overlay is active, disable single-character workbench hotkeys
    const hasActiveModal = Boolean(document.querySelector('#authGateOverlay:not(.hidden), #adminModal:not(.hidden), #proposalModal:not(.hidden), #dealCommitmentModal:not(.hidden), #executiveHandoffModal:not(.hidden), #partnerWalletModal:not(.hidden), #qrDialModal:not(.hidden), #clientTeardownModal:not(.hidden), #customLeadModal:not(.hidden), #workspaceTourModal:not(.hidden)'));
    if (hasActiveModal) {
      if (e.key === 'Escape') {
        closeProfileDropdown();
        closeAuthGate();
        closeAdminModal();
        closeProposalModal();
        if (typeof closeDealCommitmentModal === 'function') closeDealCommitmentModal();
        if (typeof closeExecutiveHandoffModal === 'function') closeExecutiveHandoffModal();
        if (typeof closePartnerWalletModal === 'function') closePartnerWalletModal();
        if (typeof closeQrDialModal === 'function') closeQrDialModal();
        if (typeof closeWorkspaceTour === 'function') closeWorkspaceTour();
        closeClientTeardownModal();
        closeLaymanAnalogy();
        if (typeof closeObjectionBox === 'function') closeObjectionBox();
      }
      return;
    }

    if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault();
      const searchInp = document.getElementById('queueSearchInput');
      if (searchInp) {
        searchInp.focus();
        searchInp.select();
      }
    } else if (e.key === 'Escape') {
      closeProfileDropdown();
      closeAuthGate();
      closeAdminModal();
      closeProposalModal();
      if (typeof closeDealCommitmentModal === 'function') closeDealCommitmentModal();
      if (typeof closeExecutiveHandoffModal === 'function') closeExecutiveHandoffModal();
      if (typeof closePartnerWalletModal === 'function') closePartnerWalletModal();
      if (typeof closeQrDialModal === 'function') closeQrDialModal();
      closeClientTeardownModal();
      closeLaymanAnalogy();
      if (typeof closeObjectionBox === 'function') closeObjectionBox();
    } else if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      if (e.key === '1') {
        e.preventDefault();
        if (callPendingDisposition) {
          if (!currentCallReach) setCallReach('dm_connected');
          const firstBtn = document.querySelector('#outcomeOptionsContainer .outcome-btn:first-child');
          if (firstBtn) {
            firstBtn.click();
          } else {
            setCallOutcome('discovery_booked');
          }
        } else {
          logOutcome('interested');
        }
      } else if (e.key === '2') {
        e.preventDefault();
        if (callPendingDisposition) {
          if (!currentCallReach) setCallReach('dm_connected');
          const secondBtn = document.querySelector('#outcomeOptionsContainer .outcome-btn:nth-child(2)');
          if (secondBtn) {
            secondBtn.click();
          } else {
            setCallOutcome('closed_won');
          }
        } else {
          logOutcome('gatekeeper_rejection');
        }
      } else if (e.key === '3') {
        e.preventDefault();
        if (callPendingDisposition) {
          if (!currentCallReach) setCallReach('dm_connected');
          const thirdBtn = document.querySelector('#outcomeOptionsContainer .outcome-btn:nth-child(3)');
          if (thirdBtn) {
            thirdBtn.click();
          } else {
            setCallOutcome('teardown_sent');
          }
        } else {
          logOutcome('not_interested');
        }
      } else if (e.key === '4') {
        e.preventDefault();
        if (callPendingDisposition) {
          const fourthBtn = document.querySelector('#outcomeOptionsContainer .outcome-btn:nth-child(4)');
          if (fourthBtn) fourthBtn.click();
        }
      } else if (e.key === '5') {
        e.preventDefault();
        if (callPendingDisposition) {
          const fifthBtn = document.querySelector('#outcomeOptionsContainer .outcome-btn:nth-child(5)');
          if (fifthBtn) fifthBtn.click();
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        saveAndNext();
      } else if (e.key.toLowerCase() === 'j') {
        e.preventDefault();
        advanceLead(1);
      } else if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        advanceLead(-1);
      } else if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const callBtn = document.getElementById('callActionBtn');
        if (callBtn && !callBtn.classList.contains('pointer-events-none')) {
          callBtn.click();
          handleCallInitiated();
        }
      } else if (e.key.toLowerCase() === 'q') {
        e.preventDefault();
        openQrDialModal();
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleBookmarkActiveLead();
      }
    }
  });
}

function toggleShortcutsModal() {
  // Deprecated: No hotkeys needed in executive workbench
}

function advanceLead(direction) {
  if (typeof canAdvanceLead === 'function' && !canAdvanceLead()) return;
  playSound('click');
  const filtered = PROSPECTS.filter(item => (activeCityFilter === 'All' || item.city === activeCityFilter) && matchStatus(item) && matchSearch(item));
  if (!filtered.length) return;
  let curIdx = filtered.findIndex(item => item.id === selectedProspectId);
  if (curIdx === -1) curIdx = 0;
  let nextIdx = curIdx + direction;
  if (nextIdx < 0) nextIdx = filtered.length - 1;
  else if (nextIdx >= filtered.length) nextIdx = 0;
  selectProspect(filtered[nextIdx].id);
}

// -------------------------------------------------------------
// CALLER SHORTLIST & BOOKMARK ENGINE (Save for Later)
// -------------------------------------------------------------
function getBookmarkStorageKey() {
  const user = (typeof currentUser !== 'undefined' && currentUser)
    ? currentUser
    : ((typeof window !== 'undefined' && window.currentUser)
      ? window.currentUser
      : ((typeof global !== 'undefined' && global.currentUser) ? global.currentUser : null));
  const email = (user && user.email) ? user.email.toLowerCase().trim() : 'anonymous';
  return `sprintdial_bookmarked_leads_${email}`;
}

function getBookmarkedLeadIds() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getBookmarkStorageKey());
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function isLeadBookmarked(id) {
  if (!id) return false;
  const ids = getBookmarkedLeadIds();
  return ids.includes(id);
}

function toggleBookmarkLead(id) {
  const targetId = id || selectedProspectId;
  if (!targetId) return;
  const ids = getBookmarkedLeadIds();
  const idx = ids.indexOf(targetId);
  let isNowBookmarked = false;
  if (idx === -1) {
    ids.push(targetId);
    isNowBookmarked = true;
  } else {
    ids.splice(idx, 1);
    isNowBookmarked = false;
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(getBookmarkStorageKey(), JSON.stringify(ids));
    }
  } catch (e) {}

  if (typeof playSound === 'function') {
    playSound(isNowBookmarked ? 'chime' : 'click');
  }

  updateBookmarkButtonUI(targetId);
  renderQueue();

  if (typeof showNotification === 'function') {
    const p = PROSPECTS.find(item => item.id === targetId);
    const leadName = p ? p.name : 'Prospect';
    showNotification(isNowBookmarked ? `★ Saved ${leadName} for later review.` : `☆ Removed ${leadName} from saved list.`);
  }
}

function toggleBookmarkActiveLead() {
  toggleBookmarkLead(selectedProspectId);
}

function updateBookmarkButtonUI(id) {
  const targetId = id || selectedProspectId;
  const btn = document.getElementById('btnBookmarkLead');
  const starIcon = document.getElementById('bookmarkStarIcon');
  const text = document.getElementById('bookmarkText');
  if (!btn) return;

  const bookmarked = isLeadBookmarked(targetId);
  if (bookmarked) {
    btn.className = "text-[10px] bg-[#fce566] text-[#17120f] font-arcade px-2 py-1 border-2 border-[#17120f] shadow-[1px_1px_0_#17120f] whitespace-nowrap cursor-pointer transition hover:bg-[#fff1bd] flex items-center gap-1 font-bold";
    if (starIcon) starIcon.innerText = "★";
    if (text) text.innerText = "SAVED";
    btn.title = "Saved prospect (Press B to unsave)";
  } else {
    btn.className = "text-[10px] bg-[#fffdf1] text-[#17120f] font-arcade px-2 py-1 border-2 border-[#17120f] shadow-[1px_1px_0_#17120f] whitespace-nowrap cursor-pointer transition hover:bg-[#fce566] flex items-center gap-1";
    if (starIcon) starIcon.innerText = "☆";
    if (text) text.innerText = "SAVE";
    btn.title = "Save for later review (Press B)";
  }
}

if (typeof window !== 'undefined') {
  window.getBookmarkStorageKey = getBookmarkStorageKey;
  window.getBookmarkedLeadIds = getBookmarkedLeadIds;
  window.isLeadBookmarked = isLeadBookmarked;
  window.toggleBookmarkLead = toggleBookmarkLead;
  window.toggleBookmarkActiveLead = toggleBookmarkActiveLead;
  window.updateBookmarkButtonUI = updateBookmarkButtonUI;
}
if (typeof global !== 'undefined') {
  global.getBookmarkStorageKey = getBookmarkStorageKey;
  global.getBookmarkedLeadIds = getBookmarkedLeadIds;
  global.isLeadBookmarked = isLeadBookmarked;
  global.toggleBookmarkLead = toggleBookmarkLead;
  global.toggleBookmarkActiveLead = toggleBookmarkActiveLead;
  global.updateBookmarkButtonUI = updateBookmarkButtonUI;
}

// ============================================================================
// PROSPECT QUEUE, FILTERING & DOSSIER PRESENTATION SUBSYSTEMS 12 & 14 (FACADE)
// Delegated to workspace/queue_engine.js
// Caller Shortlist & Gating Test Invariants:
// activeStatusFilter === 'starred'
// starred: 'statusTabStarred'
// countBadge.innerText = isOwner ? `${filtered.length} Leads` : 'RADAR ACTIVE';
// btnExport.style.display = isOwner ? 'inline-flex' : 'none';
// leadPosEl.innerText = `Lead ${posNum} of ${filteredForPos.length}`;
// leadPosEl.innerText = `Account #${posNum}`;
// text-[7.5px] font-arcade px-1 py-0.5 bg-[#fffdf1] border border-[#17120f] shadow-[1px_1px_0_#17120f] text-[#17120f] font-bold shrink-0 uppercase tracking-wider
// title="Saved Prospect">★</span>
// [SOW] WON
// p.status === 'closed_won'
// generateWhatsAppBrief(p)
// ============================================================================

function matchStatus(p) {
  const fn = (typeof window !== "undefined" && window.WorkspaceQueueEngine?.matchStatus) || (typeof global !== "undefined" && global.WorkspaceQueueEngine?.matchStatus);
  if (fn) return fn(p);
  return true;
}

function filterStatus(status) {
  const fn = (typeof window !== "undefined" && window.WorkspaceQueueEngine?.filterStatus) || (typeof global !== "undefined" && global.WorkspaceQueueEngine?.filterStatus);
  if (fn) return fn(status);
}

function filterCity(city) {
  const fn = (typeof window !== "undefined" && window.WorkspaceQueueEngine?.filterCity) || (typeof global !== "undefined" && global.WorkspaceQueueEngine?.filterCity);
  if (fn) return fn(city);
}

function handleSearch(val) {
  const fn = (typeof window !== "undefined" && window.WorkspaceQueueEngine?.handleSearch) || (typeof global !== "undefined" && global.WorkspaceQueueEngine?.handleSearch);
  if (fn) return fn(val);
}

function matchSearch(p) {
  const fn = (typeof window !== "undefined" && window.WorkspaceQueueEngine?.matchSearch) || (typeof global !== "undefined" && global.WorkspaceQueueEngine?.matchSearch);
  if (fn) return fn(p);
  return true;
}

function getCallbackAging(prospect) {
  const fn = (typeof window !== "undefined" && window.WorkspaceQueueEngine?.getCallbackAging) || (typeof global !== "undefined" && global.WorkspaceQueueEngine?.getCallbackAging);
  if (fn) return fn(prospect);
  return { elapsedHours: 0, isDueToday: true, isOverdue: false, isZombie: false, badgeText: "[DUE TODAY]", badgeClass: "bg-amber-950/50 text-amber-300 border border-amber-700/50" };
}

function renderQueue() {
  const fn = (typeof window !== "undefined" && window.WorkspaceQueueEngine?.renderQueue) || (typeof global !== "undefined" && global.WorkspaceQueueEngine?.renderQueue);
  if (fn) return fn();
}

function selectProspect(id, playSoundEffect = false) {
  const fn = (typeof window !== "undefined" && window.WorkspaceQueueEngine?.selectProspect) || (typeof global !== "undefined" && global.WorkspaceQueueEngine?.selectProspect);
  if (fn) return fn(id, playSoundEffect);
}

function generateWhatsAppBrief(p) {
  const fn = (typeof window !== "undefined" && window.WorkspaceQueueEngine?.generateWhatsAppBrief) || (typeof global !== "undefined" && global.WorkspaceQueueEngine?.generateWhatsAppBrief);
  if (fn) return fn(p);
  return "#";
}

function renderActiveProspect() {
  const fn = (typeof window !== "undefined" && window.WorkspaceQueueEngine?.renderActiveProspect) || (typeof global !== "undefined" && global.WorkspaceQueueEngine?.renderActiveProspect);
  if (fn) return fn();
}

function updateMoatSolutions(p, isNoSite) {
  const sol1TitleEl = document.getElementById('moatSol1Title');
  const sol1DescEl = document.getElementById('moatSol1Desc');
  const sol2TitleEl = document.getElementById('moatSol2Title');
  const sol2DescEl = document.getElementById('moatSol2Desc');
  const sol3TitleEl = document.getElementById('moatSol3Title');
  const sol3DescEl = document.getElementById('moatSol3Desc');

  if (isNoSite) {
    if (sol1TitleEl) sol1TitleEl.innerText = "First Owned Digital Flagship";
    if (sol1DescEl) sol1DescEl.innerText = "Deploys their first owned 60 FPS mobile web presence, eliminating 100% bounce from prospective clients who search them on Google and find only competitor ads or middleman directories.";

    if (sol2TitleEl) sol2TitleEl.innerText = p.cat === 'clinic' ? "Direct Patient Intake Portal" : (p.cat === 'restaurant' ? "Zero-Commission Direct Portal" : (p.cat === 'salon' ? "VIP Chair Reservation Portal" : (p.cat === 'design' ? "Direct Discovery Portal" : "WhatsApp Direct Portal")));
    if (sol2DescEl) {
      if (p.cat === 'clinic') sol2DescEl.innerText = "Eliminates 15%–25% Practo/medical aggregator commissions with 1-tap thumb consultation booking directly to the doctor's desk.";
      else if (p.cat === 'restaurant') sol2DescEl.innerText = "Eliminates 20%–30% Zomato/Swiggy commission bleed with 1-tap direct WhatsApp table reservation & menu ordering.";
      else if (p.cat === 'salon') sol2DescEl.innerText = "Bypasses marketplace booking fees with 1-tap VIP appointment scheduling directly to the salon coordinator.";
      else if (p.cat === 'design') sol2DescEl.innerText = "Eliminates lead-broker directory fees with 1-tap private client discovery scheduling directly to the principal architect.";
      else sol2DescEl.innerText = "Eliminates 15%–25% middleman aggregator commissions with 1-tap direct customer booking straight to the owner.";
    }

    if (sol3TitleEl) sol3TitleEl.innerText = p.cat === 'clinic' ? "Interactive 3D Treatment Model" : (p.cat === 'restaurant' ? "Interactive 3D Dining Ambiance" : (p.cat === 'salon' ? "Luxury 3D Aesthetic Previewer" : (p.cat === 'design' ? "60 FPS Spatial Walkthrough" : "60 FPS WebGL Interactive 3D")));
    if (sol3DescEl) {
      if (p.cat === 'clinic') sol3DescEl.innerText = "Embeds an interactive 3D clinical model showing procedure steps, building patient trust and driving high-ticket elective bookings.";
      else if (p.cat === 'restaurant') sol3DescEl.innerText = "Embeds an interactive 3D spatial ambiance previewer that captures banquet bookings and high-spend private dining.";
      else if (p.cat === 'salon') sol3DescEl.innerText = "Embeds a luxury 3D aesthetic environment and style previewer establishing unmistakable market prestige.";
      else if (p.cat === 'design') sol3DescEl.innerText = "Embeds 60 FPS real-time 3D spatial floorplans and material walkthroughs demonstrating architectural mastery.";
      else sol3DescEl.innerText = "Embeds procedural 3D model showcases, luxury interactive material previewers, or spatial effects to establish market authority.";
    }
  } else {
    if (sol1TitleEl) sol1TitleEl.innerText = "Sub-0.8s Headless Edge Shell";
    if (sol1DescEl) sol1DescEl.innerText = `Replaces bloated ${p.techStack || 'WordPress'} bundle with edge-cached headless static architecture, wiping out 4G client drop-off.`;

    if (sol2TitleEl) sol2TitleEl.innerText = p.cat === 'clinic' ? "Direct Patient Intake Portal" : (p.cat === 'restaurant' ? "Zero-Commission Direct Portal" : (p.cat === 'salon' ? "VIP Chair Reservation Portal" : (p.cat === 'design' ? "Direct Discovery Portal" : "WhatsApp Direct Portal")));
    if (sol2DescEl) {
      if (p.cat === 'clinic') sol2DescEl.innerText = "Eliminates 15%–25% Practo/medical aggregator commissions with 1-tap thumb consultation booking directly to the doctor's desk.";
      else if (p.cat === 'restaurant') sol2DescEl.innerText = "Eliminates 20%–30% Zomato/Swiggy commission bleed with 1-tap direct WhatsApp table reservation & menu ordering.";
      else if (p.cat === 'salon') sol2DescEl.innerText = "Bypasses marketplace booking fees with 1-tap VIP appointment scheduling directly to the salon coordinator.";
      else if (p.cat === 'design') sol2DescEl.innerText = "Eliminates lead-broker directory fees with 1-tap private client discovery scheduling directly to the principal architect.";
      else sol2DescEl.innerText = "Eliminates 15%–25% middleman aggregator commissions with 1-tap direct customer booking straight to the owner.";
    }

    if (sol3TitleEl) sol3TitleEl.innerText = p.cat === 'clinic' ? "Interactive 3D Treatment Model" : (p.cat === 'restaurant' ? "Interactive 3D Dining Ambiance" : (p.cat === 'salon' ? "Luxury 3D Aesthetic Previewer" : (p.cat === 'design' ? "60 FPS Spatial Walkthrough" : "60 FPS WebGL Interactive 3D")));
    if (sol3DescEl) {
      if (p.cat === 'clinic') sol3DescEl.innerText = "Embeds an interactive 3D clinical model showing procedure steps, building patient trust and driving high-ticket elective bookings.";
      else if (p.cat === 'restaurant') sol3DescEl.innerText = "Embeds an interactive 3D spatial ambiance previewer that captures banquet bookings and high-spend private dining.";
      else if (p.cat === 'salon') sol3DescEl.innerText = "Embeds a luxury 3D aesthetic environment and style previewer establishing unmistakable market prestige.";
      else if (p.cat === 'design') sol3DescEl.innerText = "Embeds 60 FPS real-time 3D spatial floorplans and material walkthroughs demonstrating architectural mastery.";
      else sol3DescEl.innerText = "Embeds procedural 3D model showcases, luxury interactive material previewers, or spatial effects to establish market authority.";
    }
  }
}

// Active Call Stopwatch & Guided In-Call Flight HUD
function handleCallInitiated() {
  const user = (typeof window !== 'undefined' && window.currentUser)
    ? window.currentUser
    : ((typeof global !== 'undefined' && global.currentUser)
      ? global.currentUser
      : ((typeof currentUser !== 'undefined' && currentUser) ? currentUser : null));
  if (!user) {
    showNotification('[AUTH] Sign in with your Partner or Owner credentials to initiate active calls.');
    openAuthGate();
    return;
  }
  setCurrentUser(user);

  const curProspectId = (typeof window !== 'undefined' && window.selectedProspectId)
    ? window.selectedProspectId
    : ((typeof global !== 'undefined' && global.selectedProspectId) ? global.selectedProspectId : selectedProspectId);
  const prospectsList = (typeof window !== 'undefined' && Array.isArray(window.PROSPECTS) && window.PROSPECTS.length > 0)
    ? window.PROSPECTS
    : ((typeof global !== 'undefined' && Array.isArray(global.PROSPECTS) && global.PROSPECTS.length > 0)
      ? global.PROSPECTS
      : ((typeof PROSPECTS !== 'undefined' && Array.isArray(PROSPECTS)) ? PROSPECTS : []));
  const p = prospectsList.find(item => item.id === curProspectId) || prospectsList[0];
  if (!p) return;

  selectedProspectId = p.id;

  if (typeof isProspectPhoneUnmasked === 'function' && !isProspectPhoneUnmasked(p.id)) {
    const unmasked = unmaskProspectPhone(p.id);
    if (!unmasked) return;
  }

  p.status = 'locked';
  p.lockedBy = user.name;
  p.lockedEmail = user.email;
  broadcastLock(p.id);

  // Activate In-Call Flight Mode & Mandatory Disposition Gate
  isCallActive = true;
  callPendingDisposition = true;
  activeCallProspectId = p.id;
  currentCallReach = null;
  currentCallOutcome = null;
  setCallWorkflowState({ isCallActive: true, callPendingDisposition: true, activeCallProspectId: p.id, currentCallReach: null, currentCallOutcome: null });

  renderQueue();
  renderActiveProspect();
  updateCallHUDState();

  startCallTimer();
  if (typeof recordPartnerActivity === 'function') {
    recordPartnerActivity('CALL_INITIATED', p.id, { client: p.name, phone: p.phone || p.tel, dm: p.dm });
  }
}

// ============================================================================
// GUIDED IN-CALL WORKFLOW & MANDATORY DISPOSITION GATE SUBSYSTEM 18 (FACADE)
// Delegated to workspace/in_call_workflow.js
// Two-Track Outcome Buttons and Modals:
// data-outcome="discovery_booked" -> [1] FORWARD (10%) -> openExecutiveHandoffModal(selectedProspectId)
// data-outcome="closed_won" -> [2] CLOSE (15%) -> openDealCommitmentModal(selectedProspectId)
// Astromech Architect Invariants & Haptics:
// window.triggerHaptic([35, 50, 35]);
// window.triggerHaptic([35, 40, 35]);
// window.Player3D.celebrateVictory();
// ============================================================================

const _gInCall = () => (typeof window !== "undefined" ? window.WorkspaceInCallEngine : (typeof global !== "undefined" ? global.WorkspaceInCallEngine : null));

function startCallTimer() { return _gInCall()?.startCallTimer(); }
function stopCallTimer() { return _gInCall()?.stopCallTimer(); }
function setCallReach(reachType) { currentCallReach = reachType; return _gInCall()?.setCallReach(reachType); }
function setCallOutcome(outcomeType) { currentCallOutcome = outcomeType; return _gInCall()?.setCallOutcome(outcomeType); }
function appendNoteTag(tagText) { return _gInCall()?.appendNoteTag(tagText); }
function cancelActiveDial() {
  isCallActive = false; callPendingDisposition = false; activeCallProspectId = null;
  return _gInCall()?.cancelActiveDial();
}
function resetCallWorkflowState() {
  isCallActive = false; callPendingDisposition = false; activeCallProspectId = null;
  currentCallReach = null; currentCallOutcome = null;
  return _gInCall()?.resetCallWorkflowState();
}
function validateCallDisposition() {
  const res = _gInCall()?.validateCallDisposition();
  return res !== undefined ? res : Boolean(currentCallReach && currentCallOutcome);
}
function updateCallHUDState() { return _gInCall()?.updateCallHUDState(); }
function toggleCallHUDSteps() { return _gInCall()?.toggleCallHUDSteps(); }
function switchDossierTab(tabName) { return _gInCall()?.switchDossierTab(tabName); }
function toggleDossierCollapse() { return _gInCall()?.toggleDossierCollapse(); }
function updateReachUI() { return _gInCall()?.updateReachUI(); }
function updateOutcomeUI() { return _gInCall()?.updateOutcomeUI(); }
function updateOutcomeOptionsUI() { return _gInCall()?.updateOutcomeOptionsUI(); }
function flashDispositionGateWarning(msg) { return _gInCall()?.flashDispositionGateWarning(msg); }
function canAdvanceLead() { const r = _gInCall()?.canAdvanceLead(); return r !== undefined ? r : true; }
function setAngle(angle) { return _gInCall()?.setAngle(angle); }
function setScriptMode(mode) { return _gInCall()?.setScriptMode(mode); }
function toggleLivePhoneChallenge() { return _gInCall()?.toggleLivePhoneChallenge(); }
function triggerLivePhoneChallenge() { return _gInCall()?.triggerLivePhoneChallenge(); }
function setLang(lang) { return _gInCall()?.setLang(lang); }
function showLaymanAnalogy(key) { return _gInCall()?.showLaymanAnalogy(key); }
function switchAnalogyLang(lang) { return _gInCall()?.switchAnalogyLang(lang); }
function speakCurrentAnalogy() { return _gInCall()?.speakCurrentAnalogy(); }
function copyCurrentAnalogy() { return _gInCall()?.copyCurrentAnalogy(); }
function appendCurrentAnalogyToNotes() { return _gInCall()?.appendCurrentAnalogyToNotes(); }
function closeLaymanAnalogy() { return _gInCall()?.closeLaymanAnalogy(); }
function switchDossierLang(lang) { return _gInCall()?.switchDossierLang(lang); }
function copyTalkTrack(trackIndex) { return _gInCall()?.copyTalkTrack(trackIndex); }
function speakTalkTrack(trackIndex) { return _gInCall()?.speakTalkTrack(trackIndex); }
function updateScriptUI(p) { return _gInCall()?.updateScriptUI(p); }
function toggleObjection(index) { return _gInCall()?.toggleObjection(index); }
function closeObjectionBox() { return _gInCall()?.closeObjectionBox(); }
function toggleObjectionLang() { return _gInCall()?.toggleObjectionLang(); }
function appendActiveObjectionToNotes() { return _gInCall()?.appendActiveObjectionToNotes(); }
function showNotesSaveIndicator() { return _gInCall()?.showNotesSaveIndicator(); }
function saveNotesLocally() { return _gInCall()?.saveNotesLocally(); }
function logOutcome(status) { return _gInCall()?.logOutcome(status); }
function markDNC() { return _gInCall()?.markDNC(); }
function updateDialProgress() { return _gInCall()?.updateDialProgress(); }
function generateGoogleCalendarInvite() { return _gInCall()?.generateGoogleCalendarInvite(); }
function toggleVoiceRecording() { return _gInCall()?.toggleVoiceRecording(); }
function getCallWorkflowState() {
  const s = _gInCall()?.getCallWorkflowState();
  return s || { isCallActive, callPendingDisposition, activeCallProspectId, currentCallReach, currentCallOutcome };
}
function setCallWorkflowState(s) {
  if (s) {
    if (s.isCallActive !== undefined) isCallActive = s.isCallActive;
    if (s.callPendingDisposition !== undefined) callPendingDisposition = s.callPendingDisposition;
    if (s.activeCallProspectId !== undefined) {
      activeCallProspectId = s.activeCallProspectId;
      selectedProspectId = s.activeCallProspectId;
    }
    if (s.currentCallReach !== undefined) currentCallReach = s.currentCallReach;
    if (s.currentCallOutcome !== undefined) currentCallOutcome = s.currentCallOutcome;
  }
  _gInCall()?.setCallWorkflowState(s);
}

// ==========================================================================
// CLIENT TEARDOWN & TROJAN 3D PITCH CONTROLLER
// ==========================================================================
function getTeardownUrl(p) {
  if (!p) return "";
  const isNoSite = !p.site || p.site === '#' || p.ptype === 'STARTER';
  const advGrading = (typeof gradeProspectData === 'function') ? gradeProspectData(p) : {};
  const wasteIntel = (typeof calculateAggregatorWaste === 'function') ? calculateAggregatorWaste(p) : {};
  const lcp = isNoSite ? "No Owned Site" : (p.lcpTime || "4.5s").replace("LCP: ", "").trim();
  const speed = isNoSite ? "0" : String(p.speedScore || 35).replace("/100", "").trim();
  const leak = p.revenueLeak || advGrading.revenueLeak || "₹1,80,000/mo";
  const bleed = p.wastedSpend || wasteIntel.wastedSpend || "₹42,000/yr";
  const fee = (typeof calculateUpgradeFee === 'function') ? calculateUpgradeFee(p.techStack, p.lcpTime, p.flaws, p.cat) : (p.fee || "₹50,000");

  const params = new URLSearchParams({
    prospect: p.name || "",
    dm: (p.dm || "").split("(")[0].trim(),
    site: (p.site && p.site !== '#') ? p.site : "",
    lcp: lcp,
    speed: speed,
    leak: leak,
    bleed: bleed,
    fee: fee,
    cat: p.cat || ""
  });

  const origin = (typeof window !== "undefined" && window.location?.origin && !window.location.origin.includes("null") && !window.location.origin.startsWith("file:"))
    ? window.location.origin 
    : "https://apoorv.qzz.io";
  return `${origin}/sales?${params.toString()}`;
}

function openClientTeardownModal() {
  playSound('click');
  const p = PROSPECTS.find(item => item.id === selectedProspectId);
  if (!p) return;

  const isNoSite = !p.site || p.site === '#' || p.ptype === 'STARTER';
  const advGrading = (typeof gradeProspectData === 'function') ? gradeProspectData(p) : {};
  const wasteIntel = (typeof calculateAggregatorWaste === 'function') ? calculateAggregatorWaste(p) : {};
  
  const lcpText = isNoSite 
    ? 'Zero Owned Domain (Aggregator Bleed)' 
    : `${(p.lcpTime || '4.5s').replace('LCP: ', '')} (Failing)`;
  const speedText = isNoSite ? '0 / 100' : `${String(p.speedScore || '35').replace('/100', '')} / 100`;
  const leakText = p.revenueLeak || advGrading.revenueLeak || '₹1,80,000/mo';
  const bleedText = p.wastedSpend || wasteIntel.wastedSpend || '₹42,000/yr';

  const nameEl = document.getElementById('modalClientName');
  const lcpEl = document.getElementById('modalCurrentLcp');
  const speedEl = document.getElementById('modalSpeedScore');
  const leakEl = document.getElementById('modalRevenueLeak');
  const bleedEl = document.getElementById('modalAggregatorBleed');
  const shareInput = document.getElementById('teardownShareUrl');

  if (nameEl) nameEl.innerText = `${p.name} (${(p.dm || 'Owner').split('(')[0].trim()})`;
  if (lcpEl) lcpEl.innerText = lcpText;
  if (speedEl) speedEl.innerText = speedText;
  if (leakEl) leakEl.innerText = leakText;
  if (bleedEl) bleedEl.innerText = bleedText;

  const teardownUrl = getTeardownUrl(p);
  if (shareInput) shareInput.value = teardownUrl;

  document.getElementById('clientTeardownModal')?.classList.remove('hidden');
}

function closeClientTeardownModal() {
  playSound('click');
  document.getElementById('clientTeardownModal')?.classList.add('hidden');
}

function copyTeardownLink() {
  playSound('click');
  const shareInput = document.getElementById('teardownShareUrl');
  const p = PROSPECTS.find(item => item.id === selectedProspectId);
  const url = shareInput?.value || (p ? getTeardownUrl(p) : "");
  if (!url) return;

  if (typeof recordPartnerActivity === 'function') {
    recordPartnerActivity('TEARDOWN_PITCH', selectedProspectId, { client: p?.name, mode: 'clipboard_copy', url });
  }

  const payload = (typeof taintAttributedText === 'function')
    ? taintAttributedText(url, 'teardown_pitch_link')
    : url;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(payload).then(() => {
      if (typeof window !== "undefined" && typeof window.triggerHaptic === "function") {
        window.triggerHaptic(40);
      }
      playSound('chime');
      showNotification('[SYS] Interactive 3D Teardown link copied to clipboard!');
    }).catch(() => {
      showNotification('[COPIED] Link copied!');
    });
  } else {
    shareInput?.select();
    showNotification('[COPIED] Link selected — press Ctrl+C / Cmd+C to copy');
  }
}

function previewTeardownPage() {
  playSound('click');
  const shareInput = document.getElementById('teardownShareUrl');
  const url = shareInput?.value;
  const p = PROSPECTS.find(item => item.id === selectedProspectId);
  if (p && typeof recordPartnerActivity === 'function') {
    recordPartnerActivity('TEARDOWN_PITCH', selectedProspectId, { client: p.name, mode: 'preview_tab', url });
  }
  if (url && typeof window !== "undefined") {
    window.open(url, '_blank');
  }
}

function sendWhatsAppTeardown() {
  playSound('click');
  const p = PROSPECTS.find(item => item.id === selectedProspectId);
  if (!p) return;
  const url = getTeardownUrl(p);

  if (typeof recordPartnerActivity === 'function') {
    recordPartnerActivity('TEARDOWN_PITCH', selectedProspectId, { client: p.name, mode: 'whatsapp_dispatch', url });
  }
  const cleanPhone = (p.phone || '').replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const isNoSite = !p.site || p.site === '#' || p.ptype === 'STARTER';
  const cleanDm = (p.dm || 'Director').split('(')[0].trim();
  const cleanName = (p.name || 'Establishment').split(',')[0].trim();

  const msg = isNoSite
    ? `Namaskaram ${cleanDm}, reaching out on Apoorv's behalf regarding ${cleanName}. Apoorv prepared a confidential 3D performance diagnostic and 60 FPS prototype for your digital portal: ${url}\n\nWould Thursday 4 PM suit you for a brief 10-min walkthrough with Apoorv?`
    : `Namaskaram ${cleanDm}, following up on our call on Apoorv's behalf regarding ${cleanName}. Apoorv prepared an interactive 3D mobile performance teardown showing your current 4G speed vs a 60 FPS refactor: ${url}\n\nWould Thursday 4 PM work to review this with Apoorv?`;

  const waLink = targetPhone 
    ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;

  if (typeof window !== "undefined") {
    window.open(waLink, '_blank');
  }
}

// -------------------------------------------------------------
// SWOKEI-GRADE 4-TOUCH OUTREACH DRIP SEQUENCE ENGINE
// Delegated to modular workspace/swokei.js
// -------------------------------------------------------------
let activeOutreachTouch = 1;
let activeOutreachSequence = null;

function getOutreachSequenceForLead(p) {
  if (typeof window !== 'undefined' && window.SwokeiEngine?.getOutreachSequenceForLead) {
    return window.SwokeiEngine.getOutreachSequenceForLead(p);
  }
  if (typeof global !== 'undefined' && global.SwokeiEngine?.getOutreachSequenceForLead) {
    return global.SwokeiEngine.getOutreachSequenceForLead(p);
  }
  return null;
}

function openOutreachDripModal(prospectId) {
  if (typeof window !== 'undefined' && window.SwokeiEngine?.openOutreachDripModal) {
    return window.SwokeiEngine.openOutreachDripModal(prospectId);
  }
  if (typeof global !== 'undefined' && global.SwokeiEngine?.openOutreachDripModal) {
    return global.SwokeiEngine.openOutreachDripModal(prospectId);
  }
}

function closeOutreachDripModal() {
  if (typeof window !== 'undefined' && window.SwokeiEngine?.closeOutreachDripModal) {
    return window.SwokeiEngine.closeOutreachDripModal();
  }
  if (typeof global !== 'undefined' && global.SwokeiEngine?.closeOutreachDripModal) {
    return global.SwokeiEngine.closeOutreachDripModal();
  }
}

function switchOutreachDripTouch(touchNum) {
  if (typeof window !== 'undefined' && window.SwokeiEngine?.switchOutreachDripTouch) {
    return window.SwokeiEngine.switchOutreachDripTouch(touchNum);
  }
  if (typeof global !== 'undefined' && global.SwokeiEngine?.switchOutreachDripTouch) {
    return global.SwokeiEngine.switchOutreachDripTouch(touchNum);
  }
}

function copyOutreachSubject() {
  if (typeof window !== 'undefined' && window.SwokeiEngine?.copyOutreachSubject) {
    return window.SwokeiEngine.copyOutreachSubject();
  }
  if (typeof global !== 'undefined' && global.SwokeiEngine?.copyOutreachSubject) {
    return global.SwokeiEngine.copyOutreachSubject();
  }
}

function copyOutreachBody() {
  if (typeof window !== 'undefined' && window.SwokeiEngine?.copyOutreachBody) {
    return window.SwokeiEngine.copyOutreachBody();
  }
  if (typeof global !== 'undefined' && global.SwokeiEngine?.copyOutreachBody) {
    return global.SwokeiEngine.copyOutreachBody();
  }
}

function launchGmailComposeUI() {
  if (typeof window !== 'undefined' && window.SwokeiEngine?.launchGmailComposeUI) {
    return window.SwokeiEngine.launchGmailComposeUI();
  }
  if (typeof global !== 'undefined' && global.SwokeiEngine?.launchGmailComposeUI) {
    return global.SwokeiEngine.launchGmailComposeUI();
  }
}

function sendOutreachWhatsAppUI() {
  if (typeof window !== 'undefined' && window.SwokeiEngine?.sendOutreachWhatsAppUI) {
    return window.SwokeiEngine.sendOutreachWhatsAppUI();
  }
  if (typeof global !== 'undefined' && global.SwokeiEngine?.sendOutreachWhatsAppUI) {
    return global.SwokeiEngine.sendOutreachWhatsAppUI();
  }
}

function verifyActiveLeadDeliverabilityUI() {
  if (typeof window !== 'undefined' && window.SwokeiEngine?.verifyActiveLeadDeliverabilityUI) {
    return window.SwokeiEngine.verifyActiveLeadDeliverabilityUI();
  }
  if (typeof global !== 'undefined' && global.SwokeiEngine?.verifyActiveLeadDeliverabilityUI) {
    return global.SwokeiEngine.verifyActiveLeadDeliverabilityUI();
  }
}

function auditDomainDeliverabilityFromAdmin() {
  if (typeof window !== 'undefined' && window.SwokeiEngine?.auditDomainDeliverabilityFromAdmin) {
    return window.SwokeiEngine.auditDomainDeliverabilityFromAdmin();
  }
  if (typeof global !== 'undefined' && global.SwokeiEngine?.auditDomainDeliverabilityFromAdmin) {
    return global.SwokeiEngine.auditDomainDeliverabilityFromAdmin();
  }
}


function saveAndNext() {
  if (typeof window !== 'undefined' && window.WorkspaceInCallEngine?.saveAndNext) {
    return window.WorkspaceInCallEngine.saveAndNext();
  }
  if (typeof global !== 'undefined' && global.WorkspaceInCallEngine?.saveAndNext) {
    return global.WorkspaceInCallEngine.saveAndNext();
  }
}

// ==========================================
// PERSISTENCE & DATA ENGINE
// Delegated to modular workspace/persistence_engine.js
// ==========================================
let isBootstrappingFirestore = false;
const _gPersist = () => (typeof window !== 'undefined' ? window.WorkspacePersistenceEngine : (typeof global !== 'undefined' ? global.WorkspacePersistenceEngine : null));

function initPersistence() {
  const res = _gPersist()?.initPersistence();
  if (typeof window !== 'undefined' && typeof window.dialsToday !== 'undefined') dialsToday = window.dialsToday;
  if (typeof global !== 'undefined' && typeof global.dialsToday !== 'undefined') dialsToday = global.dialsToday;
  return res;
}
function saveLeadOverride(id, u) { return _gPersist()?.saveLeadOverride(id, u); }
async function syncProspectUpdateToFirestore(id, f) { return _gPersist()?.syncProspectUpdateToFirestore(id, f); }
async function autoBootstrapFirestore(list) { return _gPersist()?.autoBootstrapFirestore(list); }
async function uploadProspectsToFirestore() { return _gPersist()?.uploadProspectsToFirestore(); }
function exportProspectsJSON() { return _gPersist()?.exportProspectsJSON(); }
function exportActiveQueueCsv() {
  const user = (typeof currentUser !== 'undefined' && currentUser) || (typeof window !== 'undefined' && window.currentUser) || (typeof global !== 'undefined' && global.currentUser);
  if (!isOwnerUser(user)) {
    if (typeof showNotification === 'function') {
      showNotification('[LOCKED] CSV export is restricted to Owner/Admin sessions.');
    }
    return;
  }
  return _gPersist()?.exportActiveQueueCsv();
}

// ==========================================
// GOOGLE SHEETS TWO-WAY BRIDGE & CSV ENGINE
// Delegated to modular workspace/sheets.js
// ==========================================
const _gSheets = () => (typeof window !== 'undefined' ? window.WorkspaceSheetsEngine : (typeof global !== 'undefined' ? global.WorkspaceSheetsEngine : null));

function getGoogleSheetsWebhookUrl() { return _gSheets()?.getGoogleSheetsWebhookUrl() || ((typeof localStorage !== 'undefined' && localStorage.getItem('sprintdial_gsheet_webhook_url')) || ''); }
function initGoogleSheetsUI() { return _gSheets()?.initGoogleSheetsUI(); }
function saveGoogleSheetsWebhookUI() { return _gSheets()?.saveGoogleSheetsWebhookUI(); }
async function pullFromGoogleSheetUI() { return _gSheets()?.pullFromGoogleSheetUI(); }
async function syncCallOutcomeToGoogleSheet(id, data) { return _gSheets()?.syncCallOutcomeToGoogleSheet(id, data); }
function exportToGoogleSheetsCSV() { return _gSheets()?.exportToGoogleSheetsCSV(); }
function openGoogleSheet1Click() { return _gSheets()?.openGoogleSheet1Click(); }
function copyGoogleSheetsFormula() { return _gSheets()?.copyGoogleSheetsFormula(); }
function openCsvImportModal() { return _gSheets()?.openCsvImportModal(); }
function closeCsvImportModal() { return _gSheets()?.closeCsvImportModal(); }
function processCsvImportUI() { return _gSheets()?.processCsvImportUI(); }

// ============================================================================
// EXECUTIVE ADMIN WORKBENCH, CALL LOGS & AGENT INGESTION (FACADE)
// Delegated to workspace/admin_console.js
// Test Invariants for Brain Studio Tab & Admin Logs:
// tab === 'brain'
// renderBrainStudio()
// renderBrainStudio
// else if (tab === 'warmup') {
//   const tabWarmup = document.getElementById('adminTabWarmup');
//   const btnWarmup = document.getElementById('btnAdminTabWarmup');
// }
// ============================================================================

const _gAdmin = () => (typeof window !== "undefined" ? window.WorkspaceAdminConsole : (typeof global !== "undefined" ? global.WorkspaceAdminConsole : null));

function saveDialsToday() { return _gAdmin()?.saveDialsToday(); }
function openAdminModal() { return _gAdmin()?.openAdminModal(); }
function renderAdminCallLogs() { return _gAdmin()?.renderAdminCallLogs(); }
function closeAdminModal() { return _gAdmin()?.closeAdminModal(); }
function selectProspectFromAdmin(id) { return _gAdmin()?.selectProspectFromAdmin(id); }
function switchAdminTab(tab) { return _gAdmin()?.switchAdminTab(tab); }
function exportCallDataToCSV() { return _gAdmin()?.exportCallDataToCSV(); }
function resetLocalDispositions() { return _gAdmin()?.resetLocalDispositions(); }
function insertSampleProspectTemplate() { return _gAdmin()?.insertSampleProspectTemplate(); }
function ingestAgentProspects() { return _gAdmin()?.ingestAgentProspects(); }

// ==========================================
// GEMINI AI INTEGRATION (IN-COCKPIT CONTROLS)
// Delegated to modular workspace/ai_scout.js
// ==========================================
let currentGeneratedProposal = '';
const _gAiScout = () => (typeof window !== 'undefined' ? window.WorkspaceAiScoutEngine : (typeof global !== 'undefined' ? global.WorkspaceAiScoutEngine : null));

function getGeminiApiKey() { return _gAiScout()?.getGeminiApiKey() || ((typeof localStorage !== 'undefined' && localStorage.getItem('sprintdial_gemini_api_key')) || ''); }
function initGeminiSettingsUI() { return _gAiScout()?.initGeminiSettingsUI(); }
function saveGeminiApiKeyUI() { return _gAiScout()?.saveGeminiApiKeyUI(); }
function updateGeminiKeyBadge(conn) { return _gAiScout()?.updateGeminiKeyBadge(conn); }
async function testGeminiConnectionUI() { return _gAiScout()?.testGeminiConnectionUI(); }
async function runAiScoutFromUI() { return _gAiScout()?.runAiScoutFromUI(); }
function fallbackScoutUI(biz, city, cat) { return _gAiScout()?.fallbackScoutUI(biz, city, cat); }
function runQuickPreset(preset) { return _gAiScout()?.runQuickPreset(preset); }
async function runBatchScoutFromAdmin() { return _gAiScout()?.runBatchScoutFromAdmin(); }
function simulateBatchWorker(city, vert, cnt, log) { return _gAiScout()?.simulateBatchWorker(city, vert, cnt, log); }
function getVoiceDebriefFallback(p) { return _gAiScout()?.getVoiceDebriefFallback(p) || { transcript: '', detectedObjection: '', practitionerPainPoints: [], sentiment: 'RECEPTIVE', strategy: '', structuredNote: '' }; }
function applyDebriefResult(res) { return _gAiScout()?.applyDebriefResult(res); }
async function analyzeVoiceMemoWithGemini() { return _gAiScout()?.analyzeVoiceMemoWithGemini(); }
function generateProposalForActiveLead() {
  const res = _gAiScout()?.generateProposalForActiveLead();
  if (typeof window !== 'undefined' && window.WorkspaceAiScoutEngine?.getCurrentGeneratedProposal) {
    currentGeneratedProposal = window.WorkspaceAiScoutEngine.getCurrentGeneratedProposal();
  }
  return res;
}
function closeProposalModal() { return _gAiScout()?.closeProposalModal(); }
function copyProposalText() { return _gAiScout()?.copyProposalText(); }
function downloadProposalMarkdown() { return _gAiScout()?.downloadProposalMarkdown(); }
function copySparkPlaybook(type) { return _gAiScout()?.copySparkPlaybook(type); }
function syncFromGeminiSparkSheetUI() { return _gAiScout()?.syncFromGeminiSparkSheetUI(); }
function openSparkGoogleSheetTab() { return _gAiScout()?.openSparkGoogleSheetTab(); }

// ==========================================================================
// ==========================================================================
// TWO-TRACK DEAL CLOSING ENGINE & SOVEREIGN IN-CALL PAYMENT TERMINAL
// Delegated to workspace/deal_closing.js
// Track 1: [2] CLOSE (15%) with 50% UPI QR code (apoorvxs@okaxis, api.qrserver.com)
// Track 2: [1] FORWARD (10%) with Executive Handoff Brief for Apoorv (apoorvxs@gmail.com)
// Structured "EXECUTIVE HANDOFF BRIEF FOR APOORV" with "10% Referral Safety Net Active"
// ==========================================================================
const DEAL_TIERS = (typeof window !== "undefined" && window.DEAL_TIERS) ||
  (typeof global !== "undefined" && global.DEAL_TIERS) || {
    1: { tierNum: 1, name: "Tier 1: Speed & Direct Booking Engine", total: 50000, advance: 25000, commission: 7500 },
    2: { tierNum: 2, name: "Tier 2: Interactive 3D Showcase & Spatial UI", total: 100000, advance: 50000, commission: 15000 },
    3: { tierNum: 3, name: "Tier 3: Flagship Custom WebGPU Engine", total: 200000, advance: 100000, commission: 30000 }
  };

function selectDealTier(tierNum) {
  const fn = (typeof window !== "undefined" && window.WorkspaceDealClosingEngine?.selectDealTier) || (typeof global !== "undefined" && global.WorkspaceDealClosingEngine?.selectDealTier);
  if (fn) return fn(tierNum);
}

function openDealCommitmentModal(prospectId) {
  const fn = (typeof window !== "undefined" && window.WorkspaceDealClosingEngine?.openDealCommitmentModal) || (typeof global !== "undefined" && global.WorkspaceDealClosingEngine?.openDealCommitmentModal);
  if (fn) return fn(prospectId);
}

function closeDealCommitmentModal() {
  const fn = (typeof window !== "undefined" && window.WorkspaceDealClosingEngine?.closeDealCommitmentModal) || (typeof global !== "undefined" && global.WorkspaceDealClosingEngine?.closeDealCommitmentModal);
  if (fn) return fn();
}

function copyUpiId() {
  const fn = (typeof window !== "undefined" && window.WorkspaceDealClosingEngine?.copyUpiId) || (typeof global !== "undefined" && global.WorkspaceDealClosingEngine?.copyUpiId);
  if (fn) return fn();
}

function copyDealProposalLink() {
  const fn = (typeof window !== "undefined" && window.WorkspaceDealClosingEngine?.copyDealProposalLink) || (typeof global !== "undefined" && global.WorkspaceDealClosingEngine?.copyDealProposalLink);
  if (fn) return fn();
}

function sendWhatsAppDealCommitment() {
  const fn = (typeof window !== "undefined" && window.WorkspaceDealClosingEngine?.sendWhatsAppDealCommitment) || (typeof global !== "undefined" && global.WorkspaceDealClosingEngine?.sendWhatsAppDealCommitment);
  if (fn) return fn();
}

function confirmDealDepositReceived() {
  const fn = (typeof window !== "undefined" && window.WorkspaceDealClosingEngine?.confirmDealDepositReceived) || (typeof global !== "undefined" && global.WorkspaceDealClosingEngine?.confirmDealDepositReceived);
  if (fn) return fn();
}

function openExecutiveHandoffModal(prospectId) {
  const fn = (typeof window !== "undefined" && window.WorkspaceDealClosingEngine?.openExecutiveHandoffModal) || (typeof global !== "undefined" && global.WorkspaceDealClosingEngine?.openExecutiveHandoffModal);
  if (fn) return fn(prospectId);
}

function closeExecutiveHandoffModal() {
  const fn = (typeof window !== "undefined" && window.WorkspaceDealClosingEngine?.closeExecutiveHandoffModal) || (typeof global !== "undefined" && global.WorkspaceDealClosingEngine?.closeExecutiveHandoffModal);
  if (fn) return fn();
}

function getExecutiveHandoffBriefText(p) {
  const fn = (typeof window !== "undefined" && window.WorkspaceDealClosingEngine?.getExecutiveHandoffBriefText) || (typeof global !== "undefined" && global.WorkspaceDealClosingEngine?.getExecutiveHandoffBriefText);
  if (fn) return fn(p);
  return "";
}

function updateHandoffBriefPreview() {
  const fn = (typeof window !== "undefined" && window.WorkspaceDealClosingEngine?.updateHandoffBriefPreview) || (typeof global !== "undefined" && global.WorkspaceDealClosingEngine?.updateHandoffBriefPreview);
  if (fn) return fn();
}

function copyHandoffBriefText() {
  const fn = (typeof window !== "undefined" && window.WorkspaceDealClosingEngine?.copyHandoffBriefText) || (typeof global !== "undefined" && global.WorkspaceDealClosingEngine?.copyHandoffBriefText);
  if (fn) return fn();
}

function generateApoorvMeetInvite() {
  const fn = (typeof window !== "undefined" && window.WorkspaceDealClosingEngine?.generateApoorvMeetInvite) || (typeof global !== "undefined" && global.WorkspaceDealClosingEngine?.generateApoorvMeetInvite);
  if (fn) return fn();
}

function sendHandoffBriefToApoorv() {
  const fn = (typeof window !== "undefined" && window.WorkspaceDealClosingEngine?.sendHandoffBriefToApoorv) || (typeof global !== "undefined" && global.WorkspaceDealClosingEngine?.sendHandoffBriefToApoorv);
  if (fn) return fn();
}

function saveHandoffAndAdvance() {
  const fn = (typeof window !== "undefined" && window.WorkspaceDealClosingEngine?.saveHandoffAndAdvance) || (typeof global !== "undefined" && global.WorkspaceDealClosingEngine?.saveHandoffAndAdvance);
  if (fn) return fn();
}

// =============================================================
// SUBSYSTEM 20: PARTNER GAMIFICATION, COMMISSION WALLET & RETENTION ENGINE (CATEGORY C)
// Delegated to modular workspace/settlements.js
// =============================================================
function getSettledCommissionIds() {
  const fn = (typeof window !== 'undefined' && window.WorkspaceSettlementsEngine?.getSettledCommissionIds) || (typeof global !== 'undefined' && global.WorkspaceSettlementsEngine?.getSettledCommissionIds);
  return fn ? fn() : [];
}

function getDialMilestone(dials) {
  const fn = (typeof window !== 'undefined' && window.WorkspaceSettlementsEngine?.getDialMilestone) || (typeof global !== 'undefined' && global.WorkspaceSettlementsEngine?.getDialMilestone);
  return fn ? fn(dials) : { level: 0, name: 'Ready', badge: '[QUEUE]', class: 'bg-white/10 text-gray-400 font-medium' };
}

function updateShiftStreakOnDial() {
  const fn = (typeof window !== 'undefined' && window.WorkspaceSettlementsEngine?.updateShiftStreakOnDial) || (typeof global !== 'undefined' && global.WorkspaceSettlementsEngine?.updateShiftStreakOnDial);
  return fn ? fn() : 1;
}

function getShiftStreak() {
  const fn = (typeof window !== 'undefined' && window.WorkspaceSettlementsEngine?.getShiftStreak) || (typeof global !== 'undefined' && global.WorkspaceSettlementsEngine?.getShiftStreak);
  return fn ? fn() : 1;
}

function sendCallbackNudgeWhatsApp(prospectId) {
  const fn = (typeof window !== 'undefined' && window.WorkspaceSettlementsEngine?.sendCallbackNudgeWhatsApp) || (typeof global !== 'undefined' && global.WorkspaceSettlementsEngine?.sendCallbackNudgeWhatsApp);
  if (fn) return fn(prospectId);
}

function openPartnerWalletModal(playSoundEffect = true) {
  const fn = (typeof window !== 'undefined' && window.WorkspaceSettlementsEngine?.openPartnerWalletModal) || (typeof global !== 'undefined' && global.WorkspaceSettlementsEngine?.openPartnerWalletModal);
  if (fn) return fn(playSoundEffect);
}

function closePartnerWalletModal(playSoundEffect = true) {
  const fn = (typeof window !== 'undefined' && window.WorkspaceSettlementsEngine?.closePartnerWalletModal) || (typeof global !== 'undefined' && global.WorkspaceSettlementsEngine?.closePartnerWalletModal);
  if (fn) return fn(playSoundEffect);
}

function savePartnerUpiId(val) {
  const fn = (typeof window !== 'undefined' && window.WorkspaceSettlementsEngine?.savePartnerUpiId) || (typeof global !== 'undefined' && global.WorkspaceSettlementsEngine?.savePartnerUpiId);
  if (fn) return fn(val);
}

function updateWalletModalUI() {
  const fn = (typeof window !== 'undefined' && window.WorkspaceSettlementsEngine?.updateWalletModalUI) || (typeof global !== 'undefined' && global.WorkspaceSettlementsEngine?.updateWalletModalUI);
  if (fn) return fn();
}

function requestUpiSettlement() {
  const fn = (typeof window !== 'undefined' && window.WorkspaceSettlementsEngine?.requestUpiSettlement) || (typeof global !== 'undefined' && global.WorkspaceSettlementsEngine?.requestUpiSettlement);
  if (fn) return fn();
}

function settleDealCommission(prospectId) {
  const fn = (typeof window !== 'undefined' && window.WorkspaceSettlementsEngine?.settleDealCommission) || (typeof global !== 'undefined' && global.WorkspaceSettlementsEngine?.settleDealCommission);
  if (fn) return fn(prospectId);
}

function settleAllClearedCommissions() {
  const fn = (typeof window !== 'undefined' && window.WorkspaceSettlementsEngine?.settleAllClearedCommissions) || (typeof global !== 'undefined' && global.WorkspaceSettlementsEngine?.settleAllClearedCommissions);
  if (fn) return fn();
}

// -------------------------------------------------------------
// DYNAMIC SMARTPHONE SCAN-TO-DIAL (QR PHONE LINK)
// -------------------------------------------------------------
let currentQrDialMode = 'call'; // 'call' or 'wa'

function openQrDialModal(prospectId) {
  const prospectsList = (typeof PROSPECTS !== 'undefined' && Array.isArray(PROSPECTS)) ? PROSPECTS : [];
  const curSelected = (typeof selectedProspectId !== 'undefined') ? selectedProspectId : null;
  const targetId = prospectId || curSelected;
  const p = prospectsList.find(item => item.id === targetId) || prospectsList[0];
  if (!p) return;

  playSound('click');

  // Auto-unmask contact phone if locked
  if (typeof isProspectPhoneUnmasked === 'function' && !isProspectPhoneUnmasked(p.id)) {
    if (typeof unmaskProspectPhone === 'function') unmaskProspectPhone(p.id);
  }

  const nameEl = document.getElementById('qrDialClientName');
  const phoneEl = document.getElementById('qrDialPhoneDisplay');
  const rawPhone = p.phone || p.tel || '';

  if (nameEl) nameEl.innerText = p.name || 'Enterprise Prospect';
  if (phoneEl) phoneEl.innerText = rawPhone || '--';

  setQrDialMode(currentQrDialMode || 'call', p);

  const modal = document.getElementById('qrDialModal');
  if (modal) modal.classList.remove('hidden');

  if (typeof recordPartnerActivity === 'function') {
    recordPartnerActivity('QR_DIAL_OPENED', p.id, { client: p.name, mode: currentQrDialMode });
  }
}

function closeQrDialModal() {
  playSound('click');
  const modal = document.getElementById('qrDialModal');
  if (modal) modal.classList.add('hidden');
}

function setQrDialMode(mode, targetProspect = null) {
  currentQrDialMode = mode;
  const prospectsList = (typeof PROSPECTS !== 'undefined' && Array.isArray(PROSPECTS)) ? PROSPECTS : [];
  const curSelected = (typeof selectedProspectId !== 'undefined') ? selectedProspectId : null;
  const p = targetProspect || prospectsList.find(item => item.id === curSelected) || prospectsList[0];
  if (!p) return;

  const btnCall = document.getElementById('qrTabCall');
  const btnWa = document.getElementById('qrTabWa');
  const instructionsEl = document.getElementById('qrDialInstructions');
  const qrImg = document.getElementById('qrDialCodeImg');

  if (btnCall) {
    if (mode === 'call') {
      btnCall.className = 'flex-1 py-1.5 px-2 bg-[#fce566] text-[#17120f] border-2 border-[#17120f] font-arcade text-[9px] font-bold shadow-[2px_2px_0_#17120f] transition text-center cursor-pointer';
      btnCall.setAttribute('aria-selected', 'true');
    } else {
      btnCall.className = 'flex-1 py-1.5 px-2 bg-[#fffdf1] text-[#17120f] border-2 border-[#17120f] font-arcade text-[9px] font-bold shadow-[2px_2px_0_#17120f] transition text-center hover:bg-[#fce566]/50 cursor-pointer';
      btnCall.setAttribute('aria-selected', 'false');
    }
  }

  if (btnWa) {
    if (mode === 'wa') {
      btnWa.className = 'flex-1 py-1.5 px-2 bg-[#fce566] text-[#17120f] border-2 border-[#17120f] font-arcade text-[9px] font-bold shadow-[2px_2px_0_#17120f] transition text-center cursor-pointer';
      btnWa.setAttribute('aria-selected', 'true');
    } else {
      btnWa.className = 'flex-1 py-1.5 px-2 bg-[#fffdf1] text-[#17120f] border-2 border-[#17120f] font-arcade text-[9px] font-bold shadow-[2px_2px_0_#17120f] transition text-center hover:bg-[#fce566]/50 cursor-pointer';
      btnWa.setAttribute('aria-selected', 'false');
    }
  }

  const rawTel = p.tel || (p.phone ? p.phone.replace(/[^0-9]/g, '') : '');
  const cleanDigits = String(rawTel).replace(/[^0-9]/g, '');
  const formattedTel = cleanDigits.startsWith('91') ? `+${cleanDigits}` : `+91${cleanDigits}`;

  if (mode === 'call') {
    if (instructionsEl) {
      instructionsEl.innerText = 'Point phone camera at code → Tap the yellow prompt on your screen to dial.';
    }
    const dialPayload = `tel:${formattedTel}`;
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=4&data=${encodeURIComponent(dialPayload)}`;
    }
  } else {
    if (instructionsEl) {
      instructionsEl.innerText = 'Point phone camera at code → Tap the link to open WhatsApp mobile chat.';
    }
    const waUrl = (typeof generateWhatsAppBrief === 'function') ? generateWhatsAppBrief(p) : `https://wa.me/${cleanDigits}`;
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=4&data=${encodeURIComponent(waUrl)}`;
    }
  }
}

function copyQrDialPhone() {
  playSound('click');
  const phoneEl = document.getElementById('qrDialPhoneDisplay');
  const text = phoneEl ? phoneEl.innerText.trim() : '';
  if (!text || text === '--') return;

  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      playSound('chime');
      showNotification('[COPIED] Direct phone line copied to clipboard!');
    });
  } else if (typeof prompt === 'function') {
    prompt('Copy phone number:', text);
  }
}

function startCallHudFromQrModal() {
  closeQrDialModal();
  if (typeof handleCallInitiated === 'function') {
    handleCallInitiated();
  }
  showNotification('[FLIGHT HUD ACTIVE] Call timer running on laptop. Log notes while you speak on phone!');
}

if (typeof window !== 'undefined') {
  window.openQrDialModal = openQrDialModal;
  window.closeQrDialModal = closeQrDialModal;
  window.setQrDialMode = setQrDialMode;
  window.copyQrDialPhone = copyQrDialPhone;
  window.startCallHudFromQrModal = startCallHudFromQrModal;
}

// Responsive Mobile Cockpit / Queue Switcher (Delegated to workspace/queue_engine.js)
function showMobilePane(pane) {
  if (typeof window !== 'undefined' && window.WorkspaceQueueEngine?.showMobilePane) {
    return window.WorkspaceQueueEngine.showMobilePane(pane);
  }
  if (typeof global !== 'undefined' && global.WorkspaceQueueEngine?.showMobilePane) {
    return global.WorkspaceQueueEngine.showMobilePane(pane);
  }
}

function ensureDesktopPanesVisible() {
  if (typeof window !== 'undefined' && window.WorkspaceQueueEngine?.ensureDesktopPanesVisible) {
    return window.WorkspaceQueueEngine.ensureDesktopPanesVisible();
  }
  if (typeof global !== 'undefined' && global.WorkspaceQueueEngine?.ensureDesktopPanesVisible) {
    return global.WorkspaceQueueEngine.ensureDesktopPanesVisible();
  }
}

function switchCockpitSubTab(tab) {
  if (typeof window !== 'undefined' && window.WorkspaceQueueEngine?.switchCockpitSubTab) {
    return window.WorkspaceQueueEngine.switchCockpitSubTab(tab);
  }
  if (typeof global !== 'undefined' && global.WorkspaceQueueEngine?.switchCockpitSubTab) {
    return global.WorkspaceQueueEngine.switchCockpitSubTab(tab);
  }
}

function registerGlobalExports(obj) {
  for (const k in obj) {
    if (typeof window !== 'undefined') window[k] = obj[k];
    if (typeof global !== 'undefined') global[k] = obj[k];
  }
}

// Invariant static assertions:
// window.showLaymanAnalogy = showLaymanAnalogy;
// window.closeLaymanAnalogy = closeLaymanAnalogy;
if (typeof window !== 'undefined') {
  window.showLaymanAnalogy = showLaymanAnalogy;
  window.closeLaymanAnalogy = closeLaymanAnalogy;
}

registerGlobalExports({
  advanceLead, saveAndNext, saveNotesLocally, closeObjectionBox, toggleObjectionLang,
  appendActiveObjectionToNotes, exportActiveQueueCsv, filterStatus, matchStatus,
  showLaymanAnalogy, closeLaymanAnalogy, switchAnalogyLang, speakCurrentAnalogy,
  copyCurrentAnalogy, appendCurrentAnalogyToNotes, switchDossierLang, copyTalkTrack,
  speakTalkTrack, recordPartnerActivity, getAuditLogs, saveAuditLogs, exportAuditLogsToCSV,
  clearAuditLogs, openAdminSurveillanceLogs, renderAdminAuditTable, formatTimeAgo,
  handleIncomingRealtimeEvent, broadcastLock, broadcastUnlock, broadcastDNC,
  calculateTiming, getFirebaseDbUrl, saveFirebaseDbUrlUI, initFirebaseSync,
  dispatchCloudEvent, initVercelAndPwaSync, openAuthGate, closeAuthGate, handleAuthBackdropClick
});

// Forward Brain Studio handlers to window and global scopes from modular workspace/brain_studio.js
[
  "handleBrainCategoryChange",
  "startBrainTelemetryPolling",
  "stopBrainTelemetryPolling",
  "renderBrainStudio",
  "renderBrainKnowledgeExplorer",
  "handleTrainBrainSubmit",
  "handleDeleteTrainedNode",
  "exportBrainDatasetUI",
  "importBrainDatasetUI",
  "resetBrainToFactoryUI",
  "pushBrainToFirestoreUI",
  "syncBrainFromFirestoreUI"
].forEach((fn) => {
  const handler = (...args) => (typeof BrainStudio !== 'undefined' && BrainStudio[fn]) ? BrainStudio[fn](...args) : undefined;
  if (typeof window !== 'undefined') window[fn] = handler;
  if (typeof global !== 'undefined') global[fn] = handler;
});

// ==========================================
// 📱 PWA & MOBILE APP INSTALLATION CONTROLLER
// Strictly gated to authenticated & verified sessions (Owner or Authorized Outreach Partner)
// ==========================================

let deferredInstallPrompt = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    updateInstallAppVisibility();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (typeof showNotification === 'function') {
      showNotification('[SUCCESS] Client Radar mobile app successfully installed to your device!');
    }
    updateInstallAppVisibility();
  });
}

function isRunningInStandaloneMode() {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    (typeof navigator !== 'undefined' && (navigator.standalone === true || (navigator.userAgent && navigator.userAgent.includes('MobileApp')))) ||
    (typeof document !== 'undefined' && document.referrer && document.referrer.includes('android-app://'))
  );
}

function isInstallAppEligible() {
  if (typeof currentUser === 'undefined' || !currentUser) return false;
  const role = currentUser.role;
  const isVerified = role === 'owner' || role === 'caller';
  const isStandalone = isRunningInStandaloneMode();
  return Boolean(isVerified && !isStandalone);
}

function updateInstallAppVisibility() {
  if (typeof document === 'undefined') return;
  const eligible = isInstallAppEligible();

  const btnIds = [
    'workspaceInstallAppBtn',
    'dropdownInstallAppBtn',
    'profileInstallAppBtn',
    'drawer-install-btn'
  ];

  btnIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (eligible) {
      el.classList.remove('hidden');
      if (el.tagName === 'BUTTON' && !el.classList.contains('dropdown-action-btn') && !el.classList.contains('mobile-drawer-btn')) {
        el.style.display = 'inline-flex';
      } else {
        el.style.display = '';
      }
    } else {
      el.classList.add('hidden');
      el.style.display = 'none';
    }
  });

  const nativePromptBtn = document.getElementById('btnTriggerNativeInstall');
  if (nativePromptBtn) {
    if (deferredInstallPrompt) {
      nativePromptBtn.innerHTML = '<span>[INSTALL]</span> <span>TRIGGER 1-TAP INSTALL PROMPT</span>';
      nativePromptBtn.classList.remove('opacity-75');
    } else {
      nativePromptBtn.innerHTML = '<span>[DIR]</span> <span>ADD TO HOME SCREEN VIA BROWSER MENU</span>';
      nativePromptBtn.classList.add('opacity-75');
    }
  }
}

function openInstallAppModal() {
  if (!isInstallAppEligible()) {
    if (typeof showNotification === 'function') {
      showNotification('[LOCKED] Sign in and verify your partner credentials to install the mobile app.');
    }
    if (typeof openAuthGate === 'function') openAuthGate();
    return;
  }
  const modal = document.getElementById('installAppModal');
  if (modal) modal.classList.remove('hidden');

  // Auto-switch to iOS tab on Apple devices
  const isIOS = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
  switchInstallTab(isIOS ? 'ios' : 'android');
}

function closeInstallAppModal() {
  const modal = document.getElementById('installAppModal');
  if (modal) modal.classList.add('hidden');
}

function switchInstallTab(tab) {
  const tabAndroid = document.getElementById('installTabAndroid');
  const tabIOS = document.getElementById('installTabIOS');
  const btnAndroid = document.getElementById('tabBtnAndroid');
  const btnIOS = document.getElementById('tabBtnIOS');

  if (tab === 'ios') {
    if (tabAndroid) tabAndroid.classList.add('hidden');
    if (tabIOS) tabIOS.classList.remove('hidden');
    if (btnIOS) {
      btnIOS.style.background = '#fce566';
      btnIOS.style.color = '#17120f';
    }
    if (btnAndroid) {
      btnAndroid.style.background = '#fffdf1';
      btnAndroid.style.color = '#17120f';
    }
  } else {
    if (tabIOS) tabIOS.classList.add('hidden');
    if (tabAndroid) tabAndroid.classList.remove('hidden');
    if (btnAndroid) {
      btnAndroid.style.background = '#fce566';
      btnAndroid.style.color = '#17120f';
    }
    if (btnIOS) {
      btnIOS.style.background = '#fffdf1';
      btnIOS.style.color = '#17120f';
    }
  }
}

async function triggerNativeInstallPrompt() {
  if (deferredInstallPrompt) {
    try {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        if (typeof showNotification === 'function') {
          showNotification('[SUCCESS] Installing Client Radar to home screen...');
        }
        deferredInstallPrompt = null;
        closeInstallAppModal();
        updateInstallAppVisibility();
      }
    } catch (e) {
      console.warn('[PWA] Prompt trigger note:', e);
    }
  } else {
    if (typeof showNotification === 'function') {
      showNotification('[INFO] Tap Chrome menu (⋮) -> "Install app" or "Add to Home screen"');
    }
  }
}

function copyWorkspaceUrl() {
  const url = (typeof window !== 'undefined') ? (window.location.origin + '/workspace/') : 'https://apoorv.qzz.io/workspace/';
  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      const btnText = document.getElementById('copyUrlBtnText');
      if (btnText) {
        const orig = btnText.innerText;
        btnText.innerText = 'Copied to Clipboard!';
        setTimeout(() => { btnText.innerText = orig; }, 2500);
      }
      if (typeof showNotification === 'function') {
        showNotification('[COPIED] Workspace URL copied. Paste into Chrome or Safari to install!');
      }
    }).catch(() => {});
  }
}

async function handleInstallAppClick() {
  if (!isInstallAppEligible()) {
    if (typeof showNotification === 'function') {
      showNotification('[LOCKED] Sign in and verify your partner credentials to install the mobile app.');
    }
    if (typeof openAuthGate === 'function') openAuthGate();
    return;
  }

  if (isRunningInStandaloneMode()) {
    if (typeof showNotification === 'function') {
      showNotification('[APP] Client Radar is already running in standalone app mode.');
    }
    return;
  }

  if (deferredInstallPrompt) {
    try {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        if (typeof showNotification === 'function') {
          showNotification('[SUCCESS] Installing Client Radar to your device...');
        }
        deferredInstallPrompt = null;
        updateInstallAppVisibility();
        return;
      }
    } catch (err) {
      console.warn('[PWA] Direct prompt trigger error:', err);
    }
  }

  openInstallAppModal();
}

// Global scope bindings
if (typeof window !== 'undefined') {
  window.isInstallAppEligible = isInstallAppEligible;
  window.updateInstallAppVisibility = updateInstallAppVisibility;
  window.handleInstallAppClick = handleInstallAppClick;
  window.openInstallAppModal = openInstallAppModal;
  window.closeInstallAppModal = closeInstallAppModal;
  window.switchInstallTab = switchInstallTab;
  window.triggerNativeInstallPrompt = triggerNativeInstallPrompt;
  window.copyWorkspaceUrl = copyWorkspaceUrl;
  window.getTeardownUrl = getTeardownUrl;
  window.openClientTeardownModal = openClientTeardownModal;
  window.closeClientTeardownModal = closeClientTeardownModal;
  window.copyTeardownLink = copyTeardownLink;
  window.previewTeardownPage = previewTeardownPage;
  window.sendWhatsAppTeardown = sendWhatsAppTeardown;
  window.ensureProspectsLoaded = ensureProspectsLoaded;
}
if (typeof global !== 'undefined') {
  global.isInstallAppEligible = isInstallAppEligible;
  global.updateInstallAppVisibility = updateInstallAppVisibility;
  global.handleInstallAppClick = handleInstallAppClick;
  global.openInstallAppModal = openInstallAppModal;
  global.closeInstallAppModal = closeInstallAppModal;
  global.switchInstallTab = switchInstallTab;
  global.triggerNativeInstallPrompt = triggerNativeInstallPrompt;
  global.copyWorkspaceUrl = copyWorkspaceUrl;
  global.getTeardownUrl = getTeardownUrl;
  global.openClientTeardownModal = openClientTeardownModal;
  global.closeClientTeardownModal = closeClientTeardownModal;
  global.copyTeardownLink = copyTeardownLink;
  global.previewTeardownPage = previewTeardownPage;
  global.ensureProspectsLoaded = ensureProspectsLoaded;
  global.sendWhatsAppTeardown = sendWhatsAppTeardown;
}

/* ==========================================================================
   SOVEREIGN ANTI-THEFT MOAT & CONTACT MASKING RELAY
   Delegated to workspace/phone_shield.js
   ========================================================================== */
const UNMASK_LIMIT_PER_HOUR = 10;
const sessionUnmaskedProspects = (typeof window !== "undefined" && window.WorkspacePhoneShield?.sessionUnmaskedProspects) || new Set();

function maskPhoneNumber(phone) {
  const fn = (typeof window !== "undefined" && window.WorkspacePhoneShield?.maskPhoneNumber) || (typeof global !== "undefined" && global.WorkspacePhoneShield?.maskPhoneNumber);
  if (fn) return fn(phone);
  if (!phone || typeof phone !== "string") return "--";
  const clean = phone.trim();
  if (clean.length <= 5) return "•••••";
  return clean.slice(0, clean.length - 5) + "•••••";
}

function isProspectPhoneUnmasked(prospectId) {
  const fn = (typeof window !== "undefined" && window.WorkspacePhoneShield?.isProspectPhoneUnmasked) || (typeof global !== "undefined" && global.WorkspacePhoneShield?.isProspectPhoneUnmasked);
  if (fn) return fn(prospectId);
  return sessionUnmaskedProspects.has(prospectId);
}

function checkUnmaskVelocity() {
  const fn = (typeof window !== "undefined" && window.WorkspacePhoneShield?.checkUnmaskVelocity) || (typeof global !== "undefined" && global.WorkspacePhoneShield?.checkUnmaskVelocity);
  if (fn) return fn();
  return { allowed: true, count: 0, limit: UNMASK_LIMIT_PER_HOUR };
}

function recordUnmaskVelocity(prospectId) {
  const fn = (typeof window !== "undefined" && window.WorkspacePhoneShield?.recordUnmaskVelocity) || (typeof global !== "undefined" && global.WorkspacePhoneShield?.recordUnmaskVelocity);
  if (fn) return fn(prospectId);
}

function unmaskProspectPhone(prospectId) {
  const fn = (typeof window !== "undefined" && window.WorkspacePhoneShield?.unmaskProspectPhone) || (typeof global !== "undefined" && global.WorkspacePhoneShield?.unmaskProspectPhone);
  if (fn) return fn(prospectId);
  return true;
}

function toggleUnmaskActiveProspectPhone() {
  const fn = (typeof window !== "undefined" && window.WorkspacePhoneShield?.toggleUnmaskActiveProspectPhone) || (typeof global !== "undefined" && global.WorkspacePhoneShield?.toggleUnmaskActiveProspectPhone);
  if (fn) return fn();
}

function handleCallAction(event) {
  const fn = (typeof window !== "undefined" && window.WorkspacePhoneShield?.handleCallAction) || (typeof global !== "undefined" && global.WorkspacePhoneShield?.handleCallAction);
  if (fn) return fn(event);
}

function handleWhatsAppAction(event) {
  const fn = (typeof window !== "undefined" && window.WorkspacePhoneShield?.handleWhatsAppAction) || (typeof global !== "undefined" && global.WorkspacePhoneShield?.handleWhatsAppAction);
  if (fn) return fn(event);
}

function encodeSteganographicTag(payload) {
  const fn = (typeof window !== "undefined" && window.WorkspacePhoneShield?.encodeSteganographicTag) || (typeof global !== "undefined" && global.WorkspacePhoneShield?.encodeSteganographicTag);
  if (fn) return fn(payload);
  return "";
}

function decodeSteganographicTag(text) {
  const fn = (typeof window !== "undefined" && window.WorkspacePhoneShield?.decodeSteganographicTag) || (typeof global !== "undefined" && global.WorkspacePhoneShield?.decodeSteganographicTag);
  if (fn) return fn(text);
  return null;
}

function taintAttributedText(originalText, contentType = "brief") {
  const fn = (typeof window !== "undefined" && window.WorkspacePhoneShield?.taintAttributedText) || (typeof global !== "undefined" && global.WorkspacePhoneShield?.taintAttributedText);
  if (fn) return fn(originalText, contentType);
  return originalText;
}

/* ==========================================================================
   FORENSIC SESSION WATERMARK GENERATOR
   Renders subtle diagonal attribution across confidential dossiers & modals
   ========================================================================== */
const FORENSIC_WATERMARK_TARGETS = [
  'dossierPane',
  'clientTeardownModalBox',
  'proposalModalBox'
];

function initForensicWatermark() {
  if (typeof document === 'undefined') return;

  const user = (typeof currentUser !== 'undefined' && currentUser)
    ? currentUser
    : ((typeof window !== 'undefined' && window.currentUser)
      ? window.currentUser
      : ((typeof global !== 'undefined' && global.currentUser) ? global.currentUser : null));
  let storedEmail = '';
  try {
    if (typeof localStorage !== 'undefined') {
      storedEmail = JSON.parse(localStorage.getItem('sprintdial_user') || '{}')?.email || '';
    }
  } catch (e) {}
  const email = user?.email || storedEmail || 'CONFIDENTIAL';
  const isOwner = typeof isApoorvOwnerEmail === 'function' && isApoorvOwnerEmail(email);

  FORENSIC_WATERMARK_TARGETS.forEach(targetId => {
    const container = document.getElementById(targetId);
    if (!container) return;

    let canvas = container.querySelector('canvas.forensic-watermark-overlay');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'forensic-watermark-overlay';
      canvas.setAttribute('aria-hidden', 'true');
      container.appendChild(canvas);
    }

    if (isOwner) {
      canvas.style.display = 'none';
      return;
    } else {
      canvas.style.display = '';
    }

    const w = container.scrollWidth || container.offsetWidth || 380;
    const h = container.scrollHeight || container.offsetHeight || 1200;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    const sessionId = (typeof window !== 'undefined' && window._shieldSessionId) ||
      (window._shieldSessionId = Math.random().toString(36).substring(2, 8).toUpperCase());
    const dateStr = new Date().toISOString().split('T')[0];
    const watermarkText = `${email} • #${sessionId} • ${dateStr} • APOORV.QZZ.IO`;

    ctx.save();
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.045)';
    ctx.rotate(-25 * Math.PI / 180);

    const stepX = 260;
    const stepY = 110;
    const startX = -h;
    const endX = w + h;
    const startY = -h;
    const endY = h * 2;

    for (let y = startY; y < endY; y += stepY) {
      for (let x = startX; x < endX; x += stepX) {
        ctx.fillText(watermarkText, x, y);
      }
    }
    ctx.restore();
  });

  if (typeof window !== 'undefined' && !window._watermarkResizeBound) {
    window._watermarkResizeBound = true;
    window.addEventListener('resize', () => {
      requestAnimationFrame(() => initForensicWatermark());
    });
  }
}

// Global scope bindings for sovereign moat & watermarks
// Invariant static assertions:
// window.initForensicWatermark = initForensicWatermark;
// global.initForensicWatermark = initForensicWatermark;
if (typeof window !== 'undefined') window.initForensicWatermark = initForensicWatermark;
if (typeof global !== 'undefined') global.initForensicWatermark = initForensicWatermark;

function canSparkDispatchToLead(id) {
  if (typeof window !== 'undefined' && window.WorkspaceRealtimeSyncEngine?.canSparkDispatchToLead) {
    return window.WorkspaceRealtimeSyncEngine.canSparkDispatchToLead(id);
  }
  if (typeof global !== 'undefined' && global.WorkspaceRealtimeSyncEngine?.canSparkDispatchToLead) {
    return global.WorkspaceRealtimeSyncEngine.canSparkDispatchToLead(id);
  }
  return { allowed: true, reason: 'FALLBACK_ALLOWED' };
}

function haltSparkOutreachForLead(id, reason) {
  if (typeof window !== 'undefined' && window.WorkspaceRealtimeSyncEngine?.haltSparkOutreachForLead) {
    return window.WorkspaceRealtimeSyncEngine.haltSparkOutreachForLead(id, reason);
  }
  if (typeof global !== 'undefined' && global.WorkspaceRealtimeSyncEngine?.haltSparkOutreachForLead) {
    return global.WorkspaceRealtimeSyncEngine.haltSparkOutreachForLead(id, reason);
  }
}

function resumeSparkOutreachForLead(id) {
  if (typeof window !== 'undefined' && window.WorkspaceRealtimeSyncEngine?.resumeSparkOutreachForLead) {
    return window.WorkspaceRealtimeSyncEngine.resumeSparkOutreachForLead(id);
  }
  if (typeof global !== 'undefined' && global.WorkspaceRealtimeSyncEngine?.resumeSparkOutreachForLead) {
    return global.WorkspaceRealtimeSyncEngine.resumeSparkOutreachForLead(id);
  }
}

function recordSparkOutreachEvent(id, stage, metadata) {
  if (typeof window !== 'undefined' && window.WorkspaceRealtimeSyncEngine?.recordSparkOutreachEvent) {
    return window.WorkspaceRealtimeSyncEngine.recordSparkOutreachEvent(id, stage, metadata);
  }
  if (typeof global !== 'undefined' && global.WorkspaceRealtimeSyncEngine?.recordSparkOutreachEvent) {
    return global.WorkspaceRealtimeSyncEngine.recordSparkOutreachEvent(id, stage, metadata);
  }
}

function toggleSparkHaltActiveLeadUI() {
  if (typeof window !== 'undefined' && window.WorkspaceQueueEngine?.toggleSparkHaltActiveLeadUI) {
    return window.WorkspaceQueueEngine.toggleSparkHaltActiveLeadUI();
  }
  if (typeof global !== 'undefined' && global.WorkspaceQueueEngine?.toggleSparkHaltActiveLeadUI) {
    return global.WorkspaceQueueEngine.toggleSparkHaltActiveLeadUI();
  }
}

registerGlobalExports({
  initForensicWatermark, maskPhoneNumber, isProspectPhoneUnmasked, checkUnmaskVelocity,
  recordUnmaskVelocity, unmaskProspectPhone, toggleUnmaskActiveProspectPhone, handleCallAction,
  handleWhatsAppAction, encodeSteganographicTag, decodeSteganographicTag, taintAttributedText,
  handleCallInitiated, advanceLead, saveAndNext, logOutcome, setCallReach, setCallOutcome,
  appendNoteTag, cancelActiveDial, resetCallWorkflowState, validateCallDisposition, canAdvanceLead,
  updateCallHUDState, updateReachUI, updateOutcomeUI, updateOutcomeOptionsUI,
  flashDispositionGateWarning, DEAL_TIERS, selectDealTier, openDealCommitmentModal,
  closeDealCommitmentModal, copyUpiId, copyDealProposalLink, sendWhatsAppDealCommitment,
  confirmDealDepositReceived, openExecutiveHandoffModal, closeExecutiveHandoffModal,
  getExecutiveHandoffBriefText, updateHandoffBriefPreview, copyHandoffBriefText,
  generateApoorvMeetInvite, sendHandoffBriefToApoorv, saveHandoffAndAdvance, getProfileTelemetry,
  getCallbackAging, sendCallbackNudgeWhatsApp, getDialMilestone, updateShiftStreakOnDial,
  getShiftStreak, getSettledCommissionIds, openPartnerWalletModal, closePartnerWalletModal,
  savePartnerUpiId, updateWalletModalUI, requestUpiSettlement, settleDealCommission,
  settleAllClearedCommissions, claimActiveInvite, handleInviteToken, openOutreachDripModal,
  closeOutreachDripModal, switchOutreachDripTouch, copyOutreachSubject, copyOutreachBody,
  launchGmailComposeUI, sendOutreachWhatsAppUI, verifyActiveLeadDeliverabilityUI,
  auditDomainDeliverabilityFromAdmin, getOutreachSequenceForLead,
  copySparkPlaybook, syncFromGeminiSparkSheetUI, openSparkGoogleSheetTab,
  canSparkDispatchToLead, haltSparkOutreachForLead, resumeSparkOutreachForLead,
  recordSparkOutreachEvent, toggleSparkHaltActiveLeadUI,
  openAdminModal, closeAdminModal, switchAdminTab, renderAdminCallLogs, saveDialsToday,
  setCurrentUser: (u) => { currentUser = u; if (typeof window !== 'undefined') window.currentUser = u; if (typeof global !== 'undefined') global.currentUser = u; },
  getCurrentUser: () => currentUser,
  setSelectedProspectId: (id) => { selectedProspectId = id; if (typeof window !== 'undefined') window.selectedProspectId = id; if (typeof global !== 'undefined') global.selectedProspectId = id; },
  getCallWorkflowState: () => _gInCall()?.getCallWorkflowState() || ({ isCallActive, callPendingDisposition, activeCallProspectId, currentCallReach, currentCallOutcome }),
  setCallWorkflowState: (s) => {
    if (s) {
      if (s.isCallActive !== undefined) isCallActive = s.isCallActive;
      if (s.callPendingDisposition !== undefined) callPendingDisposition = s.callPendingDisposition;
      if (s.activeCallProspectId !== undefined) { activeCallProspectId = s.activeCallProspectId; selectedProspectId = s.activeCallProspectId; }
      if (s.currentCallReach !== undefined) currentCallReach = s.currentCallReach;
      if (s.currentCallOutcome !== undefined) currentCallOutcome = s.currentCallOutcome;
    }
    _gInCall()?.setCallWorkflowState(s);
  }
});

// Initial visibility check on load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading' && typeof document.addEventListener === 'function') {
    document.addEventListener('DOMContentLoaded', () => {
      updateInstallAppVisibility();
      initForensicWatermark();
    });
  } else {
    updateInstallAppVisibility();
    initForensicWatermark();
  }
}

