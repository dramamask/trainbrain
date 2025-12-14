import { FullLayoutPiece } from "./layout.js";
import { TrackPieceDef } from "./piecedefinitions.js";

// Returns the end coordinates and angle of a track piece based on the previous piece
// and the current piece definition.
export function getEndCoordinates(previousPiece: FullLayoutPiece | undefined, pieceDef: TrackPieceDef):
    { x: number; y: number; direction: number }
{
    // Starting coordinates and direction, bassed on the previous piece in the layout
    const startX = previousPiece ? previousPiece.coordinates.end.x : 0;
    const startY = previousPiece ? previousPiece.coordinates.end.y : 0;
    const startDirection = previousPiece ? previousPiece.endDirection : 0;

    // Calculate the new coordinates based on the piece definition
    let x = 0;
    let y = 0;
    let direction = 0;

    switch(pieceDef.type) {
        case "straight":
            x = 0;
            y = pieceDef.length ?? 0;
            break;
        case "curve":
            const radius = pieceDef.radius || 0;
            x = round(radius * Math.sin(degreesToRadians(pieceDef.angle)));
            y = round(radius * Math.cos(degreesToRadians(pieceDef.angle)));
            break;
        default:
            throw new Error(`Unknown piece type: ${pieceDef.type}`);
    }

    return {
        x: startX + x,
        y: startY + y,
        direction: (startDirection + pieceDef.angle), // TODO: take the layout direction into account

    }
}

// Convert from degrees to radians
function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

// Round a number to two decimal places
function round(value: number): number {
    return Math.round(value * 100) / 100;
}