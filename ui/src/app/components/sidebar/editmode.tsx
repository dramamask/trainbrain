import React, { useState } from "react";
import { Stack, Switch } from "@mui/material"
import { editMode } from "../../services/store";

import styles from "./editmode.module.css";

export default function EditMode() {
  const [checked, setChecked] = useState(editMode.isEnabled());

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setChecked(value);
    editMode.set(value);
  }

  return (
    <Stack spacing={0}>
        <div className={styles.label}>Edit Mode</div>
        <div className={styles.stackItem}>
          <Switch className={styles.switch}
            checked={checked}
            onChange={handleChange}
          />
        </div>
      </Stack>
  )
}
