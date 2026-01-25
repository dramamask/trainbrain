import { PieceDefDataList } from "trainbrain-shared";
import { apiGet } from "./api";

// Return a structure that contains the track piece definitions
// These are the track pieces that can be added to the track layout
export async function getPieceDef(): Promise<PieceDefDataList> {
  const data = await apiGet<PieceDefDataList>("/piecedefs");
  return data;
}
