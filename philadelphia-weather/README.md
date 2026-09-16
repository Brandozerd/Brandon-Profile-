# Philadelphia Weather

A single-screen weather app for Philadelphia, built with Next.js and Tailwind CSS.

Live forecast data comes from [Open-Meteo](https://open-meteo.com/), which is
keyless for non-commercial use. There is nothing to configure and no API key to
manage.

```bash
npm install
npm run dev
```

## How it works

The page is a Server Component. It calls Open-Meteo once on the server, so the
browser never makes a cross-origin request and no key is ever exposed. The
response is cached for 15 minutes at the fetch layer, roughly matching how often
the upstream model updates.

The route renders per request (`dynamic = "force-dynamic"`) rather than being
prerendered at build time. Statically generating it would bake a build-time
network failure into the page and serve that error to every visitor until it
revalidated.

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
src/
  app/          page (server), layout, loading skeleton, tokens
  components/   Now, HourlyCurve, SevenDay, Conditions, SunArc
  lib/          Open-Meteo client, WMO code table, curve maths, formatters
```

Timestamps arrive from Open-Meteo as Philadelphia wall-clock with no offset.
`lib/format.ts` rebuilds them in UTC before formatting so the displayed time is
correct regardless of the server's own timezone.
