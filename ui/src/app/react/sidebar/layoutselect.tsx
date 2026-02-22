'use client'

import { JSX, useEffect, useState } from "react";
import { CircularProgress, FormControl, MenuItem, Select } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { getLayouts } from "@/app/services/api/layouts";
import { store as errorStore } from "@/app/services/stores/error";
import type { LayoutNamesData } from "trainbrain-shared";

import styles from "./layoutselect.module.css";
import sideBarStyles from "./sidebar.module.css";

const fontSize = "0.8em";

/**
 * React control to select the active layout
 */
export default function LayoutSelect() {
  const [layoutNames, setLayoutNames] = useState<LayoutNamesData>({ activeLayout: "", layouts: {} });
  const [activeLayout, setActiveLayout] = useState<string>("");
  const [loading, setLoading] = useState<Boolean>(true);

  // Fetch the layout from the back-end server
  useEffect(() => {
    getLayouts()
      .then((layoutNames: LayoutNamesData) => {
        setLayoutNames(layoutNames);
        setActiveLayout(layoutNames.activeLayout)
        setLoading(false);
      })
      .catch((error: Error) => {
        setLoading(false);
        console.error("Error fetching layout names from backend server", error);
        errorStore.setError(error.message);
      });
  }, []);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setActiveLayout(event.target.value);
  };

  if (loading) {
    return (
      <CircularProgress className={styles.progress} />
    )
  }

  console.log("layoutNames", layoutNames);

  return (
    <FormControl variant="standard">
      <div className={sideBarStyles.label}>Layouts</div>
      <Select
        value={activeLayout}
        onChange={handleChange}
        sx={{ fontSize: fontSize, lineHeight: '2'}}
      >
        {renderItems(layoutNames)}
      </Select>
    </FormControl>
  )
}

// Render the list of items in the zoom select control
function renderItems(layoutNames: LayoutNamesData): JSX.Element[] {
  const listItems: JSX.Element[] = [];

  Object.entries(layoutNames).forEach(([id, name]) => {
    listItems.push(
      <MenuItem key={id} value={name} sx={{ fontSize: fontSize}}>
        {name}
      </MenuItem>)
  });

  return listItems;
}
