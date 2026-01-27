"use client";

interface State {
  selectedLayoutPiece: string;
  selectedNode: string;
}

let state: State = { selectedLayoutPiece: "", selectedNode: "" };

// Define a type for the callback function
type Listener = () => void;

const listeners = new Set<Listener>();

export const store = {
  subscribe(callback: Listener): () => boolean {
    listeners.add(callback);
    // Return cleanup function
    return () => listeners.delete(callback);
  },

  getSnapshot(): State {
    return state;
  },

  // Needed for next.js to be able to do server side rendering
  getServerSnapshot(): State {
    return state;
  },

  getSelectedLayoutPiece(): string {
    return state.selectedLayoutPiece;
  },

  getSelectedNode(): string {
    return state.selectedNode;
  },

  setSelectedLayoutPiece(pieceId: string): void {
    const newState = { selectedLayoutPiece: pieceId, selectedNode: state.selectedNode };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  /**
   * Set the selected piece to pieceId, unless pieceId is already the selected piece, in which case we will deselect it.
   */
  toggleOrSetSelectedLayoutPiece(pieceId: string): void {
    const selectedPiece = (state.selectedLayoutPiece == pieceId ? "" : pieceId);
    const newState = { selectedLayoutPiece: selectedPiece, selectedNode: state.selectedNode };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  setSelectedNode(nodeId: string): void {
    const newState = { selectedLayoutPiece: state.selectedLayoutPiece, selectedNode: nodeId };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  /**
   * Set the selected node to nodeId, unless nodeId is already the selected node, in which case we will deselect it.
   */
  toggleOrSetSelectedNode(nodeId: string): void {
    const selectedNode = (state.selectedNode == nodeId ? "" : nodeId);
    const newState = { selectedLayoutPiece: state.selectedLayoutPiece, selectedNode: selectedNode };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  deselectTrackPiece(): void {
    const newState = { selectedLayoutPiece: "", selectedNode: state.selectedNode };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  deselectNode(): void {
    const newState = { selectedLayoutPiece: state.selectedLayoutPiece, selectedNode: "" };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  deselectAll(): void {
    const newState = { selectedLayoutPiece: "", selectedNode: "" };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },
};
