/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiError } from "./errors";
import type { Api, ConsentGrant, EntryType, Provider, Session, TimelineEntry } from "./types";

const BASE = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:4000").replace(/\/+$/, "");
const token = () => localStorage.getItem("token") ?? "";
const NETWORK = "Can't reach the server. It may be waking up; try again in a minute.";

function sessionExpired() {
  localStorage.removeItem("session"); localStorage.removeItem("token"); window.location.href = "/login";
}
async function fail(res: Response): Promise<never> {
  const data: any = await res.json().catch(() => ({}));
  const e = data.error ?? {};
  const code = e.code ?? "UNKNOWN";
  if (res.status === 401 && (code === "TOKEN_EXPIRED" || code === "INVALID_TOKEN")) sessionExpired();
  throw new ApiError(res.status, code, e.message ?? "Request failed", e.details);
}
async function send(path: string, init: RequestInit): Promise<Response> {
  try { return await fetch(`${BASE}${path}`, init); } catch { throw new ApiError(0, "NETWORK", NETWORK); }
}
async function call<T>(method: string, path: string, body?: unknown, form?: FormData): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json"; // never set it for FormData: the browser adds the boundary
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const res = await send(`/api/v1${path}`, { method, headers, body: form ?? (body !== undefined ? JSON.stringify(body) : undefined) });
  if (!res.ok) await fail(res);
  return (await res.json().catch(() => ({}))) as T;
}

// ---- backend JSON -> UI types ----
const TYPE_IN: Record<string, EntryType> = { prescription: "prescription", pharmacy_bill: "bill", lab_report: "lab_report", visit_note: "visit_note", other: "other" };
const TYPE_OUT: Record<EntryType, string> = { prescription: "prescription", bill: "pharmacy_bill", lab_report: "lab_report", visit_note: "visit_note", other: "other" };
const chainIn = (s?: string) => (s === "confirmed" ? "recorded" : s === "chain_pending" ? "pending" : "none") as TimelineEntry["chain_status"];

const entryIn = (e: any): TimelineEntry => ({
  id: e.id, patient_id: e.patientId, type: TYPE_IN[e.type] ?? "other", title: e.title, date: e.date,
  source: e.source, source_label: e.sourceLabel, provider_name: e.uploadedBy?.providerName,
  doc_hash: e.docHash, solana_tx: e.chain?.solanaTx, chain_status: chainIn(e.chain?.status), anchored_at: e.createdAt,
  processing: e.processingStatus,
  tests: e.labResults?.tests?.map((x: any) => ({
    name: x.name, value: x.value ?? null, value_text: x.valueText, unit: x.unit ?? "",
    range_low: x.rangeLow ?? null, range_high: x.rangeHigh ?? null, range_text: x.rangeText,
    status: x.status ?? "unknown", confidence: x.confidence ?? 0,
  })),
});
const grantIn = (g: any): ConsentGrant => ({
  id: g.id, patient_id: g.patientId, patient_name: g.patientName, accessor_name: g.accessorName ?? "", provider_name: g.providerName,
  purpose: g.purpose, state: g.state, granted_at: g.grantedAt, expires_at: g.expiresAt, revoked_at: g.revokedAt, solana_tx: g.chain?.solanaTx,
});
const sessionIn = (r: any): Session => ({
  token: r.token, patientId: r.user.role === "patient" ? r.user.id : "", // for patients, user.id IS the patientId
  name: r.user.name, role: r.user.role, providerId: r.user.providerId,
});
const providerIn = (p: any): Provider => ({
  id: p.id, type: p.type, name: p.name, registration_number: p.registrationNumber, verified_status: p.verifiedStatus,
  rejection_reason: p.rejectionReason, contact: p.contact, staff_count: p.staffCount, created_at: p.createdAt,
});
const digits = (s: string) => s.replace(/\D/g, "");

export const realApi: Api = {
  health: async () => {
    const res = await send("/health", {});
    return { demoMode: !!(await res.json().catch(() => ({}))).demoMode };
  },
  login: async (email, password) => sessionIn(await call("POST", "/auth/login", { email, password })),
  patientStart: (identifier, reg) =>
    reg ? call("POST", "/auth/patient/register", { identifier: digits(identifier), name: reg.name, mobile: reg.mobile })
        : call("POST", "/auth/patient/login", { identifier: digits(identifier) }),
  patientVerify: async (otpId, code, registering) =>
    sessionIn(await call("POST", `/auth/patient/${registering ? "register" : "login"}/verify`, { otpId, code })),

  requestConsent: (identifier) => call("POST", "/consent/request", { identifier: digits(identifier) }),
  confirmConsent: async (otpId, code) => grantIn(await call("POST", "/consent/verify", { otpId, code })),
  getConsentGrants: async () => (await call<any>("GET", "/consent")).grants.map(grantIn),
  revokeConsent: async (id) => { await call("POST", `/consent/${id}/revoke`); },

  getTimeline: async (pid) => (await call<any>("GET", `/records/${pid}/timeline`)).entries.map(entryIn),
  getEntry: async (pid, id) => entryIn(await call("GET", `/records/${pid}/entries/${id}`)),
  uploadRecord: async (pid, file, type, title) => {
    const form = new FormData();
    form.append("file", file); form.append("type", TYPE_OUT[type]);
    if (title) form.append("title", title);
    return entryIn(await call("POST", `/records/${pid}/entries`, undefined, form));
  },
  openFile: async (pid, id) => {
    const res = await send(`/api/v1/records/${pid}/entries/${id}/file`, { headers: { Authorization: `Bearer ${token()}` } });
    if (!res.ok) await fail(res);
    return URL.createObjectURL(await res.blob());
  },
  verifyEntry: async (pid, id) => {
    const r = await call<any>("GET", `/records/${pid}/entries/${id}/verify`);
    if (r.status === "mismatch" || r.storedFileIntact === false) return "tampered";
    return r.status === "verified" && r.storedFileIntact ? "verified" : "pending";
  },
  getAccessLog: async () => (await call<any>("GET", "/access-log?limit=50")).entries.map((x: any) => ({
    id: x.id, accessor_name: x.accessor?.name ?? "", provider_name: x.accessor?.providerName, action: x.action,
    viewed_at: x.viewedAt, record_count: x.recordIds?.length ?? 0,
  })),

  getWhatsApp: async () => { const r = await call<any>("GET", "/patients/me/whatsapp"); return { linked: !!r.linked, phone: r.phone ?? null }; },
  linkWhatsAppStart: (mobile) => call("POST", "/patients/me/whatsapp/link", { mobile }),
  linkWhatsAppVerify: async (otpId, code) => { await call("POST", "/patients/me/whatsapp/verify", { otpId, code }); },
  unlinkWhatsApp: async () => { await call("DELETE", "/patients/me/whatsapp"); },
  deleteChatHistory: async () => (await call<any>("DELETE", "/patients/me/chat-history")).memory?.status ?? "deleted",

  listProviders: async (status) => (await call<any>("GET", `/admin/providers?status=${status}`)).providers.map(providerIn),
  verifyProvider: async (id) => { await call("POST", `/admin/providers/${id}/verify`); },
  rejectProvider: async (id, reason) => { await call("POST", `/admin/providers/${id}/reject`, { reason }); },
};
