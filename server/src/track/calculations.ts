import { Direction, LayoutPiece, UiLayoutPiece } from "./layout.js";
import { TrackPieceDef } from "./piecedefinitions.js";

// Returns the end coordinates and angle of a track piece based on the previous piece
// and the current piece definition.
export function getEndCoordinates(
    layoutPiece: LayoutPiece,
    pieceDef: TrackPieceDef,
    previousPiece: UiLayoutPiece | undefined
):
    { x: number; y: number; direction: number }
{
    // Starting coordinates and direction, bassed on the previous piece in the layout
    const startX = previousPiece ? previousPiece.end.x : 0;
    const startY = previousPiece ? previousPiece.end.y : 0;
    const startDirection = previousPiece ? previousPiece.direction.end : 0;

    // Calculate the new coordinates based on the piece definition
    let x = 0;
    let y = 0;
    let angle = 0;

    switch(pieceDef.type) {
        case "straight":
            x = 0;
            y = pieceDef.length as number;
            break;
        case "curve":
            const radius = pieceDef.radius as number;
            angle = assignAngleSign(pieceDef.angle as number, pieceDef.direction as Direction);
            x = round(radius * Math.sin(degreesToRadians(angle)));
            y = round(radius * Math.cos(degreesToRadians(angle)));
            break;
        default:
            throw new Error(`Unknown piece type: ${pieceDef.type}`);
    }

    return {
        x: startX + x,
        y: startY + y,
        direction: (startDirection + angle), // TODO: take the layout direction into account

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

// Return the correct angle, based on the direction that the piece is facing
function assignAngleSign(angle: number, direction: string) {
    if (direction == Direction.LEFT) {
        angle = 0 - angle;
    }

    return angle;
}