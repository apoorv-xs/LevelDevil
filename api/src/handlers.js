import { parseBody, validate, ok, checkRateLimit, resolveAllowedOrigin } from "./http.js";
import { guard } from "./auth.js";
import * as service from "./services.js";
import { qualify } from "./ai.js";
import { getStoredProspects, getStoredCustomProspects } from "./prospects.js";
export const publicInquiry = (req) => { const origin = resolveAllowedOrigin(req); checkRateLimit(req, 60); const body = validate(parseBody(req), { name: { required: true, type: "string", max: 120 }, email: { required: true, type: "string", max: 254, format: "email" }, message: { required: true, type: "string", max: 5000 }, scope: { type: "string", max: 200 }, budget: { type: "string", max: 100 } }); return ok(service.createInquiry(body), 201, origin); };
export const publicApplication = (req) => { const origin = resolveAllowedOrigin(req); checkRateLimit(req, 60); const body = validate(parseBody(req), { name: { required: true, type: "string", max: 120 }, email: { required: true, type: "string", max: 254, format: "email" }, message: { required: true, type: "string", max: 5000 }, resumeUrl: { type: "string", max: 2048, format: "url" } }); return ok(service.createApplication(body), 201, origin); };
export const ownerApplications = async (req) => { await guard(req, ["owner"]); return ok(service.listApplications()); };
export const ownerInvitation = async (req) => { const user = await guard(req, ["owner"]); return ok(service.createInvitation(validate(parseBody(req), { email: { required: true, type: "string", max: 254, format: "email" } }), user.uid), 201); };
export const redeem = async (req) => { const user = await guard(req, ["sales_rep", "owner"]); const body = validate(parseBody(req), { token: { required: true, type: "string" } }); return ok(await service.redeemInvitation(body.token, user.uid)); };
export const salesLeads = async (req) => { const user = await guard(req, ["sales_rep"]); return ok(service.listAssignedLeads(user.uid)); };
export const workspace = async (req) => {
  const user = await guard(req, ["owner", "sales_rep"]);
  const records = user.role === "owner"
    ? { applications: service.listApplications() }
    : { leads: service.listAssignedLeads(user.uid) };
  return ok({
    user: {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || user.email || user.uid,
      role: user.role,
    },
    data: records,
  });
};
export const ownerLeadAssignment = async (req) => { const user = await guard(req, ["owner"]); const body = validate(parseBody(req), { leadId: { required: true, type: "string" }, salesRepId: { required: true, type: "string" } }); return ok(service.assignLead(body.leadId, body.salesRepId, user.uid), 201); };
export const ownerLead = async (req) => { const user = await guard(req, ["owner"]); const body = validate(parseBody(req), { name: { required: true, type: "string" }, email: { type: "string" }, source: { type: "string" } }); return ok(service.createLead(body, user.uid), 201); };
export const aiQualification = async (req) => { await guard(req, ["owner", "sales_rep"]); return ok(await qualify(parseBody(req))); };
export const workspaceProspects = async (req) => {
  await guard(req, ["owner", "sales_rep"]);
  return ok({
    prospects: getStoredProspects(),
    custom: getStoredCustomProspects(),
  });
};
