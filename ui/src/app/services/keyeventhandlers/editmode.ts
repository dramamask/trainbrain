import { UiLayout, UiLayoutPiece } from "trainbrain-shared";
import { editMode, error as errorStore, trackLayout } from "@/app/services/store";
import { setPiece1StartPosition } from "@/app/services/api/tracklayout";

// Key Event Handler for Edit Mode
export function handleKeyDown(key: string) {
  // Only do something when Edit Mode is enabled
  if (editMode.isEnabled()) {
    const layout: UiLayout = trackLayout.get() as UiLayout;
    const piece1 = layout.pieces.find(piece => piece.id == 1) as UiLayoutPiece;

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
        break;
    }

    setPiece1StartPosition(piece1.start)
    .then((layoutData: UiLayout) => {
        trackLayout.set(layoutData);
      })
      .catch((error: Error) => {
        errorStore.set(error.message);
        console.error("handleKeyDown().setPiece1StartPosition()", error);
      });
  }
}
