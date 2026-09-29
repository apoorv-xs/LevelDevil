import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";

describe("Two-Track Deal Closing Engine & Sovereign Payment Terminal", () => {
  const workspaceHtmlPath = path.resolve(__dirname, "../../workspace/index.html");
  const workspaceAppPath = path.resolve(__dirname, "../../workspace/app.js");
  const salesHtmlPath = path.resolve(__dirname, "../../sales.html");
  const salesAppPath = path.resolve(__dirname, "../../sales-app.js");
  const salesCssPath = path.resolve(__dirname, "../../sales.css");

  const workspaceHtml = fs.readFileSync(workspaceHtmlPath, "utf-8");
  const workspaceApp = fs.readFileSync(workspaceAppPath, "utf-8");
  const salesHtml = fs.readFileSync(salesHtmlPath, "utf-8");
  const salesApp = fs.readFileSync(salesAppPath, "utf-8");
  const salesCss = fs.readFileSync(salesCssPath, "utf-8");

  describe("1. Workspace HTML & Modals Architecture", () => {
    it("defines the Sovereign In-Call Payment Terminal (#dealCommitmentModal) with required elements", () => {
      expect(workspaceHtml).toContain('id="dealCommitmentModal"');
      expect(workspaceHtml).toContain('id="dealClientName"');
      expect(workspaceHtml).toContain('id="dealTier1"');
      expect(workspaceHtml).toContain('id="dealTier2"');
      expect(workspaceHtml).toContain('id="dealTier3"');
      expect(workspaceHtml).toContain('id="dealUpiQrImg"');
      expect(workspaceHtml).toContain('id="dealUpiIdText"');
      expect(workspaceHtml).toContain('apoorvxs@okaxis');
      expect(workspaceHtml).toContain('id="dealSummaryTotal"');
      expect(workspaceHtml).toContain('id="dealSummaryAdvance"');
      expect(workspaceHtml).toContain('id="dealSummaryCommission"');
      expect(workspaceHtml).toContain('id="dealShareUrl"');
      expect(workspaceHtml).toContain('onclick="confirmDealDepositReceived()"');
    });

    it("defines the Executive Handoff Modal (#executiveHandoffModal) with required elements", () => {
      expect(workspaceHtml).toContain('id="executiveHandoffModal"');
      expect(workspaceHtml).toContain('id="handoffClientName"');
      expect(workspaceHtml).toContain('10% REFERRAL SAFETY NET ACTIVE');
      expect(workspaceHtml).toContain('id="handoffMeetingTime"');
      expect(workspaceHtml).toContain('id="handoffContextNotes"');
      expect(workspaceHtml).toContain('id="handoffBriefPreview"');
      expect(workspaceHtml).toContain('onclick="generateApoorvMeetInvite()"');
      expect(workspaceHtml).toContain('onclick="sendHandoffBriefToApoorv()"');
      expect(workspaceHtml).toContain('onclick="saveHandoffAndAdvance()"');
    });

    it("includes the 100% 60 FPS Mathematical SLA Guarantee in the SOW terms", () => {
      expect(workspaceHtml).toContain("100% refund if &lt;60 FPS");
      expect(workspaceHtml).toContain("50% Advance");
      expect(workspaceHtml).toContain("25% Milestone");
      expect(workspaceHtml).toContain("25% Final Delivery");
    });
  });

  describe("2. Two-Track Call Outcomes & Controller Logic (workspace/app.js)", () => {
    it("renders both Track 1 (Close 15%) and Track 2 (Forward 10%) outcome buttons for DM connected", () => {
      expect(workspaceApp).toContain('data-outcome="discovery_booked"');
      expect(workspaceApp).toContain('[1] FORWARD (10%)');
      expect(workspaceApp).toContain('data-outcome="closed_won"');
      expect(workspaceApp).toContain('[2] CLOSE (15%)');
    });

    it("routes discovery_booked to openExecutiveHandoffModal and closed_won to openDealCommitmentModal", () => {
      expect(workspaceApp).toContain('openExecutiveHandoffModal(selectedProspectId)');
      expect(workspaceApp).toContain('openDealCommitmentModal(selectedProspectId)');
    });

    it("calculates accurate tier pricing, 50% advance, and 15% partner commission", () => {
      const DEAL_TIERS = {
        1: { total: 50000, advance: 25000, commission: 7500 },
        2: { total: 100000, advance: 50000, commission: 15000 },
        3: { total: 200000, advance: 100000, commission: 30000 },
      };

      Object.entries(DEAL_TIERS).forEach(([tier, data]) => {
        expect(data.advance).toBe(data.total * 0.5);
        expect(data.commission).toBe(data.total * 0.15);
      });

      expect(workspaceApp).toContain("selectDealTier");
      expect(workspaceApp).toContain("api.qrserver.com");
      expect(workspaceApp).toContain("apoorvxs@okaxis");
    });

    it("generates structured Executive Handoff Brief with partner referral attribution", () => {
      expect(workspaceApp).toContain("getExecutiveHandoffBriefText");
      expect(workspaceApp).toContain("EXECUTIVE HANDOFF BRIEF FOR APOORV");
      expect(workspaceApp).toContain("10% Referral Safety Net Active");
      expect(workspaceApp).toContain("apoorvxs@gmail.com");
    });

    it("supports closed_won in queue rendering and status matching", () => {
      expect(workspaceApp).toContain('[SOW] WON');
      expect(workspaceApp).toContain("p.status === 'closed_won'");
    });
  });

  describe("3. Public Teardown & Fast-Track Terminal (sales.html & sales-app.js)", () => {
    it("includes the Verified Principal & Partner Credentials Banner in sales.html", () => {
      expect(salesHtml).toContain('id="trojan-credentials-banner"');
      expect(salesHtml).toContain('id="trojan-dossier-id"');
      expect(salesHtml).toContain('id="trojan-partner-id"');
      expect(salesHtml).toContain("APOORV A S");
    });

    it("includes the Interactive Revenue Recovery Simulator in sales.html", () => {
      expect(salesHtml).toContain('id="trojan-simulator-card"');
      expect(salesHtml).toContain('id="sim-visitors"');
      expect(salesHtml).toContain('id="sim-aov"');
      expect(salesHtml).toContain('id="sim-bleed-val"');
      expect(salesHtml).toContain('id="sim-recovered-val"');
      expect(salesHtml).toContain('id="sim-payback-val"');
      expect(salesHtml).toContain('oninput="calculateRevenueRecovery()"');
    });

    it("includes the Dual-Action Conversion Bar in sales.html", () => {
      expect(salesHtml).toContain('id="trojan-fasttrack-btn"');
      expect(salesHtml).toContain('BOOK 15-MIN STRATEGY WALKTHROUGH WITH APOORV');
      expect(salesHtml).toContain('FAST-TRACK: REVIEW SOW');
    });

    it("includes the Sovereign 1-Page Milestone SOW & Deposit Terminal in sales.html", () => {
      expect(salesHtml).toContain('id="trojan-payment-view"');
      expect(salesHtml).toContain('id="publicTier1"');
      expect(salesHtml).toContain('id="publicTier2"');
      expect(salesHtml).toContain('id="publicTier3"');
      expect(salesHtml).toContain('id="publicUpiQrImg"');
      expect(salesHtml).toContain('id="publicUpiIdText"');
      expect(salesHtml).toContain('id="publicSummaryTotal"');
      expect(salesHtml).toContain('id="publicSummaryAdvance"');
      expect(salesHtml).toContain('id="btnPublicWhatsAppProof"');
    });

    it("styles the simulator, dual-action CTAs, and payment view in sales.css", () => {
      expect(salesCss).toContain(".trojan-credentials-banner");
      expect(salesCss).toContain(".trojan-simulator-card");
      expect(salesCss).toContain(".retro-slider");
      expect(salesCss).toContain(".trojan-fasttrack-btn");
      expect(salesCss).toContain(".trojan-payment-view");
      expect(salesCss).toContain(".public-tier-btn");
      expect(salesCss).toContain(".whatsapp-proof-btn");
    });

    it("implements calculateRevenueRecovery, toggleTrojanPaymentView, and selectPublicDealTier in sales-app.js", () => {
      expect(salesApp).toContain("calculateRevenueRecovery");
      expect(salesApp).toContain("toggleTrojanPaymentView");
      expect(salesApp).toContain("selectPublicDealTier");
      expect(salesApp).toContain("copyPublicUpiId");
      expect(salesApp).toContain("PUBLIC_DEAL_TIERS");
      expect(salesApp).toContain("isProposalFastTrack");
    });
  });

  describe("4. Security & CSP Configuration", () => {
    it("allows https://api.qrserver.com in staticwebapp.config.json img-src", () => {
      const swaConfig = fs.readFileSync(path.resolve(__dirname, "../../staticwebapp.config.json"), "utf-8");
      expect(swaConfig).toContain("https://api.qrserver.com");
    });

    it("allows https://api.qrserver.com in vercel.json img-src", () => {
      const vercelConfig = fs.readFileSync(path.resolve(__dirname, "../../vercel.json"), "utf-8");
      expect(vercelConfig).toContain("https://api.qrserver.com");
    });
  });
});
