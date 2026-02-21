"use client";

interface State {
  nodeThatWillMove: string | undefined;
}

let state: State = { nodeThatWillMove: undefined };

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

  getNodeThatWillMove(): string | undefined {
    return state.nodeThatWillMove;
  },

  getMergingInProgress(): boolean {
    return (state.nodeThatWillMove !== undefined)
  },

  setNode(nodeId: string): void {
    // Immutable update
    state = { nodeThatWillMove: nodeId };
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  clear(): void {
    state = { nodeThatWillMove: undefined };
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  }
};
