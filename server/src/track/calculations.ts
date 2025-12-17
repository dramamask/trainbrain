import { Coordinate } from "trainbrain-shared";
import { Direction, LayoutPiece } from "./layout.js";
import { TrackPieceDef } from "./piecedefinitions.js";

// Returns the end coordinates and angle of a track piece based on the previous piece
// and the current piece definition.
export function getEndCoordinates(
    layoutPiece: LayoutPiece,
    pieceDef: TrackPieceDef,
    previousEnd: Coordinate
): Coordinate
{
    // Calculate the new coordinates based on the piece definition
    let dX = 0;
    let dY = 0;
    let endHeading = 0;

    switch(pieceDef.type) {
        case "straight":
            const length = pieceDef.length as number;
            endHeading = previousEnd.heading; // Which is also the start heading in this case
            dX = roundTo2(length * Math.sin(degreesToRadians(endHeading)));
            dY = roundTo2(length * Math.cos(degreesToRadians(endHeading)));
            break;
        case "curve":
            const radius = pieceDef.radius as number;
            const pieceAngle = assignAngleSign(pieceDef.angle as number, layoutPiece.direction as Direction);
            endHeading = previousEnd.heading + pieceAngle;
            dX = roundTo2(radius * (1 - Math.cos(degreesToRadians(endHeading))));
            dY = roundTo2(radius * Math.sin(degreesToRadians(endHeading)));
            break;
        default:
            throw new Error(`Unknown piece type: ${pieceDef.type}`);
    }

    return {
        x: previousEnd.x + dX,
        y: previousEnd.y + dY,
        heading: endHeading,
    }
}

// Convert from degrees to radians
function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

// Round a number to two decimal points
function roundTo2(value: number): number {
    return Math.round(value * 100) / 100;
}

// Return the correct angle, based on the direction that the piece is facing
function assignAngleSign(angle: number, direction: Direction) {
    if (direction == Direction.LEFT) {
        angle = 0 - angle;
    }

    return angle;
}