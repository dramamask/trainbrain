import { Coordinate, UiLayoutPiece } from "trainbrain-shared";
import layoutData from "../config/track/layout.json" with { type: "json" };
import { getPieceDefinition, TrackPieceDef } from "./piecedefinitions.js";
import { getEndCoordinates } from "./calculations.js";

// Define direction const. Can be used in code as Direction.LEFT and Direction.RIGHT
// This is a value.
export const Direction = {
    LEFT: "left",
    RIGHT: "right",
} as const;

// Define direction type.
export type Direction = typeof Direction[keyof typeof Direction];

// The structure of a layout piece as defined in the layout config file
export interface LayoutPiece {
  type: string;
  direction: Direction | null;
}

// Cast the imported layout pieces to the appropriate type
const layout = layoutData.pieces as Array<LayoutPiece>;

// The structure that we return from the GET layout API call
export interface UiLayout {
  meta: {
    warning: string;
  };
  pieces: UiLayoutPiece[];
}

// Calculate the UI Layout and return it as an array of UiLayoutPieces
function getUiLayout(trackStart: Coordinate): UiLayoutPiece[] {
  const uiLayout: UiLayoutPiece[] = [];

  try {
    layout.forEach((layoutPiece: LayoutPiece, index) => {
      const pieceDef: TrackPieceDef = getPieceDefinition(layoutPiece.type);
      const previousUILayoutPiece: UiLayoutPiece | undefined = uiLayout.at(-1);

      const startX = previousUILayoutPiece ? previousUILayoutPiece.end.x : trackStart.x;
      const startY = previousUILayoutPiece ? previousUILayoutPiece.end.y : trackStart.y;
      const startHeading = previousUILayoutPiece ? previousUILayoutPiece.end.heading : trackStart.heading;

      const endCoordinates = getEndCoordinates(
        layoutPiece,
        pieceDef,
        {x: startX, y: startY, heading: startHeading}
      );

      const uiLayoutPiece: UiLayoutPiece = {
        id: index,
        type: pieceDef.type,
        start: { x: startX, y: startY, heading: startHeading },
        end: { x: endCoordinates.x, y: endCoordinates.y, heading: endCoordinates.heading},
        radius: pieceDef.radius,
      };
      uiLayout.push(uiLayoutPiece);
    });
  } catch(error) {
    throw new Error("Failed to get layout: " + (error as Error).message);
  }

  return uiLayout;
}

// Return the UiLayout structure as needed by the API
export function getLayout(trackStart: Coordinate): UiLayout {
  const uiLayout: UiLayoutPiece[] = getUiLayout(trackStart);
  let warning = "";

  if (trackStart.x == 0 && trackStart.y == 0 && trackStart.heading == 0) {
    warning = "Track starts at coordinate (0, 0), with heading 0 degrees. ";
    warning += "Provide proper coordinates as query parameters if you want different start coordinates ";
    warning += "(which you likely do). Example query paramters for start coordinate: ";
    warning += "'?x=1000&y=1500&heading=90'";
  }

  return {
    meta: {
      warning: warning,
    },
    pieces: uiLayout,
  }
}
