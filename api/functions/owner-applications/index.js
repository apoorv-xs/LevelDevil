import { run } from '../src/http.js';
import { ownerApplications } from '../src/handlers.js';
export default async function (context, req) { return run(ownerApplications, req, context); }
