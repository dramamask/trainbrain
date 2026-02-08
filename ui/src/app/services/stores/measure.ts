"use client";

import { Coordinate } from "trainbrain-shared";

interface State {
  enabled: boolean;
  pos1: Coordinate | undefined;
  pos2: Coordinate | undefined;
  distance: number | undefined; // in mm
}

let state: State = { enabled: false, pos1: undefined, pos2: undefined, distance: undefined };

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

  // Is measure mode enabled?
  getEnabled(): boolean {
    return state.enabled;
  },

  // Toggle measure mode on or off
  toggle(enabled: boolean): void {
    const newState = { enabled: enabled, pos1: undefined, pos2: undefined, distance: undefined };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  // Set one of the measurement positions
  setPos(coordinate: Coordinate): void {
    if (!state.enabled) {
      return;
    }

    let pos1 = state.pos1;
    let pos2 = state.pos2;
    let distance = undefined;

    if (state.pos1 == undefined) {
      pos1 = coordinate;
    } else if (state.pos2 == undefined) {
      pos2 = coordinate;
      distance = calcDistance(pos1, pos2);
    } else {
      return;
    }
    const newState = { enabled: state.enabled, pos1: pos1, pos2: pos2, distance: distance };

    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },
};

/**
 * Calculate the distance between 2 points
 */
function calcDistance(pos1: Coordinate| undefined, pos2: Coordinate | undefined): number | undefined {
  if (pos1 == undefined || pos2 == undefined) {
    return undefined;
  }

  const deltaX = pos1.x - pos2.x;
  const deltaY = pos1.y - pos2.y;
  const sqrSum = Math.pow(deltaX, 2) + Math.pow(deltaY, 2);

  return Math.sqrt(sqrSum);
}