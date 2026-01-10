"use client";

import { getNextConnector } from "@/app/services/connectors";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";

interface State {
  selectedTrackPiece: string;
  selectedConnector: string;
}

let state: State = { selectedTrackPiece: "", selectedConnector: "" };

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

  getSelectedConnector(): string {
    return state.selectedConnector;
  },

  setSelectedTrackPiece(pieceId: string): void {
    const newState = { selectedTrackPiece: pieceId, selectedConnector: state.selectedConnector };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  setSelectedConnector(connectorId: string): void {
    const newState = { selectedTrackPiece: state.selectedTrackPiece, selectedConnector: connectorId };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  toggleSelectedConnector(): void {
    // Return if we don't have a selected piece
    if (state.selectedTrackPiece == "") {
      return;
    }

    // Log an error and return if we can't find data for the selected piece
    const selectedPieceData = trackLayoutStore.getTrackPieceData(state.selectedTrackPiece);
    if (!selectedPieceData || !(('category') in selectedPieceData)) {
      console.error(`Selected piece data could not be found for piece ${state.selectedTrackPiece}`);
      return;
    }

    // Create a new state with the next connector "in the list" for the selected piece
    const newState = {
      selectedTrackPiece: state.selectedTrackPiece,
      selectedConnector: getNextConnector(selectedPieceData.category, state.selectedConnector)
    };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  deselectTrackPiece(): void {
    const newState = { selectedTrackPiece: "", selectedConnector: state.selectedConnector };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  deselectConnector(): void {
    const newState = { selectedTrackPiece: state.selectedTrackPiece, selectedConnector: "" };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  deselectAll(): void {
    const newState = { selectedTrackPiece: "", selectedConnector: "" };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },
};
