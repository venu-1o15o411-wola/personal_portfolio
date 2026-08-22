import { SharesTable } from "@/components/admin/SharesTable";
import { deleteShareAction, revokeShareAction } from "@/app/admin/actions";
import { listShares } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function SharesPage() {
  const shares = await listShares();

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-admin-ink/40">
          Distribution
        </p>
        <h1 className="mt-1 font-serif text-4xl">Share links</h1>
      </div>
      <SharesTable shares={shares} onRevoke={revokeShareAction} onDelete={deleteShareAction} />
    </div>
  );
}
