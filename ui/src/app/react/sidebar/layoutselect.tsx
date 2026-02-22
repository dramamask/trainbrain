'use client'

import { JSX, useEffect, useState } from "react";
import { CircularProgress, FormControl, MenuItem, Select } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { getLayouts, setActiveLayout } from "@/app/services/api/layouts";
import { store as errorStore } from "@/app/services/stores/error";
import type { LayoutNamesData, UiLayout } from "trainbrain-shared";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as selectionStore } from "@/app/services/stores/selection";

import styles from "./layoutselect.module.css";
import sideBarStyles from "./sidebar.module.css";

const fontSize = "0.8em";

/**
 * React control to select the active layout
 */
export default function LayoutSelect() {
  const [layoutNames, setLayoutNames] = useState<LayoutNamesData>({ activeLayout: "", layouts: {} });
  const [activeLayoutName, setActiveLayoutName] = useState<string>("");
  const [loading, setLoading] = useState<Boolean>(true);

  // Fetch the layout from the back-end server
  useEffect(() => {
    getLayouts()
      .then((layoutNames: LayoutNamesData) => {
        setLayoutNames(layoutNames);
        setActiveLayoutName(layoutNames.layouts[layoutNames.activeLayout])
        setLoading(false);
      })
      .catch((error: Error) => {
        setLoading(false);
        console.error("Error fetching layout names from backend server", error);
        errorStore.setError(error.message);
      });
  }, []);

  // The user has changed the selection of the active layout
  const handleChange = (event: SelectChangeEvent<string>, child: React.ReactNode) => {
    setActiveLayoutName(event.target.value);

    const item = child as React.ReactElement<{ layoutid: string }>;
    const newActiveLayoutId = item.props.layoutid;

    setActiveLayout(newActiveLayoutId)
      .then((layoutData: UiLayout) => {
        trackLayoutStore.setTrackLayout(layoutData);
        selectionStore.deselectAll();
      })
      .catch((error: Error) => {
        errorStore.setError(error.message);
        console.error(error);
      });
  };

  // Display a spinner when we're loading
  if (loading) {
    return (
      <CircularProgress className={styles.progress} />
    )
  }

  // Render the layout names in a select box
  return (
    <FormControl variant="standard">
      <div className={sideBarStyles.label}>Layout</div>
      <Select
        value={activeLayoutName}
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

  Object.entries(layoutNames.layouts).forEach(([id, name]) => {
    listItems.push(
      <MenuItem key={id} value={name} sx={{ fontSize: fontSize}} layoutid={id}>
        {name}
      </MenuItem>)
  });

  return listItems;
}
