/** Board math helpers used by both the store and UI components. */

export const YELLOW_INTERVAL = 5;
export const DANGER_ZONE_SIZE = 5;

export function isYellowSpace(position) {
  return position > 0 && position % YELLOW_INTERVAL === 0;
}

export function crossedYellow(oldPos, newPos) {
  for (let p = oldPos + 1; p <= newPos; p++) {
    if (isYellowSpace(p)) return true;
  }
  return false;
}

export function isDangerZone(position, boardLength) {
  return position >= boardLength - DANGER_ZONE_SIZE;
}
