import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Subsystem 21: Interactive Workstation Guided Walkthrough Overlay (Mobile & Laptop)", () => {
  let mockDom;
  let mockLocalStorage;
  let appScope;

  beforeEach(async () => {
    mockLocalStorage = {};
    global.localStorage = {
      getItem: vi.fn((key) => mockLocalStorage[key] || null),
      setItem: vi.fn((key, val) => { mockLocalStorage[key] = String(val); }),
      removeItem: vi.fn((key) => { delete mockLocalStorage[key]; }),
      clear: vi.fn(() => { mockLocalStorage = {}; })
    };

    mockDom = {
      workspaceTourModal: {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
          contains: vi.fn((cls) => cls === "hidden")
        },
        style: { display: "none" }
      },
      tourStepBadge: { textContent: "" },
      tourStepDots: { innerHTML: "" },
      tourVisualBox: { textContent: "" },
      tourStepTitle: { textContent: "" },
      tourStepSummary: { textContent: "" },
      tourLaptopInstructions: { innerHTML: "" },
      tourMobileInstructions: { innerHTML: "" },
      tourProTipText: { textContent: "" },
      tourBtnPrev: {
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        }
      },
      tourBtnNextText: { textContent: "" },
      onboardingDisclaimer: {
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        },
        style: { display: "none" }
      }
    };

    global.document = {
      getElementById: vi.fn((id) => mockDom[id] || null),
      querySelector: vi.fn(() => null),
      querySelectorAll: vi.fn(() => []),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };

    global.window = global;
    global.window.localStorage = global.localStorage;
    global.window.document = global.document;
    global.window.addEventListener = vi.fn();
    global.window.removeEventListener = vi.fn();
    global.window.location = { reload: vi.fn(), href: "" };
    global.window.innerWidth = 1440;
    global.window.innerHeight = 900;
    global.window.SFX = {
      playLaserConstruct: vi.fn(),
      playThought: vi.fn(),
      playJump: vi.fn(),
      playCelebrate: vi.fn()
    };
    global.addEventListener = global.window.addEventListener;
    global.removeEventListener = global.window.removeEventListener;

    appScope = await import("../../workspace/app.js");
  });

  it("21.1 WORKSPACE_TOUR_STEPS contains 5 comprehensive dual-device guided steps", () => {
    const steps = appScope.WORKSPACE_TOUR_STEPS || window.WORKSPACE_TOUR_STEPS;
    expect(steps).toBeDefined();
    expect(steps.length).toBe(5);

    steps.forEach((step, idx) => {
      expect(step.step).toBe(idx + 1);
      expect(step.total).toBe(5);
      expect(step.badge).toBeTruthy();
      expect(step.title).toBeTruthy();
      expect(step.summary).toBeTruthy();
      expect(step.visual).toBeTruthy();
      expect(Array.isArray(step.laptop)).toBe(true);
      expect(step.laptop.length).toBeGreaterThan(0);
      expect(Array.isArray(step.mobile)).toBe(true);
      expect(step.mobile.length).toBeGreaterThan(0);
      expect(step.proTip).toBeTruthy();
    });
  });

  it("21.2 Step 1 provides Territory Queue & Zombie Radar instructions for laptop and mobile", () => {
    const step1 = (appScope.WORKSPACE_TOUR_STEPS || window.WORKSPACE_TOUR_STEPS)[0];
    expect(step1.title).toContain("Territory Queue");
    expect(step1.visual).toContain("ZOMBIE");
    expect(step1.visual).toContain("OVERDUE");

    const laptopText = step1.laptop.join(" ");
    expect(laptopText).toMatch(/Left Column|Hotkeys|Next Lead/i);

    const mobileText = step1.mobile.join(" ");
    expect(mobileText).toMatch(/QUEUE|ZOMBIE|OVERDUE/i);
  });

  it("21.3 Step 2 teaches Client Dossier and speed revenue leaks before dialing", () => {
    const step2 = (appScope.WORKSPACE_TOUR_STEPS || window.WORKSPACE_TOUR_STEPS)[1];
    expect(step2.title).toContain("Dossier");
    expect(step2.visual).toContain("MOBILE LCP");
    expect(step2.visual).toContain("AGGREGATOR");

    const laptopText = step2.laptop.join(" ");
    expect(laptopText).toMatch(/Center Dossier|LAYMAN ANALOGIES|revenue/i);

    const mobileText = step2.mobile.join(" ");
    expect(mobileText).toMatch(/DOSSIER|4G|drop-off/i);
  });

  it("21.4 Step 3 explains the In-Call Flight HUD and mandatory 2-step disposition gate", () => {
    const step3 = (appScope.WORKSPACE_TOUR_STEPS || window.WORKSPACE_TOUR_STEPS)[2];
    expect(step3.title).toContain("In-Call Flight HUD");
    expect(step3.visual).toContain("LIVE DIAL");
    expect(step3.visual).toContain("STEP 1");
    expect(step3.visual).toContain("STEP 2");

    const laptopText = step3.laptop.join(" ");
    expect(laptopText).toMatch(/Cancel Dial|Reach Status|Outcome|Hotkeys|Space/i);

    const mobileText = step3.mobile.join(" ");
    expect(mobileText).toMatch(/COCKPIT|44px|Nudge/i);
  });

  it("21.5 Step 4 explains the Two-Track Closing terminal (15% direct vs 10% founder handoff)", () => {
    const step4 = (appScope.WORKSPACE_TOUR_STEPS || window.WORKSPACE_TOUR_STEPS)[3];
    expect(step4.title).toContain("Two-Track Deal Closing");
    expect(step4.visual).toContain("TRACK 1");
    expect(step4.visual).toContain("TRACK 2");

    const laptopText = step4.laptop.join(" ");
    expect(laptopText).toMatch(/15% Cut|10% Cut|Google Meet|UPI deposit QR/i);

    const mobileText = step4.mobile.join(" ");
    expect(mobileText).toMatch(/WhatsApp|UPI/i);
  });

  it("21.6 Step 5 highlights the Sovereign Commission Wallet, Streaks and Closer Hotkeys", () => {
    const step5 = (appScope.WORKSPACE_TOUR_STEPS || window.WORKSPACE_TOUR_STEPS)[4];
    expect(step5.title).toContain("Commission Wallet");
    expect(step5.visual).toContain("EARNED");
    expect(step5.visual).toContain("STREAK");

    const laptopText = step5.laptop.join(" ");
    expect(laptopText).toMatch(/Wallet Pill|UPI Payouts|Closer Hotkeys/i);

    const mobileText = step5.mobile.join(" ");
    expect(mobileText).toMatch(/Header|Audio Chimes|milestones/i);
  });

  it("21.7 openWorkspaceTour opens modal, sets step content, and clamps bounds", () => {
    const openTour = appScope.openWorkspaceTour || window.openWorkspaceTour;
    openTour(0);

    expect(mockDom.workspaceTourModal.classList.remove).toHaveBeenCalledWith("hidden");
    expect(mockDom.workspaceTourModal.style.display).toBe("flex");
    expect(mockDom.tourStepTitle.textContent).toContain("Territory Queue");
    expect(mockDom.tourStepBadge.textContent).toBe("STEP 1 OF 5 // QUEUE");
    expect(mockDom.tourBtnNextText.textContent).toBe("NEXT STEP");
    expect(mockDom.tourBtnPrev.classList.add).toHaveBeenCalledWith("opacity-40", "pointer-events-none");
  });

  it("21.8 nextWorkspaceTourStep navigates sequentially and finishes with completion flag", () => {
    const openTour = appScope.openWorkspaceTour || window.openWorkspaceTour;
    const nextStep = appScope.nextWorkspaceTourStep || window.nextWorkspaceTourStep;

    openTour(0);
    expect(mockDom.tourStepTitle.textContent).toContain("Territory Queue");

    // Advance to Step 2
    nextStep();
    expect(mockDom.tourStepTitle.textContent).toContain("Dossier");

    // Advance to Step 3
    nextStep();
    expect(mockDom.tourStepTitle.textContent).toContain("In-Call Flight HUD");

    // Advance to Step 4
    nextStep();
    expect(mockDom.tourStepTitle.textContent).toContain("Two-Track Deal Closing");

    // Advance to Step 5
    nextStep();
    expect(mockDom.tourStepTitle.textContent).toContain("Commission Wallet");
    expect(mockDom.tourBtnNextText.textContent).toBe("🚀 START DIALING");

    // Final Next click finishes and closes
    nextStep();
    expect(mockLocalStorage["sprintdial_tour_completed"]).toBe("true");
    expect(mockDom.workspaceTourModal.classList.add).toHaveBeenCalledWith("hidden");
    expect(window.SFX.playCelebrate).toHaveBeenCalled();
  });

  it("21.9 prevWorkspaceTourStep decrements step safely and does not drop below 0", () => {
    const openTour = appScope.openWorkspaceTour || window.openWorkspaceTour;
    const nextStep = appScope.nextWorkspaceTourStep || window.nextWorkspaceTourStep;
    const prevStep = appScope.prevWorkspaceTourStep || window.prevWorkspaceTourStep;

    openTour(2);
    expect(mockDom.tourStepTitle.textContent).toContain("In-Call Flight HUD");

    prevStep();
    expect(mockDom.tourStepTitle.textContent).toContain("Dossier");

    prevStep();
    expect(mockDom.tourStepTitle.textContent).toContain("Territory Queue");

    // Edge: cannot drop below 0
    prevStep();
    expect(mockDom.tourStepTitle.textContent).toContain("Territory Queue");
  });

  it("21.10 closeWorkspaceTour dismisses modal and persists completed status", () => {
    const openTour = appScope.openWorkspaceTour || window.openWorkspaceTour;
    const closeTour = appScope.closeWorkspaceTour || window.closeWorkspaceTour;

    openTour(1);
    closeTour(true);

    expect(mockDom.workspaceTourModal.classList.add).toHaveBeenCalledWith("hidden");
    expect(mockDom.workspaceTourModal.style.display).toBe("none");
    expect(mockLocalStorage["sprintdial_tour_completed"]).toBe("true");
  });
});
