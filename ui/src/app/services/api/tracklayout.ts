import { AddLayoutPieceData, AddNodeData, DeleteLayoutElementData, MovePieceData, UiLayout, UpdateNodeData } from "trainbrain-shared";
import { apiGet, apiCall } from "./api";

// Get the track layuot structure
export async function getTrackLayout(): Promise<UiLayout> {
  const data = await apiGet<UiLayout>("/layout");
  return data;
}

// Update the position and/or heading of a layout node.
// Note that this will also update the position and heading of all connected layout nodes and pieces.
export async function updateNode(data: UpdateNodeData): Promise<UiLayout> {
  const retVal = await apiCall<UiLayout>("PUT", `/layout/node/${data.index}`, data);
  return retVal;
}

// Add a node to the layout
export async function addNode(data: AddNodeData): Promise<UiLayout> {
  const retVal = await apiCall<UiLayout>("POST", "/layout/node", data);
  return retVal;
}

// Disconnect the two pieces connected to this node, returns an error if the node does not have two pieces connected to it.
export async function disconnectNode(nodeId: string): Promise<UiLayout> {
  const retVal = await apiCall<UiLayout>("PUT", `/layout/node/disconnect/${nodeId}`, {});
  return retVal;
}

// Update the position of a layout piece.
// Note that this will also update the position of all connected alyout nodes and pieces.
export async function movePiece(data: MovePieceData): Promise<UiLayout> {
  const retVal = await apiCall<UiLayout>("PUT", `/layout/piece/${data.index}`, data);
  return retVal;
}

// Add a track piece to the layout
export async function addTrackPiece(data: AddLayoutPieceData): Promise<UiLayout> {
  const retVal = await apiCall<UiLayout>("POST", "/layout/piece", data);
  return retVal;
}

// Delete a track piece from the layout
export async function deleteLayoutElement(data: DeleteLayoutElementData): Promise<UiLayout> {
  const url = "/layout/element";
  const retVal = await apiCall<UiLayout>("DELETE", url, data);
  return retVal;
}

// Flip a track piece in the layout
export async function flipTrackPiece(pieceId: string): Promise<UiLayout> {
  const url = "/layout/piece/flip/" + pieceId;
  const retVal = await apiCall<UiLayout>("PUT", url, {});
  return retVal;
}
