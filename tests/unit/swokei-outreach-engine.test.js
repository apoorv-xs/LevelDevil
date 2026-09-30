import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Swokei Cold Outreach & Deliverability Engine Integration', () => {
  let appJsContent;
  let workspaceHtmlContent;
  let mcpServerModule;

  beforeAll(async () => {
    const appJsPath = path.resolve(__dirname, '../../workspace/app.js');
    appJsContent = fs.readFileSync(appJsPath, 'utf8');

    const htmlPath = path.resolve(__dirname, '../../workspace/index.html');
    workspaceHtmlContent = fs.readFileSync(htmlPath, 'utf8');

    mcpServerModule = await import(path.resolve(__dirname, '../../mcp_spark_server.cjs'));
  });

  describe('1. Outreach Drip Engine Markup in Cockpit UI', () => {
    it('provides the Outreach Drip button in Prospect Hero action bar', () => {
      expect(workspaceHtmlContent).toContain('id="btnOutreachDrip"');
      expect(workspaceHtmlContent).toContain('openOutreachDripModal()');
      expect(workspaceHtmlContent).toContain('Outreach Drip');
    });

    it('renders the complete #outreachDripModal with 4 touches and Gmail compose action', () => {
      expect(workspaceHtmlContent).toContain('id="outreachDripModal"');
      expect(workspaceHtmlContent).toContain('id="dripRecipientEmail"');
      expect(workspaceHtmlContent).toContain('id="dripSubjectInput"');
      expect(workspaceHtmlContent).toContain('id="dripBodyInput"');
      expect(workspaceHtmlContent).toContain('id="btnDripTouch1"');
      expect(workspaceHtmlContent).toContain('id="btnDripTouch2"');
      expect(workspaceHtmlContent).toContain('id="btnDripTouch3"');
      expect(workspaceHtmlContent).toContain('id="btnDripTouch4"');
      expect(workspaceHtmlContent).toContain('launchGmailComposeUI()');
      expect(workspaceHtmlContent).toContain('verifyActiveLeadDeliverabilityUI()');
    });

    it('embeds the Deliverability & Email Warmup tab in Admin modal', () => {
      expect(workspaceHtmlContent).toContain('id="btnAdminTabWarmup"');
      expect(workspaceHtmlContent).toContain("switchAdminTab('warmup')");
      expect(workspaceHtmlContent).toContain('id="adminTabWarmup"');
      expect(workspaceHtmlContent).toContain('id="adminDnsTargetInput"');
      expect(workspaceHtmlContent).toContain('auditDomainDeliverabilityFromAdmin()');
      expect(workspaceHtmlContent).toContain('apoorvxs@gmail.com');
      expect(workspaceHtmlContent).toContain('45 Emails / Day');
    });
  });

  describe('2. Multi-Touch Sequence Generation in workspace/app.js', () => {
    it('defines the 4-touch Swokei sequence generator and exports all handlers', () => {
      expect(appJsContent).toContain('function getOutreachSequenceForLead(');
      expect(appJsContent).toContain('function openOutreachDripModal(');
      expect(appJsContent).toContain('function closeOutreachDripModal(');
      expect(appJsContent).toContain('function switchOutreachDripTouch(');
      expect(appJsContent).toContain('function copyOutreachSubject(');
      expect(appJsContent).toContain('function copyOutreachBody(');
      expect(appJsContent).toContain('function launchGmailComposeUI(');
      expect(appJsContent).toContain('function sendOutreachWhatsAppUI(');
      expect(appJsContent).toContain('function verifyActiveLeadDeliverabilityUI(');
      expect(appJsContent).toContain('function auditDomainDeliverabilityFromAdmin(');
    });

    it('wires warmup tab into switchAdminTab handler', () => {
      expect(appJsContent).toContain("else if (tab === 'warmup')");
      expect(appJsContent).toContain('adminTabWarmup');
      expect(appJsContent).toContain('btnAdminTabWarmup');
    });
  });

  describe('3. Cloud MCP Server Swokei Tools (Gemini Spark Integration)', () => {
    it('exposes all 20 tools through MCP_TOOLS registry', () => {
      const toolNames = mcpServerModule.MCP_TOOLS.map(t => t.name);
      expect(toolNames.length).toBe(20);
      expect(toolNames).toContain('generate_outreach_sequence');
      expect(toolNames).toContain('send_outreach_email');
      expect(toolNames).toContain('harvest_leads_by_niche');
      expect(toolNames).toContain('verify_email_deliverability');
      expect(toolNames).toContain('get_deliverability_health');
      expect(toolNames).toContain('get_prospect_comparison_matrix');
    });

    it('generate_outreach_sequence creates verified sequence for any prospect ID', async () => {
      const res = await mcpServerModule.executeToolCall('generate_outreach_sequence', {
        prospect_id: 'p-1'
      });
      expect(res.sequence.length).toBe(4);
      expect(res.sequence[0].touchNumber).toBe(1);
      expect(res.sequence[0].subject).toContain('Executive Performance Teardown');
      expect(res.sequence[1].touchNumber).toBe(2);
      expect(res.sequence[1].subject).toContain('24 FPS vs 60 FPS');
      expect(res.sequence[2].touchNumber).toBe(3);
      expect(res.sequence[2].subject).toContain('aggregator');
      expect(res.sequence[3].touchNumber).toBe(4);
      expect(res.sequence[3].subject).toContain('Permission to close file');
    });

    it('harvest_leads_by_niche returns targeted high-ticket prospects with LCP and flaws', async () => {
      const res = await mcpServerModule.executeToolCall('harvest_leads_by_niche', {
        niche: 'Aesthetic Clinics',
        city: 'Kochi',
        count: 1
      });
      expect(res.success).toBe(true);
      expect(res.leads.length).toBeGreaterThanOrEqual(1);
      expect(res.leads[0].niche).toBe('Aesthetic Clinics');
      expect(res.leads[0].speedScore).toBeDefined();
    });

    it('verify_email_deliverability verifies MX, SPF and DMARC with 1.1.1.1 Cloudflare DNS', async () => {
      const res = await mcpServerModule.executeToolCall('verify_email_deliverability', {
        target_email_or_domain: 'cloudflare.com'
      });
      expect(res.hasValidMx).toBe(true);
      expect(res.deliverabilityScore).toBeDefined();
      expect(res.status).toBe('OPTIMAL');
    });

    it('get_deliverability_health outputs sender inbox status and optimal sending windows', async () => {
      const res = await mcpServerModule.executeToolCall('get_deliverability_health', {});
      expect(res.senderInbox).toBe('apoorvxs@gmail.com');
      expect(res.safeDailySendingLimits.currentRecommendedDailyCeiling).toBe(45);
      expect(res.optimalSendingWindows.length).toBe(2);
      expect(res.deliverabilityInvariants.length).toBe(4);
    });
  });
});
