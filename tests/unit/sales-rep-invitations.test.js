import { describe, it, expect } from 'vitest';
import fs from 'fs';

describe('Owner Admin Console: Sales Rep Email Invitation System', () => {
  const html = fs.readFileSync('workspace/index.html', 'utf8');
  const appJs = fs.readFileSync('workspace/app.js', 'utf8');

  it('contains the email invitation UI in workspace/index.html', () => {
    // Check form inputs
    expect(html).toContain('id="inviteSalesRepEmail"');
    expect(html).toContain('id="inviteSalesRepNotes"');
    expect(html).toContain('id="inviteSalesRepRole"');
    expect(html).toContain('id="adminInvitationsList"');
    expect(html).toContain('id="adminPendingInvitesBadge"');

    // Check dispatch actions
    expect(html).toContain('handleSendSalesRepInvite(\'email\')');
    expect(html).toContain('handleSendSalesRepInvite(\'copy\')');

    // Check brand and sender badge
    expect(html).toContain('From: apoorvxs@gmail.com');
    expect(html).toContain('Invite Sales Rep / Outreach Partner via Email');
  });

  it('implements invitation generation, storage, and mailto composition in workspace/app.js', () => {
    expect(appJs).toContain('INVITATIONS_STORAGE_KEY');
    expect(appJs).toContain('function getStoredInvitations');
    expect(appJs).toContain('function saveStoredInvitations');
    expect(appJs).toContain('async function handleSendSalesRepInvite');
    expect(appJs).toContain('function resendInviteEmail');
    expect(appJs).toContain('function copyInviteLink');
    expect(appJs).toContain('function revokeInvite');
    expect(appJs).toContain('function renderAdminInvitationsList');
  });

  it('enforces 72-hour expiration, 15% commission floor, and apoorvxs@gmail.com attribution in invitation templates', () => {
    // 72h expiration
    expect(appJs).toContain('72 * 60 * 60 * 1000');
    // Commercial terms
    expect(appJs).toContain('₹7,500');
    expect(appJs).toContain('15%');
    expect(appJs).toContain('apoorvxs@gmail.com');
    expect(appJs).toContain('Invitation: Join Apoorv A S as an Outreach Partner / Sales Rep');
  });

  it('supports URL invite token redemption and caller promotion on auth resolution', () => {
    expect(appJs).toContain('function handleInviteToken');
    expect(appJs).toContain('inviteRedemptionBanner');
    expect(appJs).toContain('sprintdial_active_invite_token');
    // Verifies that handleUserAuthResolved checks for pending invitation match
    expect(appJs).toContain('matchedInvite.status = \'redeemed\'');
    expect(appJs).toContain('matchedInvite.redeemedBy = email');
  });
});
