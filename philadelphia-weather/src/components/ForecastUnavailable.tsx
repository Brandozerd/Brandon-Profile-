import { CloudSlash } from "@phosphor-icons/react/dist/ssr";
import { PHILADELPHIA } from "@/lib/weather";

export function ForecastUnavailable({ reason }: { reason?: string }) {
  // Upstream error text is a debugging aid, not something to show a visitor.
  const showReason = reason && process.env.NODE_ENV !== "production";

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col justify-center px-5 py-12 md:px-8">
      <CloudSlash size={40} weight="light" className="text-ink-muted" aria-hidden="true" />
      <h1 className="mt-6 text-2xl font-medium tracking-tight md:text-3xl">
        No current reading for {PHILADELPHIA.name}
      </h1>
      <p className="mt-3 max-w-[55ch] text-ink-muted">
        The forecast service did not answer. Nothing here is cached from an
        earlier reading, so rather than show you a stale temperature, the page is
        showing you nothing. Reload in a moment.
      </p>
      {showReason && (
        <p className="mt-6 max-w-[55ch] border-t border-line pt-4 font-mono text-xs text-ink-faint">
          {reason}
        </p>
      )}
    </main>
  );
}
