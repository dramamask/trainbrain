"use client"

import { UiAttributesPosition, UiLayout, UiLayoutPiece } from "trainbrain-shared";
import { store as errorStore } from '@/app/services/stores/error';
import { store as editModeStore } from '@/app/services/stores/editmode';
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as insertPieceStore } from "@/app/services/stores/insertpiece";
import { setStartPosition } from "@/app/services/api/tracklayout";
import { MOVE_INCREMENT } from "@/app/config/config";

// Key Event Handler for Edit Mode
// Note that all key event handlers need to be called from keynoardEventHandler.tsx
export function handleKeyDown(key: string) {
  if (editModeStore.isEditMode()) {
    const trackLayout: UiLayout = trackLayoutStore.getTrackLayout() as UiLayout;
    const piece = trackLayout.pieces.find(piece => piece.id == 0) as UiLayoutPiece;
    const attributes = piece.attributes as UiAttributesPosition;

    switch (key) {
      case 'ArrowUp':
        attributes.position.y += MOVE_INCREMENT;
        break;
      case 'ArrowDown':
        attributes.position.y -= MOVE_INCREMENT;
        break;
      case 'ArrowLeft':
        attributes.position.x -= MOVE_INCREMENT;
        break;
      case 'ArrowRight':
        attributes.position.x += MOVE_INCREMENT;
        break;
      case 'Insert':
        insertPieceStore.toggleInsertPiece();
      default:
        // Exit this function
        return;
    }

    setStartPosition(attributes.position)
    .then((layoutData: UiLayout) => {
        trackLayoutStore.setTrackLayout(layoutData);
      })
      .catch((error: Error) => {
        errorStore.setError(error.message);
        console.error("handleKeyDown().setStartPosition()", error);
      });
  }
}
