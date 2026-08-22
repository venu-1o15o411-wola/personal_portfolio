"use client";

import { useMemo, useState } from "react";
import { createShareAction } from "@/app/admin/actions";

export function ShareComposer({
  selectedIds,
  matchReasons,
  jobDescription,
  defaultJobTitle,
}: {
  selectedIds: number[];
  matchReasons?: Record<string, string>;
  jobDescription?: string;
  defaultJobTitle?: string;
}) {
  const [clientName, setClientName] = useState("");
  const [jobTitle, setJobTitle] = useState(defaultJobTitle ?? "");
  const [expiresAt, setExpiresAt] = useState("");
  const [password, setPassword] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const disabled = selectedIds.length === 0 || busy;

  const summary = useMemo(
    () =>
      `${selectedIds.length} project${selectedIds.length === 1 ? "" : "s"} selected`,
    [selectedIds.length],
  );

  async function generate() {
    setBusy(true);
    try {
      const result = await createShareAction({
        clientName,
        jobTitle,
        jobDescription,
        projectIds: selectedIds,
        matchReasons,
        expiresAt: expiresAt || null,
        password,
      });
      const url = `${window.location.origin}/p/${result.token}`;
      setLink(url);
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-2xl">Generate share link</h3>
        <span className="text-sm text-admin-ink/50">{summary}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="rounded-xl border border-black/10 px-3 py-2.5 text-sm"
          placeholder="Client name (optional)"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
        <input
          className="rounded-xl border border-black/10 px-3 py-2.5 text-sm"
          placeholder="Job title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
        />
        <input
          type="date"
          className="rounded-xl border border-black/10 px-3 py-2.5 text-sm"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
        <input
          className="rounded-xl border border-black/10 px-3 py-2.5 text-sm"
          placeholder="Optional access password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={generate}
          className="rounded-full bg-ink px-5 py-2.5 text-sm text-cream disabled:opacity-40"
        >
          {busy ? "Creating…" : "Generate link"}
        </button>
        {link ? (
          <button
            type="button"
            onClick={copy}
            className="rounded-full border border-black/10 px-5 py-2.5 text-sm"
          >
            {copied ? "Copied" : "Copy URL"}
          </button>
        ) : null}
      </div>
      {link ? (
        <p className="mt-3 break-all font-mono text-xs text-admin-ink/60">
          {link}
        </p>
      ) : null}
    </div>
  );
}
