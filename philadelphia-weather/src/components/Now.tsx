import { condition } from "@/lib/conditions";
import { WeatherGlyph } from "./WeatherGlyph";
import { clockLabel, longDateLabel, roundTemp } from "@/lib/format";
import type { Forecast } from "@/lib/weather";
import { PHILADELPHIA } from "@/lib/weather";

/**
 * Current conditions.
 *
 * The temperature is the page's typographic anchor: one very large numeral,
 * light weight, everything else deferring to it.
 */
export function Now({ forecast }: { forecast: Forecast }) {
  const today = forecast.days[0];
  const feelsDifferent =
    Math.abs(forecast.apparentTemperature - forecast.temperature) >= 1;

  return (
    <header>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h1 className="text-lg font-medium tracking-tight">
          {PHILADELPHIA.name}
          <span className="text-ink-muted">, {PHILADELPHIA.region}</span>
        </h1>
        <p className="tabular text-sm text-ink-muted">
          {longDateLabel(forecast.observedAt)} at {clockLabel(forecast.observedAt)}
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-8 md:mt-14 md:flex-row md:items-end md:justify-between md:gap-12">
        <div className="flex items-start gap-4 md:gap-6">
          <span
            className="tabular text-[6.5rem] font-light leading-[0.82] tracking-tighter md:text-[10rem]"
            style={{ letterSpacing: "-0.04em" }}
          >
            {roundTemp(forecast.temperature)}
          </span>
          <span className="mt-2 text-3xl font-light text-ink-muted md:mt-4 md:text-5xl" aria-hidden="true">
            &deg;F
          </span>
          <span className="sr-only">degrees Fahrenheit</span>
        </div>

        <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-2 md:text-right">
          <WeatherGlyph
            code={forecast.weatherCode}
            isDay={forecast.isDay}
            size={44}
            weight="light"
            className="text-accent md:size-14"
          />
          <div>
            <p className="text-xl font-medium tracking-tight md:text-2xl">
              {condition(forecast.weatherCode).label}
            </p>
            <p className="tabular mt-1 text-sm text-ink-muted">
              {feelsDifferent && (
                <>Feels like {roundTemp(forecast.apparentTemperature)}&deg; &middot; </>
              )}
              High {roundTemp(today.high)}&deg; Low {roundTemp(today.low)}&deg;
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
