"use client";

export const YES = true;
export const NO = false;

interface State {
  question: string;
  answer: boolean;
}

let state: State = { question: "", answer: NO };

// Define a type for the callback function
type Listener = () => void;

const listeners = new Set<Listener>();

export const store = {
  subscribe(callback: Listener): () => boolean {
    listeners.add(callback);
    // Return cleanup function
    return () => listeners.delete(callback);
  },

  unsubscribe(callback: Listener): boolean {
    return listeners.delete(callback);
  },

  getSnapshot(): State {
    return state;
  },

  // Needed for next.js to be able to do server side rendering
  getServerSnapshot(): State {
    return state;
  },

  getAnswer(): boolean {
    return (state.answer);
  },

  setQuestion(q: string): void {
    // Immutable update
    state = { question: q, answer: NO };
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  clear(): void {
    // Immutable update
    state = { question: "", answer: NO };
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },

  setAnswer(a: boolean): void {
    // Immutable update
    state = { question: state.question, answer: a };
    // Notify React/listeners
    listeners.forEach((callback) => callback());
  },
};
