import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Subsystem 18: Guided In-Call Workflow & Mandatory Disposition Gate", () => {
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

    const callWrapCardMock = {
      classList: {
        _classes: new Set(),
        add: vi.fn(function(c) { this._classes.add(c); }),
        remove: vi.fn(function(c) { this._classes.delete(c); }),
        contains: vi.fn(function(c) { return this._classes.has(c); })
      },
      offsetWidth: 300
    };

    const btnNextLeadHandoffMock = {
      innerHTML: "",
      classList: {
        _classes: new Set(),
        add: vi.fn(function(c) { this._classes.add(c); }),
        remove: vi.fn(function(c) { this._classes.delete(c); }),
        contains: vi.fn(function(c) { return this._classes.has(c); })
      }
    };

    const outcomeOptionsContainerMock = {
      innerHTML: "",
      querySelectorAll: vi.fn(() => [])
    };

    mockDom = {
      callWrapCard: callWrapCardMock,
      callFlightBadge: { className: "" },
      callFlightDot: { className: "" },
      callFlightStatusText: { innerText: "" },
      callTimerBox: {
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        }
      },
      callTimerDigits: { innerText: "00:00" },
      btnCancelDial: {
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        }
      },
      reachValidationIndicator: {
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        }
      },
      outcomeValidationIndicator: {
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        }
      },
      outcomeStepTitle: { innerText: "" },
      outcomeOptionsContainer: outcomeOptionsContainerMock,
      btnReachDM: { classList: { add: vi.fn(), remove: vi.fn() } },
      btnReachGK: { classList: { add: vi.fn(), remove: vi.fn() } },
      btnReachNoAns: { classList: { add: vi.fn(), remove: vi.fn() } },
      btnReachInvalid: { classList: { add: vi.fn(), remove: vi.fn() } },
      callNotesInput: { value: "", focus: vi.fn() },
      discoveryInput: { value: "", focus: vi.fn() },
      btnNextLeadHandoff: btnNextLeadHandoffMock,
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
      dialProgressBar: { style: {} },
      queueList: { innerHTML: "", appendChild: vi.fn() }
    };

    global.document = {
      getElementById: vi.fn((id) => {
        if (!mockDom[id]) {
          mockDom[id] = {
            innerText: "",
            innerHTML: "",
            value: "",
            className: "",
            classList: {
              _classes: new Set(),
              add: vi.fn(function(c) { this._classes.add(c); }),
              remove: vi.fn(function(c) { this._classes.delete(c); }),
              contains: vi.fn(function(c) { return this._classes.has(c); })
            },
            style: {},
            scrollWidth: 600,
            scrollHeight: 800,
            setAttribute: vi.fn(),
            appendChild: vi.fn(),
            focus: vi.fn(),
            querySelector: vi.fn(() => null),
            querySelectorAll: vi.fn(() => [])
          };
        }
        if (!mockDom[id].querySelector) mockDom[id].querySelector = vi.fn(() => null);
        if (!mockDom[id].querySelectorAll) mockDom[id].querySelectorAll = vi.fn(() => []);
        return mockDom[id];
      }),
      querySelector: vi.fn((sel) => null),
      querySelectorAll: vi.fn((sel) => []),
      createElement: vi.fn((tag) => ({
        tagName: tag.toUpperCase(),
        className: "",
        style: {},
        setAttribute: vi.fn(),
        appendChild: vi.fn(),
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
      { id: "p-test-1", name: "Apex Dental Studio", city: "Kochi", dm: "Dr. Apex", phone: "+91 94470 12345", tel: "+919447012345", fee: "₹50,000", status: "ready" },
      { id: "p-test-2", name: "Luxe Spatial Resort", city: "Kumarakom", dm: "Mr. Resort", phone: "+91 98460 54321", tel: "+919846054321", fee: "₹80,000", status: "ready" },
      { id: "p-test-3", name: "Cochin Orthodontics", city: "Kochi", dm: "Dr. Thomas", phone: "+91 97450 99887", tel: "+919745099887", fee: "₹50,000", status: "ready" }
    ];
  });

  it("18.1 Sets in-call flight active state and begins call pending disposition upon dial initiation", async () => {
    await import("../../workspace/app.js");
    const { handleCallInitiated, getCallWorkflowState, setSelectedProspectId } = global;

    // Set partner session
    global.currentUser = { email: "partner1@hermes.io", name: "Alpha Partner", role: "caller" };
    if (setSelectedProspectId) setSelectedProspectId("p-test-1");
    else global.selectedProspectId = "p-test-1";

    handleCallInitiated();

    const state = global.getCallWorkflowState();
    expect(state.isCallActive).toBe(true);
    expect(state.callPendingDisposition).toBe(true);
    expect(state.activeCallProspectId).toBe("p-test-1");
    expect(state.currentCallReach).toBe(null);
    expect(state.currentCallOutcome).toBe(null);

    // Call timer box unhidden
    expect(mockDom.callTimerBox.classList.remove).toHaveBeenCalledWith("hidden");
    expect(mockDom.callTimerBox.classList.add).toHaveBeenCalledWith("flex");
  });

  it("18.2 Mandatory Disposition Gate blocks partner advancement when disposition is incomplete", async () => {
    await import("../../workspace/app.js");
    const { canAdvanceLead, advanceLead, setCallWorkflowState, setSelectedProspectId } = global;

    global.currentUser = { email: "partner1@hermes.io", name: "Alpha Partner", role: "caller" };
    if (setSelectedProspectId) setSelectedProspectId("p-test-1");
    else global.selectedProspectId = "p-test-1";

    // Call was initiated and ended, but reach & outcome not yet logged
    setCallWorkflowState({
      isCallActive: false,
      callPendingDisposition: true,
      activeCallProspectId: "p-test-1",
      currentCallReach: null,
      currentCallOutcome: null
    });

    // Advance check should block
    expect(canAdvanceLead()).toBe(false);

    // Shakes card and displays warning
    expect(mockDom.callWrapCard.classList.add).toHaveBeenCalledWith("shake-card");
    expect(global.showNotification).toHaveBeenCalledWith(
      expect.stringContaining("Complete call disposition")
    );

    // advanceLead should not change selectedProspectId
    advanceLead(1);
    expect(global.selectedProspectId).toBe("p-test-1");
  });

  it("18.3 Dynamically updates Step 2 outcomes based on Step 1 Reach status", async () => {
    await import("../../workspace/app.js");
    const { setCallReach, getCallWorkflowState } = global;

    // 1. Spoke to DM
    setCallReach("dm_connected");
    expect(getCallWorkflowState().currentCallReach).toBe("dm_connected");
    expect(mockDom.outcomeStepTitle.innerText).toBe("DECISION MAKER OUTCOME");
    expect(mockDom.outcomeOptionsContainer.innerHTML).toContain("discovery_booked");
    expect(mockDom.outcomeOptionsContainer.innerHTML).toContain("teardown_sent");

    // 2. Gatekeeper
    setCallReach("gatekeeper");
    expect(getCallWorkflowState().currentCallReach).toBe("gatekeeper");
    expect(mockDom.outcomeStepTitle.innerText).toBe("GATEKEEPER OUTCOME");
    expect(mockDom.outcomeOptionsContainer.innerHTML).toContain("gatekeeper_callback");
    expect(mockDom.outcomeOptionsContainer.innerHTML).toContain("gatekeeper_rejection");

    // 3. No Answer
    setCallReach("no_answer");
    expect(getCallWorkflowState().currentCallReach).toBe("no_answer");
    expect(mockDom.outcomeStepTitle.innerText).toBe("NO ANSWER OUTCOME");
    expect(mockDom.outcomeOptionsContainer.innerHTML).toContain("callback");
    expect(mockDom.outcomeOptionsContainer.innerHTML).toContain("REQUEUE TOMORROW");

    // 4. Invalid Number
    setCallReach("invalid_number");
    expect(getCallWorkflowState().currentCallReach).toBe("invalid_number");
    expect(mockDom.outcomeStepTitle.innerText).toBe("INVALID NUMBER OUTCOME");
    expect(mockDom.outcomeOptionsContainer.innerHTML).toContain("blacklisted");
  });

  it("18.4 Validates disposition and allows advance once both Reach and Outcome are selected", async () => {
    await import("../../workspace/app.js");
    const { setCallReach, setCallOutcome, validateCallDisposition, canAdvanceLead, setCallWorkflowState } = global;

    global.currentUser = { email: "partner1@hermes.io", name: "Alpha Partner", role: "caller" };
    global.selectedProspectId = "p-test-1";

    setCallWorkflowState({
      isCallActive: false,
      callPendingDisposition: true,
      activeCallProspectId: "p-test-1",
      currentCallReach: null,
      currentCallOutcome: null
    });

    expect(validateCallDisposition()).toBe(false);
    expect(canAdvanceLead()).toBe(false);

    // Select Reach
    setCallReach("dm_connected");
    expect(validateCallDisposition()).toBe(false);

    // Select Outcome
    setCallOutcome("discovery_booked");
    expect(validateCallDisposition()).toBe(true);
    expect(canAdvanceLead()).toBe(true);
  });

  it("18.5 Misclick escape hatch cleanly cancels dial without penalizing or locking partner", async () => {
    await import("../../workspace/app.js");
    const { handleCallInitiated, cancelActiveDial, getCallWorkflowState } = global;

    global.currentUser = { email: "partner1@hermes.io", name: "Alpha Partner", role: "caller" };
    global.selectedProspectId = "p-test-1";

    // Accidental call start
    handleCallInitiated();
    expect(getCallWorkflowState().callPendingDisposition).toBe(true);

    // Cancel dial
    cancelActiveDial();

    const state = getCallWorkflowState();
    expect(state.isCallActive).toBe(false);
    expect(state.callPendingDisposition).toBe(false);
    expect(state.activeCallProspectId).toBe(null);

    const prospect = global.PROSPECTS.find(p => p.id === "p-test-1");
    expect(prospect.status).toBe("ready");
    expect(global.showNotification).toHaveBeenCalledWith(
      expect.stringContaining("Dial cancelled (misclick)")
    );
  });

  it("18.6 Appends 1-tap quick-tag note chips seamlessly into private call notes", async () => {
    await import("../../workspace/app.js");
    const { appendNoteTag } = global;

    mockDom.callNotesInput.value = "";

    appendNoteTag("In Consultations");
    expect(mockDom.callNotesInput.value).toBe("[In Consultations]");

    appendNoteTag("Asked for WhatsApp");
    expect(mockDom.callNotesInput.value).toBe("[In Consultations] [Asked for WhatsApp]");

    // Adding existing tag again does not duplicate
    appendNoteTag("In Consultations");
    expect(mockDom.callNotesInput.value).toBe("[In Consultations] [Asked for WhatsApp]");
  });

  it("18.7 Owner is exempt from mandatory disposition gate and can advance freely", async () => {
    await import("../../workspace/app.js");
    const { canAdvanceLead, setCallWorkflowState } = global;

    // Authenticated as Apoorv (Owner)
    global.currentUser = { email: "apoorvxs@gmail.com", name: "Apoorv A S", role: "owner" };
    global.selectedProspectId = "p-test-1";

    setCallWorkflowState({
      isCallActive: true,
      callPendingDisposition: true,
      activeCallProspectId: "p-test-1",
      currentCallReach: null,
      currentCallOutcome: null
    });

    // Owner is completely exempt from forced gate
    expect(canAdvanceLead()).toBe(true);
  });
});
