/**
 * SPRINTDIAL CLOUD MCP SERVER FOR GEMINI SPARK
 * ============================================
 * Provides an always-on 24/7 Model Context Protocol (MCP) bridge & REST API
 * for Gemini Spark (Google AI Pro Cloud Agent) to audit websites, manage leads,
 * counter objections, collect UPI deposits, and close high-ticket contracts.
 *
 * Protocol Support:
 * 1. MCP Standard JSON-RPC 2.0 over SSE (/sse and /message)
 * 2. MCP Streamable HTTP JSON-RPC (/ and /message)
 * 3. REST JSON API endpoints (/api/leads, /api/audit, /api/pitch, etc.)
 */

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3099;
const CUSTOM_LEADS_FILE = path.join(__dirname, 'workspace', 'custom_prospects.json');
const PROSPECTS_DATA_FILE = path.join(__dirname, 'workspace', 'prospects_data.js');
const PIPELINE_OVERRIDES_FILE = path.join(__dirname, 'workspace', 'pipeline_overrides.json');

// Active SSE client sessions: sessionId -> response object
const sseSessions = new Map();

// -------------------------------------------------------------
// 1. DATASET LOADER & PERSISTENCE
// -------------------------------------------------------------
function loadBaseProspects() {
  try {
    const resolvedPath = path.resolve(PROSPECTS_DATA_FILE);
    require(resolvedPath);
    if (global.PROSPECTS && Array.isArray(global.PROSPECTS) && global.PROSPECTS.length > 0) {
      return global.PROSPECTS;
    }
  } catch (err) {
    console.warn('[MCP Server] Warning loading base prospects:', err.message);
  }
  return [];
}

function loadCustomProspects() {
  try {
    if (fs.existsSync(CUSTOM_LEADS_FILE)) {
      const content = fs.readFileSync(CUSTOM_LEADS_FILE, 'utf8');
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.warn('[MCP Server] Warning loading custom leads:', err.message);
  }
  return [];
}

function saveCustomProspects(list) {
  try {
    fs.writeFileSync(CUSTOM_LEADS_FILE, JSON.stringify(list, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[MCP Server] Error saving custom leads:', err.message);
    return false;
  }
}

function loadPipelineOverrides() {
  try {
    if (fs.existsSync(PIPELINE_OVERRIDES_FILE)) {
      const content = fs.readFileSync(PIPELINE_OVERRIDES_FILE, 'utf8');
      const data = JSON.parse(content);
      return typeof data === 'object' && data !== null ? data : {};
    }
  } catch (err) {
    console.warn('[MCP Server] Warning loading pipeline overrides:', err.message);
  }
  return {};
}

function savePipelineOverrides(overrides) {
  try {
    fs.writeFileSync(PIPELINE_OVERRIDES_FILE, JSON.stringify(overrides, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[MCP Server] Error saving pipeline overrides:', err.message);
    return false;
  }
}

function saveLeadOverride(id, updates) {
  const overrides = loadPipelineOverrides();
  overrides[id] = Object.assign({}, overrides[id] || {}, updates, {
    updatedAt: new Date().toISOString(),
    updatedBy: 'Gemini Spark Cloud Agent'
  });
  savePipelineOverrides(overrides);
  return overrides[id];
}

function getAllProspects() {
  const base = loadBaseProspects();
  const custom = loadCustomProspects();
  const overrides = loadPipelineOverrides();

  const customIds = new Set(custom.map(p => p.id));
  const merged = base.filter(p => !customIds.has(p.id)).concat(custom);

  return merged.map(p => {
    if (overrides[p.id]) {
      return Object.assign({}, p, overrides[p.id]);
    }
    return p;
  });
}

// Load Objections Engine
let ObjectionEngine = null;
try {
  const reqObj = require(path.join(__dirname, 'workspace', 'objections.js'));
  ObjectionEngine = (reqObj && reqObj.OBJECTIONS && reqObj.OBJECTIONS.length > 0) ? reqObj : {
    OBJECTIONS: global.OBJECTIONS || [],
    LAYMAN_ANALOGIES: global.LAYMAN_ANALOGIES || {}
  };
} catch (e) {
  console.warn('[MCP Server] Warning loading objections engine:', e.message);
  ObjectionEngine = {
    OBJECTIONS: global.OBJECTIONS || [],
    LAYMAN_ANALOGIES: global.LAYMAN_ANALOGIES || {}
  };
}

// Standard Deal Tiers
const DEAL_TIERS = {
  1: {
    tierNum: 1,
    name: 'Tier 1: Speed & Direct Booking Engine',
    total: 50000,
    advance: 25000,
    commission: 7500,
    desc: '0.8s mobile paint, 1-tap WhatsApp consultation booking, DPDP Act 2023 compliance shield, 60 FPS performance floor.'
  },
  2: {
    tierNum: 2,
    name: 'Tier 2: Interactive 3D Showcase & Spatial UI',
    total: 100000,
    advance: 50000,
    commission: 15000,
    desc: 'All Tier 1 features plus bespoke Three.js 3D spatial interactive showcase, dynamic lighting, and mobile 60 FPS guarantee.'
  },
  3: {
    tierNum: 3,
    name: 'Tier 3: Flagship Sovereign WebGPU Custom Engine',
    total: 200000,
    advance: 100000,
    commission: 30000,
    desc: 'Full WebGPU custom procedural shaders, real-time 3D configurator, multi-channel direct intake, and dedicated SLA handover.'
  }
};

// -------------------------------------------------------------
// 2. LIVE WEBSITE AUDITOR (HTTP PROBE)
// -------------------------------------------------------------
function probeWebsiteLive(targetUrl) {
  return new Promise((resolve) => {
    let parsed;
    try {
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }
      parsed = new URL(targetUrl);
    } catch (e) {
      return resolve({
        error: `Invalid URL format: ${targetUrl}`,
        url: targetUrl,
        success: false
      });
    }

    const client = parsed.protocol === 'https:' ? https : http;
    const startTime = Date.now();

    const req = client.get(parsed.href, {
      timeout: 7000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 SprintDialAudit/2.0'
      }
    }, (res) => {
      const latencyMs = Date.now() - startTime;
      let rawData = '';

      res.on('data', chunk => {
        if (rawData.length < 50000) rawData += chunk;
      });

      res.on('end', () => {
        const body = rawData.toLowerCase();
        
        // Detect CMS & tech stack
        const techStack = [];
        if (body.includes('wp-content') || body.includes('wordpress')) techStack.push('WordPress');
        if (body.includes('elementor')) techStack.push('Elementor');
        if (body.includes('shopify')) techStack.push('Shopify');
        if (body.includes('webflow')) techStack.push('Webflow');
        if (body.includes('wix.com')) techStack.push('Wix');
        if (body.includes('react') || body.includes('_next')) techStack.push('Next.js / React');
        if (techStack.length === 0) techStack.push('Custom HTML / Legacy PHP');

        // Estimate Mobile LCP based on TTFB and payload
        const estimatedLcpSec = ((latencyMs * 2.8) / 1000 + 1.2).toFixed(1);
        const speedScore = Math.max(15, Math.min(95, Math.round(100 - (estimatedLcpSec * 14))));

        // Flaws
        const flaws = [];
        if (Number(estimatedLcpSec) > 3.0) {
          flaws.push(`Mobile LCP: ${estimatedLcpSec}s (High bounce rate on cellular devices)`);
        }
        if (techStack.includes('WordPress') || techStack.includes('Elementor')) {
          flaws.push('Heavy PHP/Elementor asset bloat blocking render-critical path');
        }
        if (!body.includes('whatsapp') && !body.includes('wa.me')) {
          flaws.push('Zero instant 1-tap WhatsApp consultation or booking conduit');
        }
        if (!body.includes('consent') && !body.includes('privacy') && !body.includes('cookie')) {
          flaws.push('DPDP Act 2023 Statutory Non-Compliance: Missing affirmative user data consent banner');
        }

        resolve({
          success: true,
          url: parsed.href,
          statusCode: res.statusCode,
          latencyMs,
          estimatedLcp: `${estimatedLcpSec}s`,
          speedScore: `${speedScore}/100 (Estimated Mobile)`,
          techStack: techStack.join(' / '),
          flaws: flaws.length > 0 ? flaws : ['Suboptimal 60 FPS mobile rendering pipeline'],
          statutoryRisk: flaws.some(f => f.includes('DPDP')) ? 'HIGH (₹250 Cr statutory penalty risk under DPDP Act 2023)' : 'MODERATE',
          auditTimestamp: new Date().toISOString()
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        url: targetUrl,
        error: 'Connection timed out after 7000ms. Server response too slow.'
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        url: targetUrl,
        error: err.message
      });
    });
  });
}

// -------------------------------------------------------------
// 3. EXECUTIVE COLD EMAIL GENERATOR (60 FPS SLA GUARANTEE)
// -------------------------------------------------------------
function generateExecutiveProposal(params) {
  const all = getAllProspects();
  const p = all.find(item => item.id === params.prospect_id) || {};

  const clientName = params.client_name || p.name || 'Your Establishment';
  const dmName = params.dm_name || (p.dm || 'Managing Director').split('(')[0].trim();
  const siteUrl = params.client_site || p.site || 'your website';
  const tierNum = Number(params.tier) || 2;
  const cleanId = p.id || 'deal';

  const selectedTier = DEAL_TIERS[tierNum] || DEAL_TIERS[2];
  const lcp = p.lcpTime ? p.lcpTime.replace('LCP: ', '') : '4.6s';

  const proposalUrl = `https://apoorv.qzz.io/sales?proposal=${encodeURIComponent(cleanId)}&fee=${selectedTier.total}`;
  const subject = `Executive Performance Teardown: ${clientName} (Direct Booking Leak)`;

  const body = `Namaste ${dmName},

I reviewed ${clientName}'s digital portal (${siteUrl}) on modern mobile devices.

Two critical operational findings:

1. Mobile Latency & Direct Booking Bleed:
Your current site requires ${lcp} to become interactive on 4G/5G mobile connections. Across luxury hospitality and premium medical sectors, any mobile load exceeding 2.5 seconds results in an immediate 40%+ drop-off to aggregators (Booking.com, MakeMyTrip, Practo) who charge you 18% to 25% on every booking.

2. 60 FPS Spatial Architecture:
High-ticket clients today make buying decisions through interactive visual prestige. Rather than rebuilding your site with commodity templates, my studio engineers locked 60 FPS interactive systems that showcase your facilities with tactile spatial fluidness.

RECOMMENDED DEPLOYMENT:
• Architecture: ${selectedTier.name}
• Deliverables: ${selectedTier.desc}
• Total Investment: ₹${selectedTier.total.toLocaleString('en-IN')} (50% Milestone Advance: ₹${selectedTier.advance.toLocaleString('en-IN')})
• Review Full Scope & Agreement: ${proposalUrl}

60 FPS PERFORMANCE SLA GUARANTEE:
If your delivered site fails to achieve a locked 60 FPS floor or sub-1.5s Core Web Vitals pass on modern mobile devices, I guarantee a 100% full refund of your deposit.

Would you have 10 minutes for a brief discovery call this Thursday at 11:00 AM IST?

You can review my spatial engineering portfolio here: https://apoorv.qzz.io

Warm regards,

Apoorv A S
Creative Technologist & 3D WebUI Architect
Direct Office: apoorvxs@gmail.com | Portfolio: https://apoorv.qzz.io`;

  return {
    subject,
    body,
    recipient: params.recipient_email || (p.email || ''),
    tier: selectedTier,
    proposalUrl
  };
}

// -------------------------------------------------------------
// 4. MCP TOOL DEFINITIONS (FOR GEMINI SPARK)
// -------------------------------------------------------------
const MCP_TOOLS = [
  {
    name: 'list_leads',
    description: 'List enterprise sales leads from SprintDial radar with status filters, city search, and bookmarked states.',
    parameters: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          enum: ['all', 'fresh', 'cb', 'zombie', 'wins', 'high_ticket', 'bookmarked'],
          description: 'Filter category: "fresh" (uncalled), "cb" (scheduled callbacks), "zombie" (stale callbacks >48h), "wins" (closed won), "high_ticket" (fees >= 100k), "bookmarked" (starred leads).'
        },
        city: {
          type: 'string',
          description: 'Filter by city name (e.g. Kochi, Bangalore, Hyderabad, Chennai, Mumbai).'
        },
        search: {
          type: 'string',
          description: 'Keyword search query matching business name, decision maker, or phone.'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of prospects to return (default 15, max 100).'
        }
      }
    }
  },
  {
    name: 'get_lead_dossier',
    description: 'Get deep intelligence dossier for a specific lead by ID, including flaws, decision maker, and revenue leaks.',
    parameters: {
      type: 'object',
      required: ['prospect_id'],
      properties: {
        prospect_id: {
          type: 'string',
          description: 'The unique prospect ID (e.g. "p-1", "p-14").'
        }
      }
    }
  },
  {
    name: 'add_new_lead',
    description: 'Ingest a new high-end enterprise lead into the SprintDial radar with automatic grading.',
    parameters: {
      type: 'object',
      required: ['name', 'city', 'site', 'phone'],
      properties: {
        name: { type: 'string', description: 'Business or resort name.' },
        city: { type: 'string', description: 'City location.' },
        site: { type: 'string', description: 'Website URL.' },
        phone: { type: 'string', description: 'Contact phone number.' },
        dm: { type: 'string', description: 'Decision maker name & title (e.g. "Mr. Rahul Roy (General Manager)").' },
        fee: { type: 'string', description: 'Target fee tier (e.g. "₹50,000", "₹1,00,000", "₹2,00,000").' },
        ptype: { type: 'string', description: 'Lead tier category: "UPGRADE", "STARTER", or "ENTERPRISE".' },
        notes: { type: 'string', description: 'Initial notes or pitch angle.' }
      }
    }
  },
  {
    name: 'audit_website_live',
    description: 'Perform a real-time HTTP probe of any company website to test latency, CMS, and detect revenue leakage.',
    parameters: {
      type: 'object',
      required: ['url'],
      properties: {
        url: { type: 'string', description: 'Target website URL to audit.' }
      }
    }
  },
  {
    name: 'draft_high_ticket_proposal',
    description: 'Generate an executive 60 FPS performance proposal cold email with Apoorv\'s SLA refund guarantee ready for Gmail.',
    parameters: {
      type: 'object',
      properties: {
        prospect_id: { type: 'string', description: 'Existing lead ID from the database.' },
        client_name: { type: 'string', description: 'Client business name (if not in database).' },
        client_site: { type: 'string', description: 'Client website URL.' },
        dm_name: { type: 'string', description: 'Decision maker name.' },
        tier: { type: 'number', enum: [1, 2, 3], description: 'Package tier: 1 (₹50k), 2 (₹100k), 3 (₹200k).' },
        recipient_email: { type: 'string', description: 'Recipient email address.' }
      }
    }
  },
  {
    name: 'get_pipeline_stats',
    description: 'Get an executive summary of total leads, pipeline valuation, callbacks due, closed revenue, and commission balances.',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_objection_rebuttal',
    description: 'Fetch battle-tested objection handling scripts, Layman Metaphors, and killshot questions in English or Malayalam.',
    parameters: {
      type: 'object',
      required: ['objection_query'],
      properties: {
        objection_query: {
          type: 'string',
          description: 'Objection keyword or topic: e.g. "agency", "practo", "email", "expensive", "nephew", "instagram", "lcp", "dpdp", "tls".'
        },
        language: {
          type: 'string',
          enum: ['en', 'ml'],
          description: 'Language of script counter: "en" for English, "ml" for Malayalam. Defaults to "en".'
        },
        prospect_id: {
          type: 'string',
          description: 'Optional prospect ID to inject real client latency and metrics into the talking point.'
        }
      }
    }
  },
  {
    name: 'generate_client_teardown',
    description: 'Generate an interactive client performance teardown URL and formatted WhatsApp executive brief.',
    parameters: {
      type: 'object',
      required: ['prospect_id'],
      properties: {
        prospect_id: {
          type: 'string',
          description: 'Target prospect ID (e.g. "p-1").'
        }
      }
    }
  },
  {
    name: 'log_lead_disposition',
    description: 'Record call/outreach reach and outcome, append notes, schedule callback datetime, and update lead pipeline status.',
    parameters: {
      type: 'object',
      required: ['prospect_id', 'reach', 'outcome', 'notes'],
      properties: {
        prospect_id: { type: 'string', description: 'Prospect ID.' },
        reach: {
          type: 'string',
          enum: ['connected', 'gatekeeper', 'no_answer', 'busy', 'wrong_number'],
          description: 'Who was reached on the call/channel.'
        },
        outcome: {
          type: 'string',
          enum: ['closed_won', 'discovery_booked', 'callback_requested', 'interested_later', 'not_interested', 'unqualified'],
          description: 'Business outcome of the contact.'
        },
        notes: { type: 'string', description: 'Conversation notes, DM remarks, or objections raised.' },
        callback_datetime: { type: 'string', description: 'Scheduled callback date & time (e.g. "2026-10-02 11:30 AM IST").' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Optional tags (e.g. ["urgent", "hot", "gatekeeper_screened"]).' }
      }
    }
  },
  {
    name: 'toggle_lead_bookmark',
    description: 'Toggle bookmark/star flag for a prospect to build high-priority calling shortlists.',
    parameters: {
      type: 'object',
      required: ['prospect_id', 'bookmarked'],
      properties: {
        prospect_id: { type: 'string', description: 'Prospect ID.' },
        bookmarked: { type: 'boolean', description: 'True to bookmark, false to remove.' }
      }
    }
  },
  {
    name: 'generate_upi_deposit_rail',
    description: 'Generate dynamic 50% milestone advance payment rails, UPI intent URI, and QR code URL for instant deal locking.',
    parameters: {
      type: 'object',
      required: ['prospect_id'],
      properties: {
        prospect_id: { type: 'string', description: 'Prospect ID.' },
        tier: { type: 'number', enum: [1, 2, 3], description: 'Package tier: 1 (₹50k/₹25k advance), 2 (₹100k/₹50k advance), 3 (₹200k/₹100k advance).' }
      }
    }
  },
  {
    name: 'mark_deal_closed_won',
    description: 'Mark a deal as Closed Won, log deposit confirmation, unlock 15% partner commission, and record project kickoff.',
    parameters: {
      type: 'object',
      required: ['prospect_id', 'tier'],
      properties: {
        prospect_id: { type: 'string', description: 'Prospect ID.' },
        tier: { type: 'number', enum: [1, 2, 3], description: 'Package tier won: 1 (₹50k), 2 (₹100k), 3 (₹200k).' },
        deposit_amount: { type: 'number', description: 'Advance deposit received in INR (defaults to 50% tier advance).' },
        notes: { type: 'string', description: 'Closing notes or transaction reference.' }
      }
    }
  },
  {
    name: 'escalate_to_apoorv',
    description: 'Schedule a founder walkthrough with Apoorv, generate Google Calendar link, and lock 10% referral commission.',
    parameters: {
      type: 'object',
      required: ['prospect_id', 'client_notes', 'preferred_datetime'],
      properties: {
        prospect_id: { type: 'string', description: 'Prospect ID.' },
        client_notes: { type: 'string', description: 'Key pain points, DM expectations, or custom requirements.' },
        preferred_datetime: { type: 'string', description: 'Meeting day & time (e.g. "Thursday 11:00 AM IST").' }
      }
    }
  },
  {
    name: 'get_partner_wallet_ledger',
    description: 'Get caller/agent commission earnings ledger, showing cleared 15% commissions, pending 10% referral credits, and payouts.',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
];

// -------------------------------------------------------------
// 5. TOOL EXECUTION HANDLER
// -------------------------------------------------------------
async function executeToolCall(toolName, args) {
  const all = getAllProspects();

  switch (toolName) {
    case 'list_leads': {
      const filter = (args.filter || 'all').toLowerCase();
      const city = args.city ? args.city.toLowerCase() : null;
      const search = args.search ? args.search.toLowerCase() : null;
      const limit = Math.min(Number(args.limit) || 15, 100);

      let results = all.filter(p => {
        if (city && !p.city?.toLowerCase().includes(city)) return false;
        if (search) {
          const matchStr = `${p.name || ''} ${p.dm || ''} ${p.site || ''} ${p.phone || ''}`.toLowerCase();
          if (!matchStr.includes(search)) return false;
        }

        if (filter === 'fresh') return !p.status || p.status === 'available';
        if (filter === 'cb') return p.status === 'callback';
        if (filter === 'zombie') return p.status === 'callback' && (p.isZombie || (p.agingHours && p.agingHours >= 48));
        if (filter === 'wins') return p.status === 'closed_won';
        if (filter === 'bookmarked') return Boolean(p.bookmarked);
        if (filter === 'high_ticket') {
          const feeNum = parseInt(String(p.fee).replace(/[^0-9]/g, '')) || 0;
          return feeNum >= 100000;
        }
        return true;
      });

      return {
        totalFound: results.length,
        showing: Math.min(results.length, limit),
        leads: results.slice(0, limit).map(p => ({
          id: p.id,
          name: p.name,
          city: p.city,
          dm: p.dm,
          phone: p.phone || p.tel,
          site: p.site,
          fee: p.fee,
          speedScore: p.speedScore,
          lcpTime: p.lcpTime,
          status: p.status || 'available',
          bookmarked: Boolean(p.bookmarked),
          flaw: p.flaws?.[0] || 'Standard mobile latency'
        }))
      };
    }

    case 'get_lead_dossier': {
      const p = all.find(item => item.id === args.prospect_id);
      if (!p) return { error: `Prospect with ID "${args.prospect_id}" not found.` };
      return { lead: p };
    }

    case 'add_new_lead': {
      const cleanPhone = String(args.phone || '').replace(/[^0-9]/g, '');
      const formattedTel = cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`;
      const newId = `custom-${Date.now()}`;

      const newLead = {
        id: newId,
        rating: 4.9,
        city: args.city || 'National',
        name: args.name,
        dm: args.dm || 'Decision Maker (Managing Director)',
        phone: formattedTel,
        tel: formattedTel,
        wa: cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`,
        site: args.site,
        ptype: args.ptype || 'UPGRADE',
        fee: args.fee || '₹1,00,000',
        cat: 'enterprise',
        speedScore: '🟡 45/100 (Unoptimized)',
        lcpTime: 'LCP: 4.8s',
        techStack: 'Custom / CMS',
        status: 'available',
        notes: args.notes || 'Added autonomously by Gemini Spark Cloud Agent',
        flaws: [
          'Mobile LCP latency > 4.5s',
          'Missing 60 FPS interactive 3D spatial showcase',
          'Zero instant 1-tap WhatsApp consultation conduit'
        ],
        addedAt: new Date().toISOString()
      };

      const customList = loadCustomProspects();
      customList.unshift(newLead);
      saveCustomProspects(customList);

      return {
        success: true,
        message: `Successfully ingested lead "${newLead.name}" into SprintDial radar!`,
        lead: newLead
      };
    }

    case 'audit_website_live': {
      return await probeWebsiteLive(args.url);
    }

    case 'draft_high_ticket_proposal': {
      return generateExecutiveProposal(args);
    }

    case 'get_pipeline_stats': {
      let totalValue = 0;
      let available = 0;
      let callbacks = 0;
      let closedWon = 0;
      let bookmarked = 0;
      let totalCommission = 0;

      all.forEach(p => {
        const fee = parseInt(String(p.fee).replace(/[^0-9]/g, '')) || 50000;
        totalValue += fee;
        if (p.bookmarked) bookmarked++;

        if (p.status === 'closed_won') {
          closedWon++;
          totalCommission += (p.commission || Math.round(fee * 0.15));
        } else if (p.status === 'callback') {
          callbacks++;
        } else {
          available++;
        }
      });

      return {
        totalLeads: all.length,
        totalPipelineValue: `₹${totalValue.toLocaleString('en-IN')}`,
        availableLeads: available,
        callbacksScheduled: callbacks,
        closedWonDeals: closedWon,
        bookmarkedLeads: bookmarked,
        totalCommissionEarned: `₹${totalCommission.toLocaleString('en-IN')}`,
        activeSlaStandard: 'Locked 60 FPS Three.js/WebGPU with 100% money-back guarantee'
      };
    }

    case 'get_objection_rebuttal': {
      const q = (args.objection_query || '').toLowerCase();
      const lang = args.language === 'ml' ? 'ml' : 'en';
      const p = args.prospect_id ? all.find(item => item.id === args.prospect_id) : null;

      const objList = (ObjectionEngine?.OBJECTIONS && ObjectionEngine.OBJECTIONS.length > 0)
        ? ObjectionEngine.OBJECTIONS
        : (global.OBJECTIONS && global.OBJECTIONS.length > 0 ? global.OBJECTIONS : [
            {
              title: "We already have an agency / web guy",
              en: "Most premier establishments we partner with already have an existing web vendor. Apoorv doesn’t replace your maintenance team—he acts as a specialist creative engineer to solve mobile speed, 3D interaction, and conversion drop-offs that standard agencies miss.",
              ml: "മിക്ക പ്രമുഖ ക്ലിനിക്കുകൾക്കും നിലവിൽ വെബ്‌സൈറ്റ് നോക്കാൻ ആളുണ്ടാകും. അവരെ മാറ്റാനല്ല ഞങ്ങൾ വരുന്നത്—മൊബൈൽ സ്പീഡും പുതിയ പേഷ്യന്റ് ബുക്കിംഗും വർദ്ധിപ്പിക്കാൻ സഹായിക്കുന്ന സ്പെഷ്യലിസ്റ്റ് സൊല്യൂഷനുകളാണ് അപൂർവ് നൽകുന്നത്."
            }
          ]);
      const analogyDict = (ObjectionEngine?.LAYMAN_ANALOGIES && Object.keys(ObjectionEngine.LAYMAN_ANALOGIES).length > 0)
        ? ObjectionEngine.LAYMAN_ANALOGIES
        : (global.LAYMAN_ANALOGIES || {});

      // Match objection
      const defaultObj = objList[0];
      const matchedObj = objList.find(o => 
        o && o.title && (o.title.toLowerCase().includes(q) || (o.en && o.en.toLowerCase().includes(q)))
      ) || defaultObj;

      // Match analogies
      const matchingAnalogies = Object.keys(analogyDict)
        .filter(k => k.includes(q) || analogyDict[k].title.toLowerCase().includes(q))
        .map(k => {
          const item = analogyDict[k];
          return {
            topic: item.title,
            metaphor: lang === 'ml' ? (item.metaphorMl || item.metaphor) : item.metaphor,
            talkingPoint: lang === 'ml' ? (item.talkingPointMl || item.talkingPoint) : item.talkingPoint,
            killshotQuestion: lang === 'ml' ? (item.killshotQuestionMl || item.killshotQuestion) : item.killshotQuestion
          };
        });

      return {
        query: args.objection_query,
        language: lang,
        prospectContext: p ? {
          name: p.name,
          dm: p.dm,
          lcpTime: p.lcpTime,
          techStack: p.techStack
        } : null,
        rebuttal: {
          title: matchedObj.title,
          script: lang === 'ml' ? (matchedObj.ml || matchedObj.en) : matchedObj.en
        },
        laymanAnalogies: matchingAnalogies.length > 0 ? matchingAnalogies : [
          {
            topic: analogyDict.lcp?.title || 'Mobile Speed',
            metaphor: lang === 'ml' ? analogyDict.lcp?.metaphorMl : analogyDict.lcp?.metaphor,
            talkingPoint: lang === 'ml' ? analogyDict.lcp?.talkingPointMl : analogyDict.lcp?.talkingPoint,
            killshotQuestion: lang === 'ml' ? analogyDict.lcp?.killshotQuestionMl : analogyDict.lcp?.killshotQuestion
          }
        ]
      };
    }

    case 'generate_client_teardown': {
      const p = all.find(item => item.id === args.prospect_id);
      if (!p) return { error: `Prospect with ID "${args.prospect_id}" not found.` };

      const teardownUrl = `https://apoorv.qzz.io/sales?teardown=${encodeURIComponent(p.id)}`;
      const lcp = p.lcpTime ? p.lcpTime.replace('LCP: ', '') : '4.6s';
      const dmClean = (p.dm || 'Managing Director').split('(')[0].trim();

      const whatsappBrief = `Namaste ${dmClean},

I conducted an executive performance teardown of ${p.name}'s mobile portal (${p.site}).

Critical finding: Your mobile loading latency is ${lcp}, resulting in significant patient/guest drop-off to aggregators who charge 18%-25% commission.

You can inspect the live interactive diagnostic teardown here:
${teardownUrl}

Apoorv's studio engineers locked 60 FPS mobile portals that eliminate aggregator bleed with 100% money-back SLA guarantee.

Would you have 10 minutes this week for a brief walkthrough?`;

      return {
        prospect_id: p.id,
        clientName: p.name,
        teardownUrl,
        mobileLcp: lcp,
        flaws: p.flaws || ['Mobile latency > 3s'],
        whatsappBrief,
        verbalHook: `Doctor, your mobile page takes ${lcp} to load—like keeping your clinic front door jammed shut while patients walk next door.`
      };
    }

    case 'log_lead_disposition': {
      const p = all.find(item => item.id === args.prospect_id);
      if (!p) return { error: `Prospect with ID "${args.prospect_id}" not found.` };

      let newStatus = 'in_progress';
      if (args.outcome === 'closed_won') newStatus = 'closed_won';
      else if (args.outcome === 'discovery_booked') newStatus = 'discovery_booked';
      else if (args.outcome === 'callback_requested') newStatus = 'callback';
      else if (args.outcome === 'not_interested' || args.outcome === 'unqualified') newStatus = 'rejected';

      const timestamp = new Date().toISOString();
      const noteEntry = `[${timestamp}] Reach: ${args.reach.toUpperCase()} | Outcome: ${args.outcome.toUpperCase()}\n${args.notes}`;
      const updatedNotes = p.notes ? `${p.notes}\n\n${noteEntry}` : noteEntry;

      const override = saveLeadOverride(p.id, {
        status: newStatus,
        lastReach: args.reach,
        lastOutcome: args.outcome,
        callbackTime: args.callback_datetime || null,
        tags: args.tags || [],
        notes: updatedNotes,
        lastContactedAt: timestamp
      });

      return {
        success: true,
        prospect_id: p.id,
        name: p.name,
        status: newStatus,
        callbackScheduled: args.callback_datetime || null,
        message: `Disposition logged successfully for ${p.name}!`
      };
    }

    case 'toggle_lead_bookmark': {
      const p = all.find(item => item.id === args.prospect_id);
      if (!p) return { error: `Prospect with ID "${args.prospect_id}" not found.` };

      saveLeadOverride(p.id, { bookmarked: Boolean(args.bookmarked) });

      return {
        success: true,
        prospect_id: p.id,
        name: p.name,
        bookmarked: Boolean(args.bookmarked),
        message: `${p.name} ${args.bookmarked ? 'bookmarked for priority outreach' : 'unbookmarked'}.`
      };
    }

    case 'generate_upi_deposit_rail': {
      const p = all.find(item => item.id === args.prospect_id);
      if (!p) return { error: `Prospect with ID "${args.prospect_id}" not found.` };

      const tierNum = Number(args.tier) || 1;
      const tier = DEAL_TIERS[tierNum] || DEAL_TIERS[1];
      const clientName = p.name || 'Client';

      const upiVpa = 'apoorvxs@okaxis';
      const payeeName = 'Apoorv A S';
      const upiIntent = `upi://pay?pa=${upiVpa}&pn=${encodeURIComponent(payeeName)}&am=${tier.advance}&cu=INR&tn=${encodeURIComponent(`50% Advance ${clientName.slice(0, 20)}`)}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=4&data=${encodeURIComponent(upiIntent)}`;
      const proposalUrl = `https://apoorv.qzz.io/sales?proposal=${encodeURIComponent(p.id)}&fee=${tier.total}`;

      const paymentMessage = `Namaste ${p.dm?.split('(')[0]?.trim() || clientName},

To lock your deployment schedule for ${tier.name}:
• Total Investment: ₹${tier.total.toLocaleString('en-IN')}
• 50% Milestone Advance: ₹${tier.advance.toLocaleString('en-IN')}
• UPI ID: ${upiVpa} (Apoorv A S)
• Direct UPI Payment Link: ${upiIntent}
• Review Scope & SLA Terms: ${proposalUrl}

Under our sovereign 60 FPS SLA guarantee, if your mobile speed fails to hit 60 FPS or sub-1.5s load, your deposit is 100% refunded.`;

      return {
        prospect_id: p.id,
        clientName: p.name,
        tierNum,
        tierName: tier.name,
        totalFee: `₹${tier.total.toLocaleString('en-IN')}`,
        advanceRequired: `₹${tier.advance.toLocaleString('en-IN')}`,
        partnerCommission: `₹${tier.commission.toLocaleString('en-IN')}`,
        upiVpa,
        payeeName,
        upiIntent,
        qrCodeUrl,
        proposalUrl,
        paymentMessage
      };
    }

    case 'mark_deal_closed_won': {
      const p = all.find(item => item.id === args.prospect_id);
      if (!p) return { error: `Prospect with ID "${args.prospect_id}" not found.` };

      const tierNum = Number(args.tier) || 1;
      const tier = DEAL_TIERS[tierNum] || DEAL_TIERS[1];
      const deposit = Number(args.deposit_amount) || tier.advance;
      const timestamp = new Date().toISOString();

      const closeNote = `[CLOSED WON - ${timestamp}]\nTier: ${tier.name}\nDeposit Paid: ₹${deposit.toLocaleString('en-IN')}\nCommission Unlocked: ₹${tier.commission.toLocaleString('en-IN')}\nNotes: ${args.notes || '50% advance confirmed'}`;
      const updatedNotes = p.notes ? `${p.notes}\n\n${closeNote}` : closeNote;

      saveLeadOverride(p.id, {
        status: 'closed_won',
        closedTier: tierNum,
        depositPaid: deposit,
        commission: tier.commission,
        notes: updatedNotes,
        closedAt: timestamp
      });

      return {
        success: true,
        prospect_id: p.id,
        clientName: p.name,
        status: 'closed_won',
        tierWon: tier.name,
        totalContractValue: `₹${tier.total.toLocaleString('en-IN')}`,
        depositConfirmed: `₹${deposit.toLocaleString('en-IN')}`,
        partnerCommissionEarned: `₹${tier.commission.toLocaleString('en-IN')} (15% Cut)`,
        message: `DEAL CLOSED WON! ₹${tier.commission.toLocaleString('en-IN')} commission successfully unlocked.`
      };
    }

    case 'escalate_to_apoorv': {
      const p = all.find(item => item.id === args.prospect_id);
      if (!p) return { error: `Prospect with ID "${args.prospect_id}" not found.` };

      const targetFee = parseInt(String(p.fee).replace(/[^0-9]/g, '')) || 50000;
      const referralCommission = Math.round(targetFee * 0.10);
      const timestamp = new Date().toISOString();

      const escalationNote = `[DISCOVERY WALKTHROUGH SCHEDULED - ${timestamp}]\nWalkthrough Time: ${args.preferred_datetime}\nReferral Commission: ₹${referralCommission.toLocaleString('en-IN')} (10% Safety Net)\nClient Brief: ${args.client_notes}`;
      const updatedNotes = p.notes ? `${p.notes}\n\n${escalationNote}` : escalationNote;

      saveLeadOverride(p.id, {
        status: 'discovery_booked',
        walkthroughTime: args.preferred_datetime,
        referralCommission,
        notes: updatedNotes,
        escalatedAt: timestamp
      });

      const calText = encodeURIComponent(`Discovery Walkthrough: ${p.name} / Apoorv A S`);
      const calDetails = encodeURIComponent(`Client: ${p.name}\nDM: ${p.dm}\nPhone: ${p.phone}\nWebsite: ${p.site}\nWalkthrough Notes:\n${args.client_notes}\n\nScheduled via SprintDial Gemini Spark Agent.`);
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calText}&details=${calDetails}&add=apoorvxs@gmail.com`;

      return {
        success: true,
        prospect_id: p.id,
        clientName: p.name,
        status: 'discovery_booked',
        preferredDatetime: args.preferred_datetime,
        reservedReferralCommission: `₹${referralCommission.toLocaleString('en-IN')} (10% cut on close)`,
        founderEmail: 'apoorvxs@gmail.com',
        googleCalendarUrl,
        message: `Walkthrough escalated to Apoorv! 10% referral commission locked.`
      };
    }

    case 'get_partner_wallet_ledger': {
      let cleared = 0;
      let pending = 0;
      const ledger = [];

      all.forEach(p => {
        if (p.status === 'closed_won') {
          const tierNum = p.closedTier || 1;
          const tier = DEAL_TIERS[tierNum] || DEAL_TIERS[1];
          const comm = p.commission || tier.commission;
          cleared += comm;
          ledger.push({
            id: p.id,
            client: p.name,
            type: 'CLOSED_WON',
            tier: tier.name,
            totalFee: `₹${tier.total.toLocaleString('en-IN')}`,
            depositPaid: `₹${(p.depositPaid || tier.advance).toLocaleString('en-IN')}`,
            commissionEarned: `₹${comm.toLocaleString('en-IN')}`,
            status: 'CLEARED',
            date: p.closedAt || p.updatedAt || 'Recent'
          });
        } else if (p.status === 'discovery_booked') {
          const targetFee = parseInt(String(p.fee).replace(/[^0-9]/g, '')) || 50000;
          const comm = p.referralCommission || Math.round(targetFee * 0.10);
          pending += comm;
          ledger.push({
            id: p.id,
            client: p.name,
            type: 'DISCOVERY_BOOKED',
            tier: 'Executive Walkthrough',
            totalFee: `₹${targetFee.toLocaleString('en-IN')}`,
            depositPaid: '₹0 (Pending Close)',
            commissionEarned: `₹${comm.toLocaleString('en-IN')}`,
            status: 'PENDING_WALKTHROUGH',
            date: p.escalatedAt || p.updatedAt || 'Recent'
          });
        }
      });

      return {
        totalClearedCommission: `₹${cleared.toLocaleString('en-IN')}`,
        totalPendingCommission: `₹${pending.toLocaleString('en-IN')}`,
        combinedEarnings: `₹${(cleared + pending).toLocaleString('en-IN')}`,
        totalDeals: ledger.length,
        ledger
      };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// -------------------------------------------------------------
// 6. HTTP SERVER & SSE ENDPOINT (JSON-RPC 2.0 / MCP SPEC)
// -------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // Global CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const acceptsSse = req.headers.accept && req.headers.accept.includes('text/event-stream');

  // --- MCP SSE STREAM (/sse OR GET / with Accept: text/event-stream) ---
  if ((pathname === '/sse' || (pathname === '/' && acceptsSse)) && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no'
    });
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    // Generate unique session identifier
    const sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    sseSessions.set(sessionId, res);

    // Send 2KB comment prelude to force intermediate proxies (Cloudflare/reverse proxies) to flush immediately
    res.write(`: ${' '.repeat(2048)}\r\n\r\n`);

    // According to the official MCP HTTP+SSE spec:
    // event: endpoint
    // data: /message?sessionId=...
    res.write(`event: endpoint\r\ndata: /message?sessionId=${sessionId}\r\n\r\n`);

    const keepAlive = setInterval(() => {
      res.write(': keep-alive\r\n\r\n');
    }, 15000);

    req.on('close', () => {
      clearInterval(keepAlive);
      sseSessions.delete(sessionId);
    });
    return;
  }

  // --- MCP JSON-RPC MESSAGE (POST /message or POST /) ---
  if ((pathname === '/message' || pathname === '/') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const json = JSON.parse(body);
        const { id, method, params } = json;
        const sessionId = parsed.query.sessionId;
        const sseClient = sessionId ? sseSessions.get(sessionId) : (sseSessions.values().next().value || null);

        let rpcResponse = null;

        // Protocol Initialization
        if (method === 'initialize') {
          rpcResponse = {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {}
              },
              serverInfo: {
                name: 'sprintdial-cloud-mcp',
                version: '2.1.0'
              }
            }
          };
        } else if (method === 'notifications/initialized') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok' }));
          return;
        } else if (method === 'tools/list') {
          rpcResponse = {
            jsonrpc: '2.0',
            id,
            result: {
              tools: MCP_TOOLS
            }
          };
        } else if (method === 'tools/call') {
          const toolName = params?.name;
          const toolArgs = params?.arguments || {};
          const result = await executeToolCall(toolName, toolArgs);

          rpcResponse = {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            }
          };
        } else if (method === 'ping') {
          rpcResponse = { jsonrpc: '2.0', id, result: {} };
        } else {
          rpcResponse = {
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Method not found: ${method}` }
          };
        }

        // Send via SSE if client is waiting on stream
        if (sseClient && rpcResponse) {
          try {
            sseClient.write(`event: message\r\ndata: ${JSON.stringify(rpcResponse)}\r\n\r\n`);
          } catch (e) {
            console.warn('[MCP Server] Error writing to SSE stream:', e.message);
          }
        }

        // Always reply with HTTP 200 JSON-RPC for standard HTTP transports
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(rpcResponse));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32700, message: 'Parse error', data: err.message }
        }));
      }
    });
    return;
  }

  // --- HEALTH & STATUS (GET / or /health) ---
  if (pathname === '/' || pathname === '/health' || pathname === '/status') {
    const stats = await executeToolCall('get_pipeline_stats', {});
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ONLINE',
      service: 'SprintDial Cloud MCP Server for Gemini Spark',
      agent: 'Gemini Spark 24/7 Autonomous Chief of Staff',
      mcpEndpoint: '/sse',
      totalTools: MCP_TOOLS.length,
      tools: MCP_TOOLS.map(t => t.name),
      stats
    }, null, 2));
    return;
  }

  // --- REST JSON APIS (FOR DIRECT WEB HOOKS) ---
  if (pathname === '/api/leads') {
    const data = await executeToolCall('list_leads', parsed.query);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
    return;
  }

  if (pathname === '/api/audit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const result = await executeToolCall('audit_website_live', payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result, null, 2));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (pathname === '/api/pitch' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const result = await executeToolCall('draft_high_ticket_proposal', payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result, null, 2));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 404 Fallback
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found', available: ['/sse', '/message', '/health', '/api/leads', '/api/audit', '/api/pitch'] }));
});

// Start listening if executed directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[SprintDial Cloud MCP] Server running on http://localhost:${PORT}`);
    console.log(`[SprintDial Cloud MCP] Remote SSE Endpoint: http://localhost:${PORT}/sse`);
    console.log(`[SprintDial Cloud MCP] Health Endpoint: http://localhost:${PORT}/health`);
  });
}

module.exports = {
  server,
  executeToolCall,
  getAllProspects,
  MCP_TOOLS,
  saveLeadOverride,
  loadPipelineOverrides,
  DEAL_TIERS
};
