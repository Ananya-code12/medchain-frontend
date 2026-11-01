import i18n from "../i18n";
import { ApiError } from "../api/errors";

/** Turns a backend error code into friendly text (English/Hindi). Falls back to the server's own message. */
export function errText(e: unknown): string {
  if (!(e instanceof ApiError)) return i18n.t("common.error");
  const key = `errors.${e.code}`;
  if (!i18n.exists(key)) return e.message;
  let s = String(i18n.t(key, (e.details ?? {}) as Record<string, unknown>));
  const left = (e.details as { attemptsLeft?: number } | undefined)?.attemptsLeft;
  if (e.code === "OTP_INVALID" && typeof left === "number") s += ` (${left})`;
  return s;
}
