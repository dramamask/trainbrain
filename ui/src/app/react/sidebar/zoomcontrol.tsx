"use client";

import { useSyncExternalStore } from "react";
import { JSX } from "@emotion/react/jsx-runtime";
import { FormControl, MenuItem, Select } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { store as zoomFactorStore, MAX_ZOOM_FACTOR } from "@/app/services/stores/zoomfactor";

import sideBarStyles from "./sidebar.module.css";

const fontSize = "0.8em";

export default function zoomControl() {
  // This hook automatically subscribes and returns the latest snapshot
  const zoomState = useSyncExternalStore(zoomFactorStore.subscribe, zoomFactorStore.getSnapshot, zoomFactorStore.getServerSnapshot);

  const handleChange = (event: SelectChangeEvent<number>) => {
    zoomFactorStore.setZoomFactor(Number(event.target.value));
  };

  return (
    <FormControl variant="standard">
      <div className={sideBarStyles.label}>Zoom</div>
      <Select
        value={zoomState.zoomFactor}
        onChange={handleChange}
        sx={{ fontSize: fontSize, lineHeight: '2'}}
      >
        {renderItems()}
      </Select>
    </FormControl>
  )
}

// Render the list of items in the zoom select control
function renderItems(): JSX.Element[] {
  const listItems: JSX.Element[] = [];

  for (let i: number = 1; i <= MAX_ZOOM_FACTOR; i++) {
    listItems.push(
      <MenuItem key={i} value={i} sx={{ fontSize: fontSize}}>
        {getZoomPercentage(i)}
      </MenuItem>)
  }

  return listItems;
}

// Convert the zoom factor number to zoom percentage string
function getZoomPercentage(zoomFactor: number): string {
  return ((zoomFactor * 100).toString() + "%");
}