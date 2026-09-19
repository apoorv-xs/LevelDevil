export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message); this.status = status; this.code = code; this.details = details;
  }
}
export const badRequest = (message, details) => new ApiError(400, "invalid_request", message, details);
export const unauthorized = (message = "Authentication required") => new ApiError(401, "unauthorized", message);
export const forbidden = () => new ApiError(403, "forbidden", "Insufficient permissions");
export const notFound = (message = "Resource not found") => new ApiError(404, "not_found", message);
export const conflict = (message) => new ApiError(409, "conflict", message);
