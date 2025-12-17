import pieceDefinitionData from "../config/track/piece-definitions.json" with { type: "json" };

// Define the structure of a track piece definition
export interface TrackPieceDef {
    type: string;
    length: number | null;
    angle: number | null;
    radius: number | null;
}

// Cast the imported piece definitions to the appropriate type
const pieceDefinitions = pieceDefinitionData.definitions as Record<string, TrackPieceDef>;

// Function to get a piece definition by its ID
export function getPieceDefinition(pieceDefId: string): TrackPieceDef {
    const pieceDef = pieceDefinitions[pieceDefId];

    if (!pieceDef) {
        throw new Error(`Piece definition not found for ID: ${pieceDefId}`);
    }

    return pieceDef;
}
