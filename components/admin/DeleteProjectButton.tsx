"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProjectAction } from "@/app/admin/actions";

export function DeleteProjectButton({
  id,
  title,
  redirectTo,
  className = "text-sm text-red-700",
}: {
  id: number;
  title: string;
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteProjectAction(id);
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={onDelete} disabled={busy} className={className}>
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
