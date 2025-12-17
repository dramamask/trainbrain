import layoutData from "../config/track/layout.json" with { type: "json" };
import { getPieceDefinition, TrackPieceDef } from "./piecedefinitions.js";
import { getEndCoordinates } from "./calculations.js";

// Define direction const. Can be used in code as Direction.LEFT and Direction.RIGHT
export const Direction = {
    LEFT: "left",
    RIGHT: "right",
} as const;

// Define the structure of a layout piece as defined in the layout config file
export interface LayoutPiece {
  type: string;
  direction: "left" | "right" | null;
}

// Cast the imported layout pieces to the appropriate type
const layout = layoutData.pieces as Array<LayoutPiece>;

// Define the structure of a layout piece that we return in the getLayout function
export interface UiLayoutPiece {
  id: number;
  type: "straight" | "curve";
  start: { x: number; y: number };
  end: { x: number; y: number };
  radius: number | null;
  direction: { start: number; end: number };
};

// Function to get the entire track layout
export function getLayout(): UiLayoutPiece[] {
  const uiLayout: UiLayoutPiece[] = [];

  try {
    layout.forEach((layoutPiece: LayoutPiece) => {
      const pieceDef: TrackPieceDef = getPieceDefinition(layoutPiece.type);
      const previousUILayoutPiece: UiLayoutPiece | undefined = uiLayout.at(-1);
      const endCoordinates = getEndCoordinates(layoutPiece, pieceDef, previousUILayoutPiece);

      const fullLayoutPiece: UiLayoutPiece = {
                    id:
                    type:
                    start: {
                        x: fullLayoutDefinition.at(-1)?.coordinates.end.x || 0,
                        y: fullLayoutDefinition.at(-1)?.coordinates.end.y || 0,
                    },
                    end: {
                        x: endCoordinates.x,
                        y: endCoordinates.y
                    }
                    radius:
                    direction: endCoordinates.direction
            };
            fullLayoutDefinition.push(fullLayoutPiece);
        });
    } catch(error) {
        throw new Error("Failed to get layout: " + (error as Error).message);
    }

    return fullLayoutDefinition;
}
