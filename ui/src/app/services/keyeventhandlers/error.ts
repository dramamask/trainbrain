"use client"

import { store as errorStore } from '@/app/services/stores/error';
import { KEY } from "./keydefinitions";

// Key Event Handler that acts when an error is present.
// Note that all key event handlers need to be called from keynoardEventHandler.tsx
export function handleKeyDown(event: KeyboardEvent) {
  if (errorStore.errorPresent()) {
    if (KEY['errorMessage.close'].includes(event.key)) {
      errorStore.clearError();
    }
  }
}
