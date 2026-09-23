import { beforeEach, describe, expect, it } from "vitest";
import { resetStore, repos } from "../../api/src/store.js";
import { publicInquiry, ownerInvitation, redeem, aiQualification, workspace, workspaceProspects } from "../../api/src/handlers.js";

const req = (body, token) => ({ body, headers: token ? { authorization: `Bearer ${token}` } : {} });
const context = { error() {} };

beforeEach(() => {
  resetStore();
  process.env.AI_MODE = "mock";
  process.env.ALLOW_MOCK_AUTH = "true";
  delete process.env.NODE_ENV;
});

describe("managed API", () => {
  it("validates and stores a public inquiry", async () => {
    const result = await publicInquiry(req({ name: "Ada", email: "ada@example.com", message: "Hello" }), context);
    expect(result.status).toBe(201);
    expect(repos.inquiries.list()).toHaveLength(1);
  });
  it("rejects owner endpoints without the owner role", async () => {
    await expect(ownerInvitation(req({ email: "rep@example.com", role: "sales_rep" }, "mock:rep:sales_rep"), context)).rejects.toMatchObject({ status: 403 });
  });
  it("redeems an invitation only once", async () => {
    const created = await ownerInvitation(req({ email: "rep@example.com", role: "sales_rep" }, "mock:owner:owner"), context);
    const token = JSON.parse(created.body).data.token;
    await redeem(req({ token }, "mock:rep:sales_rep"), context);
    await expect(redeem(req({ token }, "mock:other:sales_rep"), context)).rejects.toMatchObject({ status: 409 });
  });
  it("supports explicit synthetic AI mode", async () => {
    const result = await aiQualification(req({ message: "Interested" }, "mock:rep:sales_rep"), context);
    expect(JSON.parse(result.body).data.category).toBe("warm");
  });

  it("returns role-specific workspace data", async () => {
    const result = await workspace(req({}, "mock:owner:owner"), context);
    expect(JSON.parse(result.body).data).toMatchObject({
      user: { uid: "owner", email: "owner@mock.local", displayName: "owner", role: "owner" },
      data: { applications: [] },
    });
  });

  it("guards workspace prospects endpoint against unauthenticated visitors", async () => {
    await expect(workspaceProspects(req({}, null), context)).rejects.toMatchObject({ status: 401 });
  });

  it("serves protected client prospect dossiers strictly to authenticated sessions", async () => {
    const result = await workspaceProspects(req({}, "mock:owner:owner"), context);
    expect(result.status).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.data.prospects).toHaveLength(60);
    expect(body.data.custom).toHaveLength(5);
  });

  it("rejects mock bearer tokens when the test-only flag is disabled", async () => {
    delete process.env.ALLOW_MOCK_AUTH;
    await expect(ownerInvitation(req({ email: "rep@example.com" }, "mock:owner:owner"), context))
      .rejects.toMatchObject({ status: 401 });
  });

  it("rejects public inquiry with invalid email format", () => {
    expect(() => publicInquiry(req({ name: "Malicious", email: "not-an-email", message: "Hello" }), context))
      .toThrow(expect.objectContaining({ status: 400, code: "validation_error" }));
  });

  it("sanitizes prototype pollution payload in request body", async () => {
    const maliciousPayload = JSON.parse('{"name":"Ada","email":"ada@example.com","message":"Hi","__proto__":{"polluted":"yes"}}');
    const result = await publicInquiry(req(maliciousPayload), context);
    expect(result.status).toBe(201);
    expect(({})["polluted"]).toBeUndefined();
  });

  it("rejects unauthorized cross-origin requests with 403", () => {
    const maliciousReq = {
      body: { name: "Attacker", email: "attacker@evil.com", message: "Spam" },
      headers: { origin: "https://evil-hacker-site.com" }
    };
    expect(() => publicInquiry(maliciousReq, context))
      .toThrow(expect.objectContaining({ status: 403, code: "forbidden_origin" }));
  });

  it("permits allowed cross-origin requests and sets CORS headers", async () => {
    const validReq = {
      body: { name: "Client", email: "client@example.com", message: "Legit inquiry" },
      headers: { origin: "https://apoorv.qzz.io" }
    };
    const result = await publicInquiry(validReq, context);
    expect(result.status).toBe(201);
    expect(result.headers["access-control-allow-origin"]).toBe("https://apoorv.qzz.io");
    expect(result.headers["access-control-allow-methods"]).toContain("POST");
  });
});
