"use client";

import { useState } from "react";
import type { ShareWithActivity } from "@/lib/share-status";
import { shareStatus } from "@/lib/share-status";
import { formatDate, formatRelative } from "@/lib/format";
import { formatPlace } from "@/lib/place";

export function SharesTable({
  shares,
  onRevoke,
  onDelete,
}: {
  shares: ShareWithActivity[];
  onRevoke: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<{ ok: true }>;
}) {
  const [rows, setRows] = useState(shares);
  const [copied, setCopied] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function copy(token: string) {
    const url = `${window.location.origin}/p/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 1200);
  }

  async function revoke(id: number) {
    setBusyId(id);
    try {
      await onRevoke(id);
      setRows((prev) =>
        prev.map((row) => (row.id === id ? { ...row, revokedAt: new Date() } : row)),
      );
    } finally {
      setBusyId(null);
    }
  }

  async function remove(share: ShareWithActivity) {
    const label = share.clientName || share.jobTitle || "this share link";
    if (!confirm(`Delete “${label}”? The client URL will stop working. This cannot be undone.`)) {
      return;
    }
    setBusyId(share.id);
    try {
      await onDelete(share.id);
      setRows((prev) => prev.filter((row) => row.id !== share.id));
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-black/10 bg-white p-5 text-sm text-admin-ink/50">
        No links yet. Select projects or run an AI match to create one.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-stone/60 text-left text-xs uppercase tracking-[0.14em] text-admin-ink/40">
          <tr>
            <th className="px-4 py-3">Client / job</th>
            <th className="px-4 py-3">Last open</th>
            <th className="px-4 py-3">Where</th>
            <th className="px-4 py-3">Views</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((share) => {
            const status = shareStatus(share);
            const statusLabel =
              status === "unopened" ? "Unopened" : status === "active" ? "Opened" : status === "expired" ? "Expired" : "Revoked";
            return (
              <tr key={share.id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  <div>{share.clientName || "Untitled client"}</div>
                  <div className="text-xs text-admin-ink/45">
                    {share.jobTitle || formatDate(share.createdAt)}
                  </div>
                </td>
                <td className="px-4 py-3 text-admin-ink/60">{formatRelative(share.lastViewedAt)}</td>
                <td className="px-4 py-3 text-admin-ink/60">
                  {share.lastViewedAt
                    ? formatPlace({ city: share.lastCity, country: share.lastCountry })
                    : "—"}
                </td>
                <td className="px-4 py-3 tabular-nums">{share.viewCount}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium capitalize">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        status === "active"
                          ? "bg-brass"
                          : status === "unopened"
                            ? "bg-amber-400"
                            : status === "expired"
                              ? "bg-zinc-400"
                              : "bg-red-500"
                      }`}
                    />
                    {statusLabel}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button type="button" className="mr-3" onClick={() => copy(share.token)}>
                    {copied === share.token ? "Copied" : "Copy"}
                  </button>
                  {status === "active" || status === "unopened" ? (
                    <button
                      type="button"
                      className="mr-3"
                      disabled={busyId === share.id}
                      onClick={() => revoke(share.id)}
                    >
                      Revoke
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="text-red-700 disabled:opacity-40"
                    disabled={busyId === share.id}
                    onClick={() => remove(share)}
                  >
                    {busyId === share.id ? "Deleting…" : "Delete"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
