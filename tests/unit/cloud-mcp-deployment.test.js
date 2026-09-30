import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import fs from 'fs';
import path from 'path';

function postJson(port, pathName, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: pathName,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

describe('24/7 Google Cloud Run Deployment & MCP Relay Pipeline', () => {
  let serverModule;
  let runningServer;
  const testPort = 3299;

  beforeAll(async () => {
    serverModule = await import(path.resolve(__dirname, '../../mcp_spark_server.cjs'));
    await new Promise((resolve) => {
      runningServer = serverModule.server.listen(testPort, '0.0.0.0', () => {
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (runningServer) {
      await new Promise(resolve => runningServer.close(resolve));
    }
  });

  it('1. Dockerfile exists and contains required Google Cloud Run directives', () => {
    const dockerfilePath = path.resolve(__dirname, '../../Dockerfile');
    expect(fs.existsSync(dockerfilePath)).toBe(true);
    const content = fs.readFileSync(dockerfilePath, 'utf8');
    expect(content).toContain('node:20-alpine');
    expect(content).toContain('EXPOSE 8080');
    expect(content).toContain('CMD ["node", "mcp_spark_server.cjs"]');
    expect(content).toContain('COPY workspace/ ./workspace/');
  });

  it('2. .dockerignore exists and excludes bloat from Cloud Run image', () => {
    const ignorePath = path.resolve(__dirname, '../../.dockerignore');
    expect(fs.existsSync(ignorePath)).toBe(true);
    const content = fs.readFileSync(ignorePath, 'utf8');
    expect(content).toContain('node_modules');
    expect(content).toContain('.git');
    expect(content).toContain('tests');
  });

  it('3. POST /api/spark/scout executes live website audit and prospect creation', async () => {
    const res = await postJson(testPort, '/api/spark/scout', {
      business: 'Lourdes Heart Institute',
      city: 'Kochi',
      category: 'clinic'
    });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.prospect).toBeDefined();
    expect(res.data.prospect.name).toBe('Lourdes Heart Institute');
    expect(res.data.prospect.city).toBe('Kochi');
    expect(res.data.audit).toBeDefined();
  });

  it('4. POST /api/spark/scout executes batch harvest by niche', async () => {
    const res = await postJson(testPort, '/api/spark/scout', {
      niche: 'Luxury Real Estate',
      city: 'Wayanad',
      count: 2
    });
    expect(res.status).toBe(200);
    expect(res.data.leads).toBeDefined();
    expect(res.data.leads.length).toBeGreaterThanOrEqual(1);
  });

  it('5. POST /api/spark/debrief saves call intelligence and returns structured CRM notes', async () => {
    const res = await postJson(testPort, '/api/spark/debrief', {
      prospect_id: 'p-1',
      transcript: 'Director asked for proof of 60 FPS performance and Practo margin recovery numbers.',
      reach: 'phone',
      outcome: 'callback_requested'
    });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.prospect_id).toBe('p-1');
    expect(res.data.status).toBe('callback');
  });

  it('6. POST /api/spark/outreach generates 4-touch Swokei sequence', async () => {
    const res = await postJson(testPort, '/api/spark/outreach', {
      prospect_id: 'p-1',
      recipient_email: 'director@medicaltrusthospital.com'
    });
    expect(res.status).toBe(200);
    expect(res.data.prospect_id).toBe('p-1');
    expect(res.data.sequence).toBeDefined();
    expect(res.data.sequence.length).toBe(4);
    expect(res.data.sequence[0].touchNumber).toBe(1);
  });

  it('7. POST /api/spark/verify audits domain DNS deliverability', async () => {
    const res = await postJson(testPort, '/api/spark/verify', {
      domain: 'google.com'
    });
    expect(res.status).toBe(200);
    expect(res.data.domain).toBe('google.com');
    expect(res.data.status).toBe('OPTIMAL');
    expect(res.data.hasValidMx).toBe(true);
  });

  it('8. POST /api/spark/deposit generates UPI payment intent and Razorpay fallback', async () => {
    const res = await postJson(testPort, '/api/spark/deposit', {
      prospect_id: 'p-1',
      tier: 1
    });
    expect(res.status).toBe(200);
    expect(res.data.advanceRequired).toBe('₹25,000');
    expect(res.data.upiIntent).toContain('upi://pay');
    expect(res.data.upiIntent).toContain('pa=apoorvxs@okaxis');
  });

  it('9. Workspace app.js exports Cloud MCP relay utilities', async () => {
    const appPath = path.resolve(__dirname, '../../workspace/app.js');
    const content = fs.readFileSync(appPath, 'utf8');
    expect(content).toContain('getSparkServerBaseUrl');
    expect(content).toContain('saveSparkServerUrlUI');
    expect(content).toContain('testSparkServerConnectionUI');
    expect(content).toContain('/api/spark/scout');
    expect(content).toContain('/api/spark/debrief');
  });

  it('10. Workspace index.html includes Cloud MCP Server input and connection UI', () => {
    const htmlPath = path.resolve(__dirname, '../../workspace/index.html');
    const content = fs.readFileSync(htmlPath, 'utf8');
    expect(content).toContain('sparkServerUrlInput');
    expect(content).toContain('sparkServerStatusBadge');
    expect(content).toContain('sparkSecretKeyInput');
    expect(content).toContain('saveSparkServerUrlUI()');
    expect(content).toContain('saveSparkSecretKeyUI()');
    expect(content).toContain('testSparkServerConnectionUI()');
  });

  it('11. Workspace app.js implements Sovereign Secret Key and authenticated headers', () => {
    const appPath = path.resolve(__dirname, '../../workspace/app.js');
    const content = fs.readFileSync(appPath, 'utf8');
    expect(content).toContain('getSparkSecretKey');
    expect(content).toContain('saveSparkSecretKeyUI');
    expect(content).toContain('getSparkServerHeaders');
    expect(content).toContain('sprintdial_spark_secret_key');
  });

  it('12. /health probe returns sanitized status without leaking pipeline metrics or tools', async () => {
    const res = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${testPort}/health`, res => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
      }).on('error', reject);
    });
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('ONLINE');
    expect(res.data.stats).toBeUndefined(); // Zero client or financial pipeline metrics leaked
    expect(res.data.tools).toBeDefined();
  });
});
