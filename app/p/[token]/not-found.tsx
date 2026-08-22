export default function NotFound() {
  return (
    <div className="starfield flex min-h-screen items-center justify-center px-6 text-cream">
      <div className="max-w-md">
        <p className="text-sm font-medium text-brass">404</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
          This collection is no longer available.
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          The link may have expired, been revoked, or never existed.
        </p>
      </div>
    </div>
  );
}
