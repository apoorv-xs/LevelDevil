import { run } from '../src/http.js';
import { ownerLeadAssignment } from '../src/handlers.js';
export default async function (context, req) { return run(ownerLeadAssignment, req, context); }
