// -------------------------------------------
// This file contains lowdb related functions
// -------------------------------------------

import path from 'node:path';
import { Low } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';
import { PieceDefinitions } from '../data_types/pieceDefintions.js';
import { FatalError } from '../errors/FatalError.js';
import { PieceDefDataList } from 'trainbrain-shared';

// Default/empty data structure for the piece defintions json db
const emptyPieceDefinitions: PieceDefinitions = {
  definitions: {},
}

// Initialize the databases once
let pieceDefintionsDb: Low<PieceDefinitions>;

try {
  pieceDefintionsDb = await JSONFilePreset(getDbPath("definitions/pieces.json"), emptyPieceDefinitions);
} catch (error) {
  const message = "Error initializing DBs";
  console.error(message, error);
  throw new FatalError(message);
}

// Return the db path for a given db json file name
export function getDbPath(fileName: string): string {
  return path.resolve("db", fileName);
}

/**
 * Write the piece defintions to the DB file
 *
 * @param friendToken Token to ensure that only one specific class method can persist the piece defintions
 */
export async function persistPieceDefs(friendToken: string): Promise<void> {
  if (friendToken == "PieceDefs::save()") {
    await pieceDefintionsDb.write();
  }
  throw new FatalError("DB access is restricted on purpose. Please respect the rules, they are in place for a reason. (1)")
}

/**
 * Return the piece definitions from the DB
 *
 * @param friendToken Token to ensure that only one specific class method can access the piece definitions DB content directly
 * @returns
 */
export function getPieceDefsFromDB(friendToken: string): PieceDefDataList {
  if (friendToken == "PieceDefs::init()") {
    return pieceDefintionsDb.data.definitions;
  }
  throw new FatalError("DB access is restricted on purpose. Please respect the rules, they are in place for a reason. (4)")
}
