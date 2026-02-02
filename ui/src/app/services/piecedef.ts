import { PieceDefData } from "trainbrain-shared";
import { store as pieceDefStore } from "@/app/services/stores/piecedefs";

export interface PieceDefWithName {
  name: string;
  pieceDef: PieceDefData;
}

/**
 * Return an array of piece definitions to display in the UI
 * Note that this list will contain more entries than the piece def list
 * we got from the server. We add extra items for the convenience of the
 * UI user. The extra items are copies of the same piece def, but with a
 * different orientation.
 */
export function getUiPieceDefList(): PieceDefWithName[] {
  return Object.entries(pieceDefStore.getPieceDefList()).map(([name, definition]) => {
    const data = {
      name: name,
      pieceDef: definition,
    }
    return data;
    // TODO: create extra items for the curves. Add name to category maybe?
  });
}
