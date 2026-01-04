import { AddLayoutPieceData, LayoutPieceData } from "../shared_types/layout.js";
import { trackLayoutDb } from "./db.js";

// Add a piece to the layout
export async function addLayoutPiece(data: AddLayoutPieceData): Promise<void> {
  // // Assemble the layout piece data
  // const layoutPieceData: LayoutPieceData = {
  //   type: data.pieceDefId,
  //   attributes: data.layoutAttributes,
  //   connections: {}, // TODO: is there a better way to store connections so i don't have to redo the whole thing?
  // }

  // // Add the piece to the layout db
  // trackLayoutDb.data.pieces.splice(data.beforeOrAfterId, layoutPieceData);

  // // Tell the layout class to re-import from the layout db
}