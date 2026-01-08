"use client";

interface State {
  zoomFactor: number;
}

let state: State = { zoomFactor: 1 };

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

  getZoomFactor(): number {
    return state.zoomFactor;
  },

  setZoomFactor(value: number): void {
    // Immutable update
    state = { zoomFactor: value };
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },
};
