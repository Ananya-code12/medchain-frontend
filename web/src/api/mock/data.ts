// ALL FAKE DATA. No real people, no real Aadhaar.
import type { AccessLogEntry, ConsentGrant, TimelineEntry } from "../types";

export const mockTimeline: TimelineEntry[] = [
  {
    id: "e5", patient_id: "demo-patient-1", type: "lab_report", date: "2023-06-18", source: "provider",
    provider_name: "Apex Pathology (demo)", file_ref: "/mock/sample.svg", doc_hash: "c3d1…09", solana_tx: "2Wm7…demoTx4",
    chain_status: "recorded", anchored_at: "2023-06-18T11:05:00Z",
    tests: [
      { name: "LDL cholesterol", value: 168, unit: "mg/dL", range_low: 0, range_high: 100, status: "high", confidence: 0.96 },
      { name: "HDL cholesterol", value: 48, unit: "mg/dL", range_low: 40, range_high: 60, status: "normal", confidence: 0.94 },
    ],
  },
  {
    id: "e4", patient_id: "demo-patient-1", type: "lab_report", date: "2022-11-09", source: "provider",
    provider_name: "Apex Pathology (demo)", file_ref: "/mock/sample.svg", doc_hash: "0be4…5a", solana_tx: "9Hc2…demoTx5",
    chain_status: "recorded", anchored_at: "2022-11-09T09:30:00Z",
    tests: [{ name: "TSH", value: 6.8, unit: "µIU/mL", range_low: 0.4, range_high: 4.0, status: "high", confidence: 0.62 }],
  },
  {
    id: "e3", patient_id: "demo-patient-1", type: "lab_report", date: "2026-10-12",
    source: "provider", provider_name: "Sunrise Diagnostics (demo)", file_ref: "/mock/sample.svg",
    doc_hash: "9f2c…a1", solana_tx: "5Kd3…demoTx1", chain_status: "recorded", anchored_at: "2026-10-12T10:42:00Z",
    tests: [
      { name: "Haemoglobin", value: 10.1, unit: "g/dL", range_low: 12, range_high: 15.5, status: "low", confidence: 0.97 },
      { name: "Fasting glucose", value: 142, unit: "mg/dL", range_low: 70, range_high: 100, status: "high", confidence: 0.95 },
      { name: "Creatinine", value: 0.9, unit: "mg/dL", range_low: 0.6, range_high: 1.2, status: "normal", confidence: 0.62 },
    ],
  },
  {
    id: "e2", patient_id: "demo-patient-1", type: "bill", date: "2026-09-03",
    source: "patient_uploaded", file_ref: "/mock/sample.svg", doc_hash: "77be…c4", chain_status: "pending",
  },
  {
    id: "e1", patient_id: "demo-patient-1", type: "prescription", date: "2026-08-20",
    source: "provider", provider_name: "Dr. Demo Sharma", file_ref: "/mock/sample.svg",
    doc_hash: "1ab0…7e", solana_tx: "3Zp9…demoTx2", chain_status: "recorded", anchored_at: "2026-08-20T09:15:00Z",
  },
];

const inHours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();

export const mockGrants: ConsentGrant[] = [
  { id: "g1", accessor_name: "Dr. Anita Sharma", granted_at: inHours(-1), expires_at: inHours(23), solana_tx: "8Qa1…demoTx3" },
];

export const mockAccessLog: AccessLogEntry[] = [
  { id: "a1", accessor_name: "Dr. Anita Sharma", viewed_at: inHours(-1), record_count: 3 },
];
