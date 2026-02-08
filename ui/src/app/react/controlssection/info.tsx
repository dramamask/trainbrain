'use client'

import { useSyncExternalStore } from "react";
import { Card, CardContent, Stack } from "@mui/material";
import { store as mousePosStore, getMousePos } from "@/app/services/stores/mousepos";
import { store as measureStore } from "@/app/services/stores/measure";

import csStyles from "./controlssection.module.css";
import styles from "./info.module.css";

export default function Info() {
  const mousePosState = useSyncExternalStore(mousePosStore.subscribe, mousePosStore.getSnapshot, mousePosStore.getServerSnapshot);
  const {mouseInViewBox, x, y} = getMousePos(mousePosState);

  const measureState = useSyncExternalStore(measureStore.subscribe, measureStore.getSnapshot, measureStore.getServerSnapshot);

  let xDisplay = "-    ";
  let yDisplay = "-    ";
  if (mouseInViewBox) {
    xDisplay = Math.round(x).toString();
    yDisplay = Math.round(y).toString();
  }
  xDisplay = xDisplay.padStart(5, " ");
  yDisplay = yDisplay.padStart(5, " ");

  return (
      <Card className={csStyles.card + " " + styles.card}>
        <CardContent className={csStyles.cardContent}>
            <div className={csStyles.heading}>Info</div>
            <Stack direction="row" alignItems="baseline">
              <div className={csStyles.text}><b>x:</b></div>
              <div className={csStyles.text + " " + styles.mousePos}>{xDisplay}</div>
              <div className={styles.comma}></div>
              <div className={csStyles.text}><b>y:</b></div>
              <div className={csStyles.text + " " + styles.mousePos}>{yDisplay}</div>
            </Stack>
            { measureState.enabled && measureState.distance &&
              <Stack className={styles.measurementContainer}>
                <div className={csStyles.text}><b>Measurement:</b></div>
                <div className={csStyles.text}>{Math.round(measureState.distance)} mm / {(measureState.distance / 25.4).toFixed(1)} inches</div>
              </Stack>
            }
        </CardContent>
      </Card>
    )
}
