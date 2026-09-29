import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Subsystem 17: Sovereign Anti-Theft Moat & Cryptographic Data Shield", () => {
  let localStorageMock;
  let mockDom;

  beforeEach(() => {
    localStorageMock = {};
    global.localStorage = {
      getItem: vi.fn((key) => localStorageMock[key] || null),
      setItem: vi.fn((key, val) => { localStorageMock[key] = String(val); }),
      removeItem: vi.fn((key) => { delete localStorageMock[key]; }),
      clear: vi.fn(() => { localStorageMock = {}; })
    };

    mockDom = {
      activeName: { innerText: "" },
      activeRating: { innerText: "" },
      activeDM: { innerText: "" },
      activeCity: { innerText: "" },
      activeType: { innerText: "", className: "" },
      activeFee: { innerText: "" },
      activePhoneDisplay: { innerText: "" },
      btnToggleUnmaskPhone: { classList: { add: vi.fn(), remove: vi.fn() } },
      callPhoneText: { innerText: "" },
      callActionBtn: { href: "", title: "", onclick: null, classList: { remove: vi.fn(), add: vi.fn() } },
      mobileCallBtn: { href: "", onclick: null, classList: { remove: vi.fn(), add: vi.fn() } },
      whatsappActionBtn: { href: "", onclick: null },
      mobileWaBtn: { href: "", onclick: null },
      activeSiteLink: { href: "", style: {} },
      timingBadge: { innerText: "", className: "" },
      speedScore: { innerText: "", className: "" },
      lcpTime: { innerText: "" },
      techStackBadge: { innerText: "" },
      currentLockStatus: { innerText: "", className: "" },
      lockedBadge: { innerText: "", classList: { add: vi.fn(), remove: vi.fn() } },
      liveStatusMsg: { innerText: "" },
      lockNotificationBar: { classList: { add: vi.fn(), remove: vi.fn() } },
      flawsContainer: { innerHTML: "" },
      dossierPane: {
        scrollWidth: 380,
        scrollHeight: 1000,
        querySelector: vi.fn(() => null),
        appendChild: vi.fn()
      },
      clientTeardownModalBox: {
        scrollWidth: 600,
        scrollHeight: 800,
        querySelector: vi.fn(() => null),
        appendChild: vi.fn()
      },
      proposalModalBox: {
        scrollWidth: 600,
        scrollHeight: 800,
        querySelector: vi.fn(() => null),
        appendChild: vi.fn()
      }
    };

    global.document = {
      getElementById: vi.fn((id) => mockDom[id] || null),
      createElement: vi.fn((tag) => ({
        tagName: tag.toUpperCase(),
        className: "",
        style: {},
        setAttribute: vi.fn(),
        getContext: vi.fn(() => ({
          clearRect: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          rotate: vi.fn(),
          fillText: vi.fn()
        })),
        width: 0,
        height: 0
      })),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };

    global.window = global;
    global.window.addEventListener = vi.fn();
    global.window.removeEventListener = vi.fn();
    global.window.location = { href: "", origin: "http://localhost:5173" };
    global.window.triggerHaptic = vi.fn();
    global.playSound = vi.fn();
    global.showNotification = vi.fn();

    global.PROSPECTS = [
      { id: "p-test-1", name: "Apex Dental Studio", city: "Kochi", dm: "Dr. Apex", phone: "+91 94470 12345", tel: "+919447012345", fee: "₹50,000", status: "available" },
      { id: "p-test-2", name: "Luxe Spatial Resort", city: "Kumarakom", dm: "Mr. Resort", phone: "+91 98460 54321", tel: "+919846054321", fee: "₹80,000", status: "available" }
    ];
  });

  it("17.1 Masks phone numbers correctly preserving country/operator prefix and hiding personal digits", async () => {
    await import("../../workspace/app.js");
    const { maskPhoneNumber } = global;

    expect(maskPhoneNumber("+91 94470 12345")).toBe("+91 94470 •••••");
    expect(maskPhoneNumber("+91 98460 54321")).toBe("+91 98460 •••••");
    expect(maskPhoneNumber("9447012345")).toBe("94470•••••");
    expect(maskPhoneNumber("")).toBe("--");
    expect(maskPhoneNumber(null)).toBe("--");
  });

  it("17.2 Enforces Owner unmasking bypass vs Partner masked default", async () => {
    await import("../../workspace/app.js");
    const { isProspectPhoneUnmasked, unmaskProspectPhone } = global;

    // As partner: initially masked
    global.currentUser = { email: "rep@sprintdial.internal", name: "Outreach Partner", role: "caller" };
    expect(isProspectPhoneUnmasked("p-test-1")).toBe(false);

    // Unmasking p-test-1 marks it unmasked for this session
    const ok = unmaskProspectPhone("p-test-1");
    expect(ok).toBe(true);
    expect(isProspectPhoneUnmasked("p-test-1")).toBe(true);
    expect(isProspectPhoneUnmasked("p-test-2")).toBe(false);

    // As Owner (apoorvxs@gmail.com): always unmasked for all prospects
    global.currentUser = { email: "apoorvxs@gmail.com", name: "Apoorv A S", role: "owner" };
    expect(isProspectPhoneUnmasked("p-test-2")).toBe(true);
  });

  it("17.3 Enforces hourly velocity limit of 10 unmasks per partner and flags risk alert", async () => {
    await import("../../workspace/app.js");
    const { checkUnmaskVelocity, recordUnmaskVelocity, unmaskProspectPhone, getAuditLogs } = global;

    global.currentUser = { email: "quota_tester@gmail.com", name: "Quota Rep", role: "caller" };

    // Simulate 10 recorded unmasks within the current hour
    for (let i = 0; i < 10; i++) {
      recordUnmaskVelocity(`p-bulk-${i}`);
    }

    const check = checkUnmaskVelocity();
    expect(check.allowed).toBe(false);
    expect(check.count).toBe(10);
    expect(check.limit).toBe(10);

    // Attempting an 11th unmask is blocked and triggers UNMASK_VELOCITY_EXCEEDED
    const result = unmaskProspectPhone("p-test-2");
    expect(result).toBe(false);
    expect(mockDom.liveStatusMsg.innerText).toContain("Unmask rate limit reached");

    const logs = getAuditLogs();
    const breachEvent = logs.find(l => l.actionType === "UNMASK_VELOCITY_EXCEEDED");
    expect(breachEvent).toBeDefined();
    expect(breachEvent.isRisk).toBe(true);
    expect(breachEvent.riskBadge).toBe("[ALERT] RATE LIMIT");
  });

  it("17.4 Encodes and decodes zero-width steganographic signatures flawlessly", async () => {
    await import("../../workspace/app.js");
    const { encodeSteganographicTag, decodeSteganographicTag } = global;

    const secretPayload = "OP:hunter_99@gmail.com:SES456:1759100000000";
    const stegoSignature = encodeSteganographicTag(secretPayload);

    // Verify signature only contains zero-width unicode characters
    expect(stegoSignature.length).toBeGreaterThan(10);
    const zeroWidthRegex = /^[\u200B\u200C\u200D]+$/;
    expect(zeroWidthRegex.test(stegoSignature)).toBe(true);

    // Embed in normal pitch text
    const pitchText = `Here is our 60 FPS Three.js mobile benchmark for your hospital.${stegoSignature} Contact Apoorv.`;
    const extractedPayload = decodeSteganographicTag(pitchText);
    expect(extractedPayload).toBe(secretPayload);
  });

  it("17.5 Taints copied markdown and pitches for partners but leaves Owner exports pristine", async () => {
    await import("../../workspace/app.js");
    const { taintAttributedText, decodeSteganographicTag } = global;

    const originalBrief = "## Executive Technical Proposal for Aster Dental\n- LCP: 4.4s\n- 60 FPS Three.js Showcase";

    // As partner: text is tainted with stego hash and attribution footer
    global.currentUser = { email: "partner_scout@gmail.com", name: "Partner Scout", role: "caller" };
    const partnerTainted = taintAttributedText(originalBrief, "proposal_export");
    expect(partnerTainted).toContain(originalBrief);
    expect(partnerTainted).toContain("Verified Client Brief • Authorized via Apoorv A S (apoorv.qzz.io)");
    const decodedSignature = decodeSteganographicTag(partnerTainted);
    expect(decodedSignature).toContain("partner_scout@gmail.com");

    // As Owner (apoorvxs@gmail.com): text remains completely clean
    global.currentUser = { email: "apoorvxs@gmail.com", name: "Apoorv A S", role: "owner" };
    const ownerClean = taintAttributedText(originalBrief, "proposal_export");
    expect(ownerClean).toBe(originalBrief);
    expect(ownerClean).not.toContain("Verified Client Brief");
  });

  it("17.6 Attaches multi-surface forensic watermark across dossier and modals for partners", async () => {
    await import("../../workspace/app.js");
    const { initForensicWatermark } = global;

    // As partner: creates/renders watermark canvases on all 3 target containers
    global.currentUser = { email: "external_partner@gmail.com", name: "External Rep", role: "caller" };
    initForensicWatermark();

    expect(mockDom.dossierPane.appendChild).toHaveBeenCalled();
    expect(mockDom.clientTeardownModalBox.appendChild).toHaveBeenCalled();
    expect(mockDom.proposalModalBox.appendChild).toHaveBeenCalled();

    // As Owner: watermark is exempted
    global.currentUser = { email: "apoorvxs@gmail.com", name: "Apoorv A S", role: "owner" };
    const mockCanvas = { style: { display: "" } };
    mockDom.dossierPane.querySelector = vi.fn(() => mockCanvas);
    mockDom.clientTeardownModalBox.querySelector = vi.fn(() => mockCanvas);
    mockDom.proposalModalBox.querySelector = vi.fn(() => mockCanvas);

    initForensicWatermark();
    expect(mockCanvas.style.display).toBe("none");
  });
});
