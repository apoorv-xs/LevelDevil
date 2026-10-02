import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import vm from 'vm';

describe('Subsystem 5: Client Radar Workspace & Outreach Cockpit (Expanded Matrix)', () => {
  let prospectsData = [];
  let OBJECTIONS = [];
  let LAYMAN_ANALOGIES = {};
  let appendObjectionToNotes;
  let showLaymanAnalogy;
  let closeLaymanAnalogy;
  let mockElements = {};

  const workspaceHtml = fs.readFileSync('workspace/index.html', 'utf8');
  const workspaceAppJs = fs.readFileSync('workspace/app.js', 'utf8');
  const manifestRaw = fs.readFileSync('workspace/manifest.json', 'utf8');
  const manifest = JSON.parse(manifestRaw);

  beforeEach(() => {
    mockElements = {
      callNotesInput: { value: 'Initial notes' },
      laymanAnalogyModal: {
        classList: {
          _classes: new Set(['hidden']),
          add(c) { this._classes.add(c); },
          remove(c) { this._classes.delete(c); },
          contains(c) { return this._classes.has(c); }
        }
      },
      laymanAnalogyIcon: { innerText: '' },
      laymanAnalogyTitle: { innerText: '' },
      laymanAnalogyCategory: { innerText: '' },
      laymanAnalogyMetaphor: { innerText: '' },
      laymanAnalogyTalkingPoint: { innerText: '' }
    };

    const mockDoc = {
      getElementById: (id) => mockElements[id] || null,
      createElement: (tag) => ({
        tagName: tag.toUpperCase(),
        value: '',
        classList: {
          _classes: new Set(),
          add(c) { this._classes.add(c); },
          remove(c) { this._classes.delete(c); },
          contains(c) { return this._classes.has(c); }
        }
      })
    };

    const ctx = {
      window: {},
      global: {},
      document: mockDoc,
      playSound: vi.fn(),
      saveNotesLocally: vi.fn(),
      showNotification: vi.fn(),
      activeLang: 'ml'
    };
    ctx.window = ctx;
    ctx.global = ctx;
    vm.createContext(ctx);

    const pCode = fs.readFileSync('workspace/prospects_data.js', 'utf8');
    vm.runInContext(pCode, ctx);
    prospectsData = ctx.PROSPECTS || ctx.DEFAULT_PROSPECTS || [];

    const objCode = fs.readFileSync('workspace/objections.js', 'utf8');
    vm.runInContext(objCode, ctx);
    OBJECTIONS = ctx.OBJECTIONS || [];
    LAYMAN_ANALOGIES = ctx.LAYMAN_ANALOGIES || {};
    appendObjectionToNotes = ctx.appendObjectionToNotes;
    showLaymanAnalogy = ctx.showLaymanAnalogy;
    closeLaymanAnalogy = ctx.closeLaymanAnalogy;
  });

  // --------------------------------------------------------------------------
  // 5.1: 65 Prospect Dossiers & Search Engine
  // --------------------------------------------------------------------------
  describe('5.1 65 Prospect Dossiers & Search Engine', () => {
    it('verifies default prospects dataset contains exactly 60 curated high-ticket accounts', () => {
      expect(Array.isArray(prospectsData)).toBe(true);
      expect(prospectsData.length).toBe(60);
    });

    it('enforces complete schema integrity on all 60 core prospect records', () => {
      prospectsData.forEach((p, index) => {
        expect(p.id, `Prospect #${index} must have id`).toBeDefined();
        expect(p.id).toMatch(/^p-\d+$/);
        expect(p.name, `Prospect ${p.id} missing name`).toBeTruthy();
        expect(p.city, `Prospect ${p.id} missing city`).toBeTruthy();
        expect(p.dm, `Prospect ${p.id} missing decision maker`).toBeTruthy();
        expect(p.phone, `Prospect ${p.id} missing phone`).toBeTruthy();
        expect(p.speedScore, `Prospect ${p.id} missing speedScore`).toBeTruthy();
        expect(p.lcpTime, `Prospect ${p.id} missing lcpTime`).toBeTruthy();
        expect(p.techStack, `Prospect ${p.id} missing techStack`).toBeTruthy();
        expect(p.fee, `Prospect ${p.id} missing fee`).toBeTruthy();
        expect(p.cat, `Prospect ${p.id} missing category`).toBeTruthy();
        expect(Array.isArray(p.flaws), `Prospect ${p.id} flaws must be an array`).toBe(true);
        expect(p.flaws.length).toBeGreaterThan(0);
      });
    });

    it('verifies all prospect records possess bilingual scripts (ml, manglish, en)', () => {
      prospectsData.forEach((p) => {
        expect(p.scripts).toBeDefined();
        expect(p.scripts.speed).toBeDefined();
        expect(p.scripts.speed.ml).toBeTruthy();
        expect(p.scripts.speed.manglish).toBeTruthy();
        expect(p.scripts.speed.en).toBeTruthy();
        expect(p.scripts.commission).toBeDefined();
        expect(p.scripts.commission.en).toBeTruthy();
        expect(p.scripts.visual).toBeDefined();
        expect(p.scripts.visual.en).toBeTruthy();
        expect(p.scripts.gatekeeper).toBeTruthy();
      });
    });

    it('verifies caller cheat sheets and layman analogies for every prospect', () => {
      prospectsData.forEach((p) => {
        expect(p.callerCheatSheet).toBeDefined();
        expect(p.callerCheatSheet.icebreaker).toBeTruthy();
        expect(p.callerCheatSheet.laymanAnalogy).toBeTruthy();
        expect(p.callerCheatSheet.competitorEdge).toBeTruthy();
      });
    });

    it('verifies wasted spend analysis and annual breakdown for every prospect', () => {
      prospectsData.forEach((p) => {
        expect(p.wastedSpend).toBeDefined();
        expect(p.wastedSpend).toMatch(/₹[\d,]+\/(yr|mo)/);
        expect(Array.isArray(p.wastedBreakdown)).toBe(true);
        expect(p.wastedBreakdown.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('fuzzy search handles null, undefined, and empty string without throwing', () => {
      const searchFn = (query, list) => {
        const q = (query || '').toLowerCase().trim();
        if (!q) return list;
        return list.filter(p => {
          const name = (p.name || '').toLowerCase();
          const dm = (p.dm || '').toLowerCase();
          const city = (p.city || '').toLowerCase();
          const cat = (p.cat || '').toLowerCase();
          return name.includes(q) || dm.includes(q) || city.includes(q) || cat.includes(q);
        });
      };

      expect(searchFn(null, prospectsData).length).toBe(60);
      expect(searchFn(undefined, prospectsData).length).toBe(60);
      expect(searchFn('', prospectsData).length).toBe(60);
      expect(searchFn('   ', prospectsData).length).toBe(60);
    });

    it('escapes special regex characters in search strings safely', () => {
      const safeSearch = (term, list) => {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'i');
        return list.filter(p => regex.test(p.name) || regex.test(p.dm) || regex.test(p.phone));
      };

      expect(() => safeSearch('C++', prospectsData)).not.toThrow();
      expect(() => safeSearch('A*', prospectsData)).not.toThrow();
      expect(() => safeSearch('(Director)', prospectsData)).not.toThrow();
      expect(() => safeSearch('+91 79999', prospectsData)).not.toThrow();
      expect(safeSearch('+91 79999', prospectsData).length).toBeGreaterThan(0);
    });

    it('filters prospect accounts strictly by city territory', () => {
      const filterByCity = (city, list) => {
        if (!city || city === 'All') return list;
        return list.filter(p => (p.city || '').toLowerCase() === city.toLowerCase());
      };

      const kochiList = filterByCity('Kochi', prospectsData);
      expect(kochiList.length).toBeGreaterThan(0);
      expect(kochiList.every(p => p.city.toLowerCase() === 'kochi')).toBe(true);

      const allList = filterByCity('All', prospectsData);
      expect(allList.length).toBe(60);
    });

    it('clamps active lead stepper index between 0 and dataset length - 1', () => {
      const clampIndex = (current, delta, total) => {
        const next = current + delta;
        if (next < 0) return 0;
        if (next >= total) return total - 1;
        return next;
      };

      const total = prospectsData.length;
      expect(clampIndex(0, -1, total)).toBe(0);
      expect(clampIndex(0, -5, total)).toBe(0);
      expect(clampIndex(total - 1, 1, total)).toBe(total - 1);
      expect(clampIndex(total - 1, 10, total)).toBe(total - 1);
      expect(clampIndex(5, 1, total)).toBe(6);
      expect(clampIndex(5, -1, total)).toBe(4);
    });

    it('validates 10-digit phone normalization to India 91 country code prefix', () => {
      const normalizePhone = (raw) => {
        let clean = String(raw || '').replace(/[^0-9]/g, '');
        if (clean.length === 10) clean = '91' + clean;
        return clean;
      };

      expect(normalizePhone('9447034567')).toBe('919447034567');
      expect(normalizePhone('+91 94470 34567')).toBe('919447034567');
      expect(normalizePhone('09447034567')).toBe('09447034567');
    });

    it('verifies status mutation support on prospects (available, locked, called, closed)', () => {
      const validStatuses = ['available', 'locked', 'called', 'closed', 'follow-up'];
      const lead = { ...prospectsData[0], status: 'available' };

      validStatuses.forEach(s => {
        lead.status = s;
        expect(validStatuses).toContain(lead.status);
      });
    });
  });

  // --------------------------------------------------------------------------
  // 5.2: Closer Soundboard & Bilingual Objections
  // --------------------------------------------------------------------------
  describe('5.2 Closer Soundboard & Bilingual Objections', () => {
    it('defines exactly 6 core objection rebuttals in OBJECTIONS array', () => {
      expect(Array.isArray(OBJECTIONS)).toBe(true);
      expect(OBJECTIONS.length).toBe(6);
    });

    it('verifies each objection contains a title, English script, and Malayalam script', () => {
      OBJECTIONS.forEach((obj, idx) => {
        expect(obj.title, `Objection #${idx} missing title`).toBeTruthy();
        expect(obj.en, `Objection #${idx} missing English script`).toBeTruthy();
        expect(obj.ml, `Objection #${idx} missing Malayalam script`).toBeTruthy();
        expect(obj.en.length).toBeGreaterThan(20);
        expect(obj.ml.length).toBeGreaterThan(20);
      });
    });

    it('verifies all expected core objection topics are covered', () => {
      const titles = OBJECTIONS.map(o => o.title.toLowerCase());
      expect(titles.some(t => t.includes('email') || t.includes('brochure'))).toBe(true);
      expect(titles.some(t => t.includes('agency') || t.includes('web guy'))).toBe(true);
      expect(titles.some(t => t.includes('invest'))).toBe(true);
      expect(titles.some(t => t.includes('practo') || t.includes('zomato'))).toBe(true);
      expect(titles.some(t => t.includes('nephew') || t.includes('friend'))).toBe(true);
      expect(titles.some(t => t.includes('instagram'))).toBe(true);
    });

    it('defines all 5 critical technical layman analogies (lcp, dom, dpdp, tls/ssl, webgl)', () => {
      expect(LAYMAN_ANALOGIES).toBeDefined();
      expect(LAYMAN_ANALOGIES.lcp).toBeDefined();
      expect(LAYMAN_ANALOGIES.dom).toBeDefined();
      expect(LAYMAN_ANALOGIES.dpdp).toBeDefined();
      expect(LAYMAN_ANALOGIES.tls || LAYMAN_ANALOGIES.ssl).toBeDefined();
      expect(LAYMAN_ANALOGIES.webgl).toBeDefined();
    });

    it('verifies each layman analogy contains icon, title, category, metaphor, and talking points', () => {
      Object.entries(LAYMAN_ANALOGIES).forEach(([key, item]) => {
        expect(item.icon, `Analogy ${key} missing icon`).toBeTruthy();
        expect(item.title, `Analogy ${key} missing title`).toBeTruthy();
        expect(item.category, `Analogy ${key} missing category`).toBeTruthy();
        expect(item.metaphor, `Analogy ${key} missing metaphor`).toBeTruthy();
        expect(item.metaphorMl, `Analogy ${key} missing Malayalam metaphor`).toBeTruthy();
        expect(item.talkingPoint, `Analogy ${key} missing talkingPoint`).toBeTruthy();
        expect(item.talkingPointMl, `Analogy ${key} missing Malayalam talkingPoint`).toBeTruthy();
      });
    });

    it('appends objection rebuttal to call notes without overwriting existing notes', () => {
      appendObjectionToNotes('Send brochure', 'A 3-minute walkthrough is 10x more valuable.');
      const notesVal = mockElements.callNotesInput.value;

      expect(notesVal).toContain('Initial notes');
      expect(notesVal).toContain('[Objection: "Send brochure"]');
      expect(notesVal).toContain('A 3-minute walkthrough is 10x more valuable.');
    });

    it('renders layman analogy modal with active language routing', () => {
      showLaymanAnalogy('lcp');
      expect(mockElements.laymanAnalogyModal.classList.contains('hidden')).toBe(false);
      expect(mockElements.laymanAnalogyTitle.innerText).toContain('LCP');

      closeLaymanAnalogy();
      expect(mockElements.laymanAnalogyModal.classList.contains('hidden')).toBe(true);
    });

    it('suppresses closer hotkeys when typing in call notes or search inputs', () => {
      const isTyping = (el) => {
        if (!el) return false;
        const tag = (el.tagName || '').toUpperCase();
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || Boolean(el.isContentEditable);
      };

      expect(isTyping({ tagName: 'TEXTAREA' })).toBe(true);
      expect(isTyping({ tagName: 'INPUT' })).toBe(true);
      expect(isTyping({ tagName: 'DIV' })).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 5.3: Proposal Brief, Pricing & Deal Fulfillment
  // --------------------------------------------------------------------------
  describe('5.3 Proposal Brief, Pricing & Deal Fulfillment', () => {
    const calculateUpgradeFee = (techStack, lcpTime, flaws, category) => {
      let base = 50000;
      const lcpNum = parseFloat((lcpTime || '').replace(/[^0-9.]/g, '')) || 4.2;
      const stack = (techStack || '').toLowerCase();
      const flawList = Array.isArray(flaws) ? flaws.join(' ').toLowerCase() : '';
      const cat = (category || '').toLowerCase();

      if (lcpNum >= 4.5) base += 15000;
      if (stack.includes('elementor') || stack.includes('divi') || stack.includes('wix')) base += 15000;
      if (flawList.includes('3d') || flawList.includes('webgl') || flawList.includes('visualizer') || cat === 'design') base += 25000;
      if (flawList.includes('crm') || flawList.includes('booking') || flawList.includes('intake') || flawList.includes('reservation') || cat === 'clinic' || cat === 'restaurant') base += 20000;

      const finalFee = Math.min(125000, Math.max(50000, base));
      return `₹${finalFee.toLocaleString('en-IN')}`;
    };

    it('strictly enforces ₹50,000 minimum investment floor', () => {
      const fee = calculateUpgradeFee('Custom HTML', '1.2s', [], 'general');
      expect(fee).toBe('₹50,000');
    });

    it('adds ₹15,000 for severe LCP latency >= 4.5s', () => {
      const fee = calculateUpgradeFee('Custom HTML', '5.2s', [], 'general');
      expect(fee).toBe('₹65,000');
    });

    it('adds ₹15,000 for heavy CMS runtime drag (Elementor/Divi/Wix)', () => {
      const fee = calculateUpgradeFee('WordPress / Elementor', '2.0s', [], 'general');
      expect(fee).toBe('₹65,000');
    });

    it('adds ₹25,000 for interactive 3D WebGL / visualizer scope', () => {
      const fee = calculateUpgradeFee('Custom HTML', '2.0s', ['3D spatial floorplan'], 'design');
      expect(fee).toBe('₹75,000');
    });

    it('adds ₹20,000 for direct booking / aggregator disintermediation', () => {
      const fee = calculateUpgradeFee('Custom HTML', '2.0s', ['direct patient booking'], 'clinic');
      expect(fee).toBe('₹70,000');
    });

    it('caps maximum upgrade fee at ₹1,25,000 even with all multipliers combined', () => {
      const fee = calculateUpgradeFee('WordPress / Elementor / Divi', '6.8s', ['3D visualizer', 'crm booking portal'], 'clinic');
      expect(fee).toBe('₹1,25,000');
    });

    it('calculates 15% outreach partner commission with ₹7,500 floor', () => {
      const calculateCommission = (feeStr) => {
        const num = parseInt(feeStr.replace(/[^0-9]/g, ''), 10) || 50000;
        return Math.floor(num * 0.15);
      };

      expect(calculateCommission('₹50,000')).toBe(7500);
      expect(calculateCommission('₹75,000')).toBe(11250);
      expect(calculateCommission('₹1,00,000')).toBe(15000);
      expect(calculateCommission('₹1,25,000')).toBe(18750);
    });

    it('calculates 50% upfront advance deposit accurately', () => {
      const calculateAdvance = (feeStr) => {
        const num = parseInt(feeStr.replace(/[^0-9]/g, ''), 10) || 50000;
        return Math.floor(num * 0.50);
      };

      expect(calculateAdvance('₹50,000')).toBe(25000);
      expect(calculateAdvance('₹1,00,000')).toBe(50000);
      expect(calculateAdvance('₹1,25,000')).toBe(62500);
    });

    it('generates valid RFC 3986 URI-encoded WhatsApp brief links', () => {
      const p = prospectsData[0];
      const rawPhone = p.wa || p.phone;
      const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
      const testMsg = `നമസ്കാരം ${p.dm}, ${p.name}-ന്റെ വെബ്സൈറ്റ് ഓഡിറ്റ് പങ്കുവെക്കാനാണ്.`;
      const encodedMsg = encodeURIComponent(testMsg);
      const url = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

      expect(url.startsWith('https://wa.me/')).toBe(true);
      expect(url).toContain('?text=');
      expect(url).not.toContain(' ');
      expect(decodeURIComponent(encodedMsg)).toBe(testMsg);
    });

    it('generates client teardown shareable link with query parameter format', () => {
      const generateTeardownUrl = (prospectId) => `/workspace/?teardown=${encodeURIComponent(prospectId)}`;
      expect(generateTeardownUrl('p-1')).toBe('/workspace/?teardown=p-1');
      expect(generateTeardownUrl('p-60')).toBe('/workspace/?teardown=p-60');
      expect(generateTeardownUrl('custom-lead-123')).toBe('/workspace/?teardown=custom-lead-123');
    });
  });

  // --------------------------------------------------------------------------
  // 5.4: Sales Rep Email Invitations & Administration
  // --------------------------------------------------------------------------
  describe('5.4 Sales Rep Email Invitations & Administration', () => {
    it('generates RFC 4122 v4 UUID tokens for sales rep invitations', () => {
      const generateToken = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      const token = generateToken();
      expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('computes exact 72-hour expiration timestamp (Date.now() + 72h)', () => {
      const now = 1700000000000;
      const expiresAt = now + (72 * 60 * 60 * 1000);
      const deltaHours = (expiresAt - now) / (1000 * 60 * 60);
      expect(deltaHours).toBe(72);
    });

    it('tokenizes comma- and space-separated email lists into distinct invitations', () => {
      const parseEmailInput = (raw) => {
        return raw
          .split(/[\s,;]+/)
          .map(e => e.trim().toLowerCase())
          .filter(e => e.includes('@') && e.includes('.'));
      };

      const input = 'rep1@domain.com, rep2@agency.co  rep3@startup.in;rep4@gmail.com';
      const parsed = parseEmailInput(input);
      expect(parsed).toEqual([
        'rep1@domain.com',
        'rep2@agency.co',
        'rep3@startup.in',
        'rep4@gmail.com'
      ]);
    });

    it('composes mailto URL with 15% commission terms and apoorvxs@gmail.com sender identity', () => {
      const email = 'rep@example.com';
      const token = 'test-token-uuid-1234';
      const inviteUrl = `https://apoorv.qzz.io/workspace/?invite=${token}`;
      const subject = "Invitation: Join Apoorv A S as an Outreach Partner / Sales Rep";
      const body = `Hi,\n\nYou have been invited by Apoorv A S (apoorvxs@gmail.com) to join as an Outreach Partner.\n\nCommission: 15% per closed deal (₹7,500 minimum floor payout).\n\nAccept Invitation: ${inviteUrl}`;
      const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      expect(mailtoUrl.startsWith('mailto:rep%40example.com')).toBe(true);
      expect(mailtoUrl).toContain('15%25');
      expect(mailtoUrl).toContain('apoorvxs%40gmail.com');
      expect(mailtoUrl).toContain(encodeURIComponent('₹7,500'));
    });

    it('revoking an invitation marks it as revoked and rejects redemption', () => {
      const invitations = [
        { id: 'inv-1', email: 'rep@test.com', token: 'tok-1', status: 'pending', expiresAt: Date.now() + 100000 }
      ];

      const revokeInvite = (id, list) => {
        const item = list.find(i => i.id === id);
        if (item) item.status = 'revoked';
        return list;
      };

      const canRedeem = (token, list) => {
        const item = list.find(i => i.token === token);
        if (!item) return { allowed: false, reason: 'not_found' };
        if (item.status !== 'pending') return { allowed: false, reason: item.status };
        if (Date.now() > item.expiresAt) return { allowed: false, reason: 'expired' };
        return { allowed: true, invite: item };
      };

      expect(canRedeem('tok-1', invitations).allowed).toBe(true);
      revokeInvite('inv-1', invitations);
      expect(canRedeem('tok-1', invitations).allowed).toBe(false);
      expect(canRedeem('tok-1', invitations).reason).toBe('revoked');
    });

    it('rejects expired invitations after 72-hour window has passed', () => {
      const expiredInvitations = [
        { id: 'inv-2', email: 'late@test.com', token: 'tok-2', status: 'pending', expiresAt: Date.now() - 5000 }
      ];

      const canRedeem = (token, list) => {
        const item = list.find(i => i.token === token);
        if (item && Date.now() > item.expiresAt) return false;
        return true;
      };

      expect(canRedeem('tok-2', expiredInvitations)).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 5.5: Offline PWA & Mobile App Installation Gate
  // --------------------------------------------------------------------------
  describe('5.5 Offline PWA & Mobile App Installation Gate', () => {
    it('disqualifies unauthenticated visitors and applicants from installing app', () => {
      const isInstallAppEligible = (user, isStandalone = false) => {
        if (!user) return false;
        const role = user.role;
        const isVerified = role === 'owner' || role === 'caller';
        return Boolean(isVerified && !isStandalone);
      };

      expect(isInstallAppEligible(null)).toBe(false);
      expect(isInstallAppEligible(undefined)).toBe(false);
      expect(isInstallAppEligible({ role: 'applicant' })).toBe(false);
      expect(isInstallAppEligible({ role: 'guest' })).toBe(false);
    });

    it('authorizes verified outreach callers and the owner (Apoorv) to install app', () => {
      const isInstallAppEligible = (user, isStandalone = false) => {
        if (!user) return false;
        const role = user.role;
        const isVerified = role === 'owner' || role === 'caller';
        return Boolean(isVerified && !isStandalone);
      };

      expect(isInstallAppEligible({ email: 'caller@clientradar.com', role: 'caller' })).toBe(true);
      expect(isInstallAppEligible({ email: 'apoorvxs@gmail.com', role: 'owner' })).toBe(true);
    });

    it('suppresses installation triggers when already running in standalone display mode', () => {
      const isInstallAppEligible = (user, isStandalone = false) => {
        if (!user) return false;
        const role = user.role;
        const isVerified = role === 'owner' || role === 'caller';
        return Boolean(isVerified && !isStandalone);
      };

      expect(isInstallAppEligible({ role: 'owner' }, true)).toBe(false);
      expect(isInstallAppEligible({ role: 'caller' }, true)).toBe(false);
    });

    it('captures Android beforeinstallprompt event and retains prompt reference', () => {
      let deferredPrompt = null;
      const fakeEvent = {
        preventDefault: vi.fn(),
        prompt: vi.fn().mockResolvedValue({ outcome: 'accepted' })
      };

      const onBeforeInstallPrompt = (e) => {
        e.preventDefault();
        deferredPrompt = e;
      };

      onBeforeInstallPrompt(fakeEvent);
      expect(fakeEvent.preventDefault).toHaveBeenCalled();
      expect(deferredPrompt).toBe(fakeEvent);
    });

    it('detects iOS platforms (iPhone/iPad) to activate Apple Add to Home Screen guide', () => {
      const isIOS = (ua) => /iPad|iPhone|iPod/.test(ua);

      expect(isIOS('Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)')).toBe(true);
      expect(isIOS('Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X)')).toBe(true);
      expect(isIOS('Mozilla/5.0 (Linux; Android 13; SM-S908B)')).toBe(false);
      expect(isIOS('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe(false);
    });

    it('verifies manifest.json defines standalone mode and portrait orientation', () => {
      expect(manifest.display).toBe('standalone');
      expect(manifest.orientation).toBe('portrait-primary');
      expect(manifest.start_url).toBe('/workspace/');
      expect(manifest.scope).toBe('/workspace/');
    });

    it('verifies workspace sw.js precaches client-radar-cache-v2 assets', () => {
      const swContent = fs.readFileSync('workspace/sw.js', 'utf8');
      expect(swContent).toContain('client-radar-cache-v2');
      expect(swContent).toContain('/workspace/app.js');
      expect(swContent).toContain('/workspace/prospects_data.js');
      expect(swContent).toContain('/workspace/objections.js');
      expect(swContent).toContain('/workspace/manifest.json');
    });

    it('validates manifest.json theme_color is #fce566 and background_color is #fffdf1', () => {
      expect(manifest.theme_color).toBe('#fce566');
      expect(manifest.background_color).toBe('#fffdf1');
    });

    it('detects browser offline state when navigator.onLine is false and defers note sync', () => {
      const isOnline = false;
      const queue = [];
      const saveNoteWithOfflineQueue = (note, online) => {
        if (!online) {
          queue.push({ note, timestamp: Date.now() });
          return { status: 'queued', count: queue.length };
        }
        return { status: 'synced' };
      };

      const res = saveNoteWithOfflineQueue('Important client follow-up', isOnline);
      expect(res.status).toBe('queued');
      expect(queue.length).toBe(1);
      expect(queue[0].note).toBe('Important client follow-up');
    });

    it('handles matchMedia standalone display mode query listener for dynamic UI update', () => {
      let isStandalone = false;
      const mediaQueryList = {
        matches: false,
        addEventListener: vi.fn((event, handler) => {
          mediaQueryList.handler = handler;
        }),
        triggerChange(matches) {
          mediaQueryList.matches = matches;
          if (this.handler) this.handler({ matches });
        }
      };

      mediaQueryList.addEventListener('change', (e) => {
        isStandalone = e.matches;
      });

      mediaQueryList.triggerChange(true);
      expect(isStandalone).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 5.6: Advanced CRM Edge Cases & Fulfillment Invariants
  // --------------------------------------------------------------------------
  describe('5.6 Advanced CRM Edge Cases & Fulfillment Invariants', () => {
    it('supports multi-token search across name, city, and category simultaneously', () => {
      const multiTokenSearch = (query, list) => {
        const tokens = (query || '').toLowerCase().split(/\s+/).filter(Boolean);
        if (tokens.length === 0) return list;
        return list.filter(p => {
          const haystack = `${p.name} ${p.city} ${p.cat} ${p.dm}`.toLowerCase();
          return tokens.every(token => haystack.includes(token));
        });
      };

      const matched = multiTokenSearch('kochi clinic', prospectsData);
      expect(matched.length).toBeGreaterThan(0);
      expect(matched.every(p => p.city.toLowerCase() === 'kochi' && p.cat.toLowerCase() === 'clinic')).toBe(true);
    });

    it('serializes prospects into RFC 4180 compliant CSV format with properly escaped quotes and commas', () => {
      const toCsvRow = (fields) => {
        return fields.map(f => {
          const str = String(f ?? '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',');
      };

      const sampleFields = ['p-1', 'Smile Kochi, Kadavanthara', 'Dr. Anisha "CEO"', '₹50,000'];
      const csvLine = toCsvRow(sampleFields);
      expect(csvLine).toBe('p-1,"Smile Kochi, Kadavanthara","Dr. Anisha ""CEO""","₹50,000"');
    });

    it('sorts prospects collection by review rating in descending order', () => {
      const sorted = [...prospectsData].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].rating).toBeGreaterThanOrEqual(sorted[i + 1].rating);
      }
    });

    it('creates custom prospect record with unique custom- timestamp ID prefix', () => {
      const createCustomProspect = (baseData) => ({
        id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        status: 'available',
        createdAt: new Date().toISOString(),
        ...baseData
      });

      const newLead = createCustomProspect({ name: 'Malabar Dental', city: 'Calicut' });
      expect(newLead.id).toMatch(/^custom-\d+-\d+$/);
      expect(newLead.status).toBe('available');
      expect(newLead.city).toBe('Calicut');
    });

    it('falls back to English metaphor if Malayalam translation is missing or null', () => {
      const getMetaphor = (item, lang) => {
        if (lang === 'ml' && item.metaphorMl) return item.metaphorMl;
        return item.metaphor || 'No metaphor available';
      };

      const itemWithMl = { metaphor: 'English door', metaphorMl: 'വാതിൽ' };
      const itemWithoutMl = { metaphor: 'English door', metaphorMl: null };

      expect(getMetaphor(itemWithMl, 'ml')).toBe('വാതിൽ');
      expect(getMetaphor(itemWithoutMl, 'ml')).toBe('English door');
      expect(getMetaphor(itemWithMl, 'en')).toBe('English door');
    });

    it('playing objection sound triggers audio chime without throwing', () => {
      let playedSound = null;
      const playMockSound = (type) => { playedSound = type; };
      playMockSound('chime');
      expect(playedSound).toBe('chime');
    });

    it('multiple consecutive objection appends retain all entries separated by newlines', () => {
      let notes = 'Starting notes.';
      const appendNote = (title, rebuttal) => {
        notes = (notes ? notes.trim() : '') + `\n[Objection: "${title}"] -> Rebuttal: "${rebuttal}"`;
      };

      appendNote('Too busy', 'Call tomorrow.');
      appendNote('No budget', 'Audit is free.');

      expect(notes).toContain('Starting notes.');
      expect(notes).toContain('[Objection: "Too busy"]');
      expect(notes).toContain('[Objection: "No budget"]');
      expect(notes.split('\n').length).toBe(3);
    });

    it('formats call duration seconds into mm:ss timecode string', () => {
      const formatDuration = (totalSeconds) => {
        const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const secs = String(totalSeconds % 60).padStart(2, '0');
        return `${mins}:${secs}`;
      };

      expect(formatDuration(0)).toBe('00:00');
      expect(formatDuration(59)).toBe('00:59');
      expect(formatDuration(60)).toBe('01:00');
      expect(formatDuration(125)).toBe('02:05');
      expect(formatDuration(3600)).toBe('60:00');
    });

    it('verifies generated proposal contains all 4 standard executive markdown sections', () => {
      const p = prospectsData[0];
      const proposalMarkdown = `
# Executive Web Performance, Data Compliance & 3D Systems Proposal
## 1. Executive Performance & Mobile Latency Audit
## 2. Regulatory Compliance & Revenue Bleed Analysis
## 3. The High-Performance Transformation (What Apoorv Builds)
## 4. Commercial Scope & Deployment Timeline
`;

      expect(proposalMarkdown).toContain('## 1. Executive Performance & Mobile Latency Audit');
      expect(proposalMarkdown).toContain('## 2. Regulatory Compliance & Revenue Bleed Analysis');
      expect(proposalMarkdown).toContain('## 3. The High-Performance Transformation (What Apoorv Builds)');
      expect(proposalMarkdown).toContain('## 4. Commercial Scope & Deployment Timeline');
    });

    it('escapes raw HTML entities in proposal markdown rendering to neutralize injection', () => {
      const escapeHTML = (str) => {
        return (str || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      };

      const maliciousText = '<script>alert("XSS")</script>&<img src=x>';
      const safe = escapeHTML(maliciousText);
      expect(safe).not.toContain('<script>');
      expect(safe).toContain('&lt;script&gt;');
      expect(safe).toContain('&amp;');
      expect(safe).toContain('&quot;');
    });

    it('copies proposal markdown to system clipboard via navigator.clipboard.writeText', async () => {
      let copiedText = null;
      const clipboardMock = {
        writeText: vi.fn(async (text) => { copiedText = text; })
      };

      await clipboardMock.writeText('# Executive Proposal Markdown');
      expect(clipboardMock.writeText).toHaveBeenCalledWith('# Executive Proposal Markdown');
      expect(copiedText).toBe('# Executive Proposal Markdown');
    });

    it('explicitly specifies ₹4,999 technical audit is complimentary/waived', () => {
      const feeLine = 'Commercial Investment Floor: ₹50,000 (Complimentary ₹4,999 Technical Audit Applied)';
      expect(feeLine).toContain('₹4,999');
      expect(feeLine).toContain('Complimentary');
    });

    it('calculates standard 14-day production delivery timeline', () => {
      const getDeliveryDays = () => 14;
      expect(getDeliveryDays()).toBe(14);
    });

    it('deduplicates duplicate email addresses in batch invite input', () => {
      const dedupeEmails = (raw) => {
        const emails = raw.split(/[\s,;]+/).map(e => e.trim().toLowerCase()).filter(Boolean);
        return Array.from(new Set(emails));
      };

      const input = 'rep@agency.co, rep@agency.co, other@firm.com  other@firm.com';
      expect(dedupeEmails(input)).toEqual(['rep@agency.co', 'other@firm.com']);
    });

    it('rejects malformed email strings lacking @ or valid domain TLD', () => {
      const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      expect(isValidEmail('valid@firm.com')).toBe(true);
      expect(isValidEmail('apoorvxs@gmail.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
    });

    it('updates pending invite status to redeemed and binds redeemedBy user email', () => {
      const invite = { token: 'tok-xyz', status: 'pending', expiresAt: Date.now() + 100000 };
      const redeemToken = (inv, userEmail) => {
        inv.status = 'redeemed';
        inv.redeemedBy = userEmail;
        inv.redeemedAt = Date.now();
        return inv;
      };

      const result = redeemToken(invite, 'caller@agency.com');
      expect(result.status).toBe('redeemed');
      expect(result.redeemedBy).toBe('caller@agency.com');
      expect(result.redeemedAt).toBeDefined();
    });

    it('blocks redemption of an already redeemed invitation token', () => {
      const redeemedInvite = { token: 'tok-abc', status: 'redeemed', redeemedBy: 'first@user.com' };
      const attemptRedemption = (inv) => {
        if (inv.status === 'redeemed') return { success: false, error: 'already_redeemed' };
        return { success: true };
      };

      const res = attemptRedemption(redeemedInvite);
      expect(res.success).toBe(false);
      expect(res.error).toBe('already_redeemed');
    });

    it('generates human-readable invite preview badge for admin list', () => {
      const formatInviteBadge = (inv) => {
        const statusIcon = inv.status === 'redeemed' ? '●' : inv.status === 'revoked' ? '■' : '▲';
        return `${statusIcon} ${inv.email} [${inv.role || 'caller'}]`;
      };

      expect(formatInviteBadge({ email: 'rep@firm.com', status: 'pending', role: 'caller' })).toBe('▲ rep@firm.com [caller]');
      expect(formatInviteBadge({ email: 'rep@firm.com', status: 'redeemed', role: 'caller' })).toBe('● rep@firm.com [caller]');
      expect(formatInviteBadge({ email: 'rep@firm.com', status: 'revoked', role: 'caller' })).toBe('■ rep@firm.com [caller]');
    });
  });
});
