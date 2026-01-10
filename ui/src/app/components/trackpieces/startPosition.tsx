"use client";

import { useSyncExternalStore } from "react";
import { UiAttributesPosition, UiLayoutPiece } from "trainbrain-shared";
import * as config from "@/app/config/config";
import { store as editModeStore } from "@/app/services/stores/editmode";

export default function startPosition({id, piece}: {id: string, piece: UiLayoutPiece}) {
  const state = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);
  const drawStartPosition = state.editMode;

  if (!drawStartPosition) {
     return null;
  }

  const attributes = piece.attributes as UiAttributesPosition;

  return (
    <g key="0">
      <rect
        x={attributes.position.x - config.START_POS_RADIUS}
        y={attributes.position.y - config.START_POS_RADIUS}
        width={2 * config.START_POS_RADIUS}
        height={2 * config.START_POS_RADIUS}
        fill={config.START_POS_COLOR}
        stroke={config.START_POS_COLOR}
        strokeWidth={1}
        transform={`rotate(45, ${attributes.position.x}, ${attributes.position.y})`}
      />
    </g>
  )
}
