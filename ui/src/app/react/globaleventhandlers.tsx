"use client";

import { useEffect } from 'react';
import { handleKeyDown } from '../services/eventhandlers/keyeventhandlers/maineventhandler';

export default function GlobalEventHandlers() {
  useEffect(() => {
    // Keyboard event handlers
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      handleKeyDown(event)
    };
    window.addEventListener('keydown', handleGlobalKeyDown);

    // Cleanup: Remove listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []); // Empty array ensures this only runs once on mount

  return null;
};
