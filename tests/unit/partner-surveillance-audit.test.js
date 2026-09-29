import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Subsystem 16: Partner Anti-Theft Surveillance Radar & Owner Fleet Telemetry", () => {
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

    // Setup DOM elements representing workspace/index.html profile dropdown and admin table
    mockDom = {
      userProfileDropdown: { classList: { contains: vi.fn(() => false), remove: vi.fn(), add: vi.fn() } },
      profileCockpitTitle: { textContent: "" },
      profileCard1Title: { textContent: "" },
      profileCard2Title: { textContent: "" },
      profileCard3Title: { textContent: "" },
      profileCard4Title: { textContent: "" },
      profileCallbackSubtitle: { textContent: "" },
      profileDialsToday: { textContent: "" },
      profileDialsGoalText: { textContent: "" },
      profileDialProgressBar: { style: { width: "0%" } },
      profileSuccessCount: { textContent: "" },
      profileWinRateBadge: { textContent: "" },
      profileBookedValue: { textContent: "" },
      profileRejectionCount: { textContent: "" },
      profileRejectionBreakdown: { textContent: "" },
      profileCallbackCount: { textContent: "" },
      profileShiftDate: { textContent: "" },
      ownerFleetSummaryStrip: { classList: { remove: vi.fn(), add: vi.fn() } },
      ownerSurveillanceStreamContainer: { classList: { remove: vi.fn(), add: vi.fn() } },
      ownerAuditTrailList: { innerHTML: "", appendChild: vi.fn() },
      ownerActivePartnersCount: { textContent: "" },
      ownerLeakRadarBadge: { textContent: "", className: "" },
      ownerActionButtons: { classList: { remove: vi.fn(), add: vi.fn() } },
      callerActionButtons: { classList: { remove: vi.fn(), add: vi.fn() } },
      dropdownAdminBtn: { classList: { remove: vi.fn(), add: vi.fn() } },
      dropdownRolePill: { textContent: "", className: "" },
      userRoleBadge: { textContent: "", className: "" },
      adminSurveillanceLogsBody: { innerHTML: "", appendChild: vi.fn() },
      adminSurveillanceTotalTouches: { textContent: "" },
      adminSurveillanceActiveCallers: { textContent: "" },
      adminSurveillanceTeardownCount: { textContent: "" },
      adminSurveillanceLeakCount: { textContent: "" },
      adminModal: { classList: { contains: vi.fn(() => false) } },
      adminTabLogs: { classList: { contains: vi.fn(() => false) } },
      liveStatusMsg: { innerText: "" },
      lockNotificationBar: { classList: { add: vi.fn(), remove: vi.fn() } }
    };

    global.document = {
      getElementById: vi.fn((id) => mockDom[id] || null),
      createElement: vi.fn((tag) => ({
        tagName: tag.toUpperCase(),
        className: "",
        innerHTML: "",
        textContent: "",
        appendChild: vi.fn()
      }))
    };

    global.window = global;
    global.window.addEventListener = vi.fn();
    global.window.removeEventListener = vi.fn();
    global.window.location = { reload: vi.fn(), href: "" };
    global.window.innerWidth = 1440;
    global.window.innerHeight = 900;
    global.addEventListener = global.window.addEventListener;
    global.removeEventListener = global.window.removeEventListener;

    class MockBroadcastChannel {
      constructor(name) {
        this.name = name;
        this.onmessage = null;
      }
      postMessage(data) {}
      close() {}
    }
    global.BroadcastChannel = MockBroadcastChannel;

    global.playSound = vi.fn();
    global.showNotification = vi.fn();
    global.PROSPECTS = [
      { id: "p-1", name: "Aster Medcity Specialty Dental", city: "Kochi", dm: "Dr. Varghese", fee: "₹50,000", targetFee: 50000, status: "available" },
      { id: "p-2", name: "Smile Architectural Studio", city: "Bangalore", dm: "Ar. Rahul", fee: "₹75,000", targetFee: 75000, status: "discovery_booked" },
      { id: "p-3", name: "Dr. Mohan Eye Institute", city: "Kochi", dm: "Dr. Mohan", fee: "₹50,000", targetFee: 50000, status: "not_interested" }
    ];
  });

  it("16.1 Records partner activities and flags CSV export as a critical leak alert", async () => {
    await import("../../workspace/app.js");
    const { recordPartnerActivity, getAuditLogs } = global;

    global.currentUser = { email: "partner_rep@gmail.com", name: "Partner Rep", role: "caller" };

    const entry = recordPartnerActivity("CSV_EXPORT", null, { count: 60, territory: "Kochi" });

    expect(entry).toBeDefined();
    expect(entry.actionType).toBe("CSV_EXPORT");
    expect(entry.isRisk).toBe(true);
    expect(entry.riskLabel).toBe("CRITICAL LEAK ALERT");
    expect(entry.callerEmail).toBe("partner_rep@gmail.com");

    const logs = getAuditLogs();
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs[0].id).toBe(entry.id);
  });

  it("16.2 Flags 3D teardown pitch link copying by external partners as sensitive risk", async () => {
    await import("../../workspace/app.js");
    const { recordPartnerActivity } = global;

    // Partner generates link
    global.currentUser = { email: "sneha_outreach@gmail.com", name: "Sneha", role: "caller" };
    const partnerEntry = recordPartnerActivity("TEARDOWN_PITCH", "p-1", { mode: "clipboard_copy" });
    expect(partnerEntry.isRisk).toBe(true);
    expect(partnerEntry.riskLabel).toBe("UNAUTHORIZED PITCH");

    // Owner generates link — MUST be suppressed entirely (never recorded)
    global.currentUser = { email: "apoorvxs@gmail.com", name: "Apoorv A S", role: "owner" };
    const ownerEntry = recordPartnerActivity("TEARDOWN_PITCH", "p-1", { mode: "clipboard_copy" });
    expect(ownerEntry).toBeUndefined();
  });

  it("16.3 Limits audit trail storage to 200 entries to prevent memory bloat", async () => {
    await import("../../workspace/app.js");
    const { recordPartnerActivity, getAuditLogs } = global;

    global.currentUser = { email: "caller@test.com", name: "Caller", role: "caller" };

    for (let i = 0; i < 215; i++) {
      recordPartnerActivity("DOSSIER_VIEW", "p-1", { index: i });
    }

    const logs = getAuditLogs();
    expect(logs.length).toBe(200);
  });

  it("16.4 Renders Owner Fleet Radar & Anti-Theft Surveillance Cockpit when authenticated as apoorvxs@gmail.com", async () => {
    await import("../../workspace/app.js");
    const { updateProfileDropdownUI, recordPartnerActivity } = global;

    // Add some partner activity
    global.currentUser = { email: "rogue_rep@gmail.com", name: "Rogue Rep", role: "caller" };
    recordPartnerActivity("CSV_EXPORT", null, { count: 65, territory: "All" });

    // Switch to Owner
    global.currentUser = { email: "apoorvxs@gmail.com", name: "Apoorv A S", role: "owner" };
    updateProfileDropdownUI();

    // Verify Owner cockpit title & titles
    expect(mockDom.profileCockpitTitle.textContent).toBe("RADAR // PARTNER AUDIT TRAIL");
    expect(mockDom.profileCard1Title.textContent).toBe("OUTREACH // FLEET DIALS");
    expect(mockDom.profileCard2Title.textContent).toBe("PIPELINE // FLEET VALUE");
    expect(mockDom.dropdownRolePill.textContent).toBe("OWNER");

    // Verify Owner summary strip and surveillance container are shown
    expect(mockDom.ownerFleetSummaryStrip.classList.remove).toHaveBeenCalledWith("hidden");
    expect(mockDom.ownerSurveillanceStreamContainer.classList.remove).toHaveBeenCalledWith("hidden");
    expect(mockDom.ownerActionButtons.classList.remove).toHaveBeenCalledWith("hidden");
    expect(mockDom.callerActionButtons.classList.add).toHaveBeenCalledWith("hidden");

    // Verify redundant admin console button is hidden for Owner
    expect(mockDom.dropdownAdminBtn.classList.add).toHaveBeenCalledWith("hidden");

    // Verify leak radar badge updated
    expect(mockDom.ownerLeakRadarBadge.textContent).toContain("LEAK ALERT");
  });

  it("16.5 Renders standard Caller Shift Telemetry with reset counter when authenticated as partner", async () => {
    await import("../../workspace/app.js");
    const { updateProfileDropdownUI } = global;

    global.currentUser = { email: "partner@firm.com", name: "Partner Caller", role: "caller" };
    updateProfileDropdownUI();

    expect(mockDom.profileCockpitTitle.textContent).toBe("TELEMETRY // REVENUE RADAR");
    expect(mockDom.profileCard1Title.textContent).toBe("OUTREACH // DIALS");
    expect(mockDom.profileCard2Title.textContent).toBe("CONVERTED // BOOKED");
    expect(mockDom.dropdownRolePill.textContent).toBe("PARTNER");

    // Verify owner surveillance elements are hidden for caller
    expect(mockDom.ownerFleetSummaryStrip.classList.add).toHaveBeenCalledWith("hidden");
    expect(mockDom.ownerSurveillanceStreamContainer.classList.add).toHaveBeenCalledWith("hidden");
    expect(mockDom.ownerActionButtons.classList.add).toHaveBeenCalledWith("hidden");
    expect(mockDom.callerActionButtons.classList.remove).toHaveBeenCalledWith("hidden");
  });

  it("16.6 Ingests broadcast audit events across open tabs and alerts Owner on leak detection", async () => {
    await import("../../workspace/app.js");
    const { handleIncomingRealtimeEvent, getAuditLogs } = global;

    global.currentUser = { email: "apoorvxs@gmail.com", name: "Apoorv A S", role: "owner" };

    const incomingLeakEvent = {
      type: "PARTNER_AUDIT_ACTIVITY",
      entry: {
        id: "aud_tab_cross_1",
        timestamp: Date.now(),
        callerEmail: "external_partner@domain.com",
        callerName: "External Partner",
        isOwner: false,
        actionType: "CSV_EXPORT",
        prospectId: null,
        prospectName: "Active Queue",
        isRisk: true,
        riskBadge: "[ALERT] CSV EXPORT",
        description: "External Partner exported 60 leads to CSV"
      }
    };

    handleIncomingRealtimeEvent(incomingLeakEvent);

    const logs = getAuditLogs();
    expect(logs.some(l => l.id === "aud_tab_cross_1")).toBe(true);
    expect(mockDom.liveStatusMsg.innerText).toContain("SURVEILLANCE RADAR");
  });
});
