import { ApiError } from "./errors.js";

const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/([a-zA-Z0-9-]+\.)?qzz\.io$/,
  /^https:\/\/([a-zA-Z0-9-]+\.)?vercel\.app$/,
  /^https:\/\/([a-zA-Z0-9-]+\.)?azurestaticapps\.net$/
];

export function resolveAllowedOrigin(req) {
  const origin = req?.headers?.origin || req?.headers?.Origin;
  if (!origin) return null;
  const isAllowed = ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
  if (!isAllowed) {
    throw new ApiError(403, "forbidden_origin", "Cross-origin requests from this origin are forbidden");
  }
  return origin;
}

export function response(status, body, allowedOrigin = null) {
  const headers = {
    "content-type": "application/json",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  };
  if (allowedOrigin) {
    headers["access-control-allow-origin"] = allowedOrigin;
    headers["access-control-allow-methods"] = "GET, POST, OPTIONS";
    headers["access-control-allow-headers"] = "Content-Type, Authorization";
    headers["access-control-max-age"] = "86400";
    headers["vary"] = "Origin";
  }
  return { status, headers, body: JSON.stringify(body) };
}
export function ok(data, status = 200, allowedOrigin = null) { return response(status, { data }, allowedOrigin); }
export function parseBody(req) {
  if (!req?.body) return {};
  let parsed;
  if (typeof req.body === "object") parsed = { ...req.body };
  else {
    try { parsed = JSON.parse(req.body); } catch { throw new ApiError(400, "invalid_json", "Request body must be valid JSON"); }
  }
  if (parsed && typeof parsed === "object") {
    delete parsed["__proto__"];
    delete parsed["constructor"];
    delete parsed["prototype"];
  }
  return parsed;
}
export async function run(handler, req, context) {
  let allowedOrigin = null;
  try {
    allowedOrigin = resolveAllowedOrigin(req);
    if (req?.method?.toUpperCase() === "OPTIONS") {
      return response(204, {}, allowedOrigin);
    }
    return await handler(req, context);
  } catch (error) {
    const e = error instanceof ApiError ? error : new ApiError(500, "internal_error", "An unexpected error occurred");
    context?.error?.(error);
    return response(e.status, { error: { code: e.code, message: e.message, ...(e.details ? { details: e.details } : {}) } }, allowedOrigin);
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/[^\s$.?#].[^\s]*$/i;

export function validate(body, schema) {
  const errors = {};
  for (const [name, rules] of Object.entries(schema)) {
    if (name === "__proto__" || name === "constructor" || name === "prototype") continue;
    const value = body[name];
    if (rules.required && (value === undefined || value === null || value === "")) errors[name] = "required";
    if (value != null && rules.type && typeof value !== rules.type) errors[name] = `must be ${rules.type}`;
    if (value != null && rules.max && String(value).length > rules.max) errors[name] = `must be at most ${rules.max} characters`;
    if (value != null && rules.format === "email" && !EMAIL_REGEX.test(String(value))) errors[name] = "must be a valid email address";
    if (value != null && rules.format === "url" && !URL_REGEX.test(String(value))) errors[name] = "must be a valid http or https URL";
  }
  if (Object.keys(errors).length) throw new ApiError(400, "validation_error", "Invalid request", errors);
  return body;
}

const rateLimitMap = new Map();
export function checkRateLimit(req, maxRequests = 60, windowMs = 60000) {
  const ip = req?.headers?.["x-forwarded-for"]?.split(",")?.[0]?.trim() || req?.headers?.["x-real-ip"] || "127.0.0.1";
  const now = Date.now();
  let entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > windowMs) {
    entry = { start: now, count: 1 };
    rateLimitMap.set(ip, entry);
    if (rateLimitMap.size > 2000) {
      for (const [k, v] of rateLimitMap.entries()) {
        if (now - v.start > windowMs) rateLimitMap.delete(k);
      }
    }
  } else {
    entry.count++;
    if (entry.count > maxRequests) {
      throw new ApiError(429, "rate_limited", "Too many requests. Please try again later.");
    }
  }
}

