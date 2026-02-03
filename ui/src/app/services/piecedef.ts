import { PieceDefCurveAttributes, PieceDefData } from "trainbrain-shared";
import { store as pieceDefStore } from "@/app/services/stores/piecedefs";

const CURVE = "curve";

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
  const list: PieceDefWithName[] = [];

  Object.entries(pieceDefStore.getPieceDefList()).forEach(([name, definition]) => {
    list.push({
      name: name,
      pieceDef: definition,
    });

    // In case of a curve, add a copy of the piece def with the "left" orientation
    if (definition.category == CURVE) {
     const copy = structuredClone(definition)
     const attributes = (copy.attributes as PieceDefCurveAttributes);
     attributes.orientation = "left";
     list.push({
       name: name,
       pieceDef: copy,
     })
    }
  });

  return list;
}
