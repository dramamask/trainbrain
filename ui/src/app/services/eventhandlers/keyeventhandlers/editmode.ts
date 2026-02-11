"use client"

import { MovePieceData, UiLayout, UpdateNodeData } from "trainbrain-shared";
import { store as errorStore } from '@/app/services/stores/error';
import { store as questionStore, YES } from "@/app/services/stores/question";
import { store as editModeStore } from '@/app/services/stores/editmode';
import { store as mousePosStore } from "@/app/services/stores/mousepos";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as selectionStore } from "@/app/services/stores/selection";
import { addNode, deleteLayoutElement, disconnectNode, movePiece, updateNode } from "@/app/services/api/tracklayout";
import { get } from "@/app/config/config";
import { EDIT_MODE_KEYS } from "./keydefinitions";
import { getAssociatedKeyValue } from "./helpers";
import { getLastInsertedNode } from "../../tracklayout";

// Keep track of node update API calls so we don't have multiple going at the same time
let moveOrRotateInProgress = false;

// Key Event Handler for Edit Mode
//
// ==========> All key event handlers need to be called from maineventhandler.ts <==========
//
export function handleKeyDown(event: KeyboardEvent) {
  if (editModeStore.isEditMode()) {
    const keyDefValue = getAssociatedKeyValue(EDIT_MODE_KEYS, event);
    const moveIncrement = (event.ctrlKey ? get("increment.bigMove") : get("increment.move")) as number;

    switch (keyDefValue) {
      case EDIT_MODE_KEYS.MoveNodeUp:
        handleMoveLayoutElement("y", moveIncrement);
        break;
      case EDIT_MODE_KEYS.MoveNodeRight:
        handleMoveLayoutElement("x", moveIncrement);
        break;
      case EDIT_MODE_KEYS.MoveNodeDown:
        handleMoveLayoutElement("y", -moveIncrement);
        break;
      case EDIT_MODE_KEYS.MoveNodeLeft:
        handleMoveLayoutElement("x", -moveIncrement);
        break;
      case EDIT_MODE_KEYS.RotateNodeRight:
        handleUpdateNode("x", 0, get("increment.rotate") as number);
        break;
      case EDIT_MODE_KEYS.RotateNodeLeft:
        handleUpdateNode("x", 0, -get("increment.rotate") as number);
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
      case EDIT_MODE_KEYS.DisconnectPieces:
        handleDisconnect();
        break;
    }
  }
}

/**
 *
 */
function handleMoveLayoutElement(axis: "x" | "y", xyIncrement: number): void {
  const pieceId = selectionStore.getSelectedLayoutPiece();
  const nodeId = selectionStore.getSelectedNode();
  if (nodeId && pieceId) {
    errorStore.setError("Please select a layout node or a layout piece, not both.");
    return;
  }

  if (nodeId) {
    return handleUpdateNode(axis, xyIncrement, 0);
  }

  if (!pieceId) {
    errorStore.setError("Please select a layout node or a layout piece to perform this action.");
    return;
  }

  // Set variable to keep track of API call in progress for updating a node
  if (moveOrRotateInProgress) {
    return;
  }
  moveOrRotateInProgress = true;

  // Assemble the API data
  let yIncrement = 0;
  let xIncrement = 0;
  if (axis == "x") {
    xIncrement = xyIncrement;
  } else {
    yIncrement = xyIncrement;
  }
  const movePieceData: MovePieceData = {
    index: pieceId,
    xIncrement: xIncrement,
    yIncrement: yIncrement,
  }

  // Call the server's API endpoint to move the layout piece
  movePiece(movePieceData)
    .then((layoutData: UiLayout) => {
      moveOrRotateInProgress = false;
      // Update our local store with the new layout data that we received back from the server
      trackLayoutStore.setTrackLayout(layoutData);
    })
    .catch((error: Error) => {
      // The server responded back with an error
      moveOrRotateInProgress = false;
      errorStore.setError(error.message);
      console.error(error);
    });
}

/**
 * Call the server API to store update
 */
function handleUpdateNode(axis: "x" | "y", xyIncrement: number, headingIncrement: number): void {
  const pieceId = selectionStore.getSelectedLayoutPiece();
  const nodeId = selectionStore.getSelectedNode();
  console.log("pieceId", pieceId);
  console.log("nodeId", nodeId);
  if (nodeId != "" && pieceId != "") {
    errorStore.setError("Please select a layout node or a layout piece, not both.");
    return;
  }
  if (!nodeId) {
    errorStore.setError("Please select a node to perform this action.");
    return;
  }

  const nodeData = trackLayoutStore.getLayoutNodeData(nodeId);
  if (!nodeData) {
    throw new Error(`Unexpected error. Node data not found for nodeId: ${nodeId}`);
  }

  // Set variable to keep track of API call in progress for updating a node
  if (moveOrRotateInProgress) {
    return;
  }
  moveOrRotateInProgress = true;

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
      moveOrRotateInProgress = false;
      // Update our local store with the new layout data that we received back from the server
      trackLayoutStore.setTrackLayout(layoutData);
    })
    .catch((error: Error) => {
      // The server responded back with an error
      moveOrRotateInProgress = false;
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
      console.error(error);
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
      console.error(error);
    });
}

/**
 * Handle disconnecting two pieces at a given node
 */
function handleDisconnect() {
  const pieceId = selectionStore.getSelectedLayoutPiece();
  if (pieceId) {
    errorStore.setError("Only select a layout node, not a layout piece, to perform this function.");
    return;
  }

  const nodeId = selectionStore.getSelectedNode();

  disconnectNode(nodeId)
    .then((layoutData: UiLayout) => {
      trackLayoutStore.setTrackLayout(layoutData);
      selectionStore.deselectNode();
    })
    .catch((error: Error) => {
      errorStore.setError(error.message);
      console.error(error);
    });
}
