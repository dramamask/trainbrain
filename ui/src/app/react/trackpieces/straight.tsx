"use client";

import { useSyncExternalStore } from "react";
import { UiLayoutPiece } from "trainbrain-shared";
import EditModePiece from "./editMode/straight";
import RegularModePiece from "./regular/straight";
import { store as editModeStore } from "@/app/services/stores/editmode";

interface props {
  piece: UiLayoutPiece;
}

// Straight track piece component
export default function Straight({piece}: props) {
  const editModeState = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);
  const inEditMode = editModeState.editMode;

  if (inEditMode) {
    return <EditModePiece piece={piece}/>;
  }
  return <RegularModePiece piece={piece}/>;
}
