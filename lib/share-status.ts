import { isExpired } from "@/lib/format";
import type { Share } from "@/lib/db/schema";

export type ShareStatus = "active" | "unopened" | "expired" | "revoked";

export function shareStatus(share: {
  revokedAt: Date | number | null;
  expiresAt: Date | number | null;
  viewCount: number;
}): ShareStatus {
  if (share.revokedAt) return "revoked";
  if (isExpired(share.expiresAt)) return "expired";
  if (share.viewCount < 1) return "unopened";
  return "active";
}

export type ShareWithActivity = Share & {
  lastViewedAt: Date | null;
  lastCountry: string | null;
  lastCity: string | null;
  lastDevice: string | null;
};
