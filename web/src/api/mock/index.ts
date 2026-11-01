import { ApiError } from "../errors";
import type { Api, ConsentGrant, LabTest, OtpTicket, Provider, Role, TimelineEntry } from "../types";
import { mockAccessLog, mockGrants, mockTimeline } from "./data";

// Offline fake backend with the same shape as the real one. Demo OTP is always 123456. Resets on refresh.
const DEMO_CODE = "123456";
const wait = <T,>(v: T, ms = 400) => new Promise<T>((r) => setTimeout(() => r(v), ms));
const role = () => { try { return JSON.parse(localStorage.getItem("session") || "{}").role as string | undefined; } catch { return undefined; } };
const ticket = (sentTo: string): OtpTicket => ({ otpId: `otp-${Math.random().toString(36).slice(2)}`, sentTo, expiresAt: new Date(Date.now() + 300000).toISOString() });
const checkCode = (c: string) => { if (c !== DEMO_CODE) throw new ApiError(400, "OTP_INVALID", "Wrong code.", { attemptsLeft: 4 }); };

let timeline = [...mockTimeline];
let grants = mockGrants.map((g) => ({ ...g }));
const created = new Map<string, number>();
let regName: string | undefined;
let wa = { linked: false, phone: null as string | null };
let waMobile = "";
const STAFF: Record<string, { role: Role; name: string }> = {
  "doctor@medchain.demo": { role: "doctor", name: "Dr. Anita Sharma" },
  "lab@medchain.demo": { role: "diagnostic", name: "City Diagnostics (DEMO)" },
  "pharmacy@medchain.demo": { role: "pharmacy", name: "Jan Aushadhi Pharmacy (DEMO)" },
  "admin@medchain.demo": { role: "admin", name: "MedChain Admin" },
};
let providers: Provider[] = [
  { id: "p1", type: "pharmacy", name: "Jan Aushadhi Demo Pharmacy 2", registration_number: "DL-DEMO-0099", verified_status: "pending", created_at: new Date().toISOString(), contact: { name: "Ravi Kumar", email: "ravi@example.demo" }, staff_count: 1 },
  { id: "p2", type: "diagnostic", name: "Green Lab (DEMO)", registration_number: "LAB-DEMO-0042", verified_status: "pending", created_at: new Date().toISOString(), contact: { name: "Asha Rao", email: "asha@example.demo" }, staff_count: 2 },
];
const sampleTests: LabTest[] = [
  { name: "Haemoglobin", value: 9.8, unit: "g/dL", range_low: 12, range_high: 15.5, status: "low", confidence: 0.95 },
  { name: "TSH", value: 2.1, unit: "mIU/L", range_low: 0.4, range_high: 4, status: "normal", confidence: 0.92 },
];

export const mockApi: Api = {
  health: () => wait({ demoMode: true }, 100),
  login: async (email, password) => {
    await wait(null, 400);
    const s = STAFF[email.trim().toLowerCase()];
    if (!s || password !== "Demo@1234") throw new ApiError(401, "INVALID_CREDENTIALS", "Wrong email or password.");
    return { token: `demo-${s.role}`, patientId: "", name: s.name, role: s.role, providerId: "p0" };
  },
  patientStart: async (identifier, reg) => {
    await wait(null, 400);
    if (identifier.replace(/\D/g, "") === "000000000009" && !reg) throw new ApiError(404, "PATIENT_NOT_REGISTERED", "Not registered.");
    regName = reg?.name;
    return ticket(`+91XXXXXX${(reg?.mobile ?? "0001").slice(-4)}`);
  },
  patientVerify: async (_o, code) => {
    await wait(null, 300); checkCode(code);
    return { token: "demo-patient", patientId: "demo-patient-1", name: regName || "Ramesh Kumar (DEMO)", role: "patient" };
  },

  requestConsent: async () => { await wait(null, 400); return ticket("+91XXXXXX0001"); },
  confirmConsent: async (_o, code) => {
    await wait(null, 400); checkCode(code);
    const g: ConsentGrant = {
      id: `g${Date.now()}`, patient_id: "demo-patient-1", patient_name: "Ramesh Kumar (DEMO, 72y)", accessor_name: "Dr. Anita Sharma",
      state: "active", granted_at: new Date().toISOString(), expires_at: new Date(Date.now() + 24 * 3600_000).toISOString(), solana_tx: "4Rt8…demoConsent",
    };
    grants = [g, ...grants]; // shows up on the patient's "Access" page
    return g;
  },
  getConsentGrants: () => wait(grants),
  revokeConsent: async (id) => { grants = grants.map((g) => (g.id === id ? { ...g, state: "revoked" as const, revoked_at: new Date().toISOString() } : g)); await wait(null, 300); },

  getTimeline: async () => {
    if (role() && role() !== "patient")
      mockAccessLog.unshift({ id: `a${Date.now()}`, accessor_name: "Dr. Anita Sharma", action: "view_timeline", viewed_at: new Date().toISOString(), record_count: timeline.length });
    return wait(timeline, 500);
  },
  getEntry: async (_p, id) => {
    const e = timeline.find((x) => x.id === id);
    if (!e) throw new ApiError(404, "RECORD_NOT_FOUND", "Record not found.");
    if (e.processing === "pending" && Date.now() - (created.get(id) ?? 0) > 3500) { // pretend the AI finished reading
      const done: TimelineEntry = { ...e, processing: "processed", tests: sampleTests };
      timeline = timeline.map((x) => (x.id === id ? done : x));
      return done;
    }
    return e;
  },
  uploadRecord: async (pid, _f, type, title) => {
    await wait(null, 1200);
    const staff = role() !== "patient"; const id = `u${Date.now()}`;
    const e: TimelineEntry = {
      id, patient_id: pid, type, title, date: new Date().toISOString(), source: staff ? "provider" : "patient_uploaded",
      source_label: staff ? "Uploaded by a provider (DEMO)" : "Patient-uploaded, unverified", doc_hash: "demo…hash",
      chain_status: staff ? "recorded" : "pending", solana_tx: staff ? "demoTx…upload" : undefined, anchored_at: new Date().toISOString(),
      processing: type === "lab_report" ? "pending" : "skipped",
    };
    created.set(id, Date.now()); timeline = [e, ...timeline];
    return e;
  },
  openFile: () => wait("/mock/sample.svg", 200),
  verifyEntry: () => wait("verified" as const, 700),
  getAccessLog: () => wait(mockAccessLog),

  getWhatsApp: () => wait(wa, 200),
  linkWhatsAppStart: async (mobile) => { waMobile = mobile; await wait(null, 300); return ticket(`+91XXXXXX${mobile.slice(-4)}`); },
  linkWhatsAppVerify: async (_o, code) => { await wait(null, 300); checkCode(code); wa = { linked: true, phone: `+91XXXXXX${waMobile.slice(-4)}` }; },
  unlinkWhatsApp: async () => { wa = { linked: false, phone: null }; await wait(null, 200); },
  deleteChatHistory: () => wait("deleted" as const, 400),

  listProviders: async (status) => { await wait(null, 300); return providers.filter((p) => status === "all" || p.verified_status === status); },
  verifyProvider: async (id) => { providers = providers.map((p) => (p.id === id ? { ...p, verified_status: "verified" as const } : p)); await wait(null, 300); },
  rejectProvider: async (id, reason) => { providers = providers.map((p) => (p.id === id ? { ...p, verified_status: "rejected" as const, rejection_reason: reason } : p)); await wait(null, 300); },
};
