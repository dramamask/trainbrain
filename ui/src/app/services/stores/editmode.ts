interface State {
  editMode: boolean;
}

let state: State = { editMode: false };

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

  isEditMode(): boolean {
    return state.editMode;
  },

  setEditMode(value: boolean): void {
    // Immutable update
    state = { editMode: value };
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },
};
