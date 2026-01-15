"use client";

interface State {
  selectedTrackPiece: string;
  selectedNode: string;
}

let state: State = { selectedTrackPiece: "", selectedNode: "" };

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

  getSelectedTrackPiece(): string {
    return state.selectedTrackPiece;
  },

  getSelectedNode(): string {
    return state.selectedNode;
  },

  setSelectedTrackPiece(pieceId: string): void {
    const newState = { selectedTrackPiece: pieceId, selectedNode: state.selectedNode };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  setSelectedNode(nodeId: string): void {
    const newState = { selectedTrackPiece: state.selectedTrackPiece, selectedNode: nodeId };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  deselectTrackPiece(): void {
    const newState = { selectedTrackPiece: "", selectedNode: "" };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  deselectNode(): void {
    const newState = { selectedTrackPiece: state.selectedTrackPiece, selectedNode: "" };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  deselectAll(): void {
    const newState = { selectedTrackPiece: "", selectedNode: "" };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },
};
