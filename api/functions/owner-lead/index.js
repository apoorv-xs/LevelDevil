import { run } from '../src/http.js';
import { ownerLead } from '../src/handlers.js';
export default async function (context, req) { return run(ownerLead, req, context); }
