/**
 * Keyboard shortcut definitions.
 * Reference these values in code instead of directly referrencing key names.
 * This object is also used to render the keyboard shortcut UI item.
 */

export type KeyDefintions =  Record<string, string | string[]>;

export const KEYS: KeyDefintions = {
  ZoomInLayout: '+',
  ZoomOutLayout: '-',
  CloseError: ['Escape', 'Enter'],
  ResetMeasurement: 'M',
}

export const EDIT_MODE_KEYS: KeyDefintions = {
  MoveNodeUp: 'ArrowUp',
  MoveNodeDown: 'ArrowDown',
  MoveNodeLeft: 'ArrowLeft',
  MoveNodeRight: 'ArrowRight',
  DeletePiece: 'Delete',
  Deselect: 'Escape',
  AddNode: 'N',
  RotateNodeRight: ']',
  RotateNodeLeft: '[',
}
