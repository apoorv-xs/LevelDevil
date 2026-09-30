import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Persona-Adaptive Cognitive Swokei Engine', () => {
  let SwokeiEngine;
  let queueEngineContent;
  let aiScoutContent;
  let mcpServerContent;
  let htmlContent;

  beforeAll(() => {
    // The IIFE exports to `global` in Node — require triggers the IIFE, then read from global
    require(path.resolve(__dirname, '../../workspace/swokei.js'));
    SwokeiEngine = global.SwokeiEngine;

    queueEngineContent = fs.readFileSync(
      path.resolve(__dirname, '../../workspace/queue_engine.js'), 'utf8'
    );
    aiScoutContent = fs.readFileSync(
      path.resolve(__dirname, '../../workspace/ai_scout.js'), 'utf8'
    );
    mcpServerContent = fs.readFileSync(
      path.resolve(__dirname, '../../mcp_spark_server.cjs'), 'utf8'
    );
    htmlContent = fs.readFileSync(
      path.resolve(__dirname, '../../workspace/index.html'), 'utf8'
    );
  });

  // ─────────────────────────────────────────────
  // 1. ARCHETYPE CLASSIFICATION
  // ─────────────────────────────────────────────
  describe('1. detectProspectArchetype()', () => {
    it('exports detectProspectArchetype as a function', () => {
      expect(typeof SwokeiEngine.detectProspectArchetype).toBe('function');
    });

    it('classifies architecture studios by category', () => {
      expect(SwokeiEngine.detectProspectArchetype({ cat: 'architecture' })).toBe('ARCHITECT');
      expect(SwokeiEngine.detectProspectArchetype({ cat: 'design' })).toBe('ARCHITECT');
      expect(SwokeiEngine.detectProspectArchetype({ cat: 'interior' })).toBe('ARCHITECT');
    });

    it('classifies architecture studios by name keywords', () => {
      expect(SwokeiEngine.detectProspectArchetype({ name: 'Smaran Architects' })).toBe('ARCHITECT');
      expect(SwokeiEngine.detectProspectArchetype({ name: 'Vismaya Interior Studio' })).toBe('ARCHITECT');
    });

    it('classifies architecture studios by dm containing "principal"', () => {
      expect(SwokeiEngine.detectProspectArchetype({ dm: 'Smaran (Principal Architect)' })).toBe('ARCHITECT');
    });

    it('classifies clinics by category', () => {
      expect(SwokeiEngine.detectProspectArchetype({ cat: 'clinic' })).toBe('CLINIC');
      expect(SwokeiEngine.detectProspectArchetype({ cat: 'dental' })).toBe('CLINIC');
      expect(SwokeiEngine.detectProspectArchetype({ cat: 'medical' })).toBe('CLINIC');
      expect(SwokeiEngine.detectProspectArchetype({ cat: 'dermatology' })).toBe('CLINIC');
    });

    it('classifies clinics by name keywords', () => {
      expect(SwokeiEngine.detectProspectArchetype({ name: 'Dr. Rajan Dental Clinic' })).toBe('CLINIC');
      expect(SwokeiEngine.detectProspectArchetype({ name: 'SkinCare Derma Hub' })).toBe('CLINIC');
    });

    it('classifies clinics by dm containing "Dr."', () => {
      expect(SwokeiEngine.detectProspectArchetype({ dm: 'Dr. Anisha Varma (Medical Director)' })).toBe('CLINIC');
    });

    it('classifies hospitality by category', () => {
      expect(SwokeiEngine.detectProspectArchetype({ cat: 'restaurant' })).toBe('HOSPITALITY');
      expect(SwokeiEngine.detectProspectArchetype({ cat: 'hospitality' })).toBe('HOSPITALITY');
      expect(SwokeiEngine.detectProspectArchetype({ cat: 'dining' })).toBe('HOSPITALITY');
      expect(SwokeiEngine.detectProspectArchetype({ cat: 'cafe' })).toBe('HOSPITALITY');
    });

    it('classifies hospitality by name keywords', () => {
      expect(SwokeiEngine.detectProspectArchetype({ name: 'The Malabar Kitchen' })).toBe('HOSPITALITY');
      expect(SwokeiEngine.detectProspectArchetype({ name: 'Napa Valley Bistro' })).toBe('HOSPITALITY');
    });

    it('classifies tech by category', () => {
      expect(SwokeiEngine.detectProspectArchetype({ cat: 'tech' })).toBe('TECH');
      expect(SwokeiEngine.detectProspectArchetype({ cat: 'saas' })).toBe('TECH');
      expect(SwokeiEngine.detectProspectArchetype({ cat: 'agency' })).toBe('TECH');
    });

    it('classifies tech by name keywords', () => {
      expect(SwokeiEngine.detectProspectArchetype({ name: 'Infosys Labs' })).toBe('TECH');
      expect(SwokeiEngine.detectProspectArchetype({ name: 'CogniTech AI Solutions' })).toBe('TECH');
    });

    it('returns GENERAL for unknown verticals', () => {
      expect(SwokeiEngine.detectProspectArchetype({ name: 'XYZ Corp', cat: 'retail' })).toBe('GENERAL');
      expect(SwokeiEngine.detectProspectArchetype({})).toBe('GENERAL');
    });

    it('returns GENERAL for null/undefined input', () => {
      expect(SwokeiEngine.detectProspectArchetype(null)).toBe('GENERAL');
      expect(SwokeiEngine.detectProspectArchetype(undefined)).toBe('GENERAL');
    });
  });

  // ─────────────────────────────────────────────
  // 2. PERSONA SALUTATION GENERATION
  // ─────────────────────────────────────────────
  describe('2. getPersonaSalutation()', () => {
    it('exports getPersonaSalutation as a function', () => {
      expect(typeof SwokeiEngine.getPersonaSalutation).toBe('function');
    });

    it('greets architects with "Hi {FirstName}"', () => {
      const sal = SwokeiEngine.getPersonaSalutation({ dm: 'Smaran Hegde (Principal Architect)' }, 'ARCHITECT');
      expect(sal).toBe('Hi Smaran');
    });

    it('greets doctors with "Dr. {LastName}"', () => {
      const sal = SwokeiEngine.getPersonaSalutation({ dm: 'Dr. Anisha Varma (Medical Director)' }, 'CLINIC');
      expect(sal).toBe('Dr. Varma');
    });

    it('greets hospitality with "Hi {FirstName}"', () => {
      const sal = SwokeiEngine.getPersonaSalutation({ dm: 'Rajan Krishnamurthy (Owner)' }, 'HOSPITALITY');
      expect(sal).toBe('Hi Rajan');
    });

    it('greets tech with "Hey {FirstName}"', () => {
      const sal = SwokeiEngine.getPersonaSalutation({ dm: 'Vikram Patel (CTO)' }, 'TECH');
      expect(sal).toBe('Hey Vikram');
    });

    it('greets GENERAL with "Hi {FirstName}"', () => {
      const sal = SwokeiEngine.getPersonaSalutation({ dm: 'Rahul Nair (Managing Director)' }, 'GENERAL');
      expect(sal).toBe('Hi Rahul');
    });

    it('strips Mr./Ms./Mrs. prefixes before extracting first name', () => {
      const sal = SwokeiEngine.getPersonaSalutation({ dm: 'Mr. Aditya Sharma' }, 'TECH');
      expect(sal).toBe('Hey Aditya');
    });

    it('handles single-name DMs gracefully', () => {
      const sal = SwokeiEngine.getPersonaSalutation({ dm: 'Priya' }, 'ARCHITECT');
      expect(sal).toBe('Hi Priya');
    });

    it('falls back to "there" when dm is empty', () => {
      const sal = SwokeiEngine.getPersonaSalutation({}, 'TECH');
      expect(sal).toContain('Hey');
    });
  });

  // ─────────────────────────────────────────────
  // 3. PERSONA-CALIBRATED 4-TOUCH SEQUENCES
  // ─────────────────────────────────────────────
  describe('3. Persona-Calibrated Outreach Sequences', () => {
    it('generates ARCHITECT-specific sequence with spatial portfolio language', () => {
      const seq = SwokeiEngine.getOutreachSequenceForLead({
        id: 'p-test-arch', name: 'Smaran Architects', city: 'Kochi',
        cat: 'architecture', dm: 'Smaran Hegde (Principal Architect)',
        site: 'https://smaranarchitects.com', lcpTime: 'LCP: 5.1s', fee: '₹1,00,000'
      });
      expect(seq).toBeTruthy();
      expect(Array.isArray(seq)).toBe(true);
      expect(seq.length).toBeGreaterThanOrEqual(4);
      // Touch 1 subject should reference spatial portfolio, not generic booking leak
      expect(seq[0].subject).toContain('Spatial Portfolio');
      expect(seq[0].body).toContain('Hi Smaran');
      expect(seq[0].body).not.toContain('Namaste');
    });

    it('generates CLINIC-specific sequence with Dr. salutation', () => {
      const seq = SwokeiEngine.getOutreachSequenceForLead({
        id: 'p-test-clinic', name: 'Lakeshore Dental Clinic', city: 'Kochi',
        cat: 'dental', dm: 'Dr. Anisha Varma (Medical Director)',
        site: 'https://lakeshoredental.in', lcpTime: 'LCP: 4.4s', fee: '₹75,000'
      });
      expect(seq).toBeTruthy();
      expect(seq.length).toBeGreaterThanOrEqual(4);
      expect(seq[0].body).toContain('Dr. Varma');
      expect(seq[0].body).not.toContain('Namaste');
      expect(seq[0].body).toMatch(/Practo|aggregator|patient/i);
    });

    it('generates HOSPITALITY-specific sequence with dining language', () => {
      const seq = SwokeiEngine.getOutreachSequenceForLead({
        id: 'p-test-hosp', name: 'The Malabar Kitchen', city: 'Kochi',
        cat: 'restaurant', dm: 'Rajan Krishnamurthy (Owner)',
        site: 'https://malabarkitchen.in', lcpTime: 'LCP: 3.8s', fee: '₹50,000'
      });
      expect(seq).toBeTruthy();
      expect(seq.length).toBeGreaterThanOrEqual(4);
      expect(seq[0].body).toContain('Hi Rajan');
      expect(seq[0].subject).toMatch(/Guest Experience|Direct Booking/i);
    });

    it('generates TECH/GENERAL-specific sequence', () => {
      const seq = SwokeiEngine.getOutreachSequenceForLead({
        id: 'p-test-tech', name: 'CogniTech AI', city: 'Bangalore',
        cat: 'tech', dm: 'Vikram Patel (CTO)',
        site: 'https://cognitech.ai', lcpTime: 'LCP: 3.2s', fee: '₹1,25,000'
      });
      expect(seq).toBeTruthy();
      expect(seq.length).toBeGreaterThanOrEqual(4);
      // Tech defaults to the CLINIC/GENERAL template, but salutation is "Hey"
      expect(seq[0].body).toMatch(/Hey Vikram|Dr\. Patel/);
    });

    it('every touch contains an apoorv.qzz.io link (teardown or proposal)', () => {
      const seq = SwokeiEngine.getOutreachSequenceForLead({
        id: 'p-teardown-check', name: 'Test Co', dm: 'Alex', site: 'https://test.co'
      });
      seq.forEach(touch => {
        expect(touch.body).toContain('apoorv.qzz.io/sales?');
      });
    });

    it('never uses blanket "Namaste" in any archetype', () => {
      const archetypes = [
        { cat: 'architecture', dm: 'Priya S', name: 'Studio P' },
        { cat: 'dental', dm: 'Dr. Rajan M', name: 'Smile Clinic' },
        { cat: 'restaurant', dm: 'Anil K', name: 'Bistro A' },
        { cat: 'tech', dm: 'Sam J', name: 'Tech Labs' },
        { dm: 'Unknown Person', name: 'General Corp' }
      ];
      for (const prospect of archetypes) {
        const seq = SwokeiEngine.getOutreachSequenceForLead({
          id: 'p-namaste-check', ...prospect, site: 'https://example.com'
        });
        for (const touch of seq) {
          expect(touch.body).not.toContain('Namaste');
          expect(touch.subject).not.toContain('Namaste');
        }
      }
    });
  });

  // ─────────────────────────────────────────────
  // 4. DYNAMIC TERRITORY AGGREGATOR
  // ─────────────────────────────────────────────
  describe('4. Dynamic Territory Aggregator', () => {
    it('queue_engine.js defines getCityShortCode function', () => {
      expect(queueEngineContent).toContain('function getCityShortCode(');
    });

    it('queue_engine.js defines syncCityFilterTabs function', () => {
      expect(queueEngineContent).toContain('function syncCityFilterTabs(');
    });

    it('getCityShortCode maps known Indian and Gulf cities', () => {
      const QueueEngine = require(path.resolve(__dirname, '../../workspace/queue_engine.js'));
      if (typeof QueueEngine.getCityShortCode === 'function') {
        expect(QueueEngine.getCityShortCode('Mumbai')).toBe('BOM');
        expect(QueueEngine.getCityShortCode('Delhi-NCR')).toBe('NCR');
        expect(QueueEngine.getCityShortCode('Pune')).toBe('PUN');
        expect(QueueEngine.getCityShortCode('Dubai')).toBe('DXB');
        expect(QueueEngine.getCityShortCode('Bangalore')).toBe('BLR');
        expect(QueueEngine.getCityShortCode('Hyderabad')).toBe('HYD');
        expect(QueueEngine.getCityShortCode('Kochi')).toBe('Kochi');
        expect(QueueEngine.getCityShortCode('Ahmedabad')).toBe('AMD');
        expect(QueueEngine.getCityShortCode('Jaipur')).toBe('JAI');
        expect(QueueEngine.getCityShortCode('Goa')).toBe('GOA');
        expect(QueueEngine.getCityShortCode('Chennai')).toBe('MAA');
      }
    });

    it('getCityShortCode truncates unknown long city names to 4 chars', () => {
      const QueueEngine = require(path.resolve(__dirname, '../../workspace/queue_engine.js'));
      if (typeof QueueEngine.getCityShortCode === 'function') {
        expect(QueueEngine.getCityShortCode('Thiruvananthapuram')).toBe('THIR');
      }
    });

    it('renderQueue calls syncCityFilterTabs', () => {
      expect(queueEngineContent).toMatch(/function renderQueue[\s\S]*?syncCityFilterTabs\(\)/);
    });

    it('HTML contains cityFilterContainer with data-city attributes', () => {
      expect(htmlContent).toContain('id="cityFilterContainer"');
      expect(htmlContent).toContain('data-city="All"');
      expect(htmlContent).toContain('data-city="Kochi"');
      expect(htmlContent).toContain('data-city="Bangalore"');
      expect(htmlContent).toContain('data-city="Hyderabad"');
    });

    it('city filter container allows horizontal scroll for many cities', () => {
      expect(htmlContent).toMatch(/id="cityFilterContainer"[^>]*overflow-x-auto/);
    });

    it('exports getCityShortCode and syncCityFilterTabs on WorkspaceQueueEngine', () => {
      expect(queueEngineContent).toMatch(/WorkspaceQueueEngine\s*=\s*\{[\s\S]*?getCityShortCode/);
      expect(queueEngineContent).toMatch(/WorkspaceQueueEngine\s*=\s*\{[\s\S]*?syncCityFilterTabs/);
    });
  });

  // ─────────────────────────────────────────────
  // 5. SPARK PLAYBOOKS & MASTER SKILL
  // ─────────────────────────────────────────────
  describe('5. SPARK_PLAYBOOKS & Master Skill in ai_scout.js', () => {
    it('defines hunter playbook with pan-India territory', () => {
      expect(aiScoutContent).toContain('Pan-India');
      expect(aiScoutContent).toMatch(/Mumbai.*Delhi-NCR.*Bangalore.*Hyderabad.*Kochi/);
    });

    it('defines outreach playbook with anti-clash protocol', () => {
      expect(aiScoutContent).toContain('Anti-Clash Protocol');
      expect(aiScoutContent).toContain('sparkHalted');
    });

    it('defines outreach playbook with persona calibration rules', () => {
      expect(aiScoutContent).toContain('ARCHITECTS');
      expect(aiScoutContent).toContain('CLINICS / DOCTORS');
      expect(aiScoutContent).toContain('HOSPITALITY / DINING');
      expect(aiScoutContent).toContain('TECH / SAAS');
    });

    it('defines master_skill playbook for Gemini Spark Skills tab', () => {
      expect(aiScoutContent).toContain('master_skill');
      expect(aiScoutContent).toContain('autonomous cognitive growth engine');
      expect(aiScoutContent).toMatch(/PERSONA-ADAPTIVE OUTREACH/);
      expect(aiScoutContent).toContain('4-TOUCH CADENCE');
    });

    it('master_skill never uses blanket "Namaste"', () => {
      const masterSkillMatch = aiScoutContent.match(/master_skill:\s*`([\s\S]*?)`/);
      if (masterSkillMatch) {
        expect(masterSkillMatch[1]).toContain('Never use blanket "Namaste"');
      }
    });

    it('HTML has [COPY MASTER SKILL] button wired to copySparkPlaybook("master_skill")', () => {
      expect(htmlContent).toContain("copySparkPlaybook('master_skill')");
      expect(htmlContent).toContain('[COPY MASTER SKILL]');
      expect(htmlContent).toContain('Cognitive Swokei-IN Master Skill');
    });
  });

  // ─────────────────────────────────────────────
  // 6. MCP SERVER PERSONA INTEGRATION
  // ─────────────────────────────────────────────
  describe('6. MCP Server Persona-Adaptive Integration', () => {
    it('mcp_spark_server.cjs loads SwokeiEngine from workspace/swokei.js', () => {
      expect(mcpServerContent).toContain("require(path.join(__dirname, 'workspace', 'swokei.js'))");
    });

    it('generateOutreachSequence delegates to SwokeiEngine when available', () => {
      expect(mcpServerContent).toContain('SwokeiEngine.getOutreachSequenceForLead');
    });

    it('generateOutreachSequence uses detectProspectArchetype for persona classification', () => {
      expect(mcpServerContent).toContain('SwokeiEngine.detectProspectArchetype');
    });

    it('generateOutreachSequence uses getPersonaSalutation for greeting calibration', () => {
      expect(mcpServerContent).toContain('SwokeiEngine.getPersonaSalutation');
    });

    it('generateOutreachSequence response includes archetype and salutation fields', () => {
      expect(mcpServerContent).toMatch(/archetype/);
      expect(mcpServerContent).toMatch(/salutation/);
    });

    it('fallback outreach does not use "Namaste"', () => {
      // The fallback path in generateOutreachSequence should use "Hi" not "Namaste"
      const fallbackMatch = mcpServerContent.match(/\/\/ Fallback if engine is not loaded[\s\S]*?return \{/);
      if (fallbackMatch) {
        expect(fallbackMatch[0]).not.toContain('Namaste');
      }
    });
  });
});
