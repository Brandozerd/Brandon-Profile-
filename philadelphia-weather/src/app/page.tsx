import { Conditions } from "@/components/Conditions";
import { HourlyCurve } from "@/components/HourlyCurve";
import { Now } from "@/components/Now";
import { Reveal } from "@/components/Reveal";
import { SevenDay } from "@/components/SevenDay";
import { SunArc } from "@/components/SunArc";
import { ForecastUnavailable } from "@/components/ForecastUnavailable";
import { getForecast } from "@/lib/weather";

/**
 * Rendered per request, so a transient upstream failure is never baked into a
 * static page that would then serve the error to everyone until it revalidates.
 * The fetch-level `revalidate` still caps Open-Meteo calls at one per 15
 * minutes, so this costs an upstream request only when the cache is cold.
 */
export const dynamic = "force-dynamic";

export default async function Page() {
  let forecast;
  try {
    forecast = await getForecast();
  } catch (error) {
    // A weather page with no weather should say so plainly rather than render
    // an empty shell or, worse, invented numbers.
    return (
      <ForecastUnavailable
        reason={error instanceof Error ? error.message : "Unknown error"}
      />
    );
  }

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-5xl px-5 py-12 md:px-8 md:py-20">
      <Reveal>
        <Now forecast={forecast} />
      </Reveal>

      <Reveal delay={0.06}>
        <HourlyCurve hours={forecast.hours} />
      </Reveal>

      <Reveal delay={0.12}>
        <SevenDay days={forecast.days} currentTemperature={forecast.temperature} />
      </Reveal>

      <Reveal delay={0.18}>
        <Conditions forecast={forecast} />
      </Reveal>

      <Reveal delay={0.24}>
        <SunArc forecast={forecast} />
      </Reveal>

      <footer className="mt-20 border-t border-line pt-6 text-sm text-ink-muted md:mt-28">
        <p>
          Forecast data from{" "}
          <a
            href="https://open-meteo.com/"
            className="text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent"
            target="_blank"
            rel="noreferrer noopener"
          >
            Open-Meteo
          </a>
          , refreshed every 15 minutes. Times shown in Philadelphia local time.
        </p>
      </footer>
    </main>
  );
}
