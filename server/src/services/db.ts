// -------------------------------------------
// This file contains lowdb related functions
// -------------------------------------------

import path from 'node:path';
import { Low } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';
import { LayoutPieceData, Pieces } from '../data_types/layoutPieces.js';
import { LayoutNodeData, Nodes } from '../data_types/layoutNodes.js';
import { PieceDefinitions } from '../data_types/pieceDefintions.js';
import { FatalError } from '../errors/FatalError.js';
import { PieceDefDataList } from 'trainbrain-shared';

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
      coordinate: {
        x: 0,
        y: 0,
      }
    }
  }
};

// Initialize the databases once
let pieceDefintionsDb: Low<PieceDefinitions>;
let layoutPiecesDb: Low<Pieces>;
let layoutNodesDb: Low<Nodes>;

try {
  pieceDefintionsDb = await JSONFilePreset(getDbPath("piece-definitions.json"), emptyPieceDefinitions);
  layoutPiecesDb = await JSONFilePreset(getDbPath("layout-pieces.json"), emptyLayoutPieces);
  layoutNodesDb = await JSONFilePreset(getDbPath("layout-nodes.json"), emptyLayoutNodes);

} catch (error) {
  const message = "Error initializing DBs";
  console.error(message, error);
  throw new FatalError(message);
}

// Return the db path for a given db json file name
function getDbPath(fileName: string): string {
  return path.resolve("db",  fileName);
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
 * Write the piece defintions to the DB file
 *
 * @param friendToken Token to ensure that only one specific class method can persist the layout pieces
 */
export async function persistLayoutPieces(friendToken: string): Promise<void> {
  if (friendToken == "Layout::save()") {
    await layoutPiecesDb.write();
    return
  }
  throw new FatalError("DB access is restricted on purpose. Please respect the rules, they are in place for a reason. (2)")
}

/**
 * Write the piece defintions to the DB file
 *
 * @param friendToken Token to ensure that only one specific class method can persist the layout nodes
 */
export async function persistLayoutNodes(friendToken: string): Promise<void> {
  if (friendToken == "NodeFactory::save()") {
    await layoutNodesDb.write();
    return
  }
  throw new FatalError("DB access is restricted on purpose. Please respect the rules, they are in place for a reason. (3)")
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

/**
 * Return the layout pieces data from the DB
 *
 * @param friendToken Token to ensure that only one specific class method can access the layout pieces DB content directly
 * @returns
 */
export function getLayoutPiecesFromDB(friendToken: string): Record<string, LayoutPieceData> {
  if (friendToken == "Layout::init()") {
    return layoutPiecesDb.data.pieces;
  }
  throw new FatalError("DB access is restricted on purpose. Please respect the rules, they are in place for a reason. (5)")
}

/**
 * Return the layout nodes data from the DB
 *
 * @param friendToken Token to ensure that only one specific class method can access the layout nodes DB content directly
 * @returns
 */
export function getLayoutNodesFromDB(friendToken: string): Record<string, LayoutNodeData> {
  if (friendToken == "NodeFactory::init()") {
    return layoutNodesDb.data.nodes;
  }
  throw new FatalError("DB access is restricted on purpose. Please respect the rules, they are in place for a reason. (6)")
}

/**
 * Save the data for a single layout piece to the DB (not persisted, just saved in memory)
 *
 * @param id ID of the layout piece
 * @param data Data for the layout piece
 * @param friendToken Token to ensure that only one specific class method can save layout piece data to the DB
 */
export function saveLayoutPieceData(id: string, data: LayoutPieceData, friendToken: string): void {
  if (friendToken == "LayoutPiece::save()") {
    layoutPiecesDb.data.pieces[id] = data;
    return
  }
  throw new FatalError("DB access is restricted on purpose. Please respect the rules, they are in place for a reason. (7)")
}

/**
 * Save the data for a single layout node to the DB (not persisted, just saved in memory)
 *
 * @param id ID of the layout node
 * @param data Data for the layout node
 * @param friendToken Token to ensure that only one specific class method can save layout node data to the DB
 */
export function saveLayoutNodeData(id: string, data: LayoutNodeData, friendToken: string): void {
  if (friendToken == "LayoutNode::save()") {
    layoutNodesDb.data.nodes[id] = data;
    return
  }
  throw new FatalError("DB access is restricted on purpose. Please respect the rules, they are in place for a reason. (8)")
}

/**
 * Remove the given layout piece from the DB (not persisted, just saved in memory)
 *
 * @param id ID of the layout piece to delete
 * @param friendToken Token to ensure that only one specific class method can save layout node data to the DB
 */
export function deleteLayoutPiece(id: string, friendToken: string): void {
  if (friendToken == "LayoutPiece::delete()") {
    delete layoutPiecesDb.data.pieces[id];
    return
  }
  throw new FatalError("DB access is restricted on purpose. Please respect the rules, they are in place for a reason. (9)")
}
