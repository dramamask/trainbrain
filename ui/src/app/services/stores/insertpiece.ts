"use client";

interface State {
  insert: boolean;
}

let state: State = { insert: false };

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

   isInsertPiece(): boolean {
    return state.insert;
  },

  toggleInsertPiece(): void {
    // Immutable update
    state = { insert: !state.insert };
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },
};
