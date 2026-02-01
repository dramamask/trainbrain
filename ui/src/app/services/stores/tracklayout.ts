"use client";

import { UiLayout, UiLayoutNode, UiLayoutPiece } from "trainbrain-shared";
import { getLayoutNodeData } from "../tracklayout";

interface State {
  trackLayout: UiLayout;
  worldWidth: number;
  wordlHeight: number;
}

let state: State = { trackLayout: <UiLayout>{}, worldWidth: 0, wordlHeight: 0 };

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

  setTrackLayout(value: UiLayout): void {
    const newState = { trackLayout: value, worldWidth: state.worldWidth, wordlHeight: state.wordlHeight };
    // Immutable update
    state = newState
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  setTrackLayoutAndWorldSize(layout: UiLayout, width: number, height: number): void {
    const newState = { trackLayout: layout, worldWidth: width, wordlHeight: height };
    // Immutable update
    state = newState
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  getTrackLayout(): UiLayout {
    return state.trackLayout;
  },

  getLayoutPieceData(pieceId: string): UiLayoutPiece {
    const piece = state.trackLayout.pieces.find(trackPiece => trackPiece.id == pieceId);
    if (piece == undefined) {
      throw new Error("This function should never be called for a non-existing piece");
    }
    return piece;
  },

  getLayoutNodeData(nodeId: string): UiLayoutNode {
    return getLayoutNodeData(nodeId, state.trackLayout);
  },

  getWorldSize(): {worldWidth: number, worldHeight: number} {
    return {worldWidth: state.worldWidth, worldHeight: state.wordlHeight}
  },
};
