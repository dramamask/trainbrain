"use client"

import { UiAttributesPosition, UiLayout, UiLayoutPiece } from "trainbrain-shared";
import { store as errorStore } from '@/app/services/stores/error';
import { store as editModeStore } from '@/app/services/stores/editmode';
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as selectionStore } from "@/app/services/stores/selection";
import { deleteTrackPiece, rotateTrackPiece, setStartPosition } from "@/app/services/api/tracklayout";
import { MOVE_INCREMENT } from "@/app/config/config";
import { KEY } from "./keydefinitions";

// Key Event Handler for Edit Mode
// Note that all key event handlers need to be called from keynoardEventHandler.tsx
export function handleKeyDown(event: KeyboardEvent) {
  if (editModeStore.isEditMode()) {
    const trackLayout: UiLayout = trackLayoutStore.getTrackLayout() as UiLayout;
    const startPositionPiece = trackLayout.pieces.find(piece => piece.id == "0") as UiLayoutPiece;
    const startPositionAttributes = startPositionPiece.attributes as UiAttributesPosition;

    if (KEY.RotateLayoutPieceInEditMode.includes(event.key)) {
        rotateLayoutPiece(selectionStore.getSelectedTrackPiece());
    }

    switch (event.key) {
      case KEY.DeleteLayoutPieceInEditMode:
        deleteLayoutPiece(selectionStore.getSelectedTrackPiece());
        selectionStore.deselectAll();
        break;
      case KEY.MoveLayoutUpInEditMode:
        startPositionAttributes.coordinate.y += MOVE_INCREMENT;
        storeStartPosition(startPositionAttributes);
        break;
      case KEY.MoveLayoutDownInEditMode:
        startPositionAttributes.coordinate.y -= MOVE_INCREMENT;
        storeStartPosition(startPositionAttributes);
        break;
      case KEY.MoveLayoutLeftInEditMode:
        startPositionAttributes.coordinate.x -= MOVE_INCREMENT;
        storeStartPosition(startPositionAttributes);
        break;
      case KEY.MoveLayoutRightInEditMode:
        startPositionAttributes.coordinate.x += MOVE_INCREMENT;
        storeStartPosition(startPositionAttributes);
        break;
      case KEY.DeselectLayoutPieceInEditMode:
        selectionStore.deselectAll();
        break;
      default:
        // Exit this function
        return;
    }
  }
}

// Call the server API to store the new start position
function storeStartPosition(startPositionAttributes: UiAttributesPosition) {
  setStartPosition(startPositionAttributes.coordinate)
    .then((layoutData: UiLayout) => {
      trackLayoutStore.setTrackLayout(layoutData);
    })
    .catch((error: Error) => {
      errorStore.setError(error.message);
      console.error("handleKeyDown().setStartPosition() error:", error);
    });
}

// Call the server API to delete a layout piece
function deleteLayoutPiece(pieceId: string) {
  deleteTrackPiece(pieceId)
    .then((layoutData: UiLayout) => {
      trackLayoutStore.setTrackLayout(layoutData);
    })
    .catch((error: Error) => {
      errorStore.setError(error.message);
      console.error("handleKeyDown().deleteLayoutPiece() error:", error);
    });
}

// Call the server API to rotate a layout piece
function rotateLayoutPiece(pieceId: string) {
  rotateTrackPiece(pieceId)
    .then((layoutData: UiLayout) => {
      trackLayoutStore.setTrackLayout(layoutData);
    })
    .catch((error: Error) => {
      errorStore.setError(error.message);
      console.error("handleKeyDown().rotateLayoutPiece() error:", error);
    });
}
