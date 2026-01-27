"use client";

interface State {
  xScrollPercent: number;
  yScrollPercent: number;
}

let state: State = { xScrollPercent: 0, yScrollPercent: 0 };

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

  setXScrollPos(pos: number): void {
    const newState = { xScrollPercent: pos, yScrollPercent: state.yScrollPercent };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  setYScrollPos(pos: number): void {
    const newState = { xScrollPercent: state.xScrollPercent, yScrollPercent: pos };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },
};
