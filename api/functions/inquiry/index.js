import { run } from '../../src/http.js';
import { publicInquiry } from '../../src/handlers.js';
export default async function (context, req) { return run(publicInquiry, req, context); }
