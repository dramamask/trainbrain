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

  getLayoutPieceData(pieceId: string): UiLayoutPiece | undefined {
    return state.trackLayout.pieces.find(trackPiece => trackPiece.id == pieceId);
  },

  getLayoutNodeData(nodeId: string): UiLayoutNode | undefined {
    return state.trackLayout.nodes.find(node => node.id == nodeId);
  },
};
