"use client"

import { store as errorStore } from '@/app/services/stores/error';
import { KEYS } from "./keydefinitions";
import { getAssociatedKeyValue } from './helpers';

// Key Event Handler that acts when an error is present.
//
// ==========> All key event handlers need to be called from keyboardEventHandler.tsx <==========
//
export function handleKeyDown(event: KeyboardEvent) {
  const keyDefValue = getAssociatedKeyValue(KEYS, event);

  switch(keyDefValue) {
    case KEYS.CloseError:
      errorStore.clearError();
      break;
  }
}
