export const config = {
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  aiMode: process.env.AI_MODE || "disabled",
  aiEndpoint: process.env.AI_ENDPOINT,
  aiApiKey: process.env.AI_API_KEY,
};

export function requireConfig(...keys) {
  const missing = keys.filter((key) => !config[key]);
  if (missing.length) throw new Error(`Missing configuration: ${missing.join(", ")}`);
}
