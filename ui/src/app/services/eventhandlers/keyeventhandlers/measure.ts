"use client"

import { store as measurementStore } from '@/app/services/stores/measure';
import { KEYS } from "./keydefinitions";
import { getAssociatedKeyValue } from './helpers';

// Key Event Handler that acts when an error is present.
//
// ==========> All key event handlers need to be called from maineventhandler.ts <==========
//
export function handleKeyDown(event: KeyboardEvent) {
  const keyDefValue = getAssociatedKeyValue(KEYS, event);

  switch(keyDefValue) {
    case KEYS.ResetMeasurement:
      measurementStore.clear();
      break;
  }
}
