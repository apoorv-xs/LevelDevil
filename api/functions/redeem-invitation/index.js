import { run } from '../src/http.js';
import { redeem } from '../src/handlers.js';
export default async function (context, req) { return run(redeem, req, context); }
