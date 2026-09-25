/** Shared first-party inspect providers; each creator composition retains its own tools. */
const inspectLeases = new WeakMap();
/**
 * Acquire one Host's shared provider set; release it only after the final caller disposes.
 * Registration failure unwinds the partial set and never publishes a lease.
 * @param root Host root context, identical across preset scopes.
 * @param providers Factory for root-owned, request-agent-aware inspect providers.
 * @param register Registry registration returning a disposer.
 * @returns Idempotent release callback for the calling composition's effect.
 */
export function acquireInspectProviders(root, providers, register) {
  let entry = inspectLeases.get(root);
  if (!entry) {
    const disposers = [];
    try {
      for (const provider of providers()) disposers.push(register(provider));
    } catch (error) {
      for (const dispose of disposers.reverse()) dispose();
      throw error;
    }
    entry = { users: 0, disposers };
    inspectLeases.set(root, entry);
  }
  entry.users++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--entry.users === 0) {
      inspectLeases.delete(root);
      for (const dispose of entry.disposers.toReversed()) dispose();
    }
  };
}
