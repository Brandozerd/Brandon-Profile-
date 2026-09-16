/**
 * Open-Meteo forecast client.
 *
 * Open-Meteo is keyless for non-commercial use, so there is no secret to manage
 * and no client-side CORS dance: this runs on the server and the browser only
 * ever sees rendered HTML.
 *
 * Docs: https://open-meteo.com/en/docs
 */

export const PHILADELPHIA = {
  name: "Philadelphia",
  region: "Pennsylvania",
  latitude: 39.9526,
  longitude: -75.1652,
  timeZone: "America/New_York",
} as const;

const ENDPOINT = "https://api.open-meteo.com/v1/forecast";

const QUERY = new URLSearchParams({
  latitude: String(PHILADELPHIA.latitude),
  longitude: String(PHILADELPHIA.longitude),
  current: [
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "is_day",
    "weather_code",
    "surface_pressure",
    "wind_speed_10m",
    "wind_direction_10m",
    "wind_gusts_10m",
  ].join(","),
  hourly: [
    "temperature_2m",
    "precipitation_probability",
    "weather_code",
    "visibility",
    "dew_point_2m",
  ].join(","),
  daily: [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "sunrise",
    "sunset",
    "uv_index_max",
    "precipitation_probability_max",
  ].join(","),
  temperature_unit: "fahrenheit",
  wind_speed_unit: "mph",
  precipitation_unit: "inch",
  timezone: PHILADELPHIA.timeZone,
  forecast_days: "7",
});

/** Shape of the subset of the Open-Meteo payload this app consumes. */
interface OpenMeteoResponse {
  utc_offset_seconds: number;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    is_day: number;
    weather_code: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
    visibility: number[];
    dew_point_2m: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_probability_max: number[];
  };
}

export interface HourPoint {
  /** Local wall-clock ISO string, e.g. "2026-09-16T14:00". */
  time: string;
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
  isNow: boolean;
}

export interface DayPoint {
  date: string;
  weatherCode: number;
  high: number;
  low: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationProbabilityMax: number;
}

export interface Forecast {
  observedAt: string;
  isDay: boolean;
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  humidity: number;
  dewPoint: number;
  pressure: number;
  visibilityMiles: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  /** Next 24 hours starting at the current hour. */
  hours: HourPoint[];
  days: DayPoint[];
}

/** Open-Meteo reports visibility in metres. */
const metresToMiles = (metres: number) => metres / 1609.344;

/**
 * Index of the hourly slot covering "now".
 *
 * Open-Meteo returns hourly timestamps as local wall-clock strings without an
 * offset, and `current.time` uses the same convention, so the two can be
 * compared directly as strings-to-Date without any timezone conversion.
 */
function currentHourIndex(hourly: string[], currentTime: string): number {
  const exact = hourly.indexOf(`${currentTime.slice(0, 13)}:00`);
  if (exact !== -1) return exact;

  // Fall back to the closest slot at or before the observation time.
  const target = new Date(currentTime).getTime();
  let best = 0;
  for (let i = 0; i < hourly.length; i += 1) {
    if (new Date(hourly[i]).getTime() <= target) best = i;
    else break;
  }
  return best;
}

export async function getForecast(): Promise<Forecast> {
  const response = await fetch(`${ENDPOINT}?${QUERY}`, {
    // Open-Meteo updates roughly every 15 minutes; revalidating on that cadence
    // keeps the page fast without serving stale conditions.
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    throw new Error(
      `Open-Meteo responded ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const { current, hourly, daily } = data;

  const start = currentHourIndex(hourly.time, current.time);
  const end = Math.min(start + 24, hourly.time.length);

  const hours: HourPoint[] = [];
  for (let i = start; i < end; i += 1) {
    hours.push({
      time: hourly.time[i],
      temperature: hourly.temperature_2m[i],
      precipitationProbability: hourly.precipitation_probability[i] ?? 0,
      weatherCode: hourly.weather_code[i],
      isNow: i === start,
    });
  }

  const days: DayPoint[] = daily.time.map((date, i) => ({
    date,
    weatherCode: daily.weather_code[i],
    high: daily.temperature_2m_max[i],
    low: daily.temperature_2m_min[i],
    sunrise: daily.sunrise[i],
    sunset: daily.sunset[i],
    uvIndexMax: daily.uv_index_max[i],
    precipitationProbabilityMax: daily.precipitation_probability_max[i] ?? 0,
  }));

  return {
    observedAt: current.time,
    isDay: current.is_day === 1,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    weatherCode: current.weather_code,
    humidity: current.relative_humidity_2m,
    dewPoint: hourly.dew_point_2m[start],
    pressure: current.surface_pressure,
    visibilityMiles: metresToMiles(hourly.visibility[start]),
    windSpeed: current.wind_speed_10m,
    windGusts: current.wind_gusts_10m,
    windDirection: current.wind_direction_10m,
    hours,
    days,
  };
}
