import { config, requireConfig } from "./config.js";
import { ApiError } from "./errors.js";
let adminApp;
export async function firebaseAdmin() {
  if (adminApp) return adminApp;
  try {
    requireConfig("firebaseProjectId", "firebaseClientEmail", "firebasePrivateKey");
    const { initializeApp, cert, getApps } = await import("firebase-admin/app");
    adminApp = getApps()[0] || initializeApp({ credential: cert({ projectId: config.firebaseProjectId, clientEmail: config.firebaseClientEmail, privateKey: config.firebasePrivateKey }) });
    return adminApp;
  } catch (error) {
    if (error.message?.startsWith("Missing configuration")) throw new ApiError(503, "firebase_not_configured", error.message);
    throw new ApiError(503, "firebase_unavailable", "Firebase Admin could not be initialized");
  }
}
export async function verifyFirebaseToken(token) {
  const app = await firebaseAdmin();
  const { getAuth } = await import("firebase-admin/auth");
  return getAuth(app).verifyIdToken(token);
}
