// Splits "/assets/:id/tags" into typed segments; pure, no express needed.
export function parseRoute(path) {
  return path.split('/').filter(Boolean).map((seg) =>
    seg.startsWith(':') ? { param: seg.slice(1) } : { literal: seg });
}
