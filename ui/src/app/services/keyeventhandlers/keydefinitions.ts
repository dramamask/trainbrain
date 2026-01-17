/**
 * Keyboard shortcut definitions.
 * Reference these values in code instead of directly referrencing key names.
 * This object is also used to render the keyboard shortcut UI item.
 */

export const UI_CATEGORY = 'UiCategory'; // Special key for UI header only. Not a key definition.

export const KEYS = {
  ZoomInTrackLayout: '+',
  ZoomOutTrackLayout: '-',
  CloseErrorMessage: ['Escape', 'Enter'],
  [UI_CATEGORY]: 'Edit Mode',
  DeleteLayoutPiece: 'Delete',
  RotateNodeRight: 'r',
  RotateNodeLeft: 'R',
  MoveNodeUp: 'ArrowUp',
  MoveNodeDown: 'ArrowDown',
  MoveNodeLeft: 'ArrowLeft',
  MoveNodeRight: 'ArrowRight',
  DeselectLayoutElement: 'Escape',
}
