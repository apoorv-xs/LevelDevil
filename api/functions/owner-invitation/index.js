import { run } from '../src/http.js';
import { ownerInvitation } from '../src/handlers.js';
export default async function (context, req) { return run(ownerInvitation, req, context); }
