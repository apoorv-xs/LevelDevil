import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Subsystem 16: Asymmetric Alpha Content Shield & Anti-Extraction Defenses', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const shellCssContent = fs.readFileSync(path.join(rootDir, 'shell.css'), 'utf-8');
  const shellJsContent = fs.readFileSync(path.join(rootDir, 'shell.js'), 'utf-8');
  const workspaceHtmlContent = fs.readFileSync(path.join(rootDir, 'workspace/index.html'), 'utf-8');
  const workspaceAppContent = fs.readFileSync(path.join(rootDir, 'workspace/app.js'), 'utf-8');

  describe('16.1 CSS Content Shield & Print Redaction Rules', () => {
    it('declares universal selection lock for .shield-protected containers', () => {
      expect(shellCssContent).toContain('.shield-protected');
      expect(shellCssContent).toMatch(/user-select:\s*none\s*!important/);
      expect(shellCssContent).toMatch(/-webkit-user-select:\s*none\s*!important/);
    });

    it('exempts input and textarea fields to guarantee interactive typing usability', () => {
      expect(shellCssContent).toContain('.shield-protected input');
      expect(shellCssContent).toContain('.shield-protected textarea');
      expect(shellCssContent).toMatch(/user-select:\s*text\s*!important/);
      expect(shellCssContent).toMatch(/-webkit-touch-callout:\s*default\s*!important/);
    });

    it('configures anti-snipping blur filter and overlay styles', () => {
      expect(shellCssContent).toContain('.anti-snipping-blurred');
      expect(shellCssContent).toMatch(/filter:\s*blur\(20px\)/);
      expect(shellCssContent).toContain('#antiSnippingShield');
      expect(shellCssContent).toContain('#antiSnippingShield.active');
      expect(shellCssContent).toMatch(/backdrop-filter:\s*blur\(24px\)/);
    });

    it('enforces total print redaction and confidential legal watermark for Ctrl+P / PDF dump', () => {
      expect(shellCssContent).toContain('@media print');
      expect(shellCssContent).toMatch(/visibility:\s*hidden\s*!important/);
      expect(shellCssContent).toContain('CONFIDENTIAL PROPRIETARY MATERIAL');
      expect(shellCssContent).toContain('APOORV A S (APOORV.QZZ.IO)');
    });

    it('styles pointer-events-none forensic session watermark canvas overlay', () => {
      expect(shellCssContent).toContain('.forensic-watermark-overlay');
      expect(shellCssContent).toMatch(/pointer-events:\s*none/);
      expect(shellCssContent).toMatch(/opacity:\s*0\.045/);
    });
  });

  describe('16.2 Workspace Markup & Shield Panel Binding', () => {
    it('binds .shield-protected class to confidential prospect queue', () => {
      expect(workspaceHtmlContent).toMatch(/id="queuePane"[^>]*class="[^"]*shield-protected/);
    });

    it('binds .shield-protected class to strategic objection soundboard', () => {
      expect(workspaceHtmlContent).toMatch(/id="soundboardPanel"[^>]*class="[^"]*shield-protected/);
    });

    it('binds .shield-protected and relative containment to executive dossier pane', () => {
      expect(workspaceHtmlContent).toMatch(/id="dossierPane"[^>]*class="[^"]*shield-protected/);
      expect(workspaceHtmlContent).toMatch(/id="dossierPane"[^>]*class="[^"]*relative/);
    });

    it('embeds antiSnippingShield modal overlay before script tags', () => {
      expect(workspaceHtmlContent).toContain('id="antiSnippingShield"');
      expect(workspaceHtmlContent).toContain('CLIENT RADAR COCKPIT LOCKED');
      expect(workspaceHtmlContent).toContain('Window focus lost. Display blurred to protect confidential client telemetry');
    });
  });

  describe('16.3 Global Shell Security Engine Execution', () => {
    it('contains asset drag protection in shell.js', () => {
      expect(shellJsContent).toContain('dragstart');
      expect(shellJsContent).toContain('target.tagName === "IMG"');
      expect(shellJsContent).toContain('target.tagName === "CANVAS"');
    });

    it('contains right-click context menu guard in shell.js', () => {
      expect(shellJsContent).toContain('contextmenu');
      expect(shellJsContent).toContain('Context inspection is disabled on protected surfaces');
    });

    it('contains selective copy interception poisoning in shell.js with legal attribution', () => {
      expect(shellJsContent).toContain('CONFIDENTIAL & PROPRIETARY // APOORV A S (apoorv.qzz.io)');
      expect(shellJsContent).toContain('Asymmetric Alpha Protocol');
      expect(shellJsContent).toContain('Content Protected: Proprietary material cannot be extracted');
    });

    it('contains PrintScreen key listener and clipboard purge', () => {
      expect(shellJsContent).toContain('PrintScreen');
      expect(shellJsContent).toContain('triggerShieldStrobe');
      expect(shellJsContent).toContain('Screen Capture Restricted // Clipboard purged');
    });

    it('contains keyboard shortcut traps for print, save, and view source', () => {
      expect(shellJsContent).toContain('Printing and PDF export are restricted');
      expect(shellJsContent).toContain('Source page saving is restricted');
      expect(shellJsContent).toContain('Source inspection is restricted');
    });

    it('contains focus loss and blur event listeners for anti-snipping blur', () => {
      expect(shellJsContent).toContain('handleWindowBlur');
      expect(shellJsContent).toContain('handleWindowFocus');
      expect(shellJsContent).toContain('anti-snipping-blurred');
    });
  });

  describe('16.4 Forensic Session Watermark Implementation', () => {
    it('implements initForensicWatermark in workspace/app.js', () => {
      expect(workspaceAppContent).toContain('function initForensicWatermark()');
      expect(workspaceAppContent).toContain('canvas.forensic-watermark-overlay');
      expect(workspaceAppContent).toContain('APOORV.QZZ.IO');
      expect(workspaceAppContent).toContain('rgba(255, 255, 255, 0.045)');
    });

    it('exports initForensicWatermark to window and global scopes', () => {
      expect(workspaceAppContent).toContain('window.initForensicWatermark = initForensicWatermark');
      expect(workspaceAppContent).toContain('global.initForensicWatermark = initForensicWatermark');
    });
  });
});
