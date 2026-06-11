// dispatch-order.mjs — provider-first dispatch order from a repo profile's
// internal dependency edges (B2 → B8, §9.3).
//
// The blueprint carries the ORDER, not the graph: the orchestrator needs to
// know what to dispatch first, not why. deriveDispatchOrder is the only
// sanctioned producer of dispatch_rules.dispatch_order — the synthesizer
// computes it, never hand-orders (DD-2: derived data, single mechanism).

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// layers: profile layers[] (order is the tie-break authority);
// internalEdges: profile internalEdges[] ({ from: consumer, to: provider }).
// Returns { order, errors } error-string-array style:
//   order = [] when there are no edges — no internal ordering constraints;
//   otherwise a total topological order of ALL layer names in which every
//   provider precedes its consumers, so dispatching any scope subset in this
//   order is provider-first. Tie-break, for determinism: among ready layers,
//   providers (layers something depends on) before non-providers, then
//   profile layer order. A dependency cycle yields { order: null, errors }
//   — declared manifests can express one even if tooling would reject it.
export function deriveDispatchOrder(layers, internalEdges) {
  if (!Array.isArray(layers) || !Array.isArray(internalEdges)) {
    return { order: null, errors: ['layers and internalEdges must be arrays'] };
  }
  if (internalEdges.length === 0) return { order: [], errors: [] };

  const names = layers.map((l) => (isPlainObject(l) ? l.name : undefined));
  const providersOf = new Map(names.map((n) => [n, new Set()]));
  const providers = new Set();
  for (const edge of internalEdges) {
    if (!isPlainObject(edge)) continue; // shape errors are validateRepoProfile's job
    providersOf.get(edge.from)?.add(edge.to);
    if (providersOf.has(edge.to)) providers.add(edge.to);
  }

  const order = [];
  const emitted = new Set();
  while (order.length < names.length) {
    const ready = names.filter(
      (n) => !emitted.has(n) && [...providersOf.get(n)].every((p) => emitted.has(p) || !providersOf.has(p)),
    );
    if (ready.length === 0) {
      const stuck = names.filter((n) => !emitted.has(n));
      return { order: null, errors: [`internalEdges contain a dependency cycle among: ${stuck.join(', ')}`] };
    }
    const next = ready.find((n) => providers.has(n)) ?? ready[0];
    emitted.add(next);
    order.push(next);
  }
  return { order, errors: [] };
}

// Human form for the orchestrator template's dispatch-order slot (injected
// at instantiation alongside the name/tools/model-tier/turn-limit quartet).
export function renderDispatchOrder(order) {
  return Array.isArray(order) && order.length > 0
    ? order.join(' → ')
    : 'no internal ordering constraints';
}
