import { UiLayout } from "trainbrain-shared";

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

  setTrackLayout(value: UiLayout): void {
    // Immutable update
    state = { trackLayout: value };
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  getTrackLayout(): UiLayout {
    return state.trackLayout;
  }
};
