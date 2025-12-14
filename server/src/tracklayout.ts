import layoutData from "./config/track/layout.json" with { type: "json" };
import { getPieceDefinition, TrackPieceDef } from "./trackpiecedefinitions.js";

// Define the structure of a layout piece as defined in the layout config file
interface LayoutPiece {
    id: number;
    type: string;
    connections: number[];
}

// Cast the imported layout pieces to the appropriate type
const layout = layoutData.pieces as Array<LayoutPiece>;

// Define the structure of a layout piece that we return in the getLayout function
interface FullLayoutPiece extends LayoutPiece {
    definition: TrackPieceDef
    coordinates: {
        start: {
            x: number;
            y: number;
        };
        end: {
            x: number;
            y: number;
        };
    };
}

// Function to get the entire track layout
export function getLayout(): FullLayoutPiece[] {
    const fullLayoutDefinition: FullLayoutPiece[] = [];

    try {
        layout.forEach((piece: LayoutPiece) => {
            const pieceDef = getPieceDefinition(piece.type);
            const fullLayoutPiece: FullLayoutPiece = {
                ...piece,
                definition: pieceDef,
                coordinates: {
                    start: {
                        x: 0,
                        y: 0
                    },
                    end: {
                        x: 0,
                        y: 0
                    }
                }
            };
            fullLayoutDefinition.push(fullLayoutPiece);
        });
    } catch(error) {
        throw new Error("Failed to get layout: " + (error as Error).message);
    }

    return fullLayoutDefinition;
}
