// Make sure the angle is always in the 0 to 359 degree range
  export function normalizeAngle(angle: number): number {
    return (angle % 360);
  }
