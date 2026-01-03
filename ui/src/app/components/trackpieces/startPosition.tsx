"use client";

import { useSyncExternalStore } from "react";
import { Coordinate } from "trainbrain-shared";
import * as config from "@/app/config/config";
import { store as editModeStore } from "@/app/services/stores/editmode";

export default function startPosition({position}: {position: Coordinate}) {
  const state = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);
  const drawStartPosition = state.editMode;

  if (!drawStartPosition) {
     return null;
  }

  return (
   <g key="0">
    <circle
      cx={position.x}
      cy={position.y}
      r={config.START_POS_INDICATOR_RADIUS}
      fill={config.START_POS_INDICATOR_COLOR}
      stroke={config.START_POS_INDICATOR_COLOR}
      strokeWidth={1}
    />
   </g>
  )
}
