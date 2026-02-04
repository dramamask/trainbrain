import { PieceDefCurveAttributes, PieceDefData } from "trainbrain-shared";
import { store as pieceDefStore } from "@/app/services/stores/piecedefs";

const CURVE = "curve";

export interface PieceDefWithId {
  id: string;
  pieceDef: PieceDefData;
}

/**
 * Return an array of piece definitions to display in the UI
 * Note that this list will contain more entries than the piece def list
 * we got from the server. We add extra items for the convenience of the
 * UI user. The extra items are copies of the same piece def, but with a
 * different orientation.
 */
export function getUiPieceDefList(): PieceDefWithId[] {
  const list: PieceDefWithId[] = [];

  Object.entries(pieceDefStore.getPieceDefList()).forEach(([id, definition]) => {
    list.push({
      id: id,
      pieceDef: definition,
    });

    // In case of a curve, add a copy of the piece def with the "left" orientation
    if (definition.category == CURVE) {
     const copy = structuredClone(definition)
     const attributes = (copy.attributes as PieceDefCurveAttributes);
     attributes.orientation = "left";
     list.push({
       id: id,
       pieceDef: copy,
     })
    }
  });

  return list;
}
