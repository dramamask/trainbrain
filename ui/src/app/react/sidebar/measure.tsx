"use client";

import React, { useSyncExternalStore } from "react";
import { Stack, Switch } from "@mui/material"
import { store as measureStore } from "@/app/services/stores/measure";

import styles from "./switchcontrol.module.css";
import sidebarStyles from "./sidebar.module.css";

export default function Measure() {
  // This hook automatically subscribes and returns the latest snapshot
  const state = useSyncExternalStore(measureStore.subscribe, measureStore.getSnapshot, measureStore.getServerSnapshot);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    measureStore.toggle(event.target.checked);
  }

  return (
    <Stack spacing={0}>
        <div className={sidebarStyles.label}>Measure</div>
        <div className={styles.stackItem}>
          <Switch className={styles.switch}
            checked={state.enabled}
            onChange={handleChange}
          />
        </div>
      </Stack>
  )
}
