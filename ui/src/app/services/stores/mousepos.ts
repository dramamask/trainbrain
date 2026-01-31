"use client";

interface State {
  x: number | undefined;
  y: number | undefined;
}

let state: State = { x: undefined, y: undefined };

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

  setPos(xPos: number, yPos: number): void {
    const newState = { x: xPos, y: yPos };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  setMouseHasLeft(): void {
    const newState = { x: undefined, y: undefined };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  }
};

/**
 * Helper function to know if the mouse is in the viewbox, and return the mouse x and y position if it is.
 *
 * @param {State} state - The mousePos store state
 */
export function getMousePos(state: State): ({mouseInViewBox: boolean, x: number, y: number}) {
  if (state.x == undefined || state.y == undefined) {
    return {mouseInViewBox: false, x: 0, y: 0};
  }

  return {mouseInViewBox: true, x: state.x, y: state.y};
}