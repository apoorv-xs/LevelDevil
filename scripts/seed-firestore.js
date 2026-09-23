import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// 1. Load Prospects Dataset
const prospectsPath = path.resolve(__dirname, '../workspace/prospects_data.js');
const customPath = path.resolve(__dirname, '../workspace/custom_prospects.js');

require(prospectsPath);
require(customPath);

const defaultList = (typeof global !== 'undefined' && global.DEFAULT_PROSPECTS) ? global.DEFAULT_PROSPECTS : [];
const customList = (typeof global !== 'undefined' && global.CUSTOM_PROSPECTS) ? global.CUSTOM_PROSPECTS : [];

const combined = [...customList, ...defaultList];

console.log('====================================================');
console.log(`📦 Loaded ${combined.length} total prospect dossiers (${defaultList.length} default + ${customList.length} custom)`);
console.log('====================================================');

// 2. Export clean JSON for one-click backup or manual Firestore console import
const outPath = path.resolve(__dirname, '../firestore_prospects_export.json');
fs.writeFileSync(outPath, JSON.stringify(combined, null, 2), 'utf8');
console.log(`✅ Exported clean JSON for Firestore to: ${outPath}`);

// 3. If service account credentials or environment variables exist, seed directly via Firebase Admin
async function seedWithAdminIfAvailable() {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'apoorv-sales';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    console.log('\n💡 Note: To automatically seed Firestore directly via Node CLI:');
    console.log('   Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in your environment,');
    console.log('   OR use the 1-Click "Upload to Cloud Firestore" button inside the Workspace Admin Console!\n');
    return;
  }

  try {
    const { initializeApp, cert, getApps } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');

    const app = getApps()[0] || initializeApp({
      credential: cert({ projectId, clientEmail, privateKey })
    });

    const db = getFirestore(app);
    console.log(`🚀 Connecting to Firestore project '${projectId}'...`);

    const batch = db.batch();
    combined.forEach((item) => {
      const docRef = db.collection('prospects').doc(item.id);
      batch.set(docRef, item, { merge: true });
    });

    await batch.commit();
    console.log(`🎉 Successfully seeded ${combined.length} documents into Firestore collection 'prospects'!`);
  } catch (err) {
    console.error('❌ Failed to seed via Admin SDK:', err.message);
  }
}

seedWithAdminIfAvailable();
