"use client";

interface State {
  nodeIds: string[]; // Array of node IDs that are nearby another node
}

let state: State = { nodeIds: [] };

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

  /**
   * Needed for next.js to be able to do server side rendering
   */
  getServerSnapshot(): State {
    return state;
  },

  /**
   * Is measure mode enabled?
   */
  hasNearbyNode(nodeId: string): boolean {
    return state.nodeIds.includes(nodeId);
  },

  /**
   * Set the nodes that are nearby other nodes
   */
  setNearbyNodes(nodeIds: string[]): void {
    const newState = { nodeIds: nodeIds };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },
}