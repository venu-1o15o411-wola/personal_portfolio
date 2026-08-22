import "server-only";

import { isAdminAuthenticated } from "@/lib/auth";
import { insertShareView } from "@/lib/db/queries";
import { readVisitor } from "@/lib/visitor";

export async function trackShareView(
  shareId: number,
  page: "gallery" | "case",
  pageLabel: string,
) {
  const visitor = await readVisitor();
  if (visitor.bot) return;
  const preview = await isAdminAuthenticated();
  await insertShareView({
    shareId,
    page,
    pageLabel,
    country: visitor.country,
    region: visitor.region,
    city: visitor.city,
    device: visitor.device,
    browser: visitor.browser,
    referrer: visitor.referrer,
    source: preview ? "admin" : "client",
  });
}
