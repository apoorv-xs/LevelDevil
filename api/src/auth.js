import { unauthorized, forbidden } from "./errors.js";
import { verifyFirebaseToken } from "./firebase.js";

export async function authenticate(req) {
  const header = req?.headers?.authorization || req?.headers?.Authorization;
  if (!header?.startsWith("Bearer ")) throw unauthorized();
  const token = header.slice(7);
  if (token.startsWith("mock:")) {
    if (process.env.ALLOW_MOCK_AUTH !== "true" || process.env.NODE_ENV === "production") {
      throw unauthorized();
    }
    const [uid, role = "owner"] = token.slice(5).split(":");
    if (!uid) throw unauthorized("Invalid token");
    return { uid, role, email: `${uid}@mock.local`, displayName: uid };
  }
  const user = await verifyFirebaseToken(token);
  const email = (user.email || "").toLowerCase().trim();
  const isOwnerEmail = email === "apoorv@eravex.studio" || email === "apoorvworkid@gmail.com";
  const role = user.role || user.claims?.role || user.customClaims?.role || (isOwnerEmail ? "owner" : "user");
  return {
    ...user,
    role,
    displayName: user.displayName || user.name || user.email,
  };
}
export function requireRole(...roles) {
  return (user) => { if (!roles.includes(user.role)) throw forbidden(); return user; };
}
export async function guard(req, roles) { return requireRole(...roles)(await authenticate(req)); }
