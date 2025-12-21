/**
 * This file contains some lowdb related functions
 */

import path from 'node:path';
import { TrackLayout } from "../track/layout.js";

// Get default/empty data structure for the tracklayout.json file/db
export function getDefaultData(): TrackLayout {
  const emptyLayout: TrackLayout = {
    "piece-1": { start: {x: 0, y: 0, heading: 0} },
    pieces: {},
  };

  return emptyLayout;
}

// Return the db path for a given db json file name
export function getDbPath(fileName: string): string {
  return path.resolve("db",  fileName);
}
