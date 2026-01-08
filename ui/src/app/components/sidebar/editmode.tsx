"use client";

import React, { useSyncExternalStore } from "react";
import { Stack, Switch } from "@mui/material"
import { store as editModeStore } from "@/app/services/stores/editmode";

import styles from "./editmode.module.css";
import sidebarStyles from "./sidebar.module.css";

export default function EditMode() {
  // This hook automatically subscribes and returns the latest snapshot
  const state = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    editModeStore.setEditMode(event.target.checked);
  }

  return (
    <Stack spacing={0}>
        <div className={sidebarStyles.label}>Edit Mode</div>
        <div className={styles.stackItem}>
          <Switch className={styles.switch}
            checked={state.editMode}
            onChange={handleChange}
          />
        </div>
      </Stack>
  )
}
