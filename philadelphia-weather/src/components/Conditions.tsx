import {
  ArrowUp,
  Drop,
  Eye,
  Gauge,
  Sun,
  Thermometer,
  Wind,
} from "@phosphor-icons/react/dist/ssr";
import { uvBand, windCardinal } from "@/lib/conditions";
import type { Forecast } from "@/lib/weather";

/**
 * Secondary readings.
 *
 * Deliberately not cards: hairlines and space group these well enough, and six
 * boxed tiles would read as dashboard filler.
 */
export function Conditions({ forecast }: { forecast: Forecast }) {
  const uv = forecast.days[0].uvIndexMax;

  const readings = [
    {
      icon: Wind,
      label: "Wind",
      value: `${Math.round(forecast.windSpeed)}`,
      unit: "mph",
      detail: `From the ${windCardinal(forecast.windDirection)}, gusting ${Math.round(forecast.windGusts)}`,
      bearing: forecast.windDirection,
    },
    {
      icon: Drop,
      label: "Humidity",
      value: `${Math.round(forecast.humidity)}`,
      unit: "%",
      detail: `Dew point ${Math.round(forecast.dewPoint)} degrees`,
    },
    {
      icon: Sun,
      label: "UV index",
      value: `${Math.round(uv)}`,
      unit: "",
      detail: `${uvBand(uv)} exposure today`,
    },
    {
      icon: Eye,
      label: "Visibility",
      value: `${Math.round(forecast.visibilityMiles)}`,
      unit: "mi",
      detail: forecast.visibilityMiles >= 9 ? "Clear to the horizon" : "Reduced",
    },
    {
      icon: Gauge,
      label: "Pressure",
      value: (forecast.pressure * 0.02953).toFixed(2),
      unit: "inHg",
      detail: `${Math.round(forecast.pressure)} hPa`,
    },
    {
      icon: Thermometer,
      label: "Feels like",
      value: `${Math.round(forecast.apparentTemperature)}`,
      unit: "°",
      detail: "Adjusted for wind and humidity",
    },
  ];

  return (
    <section aria-labelledby="conditions-heading" className="mt-16 md:mt-24">
      <h2 id="conditions-heading" className="text-lg font-medium tracking-tight">
        Conditions
      </h2>

      <dl className="mt-6 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {readings.map((reading) => {
          return (
            <div key={reading.label} className="border-t border-line py-4">
              <dt className="flex items-center gap-2 text-sm text-ink-muted">
                <reading.icon size={16} weight="light" aria-hidden="true" />
                {reading.label}
              </dt>
              <dd className="mt-2">
                <span className="tabular text-3xl font-light tracking-tight">
                  {reading.value}
                </span>
                {reading.unit && (
                  <span
                    className={`text-base text-ink-muted ${
                      // A degree sign hangs off the numeral; a word unit needs
                      // the space.
                      reading.unit === "\u00B0" ? "" : "ml-1"
                    }`}
                  >
                    {reading.unit}
                  </span>
                )}
                {reading.bearing !== undefined && (
                  <ArrowUp
                    size={18}
                    weight="bold"
                    className="ml-2 inline-block align-middle text-accent"
                    style={{ transform: `rotate(${reading.bearing + 180}deg)` }}
                    aria-hidden="true"
                  />
                )}
                <p className="mt-1 text-sm text-ink-muted">{reading.detail}</p>
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
