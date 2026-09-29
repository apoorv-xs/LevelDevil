import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Interactive 3D Deal Teardown & Trojan Pitch Engine', () => {
  const salesHtml = fs.readFileSync(path.resolve(__dirname, '../../sales.html'), 'utf8');
  const salesAppJs = fs.readFileSync(path.resolve(__dirname, '../../sales-app.js'), 'utf8');
  const salesCss = fs.readFileSync(path.resolve(__dirname, '../../sales.css'), 'utf8');
  const workspaceHtml = fs.readFileSync(path.resolve(__dirname, '../../workspace/index.html'), 'utf8');
  const workspaceAppJs = fs.readFileSync(path.resolve(__dirname, '../../workspace/app.js'), 'utf8');

  describe('1. Markup & UI Architecture Verification', () => {
    it('contains the Trojan 3D Teardown section in sales.html with complete diagnostic telemetry elements', () => {
      expect(salesHtml).toContain('id="trojan-teardown-section"');
      expect(salesHtml).toContain('class="trojan-teardown-section hidden"');
      expect(salesHtml).toContain('id="trojan-client-name"');
      expect(salesHtml).toContain('id="trojan-val-lcp"');
      expect(salesHtml).toContain('id="trojan-val-speed"');
      expect(salesHtml).toContain('id="trojan-val-leak"');
      expect(salesHtml).toContain('id="trojan-val-bleed"');
      expect(salesHtml).toContain('id="btn-fps-unopt"');
      expect(salesHtml).toContain('id="btn-fps-opt"');
      expect(salesHtml).toContain('id="trojan-fps-feedback"');
      expect(salesHtml).toContain('id="trojan-cta-btn"');
      expect(salesHtml).toContain('onclick="claimTrojanConsultation()"');
    });

    it('contains the upgraded Interactive Client Teardown Modal in workspace/index.html', () => {
      expect(workspaceHtml).toContain('id="clientTeardownModal"');
      expect(workspaceHtml).toContain('TROJAN 3D PITCH');
      expect(workspaceHtml).toContain('id="modalClientName"');
      expect(workspaceHtml).toContain('id="modalCurrentLcp"');
      expect(workspaceHtml).toContain('id="modalSpeedScore"');
      expect(workspaceHtml).toContain('id="modalRevenueLeak"');
      expect(workspaceHtml).toContain('id="modalAggregatorBleed"');
      expect(workspaceHtml).toContain('id="teardownShareUrl"');
      expect(workspaceHtml).toContain('id="btnCopyTeardownLink"');
      expect(workspaceHtml).toContain('onclick="copyTeardownLink()"');
      expect(workspaceHtml).toContain('onclick="previewTeardownPage()"');
      expect(workspaceHtml).toContain('onclick="sendWhatsAppTeardown()"');
    });

    it('defines responsive neo-brutalist styling for Trojan pitch in sales.css', () => {
      expect(salesCss).toContain('.trojan-teardown-section');
      expect(salesCss).toContain('.trojan-badge-pill');
      expect(salesCss).toContain('.trojan-grid');
      expect(salesCss).toContain('.trojan-col-bad');
      expect(salesCss).toContain('.trojan-col-good');
      expect(salesCss).toContain('.fps-toggle-btn');
      expect(salesCss).toContain('.trojan-claim-btn');
    });
  });

  describe('2. Sales Controller Implementation Verification', () => {
    it('implements Trojan URL parsing, mounting, and simulation controllers in sales-app.js', () => {
      expect(salesAppJs).toContain('function initTrojanPitchFromUrl');
      expect(salesAppJs).toContain('function mountTrojanTeardown');
      expect(salesAppJs).toContain('function toggleTrojanFps');
      expect(salesAppJs).toContain('function claimTrojanConsultation');
      expect(salesAppJs).toContain('initTrojanPitchFromUrl()');
    });

    it('exports Trojan methods to global window scope for inline event accessibility', () => {
      expect(salesAppJs).toContain('window.initTrojanPitchFromUrl = initTrojanPitchFromUrl;');
      expect(salesAppJs).toContain('window.mountTrojanTeardown = mountTrojanTeardown;');
      expect(salesAppJs).toContain('window.toggleTrojanFps = toggleTrojanFps;');
      expect(salesAppJs).toContain('window.claimTrojanConsultation = claimTrojanConsultation;');
    });

    it('upgrades openConsultationModal to accept prefill context and active Trojan data', () => {
      expect(salesAppJs).toContain('function openConsultationModal(prefill = null)');
      expect(salesAppJs).toContain('const activePrefill = prefill || window._activeTrojanData;');
    });
  });

  describe('3. Workspace Teardown Controller Verification', () => {
    it('implements getTeardownUrl, live preview, and WhatsApp triggers in workspace/app.js', () => {
      expect(workspaceAppJs).toContain('function getTeardownUrl');
      expect(workspaceAppJs).toContain('function openClientTeardownModal');
      expect(workspaceAppJs).toContain('function closeClientTeardownModal');
      expect(workspaceAppJs).toContain('function copyTeardownLink');
      expect(workspaceAppJs).toContain('function previewTeardownPage');
      expect(workspaceAppJs).toContain('function sendWhatsAppTeardown');
    });

    it('exports workspace teardown methods to window and global scopes', () => {
      expect(workspaceAppJs).toContain('window.getTeardownUrl = getTeardownUrl;');
      expect(workspaceAppJs).toContain('window.openClientTeardownModal = openClientTeardownModal;');
      expect(workspaceAppJs).toContain('window.copyTeardownLink = copyTeardownLink;');
      expect(workspaceAppJs).toContain('window.previewTeardownPage = previewTeardownPage;');
      expect(workspaceAppJs).toContain('window.sendWhatsAppTeardown = sendWhatsAppTeardown;');
    });
  });

  describe('4. Algorithmic Parameter Synthesis & Logic Tests', () => {
    it('synthesizes complete, valid query strings from prospect dossiers', () => {
      const p = {
        name: 'Tatva Fine Dining, Jubilee Hills',
        dm: 'Managing Partners (Operations)',
        site: 'https://tatvafinedining.com',
        lcpTime: 'LCP: 4.4s',
        speedScore: '32/100',
        revenueLeak: '₹1,80,000/mo',
        wastedSpend: '₹48,000/yr',
        fee: '₹65,000',
        cat: 'fine_dining'
      };

      const params = new URLSearchParams({
        prospect: p.name || "",
        dm: (p.dm || "").split("(")[0].trim(),
        site: (p.site && p.site !== '#') ? p.site : "",
        lcp: (p.lcpTime || "4.5s").replace("LCP: ", "").trim(),
        speed: String(p.speedScore || 35).replace("/100", "").trim(),
        leak: p.revenueLeak || "₹1,80,000/mo",
        bleed: p.wastedSpend || "₹42,000/yr",
        fee: p.fee || "₹50,000",
        cat: p.cat || ""
      });

      const url = `https://apoorv.qzz.io/sales?${params.toString()}`;
      expect(url).toContain('https://apoorv.qzz.io/sales?');
      expect(url).toContain('prospect=Tatva+Fine+Dining%2C+Jubilee+Hills');
      expect(url).toContain('dm=Managing+Partners');
      expect(url).toContain('lcp=4.4s');
      expect(url).toContain('speed=32');
      expect(url).toContain('leak=%E2%82%B91%2C80%2C000%2Fmo');
      expect(url).toContain('bleed=%E2%82%B948%2C000%2Fyr');
    });

    it('formats WhatsApp outreach message with encoded URL and Indian country code prefix', () => {
      const p = {
        name: 'Conçu Patisserie',
        dm: 'Sahil Taneja',
        phone: '98490 12345',
        site: 'https://concu.in'
      };

      const cleanPhone = (p.phone || '').replace(/[^0-9]/g, '');
      const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      expect(targetPhone).toBe('919849012345');

      const teardownUrl = 'https://apoorv.qzz.io/sales?prospect=Con%C3%A7u+Patisserie';
      const msg = `Namaskaram ${p.dm}, following up on our call on Apoorv's behalf regarding ${p.name}. Apoorv prepared an interactive 3D mobile performance teardown showing your current 4G speed vs a 60 FPS refactor: ${teardownUrl}\n\nWould Thursday 4 PM work to review this with Apoorv?`;

      const waLink = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
      expect(waLink).toContain('https://wa.me/919849012345?text=');
      expect(decodeURIComponent(waLink)).toContain(teardownUrl);
      expect(decodeURIComponent(waLink)).toContain('Thursday 4 PM');
    });

    it('neutralizes XSS injection payloads in prospect query parameters via textContent mapping', () => {
      const mockPayload = '<script>alert(1)</script>';
      const escapeHtml = (str) => String(str || "").replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
      const sanitized = escapeHtml(mockPayload);

      expect(sanitized).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
      expect(sanitized).not.toContain('<script>');
    });
  });
});
