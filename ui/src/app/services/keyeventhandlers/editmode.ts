"use client"

import { UiAttributesPosition, UiLayout, UiLayoutPiece } from "trainbrain-shared";
import { store as errorStore } from '@/app/services/stores/error';
import { store as editModeStore } from '@/app/services/stores/editmode';
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as selectionStore } from "@/app/services/stores/selection";
import { setStartPosition } from "@/app/services/api/tracklayout";
import { MOVE_INCREMENT } from "@/app/config/config";

// Key Event Handler for Edit Mode
// Note that all key event handlers need to be called from keynoardEventHandler.tsx
export function handleKeyDown(key: string) {
  if (editModeStore.isEditMode()) {
    const trackLayout: UiLayout = trackLayoutStore.getTrackLayout() as UiLayout;
    const startPositionPiece = trackLayout.pieces.find(piece => piece.category == "position") as UiLayoutPiece;
    const startPositionAttributes = startPositionPiece.attributes as UiAttributesPosition;

    switch (key) {
      case 'ArrowUp':
        startPositionAttributes.position.y += MOVE_INCREMENT;
        break;
      case 'ArrowDown':
        startPositionAttributes.position.y -= MOVE_INCREMENT;
        break;
      case 'ArrowLeft':
        startPositionAttributes.position.x -= MOVE_INCREMENT;
        break;
      case 'ArrowRight':
        startPositionAttributes.position.x += MOVE_INCREMENT;
        break;
      case 'Escape':
        selectionStore.deselectAll();
        break;
      default:
        // Exit this function
        return;
    }

    setStartPosition(startPositionAttributes.position)
    .then((layoutData: UiLayout) => {
        trackLayoutStore.setTrackLayout(layoutData);
      })
      .catch((error: Error) => {
        errorStore.setError(error.message);
        console.error("handleKeyDown().setStartPosition()", error);
      });
  }
}
