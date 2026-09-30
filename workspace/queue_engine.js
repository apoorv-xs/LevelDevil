// Client Radar — 60 FPS Prospect Queue Engine, Real-Time Filtering & Lead Dossier Presentation (Subsystem 12 & 14)
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

  function setSelectedId(id) {
    if (typeof root.setSelectedProspectId === 'function') root.setSelectedProspectId(id);
    root.selectedProspectId = id;
    if (typeof global !== 'undefined') global.selectedProspectId = id;
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

  function isOwnerUser(u) {
    if (typeof root.isOwnerUser === "function") return root.isOwnerUser(u);
    if (typeof global !== "undefined" && typeof global.isOwnerUser === "function") return global.isOwnerUser(u);
    if (!u) return false;
    return u.role === "owner" || isApoorvOwnerEmailHelper(u.email);
  }

  function isOwnerUserHelper(u) {
    return isOwnerUser(u);
  }

  function playSFX(type) {
    if (typeof root.playSound === 'function') root.playSound(type);
    else if (typeof global !== 'undefined' && typeof global.playSound === 'function') global.playSound(type);
  }

  function notify(msg) {
    if (typeof root.showNotification === 'function') root.showNotification(msg);
    else if (typeof global !== 'undefined' && typeof global.showNotification === 'function') global.showNotification(msg);
  }

  function isLeadBookmarkedHelper(id) {
    if (typeof root.isLeadBookmarked === 'function') return root.isLeadBookmarked(id);
    if (typeof global !== 'undefined' && typeof global.isLeadBookmarked === 'function') return global.isLeadBookmarked(id);
    return false;
  }

  function updateBookmarkButtonUIHelper(id) {
    if (typeof root.updateBookmarkButtonUI === 'function') return root.updateBookmarkButtonUI(id);
    if (typeof global !== 'undefined' && typeof global.updateBookmarkButtonUI === 'function') return global.updateBookmarkButtonUI(id);
  }

  function calculateTimingHelper(cat) {
    if (typeof root.calculateTiming === 'function') return root.calculateTiming(cat);
    if (typeof global !== 'undefined' && typeof global.calculateTiming === 'function') return global.calculateTiming(cat);
    return { text: "Peak Hours: 11:00 AM - 1:30 PM", cls: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40" };
  }

  function recordPartnerActivityHelper(type, id, details) {
    if (typeof root.recordPartnerActivity === 'function') return root.recordPartnerActivity(type, id, details);
    if (typeof global !== 'undefined' && typeof global.recordPartnerActivity === 'function') return global.recordPartnerActivity(type, id, details);
  }

  function updateScriptUIHelper(p) {
    if (typeof root.updateScriptUI === 'function') return root.updateScriptUI(p);
    if (typeof global !== 'undefined' && typeof global.updateScriptUI === 'function') return global.updateScriptUI(p);
  }

  function updateCallHUDStateHelper() {
    if (typeof root.updateCallHUDState === 'function') return root.updateCallHUDState();
    if (typeof global !== 'undefined' && typeof global.updateCallHUDState === 'function') return global.updateCallHUDState();
  }

  function isProspectPhoneUnmaskedHelper(id) {
    if (typeof root.isProspectPhoneUnmasked === 'function') return root.isProspectPhoneUnmasked(id);
    if (typeof global !== 'undefined' && typeof global.isProspectPhoneUnmasked === 'function') return global.isProspectPhoneUnmasked(id);
    return false;
  }

  function maskPhoneNumberHelper(phone) {
    if (typeof root.maskPhoneNumber === 'function') return root.maskPhoneNumber(phone);
    if (typeof global !== 'undefined' && typeof global.maskPhoneNumber === 'function') return global.maskPhoneNumber(phone);
    return phone;
  }

  function saveNotesLocallyHelper() {
    if (typeof root.saveNotesLocally === 'function') return root.saveNotesLocally();
    if (typeof global !== 'undefined' && typeof global.saveNotesLocally === 'function') return global.saveNotesLocally();
  }

  function handleCallInitiatedHelper() {
    if (typeof root.handleCallInitiated === 'function') return root.handleCallInitiated();
    if (typeof global !== 'undefined' && typeof global.handleCallInitiated === 'function') return global.handleCallInitiated();
  }

  function handleCallActionHelper(e) {
    if (typeof root.handleCallAction === 'function') return root.handleCallAction(e);
    if (typeof global !== 'undefined' && typeof global.handleCallAction === 'function') return global.handleCallAction(e);
  }

  function handleWhatsAppActionHelper(e) {
    if (typeof root.handleWhatsAppAction === 'function') return root.handleWhatsAppAction(e);
    if (typeof global !== 'undefined' && typeof global.handleWhatsAppAction === 'function') return global.handleWhatsAppAction(e);
  }

  function showMobilePaneHelper(pane) {
    if (typeof root.showMobilePane === 'function') return root.showMobilePane(pane);
    if (typeof global !== 'undefined' && typeof global.showMobilePane === 'function') return global.showMobilePane(pane);
  }

  function resetCallWorkflowStateHelper() {
    if (typeof root.resetCallWorkflowState === 'function') return root.resetCallWorkflowState();
    if (typeof global !== 'undefined' && typeof global.resetCallWorkflowState === 'function') return global.resetCallWorkflowState();
  }

  function flashDispositionGateWarningHelper(msg) {
    if (typeof root.flashDispositionGateWarning === 'function') return root.flashDispositionGateWarning(msg);
    if (typeof global !== 'undefined' && typeof global.flashDispositionGateWarning === 'function') return global.flashDispositionGateWarning(msg);
  }

  function validateCallDispositionHelper() {
    if (typeof root.validateCallDisposition === 'function') return root.validateCallDisposition();
    if (typeof global !== 'undefined' && typeof global.validateCallDisposition === 'function') return global.validateCallDisposition();
    return false;
  }

  function canAdvanceLeadHelper() {
    if (typeof root.canAdvanceLead === 'function') return root.canAdvanceLead();
    if (typeof global !== 'undefined' && typeof global.canAdvanceLead === 'function') return global.canAdvanceLead();
    return true;
  }

  // Active Queue State
  let activeStatusFilter = 'all';
  let activeCityFilter = 'All';
  let searchQuery = '';
  let selectedProspectId = 'p-1';

function calculateUpgradeFee(techStack, lcpTime, flaws, category) {
  let base = 50000;
  const lcpNum = parseFloat((lcpTime || '').replace(/[^0-9.]/g, '')) || 4.2;
  const stack = (techStack || '').toLowerCase();
  const flawList = Array.isArray(flaws) ? flaws.join(' ').toLowerCase() : '';
  const cat = (category || '').toLowerCase();

  // Severe LCP Bottlenecks (> 4.5s) require full headless refactor (+₹15,000)
  if (lcpNum >= 4.5) base += 15000;

  // Heavy CMS Drag (Elementor, Divi, Wix bloated runtimes) (+₹15,000)
  if (stack.includes('elementor') || stack.includes('divi') || stack.includes('wix')) {
    base += 15000;
  }

  // 3D / WebGL / Spatial Interactive Showcase Scope (+₹25,000)
  if (flawList.includes('3d') || flawList.includes('webgl') || flawList.includes('visualizer') || cat === 'design') {
    base += 25000;
  }

  // Direct Booking Engine / Aggregator Disintermediation (Practo/Zomato/Fresha) (+₹20,000)
  if (flawList.includes('crm') || flawList.includes('booking') || flawList.includes('intake') || flawList.includes('reservation') || cat === 'clinic' || cat === 'restaurant') {
    base += 20000;
  }

  const finalFee = Math.min(125000, Math.max(50000, base));
  return `₹${finalFee.toLocaleString('en-IN')}`;
}

// Derive Baseless Subscriptions and Caller Cheat Sheet
function deriveWastedSubscriptions(category, techStack, lcpTime, city, siteUrl) {
  const cat = (category || 'clinic').toLowerCase();
  const stack = (techStack || '').toLowerCase();
  const site = (siteUrl || '').toLowerCase();
  const isNoSite = stack.includes('no owned') || site === '#' || site === '' || (lcpTime && String(lcpTime).includes('N/A'));
  const lcp = lcpTime || '4.4s';
  const lcpSec = lcp.replace(/[^0-9.]/g, '') || '4.4';
  const cityName = city || 'Kochi';

  if (isNoSite) {
    if (cat === 'clinic') {
      return {
        wastedSpend: '₹48,000/yr on Practo listings & commission bleed',
        wastedBreakdown: [
          '₹32,000/yr Practo listing & per-booking lead commissions',
          '₹10,500/yr Justdial & Sulekha shared patient inquiry packages',
          '₹5,500/yr SMS OTP & unverified receptionist callback costs'
        ],
        callerCheatSheet: {
          icebreaker: 'When patients look up your clinic on Google, are they able to book directly with you, or are they forced through Practo where your competitors are advertised?',
          laymanAnalogy: 'Having no owned website is like renting clinic space inside a competitor\'s waiting room—every patient who walks in is pitched other doctors right at your doorstep.',
          competitorEdge: `Top clinics in ${cityName} use zero-commission WhatsApp direct portals to retain 100% of patient relationships.`
        }
      };
    } else if (cat === 'salon') {
      return {
        wastedSpend: '₹44,000/yr on Fresha & marketplace commissions',
        wastedBreakdown: [
          '₹30,000/yr marketplace booking commission bleed (15-20% cut)',
          '₹8,500/yr sponsored directory visibility charges',
          '₹5,500/yr third-party reminder notifications'
        ],
        callerCheatSheet: {
          icebreaker: 'When clients look for your salon online, are they booking on your own brand page or paying fees through directories where rival salons pop up?',
          laymanAnalogy: 'Operating without an owned site is like placing your luxury salon counter inside a crowded marketplace where hawkers try to lure your clients to competitor chairs.',
          competitorEdge: `Leading studios in ${cityName} deploy direct 1-tap WhatsApp booking engines, keeping 100% of repeat bookings private.`
        }
      };
    } else if (cat === 'restaurant') {
      return {
        wastedSpend: '₹58,000/yr on aggregator listings & commission bleed',
        wastedBreakdown: [
          '₹42,000/yr aggregator commission bleed on direct delivery orders',
          '₹10,500/yr table booking marketplace commissions',
          '₹5,500/yr third-party QR menu subscription'
        ],
        callerCheatSheet: {
          icebreaker: 'When diners search for your restaurant, are you paying 20-30% aggregator commission on orders from guests who already know your brand?',
          laymanAnalogy: 'Relying solely on food delivery apps is like paying a 25% toll gate right outside your dining room door to greet guests who specifically came for your food.',
          competitorEdge: `Top dining destinations in ${cityName} take direct WhatsApp pickup & table reservations with zero aggregator commissions.`
        }
      };
    } else if (cat === 'design') {
      return {
        wastedSpend: '₹52,000/yr on Justdial & broker directory packages',
        wastedBreakdown: [
          '₹38,000/yr shared lead broker directory subscriptions',
          '₹9,000/yr marketplace listing renewal fees',
          '₹5,000/yr unbranded portfolio hosting add-ons'
        ],
        callerCheatSheet: {
          icebreaker: 'When prospective luxury homeowners search for your studio, do they find an owned portfolio or are they routed to middleman directories that sell the same lead to 5 competitors?',
          laymanAnalogy: 'Lacking an owned showcase is like pitching multi-lakh architecture projects from a shared directory pamphlet next to discount contractors.',
          competitorEdge: `Leading architecture firms in ${cityName} command high retainers by hosting interactive 3D spatial project walkthroughs on an owned domain.`
        }
      };
    } else {
      return {
        wastedSpend: '₹40,000/yr on directory listings & aggregator bleed',
        wastedBreakdown: [
          '₹26,000/yr directory listing packages & commission cuts',
          '₹8,500/yr shared lead referral service fees',
          '₹5,500/yr manual callback & admin follow-up friction'
        ],
        callerCheatSheet: {
          icebreaker: 'When customers look up your business online, do you own the customer contact directly or are you paying middlemen for shared leads?',
          laymanAnalogy: 'Operating without an owned website is like putting up your sign on a landlord\'s billboard that also advertises your three biggest competitors.',
          competitorEdge: `Modern businesses in ${cityName} deploy dedicated direct web intake portals that capture customers without middleman commissions.`
        }
      };
    }
  }

  if (cat === 'clinic') {
    return {
      wastedSpend: '₹42,000/yr on Practo & bloated plugins',
      wastedBreakdown: [
        '₹28,000/yr Practo profile listing & lead commission bleed',
        '₹8,500/yr slow shared hosting & Elementor Pro renewals',
        '₹5,500/yr SMS OTP pack for non-syncing booking form'
      ],
      callerCheatSheet: {
        icebreaker: 'How many of your monthly patient inquiries come straight from your website versus paying 15-25% to Practo?',
        laymanAnalogy: `Your website is like having a clinic door with a rusty latch taking ${lcpSec} seconds to open—patients give up and book whoever answers first on Practo.`,
        competitorEdge: `Top clinics in ${cityName} use zero-latency WhatsApp direct booking to capture patient consultations with zero aggregator commissions.`
      }
    };
  } else if (cat === 'salon') {
    return {
      wastedSpend: '₹36,000/yr on Fresha/Nearbuy commissions',
      wastedBreakdown: [
        '₹24,000/yr marketplace appointment commission bleed',
        '₹7,000/yr legacy booking widget & plugin renewals',
        '₹5,000/yr bulk promotional SMS packages'
      ],
      callerCheatSheet: {
        icebreaker: 'Are repeat clients booking appointments directly on your site, or are you paying aggregators commission every time they return?',
        laymanAnalogy: `Your mobile page loads in ${lcpSec}s—like handing a luxury client a crumpled photocopied price list; they bounce back to Instagram in 3 seconds.`,
        competitorEdge: `Premier studios convert Instagram traffic into instant 1-tap WhatsApp slot reservations without giving 20% to middleman directories.`
      }
    };
  } else if (cat === 'restaurant') {
    return {
      wastedSpend: '₹54,000/yr on Swiggy/Zomato & ordering widgets',
      wastedBreakdown: [
        '₹38,000/yr delivery & table marketplace onboarding commissions',
        '₹10,500/yr third-party PDF menu & ordering widget subscription',
        '₹5,500/yr legacy vendor hosting & SSL markups'
      ],
      callerCheatSheet: {
        icebreaker: 'When weekend diners look up your menu on mobile, can they reserve in 2 taps or do they have to download a slow PDF and end up on Zomato?',
        laymanAnalogy: `A ${lcpSec}s load time is like seating diners in the dark for 10 minutes before handing them a menu—they get up and walk to the bistro next door.`,
        competitorEdge: `Leading culinary destinations use instant mobile menus with live table reserves, keeping 100% of guest relationships in-house.`
      }
    };
  } else if (cat === 'design') {
    return {
      wastedSpend: '₹48,000/yr on Houzz Pro & directory listings',
      wastedBreakdown: [
        '₹36,000/yr Houzz Pro & Justdial directory listing subscriptions',
        '₹8,000/yr unoptimized Squarespace/Wix storage tier upgrades',
        '₹4,000/yr redundant portfolio PDF bandwidth hosting fees'
      ],
      callerCheatSheet: {
        icebreaker: 'When luxury homeowners visit your portfolio on mobile, are they seeing interactive spaces or waiting for heavy image grids to buffer?',
        laymanAnalogy: `A ${lcpSec}s wait is like inviting an HNI client to your studio and making them wait in a dim hallway while you hunt for blueprints in the back room.`,
        competitorEdge: `Award-winning architecture firms showcase 3D interactive spatial walkthroughs that immediately justify premium ₹1 Lakh+ design retainers.`
      }
    };
  } else {
    return {
      wastedSpend: '₹32,000/yr on redundant hosting & plugin packs',
      wastedBreakdown: [
        '₹18,000/yr overpriced shared hosting & annual maintenance retainer',
        '₹9,000/yr unused plugin renewals & security add-ons',
        '₹5,000/yr third-party contact form gateway subscriptions'
      ],
      callerCheatSheet: {
        icebreaker: 'Are you getting direct phone calls and inquiries from your site, or is it mainly sitting there incurring annual hosting & renewal fees?',
        laymanAnalogy: `Your mobile website takes ${lcpSec}s to open—it is like having a showroom on a prime high street but keeping the front shutter half-closed.`,
        competitorEdge: `Modern businesses run on ultra-fast headless infrastructure with zero maintenance headaches and instant WhatsApp conversion.`
      }
    };
  }
}

// Derive Passive Security & Trust Vulnerabilities (Strix-inspired zero-exploit audit)
function deriveSecurityVulnerabilities(category, techStack, siteUrl) {
  const cat = (category || 'clinic').toLowerCase();
  const stack = (techStack || '').toLowerCase();
  const site = (siteUrl || '').toLowerCase();

  const isWordPress = stack.includes('wordpress') || stack.includes('elementor') || stack.includes('divi');
  const isNoSite = stack.includes('no owned') || site === '#' || !site;

  if (isNoSite) {
    return {
      grade: '[HIGH RISK]',
      score: '15/100 (Unprotected)',
      issues: [
        'No owned SSL domain; zero patient data privacy encryption',
        'Directory aggregator hijacking customer inquiries',
        'Vulnerable to unauthorized Google Business profile impersonation'
      ],
      callerTalkingPoint: 'Because they lack an owned HTTPS domain, any competitor or aggregator can intercept patient calls with zero privacy protection.'
    };
  }

  if (isWordPress) {
    return {
      grade: '[MODERATE RISK]',
      score: '42/100 (Exposure Detected)',
      issues: [
        'Exposed /wp-json/ user enumeration and login endpoint',
        'Intake contact form has zero anti-bot rate-limiting (spam flooding)',
        'Missing HSTS and Strict Content-Security-Policy trust headers'
      ],
      callerTalkingPoint: 'Their WordPress login and patient intake form lack anti-bot security, flooding their reception desk with daily junk messages and risking trust warnings on Chrome.'
    };
  }

  return {
    grade: '[CAUTION]',
    score: '58/100 (Hygiene Flags)',
    issues: [
      'Missing strict HSTS and Content-Security-Policy headers',
      'Unprotected lead capture modal without bot CAPTCHA',
      'Potential mixed-content HTTP scripts triggering browser security warnings'
    ],
    callerTalkingPoint: 'Their customer inquiry form has no bot protection and their website lacks modern browser security certificates that Google checks for local search ranking.'
  };
}

// Option C Advanced Grading Engine (Lost Revenue Leak, DPDP Compliance, Thumb-Zone & Friction Index)
function deriveAdvancedGrading(category, techStack, lcpTime, siteUrl) {
  const cat = (category || 'clinic').toLowerCase();
  const stack = (techStack || '').toLowerCase();
  const site = (siteUrl || '').toLowerCase();
  const lcpNum = parseFloat((lcpTime || '4.4s').replace(/[^0-9.]/g, '')) || 4.4;
  const isNoSite = stack.includes('no owned') || site === '#' || !site;

  // 1. Cost-of-Delay Lost Revenue Leak (Indian Rupee monthly estimate based on ticket size & latency)
  let monthlyLeak = '₹1,80,000/mo';
  let leakNumeric = 180000;
  if (cat === 'clinic') {
    leakNumeric = Math.round((lcpNum * 42000) / 10000) * 10000;
    monthlyLeak = `₹${leakNumeric.toLocaleString('en-IN')}/mo Est. Revenue Leak`;
  } else if (cat === 'design') {
    leakNumeric = Math.round((lcpNum * 65000) / 10000) * 10000;
    monthlyLeak = `₹${leakNumeric.toLocaleString('en-IN')}/mo Est. Project Leak`;
  } else if (cat === 'restaurant') {
    leakNumeric = Math.round((lcpNum * 22000) / 10000) * 10000;
    monthlyLeak = `₹${leakNumeric.toLocaleString('en-IN')}/mo Est. Cover Leak`;
  } else if (cat === 'salon') {
    leakNumeric = Math.round((lcpNum * 18000) / 10000) * 10000;
    monthlyLeak = `₹${leakNumeric.toLocaleString('en-IN')}/mo Est. Client Leak`;
  } else {
    leakNumeric = Math.round((lcpNum * 25000) / 10000) * 10000;
    monthlyLeak = `₹${leakNumeric.toLocaleString('en-IN')}/mo Est. Revenue Leak`;
  }

  // 2. DPDP Act Compliance Grade
  let dpdp = {
    status: '■ DPDP Non-Compliant',
    risk: 'High Regulatory & Privacy Exposure',
    detail: 'Lead/intake form captures personal contact info without explicit consent checkboxes or encrypted storage policies required by DPDP Sec 4-6.'
  };
  if (isNoSite) {
    dpdp = {
      status: '■ Zero DPDP Guardrails',
      risk: 'Unshielded Patient Inquiries',
      detail: 'Aggregators and open unencrypted channels intercept patient inquiries without any data fiduciary protections.'
    };
  } else if (stack.includes('headless') || stack.includes('next') || stack.includes('tailwind')) {
    dpdp = {
      status: '● Data-Protected Baseline',
      risk: 'Compliant Architecture',
      detail: 'TLS encrypted transport with modern isolated form dispatch and consent acknowledgment.'
    };
  }

  // 3. Mobile Thumb-Zone Action Audit
  let thumbZone = {
    status: '× No Sticky Action Bar',
    detail: 'No 1-tap thumb call or WhatsApp bar at screen bottom; client must pinch-zoom or scroll to find phone number.'
  };
  if (stack.includes('headless') || stack.includes('vite')) {
    thumbZone = {
      status: '● Sticky Action Bar Active',
      detail: 'Persistent thumb-accessible call & booking bar anchored to bottom mobile viewport.'
    };
  }

  // 4. Booking Friction Index
  let bookingFriction = {
    steps: '7 Friction Steps',
    severity: '■ Severe Drop-off Risk',
    detail: 'Requires typing name, email, query, waiting for admin callback, or opening unoptimized external PDF.'
  };
  if (isNoSite) {
    bookingFriction = {
      steps: '9 Friction Steps',
      severity: '■ Maximum Friction',
      detail: 'Patient forced through aggregator directory listings, ads, and competing clinic recommendations.'
    };
  } else if (stack.includes('headless') || stack.includes('custom')) {
    bookingFriction = {
      steps: '2 Steps (Direct)',
      severity: '● Frictionless',
      detail: '1-tap WhatsApp consultation dispatch with zero intermediate forms.'
    };
  }

  // 5. Google Business Profile Reputation Bridge
  let reputationBridge = {
    status: '[ALERT] Reputation Disconnect',
    detail: 'Strong Google review ratings (4.5★+) are wasted because incoming mobile visitors encounter a slow, static website with zero live booking bridge.'
  };

  return {
    revenueLeak: monthlyLeak,
    revenueLeakNumeric: leakNumeric,
    dpdpCompliance: dpdp,
    thumbZone: thumbZone,
    bookingFriction: bookingFriction,
    reputationBridge: reputationBridge
  };
}


// Status / Disposition Filter Functions

function matchStatus(p) {
  if (!p) return false;
  if (activeStatusFilter === 'all') return true;
  if (activeStatusFilter === 'fresh') {
    return !p.status || p.status === 'ready' || p.status === 'available' || p.status === 'new';
  }
  if (activeStatusFilter === 'callbacks') {
    return p.status === 'gatekeeper_rejection' || p.status === 'connected_callback' || p.status === 'callback';
  }
  if (activeStatusFilter === 'starred') {
    return isLeadBookmarked(p.id);
  }
  if (activeStatusFilter === 'interested') {
    return p.status === 'interested' || p.status === 'discovery_booked' || p.status === 'closed_won';
  }
  return true;
}

function filterStatus(status) {
  playSound('click');
  activeStatusFilter = status;
  document.querySelectorAll('.status-tab').forEach(tab => {
    tab.classList.remove('active', 'bg-[#fce566]', 'font-bold');
    tab.classList.add('font-medium');
  });
  const map = {
    all: 'statusTabAll',
    fresh: 'statusTabFresh',
    callbacks: 'statusTabCallbacks',
    starred: 'statusTabStarred',
    interested: 'statusTabInterested'
  };
  const tabEl = document.getElementById(map[status]);
  if (tabEl) {
    tabEl.classList.add('active', 'bg-[#fce566]', 'font-bold');
    tabEl.classList.remove('font-medium');
  }
  renderQueue();
  const filtered = getGlobalProspects().filter(p => (activeCityFilter === 'All' || p.city === activeCityFilter) && matchStatus(p) && matchSearch(p));
  if (filtered.length && !filtered.some(p => p.id === selectedProspectId)) {
    selectProspect(filtered[0].id);
  }
}

// Queue & Navigation
function filterCity(city) {
  playSound('click');
  activeCityFilter = city;
  document.querySelectorAll('.city-tab').forEach(tab => {
    const text = tab.innerText.trim();
    const match = (city === 'All' && text === 'All') ||
                  (city === 'Kochi' && text === 'Kochi') ||
                  (city === 'Bangalore' && text === 'BLR') ||
                  (city === 'Hyderabad' && text === 'HYD');
    if (match) {
      tab.classList.add('active', 'bg-[#fce566]', 'font-bold');
      tab.classList.remove('font-medium');
    } else {
      tab.classList.remove('active', 'bg-[#fce566]', 'font-bold');
      tab.classList.add('font-medium');
    }
  });

  if (city === 'Kochi') setLang('ml');
  else setLang('en');

  renderQueue();
  const filtered = getGlobalProspects().filter(p => (city === 'All' || p.city === city) && matchStatus(p) && matchSearch(p));
  const firstVisible = filtered[0];
  if (firstVisible) selectProspect(firstVisible.id);
  if (typeof window !== 'undefined' && window.System1Brain) {
    window.System1Brain.onRadarFilter?.(city, searchQuery, filtered.length);
  }
}

function handleSearch(val) {
  searchQuery = val.toLowerCase();
  renderQueue();
  const filtered = getGlobalProspects().filter(p => (activeCityFilter === 'All' || p.city === activeCityFilter) && matchStatus(p) && matchSearch(p));
  if (typeof window !== 'undefined' && window.System1Brain) {
    window.System1Brain.onRadarFilter?.(activeCityFilter, val, filtered.length);
  }
}

function matchSearch(p) {
  if (!searchQuery) return true;
  const q = searchQuery.trim();
  if (!q) return true;
  return (
    (p.name || "").toLowerCase().includes(q) ||
    (p.dm || "").toLowerCase().includes(q) ||
    (p.city || "").toLowerCase().includes(q) ||
    (p.specialty || "").toLowerCase().includes(q) ||
    (p.phone || p.tel || "").toLowerCase().includes(q)
  );
}

function getCallbackAging(prospect) {
  if (!prospect) {
    return {
      elapsedHours: 0,
      isDueToday: true,
      isOverdue: false,
      isZombie: false,
      badgeText: '[DUE TODAY]',
      badgeClass: 'bg-amber-950/50 text-amber-300 border border-amber-700/50'
    };
  }
  const timestamp = prospect.updatedAt || prospect.createdAt;
  if (!timestamp) {
    return {
      elapsedHours: 0,
      isDueToday: true,
      isOverdue: false,
      isZombie: false,
      badgeText: '[DUE TODAY]',
      badgeClass: 'bg-amber-950/50 text-amber-300 border border-amber-700/50'
    };
  }
  const date = new Date(timestamp);
  const now = new Date();
  const elapsedMs = Math.max(0, now.getTime() - date.getTime());
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  if (elapsedHours >= 48) {
    return {
      elapsedHours: Math.round(elapsedHours),
      isDueToday: false,
      isOverdue: false,
      isZombie: true,
      badgeText: `[STALE // >48H] (${Math.round(elapsedHours)}h)`,
      badgeClass: 'bg-rose-950/60 text-rose-300 border border-rose-500 font-bold animate-pulse'
    };
  } else if (elapsedHours >= 24) {
    return {
      elapsedHours: Math.round(elapsedHours),
      isDueToday: false,
      isOverdue: true,
      isZombie: false,
      badgeText: `[OVERDUE] (${Math.round(elapsedHours)}h)`,
      badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500 font-bold animate-pulse'
    };
  } else {
    return {
      elapsedHours: Math.round(elapsedHours),
      isDueToday: true,
      isOverdue: false,
      isZombie: false,
      badgeText: '[DUE TODAY]',
      badgeClass: 'bg-amber-950/50 text-amber-300 border border-amber-700/50'
    };
  }
}

function renderQueue() {
  const listEl = document.getElementById('queueList');
  if (!listEl) return;
  listEl.innerHTML = '';
  let filtered = getGlobalProspects().filter(p => (activeCityFilter === 'All' || p.city === activeCityFilter) && matchStatus(p) && matchSearch(p));

  // If in callbacks tab, prioritize overdue and zombie leads at the top of the queue
  if (activeStatusFilter === 'callbacks') {
    filtered = [...filtered].sort((a, b) => {
      const agingA = getCallbackAging(a);
      const agingB = getCallbackAging(b);
      const weightA = agingA.isZombie ? 3 : (agingA.isOverdue ? 2 : 1);
      const weightB = agingB.isZombie ? 3 : (agingB.isOverdue ? 2 : 1);
      if (weightB !== weightA) return weightB - weightA;
      return agingB.elapsedHours - agingA.elapsedHours;
    });
  }

  const user = (typeof currentUser !== 'undefined' && currentUser)
    ? currentUser
    : ((typeof window !== 'undefined' && window.currentUser)
      ? window.currentUser
      : ((typeof global !== 'undefined' && global.currentUser) ? global.currentUser : null));
  const isOwner = isOwnerUser(user);

  const countBadge = document.getElementById('leadCountBadge');
  if (countBadge) {
    countBadge.innerText = isOwner ? `${filtered.length} Leads` : 'RADAR ACTIVE';
    if (isOwner) {
      countBadge.classList.add('w-[84px]');
      countBadge.classList.remove('px-2');
    } else {
      countBadge.classList.remove('w-[84px]');
      countBadge.classList.add('px-2');
    }
  }

  const mobileQueueCount = document.getElementById('mobileQueueCount');
  if (mobileQueueCount) mobileQueueCount.innerText = filtered.length;

  const mobileCountWrapper = document.getElementById('mobileQueueCountWrapper');
  if (mobileCountWrapper) {
    if (isOwner) {
      mobileCountWrapper.classList.remove('hidden');
    } else {
      mobileCountWrapper.classList.add('hidden');
    }
  }

  const btnExport = document.getElementById('btnExportQueueCsv');
  if (btnExport) {
    btnExport.style.display = isOwner ? 'inline-flex' : 'none';
  }

  filtered.forEach(p => {
    const isSelected = p.id === selectedProspectId;
    const isLocked = p.status === 'locked';
    const isBooked = p.status === 'discovery_booked';
    const isClosedWon = p.status === 'closed_won';
    const isDNC = p.status === 'blacklisted';

    const item = document.createElement('div');
    item.className = `p-3.5 cursor-pointer transition flex flex-col gap-1 border-b border-white/[0.04] ${
      isSelected ? 'bg-white/[0.08] border-l-2 border-white' : 'hover:bg-white/[0.03] border-l-2 border-transparent'
    } ${isLocked ? 'bg-rose-950/20' : ''} ${isDNC ? 'opacity-30 line-through' : ''}`;

    let badgeClass = "bg-white/5 text-gray-400 border border-white/5";
    let badgeText = "Verified";
    if (isDNC) {
      badgeClass = "bg-rose-950/40 text-rose-400 border border-rose-800 font-bold";
      badgeText = "Excluded";
    } else if (isClosedWon) {
      badgeClass = "bg-[#fce566] text-[#17120f] border border-[#17120f] font-bold font-arcade";
      badgeText = "[SOW] WON";
    } else if (isLocked) {
      badgeClass = "bg-rose-950/60 text-rose-300 border border-rose-700 font-bold animate-pulse";
      badgeText = "In Review";
    } else if (isBooked) {
      badgeClass = "bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 font-bold";
      badgeText = "Retained";
    } else if (p.status === 'gatekeeper_rejection' || p.status === 'connected_callback' || p.status === 'callback') {
      const aging = getCallbackAging(p);
      badgeClass = aging.badgeClass;
      badgeText = aging.badgeText;
    } else if (p.status !== 'available') {
      badgeClass = "bg-amber-950/50 text-amber-300 border border-amber-700/50";
      badgeText = p.status.replace('_', ' ');
    }

    const safeName = escapeHTML(p.name);
    const safeBadgeText = escapeHTML(badgeText);
    const safeDm = escapeHTML(p.dm);
    const safePtype = escapeHTML(p.ptype);
    const isBookmarked = isLeadBookmarked(p.id);

    item.innerHTML = `
      <div class="flex justify-between items-center gap-1.5">
        <span class="font-bold text-xs text-white truncate flex-1 min-w-0">${safeName}</span>
        <div class="flex items-center gap-1 shrink-0">
          ${isBookmarked ? `<span class="text-[#fce566] text-xs font-bold shrink-0 drop-shadow-[0_1px_0_#17120f]" title="Saved Prospect">★</span>` : ''}
          <span class="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded shrink-0 ${badgeClass}">${safeBadgeText}</span>
        </div>
      </div>
      <div class="flex justify-between items-center gap-2 text-[11px] text-gray-400 mt-0.5">
        <span class="truncate flex-1 min-w-0">${safeDm}</span>
        <span class="text-[7.5px] font-arcade px-1 py-0.5 bg-[#fffdf1] border border-[#17120f] shadow-[1px_1px_0_#17120f] text-[#17120f] font-bold shrink-0 uppercase tracking-wider">${safePtype}</span>
      </div>
    `;

    item.setAttribute('data-kaboom-body', 'true');
    item.onclick = () => selectProspect(p.id, true);
    listEl.appendChild(item);
  });
  window.syncDOM?.();
}

function selectProspect(id, playSoundEffect = false) {
  if (callPendingDisposition && activeCallProspectId && activeCallProspectId !== id) {
    const user = (typeof currentUser !== 'undefined' && currentUser)
      ? currentUser
      : ((typeof window !== 'undefined' && window.currentUser)
        ? window.currentUser
        : ((typeof global !== 'undefined' && global.currentUser) ? global.currentUser : null));
    const isOwner = typeof isApoorvOwnerEmail === 'function' && isApoorvOwnerEmail(user?.email);
    if (!isOwner && !validateCallDisposition()) {
      flashDispositionGateWarning("⚠️ Complete current call disposition before switching prospects.");
      return;
    }
  }
  if (playSoundEffect) {
    playSound('click');
  }
  selectedProspectId = id;
  resetCallWorkflowState();
  renderQueue();
  renderActiveProspect();
  const p = getGlobalProspects().find(item => item.id === id);
  if (p && typeof window !== 'undefined' && window.System1Brain) {
    window.System1Brain.onProspectSelect?.(p);
  }
  if (playSoundEffect && typeof window !== 'undefined' && window.innerWidth < 768) {
    showMobilePane('cockpit');
  }
  if (p && typeof recordPartnerActivity === 'function') {
    recordPartnerActivity('DOSSIER_VIEW', id, { client: p.name, city: p.city, ptype: p.ptype });
  }
}

if (typeof window !== 'undefined') {
  window.selectProspectById = selectProspect;
  window.PROSPECTS = getGlobalProspects();
}

// 1-Click WhatsApp Brief Generator (Auto-injecting custom intelligence & language routing)
function generateWhatsAppBrief(p) {
  if (!p) return '#';
  const rawPhone = p.wa || p.phone || '';
  let cleanDigits = String(rawPhone).replace(/[^0-9]/g, '');
  if (cleanDigits.length === 10) {
    cleanDigits = '91' + cleanDigits;
  }

  const advGrading = (p.revenueLeak && p.dpdpCompliance)
    ? {
        revenueLeak: p.revenueLeak,
        dpdpCompliance: p.dpdpCompliance
      }
    : ((typeof deriveAdvancedGrading === 'function')
        ? deriveAdvancedGrading(p.cat, p.techStack, p.lcpTime, p.site)
        : {});

  const wasteIntel = (p.wastedSpend && p.wastedBreakdown)
    ? {
        wastedSpend: p.wastedSpend,
        wastedBreakdown: p.wastedBreakdown
      }
    : ((typeof deriveWastedSubscriptions === 'function')
        ? deriveWastedSubscriptions(p.cat, p.techStack, p.lcpTime, p.city)
        : {});

  const cleanDm = (p.dm || 'Doctor / Owner').split('(')[0].trim();
  const cleanName = (p.name || 'Establishment').split(',')[0].trim();
  const lcp = p.lcpTime || '4.4s';
  const revenueLeak = p.revenueLeak || advGrading.revenueLeak || '₹1,80,000/mo Est. Revenue Leak';
  const wastedSpend = p.wastedSpend || wasteIntel.wastedSpend || '₹42,000/yr on aggregators & plugins';
  const fee = (typeof calculateUpgradeFee === 'function')
    ? calculateUpgradeFee(p.techStack, p.lcpTime, p.flaws, p.cat)
    : (p.fee || '₹50,000');
  const dpdpStatus = (p.dpdpCompliance && p.dpdpCompliance.status) || (advGrading.dpdpCompliance && advGrading.dpdpCompliance.status) || 'Non-Compliant (High Risk)';

  let message = '';
  if (p.city === 'Kochi') {
    // Authentic Malayalam brief (< 65 words)
    message = `നമസ്കാരം ${cleanDm}, ${cleanName}-ന്റെ വെബ്സൈറ്റ് പെർഫോമൻസിനെ കുറിച്ച് അപൂർവിന് വേണ്ടി വിളിച്ചിരുന്നു. മൊബൈലിൽ ${lcp} 4G ലേറ്റൻസിയും (${revenueLeak} നഷ്ടം), ${wastedSpend} പാഴാകുന്നതും ശ്രദ്ധയിൽപ്പെട്ടു. കൂടാതെ DPDP Act (${dpdpStatus}) കംപ്ലയൻസും ${fee} ബജറ്റിൽ നേരിട്ടുള്ള ബുക്കിംഗ് സിസ്റ്റവും ഒരുക്കാൻ അപൂർവ് തയ്യാറാക്കിയ ₹4,999 ഓഡിറ്റ് സൗജന്യമായി പങ്കുവെക്കാനാണ്. ഈ വ്യാഴാഴ്ച 10 മിനിറ്റ് സംസാരിക്കാമോ? - അപൂർവിന് വേണ്ടി.`;
  } else {
    // Professional English brief (< 60 words)
    message = `Hi ${cleanDm}, following up on our call on Apoorv's behalf regarding ${cleanName}. Apoorv noted your mobile LCP takes ${lcp} on 4G (est. ${revenueLeak} drop-off) and ${wastedSpend} aggregator bleed. Apoorv prepared an executive audit covering DPDP Act compliance (${dpdpStatus}) and direct intake portals (${fee} scope, ₹4,999 audit waived). Would Thursday 4 PM suit you for a brief 10-min walkthrough with Apoorv?`;
  }

  // Update prospect waMessage and clean wa
  p.waMessage = message;
  p.wa = cleanDigits;

  const encodedMsg = encodeURIComponent(message);
  return cleanDigits ? `https://wa.me/${cleanDigits}?text=${encodedMsg}` : `https://wa.me/?text=${encodedMsg}`;
}

if (typeof window !== 'undefined') window.generateWhatsAppBrief = generateWhatsAppBrief;
if (typeof global !== 'undefined') global.generateWhatsAppBrief = generateWhatsAppBrief;

function renderActiveProspect() {
  const p = getGlobalProspects().find(item => item.id === selectedProspectId);
  if (!p) return;

  const activeNameEl = document.getElementById('activeName');
  if (activeNameEl) activeNameEl.innerText = p.name;

  // Dynamically update review rating badge (e.g. ★ 4.8)
  const ratingEl = document.getElementById('activeRating');
  if (ratingEl) {
    ratingEl.innerText = `★ ${p.rating || '4.8'}`;
  }

  // Update real-time queue position indicator (e.g., "Lead 1 of 60" for Owner, "Account #1" for Callers)
  const filteredForPos = getGlobalProspects().filter(item => (activeCityFilter === 'All' || item.city === activeCityFilter) && matchStatus(item) && matchSearch(item));
  const curPosIdx = filteredForPos.findIndex(item => item.id === p.id);
  const leadPosEl = document.getElementById('leadQueuePosition');
  if (leadPosEl) {
    const user = (typeof currentUser !== 'undefined' && currentUser)
      ? currentUser
      : ((typeof window !== 'undefined' && window.currentUser)
        ? window.currentUser
        : ((typeof global !== 'undefined' && global.currentUser) ? global.currentUser : null));
    const isOwner = isOwnerUser(user);
    const posNum = curPosIdx !== -1 ? (curPosIdx + 1) : 1;
    if (isOwner) {
      leadPosEl.innerText = `Lead ${posNum} of ${filteredForPos.length}`;
    } else {
      leadPosEl.innerText = `Account #${posNum}`;
    }
  }

  // Update Bookmark / Save Button UI
  updateBookmarkButtonUI(p.id);
  document.getElementById('activeDM').innerText = p.dm;
  document.getElementById('activeCity').innerText = p.city;
  const isNoSite = !p.site || p.site === '#' || p.ptype === 'STARTER';
  const typeEl = document.getElementById('activeType');
  if (typeEl) {
    typeEl.innerText = isNoSite ? "STARTER • Zero Owned Domain" : p.ptype;
    if (isNoSite) {
      typeEl.className = "text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold";
    } else {
      typeEl.className = "text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-neutral-300 border border-white/[0.08] font-medium";
    }
  }
  document.getElementById('activeFee').innerText = `Floor ${p.fee}`;

  const isUnmasked = (typeof isProspectPhoneUnmasked === 'function') ? isProspectPhoneUnmasked(p.id) : false;
  const rawPhone = p.phone || p.tel || '';
  const maskedPhone = (typeof maskPhoneNumber === 'function') ? maskPhoneNumber(rawPhone) : rawPhone;
  const displayPhone = isUnmasked ? (rawPhone || '--') : maskedPhone;

  const activePhoneDisplay = document.getElementById('activePhoneDisplay');
  const btnToggleUnmaskPhone = document.getElementById('btnToggleUnmaskPhone');
  if (activePhoneDisplay) {
    activePhoneDisplay.innerText = displayPhone;
  }
  if (btnToggleUnmaskPhone) {
    btnToggleUnmaskPhone.classList.remove('hidden');
    btnToggleUnmaskPhone.innerText = isUnmasked ? 'Hide' : 'Reveal';
    btnToggleUnmaskPhone.title = isUnmasked ? 'Hide Contact Phone' : 'Reveal Contact Phone';
  }

  const callPhoneTextEl = document.getElementById('callPhoneText');
  if (callPhoneTextEl) {
    callPhoneTextEl.innerText = isUnmasked ? 'Call Prospect [D]' : 'Reveal & Call [D]';
  }

  // Site Link
  const siteLink = document.getElementById('activeSiteLink');
  if (p.site && p.site !== '#') {
    siteLink.href = p.site;
    siteLink.style.display = 'inline-flex';
  } else {
    siteLink.style.display = 'none';
  }

  // Timing Intelligence
  const timing = calculateTiming(p.cat);
  const timingBadge = document.getElementById('timingBadge');
  timingBadge.innerText = timing.text;
  timingBadge.className = `font-semibold text-xs mt-1 px-2.5 py-0.5 rounded inline-block ${timing.cls}`;

  // Speed Audit & Tech Stack
  const speedEl = document.getElementById('speedScore');
  const lcpEl = document.getElementById('lcpTime');
  const techStackEl = document.getElementById('techStackBadge');
  if (speedEl) {
    speedEl.innerText = p.speedScore;
    if (isNoSite) {
      speedEl.className = "text-amber-400 font-bold";
    } else {
      speedEl.className = "text-rose-400 font-bold";
    }
  }
  if (lcpEl) lcpEl.innerText = p.lcpTime;
  if (techStackEl) techStackEl.innerText = p.techStack;

  // WhatsApp 1-Tap Link (Dynamic Brief with Custom Intelligence)
  const waBtn = document.getElementById('whatsappActionBtn');
  const mobileWaBtn = document.getElementById('mobileWaBtn');
  const waUrl = generateWhatsAppBrief(p);
  if (waBtn) {
    if (isUnmasked) {
      waBtn.href = waUrl;
      waBtn.onclick = () => {
        if (typeof recordPartnerActivity === 'function') {
          recordPartnerActivity('TEARDOWN_PITCH', p.id, { client: p.name, mode: 'whatsapp_brief' });
        }
      };
    } else {
      waBtn.href = "#";
      waBtn.onclick = handleWhatsAppAction;
    }
  }
  if (mobileWaBtn) {
    if (isUnmasked) {
      mobileWaBtn.href = waUrl;
      mobileWaBtn.onclick = () => {
        if (typeof recordPartnerActivity === 'function') {
          recordPartnerActivity('TEARDOWN_PITCH', p.id, { client: p.name, mode: 'whatsapp_brief' });
        }
      };
    } else {
      mobileWaBtn.href = "#";
      mobileWaBtn.onclick = handleWhatsAppAction;
    }
  }

  // Lock Status
  const isLockedByOther = p.status === 'locked' && p.lockedEmail !== currentUser?.email;
  const isDNC = p.status === 'blacklisted';
  const lockedBadge = document.getElementById('lockedBadge');
  const lockStatusSpan = document.getElementById('currentLockStatus');
  const callBtn = document.getElementById('callActionBtn');
  const mobileCallBtn = document.getElementById('mobileCallBtn');

  if (isDNC) {
    if (lockedBadge) {
      lockedBadge.classList.remove('hidden');
      lockedBadge.innerText = "🚫 EXCLUDED";
    }
    if (lockStatusSpan) {
      lockStatusSpan.className = "px-2.5 py-0.5 rounded-full bg-rose-900/50 text-rose-300 border border-rose-700/60 font-mono text-[11px] font-bold";
      lockStatusSpan.innerText = "Excluded";
    }
    if (callBtn) {
      callBtn.href = "#";
      callBtn.classList.add('opacity-30', 'pointer-events-none');
    }
    if (mobileCallBtn) mobileCallBtn.classList.add('opacity-30', 'pointer-events-none');
  } else if (isLockedByOther) {
    if (lockedBadge) {
      lockedBadge.classList.remove('hidden');
      lockedBadge.innerText = `🔒 IN REVIEW BY ${p.lockedBy?.toUpperCase()} (${p.lockedEmail})`;
    }
    if (lockStatusSpan) {
      lockStatusSpan.className = "px-2.5 py-0.5 rounded-full bg-rose-900/50 text-rose-300 border border-rose-700/60 font-mono text-[11px] font-bold";
      lockStatusSpan.innerText = `In Review (${p.lockedBy})`;
    }
    if (callBtn) {
      callBtn.href = "#";
      callBtn.classList.add('opacity-40', 'pointer-events-none');
    }
    if (mobileCallBtn) mobileCallBtn.classList.add('opacity-40', 'pointer-events-none');
  } else {
    if (lockedBadge) lockedBadge.classList.add('hidden');
    if (lockStatusSpan) {
      lockStatusSpan.className = "px-2.5 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-800/40 font-mono text-[11px] font-medium";
      lockStatusSpan.innerText = "Audit Ready";
    }
    if (callBtn) {
      if (isUnmasked) {
        callBtn.href = `tel:${p.tel}`;
        callBtn.onclick = handleCallInitiated;
        callBtn.title = `Call ${rawPhone} [Hotkey: D]`;
      } else {
        callBtn.href = "#";
        callBtn.onclick = handleCallAction;
        callBtn.title = "Click to Unmask Contact & Call";
      }
      callBtn.classList.remove('opacity-40', 'opacity-30', 'pointer-events-none');
    }
    if (mobileCallBtn) {
      if (isUnmasked) {
        mobileCallBtn.href = `tel:${p.tel}`;
        mobileCallBtn.onclick = handleCallInitiated;
      } else {
        mobileCallBtn.href = "#";
        mobileCallBtn.onclick = handleCallAction;
      }
      mobileCallBtn.classList.remove('opacity-40', 'opacity-30', 'pointer-events-none');
    }
  }

  // Flaws
  const flawsBox = document.getElementById('flawsContainer');
  if (flawsBox) {
    flawsBox.innerHTML = '';
    if (p.flaws && Array.isArray(p.flaws)) {
      p.flaws.forEach(flaw => {
        const span = document.createElement('span');
        span.className = "bg-white/[0.04] text-neutral-300 border border-white/[0.08] px-2 py-0.5 rounded text-[10px]";
        span.innerText = flaw.replace(/^⚠\s*/, '');
        flawsBox.appendChild(span);
      });
    }
  }

  // Wasted Spend & Baseless Subscriptions Intelligence
  const wasteIntel = (p.wastedSpend && p.callerCheatSheet) 
    ? { wastedSpend: p.wastedSpend, wastedBreakdown: p.wastedBreakdown || [], callerCheatSheet: p.callerCheatSheet }
    : deriveWastedSubscriptions(p.cat, p.techStack, p.lcpTime, p.city);

  const wastedBadge = document.getElementById('wastedSpendBadge');
  if (wastedBadge) {
    wastedBadge.innerText = wasteIntel.wastedSpend || "₹35,000/yr Wasted";
  }

  const wastedList = document.getElementById('wastedBreakdownList');
  if (wastedList) {
    wastedList.innerHTML = '';
    const breakdown = (p.wastedBreakdown && p.wastedBreakdown.length) ? p.wastedBreakdown : wasteIntel.wastedBreakdown;
    if (breakdown && Array.isArray(breakdown)) {
      breakdown.forEach(item => {
        const span = document.createElement('span');
        span.className = "bg-black/40 text-rose-300 border border-rose-900/40 px-2 py-0.5 rounded text-[10px] font-mono";
        span.innerText = `• ${item}`;
        wastedList.appendChild(span);
      });
    }
  }

  // Caller Layman Cheat Sheet (No Tech Jargon)
  const cheatSheet = p.callerCheatSheet || wasteIntel.callerCheatSheet || {};
  const icebreakerEl = document.getElementById('callerIcebreakerText');
  if (icebreakerEl) {
    const defaultEn = 'Are most of your high-intent inquiries coming straight from your website or third-party aggregators?';
    const defaultMl = 'നിങ്ങളുടെ പ്രധാനപ്പെട്ട കൺസൾട്ടേഷൻ ബുക്കിംഗുകൾ വെബ്‌സൈറ്റ് വഴി നേരിട്ടാണോ അതോ പ്രാക്ടോ പോലുള്ള ഇടനിലക്കാർ വഴിയാണോ കൂടുതൽ വരുന്നത്?';
    icebreakerEl.innerText = (activeLang === 'ml') ? (cheatSheet.icebreakerMl || defaultMl) : (cheatSheet.icebreaker || defaultEn);
  }

  const analogyEl = document.getElementById('callerLaymanAnalogy');
  if (analogyEl) {
    const defaultEn = 'Your website takes several seconds to load, which causes eager clients to tap back to your competitors.';
    const defaultMl = 'നിങ്ങളുടെ വെബ്‌സൈറ്റ് ഓപ്പൺ ആകാൻ 4 സെക്കൻഡിൽ കൂടുതൽ എടുക്കുന്നുണ്ട്. ഇത് ക്ലിനിക്കിന്റെ മുൻവാതിൽ കുടുങ്ങിക്കിടക്കുന്നത് പോലെയാണ്—രോഗികൾ കാത്തുനിൽക്കാതെ അടുത്ത ക്ലിനിക്കിലേക്ക് പോകും.';
    const text = (activeLang === 'ml') ? (cheatSheet.laymanAnalogyMl || defaultMl) : (cheatSheet.laymanAnalogy || defaultEn);
    analogyEl.innerText = `"${text}"`;
  }

  // Security & Trust Vulnerability Audit
  const secIntel = p.securityAudit || deriveSecurityVulnerabilities(p.cat, p.techStack, p.site);
  const secGradeEl = document.getElementById('securityAuditGrade');
  if (secGradeEl) {
    secGradeEl.innerText = (secIntel.grade || 'CAUTION').replace(/^[🛡️⚠️]\s*/, '').trim();
    if ((secIntel.grade || '').includes('HIGH')) {
      secGradeEl.className = "font-mono text-[11px] font-bold text-rose-400";
    } else if ((secIntel.grade || '').includes('MODERATE')) {
      secGradeEl.className = "font-mono text-[11px] font-bold text-amber-400";
    } else {
      secGradeEl.className = "font-mono text-[11px] font-bold text-blue-400";
    }
  }

  const secScoreEl = document.getElementById('securityAuditScore');
  if (secScoreEl) {
    secScoreEl.innerText = secIntel.score || '58/100';
  }

  const secHookEl = document.getElementById('callerSecurityHook');
  if (secHookEl) {
    const defaultEn = 'Inquiry forms lack bot protection, causing reception spam and risking browser security warnings.';
    const defaultMl = 'നിങ്ങളുടെ കോൺടാക്റ്റ് ഫോറത്തിൽ 2023 ലെ പുതിയ DPDP പ്രൈവസി കൺസെന്റ് ബോക്സ് ഇല്ല. ഇത് വലിയ ലീഗൽ ഫൈനുകൾക്ക് ഇടയാക്കാം.';
    secHookEl.innerText = (activeLang === 'ml') ? (secIntel.callerTalkingPointMl || defaultMl) : (secIntel.callerTalkingPoint || defaultEn);
  }

  const competitorEl = document.getElementById('callerCompetitorEdge');
  if (competitorEl) {
    const defaultEn = 'Leading local competitors use instant WhatsApp booking without middleman commissions.';
    const defaultMl = 'ഏരിയയിലെ മറ്റ് പ്രമുഖ ക്ലിനിക്കുകൾ ഇടനിലക്കാരുടെ കമ്മീഷൻ ഒഴിവാക്കാൻ ഒറ്റ ടാപ്പിൽ നേരിട്ട് വാട്സാപ്പ് ബുക്കിംഗ് ആണ് വെബ്സൈറ്റിൽ നൽകിയിരിക്കുന്നത്.';
    competitorEl.innerText = (activeLang === 'ml') ? (cheatSheet.competitorEdgeMl || defaultMl) : (cheatSheet.competitorEdge || defaultEn);
  }

  // Option C Advanced Conversion & Compliance Badges
  const advGrading = (p.revenueLeak && p.dpdpCompliance && p.thumbZone && p.bookingFriction)
    ? {
        revenueLeak: p.revenueLeak,
        revenueLeakNumeric: p.revenueLeakNumeric,
        dpdpCompliance: p.dpdpCompliance,
        thumbZone: p.thumbZone,
        bookingFriction: p.bookingFriction,
        reputationBridge: p.reputationBridge
      }
    : deriveAdvancedGrading(p.cat, p.techStack, p.lcpTime, p.site);

  const revBadge = document.getElementById('revenueLeakBadge');
  if (revBadge) {
    revBadge.innerText = advGrading.revenueLeak || '₹1,80,000/mo Est. Leak';
  }

  const dpdpBadge = document.getElementById('dpdpComplianceBadge');
  const dpdpRisk = document.getElementById('dpdpRiskBadge');
  if (dpdpBadge) {
    dpdpBadge.innerText = (advGrading.dpdpCompliance?.status || 'DPDP Non-Compliant').replace(/^[🔴🟢]\s*/, '');
  }
  if (dpdpRisk) {
    dpdpRisk.innerText = advGrading.dpdpCompliance?.risk || 'High Regulatory Exposure';
  }

  const thumbBadge = document.getElementById('thumbZoneBadge');
  if (thumbBadge) {
    thumbBadge.innerText = (advGrading.thumbZone?.status || 'No Sticky Action Bar').replace(/^[❌✅]\s*/, '');
  }

  const frictionBadge = document.getElementById('bookingFrictionBadge');
  const frictionSev = document.getElementById('bookingSeverityBadge');
  if (frictionBadge) {
    frictionBadge.innerText = advGrading.bookingFriction?.steps || '7 Friction Steps';
  }
  if (frictionSev) {
    frictionSev.innerText = (advGrading.bookingFriction?.severity || 'Severe Drop-off Risk').replace(/^[🔴🟢]\s*/, '');
  }

  // Populate saved notes or discovery input
  const notesInput = document.getElementById('callNotesInput');
  if (notesInput) {
    notesInput.value = p.notes || '';
    if (!notesInput._hasSaveListener) {
      if (typeof notesInput.addEventListener === 'function') {
        notesInput.addEventListener('input', () => saveNotesLocally());
      }
      notesInput._hasSaveListener = true;
    }
  }
  const discoveryInput = document.getElementById('discoveryInput');
  if (discoveryInput) discoveryInput.value = p.discoveryTime || '';

  // Pre-Call Conversational Hook & Bleed Telemetry
  const preCallHook = document.getElementById('preCallHookText');
  if (preCallHook) {
    preCallHook.innerText = `"${cheatSheet.icebreaker || 'Are most of your high-intent patient inquiries coming straight from your website or third-party aggregators?'}"`;
  }
  const preCallBleed = document.getElementById('preCallBleedText');
  if (preCallBleed) {
    const cleanLcpTime = String(p.lcpTime || '4.1s').replace(/^LCP:\s*/i, '');
    preCallBleed.innerText = p.wastedSpend 
      ? `${p.wastedSpend} on aggregators • Mobile LCP ${cleanLcpTime} cellular bounce risk.`
      : `Mobile LCP ${cleanLcpTime} • High aggregator fee leak on mobile traffic.`;
  }

  // 3D WebUI & High-Impact Conversion Moat Solutions
  updateMoatSolutions(p, isNoSite);

  // Teleprompter
  updateScriptUI(p);

  // In-Call Flight & Mandatory Disposition Gate HUD
  updateCallHUDState();
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
    // Upgrade existing website
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


  // Responsive Mobile Cockpit / Queue Switcher
  function showMobilePane(pane) {
    const queuePane = document.getElementById('queuePane');
    const cockpitPane = document.getElementById('cockpitPane');
    const tabQueue = document.getElementById('mobileTabQueue');
    const tabCockpit = document.getElementById('mobileTabCockpit');

    if (pane === 'queue') {
      if (queuePane) {
        queuePane.classList.remove('mobile-pane-hidden', 'hidden');
      }
      if (cockpitPane) {
        cockpitPane.classList.add('mobile-pane-hidden');
      }
      if (tabQueue) {
        tabQueue.className = "flex-1 py-1.5 font-bold text-[#17120f] bg-[#fce566] border border-[#17120f] transition text-center";
      }
      if (tabCockpit) {
        tabCockpit.className = "flex-1 py-1.5 font-medium text-[#17120f] hover:bg-[#fff1bd] transition text-center";
      }
    } else if (pane === 'cockpit') {
      if (queuePane) {
        queuePane.classList.add('mobile-pane-hidden');
      }
      if (cockpitPane) {
        cockpitPane.classList.remove('mobile-pane-hidden', 'hidden');
      }
      if (tabCockpit) {
        tabCockpit.className = "flex-1 py-1.5 font-bold text-[#17120f] bg-[#fce566] border border-[#17120f] transition text-center";
      }
      if (tabQueue) {
        tabQueue.className = "flex-1 py-1.5 font-medium text-[#17120f] hover:bg-[#fff1bd] transition text-center";
      }
    }
  }

  function ensureDesktopPanesVisible() {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      const q = document.getElementById('queuePane');
      const c = document.getElementById('cockpitPane');
      if (q) q.classList.remove('hidden', 'mobile-pane-hidden');
      if (c) c.classList.remove('hidden', 'mobile-pane-hidden');
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', ensureDesktopPanesVisible);
    window.addEventListener('DOMContentLoaded', ensureDesktopPanesVisible);
    ensureDesktopPanesVisible();
  }

  // Responsive Sub-Tab Switcher for Tablet / Mobile (< 1280px)
  function switchCockpitSubTab(tab) {
    const callPane = document.getElementById('callConsolePane');
    const dossierPane = document.getElementById('dossierPane');
    const btnCall = document.getElementById('cockpitSubTabCall');
    const btnDossier = document.getElementById('cockpitSubTabDossier');

    if (tab === 'call') {
      if (callPane) {
        callPane.classList.remove('subtab-hidden');
      }
      if (dossierPane) {
        dossierPane.classList.add('subtab-hidden');
      }
      if (btnCall) btnCall.className = "flex-1 py-1.5 font-bold text-[#17120f] bg-[#fce566] transition text-center";
      if (btnDossier) btnDossier.className = "flex-1 py-1.5 font-medium text-[#17120f] hover:bg-[#fff1bd] transition text-center";
    } else if (tab === 'dossier') {
      if (callPane) {
        callPane.classList.add('subtab-hidden');
      }
      if (dossierPane) {
        dossierPane.classList.remove('subtab-hidden');
      }
      if (btnDossier) btnDossier.className = "flex-1 py-1.5 font-bold text-[#17120f] bg-[#fce566] transition text-center";
      if (btnCall) btnCall.className = "flex-1 py-1.5 font-medium text-[#17120f] hover:bg-[#fff1bd] transition text-center";
    }
  }

  const WorkspaceQueueEngine = {
    filterStatus,
    matchStatus,
    filterCity,
    handleSearch,
    matchSearch,
    getCallbackAging,
    renderQueue,
    selectProspect,
    generateWhatsAppBrief,
    renderActiveProspect,
    updateMoatSolutions,
    calculateUpgradeFee,
    deriveWastedSubscriptions,
    deriveSecurityVulnerabilities,
    deriveAdvancedGrading,
    showMobilePane,
    ensureDesktopPanesVisible,
    switchCockpitSubTab
  };

  root.WorkspaceQueueEngine = WorkspaceQueueEngine;
  root.filterStatus = filterStatus;
  root.matchStatus = matchStatus;
  root.filterCity = filterCity;
  root.handleSearch = handleSearch;
  root.matchSearch = matchSearch;
  root.getCallbackAging = getCallbackAging;
  root.renderQueue = renderQueue;
  root.selectProspect = selectProspect;
  root.generateWhatsAppBrief = generateWhatsAppBrief;
  root.renderActiveProspect = renderActiveProspect;
  root.updateMoatSolutions = updateMoatSolutions;
  root.calculateUpgradeFee = calculateUpgradeFee;
  root.deriveWastedSubscriptions = deriveWastedSubscriptions;
  root.deriveSecurityVulnerabilities = deriveSecurityVulnerabilities;
  root.deriveAdvancedGrading = deriveAdvancedGrading;
  root.showMobilePane = showMobilePane;
  root.ensureDesktopPanesVisible = ensureDesktopPanesVisible;
  root.switchCockpitSubTab = switchCockpitSubTab;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkspaceQueueEngine;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
