import { run } from "../../src/http.js";
import { workspaceProspects } from "../../src/handlers.js";

export default async function (context, req) {
  return run(workspaceProspects, req, context);
}
