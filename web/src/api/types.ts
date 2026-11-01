/** UI-side types. src/api/client.ts converts the backend's JSON (frontend-api.md) into these. */
export type Role = "patient" | "doctor" | "pharmacy" | "diagnostic" | "admin";
export type EntryType = "prescription" | "bill" | "lab_report" | "visit_note" | "other"; // bill = backend "pharmacy_bill"
export type EntrySource = "provider" | "patient_uploaded";
export type ChainStatus = "recorded" | "pending" | "none"; // recorded = backend "confirmed"
export type TestStatus = "high" | "low" | "normal" | "unknown";
export type Processing = "pending" | "processed" | "failed" | "skipped";
export type IntegrityStatus = "verified" | "tampered" | "pending";
export type UploadType = EntryType;
export type UploadStage = "uploading" | "ocr_running" | "anchoring" | "done" | "needs_review" | "failed";

export interface LabTest {
  name: string;
  value: number | null;
  value_text?: string | null;  // shown when the value is not a plain number
  unit: string;
  range_low: number | null;    // reference range PRINTED on the report
  range_high: number | null;
  range_text?: string | null;  // e.g. sex-specific ranges
  status: TestStatus;          // computed by backend code, never by AI
  confidence: number;          // 0..1; below 0.8 shows "Please verify"
}

export interface TimelineEntry {
  id: string;
  patient_id: string;
  type: EntryType;
  title?: string;
  date: string;
  source: EntrySource;
  source_label?: string;       // backend text, shown as-is
  provider_name?: string;
  doc_hash: string;
  solana_tx?: string;
  chain_status: ChainStatus;
  anchored_at?: string;
  processing?: Processing;     // AI reading state for lab reports
  tests?: LabTest[];
  file_ref?: string;           // mock mode only; real files are fetched with openFile()
}

export interface ConsentGrant {
  id: string;
  patient_id?: string;
  patient_name?: string;       // staff view
  accessor_name: string;       // patient view
  provider_name?: string;
  purpose?: string;
  state?: "active" | "expired" | "revoked";
  granted_at: string;
  expires_at: string;
  revoked_at?: string | null;
  solana_tx?: string;
}

export interface AccessLogEntry {
  id: string;
  accessor_name: string;
  provider_name?: string;
  action?: string;             // view_timeline | view_record | view_file | verify_record | upload
  viewed_at: string;
  record_count: number;
}

export interface Session { token: string; patientId: string; name: string; role: Role; providerId?: string | null }
export interface OtpTicket { otpId: string; sentTo: string; expiresAt: string }
export interface Provider {
  id: string; type: string; name: string; registration_number: string;
  verified_status: "pending" | "verified" | "rejected"; rejection_reason?: string | null;
  contact?: { name: string; email: string }; staff_count?: number; created_at: string;
}

/** Every screen talks to the backend ONLY through this interface (real client or mock). */
export interface Api {
  health(): Promise<{ demoMode: boolean }>;
  // auth
  login(email: string, password: string): Promise<Session>;                              // staff + admin
  patientStart(identifier: string, register?: { name: string; mobile: string }): Promise<OtpTicket>; // throws PATIENT_NOT_REGISTERED
  patientVerify(otpId: string, code: string, registering: boolean): Promise<Session>;
  // consent
  requestConsent(identifier: string): Promise<OtpTicket>;                                // staff: OTP goes to the patient
  confirmConsent(otpId: string, code: string): Promise<ConsentGrant>;                    // grant has patient_id + patient_name
  getConsentGrants(): Promise<ConsentGrant[]>;
  revokeConsent(grantId: string): Promise<void>;
  // records
  getTimeline(patientId: string): Promise<TimelineEntry[]>;
  getEntry(patientId: string, entryId: string): Promise<TimelineEntry>;
  uploadRecord(patientId: string, file: Blob, type: UploadType, title?: string): Promise<TimelineEntry>;
  openFile(patientId: string, entryId: string): Promise<string>;                         // blob URL for a new tab
  verifyEntry(patientId: string, entryId: string): Promise<IntegrityStatus>;
  getAccessLog(): Promise<AccessLogEntry[]>;
  // patient settings
  getWhatsApp(): Promise<{ linked: boolean; phone: string | null }>;
  linkWhatsAppStart(mobile: string): Promise<OtpTicket>;
  linkWhatsAppVerify(otpId: string, code: string): Promise<void>;
  unlinkWhatsApp(): Promise<void>;
  deleteChatHistory(): Promise<"deleted" | "not_configured" | "failed">;
  // admin
  listProviders(status: "pending" | "verified" | "rejected" | "all"): Promise<Provider[]>;
  verifyProvider(id: string): Promise<void>;
  rejectProvider(id: string, reason: string): Promise<void>;
}
