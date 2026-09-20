import { run } from '../../src/http.js';
import { salesLeads } from '../../src/handlers.js';
export default async function (context, req) { return run(salesLeads, req, context); }
