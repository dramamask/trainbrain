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

// Function that passes the key-down event along to individual key event handlers
// Note that this function follows the command pattern. Each individual key event
// handler checks for themselves to see if they should handle the event or not.
// Each key event handler in app/services/keyeventhandlers should be called here.
function handleKeyDown(key: string) {
  editMode.handleKeyDown(key);
  error.handleKeyDown(key);
}
