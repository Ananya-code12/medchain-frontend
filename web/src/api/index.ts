import { mockApi } from "./mock";
import { realApi } from "./client";

// One switch: VITE_USE_MOCK=false uses the real backend (needs VITE_API_BASE_URL). Anything else = built-in fake data.
export const api = import.meta.env.VITE_USE_MOCK === "false" ? realApi : mockApi;
export * from "./types";
export { ApiError } from "./errors";
