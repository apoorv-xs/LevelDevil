import { badRequest, conflict, notFound } from "./errors.js";
import { repos, transaction } from "./store.js";
export function createApplication(data) { return repos.applications.create({ ...data, status: "new" }); }
export function createInquiry(data) { return repos.inquiries.create({ ...data, status: "new" }); }
export function listApplications() { return repos.applications.list(); }
export function createInvitation(data, ownerId) {
  const expiresAt = data.expiresAt || new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString();
  return repos.invitations.create({
    email: data.email,
    ownerId,
    role: "sales_rep",
    status: "pending",
    expiresAt,
    token: crypto.randomUUID(),
  });
}
export async function redeemInvitation(token, userId) {
  return transaction(() => {
    const invitation = repos.invitations.list((i) => i.token === token)[0];
    if (!invitation) throw notFound("Invitation not found");
    if (invitation.status !== "pending" || (invitation.expiresAt && new Date(invitation.expiresAt) <= new Date())) throw conflict("Invitation is no longer valid");
    const updated = repos.invitations.update(invitation.id, { status: "redeemed", redeemedBy: userId, redeemedAt: new Date().toISOString() });
    audit("invitation.redeemed", { uid: userId }, { invitationId: invitation.id });
    return updated;
  });
}
export function listAssignedLeads(userId) {
  const assigned = repos.assignments.list((a) => a.salesRepId === userId);
  return assigned.map((a) => repos.leads.get(a.leadId)).filter(Boolean);
}
export function createLead(data, ownerId) {
  const lead = repos.leads.create({ ...data, ownerId, status: "new" });
  audit("lead.created", { uid: ownerId }, { leadId: lead.id });
  return lead;
}
export function assignLead(leadId, salesRepId, ownerId) {
  if (!repos.leads.get(leadId)) throw notFound("Lead not found");
  if (!salesRepId) throw badRequest("salesRepId is required");
  const assignment = repos.assignments.create({ leadId, salesRepId, ownerId });
  audit("lead.assigned", { uid: ownerId }, { leadId, salesRepId });
  return assignment;
}
export function audit(action, actor, metadata = {}) { return repos.auditEvents.create({ action, actorId: actor.uid, metadata }); }
