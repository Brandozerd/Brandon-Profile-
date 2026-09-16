"use client";

import { useEffect, useState } from "react";
import { Conditions } from "@/components/Conditions";
import { ForecastSkeleton } from "@/components/ForecastSkeleton";
import { ForecastUnavailable } from "@/components/ForecastUnavailable";
import { HourlyCurve } from "@/components/HourlyCurve";
import { Now } from "@/components/Now";
import { Reveal } from "@/components/Reveal";
import { SevenDay } from "@/components/SevenDay";
import { SunArc } from "@/components/SunArc";
import { getForecast, type Forecast } from "@/lib/weather";

/** Open-Meteo's model updates roughly every 15 minutes. */
const REFRESH_MS = 15 * 60 * 1000;

type State =
  | { status: "loading" }
  | { status: "ready"; forecast: Forecast }
  | { status: "error"; reason: string };

const asState = (result: PromiseSettledResult<Forecast>): State =>
  result.status === "fulfilled"
    ? { status: "ready", forecast: result.value }
    : {
        status: "error",
        reason:
          result.reason instanceof Error ? result.reason.message : "Unknown error",
      };

export default function Page() {
  const [state, setState] = useState<State>({ status: "loading" });
  // Bumping this re-runs the effect, which is how the retry button reloads.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    // The state update happens in the promise callback rather than in the
    // effect body, so a slow network cannot cascade renders on mount.
    const refresh = () =>
      Promise.allSettled([getForecast()]).then(([result]) => {
        if (controller.signal.aborted) return;
        setState(asState(result));
      });

    void refresh();

    // Refresh in place while the tab stays open, and again whenever the reader
    // comes back to it, so a window left open overnight is never showing
    // yesterday's conditions.
    const timer = setInterval(refresh, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      controller.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [attempt]);

  if (state.status === "loading") return <ForecastSkeleton />;

  if (state.status === "error") {
    return (
      <ForecastUnavailable
        reason={state.reason}
        onRetry={() => {
          setState({ status: "loading" });
          setAttempt((n) => n + 1);
        }}
      />
    );
  }

  const { forecast } = state;

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
