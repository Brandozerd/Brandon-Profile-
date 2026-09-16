# Philadelphia Weather

A single-screen weather app for Philadelphia, built with Next.js and Tailwind CSS.

**Live site: https://brandozerd.github.io/philadelphia-weather/**

Live forecast data comes from [Open-Meteo](https://open-meteo.com/), which is
keyless for non-commercial use. There is nothing to configure and no API key to
manage.

```bash
npm install
npm run dev
```

## How it works

The site is a fully static Next.js export (`output: "export"`), served as plain
files from GitHub Pages. There is no server and nothing to run.

The forecast is fetched from the browser. Open-Meteo is keyless and sends
permissive CORS headers, so a static page can call it directly with nothing to
proxy and no secret to expose. The page refreshes itself every 15 minutes while
open, and again whenever you switch back to the tab, so a window left open
overnight is never showing yesterday's conditions.

Every push to `main` rebuilds and redeploys through
`.github/workflows/deploy.yml`. A project site lives under `/<repo>`, so the
workflow passes that prefix to the build as `NEXT_PUBLIC_BASE_PATH`; it stays
empty for local development.

## Notes on the design

- **One accent, two modes.** Light and dark both follow `prefers-color-scheme`
  from a single token set in `globals.css`. Every foreground colour clears WCAG
  AA against its own background.
- **Colour encodes temperature.** The hourly curve and the seven-day range bars
  share one sequential ramp (`temperatureColor`), whose warm end is the app's
  accent, so the charts and the interface read as one system.
- **Monotone cubic interpolation.** The temperature curve uses Fritsch-Carlson
  interpolation rather than a plain spline, which would overshoot between close
  readings and draw highs and lows that were never in the data.
- **Labels are HTML, geometry is SVG.** The charts stretch to fit with
  `preserveAspectRatio="none"`, so any text inside them would scale down with
  the viewport. Type is positioned over the top instead and stays legible on a
  phone.
- **Motion never gates content.** Sections animate in on mount, not on scroll.
  A `whileInView` reveal leaves everything below the fold at `opacity: 0` until
  the viewport reaches it, so slow hydration or a JS error renders a blank page.
  Everything collapses to a static render under `prefers-reduced-motion`.
- **No invented numbers.** If the forecast service does not answer, the page
  says so rather than showing placeholder conditions.

## Layout

```
.github/workflows/  Pages build and deploy
src/
  app/              page, layout, design tokens
  components/       Now, HourlyCurve, SevenDay, Conditions, SunArc, skeleton
  lib/              Open-Meteo client, WMO code table, curve maths, formatters
```

Timestamps arrive from Open-Meteo as Philadelphia wall-clock with no offset.
`lib/format.ts` rebuilds them in UTC before formatting, so the page shows
Philadelphia time whether you open it in Philadelphia, London, or Tokyo.
