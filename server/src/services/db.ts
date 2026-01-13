// -------------------------------------------
// This file contains lowdb related functions
// -------------------------------------------

import path from 'node:path';
import { Low } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';
import { Pieces } from '../data_types/layoutPieces.js';
import { Nodes } from '../data_types/layoutNodes.js';
import { PieceDefinitions } from '../data_types/pieceDefintions.js';

// Default/empty data structure for the piece defintions json db
const emptyPieceDefinitions: PieceDefinitions = {
  definitions: {},
}

// Default/empty data structure for the track layout json db
const emptyLayoutPieces: Pieces = {
  pieces: {}
};

const emptyLayoutNodes: Nodes = {
  nodes: {
    "0": {
      pieces: [],
      coordinate: {
        x: 0,
        y: 0,
        heading: 0,
      }
    }
  }
};

// Initialize the databases once
export let pieceDefintionsDb: Low<PieceDefinitions>;
export let layoutPiecesDb: Low<Pieces>;
export let layoutNodesDb: Low<Nodes>;

try {
  pieceDefintionsDb = await JSONFilePreset(getDbPath("piece-definitions.json"), emptyPieceDefinitions);
  layoutPiecesDb = await JSONFilePreset(getDbPath("layout-pieces.json"), emptyLayoutPieces);
  layoutNodesDb = await JSONFilePreset(getDbPath("layout-nodes.json"), emptyLayoutNodes);

} catch (error) {
  const message = "Error initializing DBs";
  console.error(message, error);
  throw new Error(message);
}

// Return the db path for a given db json file name
function getDbPath(fileName: string): string {
  return path.resolve("db",  fileName);
}
