// =============================================================
// SUBSYSTEM 21: INTERACTIVE WORKSTATION GUIDED WALKTHROUGH OVERLAY
// Modular Guided Tour Engine (Dual-Device Laptop & Mobile)
// =============================================================

(function(root) {
  const WORKSPACE_TOUR_STEPS = [
    {
      step: 1,
      total: 8,
      badge: 'STEP 1 OF 8 // QUEUE',
      targetSelector: '#queuePane, #queueList, #queueListContainer',
      targetLabel: 'COLUMN 1 // TERRITORY QUEUE & CALLBACK RADAR',
      targetSubtext: 'Priority dispatch algorithm with automated callback sorting',
      sectorBadge: '// QUEUE RADAR LOCKED',
      title: '1. Territory Queue & Priority Dispatch',
      summary: 'The workstation organizes your territory pipeline into actionable queues. Fresh leads, saved targets, and overdue callbacks automatically prioritize so you never lose high-intent deals.',
      visual: `┌── TERRITORY QUEUE ──────────────────────────────┐
│ TABS  : [ALL]  [FRESH]  [CB]  [★ SAVED]  [WINS] │
│ URGENT: [ZOMBIE >48H] & [OVERDUE] float to top  │
│ ● READY TO DIAL │ Paragon Luxury Grand Resort   │
└─────────────────────────────────────────────────┘`,
      laptop: [
        "• <strong>Left Column:</strong> Browse your active enterprise territory pipeline with 1-click status and city filters.",
        "• <strong>Callbacks & Zombie Recovery:</strong> Click <span class='font-bold text-neutral-900'>[CB]</span> for scheduled callbacks. Stale follow-ups ('Zombie' leads unattended >48h) automatically pin to the top so you can rescue slipping deals.",
        "• <strong>Shortlist Bookmarks:</strong> Press <kbd class='px-1 bg-[#17120f] text-[#fce566]'>B</kbd> or click <span class='font-bold text-neutral-900'>[★]</span> to filter your bookmarked targets.",
        "• <strong>Instant Search:</strong> Press <kbd class='px-1 bg-[#17120f] text-[#fce566]'>/</kbd> or <kbd class='px-1 bg-[#17120f] text-[#fce566]'>Ctrl+K</kbd> to search by name, city, specialty, or phone.",
        "• <strong>Rapid Navigation:</strong> Press <kbd class='px-1 bg-[#17120f] text-[#fce566]'>J</kbd> (Next Lead) and <kbd class='px-1 bg-[#17120f] text-[#fce566]'>K</kbd> (Prev Lead)."
      ],
      mobile: [
        "• <strong>Bottom Tab:</strong> Tap <span class='font-bold text-neutral-900'>[QUEUE]</span> to browse leads on mobile.",
        "• <strong>Urgency Sorting:</strong> In [CB], stale [ZOMBIE >48H] and [OVERDUE] callbacks float to the top.",
        "• <strong>Shortlist Filter:</strong> Tap <span class='font-bold text-neutral-900'>[★]</span> to focus exclusively on your saved leads.",
        "• <strong>Single Tap:</strong> Tap any prospect card to load their full dossier into active cockpit memory."
      ],
      proTip: "Always clear stale Zombie (>48h) and Overdue (24-48h) callbacks first at the start of your shift to rescue slipping revenue!"
    },
    {
      step: 2,
      total: 8,
      badge: 'STEP 2 OF 8 // DOSSIER',
      targetSelector: '#prospectHero, #activeName, #phoneContainer',
      targetLabel: 'COLUMN 2 TOP // CLIENT DOSSIER & PHONE SHIELD',
      targetSubtext: 'Target metadata, verified decision makers & anti-theft phone masking',
      sectorBadge: '// DOSSIER IDENT LOCKED',
      title: '2. Client Dossier & Sovereign Phone Shield',
      summary: 'Every prospect profile contains verified company names, location, website status, decision maker names, and role-based masked contact numbers.',
      visual: `┌── CLIENT IDENTITY & PHONE SHIELD ───────────────┐
│ TARGET  : Malabar Heritage Grand Villa          │
│ CONTACT : Dr. Manoj Varma • MOBILE LCP 4.8s     │
│ BLEED   : ₹48,000/yr AGGREGATOR Commission Leak │
│ PHONE   : +91 94470 •••••  [REVEAL PHONE]       │
└─────────────────────────────────────────────────┘`,
      laptop: [
        "• <strong>Center Dossier:</strong> Inspect company name, geographic tier, verified DM contact, and website status.",
        "• <strong>Save for Later:</strong> Click <span class='font-bold text-neutral-900'>[SAVE (B)]</span> or press <kbd class='px-1 bg-[#17120f] text-[#fce566]'>B</kbd> to bookmark priority prospects into your Starred queue.",
        "• <strong>Phone Shield:</strong> Phone numbers start safely masked (`+91 94470 •••••`). Click <span class='font-bold text-neutral-900'>[Reveal]</span> to toggle digits under an hourly security velocity limit.",
        "• <strong>Layman Analogies:</strong> Click <span class='font-bold text-neutral-900'>[INTEL] LAYMAN ANALOGIES</span> for instant client-friendly metaphors that simplify WebGPU/60 FPS value.",
        "• <strong>Revenue Leak Hook:</strong> Quote their exact monthly aggregator bleed to anchor our ₹50k–₹2L package as self-funding."
      ],
      mobile: [
        "• <strong>Bottom Tab:</strong> Tap <span class='font-bold text-neutral-900'>[DOSSIER]</span> before dialing to review technical leaks and 4G drop-off.",
        "• <strong>Anti-Theft Protection:</strong> Steganographic watermarks protect lead data against unauthorized exports.",
        "• <strong>1-Tap Toggle:</strong> Tap [Reveal] to unmask phone digits before placing your outbound dial."
      ],
      proTip: "Always confirm you are asking for the specific Decision Maker listed in the dossier to bypass gatekeepers on the first sentence!"
    },
    {
      step: 3,
      total: 8,
      badge: 'STEP 3 OF 8 // RECON HOOK',
      targetSelector: '#preCallIntelCard, #preCallHookText, #preCallBleedText',
      targetLabel: 'COLUMN 2 MID // 10s RECON HOOK & BLEED INTEL',
      targetSubtext: 'Empirical Lighthouse 4G speed deficit & aggregator commission leak',
      sectorBadge: '// RECON TELEMETRY LOCKED',
      title: '3. 10s Recon Hook & Revenue Bleed Telemetry',
      summary: 'Never pitch generic web dev. Lead with empirical mobile 4G latency (LCP) and quantified monthly aggregator commission bleed (15-25% paid to OTAs/aggregators).',
      visual: `┌── 10s RECON HOOK & BLEED TELEMETRY ─────────────┐
│ 10s HOOK : "How many inquiries come direct vs   │
│             paying 15-25% to aggregators?"      │
│ BLEED    : ₹48,000/yr OTA Bleed • Mobile LCP 4.8s│
└─────────────────────────────────────────────────┘`,
      laptop: [
        "• <strong>Pre-Call Hook:</strong> Read the curated 10-second opening hook aloud as soon as the prospect answers.",
        "• <strong>Aggregator Bleed:</strong> Quote their exact monthly commission loss to anchor our ₹50k–₹2L package as a self-funding investment.",
        "• <strong>Mobile LCP Deficit:</strong> Mention their 4G load time (e.g. 4.8s) causing 53%+ bounce rates on mobile."
      ],
      mobile: [
        "• <strong>High-Contrast Bar:</strong> Prominently displays the opening hook right above the Call button.",
        "• <strong>Zero Guesswork:</strong> Empirical figures give you immediate technical authority over competing commodity agencies.",
        "• <strong>Quick Reference:</strong> Glancable while holding the phone to your ear."
      ],
      proTip: "Frame website speed as pure revenue: every 1-second delay past 2.5s on mobile cuts consultation conversion rates by 7%!"
    },
    {
      step: 4,
      total: 8,
      badge: 'STEP 4 OF 8 // CHEAT SHEET',
      targetSelector: '#dossierPane, #dossierTabContentTalk, #btnDossierLangEn',
      targetLabel: 'COLUMN 3 TOP // CONVERSATIONAL CHEAT SHEET & AUDIO',
      targetSubtext: '4 tactical talk tracks with English/Malayalam bilingual speech synthesis',
      sectorBadge: '// CHEAT SHEET ENGAGED',
      title: '4. Conversational Cheat Sheet & Bilingual Audio',
      summary: 'Four proven conversational tracks (Speed, Cellular Dropoff, DPDP Privacy, 60 FPS Advantage) equipped with 1-click clipboard copy and local speech synthesis playback.',
      visual: `┌── CONVERSATIONAL CHEAT SHEET ───────────────────┐
│ [EN] [ML]           [NO TECH JARGON BADGE]      │
│ 01 HEADLESS SPEED   │ [COPY] [PLAY] [?] DECODE   │
│ 02 CELLULAR DROPOFF │ [COPY] [PLAY] [?] DECODE   │
└─────────────────────────────────────────────────┘`,
      laptop: [
        "• <strong>Right Column:</strong> Four pre-scripted conversational cards calibrated for high-ticket closing.",
        "• <strong>Bilingual Switcher:</strong> Toggle between English (<span class='font-bold text-neutral-900'>EN</span>) and Malayalam / Manglish (<span class='font-bold text-neutral-900'>ML</span>) in 1 tap.",
        "• <strong>Audio Playback:</strong> Click <span class='font-bold text-neutral-900'>[PLAY]</span> to hear the pitch read with natural pronunciation before dialing.",
        "• <strong>1-Tap Clipboard:</strong> Click <span class='font-bold text-neutral-900'>[COPY]</span> to copy individual talk tracks."
      ],
      mobile: [
        "• <strong>Sub-Tab Switcher:</strong> On tablet/mobile, tap <span class='font-bold text-neutral-900'>[DOSSIER]</span> subtab to inspect talk tracks.",
        "• <strong>Audio Training:</strong> Listen to Malayalam pitch tracks in headphones during downtime to perfect your pitch cadence.",
        "• <strong>Direct Metaphors:</strong> Every track replaces dry technical jargon with vivid, relatable business analogies."
      ],
      proTip: "Switch to [ML] mode when calling local regional businesses; Malayalam conversational hooks build instant rapport and disarm gatekeepers!"
    },
    {
      step: 5,
      total: 8,
      badge: 'STEP 5 OF 8 // JARGON DECODER',
      targetSelector: '#jargonDecoderQuickBar, #dossierTabContentTalk',
      targetLabel: 'COLUMN 3 QUICK BAR // JARGON DECODER & METAPHORS',
      targetSubtext: 'Instant layman translation pills for complex technical concepts',
      sectorBadge: '// JARGON DECODER ACTIVE',
      title: '5. Jargon Decoder Pills & Layman Pitch Gym',
      summary: 'Never intimidate clients with complex acronyms. Click any Jargon Decoder pill to instantly translate technical terms (LCP, DPDP, Thumb-Zone, WP Bloat, SSL/TLS, 60 FPS) into client-friendly analogies.',
      visual: `┌── JARGON DECODER PILLS (ABOVE THE FOLD) ────────┐
│ [LCP] Speed   [LAW] DPDP   [UI] Thumb-Zone     │
│ [AGG] Bleed   [DOM] Bloat  [SLA] 60 FPS         │
│ → Click to open Layman Analogy Audio Modal      │
└─────────────────────────────────────────────────┘`,
      laptop: [
        "• <strong>Quick Bar:</strong> 8 color-coded pills positioned right below the Cheat Sheet header for instant access above the fold.",
        "• <strong>Layman Analogies:</strong> Click any pill (e.g. <span class='font-bold text-neutral-900'>[LCP] Speed</span>) to open the interactive decoding modal.",
        "• <strong>Voice Synthesis:</strong> Hear the simplified explanation read aloud in English or Malayalam.",
        "• <strong>Append to Notes:</strong> 1-click button pastes the analogy directly into your active call notes."
      ],
      mobile: [
        "• <strong>Thumb-Safe Pills:</strong> Elevated above the fold so you don't have to scroll past 4 long cards to decode a term.",
        "• <strong>Pitch Gym:</strong> Practice client-friendly answers to tough technical questions during practice sessions.",
        "• <strong>Zero Confusion:</strong> Never stumble when a client asks: <em>'What does DPDP Act have to do with my website?'</em>"
      ],
      proTip: "Use the rusty latch analogy for LCP: 'A 4.1s site is like a clinic door with a rusty latch — patients give up and walk to the clinic next door!'"
    },
    {
      step: 6,
      total: 8,
      badge: 'STEP 6 OF 8 // REBUTTALS',
      targetSelector: '#defenseNotesPanel, #soundboardPanel, #objectionBox, #callNotesInput',
      targetLabel: 'COLUMN 2 LOWER // OBJECTION DEFENSE & SMART NOTES',
      targetSubtext: 'Tactical objection soundboard with 1-tap note logging',
      sectorBadge: '// OBJECTION DEFENSE ARMED',
      title: '6. Strategic Objection Defense & Smart Notes',
      summary: 'When prospects push back ("Already have website", "Too expensive", "Using Instagram only", "Send WhatsApp"), tap the soundboard for bulletproof counter-rebuttals.',
      visual: `┌── OBJECTION SOUNDBOARD & SMART NOTES ───────────┐
│ [ALREADY HAVE SITE]  [TOO EXPENSIVE]  [INSTA]   │
│ Rebuttal: "We don't replace it, we headless-it" │
│ Quick Tags: [#Gatekeeper] [#Interested] [#Price]│
└─────────────────────────────────────────────────┘`,
      laptop: [
        "• <strong>Soundboard Panel:</strong> Click any objection pill to open instant battle-tested rebuttals in English or Malayalam.",
        "• <strong>Audio Soundboard:</strong> Play audio rebuttals to master the exact tone, pause, and phrasing.",
        "• <strong>Append Rebuttal:</strong> Click <span class='font-bold text-neutral-900'>[+ Append to Notes]</span> to instantly log the objection.",
        "• <strong>Quick Tags:</strong> 1-click pills below the notes box quickly tag the lead without manual typing."
      ],
      mobile: [
        "• <strong>Compact Buttons:</strong> Soundboard buttons fit cleanly below the call console on mobile.",
        "• <strong>Rapid Rebuttals:</strong> Glance down at the rebuttal text while talking to deliver confident, friction-free answers.",
        "• <strong>Local Auto-Save:</strong> Call notes save locally to localStorage in real-time on every keystroke."
      ],
      proTip: "When a prospect says 'We already have a site', counter with: 'We don't rebuild your site; we install a high-speed booking engine that recaptures lost mobile revenue!'"
    },
    {
      step: 7,
      total: 8,
      badge: 'STEP 7 OF 8 // FLIGHT HUD',
      targetSelector: '#callWrapCard, #callActionBtn, #dialHandoffSection',
      targetLabel: 'COCKPIT // IN-CALL FLIGHT HUD & TEL STOPWATCH',
      targetSubtext: 'Live call timer, accidental misclick shield & 2-step disposition gate',
      sectorBadge: '// LIVE DIAL COCKPIT LOCKED',
      title: '7. In-Call Flight HUD & Mandatory Dispositions',
      summary: 'Dialing starts an active stopwatch. To prevent lost data or skipping callbacks, active calls must be dispositioned through a guided 2-step gate.',
      visual: `┌── IN-CALL FLIGHT HUD ───────────────────────────┐
│ [LIVE DIAL] [ 02:15 ]     [ ↩ CANCEL DIAL ]     │
│ STEP 1: [● Spoke to DM] [▲ Gatekeeper] [No Ans] │
│ STEP 2: [WIN: BOOKED] [TEARDOWN] [CALLBACK]     │
└─────────────────────────────────────────────────┘`,
      laptop: [
        "• <strong>Start Call:</strong> Click <span class='font-bold text-neutral-900'>[Call Prospect (D)]</span> (<kbd class='px-1 bg-[#17120f] text-[#fce566]'>D</kbd>) or scan via <span class='font-bold text-neutral-900'>[QR Call]</span> (<kbd class='px-1 bg-[#17120f] text-[#fce566]'>Q</kbd>) to dial from your phone without typing digits.",
        "• <strong>Misclick Safe:</strong> Accidental click? Hit <span class='font-bold text-rose-700'>[ ↩ Cancel Dial ]</span> to reset immediately.",
        "• <strong>Step 1 & Step 2 Gate:</strong> Pick Reach Status (DM / Gatekeeper / No Answer), then choose dynamic Outcome.",
        "• <strong>1-Tap Tags:</strong> Click quick tags to append notes without typing. Press <kbd class='px-1 bg-[#17120f] text-[#fce566]'>Space</kbd> to save & advance."
      ],
      mobile: [
        "• <strong>Bottom Tab:</strong> Stay on <span class='font-bold text-neutral-900'>[COCKPIT]</span> during live calls.",
        "• <strong>Touch-Safe Ergonomics:</strong> Large 44px buttons prevent misclicks while walking or holding a phone.",
        "• <strong>1-Tap Nudge:</strong> If prospect asks for details, hit <span class='font-bold text-neutral-900'>[NUDGE] 1-TAP WHATSAPP</span> to send the performance audit on WhatsApp!"
      ],
      proTip: "The cockpit locks lead navigation while a call is active so you never lose call notes or forget to schedule a callback."
    },
    {
      step: 8,
      total: 8,
      badge: 'STEP 8 OF 8 // CLOSING & WALLET',
      targetSelector: '#partnerWalletModalBox, #partnerWalletModal, #topbarWalletPill, header.topbar',
      targetLabel: 'CLOSING // TWO-TRACK TERMINAL & COMMISSION WALLET',
      targetSubtext: '15% direct close UPI terminal, 10% founder handoff & instant payout request',
      sectorBadge: '// CLOSING TERMINAL ENGAGED',
      title: '8. Two-Track Closing Terminal & Sovereign Wallet',
      summary: 'Strike while the iron is hot. Close deals autonomously on the spot for a 15% commission, or escalate enterprise walkthroughs to Apoorv for a 10% safety net. Request instant UPI settlements directly from your topbar wallet.',
      visual: `┌── TWO-TRACK CLOSING & SOVEREIGN WALLET ─────────┐
│ TRACK 1: [ CLOSE (15% COMMISSION) ] → Live UPI  │
│ TRACK 2: [ FORWARD (10% REFERRAL) ] → Meet Slot │
│ TOPBAR : [ ₹7,500 EARNED ] [ REQUEST UPI PAYOUT]│
└─────────────────────────────────────────────────┘`,
      laptop: [
        "• <strong>Track 1 (Direct Close — 15% Cut):</strong> When DM agrees, click <span class='font-bold text-neutral-900'>[ ◈ CLOSE (15%) ]</span>. Select Tier (₹50k/₹100k/₹200k), show live 50% UPI deposit QR, and click 'Mark 50% Deposit Received'.",
        "• <strong>Track 2 (Founder Walkthrough — 10% Cut):</strong> For complex enterprise deals, click <span class='font-bold text-neutral-900'>[ ◈ FORWARD (10%) ]</span> to book a 15-min Google Meet with Apoorv with zero context loss.",
        "• <strong>Instant Commission:</strong> Track 1 pays ₹7,500 on ₹50k directly; Track 2 pays ₹5,000 on discovery handoff!",
        "• <strong>Partner Wallet Terminal:</strong> Inspect your live Cleared, Pending, and Settled balances in real-time.",
        "• <strong>Instant UPI Payouts:</strong> Enter your UPI VPA and hit <span class='font-bold text-neutral-900'>[ REQUEST UPI PAYOUT ]</span> to send automated WhatsApp settlement to Apoorv.",
        "• <strong>Closer Hotkeys:</strong> <kbd class='px-1 bg-[#17120f] text-[#fce566]'>1</kbd> (Booked), <kbd class='px-1 bg-[#17120f] text-[#fce566]'>2</kbd> (Callback), <kbd class='px-1 bg-[#17120f] text-[#fce566]'>3</kbd> (Disqual), <kbd class='px-1 bg-[#17120f] text-[#fce566]'>Space</kbd> (Save/Next)."
      ],
      mobile: [
        "• <strong>Mobile Optimized Modals:</strong> Both closing dialogs open seamlessly on mobile with zero horizontal clipping.",
        "• <strong>1-Tap WhatsApp SOW:</strong> Dispatches pre-formatted milestone agreements directly to the client's WhatsApp.",
        "• <strong>UPI Copy:</strong> 1-tap clipboard copying for UPI IDs to facilitate instant mobile app transfers.",
        "• <strong>Pinned Header:</strong> Live wallet pill is always visible in the mobile header.",
        "• <strong>Audio Chimes:</strong> Procedural droid synthesis chirps celebrate your 5, 10, 15, and 20 dial milestones.",
        "• <strong>Re-open Anytime:</strong> Open the Profile Menu or tap <span class='font-bold text-neutral-900'>[ TOUR ]</span> anytime to review this flight manual!"
      ],
      proTip: "Hit 15 dials to enter 'POWER HOUR' and lock your daily shift streak. You are cleared for launch!"
    }
  ];

  let currentWorkspaceTourStep = 0;
  let tourListenersAttached = false;
  let currentTourDeviceTab = (typeof window !== 'undefined' && window.innerWidth < 1024) ? 'mob' : 'desk';

  function onTourWindowChange() {
    if (currentWorkspaceTourStep >= 0 && currentWorkspaceTourStep < WORKSPACE_TOUR_STEPS.length) {
      updateTourSpotlight(currentWorkspaceTourStep, false);
    }
  }

  function updateTourSpotlight(stepIndex, shouldScroll = false) {
    const step = WORKSPACE_TOUR_STEPS[stepIndex];
    if (!step) return;

    const targetIndicator = document.getElementById('tourTargetIndicator');
    if (targetIndicator && step.targetLabel) {
      targetIndicator.textContent = `[RADAR] TARGET: ${step.targetLabel}`;
    }

    const targetSubtext = document.getElementById('tourTargetSubtext');
    if (targetSubtext && step.targetSubtext) {
      targetSubtext.textContent = step.targetSubtext;
    }

    const bb8SectorText = document.getElementById('tourBB8SectorText');
    if (bb8SectorText && step.bb8Sector) {
      bb8SectorText.textContent = step.bb8Sector;
    }

    let targetEl = null;
    if (step.targetSelector && typeof document !== 'undefined' && typeof document.querySelector === 'function') {
      const selectors = step.targetSelector.split(',').map(s => s.trim());
      for (const sel of selectors) {
        try {
          const found = document.querySelector(sel);
          if (found && found.offsetParent !== null) {
            targetEl = found;
            break;
          }
        } catch (e) {}
      }
    }

    if (shouldScroll && targetEl && typeof targetEl.scrollIntoView === 'function') {
      try {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        if (typeof setTimeout === 'function') {
          setTimeout(() => {
            updateTourSpotlight(stepIndex, false);
          }, 380);
        }
      } catch (e) {}
    }

    const cutout = document.getElementById('tourSpotlightCutout');
    const border = document.getElementById('tourTargetLaserBorder');
    const laser = document.getElementById('tourLaserBeam');
    const bb8 = document.getElementById('tourBB8Companion');
    const tourCard = document.getElementById('tourCard');

    if (!targetEl || typeof targetEl.getBoundingClientRect !== 'function') {
      if (cutout && typeof cutout.setAttribute === 'function') {
        cutout.setAttribute('x', '0');
        cutout.setAttribute('y', '0');
        cutout.setAttribute('width', '0');
        cutout.setAttribute('height', '0');
      }
      if (border && typeof border.setAttribute === 'function') {
        border.setAttribute('x', '0');
        border.setAttribute('y', '0');
        border.setAttribute('width', '0');
        border.setAttribute('height', '0');
      }
      if (laser && typeof laser.setAttribute === 'function') {
        laser.setAttribute('x1', '0');
        laser.setAttribute('y1', '0');
        laser.setAttribute('x2', '0');
        laser.setAttribute('y2', '0');
      }
      if (bb8) bb8.style.opacity = '0';
      return;
    }

    const rect = targetEl.getBoundingClientRect();
    const pad = 10;
    const winW = typeof window !== 'undefined' ? (window.innerWidth || 1440) : 1440;
    const winH = typeof window !== 'undefined' ? (window.innerHeight || 900) : 900;
    const isMobile = winW < 1024;

    const x = Math.max(4, rect.left - pad);
    const y = Math.max(4, rect.top - pad);
    const w = Math.min(winW - x - 4, Math.max(20, rect.width + pad * 2));
    const h = Math.min(winH - y - 4, Math.max(20, rect.height + pad * 2));

    if (cutout && typeof cutout.setAttribute === 'function') {
      cutout.setAttribute('x', String(x));
      cutout.setAttribute('y', String(y));
      cutout.setAttribute('width', String(w));
      cutout.setAttribute('height', String(h));
    }
    if (border && typeof border.setAttribute === 'function') {
      border.setAttribute('x', String(x));
      border.setAttribute('y', String(y));
      border.setAttribute('width', String(w));
      border.setAttribute('height', String(h));
    }

    if (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') {
      document.querySelectorAll('.tour-focus-target').forEach(el => {
        el.classList.remove('tour-focus-target');
      });
      if (targetEl && targetEl.classList) {
        targetEl.classList.add('tour-focus-target');
      }
    }

    if (tourCard && !isMobile) {
      if (stepIndex === 0 || stepIndex === 1 || stepIndex === 2 || stepIndex === 5 || stepIndex === 6) {
        tourCard.style.marginLeft = 'auto';
        tourCard.style.marginRight = '1rem';
        tourCard.style.width = '350px';
        tourCard.style.marginTop = 'auto';
        tourCard.style.marginBottom = 'auto';
      } else if (stepIndex === 7) {
        tourCard.style.marginLeft = '0.5rem';
        tourCard.style.marginRight = 'auto';
        tourCard.style.width = '320px';
        tourCard.style.marginTop = 'auto';
        tourCard.style.marginBottom = 'auto';
      } else {
        tourCard.style.marginLeft = '0.5rem';
        tourCard.style.marginRight = 'auto';
        tourCard.style.width = '320px';
        tourCard.style.marginTop = '3.5rem';
        tourCard.style.marginBottom = 'auto';
      }
    } else if (tourCard && isMobile) {
      tourCard.style.marginLeft = 'auto';
      tourCard.style.marginRight = 'auto';
      tourCard.style.width = '100%';
      tourCard.style.marginTop = 'auto';
      tourCard.style.marginBottom = '0.5rem';
    }
  }

  function pingTourTarget() {
    const step = WORKSPACE_TOUR_STEPS[currentWorkspaceTourStep];
    if (!step) return;

    if (typeof window !== 'undefined' && window.SFX && typeof window.SFX.playLaserConstruct === 'function') {
      try { window.SFX.playLaserConstruct(); } catch(e) {}
    }

    updateTourSpotlight(currentWorkspaceTourStep, true);

    const border = document.getElementById('tourTargetLaserBorder');
    if (border) {
      border.style.stroke = '#ffffff';
      border.style.strokeWidth = '4.5px';
      if (typeof setTimeout === 'function') {
        setTimeout(() => {
          if (border) {
            border.style.stroke = '#4deeea';
            border.style.strokeWidth = '2.5px';
          }
        }, 400);
      }
    }
  }

  function openWorkspaceTour(stepIndex = 0) {
    currentWorkspaceTourStep = Math.max(0, Math.min(stepIndex, WORKSPACE_TOUR_STEPS.length - 1));
    currentTourDeviceTab = (typeof window !== 'undefined' && window.innerWidth < 1024) ? 'mob' : 'desk';
    const modal = document.getElementById('workspaceTourModal');
    if (!modal) return;

    const disclaimer = document.getElementById('onboardingDisclaimer');
    if (disclaimer) {
      disclaimer.classList.add('hidden');
      disclaimer.style.display = 'none';
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    if (typeof document !== 'undefined' && document.body?.classList) {
      document.body.classList.add('tour-active');
    }
    if (typeof window !== 'undefined' && window.AstromechArchitect && typeof window.AstromechArchitect.dispose === 'function') {
      try { window.AstromechArchitect.dispose(); } catch(e) {}
    }
    renderWorkspaceTourStep(currentWorkspaceTourStep);
    updateTourSpotlight(currentWorkspaceTourStep, true);

    if (!tourListenersAttached && typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('resize', onTourWindowChange);
      window.addEventListener('scroll', onTourWindowChange, true);
      tourListenersAttached = true;
    }

    if (typeof window !== 'undefined' && window.SFX && typeof window.SFX.playLaserConstruct === 'function') {
      try { window.SFX.playLaserConstruct(); } catch(e) {}
    }
  }

  function closeWorkspaceTour(markCompleted = true) {
    const modal = document.getElementById('workspaceTourModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
    if (typeof document !== 'undefined' && document.body?.classList) {
      document.body.classList.remove('tour-active');
    }
    if (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') {
      document.querySelectorAll('.tour-focus-target').forEach(el => {
        el.classList.remove('tour-focus-target');
      });
    }
    if (markCompleted && typeof localStorage !== 'undefined') {
      localStorage.setItem('sprintdial_tour_completed', 'true');
    }

    if (typeof closePartnerWalletModal === 'function') {
      closePartnerWalletModal(false);
    } else if (typeof window !== 'undefined' && typeof window.closePartnerWalletModal === 'function') {
      window.closePartnerWalletModal(false);
    }

    const card = document.getElementById('callWrapCard');
    const curActiveCall = (typeof window !== 'undefined' && window.activeCallProspectId) ? window.activeCallProspectId : ((typeof activeCallProspectId !== 'undefined') ? activeCallProspectId : null);
    if (card && !curActiveCall) {
      card.classList.remove('hud-manually-expanded');
    }

    if (tourListenersAttached && typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('resize', onTourWindowChange);
      window.removeEventListener('scroll', onTourWindowChange, true);
      tourListenersAttached = false;
    }

    if (typeof window !== 'undefined' && window.SFX && typeof window.SFX.playThought === 'function') {
      try { window.SFX.playThought(); } catch(e) {}
    }
  }

  function nextWorkspaceTourStep() {
    if (currentWorkspaceTourStep < WORKSPACE_TOUR_STEPS.length - 1) {
      currentWorkspaceTourStep++;
      renderWorkspaceTourStep(currentWorkspaceTourStep);
      updateTourSpotlight(currentWorkspaceTourStep, true);
      if (typeof window !== 'undefined' && window.SFX && typeof window.SFX.playJump === 'function') {
        try { window.SFX.playJump(); } catch(e) {}
      }
    } else {
      closeWorkspaceTour(true);
      const notify = typeof showNotification === 'function' ? showNotification : (window.showNotification || function(){});
      notify('[ADVANCED] Workstation flight manual complete. Ready to dominate outreach!');
      if (typeof window !== 'undefined' && window.SFX && typeof window.SFX.playCelebrate === 'function') {
        try { window.SFX.playCelebrate(); } catch(e) {}
      }

      const isTestMode = (typeof localStorage !== 'undefined' && localStorage.getItem('sprintdial_test_mode')) || (typeof window !== 'undefined' && window.__TEST_MODE__);
      const checkEligible = typeof isInstallAppEligible === 'function' ? isInstallAppEligible : (window.isInstallAppEligible || function(){ return false; });
      const checkStandalone = typeof isRunningInStandaloneMode === 'function' ? isRunningInStandaloneMode : (window.isRunningInStandaloneMode || function(){ return false; });
      if (!isTestMode && checkEligible() && !checkStandalone()) {
        if (typeof setTimeout === 'function') {
          setTimeout(() => {
            const openInstall = typeof openInstallAppModal === 'function' ? openInstallAppModal : (window.openInstallAppModal || function(){});
            openInstall();
          }, 350);
        }
      }
    }
  }

  function prevWorkspaceTourStep() {
    if (currentWorkspaceTourStep > 0) {
      currentWorkspaceTourStep--;
      renderWorkspaceTourStep(currentWorkspaceTourStep);
      updateTourSpotlight(currentWorkspaceTourStep, true);
      if (typeof window !== 'undefined' && window.SFX && typeof window.SFX.playJump === 'function') {
        try { window.SFX.playJump(); } catch(e) {}
      }
    }
  }

  function switchTourDeviceTab(mode) {
    currentTourDeviceTab = mode;
    updateTourInstructionsUI();
  }

  function updateTourInstructionsUI() {
    const step = WORKSPACE_TOUR_STEPS[currentWorkspaceTourStep];
    if (!step) return;
    const deskTab = document.getElementById('tourTabDesk');
    const mobTab = document.getElementById('tourTabMob');
    const labelEl = document.getElementById('tourGuidanceDeviceLabel');
    const activeList = document.getElementById('tourActiveInstructions');
    const laptopList = document.getElementById('tourLaptopInstructions');
    const mobileList = document.getElementById('tourMobileInstructions');

    const isDesk = currentTourDeviceTab === 'desk';

    if (deskTab) {
      deskTab.className = isDesk 
        ? 'px-1.5 py-0.5 text-[8px] font-arcade border border-[#17120f] bg-[#fce566] text-[#17120f] font-bold cursor-pointer'
        : 'px-1.5 py-0.5 text-[8px] font-arcade border border-[#17120f] bg-[#fffdf1] text-[#17120f] cursor-pointer';
    }
    if (mobTab) {
      mobTab.className = !isDesk
        ? 'px-1.5 py-0.5 text-[8px] font-arcade border border-[#17120f] bg-[#fce566] text-[#17120f] font-bold cursor-pointer'
        : 'px-1.5 py-0.5 text-[8px] font-arcade border border-[#17120f] bg-[#fffdf1] text-[#17120f] cursor-pointer';
    }
    if (labelEl) {
      labelEl.textContent = isDesk ? 'DESKTOP / LAPTOP CONTROLS' : 'MOBILE TOUCH CONTROLS';
    }

    if (activeList) {
      activeList.innerHTML = '';
    }
    if (laptopList) {
      laptopList.innerHTML = step.laptop.map(item => `<div>${item}</div>`).join('');
      if (laptopList.classList) {
        if (isDesk) laptopList.classList.remove('hidden');
        else laptopList.classList.add('hidden');
      }
      if (laptopList.style) {
        laptopList.style.display = isDesk ? '' : 'none';
      }
    }
    if (mobileList) {
      mobileList.innerHTML = step.mobile.map(item => `<div>${item}</div>`).join('');
      if (mobileList.classList) {
        if (!isDesk) mobileList.classList.remove('hidden');
        else mobileList.classList.add('hidden');
      }
      if (mobileList.style) {
        mobileList.style.display = !isDesk ? '' : 'none';
      }
    }
  }

  function renderWorkspaceTourStep(stepIndex) {
    const step = WORKSPACE_TOUR_STEPS[stepIndex];
    if (!step) return;

    const card = document.getElementById('callWrapCard');
    if (stepIndex === 6) {
      if (card) {
        card.classList.add('hud-manually-expanded');
      }
      const reachFn = typeof updateReachUI === 'function' ? updateReachUI : (window.updateReachUI || function(){});
      const outcomeFn = typeof updateOutcomeOptionsUI === 'function' ? updateOutcomeOptionsUI : (window.updateOutcomeOptionsUI || function(){});
      reachFn();
      outcomeFn();
    } else {
      const curActiveCall = (typeof window !== 'undefined' && window.activeCallProspectId) ? window.activeCallProspectId : ((typeof activeCallProspectId !== 'undefined') ? activeCallProspectId : null);
      if (card && !curActiveCall) {
        card.classList.remove('hud-manually-expanded');
      }
    }

    if (stepIndex === 7) {
      const openWallet = typeof openPartnerWalletModal === 'function' ? openPartnerWalletModal : (window.openPartnerWalletModal || function(){});
      openWallet(false);
    } else {
      const closeWallet = typeof closePartnerWalletModal === 'function' ? closePartnerWalletModal : (window.closePartnerWalletModal || function(){});
      closeWallet(false);
    }

    const badgeEl = document.getElementById('tourStepBadge');
    if (badgeEl) badgeEl.textContent = step.badge;

    const dotsContainer = document.getElementById('tourStepDots');
    if (dotsContainer) {
      dotsContainer.innerHTML = WORKSPACE_TOUR_STEPS.map((s, idx) => `
        <button type="button" onclick="openWorkspaceTour(${idx})" class="w-2.5 h-2.5 rounded-full border border-[#17120f] transition-all cursor-pointer ${idx === stepIndex ? 'bg-[#fce566] scale-125 border-2 shadow-[1px_1px_0_#17120f]' : 'bg-[#fffdf1]/60 hover:bg-[#fffdf1]'}" title="Jump to Step ${idx + 1}" aria-label="Step ${idx + 1}"></button>
      `).join('');
    }

    const visualBox = document.getElementById('tourVisualBox');
    if (visualBox) visualBox.textContent = step.visual;

    const titleEl = document.getElementById('tourStepTitle');
    if (titleEl) titleEl.textContent = step.title;

    const summaryEl = document.getElementById('tourStepSummary');
    if (summaryEl) summaryEl.textContent = step.summary;

    updateTourInstructionsUI();

    const proTipText = document.getElementById('tourProTipText');
    if (proTipText) proTipText.textContent = step.proTip;

    const prevBtn = document.getElementById('tourBtnPrev');
    if (prevBtn) {
      if (stepIndex === 0) {
        prevBtn.classList.add('opacity-40', 'pointer-events-none');
      } else {
        prevBtn.classList.remove('opacity-40', 'pointer-events-none');
      }
    }

    const nextBtnText = document.getElementById('tourBtnNextText');
    if (nextBtnText) {
      nextBtnText.textContent = stepIndex === WORKSPACE_TOUR_STEPS.length - 1 ? '[>] START DIALING' : 'NEXT STEP';
    }
  }

  const WorkspaceTourEngine = {
    WORKSPACE_TOUR_STEPS,
    openWorkspaceTour,
    closeWorkspaceTour,
    nextWorkspaceTourStep,
    prevWorkspaceTourStep,
    renderWorkspaceTourStep,
    updateTourSpotlight,
    pingTourTarget,
    switchTourDeviceTab,
    updateTourInstructionsUI
  };

  root.WORKSPACE_TOUR_STEPS = WORKSPACE_TOUR_STEPS;
  root.openWorkspaceTour = openWorkspaceTour;
  root.closeWorkspaceTour = closeWorkspaceTour;
  root.nextWorkspaceTourStep = nextWorkspaceTourStep;
  root.prevWorkspaceTourStep = prevWorkspaceTourStep;
  root.renderWorkspaceTourStep = renderWorkspaceTourStep;
  root.updateTourSpotlight = updateTourSpotlight;
  root.pingTourTarget = pingTourTarget;
  root.switchTourDeviceTab = switchTourDeviceTab;
  root.updateTourInstructionsUI = updateTourInstructionsUI;
  root.WorkspaceTourEngine = WorkspaceTourEngine;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkspaceTourEngine;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
