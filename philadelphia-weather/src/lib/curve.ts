/**
 * Monotone cubic interpolation (Fritsch-Carlson).
 *
 * A plain Catmull-Rom spline overshoots between close-together points, which on
 * a temperature chart invents highs and lows that were never in the data. The
 * monotone variant constrains the tangents so the curve only turns where the
 * readings actually turn.
 *
 * Reference: Fritsch & Carlson (1980), "Monotone Piecewise Cubic Interpolation".
 */

export interface Point {
  x: number;
  y: number;
}

function monotoneTangents(points: Point[]): number[] {
  const n = points.length;
  const secants: number[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    const dx = points[i + 1].x - points[i].x;
    secants.push(dx === 0 ? 0 : (points[i + 1].y - points[i].y) / dx);
  }

  const tangents: number[] = new Array(n);
  tangents[0] = secants[0] ?? 0;
  tangents[n - 1] = secants[n - 2] ?? 0;

  for (let i = 1; i < n - 1; i += 1) {
    const previous = secants[i - 1];
    const next = secants[i];
    // A sign change means this point is a local extreme: flatten it so the
    // curve turns here rather than swinging past the reading.
    tangents[i] = previous * next <= 0 ? 0 : (previous + next) / 2;
  }

  for (let i = 0; i < n - 1; i += 1) {
    const secant = secants[i];
    if (secant === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const alpha = tangents[i] / secant;
    const beta = tangents[i + 1] / secant;
    const magnitude = Math.hypot(alpha, beta);
    // Keep the tangents inside the Fritsch-Carlson monotonicity region.
    if (magnitude > 3) {
      const scale = 3 / magnitude;
      tangents[i] = scale * alpha * secant;
      tangents[i + 1] = scale * beta * secant;
    }
  }

  return tangents;
}

/** Build an SVG path command string through every point, without overshoot. */
export function smoothPath(points: Point[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const tangents = monotoneTangents(points);
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const third = (next.x - current.x) / 3;
    const c1x = current.x + third;
    const c1y = current.y + tangents[i] * third;
    const c2x = next.x - third;
    const c2y = next.y - tangents[i + 1] * third;
    path += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
  }

  return path;
}
