/**
 * Generate a unique, prefixed client-side id (e.g. `member-...`, `role-...`).
 *
 * Used when creating new project items in the UI before they are persisted.
 *
 * @param {string} prefix - Short namespace describing the item kind.
 * @returns {string} A collision-resistant id.
 */
export function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
