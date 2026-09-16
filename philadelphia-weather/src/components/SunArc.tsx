import { clockLabel, minutesIntoDay } from "@/lib/format";
import type { Forecast } from "@/lib/weather";

const VIEW_W = 1000;
const ARC_H = 130;
const BASE_Y = 118;
const AMPLITUDE = 92;

/** Height of the sun's path at a given fraction of the daylight window. */
const arcY = (progress: number) => BASE_Y - Math.sin(Math.PI * progress) * AMPLITUDE;

export function SunArc({ forecast }: { forecast: Forecast }) {
  const today = forecast.days[0];
  const sunrise = minutesIntoDay(today.sunrise);
  const sunset = minutesIntoDay(today.sunset);
  const now = minutesIntoDay(forecast.observedAt);

  const daylight = sunset - sunrise;
  const rawProgress = (now - sunrise) / daylight;
  const isDaylight = rawProgress >= 0 && rawProgress <= 1;
  const progress = Math.min(Math.max(rawProgress, 0), 1);

  const hours = Math.floor(daylight / 60);
  const minutes = daylight % 60;

  // Sample the arc rather than using an SVG arc command, so the traced path and
  // the sun marker are guaranteed to agree.
  const path = Array.from({ length: 61 }, (_, i) => {
    const t = i / 60;
    return `${i === 0 ? "M" : "L"} ${(t * VIEW_W).toFixed(1)} ${arcY(t).toFixed(1)}`;
  }).join(" ");

  const travelled = Array.from({ length: 61 }, (_, i) => {
    const t = (i / 60) * progress;
    return `${i === 0 ? "M" : "L"} ${(t * VIEW_W).toFixed(1)} ${arcY(t).toFixed(1)}`;
  }).join(" ");

  return (
    <section aria-labelledby="sun-heading" className="mt-16 md:mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="sun-heading" className="text-lg font-medium tracking-tight">
          Daylight
        </h2>
        <p className="tabular text-sm text-ink-muted">
          {hours}h {minutes}m between sunrise and sunset
        </p>
      </div>

      <div className="relative mt-6">
        <svg
          viewBox={`0 0 ${VIEW_W} ${ARC_H}`}
          preserveAspectRatio="none"
          className="h-[130px] w-full overflow-visible"
          aria-hidden="true"
        >
          <path
            d={path}
            fill="none"
            stroke="var(--line-strong)"
            strokeWidth="1.5"
            strokeDasharray="3 5"
            vectorEffect="non-scaling-stroke"
          />
          {isDaylight && (
            <path
              d={travelled}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
          <line
            x1="0"
            y1={BASE_Y}
            x2={VIEW_W}
            y2={BASE_Y}
            stroke="var(--line)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* The sun marker is HTML so the horizontal stretch cannot turn it into
            an ellipse. */}
        <span
          className={`absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
            isDaylight ? "bg-accent" : "border-2 border-line-strong bg-surface"
          }`}
          style={{
            left: `${progress * 100}%`,
            top: `${(arcY(progress) / ARC_H) * 100}%`,
          }}
          aria-hidden="true"
        />

        <div className="tabular mt-2 flex justify-between text-sm">
          <span>
            <span className="text-ink-muted">Sunrise </span>
            {clockLabel(today.sunrise)}
          </span>
          <span>
            <span className="text-ink-muted">Sunset </span>
            {clockLabel(today.sunset)}
          </span>
        </div>
      </div>
    </section>
  );
}
