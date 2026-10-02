// One-shot: reframe unverified vendor-bill assertions into at-risk/est. language.
// Preserves ₹ amounts and /yr|/mo formats (test-pinned). Never invents new facts.
const fs = require('fs');
const path = require('path');

const R = '\u20B9';
const rules = [
  // wastedSpend heads (amount preserved, vendor-bill verb -> at-risk)
  [/ on Practo listings & commission bleed/g, ' in bookings at risk to Practo-listed rivals'],
  [/ on Fresha & marketplace commissions/g, ' in bookings at risk to marketplace-listed rivals'],
  [/ on aggregator listings & commission bleed/g, ' in orders at risk to aggregator listings'],
  [/ on Justdial & broker directory packages/g, ' in inquiries at risk to directory-listed rivals'],
  [/ on directory listings & aggregator bleed/g, ' in business at risk to directory-listed rivals'],
  [/ on Practo & bloated plugins/g, ' in bookings at risk (Practo-listed rivals + plugin overhead)'],
  [/ on Fresha\/Nearbuy commissions/g, ' in bookings at risk to marketplace-listed rivals'],
  [/ on Swiggy\/Zomato & ordering widgets/g, ' in orders at risk to delivery-marketplace listings'],
  [/ on Houzz Pro & directory listings/g, ' in inquiries at risk to aggregator-listed rivals'],
  [/ on redundant hosting & plugin packs/g, ' est. hosting & plugin overhead'],
  [/ on third-party directory listings/g, ' at risk to third-party directory-listed rivals'],
  [/ on directory leads & broker packages/g, ' at risk to directory-listed rivals'],
  [/ on aggregator directories & ads/g, ' at risk to aggregator directories'],
  // breakdown lines: vendor bills -> exposure/overhead (amount preserved)
  [/Practo listing & per-booking lead commissions/g, 'exposure to Practo-listed rival bookings'],
  [/Practo profile listing & lead commission bleed/g, 'exposure to Practo-listed rival bookings'],
  [/Justdial & Sulekha shared patient inquiry packages/g, 'shared-lead package exposure (Justdial/Sulekha, est.)'],
  [/Justdial & Sulekha shared student lead packages/g, 'shared-lead package exposure (Justdial/Sulekha, est.)'],
  [/SMS OTP & unverified receptionist callback costs/g, 'SMS/callback overhead (est.)'],
  [/SMS OTP pack for non-syncing booking form/g, 'SMS/form-friction overhead (est.)'],
  [/bulk promotional SMS packages/g, 'promotional SMS overhead (est.)'],
  [/third-party reminder notifications/g, 'reminder-notification overhead (est.)'],
  [/sponsored directory visibility charges/g, 'directory visibility overhead (est.)'],
  [/marketplace booking commission bleed( \(15-20% cut\))?/g, 'exposure to marketplace repeat-booking capture$1'],
  [/aggregator commission bleed on direct delivery orders/g, 'at risk to delivery-aggregator order capture'],
  [/table booking marketplace commissions/g, 'at risk to table-booking marketplace capture'],
  [/third-party QR menu subscription/g, 'QR-menu subscription overhead (est.)'],
  [/shared lead broker directory subscriptions/g, 'shared-lead directory exposure (est.)'],
  [/marketplace listing renewal fees/g, 'marketplace listing overhead (est.)'],
  [/unbranded portfolio hosting add-ons/g, 'portfolio hosting overhead (est.)'],
  [/directory listing packages & commission cuts/g, 'at risk to directory-listed rival capture'],
  [/shared lead referral service fees/g, 'shared-lead referral exposure (est.)'],
  [/manual callback & admin follow-up friction/g, 'manual callback/admin overhead (est.)'],
  [/slow shared hosting & Elementor Pro renewals/g, 'hosting & plugin overhead (est.)'],
  [/marketplace appointment commission bleed on repeat clients/g, 'at risk to marketplace appointment capture (repeat clients)'],
  [/marketplace appointment commission bleed/g, 'at risk to marketplace appointment capture'],
  [/legacy booking widget & plugin renewals/g, 'widget & plugin overhead (est.)'],
  [/delivery & table marketplace onboarding commissions/g, 'at risk to delivery/table marketplace capture'],
  [/third-party PDF menu & ordering widget subscription/g, 'menu/ordering-widget overhead (est.)'],
  [/legacy vendor hosting & SSL markups/g, 'hosting overhead (est.)'],
  [/Houzz Pro & Justdial directory listing subscriptions/g, 'at risk to Houzz/Justdial-listed rival capture'],
  [/unoptimized Squarespace\/Wix storage tier upgrades/g, 'storage-tier overhead (est.)'],
  [/redundant portfolio PDF bandwidth hosting fees/g, 'portfolio hosting overhead (est.)'],
  [/overpriced shared hosting & annual maintenance retainer/g, 'hosting & maintenance overhead (est.)'],
  [/unused plugin renewals & security add-ons/g, 'plugin overhead (est.)'],
  [/third-party contact form gateway subscriptions/g, 'form-gateway overhead (est.)'],
  [/directory listing packages & commission cuts/g, 'at risk to directory-listed rival capture'],
  [/third-party aggregator & Justdial listing renewals/g, 'at risk to aggregator/Justdial-listed rival capture'],
  [/physical leaflet distribution with zero trackable conversion/g, 'leaflet distribution with untracked conversion'],
  [/manual phone reception drop-offs during rush hours/g, 'manual phone reception load during rush hours'],
  [/manual front-desk telephone and DM coordination overhead/g, 'manual front-desk coordination load'],
  [/aggregator sponsored search placement to stay visible/g, 'aggregator sponsored-search exposure (est.)'],
  [/unverified social media lead form ads without direct CRM sync/g, 'social lead-form ads without direct CRM sync (unverified return)'],
  [/unmanaged manual phone reservation table-clash losses/g, 'manual phone-reservation load (table-clash risk unverified)'],
  [/delivery and dine-in booking commissions on existing clientele/g, 'at risk to delivery/dine-in marketplace capture'],
  [/shared lead broker /g, 'shared-lead exposure / '],
  [/Nearbuy \/ directory boosted listing fees/g, 'directory boosted-listing overhead (est.)'],
  [/legacy booking widget & plugin renewals/g, 'widget & plugin overhead (est.)']
];

const files = [
  path.join(__dirname, '..', 'workspace', 'queue_engine.js'),
  path.join(__dirname, '..', 'workspace', 'prospects_data.js'),
  path.join(__dirname, '..', 'workspace', 'custom_prospects.js')
];
let total = 0;
for (const f of files) {
  let t = fs.readFileSync(f, 'utf8');
  const before = t;
  for (const [re, rep] of rules) {
    re.lastIndex = 0;
    const n = (t.match(re) || []).length;
    if (n) { t = t.replace(re, rep); total += n; }
  }
  if (t !== before) { fs.writeFileSync(f, t, 'utf8'); console.log(f.split(/[\\/]/).pop() + ': ' + 'rewrote lines'); }
}
console.log('total replacements: ' + total);
