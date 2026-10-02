import { describe, it, expect, beforeEach, vi } from "vitest";
import fs from "fs";
import path from "path";

describe("Subsystem 20: Partner Gamification, Commission Wallet & Lead Retention Engine", () => {
  let mockDom;
  let mockLocalStorage;
  let sampleProspects;

  beforeEach(() => {
    mockLocalStorage = {};
    global.localStorage = {
      getItem: vi.fn((key) => mockLocalStorage[key] || null),
      setItem: vi.fn((key, val) => { mockLocalStorage[key] = String(val); }),
      removeItem: vi.fn((key) => { delete mockLocalStorage[key]; }),
      clear: vi.fn(() => { mockLocalStorage = {}; })
    };

    mockDom = {
      topbarWalletPill: { classList: { remove: vi.fn(), add: vi.fn() } },
      topbarWalletAmount: { textContent: "" },
      partnerWalletModal: { classList: { remove: vi.fn(), add: vi.fn() } },
      walletClearedBalance: { textContent: "" },
      walletPendingBalance: { textContent: "" },
      walletSettledBalance: { textContent: "" },
      partnerUpiInput: { value: "", focus: vi.fn() },
      walletLedgerList: { innerHTML: "", appendChild: vi.fn() },
      walletOwnerActions: { classList: { remove: vi.fn(), add: vi.fn() } },
      btnCallbackNudge: { classList: { remove: vi.fn(), add: vi.fn() } },
      profileCockpitTitle: { textContent: "" },
      profileStreakBadge: { textContent: "", classList: { remove: vi.fn(), add: vi.fn() } },
      profileMilestoneBadge: { textContent: "", className: "", classList: { remove: vi.fn(), add: vi.fn() } },
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
      adminModal: { classList: { contains: vi.fn(() => false) } },
      adminTabLogs: { classList: { contains: vi.fn(() => false) } },
      liveStatusMsg: { innerText: "" },
      lockNotificationBar: { classList: { add: vi.fn(), remove: vi.fn() } }
    };

    global.document = {
      getElementById: vi.fn((id) => mockDom[id] || null),
      querySelectorAll: vi.fn(() => []),
      querySelector: vi.fn(() => null),
      createElement: vi.fn((tag) => ({
        tagName: tag.toUpperCase(),
        className: "",
        innerHTML: "",
        textContent: "",
        appendChild: vi.fn(),
        setAttribute: vi.fn()
      }))
    };

    global.window = global;
    global.window.addEventListener = vi.fn();
    global.window.removeEventListener = vi.fn();
    global.window.open = vi.fn();
    global.window.location = { reload: vi.fn(), href: "" };
    global.window.innerWidth = 1440;
    global.window.innerHeight = 900;
    global.window.localStorage = global.localStorage;
    global.window.document = global.document;
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

    global.currentUser = { email: "partner@outreach.co", name: "Outreach Partner", role: "caller" };
    global.dialsToday = 0;
    global.playSound = vi.fn();
    global.showNotification = vi.fn();
    global.recordPartnerActivity = vi.fn();

    sampleProspects = [
      {
        id: "deal-1",
        name: "Lakeshore Multispecialty Dental",
        city: "Kochi",
        dm: "Dr. Paulose",
        phone: "+91 94470 11223",
        status: "closed_won",
        closedTier: 1,
        depositPaid: 25000,
        targetFee: 50000,
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "deal-2",
        name: "Malabar Ayurveda Retreat",
        city: "Kochi",
        dm: "Dr. Harikumar",
        phone: "+91 98460 33445",
        status: "closed_won",
        closedTier: 2,
        depositPaid: 50000,
        targetFee: 100000,
        updatedAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: "referral-1",
        name: "Apex Cardiology Center",
        city: "Bangalore",
        dm: "Dr. Srinivas",
        phone: "+91 98800 55667",
        status: "discovery_booked",
        targetFee: 50000,
        updatedAt: new Date(Date.now() - 10000000).toISOString()
      },
      {
        id: "callback-fresh",
        name: "Fresh Dental Clinic",
        city: "Kochi",
        dm: "Dr. Suresh",
        phone: "+91 94471 22334",
        status: "connected_callback",
        updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString() // 4 hours ago
      },
      {
        id: "callback-overdue",
        name: "Overdue Orthopedic Care",
        city: "Kochi",
        dm: "Dr. George",
        phone: "+91 94472 33445",
        status: "connected_callback",
        updatedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString() // 30 hours ago
      },
      {
        id: "callback-zombie",
        name: "Zombie Cosmetic Studio",
        city: "Kochi",
        dm: "Dr. Thomas",
        phone: "+91 94473 44556",
        status: "connected_callback",
        updatedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString() // 72 hours ago
      }
    ];

    global.PROSPECTS = sampleProspects;
    global.selectedProspectId = "deal-1";
  });

  it("20.1 Accurately calculates 15% closed commissions, 10% discovery pipeline, and settled balances in getProfileTelemetry", async () => {
    await import("../../workspace/app.js");
    const { getProfileTelemetry } = global;

    const telemetry = getProfileTelemetry();

    // Deal 1 (Tier 1): ₹7,500 commission (15% of ₹50k)
    // Deal 2 (Tier 2): ₹15,000 commission (15% of ₹100k)
    // Cleared Commission = ₹7,500 + ₹15,000 = ₹22,500
    expect(telemetry.clearedCommission).toBe(22500);

    // Referral 1 (Discovery Booked): 10% safety net on ₹50,000 = ₹5,000
    expect(telemetry.pendingCommission).toBe(5000);

    // Total Lifetime Commission
    expect(telemetry.totalLifetimeCommission).toBe(22500);
    expect(telemetry.settledCommission).toBe(0);

    // Ledger has 3 entries (2 closed_won + 1 discovery_booked)
    expect(telemetry.ledger.length).toBe(3);
    expect(telemetry.ledger[0].name).toBe("Lakeshore Multispecialty Dental");
    expect(telemetry.ledger[0].commission).toBe(7500);
    expect(telemetry.ledger[1].name).toBe("Malabar Ayurveda Retreat");
    expect(telemetry.ledger[1].commission).toBe(15000);
    expect(telemetry.ledger[2].type).toBe("discovery_booked");
    expect(telemetry.ledger[2].commission).toBe(5000);
  });

  it("20.2 Updates cleared vs settled commission balances when deals are marked settled", async () => {
    await import("../../workspace/app.js");
    const { getProfileTelemetry, settleDealCommission } = global;

    // Set Owner user to settle deal
    global.currentUser = { email: "apoorvxs@gmail.com", name: "Apoorv A S", role: "owner" };
    settleDealCommission("deal-1");

    const telemetry = getProfileTelemetry();
    // Deal 1 (₹7,500) settled -> Cleared now ₹15,000; Settled now ₹7,500
    expect(telemetry.clearedCommission).toBe(15000);
    expect(telemetry.settledCommission).toBe(7500);
    expect(telemetry.totalLifetimeCommission).toBe(22500);

    const deal1Ledger = telemetry.ledger.find(d => d.id === "deal-1");
    expect(deal1Ledger.isSettled).toBe(true);
    expect(deal1Ledger.statusText).toBe("SETTLED");
  });

  it("20.3 Generates verified WhatsApp UPI Settlement Request message to Apoorv (+91 70129 45209)", async () => {
    await import("../../workspace/app.js");
    const { requestUpiSettlement, savePartnerUpiId } = global;

    savePartnerUpiId("caller@okhdfcbank");
    mockDom.partnerUpiInput.value = "caller@okhdfcbank";

    global.currentUser = { email: "partner@firm.com", name: "Alex Caller", role: "caller" };
    requestUpiSettlement();

    expect(global.window.open).toHaveBeenCalled();
    const calledUrl = global.window.open.mock.calls[0][0];
    expect(calledUrl).toContain("https://wa.me/917012945209");
    expect(calledUrl).toContain(encodeURIComponent("[REQUEST] OUTREACH PARTNER COMMISSION SETTLEMENT"));
    expect(calledUrl).toContain(encodeURIComponent("Registered UPI: caller@okhdfcbank"));
    expect(calledUrl).toContain(encodeURIComponent("Requested Payout: ₹22,500"));
    expect(calledUrl).toContain(encodeURIComponent("Lakeshore Multispecialty Dental"));
  });

  it("20.4 Computes callback aging categories accurately (<24h, 24-48h, >48h)", async () => {
    await import("../../workspace/app.js");
    const { getCallbackAging } = global;

    const freshLead = sampleProspects.find(p => p.id === "callback-fresh");
    const overdueLead = sampleProspects.find(p => p.id === "callback-overdue");
    const zombieLead = sampleProspects.find(p => p.id === "callback-zombie");

    const freshAging = getCallbackAging(freshLead);
    expect(freshAging.isDueToday).toBe(true);
    expect(freshAging.isOverdue).toBe(false);
    expect(freshAging.isZombie).toBe(false);
    expect(freshAging.badgeText).toBe("[DUE TODAY]");

    const overdueAging = getCallbackAging(overdueLead);
    expect(overdueAging.isDueToday).toBe(false);
    expect(overdueAging.isOverdue).toBe(true);
    expect(overdueAging.isZombie).toBe(false);
    expect(overdueAging.badgeText).toContain("[OVERDUE]");

    const zombieAging = getCallbackAging(zombieLead);
    expect(zombieAging.isDueToday).toBe(false);
    expect(zombieAging.isOverdue).toBe(false);
    expect(zombieAging.isZombie).toBe(true);
    expect(zombieAging.badgeText).toContain("[STALE // >48H]");
  });

  it("20.5 Sorts callbacks queue with Zombie (>48h) and Overdue (24-48h) prioritized at the top", async () => {
    await import("../../workspace/app.js");
    const { getCallbackAging } = global;

    const callbacks = sampleProspects.filter(p => p.status === "connected_callback");
    const sorted = [...callbacks].sort((a, b) => {
      const agingA = getCallbackAging(a);
      const agingB = getCallbackAging(b);
      const weightA = agingA.isZombie ? 3 : (agingA.isOverdue ? 2 : 1);
      const weightB = agingB.isZombie ? 3 : (agingB.isOverdue ? 2 : 1);
      if (weightB !== weightA) return weightB - weightA;
      return agingB.elapsedHours - agingA.elapsedHours;
    });

    // The zombie lead (72h) must be first, followed by overdue (30h), and finally fresh (4h)
    expect(sorted[0].id).toBe("callback-zombie");
    expect(sorted[1].id).toBe("callback-overdue");
    expect(sorted[2].id).toBe("callback-fresh");
  });

  it("20.6 Generates personalized 1-Tap Callback Nudge WhatsApp link with teardown audit reference", async () => {
    await import("../../workspace/app.js");
    const { sendCallbackNudgeWhatsApp } = global;

    global.currentUser = { name: "Rohan", email: "rohan@call.com", sub: "partner-123" };

    sendCallbackNudgeWhatsApp("callback-fresh");

    expect(global.window.open).toHaveBeenCalled();
    const calledUrl = global.window.open.mock.calls[0][0];
    expect(calledUrl).toContain("https://wa.me/919447122334");
    expect(calledUrl).toContain(encodeURIComponent("Namaste Dr. Suresh"));
    expect(calledUrl).toContain(encodeURIComponent("https://apoorv.qzz.io/sales?prospect=callback-fresh"));
    expect(calledUrl).toContain(encodeURIComponent("Does 3:30 PM today work for you?"));
    expect(calledUrl).toContain(encodeURIComponent("Office of Apoorv A S"));
  });

  it("20.7 Evaluates dial milestones and persistent shift streaks", async () => {
    await import("../../workspace/app.js");
    const { getDialMilestone, updateShiftStreakOnDial, getShiftStreak } = global;

    expect(getDialMilestone(0).badge).toBe("[QUEUE]");
    expect(getDialMilestone(5).badge).toBe("[WARM]");
    expect(getDialMilestone(10).badge).toBe("[FLOW]");
    expect(getDialMilestone(15).badge).toBe("[PEAK]");
    expect(getDialMilestone(20).badge).toBe("[TARGET MET]");

    // Streak initialization
    expect(getShiftStreak()).toBe(1);
    updateShiftStreakOnDial();
    expect(getShiftStreak()).toBe(1);

    // Simulate streak progression from yesterday
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    mockLocalStorage["sprintdial_streak_data"] = JSON.stringify({ lastDate: yesterday, count: 2 });
    expect(getShiftStreak()).toBe(2);

    updateShiftStreakOnDial();
    expect(getShiftStreak()).toBe(3);
  });

  it("20.8 Verifies workspace HTML markup includes Topbar Wallet Pill, Partner Wallet Modal, and Callback Nudge button", () => {
    const htmlPath = path.resolve(__dirname, "../../workspace/index.html");
    const html = fs.readFileSync(htmlPath, "utf-8");

    // Topbar Live Wallet Pill
    expect(html).toContain('id="topbarWalletPill"');
    expect(html).toContain('id="topbarWalletAmount"');
    expect(html).toContain('openPartnerWalletModal()');

    // Partner Wallet Modal
    expect(html).toContain('id="partnerWalletModal"');
    expect(html).toContain('id="walletClearedBalance"');
    expect(html).toContain('id="walletPendingBalance"');
    expect(html).toContain('id="walletSettledBalance"');
    expect(html).toContain('id="partnerUpiInput"');
    expect(html).toContain('requestUpiSettlement()');
    expect(html).toContain('id="walletLedgerList"');

    // Callback Nudge Button
    expect(html).toContain('id="btnCallbackNudge"');
    expect(html).toContain('sendCallbackNudgeWhatsApp()');

    // Streak and Milestone Badges
    expect(html).toContain('id="profileStreakBadge"');
    expect(html).toContain('id="profileMilestoneBadge"');
  });
});
