import { run } from '../../src/http.js';
import { publicApplication } from '../../src/handlers.js';
export default async function (context, req) { return run(publicApplication, req, context); }
