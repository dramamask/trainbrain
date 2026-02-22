'use client'

import { useSyncExternalStore } from "react";
import { Card, CardContent, Stack } from "@mui/material";
import { store as mousePosStore, getMousePos } from "@/app/services/stores/mousepos";
import { store as measureStore } from "@/app/services/stores/measure";
import { store as selectedStore} from "@/app/services/stores/selection";

import csStyles from "./controlssection.module.css";
import styles from "./info.module.css";

const INCH = 25.4; // millimeters

/**
 * React component for the Info panel
 */
export default function Info() {
  const mousePosState = useSyncExternalStore(mousePosStore.subscribe, mousePosStore.getSnapshot, mousePosStore.getServerSnapshot);
  const {mouseInViewBox, x, y} = getMousePos(mousePosState);

  const measureState = useSyncExternalStore(measureStore.subscribe, measureStore.getSnapshot, measureStore.getServerSnapshot);

  const selectedState = useSyncExternalStore(selectedStore.subscribe, selectedStore.getSnapshot, selectedStore.getServerSnapshot);

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
              <Stack className={styles.infoContainer}>
                <div className={csStyles.text}><b>Measurement:</b></div>
                <div className={csStyles.text}>
                  <Stack>
                    <div>{ Math.round(measureState.distance) } mm</div>
                    <div>{ getInches(measureState.distance) }</div>
                    <div>{ getFeetAndInches(measureState.distance) }</div>
                  </Stack>
                </div>
              </Stack>
            }
            { selectedState.selectedNode &&
              <Stack className={styles.infoContainer} direction="row">
                <div className={csStyles.text}><b>Selected Node:</b>&nbsp;</div>
                <div className={csStyles.text}>{ selectedState.selectedNode }</div>
              </Stack>
            }
            { selectedState.selectedLayoutPiece &&
              <Stack className={styles.infoContainer} direction="row">
                <div className={csStyles.text}><b>Selected Piece: </b>&nbsp;</div>
                <div className={csStyles.text}>{ selectedState.selectedLayoutPiece }</div>
              </Stack>
            }
        </CardContent>
      </Card>
    )
}

function getInches(mm: number): string {
  const inches = (mm / INCH);

  if (inches <= 12) {
    return `${inches.toFixed(1)} inches`;
  }

  return (Math.round(inches).toString() + " inches");
}

function getFeetAndInches(mm: number): string {
  const feet = Math.floor(mm / (12 * INCH));

  if (feet < 1) {
    return "";
  }

  const leftOver = mm - (feet * 12 * INCH);
  const inches = Math.round(leftOver / INCH);

  let footName = "feet";
  let inchName = "inches";

  if (feet <= 1) {
    footName = "foot";
  }

  if (inches <= 1) {
    inchName = "inch";
  }

  return `${feet} ${footName} ${inches} ${inchName}`
}
