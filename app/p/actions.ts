"use server";

import { grantShareAccess } from "@/lib/auth";
import { getShareByToken } from "@/lib/db/queries";
import { verifySecret } from "@/lib/crypto";
import { redirect } from "next/navigation";

export async function unlockShareAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const share = await getShareByToken(token);
  if (!share?.passwordHash) {
    redirect(`/p/${token}`);
  }
  if (!verifySecret(password, share.passwordHash)) {
    redirect(`/p/${token}?error=1`);
  }
  await grantShareAccess(token);
  redirect(`/p/${token}`);
}
