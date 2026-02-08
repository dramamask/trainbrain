"use client";

import { Coordinate } from "trainbrain-shared";

interface State {
  enabled: boolean;
  locked: boolean; // Pos2 moves with the mouse when this is false. Pos2 does not move anymore when this is true.
  pos1: Coordinate | undefined;
  pos2: Coordinate | undefined;
  distance: number | undefined; // in mm
}

let state: State = { enabled: false, locked: false, pos1: undefined, pos2: undefined, distance: undefined };

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
  getEnabled(): boolean {
    return state.enabled;
  },

  /**
   * Toggle measure mode on or off
   */
  toggle(enabled: boolean): void {
    const newState = { enabled: enabled, locked: false, pos1: undefined, pos2: undefined, distance: undefined };
    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  /**
   * Set one of the measurement positions
   */
  setPos(coordinate: Coordinate): void {
    // Return right away if measurement is not enabled or if the measurement is locked already
    if (!state.enabled || state.locked) {
      return;
    }

    // Set pos1 or pos2
    let pos1 = state.pos1;
    let pos2 = state.pos2;
    let distance = undefined;
    let lock = false;

    if (state.pos1 == undefined) {
      pos1 = coordinate;
    } else {
      pos2 = coordinate;
      distance = calcDistance(pos1, pos2);
      lock = true; // Lock the measurement after pos 2 is set here
    }
    const newState = { enabled: state.enabled, locked: lock, pos1: pos1, pos2: pos2, distance: distance };

    // Immutable update
    state = newState;
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  /**
   * Temporarily set position 2 if the measurment is not locked yet.
   * This function will not lock the measurement.
   */
  setPos2(coordinate: Coordinate): void {
    if (!state.locked) {
      const distance = calcDistance(state.pos1, coordinate);
      const newState = { enabled: state.enabled, locked: state.locked, pos1: state.pos1, pos2: coordinate, distance: distance };
      // Immutable update
      state = newState;
      // Notify React/listeners
      listeners.forEach((callback) => callback());
    }
  },

  /**
   * Clear the measurement. Keep the measurement enabled but clear the current measurement (reset).
   */
  clear(): void {
    const newState = { enabled: state.enabled, locked: false, pos1: undefined, pos2: undefined, distance: undefined };
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