"use client";

import { PiecesUsedData, UiLayout, UiLayoutNode, UiLayoutPiece, WorldData } from "trainbrain-shared";
import { getLayoutNodeData } from "../tracklayout";
import { store as nearbyNodeStore } from "./hasnearbynode";

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
    const newState = { trackLayout: value };
    // Immutable update
    state = newState
    // Notify React/listeners
    listeners.forEach((callback) => callback());

    setNearbyNodes(value.nodes);
  },

  setTrackLayoutAndWorldData(layout: UiLayout): void {
    const newState = { trackLayout: layout, world: layout.world };
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

  getWorldSize(): {width: number, height: number} {
    return { width: state.trackLayout.world.width, height: state.trackLayout.world.height }
  },

  getWorldImage(): string {
    return state.trackLayout.world.image;
  },

  getPiecesUsed(): PiecesUsedData {
    return state.trackLayout.piecesUsed;
  }
};

/**
 * Tell the nearby Node store which nodes are nearby other nodes, so that it can update its state and notify its listeners.
 */
function setNearbyNodes(nodes: UiLayoutNode[]): void {
  const nearbyNodeIds = nodes.filter(node => node.hasNearbyNode).map(node => node.id);
  nearbyNodeStore.setNearbyNodes(nearbyNodeIds);
}
