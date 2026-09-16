import { createElement } from "react";
import type { IconProps } from "@phosphor-icons/react";
import { condition, conditionIcon } from "@/lib/conditions";

/**
 * Renders the Phosphor glyph for a WMO weather code.
 *
 * The lookup goes through `createElement` rather than assigning the result to a
 * capitalised local and rendering `<Icon />`. Both produce the same output, but
 * the latter reads to React's lint rules (and to React itself, on the client)
 * as a component being defined during render, which is a remount hazard.
 * Keeping the indirection in this one wrapper leaves every call site as plain
 * JSX.
 */
export function WeatherGlyph({
  code,
  isDay = true,
  labelled = false,
  ...props
}: { code: number; isDay?: boolean; labelled?: boolean } & IconProps) {
  return createElement(conditionIcon(code, isDay), {
    ...props,
    ...(labelled
      ? { "aria-label": condition(code).label }
      : { "aria-hidden": true }),
  });
}
