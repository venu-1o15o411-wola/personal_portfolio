import { loginAction } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/auth";
import { LogoMark } from "@/components/client/LogoMark";
import { getProfile } from "@/lib/profile";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }
  const { error } = await searchParams;
  const profile = getProfile();

  return (
    <div className="starfield flex min-h-screen items-center justify-center px-6 text-cream">
      <form action={loginAction} className="w-full max-w-sm">
        <LogoMark className="h-10 w-10" />
        <p className="mt-6 text-sm font-medium text-brass">Admin</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">{profile.name}</h1>
        <p className="mt-2 text-sm text-muted">Sign in to the portfolio library.</p>
        <input
          type="password"
          name="password"
          required
          placeholder="Password"
          className="mt-8 w-full rounded-md border border-line bg-ink-2 px-4 py-3 text-sm outline-none ring-brass/50 focus:ring-2"
        />
        {error ? (
          <p className="mt-3 text-sm text-brass">That password did not match.</p>
        ) : null}
        <button
          type="submit"
          className="mt-5 w-full rounded-md bg-brass py-3 text-sm font-semibold text-ink"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
