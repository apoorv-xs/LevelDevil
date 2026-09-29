import { describe, it, expect } from 'vitest';
import fs from 'fs';

describe('Caller Shortlist Bookmarks & Role-Gated Lead Count Protection', () => {
  const html = fs.readFileSync('workspace/index.html', 'utf8');
  const appJs = fs.readFileSync('workspace/app.js', 'utf8');

  it('role-gates total lead count and database size in workspace/index.html', () => {
    // Default fallback in HTML must not reveal total lead count to callers
    expect(html).toContain('id="leadCountBadge" class="text-[9px] sm:text-[10px] font-arcade text-[#17120f] bg-[#fffdf1] px-1.5 py-1 border-2 border-[#17120f] shadow-[1px_1px_0_#17120f] shrink-0 whitespace-nowrap">RADAR ACTIVE</span>');
    expect(html).toContain('id="leadQueuePosition" class="text-[10px] font-arcade text-[#17120f] px-2.5 py-1 border-x border-[#17120f]/30 whitespace-nowrap">Account #1</span>');
    expect(html).toContain('id="mobileQueueCountWrapper" class="hidden"');
  });

  it('provides the caller bookmark / save for later button in the prospect hero header', () => {
    expect(html).toContain('id="btnBookmarkLead"');
    expect(html).toContain('onclick="toggleBookmarkActiveLead()"');
    expect(html).toContain('id="bookmarkStarIcon"');
    expect(html).toContain('id="bookmarkText"');
    expect(html).toContain('id="activeRating" class="hidden"');
  });

  it('includes the starred status filter tab and gates the CSV export dock', () => {
    expect(html).toContain('id="statusTabStarred"');
    expect(html).toContain('onclick="filterStatus(\'starred\')"');
    expect(html).toContain('id="btnExportQueueCsv"');
    expect(html).toContain('style="display:none;"');
  });

  it('implements the bookmark engine and persists saved leads per caller email in workspace/app.js', () => {
    expect(appJs).toContain('function getBookmarkStorageKey()');
    expect(appJs).toContain('sprintdial_bookmarked_leads_');
    expect(appJs).toContain('function getBookmarkedLeadIds()');
    expect(appJs).toContain('function isLeadBookmarked(');
    expect(appJs).toContain('function toggleBookmarkLead(');
    expect(appJs).toContain('function toggleBookmarkActiveLead()');
    expect(appJs).toContain('function updateBookmarkButtonUI(');
  });

  it('supports the starred status filter and binds key B to bookmarking', () => {
    expect(appJs).toContain("activeStatusFilter === 'starred'");
    expect(appJs).toContain("starred: 'statusTabStarred'");
    expect(appJs).toContain("e.key.toLowerCase() === 'b'");
    expect(appJs).toContain('toggleBookmarkActiveLead()');
  });

  it('enforces role-based visibility for lead counts and CSV export in workspace/app.js', () => {
    // renderQueue checks owner status
    expect(appJs).toContain("countBadge.innerText = isOwner ? `${filtered.length} Leads` : 'RADAR ACTIVE';");
    expect(appJs).toContain("btnExport.style.display = isOwner ? 'inline-flex' : 'none';");
    // renderActiveProspect checks owner status
    expect(appJs).toContain("leadPosEl.innerText = `Lead ${posNum} of ${filteredForPos.length}`;");
    expect(appJs).toContain("leadPosEl.innerText = `Account #${posNum}`;");
    // exportActiveQueueCsv guards unauthorized export attempts
    expect(appJs).toContain("showNotification('[LOCKED] CSV export is restricted to Owner/Admin sessions.');");
  });

  it('styles queue card tier badges cleanly to prevent text collision', () => {
    expect(appJs).toContain('text-[7.5px] font-arcade px-1 py-0.5 bg-[#fffdf1] border border-[#17120f] shadow-[1px_1px_0_#17120f] text-[#17120f] font-bold shrink-0 uppercase tracking-wider');
    expect(appJs).toContain('title="Saved Prospect">★</span>');
  });
});
