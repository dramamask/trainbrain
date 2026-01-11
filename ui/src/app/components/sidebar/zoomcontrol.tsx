"use client";

import React, { useSyncExternalStore } from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { store as zoomFactorStore } from "@/app/services/stores/zoomfactor";

import sideBarStyles from "./sidebar.module.css";
import styles from "./zoomcontrol.module.css";

export default function zoomControl() {
  // This hook automatically subscribes and returns the latest snapshot
  useSyncExternalStore(zoomFactorStore.subscribe, zoomFactorStore.getSnapshot, zoomFactorStore.getServerSnapshot);

  const handleChange = (event: SelectChangeEvent) => {
    zoomFactorStore.setZoomFactor(Number(event.target.value));
  };

  return (
    <FormControl variant="standard">
      <div className={sideBarStyles.label}>Zoom</div>
      <Select
        value={zoomFactorStore.getZoomFactor()}
        onChange={handleChange}
      >
        <MenuItem value={1}>100%</MenuItem>
        <MenuItem value={2}>200%</MenuItem>
        <MenuItem value={3}>300%</MenuItem>
        <MenuItem value={4}>400%</MenuItem>
        <MenuItem value={5}>500%</MenuItem>
      </Select>
    </FormControl>
  )
}
