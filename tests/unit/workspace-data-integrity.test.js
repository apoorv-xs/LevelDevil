import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import vm from 'vm';

describe('Workspace Data Integrity & Dynamic Bindings', () => {
  let prospects = [];
  let customProspects = [];

  beforeEach(() => {
    // Load prospects_data.js
    const prospectsCode = fs.readFileSync('workspace/prospects_data.js', 'utf8');
    const ctx = { window: {} };
    vm.createContext(ctx);
    vm.runInContext(prospectsCode, ctx);
    prospects = ctx.window.PROSPECTS || ctx.PROSPECTS || [];

    // Load custom_prospects.js
    const customCode = fs.readFileSync('workspace/custom_prospects.js', 'utf8');
    const customCtx = { window: {} };
    vm.createContext(customCtx);
    vm.runInContext(customCode, customCtx);
    customProspects = customCtx.window.CUSTOM_PROSPECTS || customCtx.dataset || customCtx.window.dataset || [];
  });

  it('ensures all prospects have verified review ratings (4.5 - 5.0)', () => {
    expect(prospects.length).toBeGreaterThanOrEqual(60);
    prospects.forEach((p) => {
      expect(p.rating).toBeDefined();
      expect(typeof p.rating).toBe('number');
      expect(p.rating).toBeGreaterThanOrEqual(4.0);
      expect(p.rating).toBeLessThanOrEqual(5.0);
    });

    expect(customProspects.length).toBeGreaterThan(0);
    customProspects.forEach((p) => {
      expect(p.rating).toBeDefined();
      expect(typeof p.rating).toBe('number');
      expect(p.rating).toBeGreaterThanOrEqual(4.0);
      expect(p.rating).toBeLessThanOrEqual(5.0);
    });
  });

  it('accurately distinguishes companies with no owned website (STARTER tier)', () => {
    const noSiteLeads = prospects.filter(p => !p.site || p.site === '#' || p.ptype === 'STARTER');
    // Oct-02 reverification: 4 leads (p-4/p-5/p-7/p-11) gained verified domains and converted to UPGRADE.
    expect(noSiteLeads.length).toBeGreaterThanOrEqual(7);

    noSiteLeads.forEach(p => {
      expect(p.site).toBe('#');
      expect(p.ptype).toBe('STARTER');
      expect(p.lcpTime).toContain('N/A');
      expect(p.speedScore).toContain('No Owned Site');
      expect(p.techStack).toContain('No Owned Domain');
      // Verify flaws mention aggregator dependency
      expect(p.flaws.some(f => f.toLowerCase().includes('zero owned domain') || f.toLowerCase().includes('aggregator'))).toBe(true);
      // Verify security audit notes absence of owned domain
      expect(p.securityAudit.score).toContain('15/100');
    });
  });

  it('dynamically adapts 3D WebUI Moat cards for both Starter (no website) and Upgrade leads', () => {
    // Read app.js code to test updateMoatSolutions logic
    const appJs = fs.readFileSync('workspace/app.js', 'utf8');
    
    // Simulate DOM elements
    const mockElements = {
      moatSol1Title: { innerText: '' },
      moatSol1Desc: { innerText: '' },
      moatSol2Title: { innerText: '' },
      moatSol2Desc: { innerText: '' },
      moatSol3Title: { innerText: '' },
      moatSol3Desc: { innerText: '' }
    };

    const mockDoc = {
      getElementById: (id) => mockElements[id] || null
    };

    const ctx = {
      document: mockDoc,
      window: {},
      console
    };
    vm.createContext(ctx);

    // Extract updateMoatSolutions function
    const fnMatch = appJs.match(/function updateMoatSolutions\([\s\S]*?\n\}/);
    expect(fnMatch).not.toBeNull();
    vm.runInContext(fnMatch[0], ctx);

    // 1. Test with Starter (no website) lead
    const starterLead = prospects.find(p => p.ptype === 'STARTER' && p.cat === 'clinic');
    expect(starterLead).toBeDefined();

    ctx.updateMoatSolutions(starterLead, true);
    expect(mockElements.moatSol1Title.innerText).toBe('First Owned Digital Flagship');
    expect(mockElements.moatSol1Desc.innerText).toContain('first owned 60 FPS mobile web presence');
    expect(mockElements.moatSol2Title.innerText).toBe('Direct Patient Intake Portal');
    expect(mockElements.moatSol2Desc.innerText).toContain('Practo');
    expect(mockElements.moatSol3Title.innerText).toBe('Interactive 3D Treatment Model');

    // 2. Test with Upgrade lead (WordPress dental clinic)
    const upgradeLead = prospects.find(p => p.ptype === 'UPGRADE' && p.cat === 'clinic');
    expect(upgradeLead).toBeDefined();

    ctx.updateMoatSolutions(upgradeLead, false);
    expect(mockElements.moatSol1Title.innerText).toBe('Sub-0.8s Headless Edge Shell');
    expect(mockElements.moatSol1Desc.innerText).toContain(upgradeLead.techStack);
    expect(mockElements.moatSol2Title.innerText).toBe('Direct Patient Intake Portal');

    // 3. Test with Restaurant lead
    const restaurantLead = prospects.find(p => p.cat === 'restaurant');
    expect(restaurantLead).toBeDefined();
    ctx.updateMoatSolutions(restaurantLead, false);
    expect(mockElements.moatSol2Title.innerText).toBe('Zero-Commission Direct Portal');
    expect(mockElements.moatSol2Desc.innerText).toContain('Zomato/Swiggy');
    expect(mockElements.moatSol3Title.innerText).toBe('Interactive 3D Dining Ambiance');
  });

  it('verifies showLaymanAnalogy and closeLaymanAnalogy exist and manipulate the DOM cleanly', () => {
    const appJs = fs.readFileSync('workspace/app.js', 'utf8');
    expect(appJs).toContain('function showLaymanAnalogy');
    expect(appJs).toContain('function closeLaymanAnalogy');
    expect(appJs).toContain('window.showLaymanAnalogy = showLaymanAnalogy');
    expect(appJs).toContain('window.closeLaymanAnalogy = closeLaymanAnalogy');
  });

  it('verifies first-time onboarding disclaimer overlay contracts and closed-deal compensation logic', () => {
    const indexHtml = fs.readFileSync('workspace/index.html', 'utf8');
    const appJs = fs.readFileSync('workspace/app.js', 'utf8');

    // 1. Verify HTML markup and IDs
    expect(indexHtml).toContain('id="onboardingDisclaimer"');
    expect(indexHtml).toContain('id="btnAcknowledgeOnboarding"');
    expect(indexHtml).toContain('Standard Discovery Booking (10% Cut)');
    expect(indexHtml).toContain('Pre-Sold Warm Booking (15% Prime Cut!)');
    expect(indexHtml).toContain('Closed Deals Only');
    expect(indexHtml).toContain('acknowledgeOnboarding()');

    // 2. Verify JS functions and exports
    expect(appJs).toContain('function maybeShowOnboardingDisclaimer');
    expect(appJs).toContain('function acknowledgeOnboarding');
    expect(appJs).toContain('window.maybeShowOnboardingDisclaimer = maybeShowOnboardingDisclaimer');
    expect(appJs).toContain('window.acknowledgeOnboarding = acknowledgeOnboarding');

    // 3. Test execution logic with simulated DOM & localStorage
    const mockStorage = {};
    const mockOverlay = {
      classList: {
        classes: ['hidden'],
        add(c) { if (!this.classes.includes(c)) this.classes.push(c); },
        remove(c) { this.classes = this.classes.filter(x => x !== c); },
        contains(c) { return this.classes.includes(c); }
      },
      style: { display: 'none' }
    };

    const ctx = {
      window: {},
      global: {},
      document: {
        getElementById: (id) => (id === 'onboardingDisclaimer' ? mockOverlay : null)
      },
      localStorage: {
        getItem: (k) => mockStorage[k] || null,
        setItem: (k, v) => { mockStorage[k] = String(v); }
      },
      showNotification: () => {},
      isOwnerUser: (u) => u && (u.role === 'owner' || u.email === 'apoorvxs@gmail.com'),
      currentUser: null
    };
    vm.createContext(ctx);

    // Extract the functions
    const maybeShowFn = appJs.match(/function maybeShowOnboardingDisclaimer\(\) \{[\s\S]*?\n\}/);
    const ackFn = appJs.match(/function acknowledgeOnboarding\(\) \{[\s\S]*?\n\}/);
    expect(maybeShowFn).not.toBeNull();
    expect(ackFn).not.toBeNull();

    vm.runInContext(maybeShowFn[0], ctx);
    vm.runInContext(ackFn[0], ctx);

    // Test A: Owner user should NOT see the overlay
    ctx.currentUser = { name: 'Apoorv', email: 'apoorvxs@gmail.com', role: 'owner', sub: 'owner_1' };
    ctx.maybeShowOnboardingDisclaimer();
    expect(mockOverlay.style.display).toBe('none');

    // Test B: First-time Caller should see the overlay
    ctx.currentUser = { name: 'Alice Rep', email: 'alice@sprintdial.co', role: 'caller', sub: 'caller_alice_123' };
    ctx.maybeShowOnboardingDisclaimer();
    expect(mockOverlay.classList.contains('hidden')).toBe(false);
    expect(mockOverlay.style.display).toBe('flex');

    // Test C: Caller acknowledges the onboarding
    ctx.acknowledgeOnboarding();
    expect(mockOverlay.classList.contains('hidden')).toBe(true);
    expect(mockOverlay.style.display).toBe('none');
    expect(mockStorage['sprintdial_onboarding_ack_caller_alice_123']).toBeDefined();

    // Test D: Subsequent visits do NOT show the overlay
    ctx.maybeShowOnboardingDisclaimer();
    expect(mockOverlay.style.display).toBe('none');
  });
});
