import Link from "next/link";
import type { DashboardOverview } from "@/lib/db/queries";
import { shareStatus, type ShareStatus, type ShareWithActivity } from "@/lib/share-status";
import { formatRelative } from "@/lib/format";
import { flagEmoji, formatPlace } from "@/lib/place";

const STATUS_META: Record<ShareStatus, { label: string; color: string; hint: string }> = {
  active: { label: "Opened", color: "bg-brass", hint: "Client has opened the link" },
  unopened: { label: "Unopened", color: "bg-amber-400", hint: "Live, nobody has opened it yet" },
  expired: { label: "Expired", color: "bg-zinc-400", hint: "Past the expiry date" },
  revoked: { label: "Revoked", color: "bg-red-500", hint: "You turned this link off" },
};

function StatusPill({ status }: { status: ShareStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={`h-2 w-2 rounded-full ${meta.color}`} />
      {meta.label}
    </span>
  );
}

function shareLabel(share: { clientName: string | null; jobTitle: string | null; token?: string }) {
  return share.clientName || share.jobTitle || "Untitled client";
}

export function OverviewBoard({ stats }: { stats: DashboardOverview }) {
  const statusTotal = stats.shareCount || 1;
  const maxDay = Math.max(1, ...stats.dayCounts.map((day) => day.count));
  const maxLoc = Math.max(1, ...stats.locations.map((item) => item.count));
  const deviceTotal = stats.devices.reduce((sum, item) => sum + item.count, 0) || 1;
  const opened = stats.status.active;
  const unopened = stats.status.unopened;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Projects"
          value={stats.projectCount}
          hint={`${stats.publishedCount} published`}
        />
        <Kpi
          label="Share links"
          value={stats.shareCount}
          hint={`${opened} opened · ${unopened} waiting`}
        />
        <Kpi
          label="Client views"
          value={stats.views}
          hint={`${stats.viewsThisWeek} in the last 7 days`}
        />
        <Kpi
          label="This week"
          value={stats.viewsThisWeek}
          hint={stats.viewsThisWeek ? "Someone is opening the work" : "No client opens yet"}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-black/10 bg-white p-5 lg:col-span-2">
          <p className="text-xs uppercase tracking-[0.16em] text-admin-ink/40">Link status</p>
          <p className="mt-2 text-sm text-admin-ink/55">Every share, at a glance.</p>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-stone">
            {(["active", "unopened", "expired", "revoked"] as ShareStatus[]).map((key) => {
              const count = stats.status[key];
              if (!count) return null;
              return (
                <div
                  key={key}
                  className={STATUS_META[key].color}
                  style={{ width: `${(count / statusTotal) * 100}%` }}
                  title={`${STATUS_META[key].label}: ${count}`}
                />
              );
            })}
          </div>
          <ul className="mt-5 space-y-3">
            {(["active", "unopened", "expired", "revoked"] as ShareStatus[]).map((key) => (
              <li key={key} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${STATUS_META[key].color}`} />
                  {STATUS_META[key].label}
                </span>
                <span className="font-medium tabular-nums">{stats.status[key]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5 lg:col-span-3">
          <p className="text-xs uppercase tracking-[0.16em] text-admin-ink/40">Views · 14 days</p>
          <p className="mt-2 text-sm text-admin-ink/55">When clients opened a share.</p>
          <div className="mt-6 flex h-36 items-end gap-1.5">
            {stats.dayCounts.map((day) => (
              <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-t-md bg-brass/80"
                  style={{ height: `${Math.max(day.count ? 8 : 3, (day.count / maxDay) * 100)}%` }}
                  title={`${day.date}: ${day.count}`}
                />
                <span className="text-[10px] text-admin-ink/40">{day.label.slice(0, 2)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-admin-ink/40">Where they opened it</p>
          <p className="mt-2 text-sm text-admin-ink/55">
            City and country from the request (Vercel / Cloudflare headers). Local previews stay unknown.
          </p>
          {stats.locations.length === 0 ? (
            <p className="mt-8 text-sm text-admin-ink/45">No client locations yet.</p>
          ) : (
            <ul className="mt-6 space-y-3">
              {stats.locations.map((item) => (
                <li key={item.key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>
                      {flagEmoji(item.country) ? `${flagEmoji(item.country)} ` : ""}
                      {item.city || "Unknown city"}
                      {item.country ? ` · ${item.country}` : ""}
                    </span>
                    <span className="tabular-nums text-admin-ink/50">{item.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-stone">
                    <div
                      className="h-full rounded-full bg-ink"
                      style={{ width: `${(item.count / maxLoc) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-admin-ink/40">Device mix</p>
          <p className="mt-2 text-sm text-admin-ink/55">How they viewed the collection.</p>
          {stats.devices.length === 0 ? (
            <p className="mt-8 text-sm text-admin-ink/45">No device data yet.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {stats.devices.map((item) => (
                <li key={item.device}>
                  <div className="mb-1 flex justify-between text-sm capitalize">
                    <span>{item.device}</span>
                    <span className="tabular-nums text-admin-ink/50">
                      {Math.round((item.count / deviceTotal) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-stone">
                    <div
                      className="h-full rounded-full bg-brass"
                      style={{ width: `${(item.count / deviceTotal) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-black/10 bg-white lg:col-span-2">
          <div className="border-b border-black/5 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-admin-ink/40">Live activity</p>
            <p className="mt-1 text-sm text-admin-ink/55">
              Opens of a share, including your own preview while signed in.
            </p>
          </div>
          {stats.recentViews.length === 0 ? (
            <p className="p-5 text-sm text-admin-ink/45">
              Open a share link, then refresh this page. Your preview while signed in to admin now counts too.
            </p>
          ) : (
            <ul className="divide-y divide-black/5">
              {stats.recentViews.map((view) => (
                <li key={view.id} className="px-5 py-3">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {shareLabel(view)}
                    {view.source === "admin" ? (
                      <span className="rounded-full bg-stone px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-admin-ink/50">
                        You
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-xs text-admin-ink/50">
                    {view.page === "case" ? view.pageLabel || "Case study" : "Collection"}
                    {" · "}
                    {formatPlace(view)}
                    {" · "}
                    {view.device}
                  </p>
                  <p className="mt-1 text-xs text-admin-ink/40">{formatRelative(view.viewedAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-black/10 bg-white lg:col-span-3">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-admin-ink/40">Recent shares</p>
              <p className="mt-1 text-sm text-admin-ink/55">Last open and location.</p>
            </div>
            <Link href="/admin/shares" className="text-sm text-admin-ink/50">
              View all
            </Link>
          </div>
          {stats.recentShares.length === 0 ? (
            <p className="p-5 text-sm text-admin-ink/45">No share links yet.</p>
          ) : (
            <ShareActivityTable shares={stats.recentShares} />
          )}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-admin-ink/40">{label}</p>
      <p className="mt-3 font-serif text-4xl tabular-nums">{value}</p>
      <p className="mt-2 text-sm text-admin-ink/50">{hint}</p>
    </div>
  );
}

export function ShareActivityTable({ shares }: { shares: ShareWithActivity[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-stone/60 text-left text-xs uppercase tracking-[0.14em] text-admin-ink/40">
          <tr>
            <th className="px-4 py-3">Client / job</th>
            <th className="px-4 py-3">Last open</th>
            <th className="px-4 py-3">Where</th>
            <th className="px-4 py-3">Views</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {shares.map((share) => {
            const status = shareStatus(share);
            return (
              <tr key={share.id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  <div>{shareLabel(share)}</div>
                  {share.jobTitle && share.clientName ? (
                    <div className="text-xs text-admin-ink/45">{share.jobTitle}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-admin-ink/60">{formatRelative(share.lastViewedAt)}</td>
                <td className="px-4 py-3 text-admin-ink/60">
                  {share.lastViewedAt
                    ? formatPlace({ city: share.lastCity, country: share.lastCountry })
                    : "—"}
                </td>
                <td className="px-4 py-3 tabular-nums">{share.viewCount}</td>
                <td className="px-4 py-3">
                  <StatusPill status={status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
