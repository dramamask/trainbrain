"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { UiLayout } from "trainbrain-shared"
import { CircularProgress, Stack } from "@mui/material";
import Error from "./dialogs/error";
import Question from "./dialogs/question";
import { getTrackLayout } from "@/app/services/api/tracklayout"
import { store as editModeStore } from "../services/stores/editmode";
import { store as errorStore } from "@/app/services/stores/error";
import { store as scrollStore } from "@/app/services/stores/scroll";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as zoomStore } from "@/app/services/stores/zoomfactor";
import { getBackgroundImageStyle } from "../services/zoom/scrollbar/backgroundimage";
import Scrollbar from "./scrollbar";
import EditModeLayout from "./tracklayout/editmode/tracklayout";
import RegularLayout from "./tracklayout/regular/tracklayout";

import styles from "./trackmap.module.css";

/**
 * The main track layout react component.
 * This component consists of the SVG layout, the background image, the scrollbars, and the error modal window.
 */
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
        trackLayoutStore.setTrackLayoutAndWorldData(layoutData);
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

  // Calculate the background image style from the scroll and zoom situation
  let divStyle = getBackgroundImageStyle(scrollState.xScrollPercent, scrollState.yScrollPercent, zoomState.zoomFactor);
  // Get the background image from the layout definition
  Object.assign(divStyle,  { backgroundImage: `url("/world-images/${trackLayoutStore.getWorldImage()}")` } );

  // Render the track map, which is the track layout with scrollbars, and the error modal window
  // Note that the coordinates represent mm in real life
  const { width: worldWidth, height: worldHeight } = trackLayoutStore.getWorldSize();
  return (
    <Stack direction="row">
      <Stack>
        <div
          className={styles.trackLayoutContainer}
          style={divStyle}
        >
          { editModeState.editMode && <EditModeLayout worldWidth={worldWidth} worldHeight={worldHeight} /> }
          { !(editModeState.editMode) && <RegularLayout worldWidth={worldWidth} worldHeight={worldHeight} /> }
          <Error />
          <Question />
        </div>
        <Scrollbar orientation="horizontal" disabled={zoomState.zoomFactor == 1}></Scrollbar>
      </Stack>
      <Stack>
        <Scrollbar orientation="vertical"disabled={zoomState.zoomFactor == 1}></Scrollbar>
        <div className={styles.bottomLeftCorner}>
          &nbsp;
        </div>
      </Stack>
    </Stack>
  )
}
