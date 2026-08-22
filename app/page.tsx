import Link from "next/link";
import { getProfile } from "@/lib/profile";
import { ClientHeader } from "@/components/client/ClientHeader";
import { LogoMark } from "@/components/client/LogoMark";

export default function HomePage() {
  const profile = getProfile();

  return (
    <div className="starfield min-h-screen text-cream">
      <ClientHeader
        name={profile.name}
        right={
          <Link href="/admin/login" className="text-muted hover:text-cream">
            Admin
          </Link>
        }
      />
      <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center px-6 py-16 sm:px-10">
        <div className="max-w-3xl">
          <div className="mb-8 flex items-center gap-3">
            <LogoMark className="h-12 w-12" />
            <span className="text-sm font-medium text-muted">{profile.title}</span>
          </div>
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
            This portfolio is shared by link, not listed in public.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg">
            {profile.tagline} If you received a collection URL, open that instead.
            Case studies stay curated for the role at hand.
          </p>
          <p className="mt-8 inline-flex items-center gap-2 text-sm text-muted">
            <span className="h-2 w-2 rounded-full bg-brass" />
            Private library
          </p>
        </div>
      </main>
    </div>
  );
}
