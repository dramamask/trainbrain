/**
 * Config for UI
 */

const COLOR1 = "#FFD700";
const COLOR1_HIGHLIGHT = "white";
const COLOR2_HIGHLIGHT = "red";
const COLOR3 = "blue";
const GOLD = "#FFD700";
const OAK = "#6F5339";

// Track drawing
export const STROKE_WIDTH = 80;
export const DEADEND_INDICATOR_LENGTH = 220;
export const MIN_BOUNDING_BOX_SIZE = 100;

export const RAIL_COLOR = GOLD;
export const RAIL_WIDTH = 7;
export const SLEEPER_COLOR = OAK;
export const SLEEPER_WIDTH = 12;
export const EDIT_MODE_TRACK_COLOR = COLOR1;
export const SELECTED_TRACK_COLOR = COLOR1_HIGHLIGHT;

export const NODE_RADIUS = 100;
export const NODE_COLOR = COLOR1;
export const SELECTED_NODE_COLOR = COLOR2_HIGHLIGHT;

export const MEASURE_COLOR = COLOR3;
export const MEASURE_STROKE_WIDTH = 20;
export const MEASURE_LINE_SIZE = 200;

// Increment to move the track by if moving with keyboard shortcut
export const MOVE_INCREMENT = 15; // Millimeters
export const BIG_MOVE_INCREMENT = 150; // Millimeters
export const ROTATE_INCREMENT = 15; // Degrees

/**
 * Configuration definition
 */
const config = {
  increments: {
    move: 15, // millimeters
    bigMove: 150, // millimeters
    rotate: 15, // degrees
  }
}

/**
 * Returns a configuration
 */
function get(name: string): string | number {
  const names = name.split(".").map(name => name.trim());
  if (names.length > 2) {
    throw new Error("Too many config levels. Only two depth levels possible.");
  }

  let value;
  try {
    // Assert the first key to get the sub-object
    const subConfig = config[names[0] as keyof typeof config];

    // Now TypeScript can correctly infer the keys available on 'subConfig'
    value = subConfig[names[1] as keyof typeof subConfig];
  } catch (error) {
    throw new Error("Someone is attempting to get a non-existing configuration value");
  }

  return value;
}