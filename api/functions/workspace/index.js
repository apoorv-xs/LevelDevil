import { run } from "../src/http.js";
import { workspace } from "../src/handlers.js";

export default async function (context, req) {
  return run(workspace, req, context);
}
