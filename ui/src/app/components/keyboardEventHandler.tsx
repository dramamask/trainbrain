import { useEffect } from 'react';

import * as editMode from "@/app/services/keyeventhandlers/editmode";
import * as error from "@/app/services/keyeventhandlers/error";

export default function KeyBoardEventHandler() {
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      handleKeyDown(event.key)
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    // Cleanup: Remove listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []); // Empty array ensures this only runs once on mount

  return null;
};

// Function that passes the key-down event along to individual event handlers
function handleKeyDown(key: string) {
  // This follows the command pattern. Individual event handlers check
  // for themselves to see if they should handle the event or not.
  editMode.handleKeyDown(key);
  error.handleKeyDown(key);
}
