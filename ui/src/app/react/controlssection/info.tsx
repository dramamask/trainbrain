'use client'

import { useSyncExternalStore } from "react";
import { Card, CardContent, Grid, Stack } from "@mui/material";
import { store as mousePosStore } from "@/app/services/stores/mousepos";

import csStyles from "./controlssection.module.css";
import styles from "./info.module.css";

export default function KeyboardShortcuts() {
  const mousePosState = useSyncExternalStore(mousePosStore.subscribe, mousePosStore.getSnapshot, mousePosStore.getServerSnapshot);

  return (
      <Card className={csStyles.card + " " + styles.card}>
        <CardContent className={csStyles.cardContent}>
            <div className={csStyles.heading}>Info</div>
            <div className={csStyles.text}><b>x:</b> {Math.round(mousePosState.x)}, <b>y:</b> {Math.round(mousePosState.y)}</div>
        </CardContent>
      </Card>
    )
}
