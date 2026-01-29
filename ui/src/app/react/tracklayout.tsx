"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { UiLayout } from "trainbrain-shared"
import { CircularProgress, Stack } from "@mui/material";
import Error from "./error";
import { getTrackLayout } from "@/app/services/api/tracklayout"
import { store as editModeStore } from "../services/stores/editmode";
import { store as errorStore } from "@/app/services/stores/error";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as scrollStore } from "@/app/services/stores/scroll";
import { store as zoomStore } from "@/app/services/stores/zoomfactor";
import { getBackgroundImageStyle } from "../services/zoom/scrollbar/backgroundimage";
import Scrollbar from "./scrollbar";

import styles from "./tracklayout.module.css";
import SvgEditMode from "./svgeditmode";
import SvgRegular from "./svgregular";

export default function TrackLayout()
{
  // These hooks automatically subscribes and returns the latest snapshot
  const zoomState = useSyncExternalStore(zoomStore.subscribe, zoomStore.getSnapshot, zoomStore.getServerSnapshot);
  const scrollState = useSyncExternalStore(scrollStore.subscribe, scrollStore.getSnapshot, scrollStore.getServerSnapshot);
  const editModeState = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);

  const [loading, setLoading] = useState<Boolean>(true);

  // Fetch the layout from the back-end server
  useEffect(() => {
    getTrackLayout()
      .then((layoutData: UiLayout) => {
        trackLayoutStore.setTrackLayout(layoutData);
        setLoading(false);
      })
      .catch((error: Error) => {
        setLoading(false);
        console.error("Error fetching layout from backend server", error);
        errorStore.setError(error.message);
      });
  }, []);

  if (loading) {
    return (
      <CircularProgress className={styles.progress} />
    )
  }

  const handleVerticalScroll = (factor: number) => {3
    scrollStore.setYScrollPos(100 * factor);
  }

  const handleHorizontalScroll = (factor: number) => {
    scrollStore.setXScrollPos(100 * factor);
  }

  // The size of the world box
  const worldHeight = 15000; // Milimeters
  const worldWidth = 13130; // Milimeters

  // Get the css style object for the background image
  const divStyle = getBackgroundImageStyle(scrollState.xScrollPercent, scrollState.yScrollPercent, zoomState.zoomFactor);

  // Render the track layout (and any error message if present)
  // Note that the coordinates represent mm in real life
  return (
    <Stack direction="row">
      <Stack>
        <div
          className={styles.trackLayoutContainer}
          style={divStyle}
        >
          { editModeState.editMode && <SvgEditMode worldWidth={worldWidth} worldHeight={worldHeight} /> }
          { !(editModeState.editMode) && <SvgRegular worldWidth={worldWidth} worldHeight={worldHeight} /> }
          <Error />
        </div>
        <Scrollbar onScrollPercentage={handleHorizontalScroll} orientation="horizontal" disabled={zoomState.zoomFactor == 1}></Scrollbar>
      </Stack>
      <Stack>
        <Scrollbar onScrollPercentage={handleVerticalScroll} orientation="vertical"disabled={zoomState.zoomFactor == 1}></Scrollbar>
        <div className={styles.bottomLeftCorner}>
          &nbsp;
        </div>
      </Stack>
    </Stack>
  )
}
