import { pieceDefintionsDb } from "../services/db.js";
import { TrackPieceDef } from "../types/pieces.js";

// Function to get a piece definition by its ID
export function getPieceDefinition(pieceDefId: string): TrackPieceDef {
    const pieceDef = pieceDefintionsDb.data.definitions[pieceDefId];

    if (!pieceDef) {
        throw new Error(`Piece definition not found for ID ${pieceDefId}`);
    }

    return pieceDef;
}
