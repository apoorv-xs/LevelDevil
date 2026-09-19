import { run } from '../src/http.js';
import { aiQualification } from '../src/handlers.js';
export default async function (context, req) { return run(aiQualification, req, context); }
