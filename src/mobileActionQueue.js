// Mobile controls are defined once so the rendered buttons and hit targets
// cannot drift apart as the layout changes.
export const MOBILE_ACTION_BUTTONS = [
  { action: "special1", label: "EXTRA 1", x: 580, y: 340, radius: 48 },
  { action: "special2", label: "EXTRA 2", x: 680, y: 340, radius: 48 },
  { action: "special3", label: "EXTRA 3", x: 780, y: 340, radius: 48 },
  { action: "cyclePower", label: "POWER", x: 880, y: 340, radius: 48 },
  { action: "super", label: "SUPER", x: 650, y: 448, radius: 68 },
  { action: "attack", label: "FIRE", x: 765, y: 448, radius: 68 },
  { action: "jump", label: "JUMP", x: 885, y: 448, radius: 75 }
];

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
