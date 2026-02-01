"use client"

import { UiLayout, UpdateNodeData } from "trainbrain-shared";
import { store as errorStore } from '@/app/services/stores/error';
import { store as editModeStore } from '@/app/services/stores/editmode';
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as selectionStore } from "@/app/services/stores/selection";
import { deleteTrackPiece, rotateTrackPiece, updateNode } from "@/app/services/api/tracklayout";
import { BIG_MOVE_INCREMENT, MOVE_INCREMENT, ROTATE_INCREMENT } from "@/app/config/config";
import { EDIT_MODE_KEYS } from "./keydefinitions";
import { getAssociatedKeyValue } from "./helpers";

// Keep track of node update API calls so we don't have multiple going at the same time
let nodeUpdateInProgress = false;

// Key Event Handler for Edit Mode
//
// ==========> All key event handlers need to be called from keyboardEventHandler.tsx <==========
//
export function handleKeyDown(event: KeyboardEvent) {
  if (editModeStore.isEditMode()) {
    const keyDefValue = getAssociatedKeyValue(EDIT_MODE_KEYS, event);
    const moveIncrement = event.ctrlKey ? BIG_MOVE_INCREMENT : MOVE_INCREMENT;

    switch (keyDefValue) {
      case EDIT_MODE_KEYS.MoveNodeUp:
        handleNodeUpdate("y", moveIncrement, 0);
        break;
      case EDIT_MODE_KEYS.MoveNodeRight:
        handleNodeUpdate("x", moveIncrement, 0);
        break;
      case EDIT_MODE_KEYS.MoveNodeDown:
        handleNodeUpdate("y", -moveIncrement, 0);
        break;
      case EDIT_MODE_KEYS.MoveNodeLeft:
        handleNodeUpdate("x", -moveIncrement, 0);
        break;
      case EDIT_MODE_KEYS.RotateNodeRight:
        handleNodeUpdate("x", 0, ROTATE_INCREMENT);
        break;
      case EDIT_MODE_KEYS.RotateNodeLeft:
        handleNodeUpdate("x", 0, -ROTATE_INCREMENT);
        break;
      case EDIT_MODE_KEYS.DeleteLayoutPiece:
        deleteLayoutPiece();
        selectionStore.deselectAll();
        break;
      case EDIT_MODE_KEYS.DeselectLayoutElement:
        selectionStore.deselectAll();
        break;
      default:
        // Exit this function
        return;
    }
  }
}

// Call the server API to store the new node position
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

  // Set variable to keep track of API call in progress for updating a node
  if (nodeUpdateInProgress) {
    return;
  }
  nodeUpdateInProgress = true;

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
      nodeUpdateInProgress = false;
      // Update our local store with the new layout data that we received back from the server
      trackLayoutStore.setTrackLayout(layoutData);
    })
    .catch((error: Error) => {
      // The server responded back with an error
      nodeUpdateInProgress = false;
      errorStore.setError(error.message);
      console.error(error);
    });
}

// Call the server API to delete a layout piece
function deleteLayoutPiece() {
  const pieceId = selectionStore.getSelectedLayoutPiece();
  if (!pieceId) {
    errorStore.setError("Please select a piece to perform this action.");
    return;
  }

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
