import { KeyDefintions } from "./keydefinitions";

/**
 * Return the keydefintions array value that matches the given keyboardEvent
 *
 * @param {KeyboardEvent} keyboardEvent - The keyboard event that was fired
 * @return {string | string[]}
 */
export function getAssociatedKeyValue(keyDefinitions: KeyDefintions, keyboardEvent: KeyboardEvent): string | string[] {
  for(const keyDef of Object.values(keyDefinitions)) {
    if (typeof keyDef == 'string') {
      if (keyboardEvent.key.toLowerCase() == keyDef.toLowerCase()) {
        return keyDef;
      }
    }

    if (Array.isArray(keyDef)) {
      for(const key of keyDef) {
        if (keyboardEvent.key.toLowerCase() == key.toLowerCase()) {
          return keyDef;
        }
      }
    }
  }

  return "";
}