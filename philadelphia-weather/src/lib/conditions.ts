/**
 * WMO 4677 weather-code interpretation, plus the shared temperature colour
 * ramp.
 *
 * Code table: https://open-meteo.com/en/docs (WMO Weather interpretation codes)
 */
import type { Icon } from "@phosphor-icons/react";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Drop,
  Moon,
  Snowflake,
  Sun,
} from "@phosphor-icons/react/dist/ssr";

export interface Condition {
  label: string;
  /** Icon for daytime, and for codes where day and night look identical. */
  day: Icon;
  night: Icon;
}

const CONDITIONS: Record<number, Condition> = {
  0: { label: "Clear", day: Sun, night: Moon },
  1: { label: "Mainly clear", day: Sun, night: Moon },
  2: { label: "Partly cloudy", day: CloudSun, night: CloudMoon },
  3: { label: "Overcast", day: Cloud, night: Cloud },
  45: { label: "Fog", day: CloudFog, night: CloudFog },
  48: { label: "Freezing fog", day: CloudFog, night: CloudFog },
  51: { label: "Light drizzle", day: Drop, night: Drop },
  53: { label: "Drizzle", day: Drop, night: Drop },
  55: { label: "Heavy drizzle", day: Drop, night: Drop },
  56: { label: "Freezing drizzle", day: Drop, night: Drop },
  57: { label: "Freezing drizzle", day: Drop, night: Drop },
  61: { label: "Light rain", day: CloudRain, night: CloudRain },
  63: { label: "Rain", day: CloudRain, night: CloudRain },
  65: { label: "Heavy rain", day: CloudRain, night: CloudRain },
  66: { label: "Freezing rain", day: CloudRain, night: CloudRain },
  67: { label: "Freezing rain", day: CloudRain, night: CloudRain },
  71: { label: "Light snow", day: CloudSnow, night: CloudSnow },
  73: { label: "Snow", day: CloudSnow, night: CloudSnow },
  75: { label: "Heavy snow", day: CloudSnow, night: CloudSnow },
  77: { label: "Snow grains", day: Snowflake, night: Snowflake },
  80: { label: "Light showers", day: CloudRain, night: CloudRain },
  81: { label: "Showers", day: CloudRain, night: CloudRain },
  82: { label: "Heavy showers", day: CloudRain, night: CloudRain },
  85: { label: "Snow showers", day: CloudSnow, night: CloudSnow },
  86: { label: "Snow showers", day: CloudSnow, night: CloudSnow },
  95: { label: "Thunderstorm", day: CloudLightning, night: CloudLightning },
  96: { label: "Thunderstorm, hail", day: CloudLightning, night: CloudLightning },
  99: { label: "Thunderstorm, hail", day: CloudLightning, night: CloudLightning },
};

const UNKNOWN: Condition = { label: "Unavailable", day: Cloud, night: Cloud };

export function condition(code: number): Condition {
  return CONDITIONS[code] ?? UNKNOWN;
}

export function conditionIcon(code: number, isDay: boolean): Icon {
  const entry = condition(code);
  return isDay ? entry.day : entry.night;
}

/**
 * Temperature colour ramp, in degrees Fahrenheit.
 *
 * This is a sequential data scale, not a second brand accent: hue encodes the
 * value the same way it would on any chart. The warm end is the app's accent
 * colour, so the chart and the UI stay one system.
 */
const RAMP: ReadonlyArray<readonly [number, [number, number, number]]> = [
  [10, [96, 132, 168]],
  [32, [124, 160, 188]],
  [50, [150, 168, 160]],
  [65, [202, 160, 100]],
  [80, [224, 122, 60]],
  [95, [200, 69, 44]],
];

const mix = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

export function temperatureColor(fahrenheit: number): string {
  if (fahrenheit <= RAMP[0][0]) {
    const [r, g, b] = RAMP[0][1];
    return `rgb(${r} ${g} ${b})`;
  }

  for (let i = 0; i < RAMP.length - 1; i += 1) {
    const [lowStop, low] = RAMP[i];
    const [highStop, high] = RAMP[i + 1];
    if (fahrenheit <= highStop) {
      const t = (fahrenheit - lowStop) / (highStop - lowStop);
      return `rgb(${mix(low[0], high[0], t)} ${mix(low[1], high[1], t)} ${mix(low[2], high[2], t)})`;
    }
  }

  const [r, g, b] = RAMP[RAMP.length - 1][1];
  return `rgb(${r} ${g} ${b})`;
}

/** Compass label for a wind bearing in degrees. */
export function windCardinal(degrees: number): string {
  const points = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return points[Math.round(degrees / 22.5) % 16];
}

/** UV exposure banding per WHO guidance. */
export function uvBand(index: number): string {
  if (index < 3) return "Low";
  if (index < 6) return "Moderate";
  if (index < 8) return "High";
  if (index < 11) return "Very high";
  return "Extreme";
}
