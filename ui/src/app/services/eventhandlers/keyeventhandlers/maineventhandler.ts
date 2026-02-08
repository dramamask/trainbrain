import * as editMode from "./editmode";
import * as error from "./error";
import * as zoom from "./zoom";
import * as measure from "./measure";

/**
 * This function that passes the key-down event along to individual key event handlers
 * Note that this function follows the command pattern. Each individual key event
 * handler checks for themselves to see if they should handle the event or not.
 *
 * Each key event handler in app/services/keyeventhandlers should be called here.
 */
export function handleKeyDown(event: KeyboardEvent) {
  editMode.handleKeyDown(event);
  error.handleKeyDown(event);
  zoom.handleKeyDown(event);
  measure.handleKeyDown(event);
}
