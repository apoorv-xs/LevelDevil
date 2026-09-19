import { ApiError } from "./errors.js";

export function response(status, body) {
  return { status, headers: { "content-type": "application/json", "cache-control": "no-store" }, body: JSON.stringify(body) };
}
export function ok(data, status = 200) { return response(status, { data }); }
export function parseBody(req) {
  if (!req?.body) return {};
  if (typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body); } catch { throw new ApiError(400, "invalid_json", "Request body must be valid JSON"); }
}
export async function run(handler, req, context) {
  try { return await handler(req, context); }
  catch (error) {
    const e = error instanceof ApiError ? error : new ApiError(500, "internal_error", "An unexpected error occurred");
    context?.error?.(error);
    return response(e.status, { error: { code: e.code, message: e.message, ...(e.details ? { details: e.details } : {}) } });
  }
}
export function validate(body, schema) {
  const errors = {};
  for (const [name, rules] of Object.entries(schema)) {
    const value = body[name];
    if (rules.required && (value === undefined || value === null || value === "")) errors[name] = "required";
    if (value != null && rules.type && typeof value !== rules.type) errors[name] = `must be ${rules.type}`;
    if (value != null && rules.max && String(value).length > rules.max) errors[name] = `must be at most ${rules.max} characters`;
  }
  if (Object.keys(errors).length) throw new ApiError(400, "validation_error", "Invalid request", errors);
  return body;
}
