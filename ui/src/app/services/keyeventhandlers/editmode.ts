import { UiLayout, UiLayoutPiece } from "trainbrain-shared";
import { store as errorStore } from '@/app/services/stores/error';
import { store as editModeStore } from '@/app/services/stores/editmode';
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { setPiece1StartPosition } from "@/app/services/api/tracklayout";

// Key Event Handler for Edit Mode
// Note that all key event handlers need to be called from keynoardEventHandler.tsx
export function handleKeyDown(key: string) {
  if (editModeStore.isEditMode()) {
    const trackLayout: UiLayout = trackLayoutStore.getTrackLayout() as UiLayout;
    const piece1 = trackLayout.pieces.find(piece => piece.id == 1) as UiLayoutPiece;

    switch (key) {
      case 'ArrowUp':
        piece1.start.y += 1;
        break;
      case 'ArrowDown':
        piece1.start.y -= 1;
        break;
      case 'ArrowLeft':
        piece1.start.x -= 1;
        break;
      case 'ArrowRight':
        piece1.start.x += 1;
        break;
      default:
        // Exit this function
        return;
    }

    setPiece1StartPosition(piece1.start)
    .then((layoutData: UiLayout) => {
        trackLayoutStore.setTrackLayout(layoutData);
      })
      .catch((error: Error) => {
        errorStore.setError(error.message);
        console.error("handleKeyDown().setPiece1StartPosition()", error);
      });
  }
}
