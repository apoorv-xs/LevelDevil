import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import path from 'path';
import fs from 'fs';
import os from 'os';

describe('SprintDial Cloud MCP Server for Gemini Spark', () => {
  let serverModule;
  let testPort = 3199;
  let runningServer;
  let tempOverridesPath = null;

  beforeAll(async () => {
    // Isolate pipeline writes: the mutating tool calls below must never touch
    // the production workspace/pipeline_overrides.json. Set before import so
    // the module picks up the temp path at evaluation time.
    tempOverridesPath = path.join(fs.realpathSync(os.tmpdir()), `pipeline_overrides_test_${process.pid}.json`);
    try { if (fs.existsSync(tempOverridesPath)) fs.unlinkSync(tempOverridesPath); } catch (e) {}
    process.env.PIPELINE_OVERRIDES_FILE = tempOverridesPath;
    serverModule = await import(path.resolve(__dirname, '../../mcp_spark_server.cjs'));
    await new Promise((resolve) => {
      runningServer = serverModule.server.listen(testPort, () => {
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (runningServer) {
      await new Promise(resolve => runningServer.close(resolve));
    }
    try { if (tempOverridesPath && fs.existsSync(tempOverridesPath)) fs.unlinkSync(tempOverridesPath); } catch (e) {}
    delete process.env.PIPELINE_OVERRIDES_FILE;
  });

  it('1. getAllProspects loads base prospects from workspace/prospects_data.js', () => {
    const prospects = serverModule.getAllProspects();
    expect(Array.isArray(prospects)).toBe(true);
    expect(prospects.length).toBeGreaterThan(10);
    expect(prospects[0]).toHaveProperty('id');
    expect(prospects[0]).toHaveProperty('name');
    expect(prospects[0]).toHaveProperty('city');
  });

  it('2. list_leads tool executes with filter and limit', async () => {
    const res = await serverModule.executeToolCall('list_leads', { filter: 'all', limit: 5 });
    expect(res).toHaveProperty('leads');
    expect(res.leads.length).toBeLessThanOrEqual(5);
    expect(res.leads[0]).toHaveProperty('speedScore');
    expect(res.leads[0]).toHaveProperty('lcpTime');
    expect(res.leads[0]).toHaveProperty('bookmarked');
  });

  it('3. get_lead_dossier tool returns complete intel and flaws', async () => {
    const res = await serverModule.executeToolCall('get_lead_dossier', { prospect_id: 'p-1' });
    expect(res).toHaveProperty('lead');
    expect(res.lead.id).toBe('p-1');
    expect(res.lead.flaws).toBeDefined();
    expect(res.lead.dm).toBeDefined();
  });

  it('4. add_new_lead tool ingests new lead and computes phone formatting', async () => {
    const newLead = {
      name: 'Evolve Back Kuruba Safari Lodge',
      city: 'Kabini',
      site: 'https://www.evolveback.com/kabini/',
      phone: '080 4123 4567',
      dm: 'George Anthony (Managing Director)',
      fee: '₹2,00,000'
    };
    const res = await serverModule.executeToolCall('add_new_lead', newLead);
    expect(res.success).toBe(true);
    expect(res.lead.name).toBe(newLead.name);
    expect(res.lead.phone).toContain('+91');
  });

  it('5. draft_high_ticket_proposal tool outputs 60 FPS SLA and proposal link', async () => {
    const res = await serverModule.executeToolCall('draft_high_ticket_proposal', {
      prospect_id: 'p-1',
      tier: 2
    });
    expect(res.subject).toContain('Executive Performance Teardown');
    expect(res.body).toContain('60 FPS PERFORMANCE SLA GUARANTEE');
    expect(res.body).toContain('100% full refund');
    expect(res.body).toContain('apoorvxs@gmail.com');
    expect(res.proposalUrl).toContain('apoorv.qzz.io/sales?proposal=');
  });

  it('6. get_pipeline_stats returns pipeline valuation and counts', async () => {
    const stats = await serverModule.executeToolCall('get_pipeline_stats', {});
    expect(stats.totalLeads).toBeGreaterThan(10);
    expect(stats.totalPipelineValue).toContain('₹');
    expect(stats.activeSlaStandard).toContain('60 FPS');
  });

  it('7. get_objection_rebuttal tool delivers scripts and analogies in EN and ML', async () => {
    const resEn = await serverModule.executeToolCall('get_objection_rebuttal', {
      objection_query: 'agency',
      language: 'en'
    });
    expect(resEn.rebuttal.title).toBeDefined();
    expect(resEn.rebuttal.script).toContain('Apoorv');
    expect(resEn.laymanAnalogies.length).toBeGreaterThan(0);

    const resMl = await serverModule.executeToolCall('get_objection_rebuttal', {
      objection_query: 'practo',
      language: 'ml'
    });
    expect(resMl.rebuttal.script).toBeDefined();
    expect(resMl.laymanAnalogies[0].metaphor).toBeDefined();
  });

  it('8. generate_client_teardown outputs live teardown URL and WhatsApp brief', async () => {
    const res = await serverModule.executeToolCall('generate_client_teardown', {
      prospect_id: 'p-1'
    });
    expect(res.teardownUrl).toContain('https://apoorv.qzz.io/sales?teardown=p-1');
    expect(res.whatsappBrief).toContain('Namaste');
    expect(res.verbalHook).toBeDefined();
  });

  it('9. log_lead_disposition records reach, outcome, and callback datetime', async () => {
    const res = await serverModule.executeToolCall('log_lead_disposition', {
      prospect_id: 'p-1',
      reach: 'connected',
      outcome: 'callback_requested',
      notes: 'Doctor requested callback on Thursday morning after clinical rounds.',
      callback_datetime: '2026-10-02 11:30 AM IST'
    });
    expect(res.success).toBe(true);
    expect(res.status).toBe('callback');
    expect(res.callbackScheduled).toBe('2026-10-02 11:30 AM IST');
  });

  it('10. toggle_lead_bookmark flags prospect for priority radar', async () => {
    const res = await serverModule.executeToolCall('toggle_lead_bookmark', {
      prospect_id: 'p-1',
      bookmarked: true
    });
    expect(res.success).toBe(true);
    expect(res.bookmarked).toBe(true);
  });

  it('11. generate_upi_deposit_rail generates 50% advance UPI intent and QR URL', async () => {
    const res = await serverModule.executeToolCall('generate_upi_deposit_rail', {
      prospect_id: 'p-1',
      tier: 2
    });
    expect(res.upiVpa).toBe('apoorvxs@okaxis');
    expect(res.advanceRequired).toBe('₹50,000');
    expect(res.upiIntent).toContain('upi://pay?pa=apoorvxs@okaxis');
    expect(res.qrCodeUrl).toContain('api.qrserver.com');
    expect(res.proposalUrl).toContain('apoorv.qzz.io/sales?proposal=');
  });

  it('12. mark_deal_closed_won unlocks 15% partner commission and updates record', async () => {
    const res = await serverModule.executeToolCall('mark_deal_closed_won', {
      prospect_id: 'p-2',
      tier: 1,
      deposit_amount: 25000,
      notes: 'Deposit received via UPI transaction ref #AXIS99120.'
    });
    expect(res.success).toBe(true);
    expect(res.status).toBe('closed_won');
    expect(res.partnerCommissionEarned).toContain('₹7,500');
  });

  it('13. escalate_to_apoorv reserves 10% referral fee and builds Google Calendar link', async () => {
    const res = await serverModule.executeToolCall('escalate_to_apoorv', {
      prospect_id: 'p-3',
      client_notes: 'Client wants custom WebGPU 3D showroom for luxury resort villas.',
      preferred_datetime: 'Friday 3:00 PM IST'
    });
    expect(res.success).toBe(true);
    expect(res.status).toBe('discovery_booked');
    expect(res.googleCalendarUrl).toContain('calendar.google.com');
    expect(res.reservedReferralCommission).toContain('10%');
  });

  it('14. get_partner_wallet_ledger aggregates cleared and pending commissions', async () => {
    const ledger = await serverModule.executeToolCall('get_partner_wallet_ledger', {});
    expect(ledger).toHaveProperty('totalClearedCommission');
    expect(ledger).toHaveProperty('totalPendingCommission');
    expect(ledger.ledger.length).toBeGreaterThan(0);
  });

  it('15. Server responds to /health endpoint with 14 tools and ONLINE status', async () => {
    const response = await new Promise((resolve, reject) => {
      http.get(`http://localhost:${testPort}/health`, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    expect(response.status).toBe('ONLINE');
    expect(response.totalTools).toBe(20);
    expect(response.tools).toContain('generate_upi_deposit_rail');
    expect(response.tools).toContain('mark_deal_closed_won');
    expect(response.tools).toContain('get_prospect_comparison_matrix');
    expect(response.tools).toContain('get_objection_rebuttal');
    expect(response.tools).toContain('generate_outreach_sequence');
    expect(response.tools).toContain('harvest_leads_by_niche');
    expect(response.tools).toContain('verify_email_deliverability');
    expect(response.tools).toContain('get_deliverability_health');
  });

  it('16. Server serves valid MCP SSE endpoint event with string URI', async () => {
    const sseEvent = await new Promise((resolve, reject) => {
      const req = http.get(`http://localhost:${testPort}/sse`, (res) => {
        expect(res.headers['content-type']).toBe('text/event-stream');
        res.on('data', chunk => {
          const text = chunk.toString();
          if (text.includes('event: endpoint')) {
            req.destroy();
            resolve(text);
          }
        });
      });
      req.on('error', reject);
    });

    expect(sseEvent).toContain('event: endpoint');
    expect(sseEvent).toMatch(/data:\s*\/message\?sessionId=[a-z0-9]+/);
    // Crucial check: data MUST NOT be a JSON object like {"endpoint": ...}
    expect(sseEvent).not.toContain('{"endpoint"');
  });

  it('17. Server responds to MCP JSON-RPC initialize, tools/list and tools/call over /message', async () => {
    // 1. initialize
    const initPayload = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2024-11-05' }
    });

    const initRes = await new Promise((resolve, reject) => {
      const req = http.request(`http://localhost:${testPort}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => resolve(JSON.parse(data)));
      });
      req.on('error', reject);
      req.write(initPayload);
      req.end();
    });

    expect(initRes.result.serverInfo.name).toBe('sprintdial-cloud-mcp');

    // 2. tools/list
    const listPayload = JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list'
    });

    const listRes = await new Promise((resolve, reject) => {
      const req = http.request(`http://localhost:${testPort}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => resolve(JSON.parse(data)));
      });
      req.on('error', reject);
      req.write(listPayload);
      req.end();
    });

    expect(listRes.result.tools).toBeDefined();
    expect(listRes.result.tools.length).toBe(20);

    // 3. tools/call
    const callPayload = JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'generate_upi_deposit_rail',
        arguments: { prospect_id: 'p-1', tier: 1 }
      }
    });

    const callRes = await new Promise((resolve, reject) => {
      const req = http.request(`http://localhost:${testPort}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => resolve(JSON.parse(data)));
      });
      req.on('error', reject);
      req.write(callPayload);
      req.end();
    });

    expect(callRes.result.content[0].type).toBe('text');
    const content = JSON.parse(callRes.result.content[0].text);
    expect(content.advanceRequired).toBe('₹25,000');
    expect(content.upiVpa).toBe('apoorvxs@okaxis');
  });

  it('18. get_prospect_comparison_matrix returns comprehensive before vs after contrast and ROI payback', async () => {
    const res = await serverModule.executeToolCall('get_prospect_comparison_matrix', {
      prospect_id: 'p-1',
      monthly_visitors: 4000,
      average_order_value: 3000,
      tier: 1
    });

    expect(res).toHaveProperty('comparisonGrid');
    expect(res.comparisonGrid.length).toBeGreaterThanOrEqual(8);
    expect(res.comparisonGrid[0]).toHaveProperty('whatTheyHave');
    expect(res.comparisonGrid[0]).toHaveProperty('whatWeProvide');
    expect(res.revenueRecoveryCalculus).toHaveProperty('breakEvenPaybackPeriod');
    expect(res.interactiveTeardownUrl).toContain('apoorv.qzz.io/sales?teardown=p-1');
  });

  it('19. generate_outreach_sequence outputs complete 4-touch Swokei drip sequence with Gmail compose links', async () => {
    const res = await serverModule.executeToolCall('generate_outreach_sequence', {
      prospect_id: 'p-1',
      recipient_email: 'director@drrajeshcosmetic.com'
    });

    expect(res).toHaveProperty('sequence');
    expect(res.sequence.length).toBeGreaterThanOrEqual(4);
    expect(res.sequence[0].touchNumber).toBe(1);
    expect(res.sequence[0].day).toBe(1);
    // Persona-adaptive: subject adapts to archetype (e.g. Clinic => "Executive Performance Teardown", Architect => "Spatial Portfolio Review")
    expect(res.sequence[0].subject.length).toBeGreaterThan(10);
    expect(res.sequence[0].gmailComposeUrl).toContain('mail.google.com/mail');
    // Persona-adaptive: no blanket "Namaste" — greeting adapts to archetype
    expect(res.sequence[0].body).not.toContain('Namaste');

    expect(res.sequence[1].day).toBe(3);
    expect(res.sequence[2].day).toBe(6);
    expect(res.sequence[3].day).toBe(9);
    // Persona-adaptive: Touch 4 is always the breakup/permission-to-close touch
    expect(res.sequence[3].subject).toContain('Permission to close file');
  });

  it('20. harvest_leads_by_niche harvests and auto-books high-ticket prospects into SprintDial radar', async () => {
    const res = await serverModule.executeToolCall('harvest_leads_by_niche', {
      niche: 'Hospitality',
      city: 'Goa',
      count: 2
    });

    expect(res.success).toBe(true);
    expect(res.leads.length).toBeGreaterThanOrEqual(1);
    expect(res.leads[0]).toHaveProperty('site');
    expect(res.leads[0]).toHaveProperty('lcpTime');
    expect(res.leads[0]).toHaveProperty('flaws');
    expect(res.leads[0].bookmarked).toBe(true);
  });

  it('21. verify_email_deliverability checks MX, SPF and DMARC with deliverability score', async () => {
    const res = await serverModule.executeToolCall('verify_email_deliverability', {
      target_email_or_domain: 'google.com'
    });

    expect(res).toHaveProperty('deliverabilityScore');
    expect(res.hasValidMx).toBe(true);
    expect(res.hasSpfRecord).toBe(true);
    expect(res.status).toBe('OPTIMAL');
  });

  it('22. get_deliverability_health provides sender inbox health and daily volume limits', async () => {
    const res = await serverModule.executeToolCall('get_deliverability_health', {});

    expect(res.senderInbox).toBe('apoorvxs@gmail.com');
    expect(res.status).toBe('ACTIVE_OPTIMAL');
    expect(res.safeDailySendingLimits).toHaveProperty('currentRecommendedDailyCeiling');
    expect(res.deliverabilityInvariants.length).toBeGreaterThan(0);
    expect(res.optimalSendingWindows.length).toBeGreaterThan(0);
  });

  it('23. send_outreach_email autonomously dispatches outreach and updates lead status', async () => {
    const res = await serverModule.executeToolCall('send_outreach_email', {
      prospect_id: 'p-1',
      touch_number: 1
    });

    expect(res.success).toBe(true);
    expect(res.dispatched).toBe(true);
    expect(res.touchNumber).toBe(1);
    expect(res.recipient).toBeDefined();
    expect(res.subject).toContain('Executive Performance Teardown');
    expect(res.teardownUrl).toContain('apoorv.qzz.io/sales?teardown=');
  });
});
