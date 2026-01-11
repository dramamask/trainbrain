/**
 * Keyboard shortcut definitions.
 * Reference these values in code instead of directly referrencing key names.
 * This object is also used to render the keyboard shortcut UI item.
 */
export const KEY = {
  zoom: {
    in: 'NumpadAdd',
    out: 'NumpadSubtract',
  },
  editMode: {
    layout: {
      moveUp: 'ArrowUp',
      moveRight: 'ArrowRight',
      moveDown: 'ArrowDown',
      moveLeft: 'ArrowLeft',
      piece: {
        deselect: 'Escape',
        connector: {
          toggle: 'Tab',
        },
      },
    },
  },
  errorMessage: {
    close: ['Escape', 'Enter'],
  }
}
