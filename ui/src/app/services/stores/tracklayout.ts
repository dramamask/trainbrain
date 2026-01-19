"use client";

import { UiLayout, UiLayoutNode, UiLayoutPiece } from "trainbrain-shared";

interface State {
  trackLayout: UiLayout;
}

let state: State = { trackLayout: <UiLayout>{} };

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
    // Immutable update
    state = { trackLayout: value };
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
    const node = state.trackLayout.nodes.find(node => node.id == nodeId);
    if (node == undefined) {
      throw new Error("This function should never be called for a non-existing node");
    }
    return node;
  },
};
