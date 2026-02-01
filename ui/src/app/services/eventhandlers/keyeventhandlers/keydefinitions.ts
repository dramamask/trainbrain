/**
 * Keyboard shortcut definitions.
 * Reference these values in code instead of directly referrencing key names.
 * This object is also used to render the keyboard shortcut UI item.
 */

export type KeyDefintions =  Record<string, string | string[]>;

export const KEYS: KeyDefintions = {
  ZoomInTrackLayout: '+',
  ZoomOutTrackLayout: '-',
  CloseErrorMessage: ['Escape', 'Enter'],
}

export const EDIT_MODE_KEYS: KeyDefintions = {
  DeselectLayoutPiece: 'Escape',
  DeleteLayoutPiece: 'Delete',
  RotateNodeRight: ']',
  RotateNodeLeft: '[',
  MoveNodeUp: 'ArrowUp',
  MoveNodeDown: 'ArrowDown',
  MoveNodeLeft: 'ArrowLeft',
  MoveNodeRight: 'ArrowRight',
}
