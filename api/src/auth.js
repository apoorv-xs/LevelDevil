import { unauthorized, forbidden } from "./errors.js";
import { verifyFirebaseToken } from "./firebase.js";

export async function authenticate(req) {
  const header = req?.headers?.authorization || req?.headers?.Authorization;
  if (!header?.startsWith("Bearer ")) throw unauthorized();
  const token = header.slice(7);
  if (token.startsWith("mock:")) {
    const [uid, role = "owner"] = token.slice(5).split(":");
    if (!uid) throw unauthorized("Invalid token");
    return { uid, role, email: `${uid}@mock.local` };
  }
  return verifyFirebaseToken(token);
}
export function requireRole(...roles) {
  return (user) => { if (!roles.includes(user.role)) throw forbidden(); return user; };
}
export async function guard(req, roles) { return requireRole(...roles)(await authenticate(req)); }
