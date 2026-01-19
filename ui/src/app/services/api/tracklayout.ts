import { AddLayoutPieceData, UiLayout, UpdateNodeData } from "trainbrain-shared";
import { apiGet, apiCall } from "./api";

// Get the track layuot structure
export async function getTrackLayout(): Promise<UiLayout> {
  const data = await apiGet<UiLayout>("/layout");
  return data;
}

// Update the position and/or heading of a layout node.
// Note that this will also update the position and heading of all connected track pieces.
export async function updateNode(data: UpdateNodeData): Promise<UiLayout> {
  const retVal = await apiCall<UiLayout>("PUT", `/layout/node/${data.index}`, data);
  return retVal;
}

// Add a track piece to the layout
export async function addTrackPiece(data: AddLayoutPieceData): Promise<UiLayout> {
  const retVal = await apiCall<UiLayout>("POST", "/layout/piece", data);
  return retVal;
}

// Delete a track piece from the layout
export async function deleteTrackPiece(pieceId: string): Promise<UiLayout> {
  const url = "/layout/piece/" + pieceId;
  const retVal = await apiCall<UiLayout>("DELETE", url, {});
  return retVal;
}

// Delete a track piece from the layout
export async function rotateTrackPiece(pieceId: string): Promise<UiLayout> {
  const url = "/layout/piece/rotate/" + pieceId;
  const retVal = await apiCall<UiLayout>("PUT", url, {});
  return retVal;
}
