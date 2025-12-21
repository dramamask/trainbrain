import { TrackPieceType } from 'trainbrain-shared';
import { pieceDefintionsDb } from "../services/db.js";

// The structure of a track piece definition
export interface TrackPieceDef {
    type: TrackPieceType;
    length: number | null;
    angle: number | null;
    radius: number | null;
}

export type TrackPieceDefList = Record<string, TrackPieceDef>;

// The structure of the piece-defintions json db
export interface PieceDefinitions {
    definitions: TrackPieceDefList;
}

// Function to get a piece definition by its ID
export function getPieceDefinition(pieceDefId: string): TrackPieceDef {
    const pieceDef = pieceDefintionsDb.data.definitions[pieceDefId];

    if (!pieceDef) {
        throw new Error(`Piece definition not found for ID ${pieceDefId}`);
    }

    return pieceDef;
}
