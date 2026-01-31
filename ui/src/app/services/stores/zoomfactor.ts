"use client";

export const MAX_ZOOM_FACTOR: number = 20;

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

  zoomIn(): void {
  const newState = {zoomFactor: getNextZoomFactorUp(state.zoomFactor)}
  // Immutable update
  state = newState;
  // Notify React/listeners
  listeners.forEach((callback) => callback());
  },

  zoomOut(): void {
  const newState = {zoomFactor: getNextZoomFactorDown(state.zoomFactor)}
  // Immutable update
  state = newState;
  // Notify React/listeners
  listeners.forEach((callback) => callback());
  },
};

// Get the next zoom factor value, one up from the current zoom factor
function getNextZoomFactorUp(currentZoomFactor: number): number {
  let newZoomFactor = currentZoomFactor + 1;
  if (newZoomFactor > MAX_ZOOM_FACTOR) {
    newZoomFactor = MAX_ZOOM_FACTOR;
  }
  return newZoomFactor;
}

// Get the next zoom factor value, one down from the current zoom factor
function getNextZoomFactorDown(currentZoomFactor: number): number {
  let newZoomFactor = currentZoomFactor - 1;
  if (newZoomFactor < 1) {
    newZoomFactor = 1;
  }
  return newZoomFactor;
}
