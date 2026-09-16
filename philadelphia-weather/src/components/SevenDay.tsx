import { temperatureColor } from "@/lib/conditions";
import { WeatherGlyph } from "./WeatherGlyph";
import { roundTemp, weekdayLabel } from "@/lib/format";
import type { DayPoint } from "@/lib/weather";

/**
 * Seven-day outlook.
 *
 * Each range bar is positioned against the whole week's span, so a mild day and
 * a cold snap are visually comparable across rows. (Scaling each bar to its own
 * row, or to a hardcoded window, makes every day look identical.)
 */
export function SevenDay({
  days,
  currentTemperature,
}: {
  days: DayPoint[];
  currentTemperature: number;
}) {
  const weekLow = Math.min(...days.map((day) => day.low));
  const weekHigh = Math.max(...days.map((day) => day.high));
  const span = weekHigh - weekLow || 1;

  const position = (value: number) => ((value - weekLow) / span) * 100;

  return (
    <section aria-labelledby="week-heading" className="mt-16 md:mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="week-heading" className="text-lg font-medium tracking-tight">
          Seven days
        </h2>
        <p className="tabular text-sm text-ink-muted">
          Week range {roundTemp(weekLow)}&deg; to {roundTemp(weekHigh)}&deg;
        </p>
      </div>

      <ul className="mt-6">
        {days.map((day, index) => {
          const isToday = index === 0;
          const left = position(day.low);
          const width = position(day.high) - left;

          return (
            <li
              key={day.date}
              className="grid grid-cols-[3.25rem_1.5rem_1fr] items-center gap-x-3 border-t border-line py-3.5 md:grid-cols-[4.5rem_2rem_2.75rem_1fr_2.75rem] md:gap-x-4"
            >
              <span className={`text-sm ${isToday ? "font-medium text-ink" : "text-ink-muted"}`}>
                {isToday ? "Today" : weekdayLabel(day.date)}
              </span>

              <WeatherGlyph
                code={day.weatherCode}
                size={20}
                weight="light"
                className="text-ink-muted"
                labelled
              />

              {/* Low reads first on desktop; on mobile both temperatures sit
                  under the bar to keep the row from crushing. */}
              <span className="tabular hidden text-right text-sm text-ink-muted md:block">
                {roundTemp(day.low)}&deg;
              </span>

              <div className="col-start-3 row-start-2 md:col-start-4 md:row-start-1">
                <div className="relative h-1.5 w-full overflow-hidden rounded-chip bg-line">
                  <div
                    className="absolute inset-y-0 rounded-chip"
                    style={{
                      left: `${left}%`,
                      width: `${Math.max(width, 2)}%`,
                      background: `linear-gradient(to right, ${temperatureColor(day.low)}, ${temperatureColor(day.high)})`,
                    }}
                  />
                  {isToday && (
                    <span
                      className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-ink"
                      style={{ left: `${position(currentTemperature)}%` }}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="tabular mt-1.5 flex justify-between text-xs text-ink-muted md:hidden">
                  <span>{roundTemp(day.low)}&deg;</span>
                  <span className="text-ink">{roundTemp(day.high)}&deg;</span>
                </div>
              </div>

              <span className="tabular hidden text-right text-sm font-medium md:block">
                {roundTemp(day.high)}&deg;
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
