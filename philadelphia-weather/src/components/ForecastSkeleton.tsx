/**
 * Skeleton shaped like the real page, so the layout does not jump when the
 * forecast lands.
 *
 * This is the prerendered state: the static HTML ships with this markup, and
 * the browser swaps in real readings once the Open-Meteo call returns.
 */
export function ForecastSkeleton() {
  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-5xl animate-pulse px-5 py-12 md:px-8 md:py-20">
      <div className="flex justify-between gap-6">
        <div className="h-6 w-56 rounded-chip bg-line" />
        <div className="h-6 w-40 rounded-chip bg-line" />
      </div>

      <div className="mt-10 flex items-end justify-between gap-6 md:mt-14">
        <div className="h-28 w-56 rounded-panel bg-line md:h-40 md:w-80" />
        <div className="h-16 w-44 rounded-panel bg-line" />
      </div>

      <div className="mt-16 h-[220px] rounded-panel bg-line md:mt-24 md:h-[260px]" />

      <div className="mt-16 space-y-4 md:mt-24">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="h-8 rounded-chip bg-line" />
        ))}
      </div>
      <span className="sr-only">Loading the Philadelphia forecast</span>
    </main>
  );
}
