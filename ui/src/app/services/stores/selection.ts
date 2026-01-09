"use client";

interface State {
  isSelected: boolean;
  selectedTrackPiece: string;
  selectedConnector: string;
}

let state: State = { isSelected: false, selectedTrackPiece: "", selectedConnector: "" };

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

  isSelected(): boolean {
    return state.isSelected;
  },

  getSelected(): State {
    return state;
  },

  setSelected(selected: boolean, pieceId: string, connectorId: string): void {
    // Immutable update
    state = { isSelected: selected, selectedTrackPiece: pieceId, selectedConnector: connectorId };
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  resetSelected(vlue: boolean): void {
    state = { isSelected: false, selectedTrackPiece: "", selectedConnector: "" };
  }
};
