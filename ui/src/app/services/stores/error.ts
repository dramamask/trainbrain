interface State {
  error: string;
}

let state: State = { error: "" };

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

  setError(message: string): void {
    // Immutable update
    state = { error: message };
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  clearError(): void {
    state = { error: "" };
    listeners.forEach((callback) => callback());
  }
};
