import { ConnectionName, Coordinate, UiLayout } from "trainbrain-shared";
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

// Update the start position of the track layout. This includes the heading (i.e the orientation)
export async function setStartPosition(coordinate: Coordinate): Promise<UiLayout> {
  const data = await apiCall<UiLayout>("PUT", "/layout/start-position", coordinate);
  return data;
}

// Insert a track piece in the layout
export async function insertTrackPiece(insertedPieceInfo: InsertedPieceInfo): Promise<UiLayout> {
  const data = await apiCall<UiLayout>("POST", "/layout/piece", insertedPieceInfo);
  return data;
}
