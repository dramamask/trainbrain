import layoutData from "../config/track/layout.json" with { type: "json" };
import { getPieceDefinition, TrackPieceDef } from "./piecedefinitions.js";
import { getEndCoordinates } from "./calculations.js";

// Define the structure of a layout piece as defined in the layout config file
interface LayoutPiece {
    type: string;
    direction: "left" | "right" | null;
}

// Cast the imported layout pieces to the appropriate type
const layout = layoutData.pieces as Array<LayoutPiece>;

// Define the structure of a layout piece that we return in the getLayout function
export interface FullLayoutPiece extends LayoutPiece {
    definition: TrackPieceDef;
    coordinates: {
        start: {
            x: number;
            y: number;
        };
        end: {
            x: number;
            y: number
        };
    };
    endDirection: number;
}

// Function to get the entire track layout
export function getLayout(): FullLayoutPiece[] {
    const fullLayoutDefinition: FullLayoutPiece[] = [];

    try {
        layout.forEach((piece: LayoutPiece) => {
            const pieceDef: TrackPieceDef = getPieceDefinition(piece.type);
            const previousPiece: FullLayoutPiece | undefined = fullLayoutDefinition.at(-1);
            const endCoordinates = getEndCoordinates(previousPiece, pieceDef);

            const fullLayoutPiece: FullLayoutPiece = {
                ...piece,
                definition: pieceDef,
                coordinates: {
                    start: {
                        x: fullLayoutDefinition.at(-1)?.coordinates.end.x || 0,
                        y: fullLayoutDefinition.at(-1)?.coordinates.end.y || 0,
                    },
                    end: {
                        x: endCoordinates.x,
                        y: endCoordinates.y
                    }
                },
                endDirection: endCoordinates.direction
            };
            fullLayoutDefinition.push(fullLayoutPiece);
        });
    } catch(error) {
        throw new Error("Failed to get layout: " + (error as Error).message);
    }

    return fullLayoutDefinition;
}
