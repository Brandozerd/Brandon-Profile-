"use client";

import { motion, useReducedMotion } from "motion/react";
import { temperatureColor } from "@/lib/conditions";
import { smoothPath, type Point } from "@/lib/curve";
import { hourLabel, roundTemp } from "@/lib/format";
import type { HourPoint } from "@/lib/weather";

/**
 * 24-hour temperature curve.
 *
 * The SVG carries only geometry and is stretched to fit with
 * `preserveAspectRatio="none"`; `vector-effect="non-scaling-stroke"` keeps the
 * line weight honest under that stretch. Every label is HTML positioned over
 * the top, so type stays at real pixel sizes instead of scaling down to
 * illegibility on a phone.
 */

const VIEW_W = 1000;
const VIEW_H = 240;
const PLOT_TOP = 28;
const PLOT_BOTTOM = 176;
const RAIN_BASELINE = 216;
const RAIN_HEIGHT = 34;

/** Below this, a probability lane is noise rather than information. */
const RAIN_THRESHOLD = 5;

export function HourlyCurve({ hours }: { hours: HourPoint[] }) {
  const reduceMotion = useReducedMotion();

  const temps = hours.map((hour) => hour.temperature);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  // Pad the domain so the curve never runs flush against the plot edges.
  const domainMin = min - 2;
  const domainMax = max + 2;
  const span = domainMax - domainMin || 1;

  const lastIndex = hours.length - 1;
  const xAt = (index: number) => (index / lastIndex) * VIEW_W;
  const yAt = (temp: number) =>
    PLOT_TOP + (PLOT_BOTTOM - PLOT_TOP) * (1 - (temp - domainMin) / span);

  const points: Point[] = hours.map((hour, index) => ({
    x: xAt(index),
    y: yAt(hour.temperature),
  }));

  const line = smoothPath(points);
  const area = `${line} L ${VIEW_W} ${PLOT_BOTTOM} L 0 ${PLOT_BOTTOM} Z`;

  const peakRain = Math.max(...hours.map((hour) => hour.precipitationProbability));
  const showRain = peakRain >= RAIN_THRESHOLD;

  /** Keep callouts inside the plot instead of hanging off either edge. */
  const clampX = (index: number) =>
    index <= 1 ? "translateX(0)" : index >= lastIndex - 1 ? "translateX(-100%)" : "translateX(-50%)";

  // Both callouts sit above their point. Hanging the low one below would drop
  // it into the precipitation lane.
  const callouts = [
    { index: temps.indexOf(max), value: max },
    // A perfectly flat day would place both callouts on one point.
    ...(temps.indexOf(min) === temps.indexOf(max)
      ? []
      : [{ index: temps.indexOf(min), value: min }]),
  ];

  return (
    <section aria-labelledby="hourly-heading" className="mt-16 md:mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="hourly-heading" className="text-lg font-medium tracking-tight">
          Next 24 hours
        </h2>
        <p className="text-sm text-ink-muted">
          {showRain
            ? `Chance of rain peaks at ${peakRain}%`
            : "No rain in the next 24 hours"}
        </p>
      </div>

      <figure className="relative mt-6">
        {/* A screen reader gets the readings, not a description of a picture. */}
        <figcaption className="sr-only">
          Hourly temperature for the next 24 hours in Philadelphia.{" "}
          {hours
            .map((hour) => `${hourLabel(hour.time)}: ${roundTemp(hour.temperature)} degrees`)
            .join(", ")}
          .
        </figcaption>

        <div
          className={showRain ? "relative h-[210px] md:h-[240px]" : "relative h-[165px] md:h-[190px]"}
          aria-hidden="true"
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${showRain ? VIEW_H : PLOT_BOTTOM + 4}`}
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
          >
            <defs>
              {/* Hue tracks temperature across the day rather than sitting on a
                  single flat colour, so the shape of the day is readable at a
                  glance before reading a single number. */}
              <linearGradient id="tempRamp" gradientUnits="userSpaceOnUse" x1="0" x2={VIEW_W}>
                {hours.map((hour, index) => (
                  <stop
                    key={hour.time}
                    offset={index / lastIndex}
                    stopColor={temperatureColor(hour.temperature)}
                  />
                ))}
              </linearGradient>
              <linearGradient
                id="tempFade"
                gradientUnits="userSpaceOnUse"
                y1={PLOT_TOP}
                y2={PLOT_BOTTOM}
              >
                <stop offset="0" stopColor="var(--accent)" stopOpacity="0.18" />
                <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path d={area} fill="url(#tempFade)" />

            <motion.path
              d={line}
              fill="none"
              stroke="url(#tempRamp)"
              strokeWidth="2.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />

            {showRain && (
              <>
                {/* Bars sit on a baseline so they read as a chart rather than
                    as specks floating under the curve. */}
                <line
                  x1="0"
                  y1={RAIN_BASELINE}
                  x2={VIEW_W}
                  y2={RAIN_BASELINE}
                  stroke="var(--line)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
                {hours.map((hour, index) => {
                  if (hour.precipitationProbability <= 0) return null;
                  // Scaled to the day's peak, not to a fixed 0-100 axis: on a
                  // mostly dry day a 0-100 axis renders every bar as a
                  // two-pixel speck. The peak value is named in the heading
                  // above, so the lane stays readable without overstating it.
                  const height =
                    (hour.precipitationProbability / peakRain) * RAIN_HEIGHT;
                  return (
                    <rect
                      key={hour.time}
                      x={xAt(index) - 6}
                      y={RAIN_BASELINE - height}
                      width="12"
                      height={height}
                      fill="var(--ink-faint)"
                      opacity="0.55"
                    />
                  );
                })}
              </>
            )}
          </svg>
        </div>

        {/* Peak and trough callouts, in HTML so they keep real type sizes. */}
        {callouts.map((mark) => (
          <div
            key={mark.value}
            className="pointer-events-none absolute -translate-y-full pb-1.5"
            style={{
              left: `${(mark.index / lastIndex) * 100}%`,
              top: `${(yAt(mark.value) / (showRain ? VIEW_H : PLOT_BOTTOM + 4)) * 100}%`,
              transform: clampX(mark.index),
            }}
          >
            <span
              className="tabular text-sm font-medium"
              style={{ color: temperatureColor(mark.value) }}
            >
              {roundTemp(mark.value)}&deg;
            </span>
          </div>
        ))}

        {showRain && (
          <p className="mt-1 text-xs text-ink-faint">Chance of rain, by hour</p>
        )}

        {/* Hour axis: every sixth hour on a phone, every third from md up. */}
        <div className="relative mt-3 h-4">
          {hours.map((hour, index) => {
            const isLast = index === lastIndex;
            if (index % 3 !== 0 && !isLast) return null;
            const sparse = index % 6 === 0 || isLast;
            return (
              <span
                key={hour.time}
                className={`tabular absolute top-0 whitespace-nowrap text-xs ${
                  sparse ? "" : "hidden md:inline"
                } ${hour.isNow ? "font-medium text-ink" : "text-ink-faint"}`}
                style={{
                  left: `${(index / lastIndex) * 100}%`,
                  transform: clampX(index),
                }}
              >
                {hour.isNow ? "Now" : hourLabel(hour.time)}
              </span>
            );
          })}
        </div>
      </figure>
    </section>
  );
}
