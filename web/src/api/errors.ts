/** Every backend failure arrives as { error: { code, message, details } }. Branch UI logic on `code`, never on `message`. */
export class ApiError extends Error {
  status: number; code: string; details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message); this.status = status; this.code = code; this.details = details;
  }
}
