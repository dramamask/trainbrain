/**
 * This file contains lowdb related functions
 */

import path from 'node:path';
import { Low } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';
import { TrackLayout } from '../types/layout.js';
import { PieceDefinitions } from '../types/pieces.js';

// Default/empty data structure for the track layout json db
const emptyLayout: TrackLayout = {
  startPosition: {x: 0, y: 0, heading: 0},
  pieces: {},
};

// Default/empty data structure for the piece defintions json db
const emptyPieceDefinitions: PieceDefinitions = {
  definitions: {},
}

// Initialize the databases once
export let trackLayoutDb: Low<TrackLayout>;
export let pieceDefintionsDb: Low<PieceDefinitions>;

try {
  trackLayoutDb = await JSONFilePreset(getDbPath("track-layout.json"), emptyLayout);
  pieceDefintionsDb = await JSONFilePreset(getDbPath("piece-definitions.json"), emptyPieceDefinitions);
} catch (error) {
  const message = "Error initializing DBs";
  console.error(message, error);
  throw new Error(message);
}

// Return the db path for a given db json file name
function getDbPath(fileName: string): string {
  return path.resolve("db",  fileName);
}
