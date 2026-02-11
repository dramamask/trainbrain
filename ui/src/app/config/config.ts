/**
 * Color definitions
 */
const COLOR1 = "#FFD700";
const COLOR1_HIGHLIGHT = "white";
const COLOR2 = "blue";
const GOLD = "#FFD700";
const OAK = "#6F5339";

/**
 * Configuration definitions
 */
const config = {
  increments: {
    move: 15, // millimeters
    bigMove: 150, // millimeters
    rotate: 15, // degrees
  },
  rail: {
    color: GOLD,
    width: 7, // mm
  },
  sleeper: {
    color: OAK,
    width: 12, // mm
  },
  measure: {
    color: COLOR2,
    strokeWidth: 20, // mm
    lineSize: 200, // mm
  },
  editMode: {
    nodeRadius: 100, // mm
    nodeColor: COLOR1,
    selectedNodeColor: COLOR1_HIGHLIGHT,
    selectedTrackColor: COLOR1_HIGHLIGHT,
    trackColor: COLOR1, // mm
    strokeWidth: 80, // mm
  },
}

/**
 * Returns a configuration
 */
export function get(name: string): string | number {
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
