"use client"

import { UiLayout, UpdateNodeData } from "trainbrain-shared";
import { store as errorStore } from '@/app/services/stores/error';
import { store as editModeStore } from '@/app/services/stores/editmode';
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as selectionStore } from "@/app/services/stores/selection";
import { deleteTrackPiece, rotateTrackPiece, updateNode } from "@/app/services/api/tracklayout";
import { MOVE_INCREMENT, ROTATE_INCREMENT } from "@/app/config/config";
import { KEYS } from "./keydefinitions";

// Key Event Handler for Edit Mode
// Note that all key event handlers need to be called from keynoardEventHandler.tsx
export function handleKeyDown(event: KeyboardEvent) {
  if (editModeStore.isEditMode()) {
    switch (event.key) {
      case KEYS.MoveNodeUp:
        handleNodeUpdate("y", MOVE_INCREMENT, 0);
        break;
      case KEYS.MoveNodeRight:
        handleNodeUpdate("x", MOVE_INCREMENT, 0);
        break;
      case KEYS.MoveNodeDown:
        handleNodeUpdate("y", -MOVE_INCREMENT, 0);
        break;
      case KEYS.MoveNodeLeft:
        handleNodeUpdate("x", -MOVE_INCREMENT, 0);
        break;
      case KEYS.RotateNodeRight:
        handleNodeUpdate("x", 0, ROTATE_INCREMENT);
        break;
      case KEYS.RotateNodeLeft:
        handleNodeUpdate("x", 0, -ROTATE_INCREMENT);
        break;
      case KEYS.DeleteLayoutPiece:
        deleteLayoutPiece(selectionStore.getSelectedLayoutPiece());
        selectionStore.deselectAll();
        break;
      case KEYS.DeselectLayoutElement:
        selectionStore.deselectAll();
        break;
      default:
        // Exit this function
        return;
    }
  }
}

// Call the server API to store the new start position
function handleNodeUpdate(axis: "x" | "y", xyIncrement: number, headingIncrement: number): void {
  const nodeId = selectionStore.getSelectedNode();
  if (!nodeId) {
    errorStore.setError("Please select a node to perform this action.");
    return;
  }

  const nodeData = trackLayoutStore.getLayoutNodeData(nodeId);
  if (!nodeData) {
    throw new Error(`Unexpected error. Node data not found for nodeId: ${nodeId}`);
  }

  // Update the node coordinate
  nodeData.coordinate[axis] += xyIncrement;

  // Prepare the data to send to the server
  const updateNodeData: UpdateNodeData = {
    index: nodeId,
    x: nodeData.coordinate.x,
    y: nodeData.coordinate.y,
    headingIncrement: headingIncrement,
  }

  // Call the server's API endpoint to update the node position
  updateNode(updateNodeData)
    .then((layoutData: UiLayout) => {
      // Update our local store with the new layout data that we received back from the server
      trackLayoutStore.setTrackLayout(layoutData);
    })
    .catch((error: Error) => {
      // The server responded back with an error
      errorStore.setError(error.message);
      console.error("handleKeyDown().setStartPosition() error:", error);
    });
}

// Call the server API to delete a layout piece
function deleteLayoutPiece(pieceId: string) {
  deleteTrackPiece(pieceId)
    .then((layoutData: UiLayout) => {
      trackLayoutStore.setTrackLayout(layoutData);
    })
    .catch((error: Error) => {
      errorStore.setError(error.message);
      console.error("handleKeyDown().deleteLayoutPiece() error:", error);
    });
}

// Call the server API to rotate a layout piece
function rotateLayoutPiece(pieceId: string) {
  rotateTrackPiece(pieceId)
    .then((layoutData: UiLayout) => {
      trackLayoutStore.setTrackLayout(layoutData);
    })
    .catch((error: Error) => {
      errorStore.setError(error.message);
      console.error("handleKeyDown().rotateLayoutPiece() error:", error);
    });
}
