// Small, bounded queue for one-shot mobile actions.
// Multiple fingers or very fast taps must never create an unbounded backlog.
export function enqueueMobileAction(queue, action, limit = 8) {
  if (!Array.isArray(queue) || typeof action !== "string" || !action) return false;
  if (queue.includes(action)) return false;
  const safeLimit = Math.max(1, Math.floor(Number(limit) || 8));
  while (queue.length >= safeLimit) queue.shift();
  queue.push(action);
  return true;
}

export function consumeMobileAction(queue, action) {
  if (!Array.isArray(queue)) return false;
  const index = queue.indexOf(action);
  if (index < 0) return false;
  queue.splice(index, 1);
  return true;
}
