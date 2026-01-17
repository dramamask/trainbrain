import { ConnectionName, Coordinate, UiLayout, UiLayoutNode } from "trainbrain-shared";
import { apiGet, apiCall } from "./api";

interface InsertedPieceInfo {
  connectionName: ConnectionName,
  connectToPiece: string,
  pieceDefId: string,
  layoutAttributes: object,
}

// Get the track layuot structure
export async function getTrackLayout(): Promise<UiLayout> {
  const data = await apiGet<UiLayout>("/layout");
  return data;
}

// Update the position and/or heading of a layout node.
// Note that this will also update the position and heading of all connected track pieces.
export async function updateNode(nodeData: UiLayoutNode): Promise<UiLayout> {
  const data = await apiCall<UiLayout>("PUT", `/layout/node/${nodeData.id}`, nodeData.coordinate);
  return data;
}

// Insert a track piece in the layout
export async function insertTrackPiece(insertedPieceInfo: InsertedPieceInfo): Promise<UiLayout> {
  const data = await apiCall<UiLayout>("POST", "/layout/piece", insertedPieceInfo);
  return data;
}

// Delete a track piece from the layout
export async function deleteTrackPiece(pieceId: string): Promise<UiLayout> {
  const url = "/layout/piece/" + pieceId;
  const data = await apiCall<UiLayout>("DELETE", url, {});
  return data;
}

// Delete a track piece from the layout
export async function rotateTrackPiece(pieceId: string): Promise<UiLayout> {
  const url = "/layout/piece/rotate/" + pieceId;
  const data = await apiCall<UiLayout>("PUT", url, {});
  return data;
}
