import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Specialized Field Workflows, Validation & Cognitive Color Audit', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const salesHtml = fs.readFileSync(path.join(rootDir, 'sales.html'), 'utf8');
  const salesCss = fs.readFileSync(path.join(rootDir, 'sales.css'), 'utf8');
  const salesAppJs = fs.readFileSync(path.join(rootDir, 'sales-app.js'), 'utf8');
  const shellCss = fs.readFileSync(path.join(rootDir, 'shell.css'), 'utf8');
  const workspaceHtml = fs.readFileSync(path.join(rootDir, 'workspace/index.html'), 'utf8');
  const workspaceAppJs = fs.readFileSync(path.join(rootDir, 'workspace/app.js'), 'utf8');

  describe('Sales Page Field Ergonomics & Interactive 1-Click Chips', () => {
    it('defines 1-click Scope and Budget Tier chips in sales.html', () => {
      expect(salesHtml).toContain('id="scope-chips"');
      expect(salesHtml).toContain('id="budget-chips"');
      expect(salesHtml).toContain('data-val="Performance Sprint"');
      expect(salesHtml).toContain('data-val="$5k - $15k"');
    });

    it('provides field headers and live feedback containers for Name, Email, and Message', () => {
      expect(salesHtml).toContain('id="feedback-name"');
      expect(salesHtml).toContain('id="feedback-email"');
      expect(salesHtml).toContain('id="feedback-message"');
      expect(salesHtml).toContain('class="field-header"');
    });

    it('implements bidirectional chip synchronization in sales-app.js', () => {
      expect(salesAppJs).toContain('function initChipGroups()');
      expect(salesAppJs).toContain('scopeChips.forEach');
      expect(salesAppJs).toContain('budgetChips.forEach');
      expect(salesAppJs).toContain('chip.classList.add("active")');
    });

    it('implements live validation handlers with regex and character counting in sales-app.js', () => {
      expect(salesAppJs).toContain('function initLiveValidation()');
      expect(salesAppJs).toContain('emailRegex.test');
      expect(salesAppJs).toContain('✓ VERIFIED');
      expect(salesAppJs).toContain('INVALID EMAIL');
      expect(salesAppJs).toContain('✓ READY');
    });

    it('elevates submit button with dispatching and success feedback states', () => {
      expect(salesAppJs).toContain('[ ⚡ DISPATCHING... ]');
      expect(salesAppJs).toContain('[ ✓ INQUIRY DISPATCHED ]');
    });
  });

  describe('Cognitive Color Settings & Contrast Invariants', () => {
    it('styles dynamic input focus transitions with white elevation and purple accent', () => {
      expect(salesCss).toContain('input:focus');
      expect(salesCss).toContain('background: var(--white)');
      expect(salesCss).toContain('box-shadow: inset 4px 0 0 var(--purple)');
    });

    it('defines high-contrast validation feedback styles in sales.css', () => {
      expect(salesCss).toContain('input.is-valid');
      expect(salesCss).toContain('input.is-invalid');
      expect(salesCss).toContain('.field-feedback.valid');
      expect(salesCss).toContain('.field-feedback.invalid');
    });

    it('styles 1-click tier chips with tactile pressed states', () => {
      expect(salesCss).toContain('.tier-chip');
      expect(salesCss).toContain('.tier-chip.active');
      expect(salesCss).toContain('background: var(--purple)');
    });

    it('enforces universal focus-visible accessibility ring in shell.css', () => {
      expect(shellCss).toContain(':focus-visible');
      expect(shellCss).toContain('outline: 3px solid var(--shell-purple');
    });

    it('styles SFX toggle with high-visibility active gold accent in shell.css', () => {
      expect(shellCss).toContain('.sfx-btn');
      expect(shellCss).toContain('background: var(--shell-accent)');
      expect(shellCss).toContain('.sfx-btn.sfx-muted');
    });
  });

  describe('Workspace Cockpit Operator Workflows', () => {
    it('includes visual keyboard shortcut badge [ / ] on search input in workspace/index.html', () => {
      expect(workspaceHtml).toContain('id="queueSearchInput"');
      expect(workspaceHtml).toContain('select-none">/</span>');
    });

    it('implements keyboard navigation supporting both / and Ctrl+K / Cmd+K in workspace/app.js', () => {
      expect(workspaceAppJs).toContain("e.key === '/'");
      expect(workspaceAppJs).toContain("(e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'");
      expect(workspaceAppJs).toContain("searchInp.select()");
    });

    it('provides distinct WhatsApp emerald and telephone call hover states in workspace/index.html', () => {
      expect(workspaceHtml).toContain('#callActionBtn:hover');
      expect(workspaceHtml).toContain('#whatsappActionBtn:hover');
      expect(workspaceHtml).toContain('background: #25D366 !important');
    });
  });
});
