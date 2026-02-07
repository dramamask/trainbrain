"use client"

import { UiLayout, UpdateNodeData } from "trainbrain-shared";
import { store as errorStore } from '@/app/services/stores/error';
import { store as questionStore, YES } from "@/app/services/stores/question";
import { store as editModeStore } from '@/app/services/stores/editmode';
import { store as mousePosStore } from "@/app/services/stores/mousepos";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as selectionStore } from "@/app/services/stores/selection";
import { addNode, deleteLayoutElement, updateNode } from "@/app/services/api/tracklayout";
import { BIG_MOVE_INCREMENT, MOVE_INCREMENT, ROTATE_INCREMENT } from "@/app/config/config";
import { EDIT_MODE_KEYS } from "./keydefinitions";
import { getAssociatedKeyValue } from "./helpers";
import { getLastInsertedNode } from "../../tracklayout";
import { useSyncExternalStore } from "react";

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
        handleUpdateNode("y", moveIncrement, 0);
        break;
      case EDIT_MODE_KEYS.MoveNodeRight:
        handleUpdateNode("x", moveIncrement, 0);
        break;
      case EDIT_MODE_KEYS.MoveNodeDown:
        handleUpdateNode("y", -moveIncrement, 0);
        break;
      case EDIT_MODE_KEYS.MoveNodeLeft:
        handleUpdateNode("x", -moveIncrement, 0);
        break;
      case EDIT_MODE_KEYS.RotateNodeRight:
        handleUpdateNode("x", 0, ROTATE_INCREMENT);
        break;
      case EDIT_MODE_KEYS.RotateNodeLeft:
        handleUpdateNode("x", 0, -ROTATE_INCREMENT);
        break;
      case EDIT_MODE_KEYS.AddNode:
        handleAddNode();
        break;
      case EDIT_MODE_KEYS.DeletePiece:
        handleDelete();
        break;
      case EDIT_MODE_KEYS.Deselect:
        selectionStore.deselectAll();
        break;
      default:
        // Exit this function
        return;
    }
  }
}

/**
 * Call the server API to store the new node position
 */
function handleUpdateNode(axis: "x" | "y", xyIncrement: number, headingIncrement: number): void {
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

/**
 * Call the server API to add a new node to the layout at the position where the cursor is at
 */
function handleAddNode() {
  const pos = mousePosStore.getPos();
  if (!pos) {
    errorStore.setError("Position the mouse on the track layout to mark the position where the node should be added");
    return;
  }

  addNode({x: pos.x, y:pos.y})
    .then((layoutData: UiLayout) => {
      trackLayoutStore.setTrackLayout(layoutData);
      // Select the newly added node
      const nodeId = getLastInsertedNode(layoutData);
      selectionStore.setSelectedNode(nodeId);
      selectionStore.deselectTrackPiece();
    })
    .catch((error: Error) => {
      errorStore.setError(error.message);
      console.error("handleKeyDown().deleteLayoutPiece() error:", error);
    });
}

/**
 * Kick-off the delete of a layout element
 */
function handleDelete() {
  const pieceId = selectionStore.getSelectedLayoutPiece();
  const nodeId = selectionStore.getSelectedNode();
  if (!pieceId && !nodeId) {
    errorStore.setError("Please select a node or piece to perform this action.");
    return;
  }

  if (pieceId && nodeId) {
    questionStore.setQuestion("Both a node and a layout piece were selected. Are you sure you want to go ahead with the delete?");
    questionStore.subscribe(handleMultiDeleteAnswer);
    return;
  }

  selectionStore.deselectAll();
  callApiToDelete(nodeId, pieceId);
}

/**
 * Handle the answer to the question asked above
 */
function handleMultiDeleteAnswer() {
  const pieceId = selectionStore.getSelectedLayoutPiece();
  const nodeId = selectionStore.getSelectedNode();

  if (questionStore.getAnswer() == YES) {
    selectionStore.deselectAll();
    callApiToDelete(nodeId, pieceId);
  }

  questionStore.unsubscribe(handleMultiDeleteAnswer);
}

/**
 * Call the server API to delete a layout piece
 */
function callApiToDelete(nodeId: string, pieceId: string) {
  deleteLayoutElement({nodeId: nodeId, pieceId: pieceId})
    .then((layoutData: UiLayout) => {
      trackLayoutStore.setTrackLayout(layoutData);
    })
    .catch((error: Error) => {
      errorStore.setError(error.message);
      console.error("handleKeyDown().deleteLayoutPiece() error:", error);
    });
}
