import type { ConsentGrant, Role } from "../api";

export const HOME_BY_ROLE: Record<Role, string> = { patient: "/timeline", doctor: "/doctor", diagnostic: "/diagnostic", pharmacy: "/pharmacy", admin: "/admin" };
// After the patient's code is accepted, each provider goes to a different page.
export const AFTER_CONSENT: Record<string, string> = { doctor: "record", diagnostic: "upload", pharmacy: "dispense" };

// Consent grants live in memory only, so a refresh ends access (fail closed).
const grants = new Map<string, ConsentGrant>();
export const saveGrant = (patientId: string, g: ConsentGrant) => grants.set(patientId, g);
export function getGrant(patientId?: string): ConsentGrant | null {
  const g = patientId ? grants.get(patientId) : undefined;
  return g && !g.revoked_at && new Date(g.expires_at).getTime() > Date.now() ? g : null;
}
