import { unlockShareAction } from "@/app/p/actions";
import { ClientHeader } from "./ClientHeader";
import { getProfile } from "@/lib/profile";

export function SharePasswordGate({
  token,
  error,
}: {
  token: string;
  error?: string;
}) {
  const profile = getProfile();
  return (
    <div className="starfield flex min-h-screen flex-col text-cream">
      <ClientHeader name={profile.name} />
      <form action={unlockShareAction} className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6">
        <p className="text-sm font-medium text-brass">{profile.name}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">This collection is locked.</h1>
        <input type="hidden" name="token" value={token} />
        <input
          type="password"
          name="password"
          required
          placeholder="Access password"
          className="mt-8 w-full rounded-md border border-line bg-ink-2 px-4 py-3 text-sm outline-none ring-brass/50 focus:ring-2"
        />
        {error ? <p className="mt-3 text-sm text-brass">Password did not match.</p> : null}
        <button type="submit" className="mt-5 w-full rounded-md bg-brass py-3 text-sm font-semibold text-ink">
          View work
        </button>
      </form>
    </div>
  );
}
