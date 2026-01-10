"use client";

import { TrackPieceDef, TrackPieceDefList } from "trainbrain-shared";

interface State {
  pieceDefs: TrackPieceDefList;
}

let state: State = { pieceDefs: <TrackPieceDefList>{} };

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

  setPieceDefs(value: TrackPieceDefList): void {
    // Immutable update
    state = { pieceDefs: value };
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  getPieceDefList(): TrackPieceDefList {
    return state.pieceDefs;
  },

  getPieceDefData(pieceDefId: string): TrackPieceDef | undefined {
    return state.pieceDefs[pieceDefId];
  }
};
