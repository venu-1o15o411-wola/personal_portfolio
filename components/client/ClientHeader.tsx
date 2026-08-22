import Link from "next/link";
import { LogoMark } from "./LogoMark";

export function ClientHeader({
  name,
  right,
  href = "/",
}: {
  name: string;
  right?: React.ReactNode;
  href?: string;
}) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
      <Link href={href} className="flex items-center gap-3 text-cream">
        <LogoMark />
        <span className="text-sm font-semibold tracking-tight sm:text-base">{name}</span>
      </Link>
      {right ? <div className="shrink-0 text-sm">{right}</div> : null}
    </header>
  );
}
