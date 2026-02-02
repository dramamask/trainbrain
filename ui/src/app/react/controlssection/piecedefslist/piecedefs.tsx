"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Card, CardContent, CircularProgress, Stack } from "@mui/material";
import { PieceDefData, PieceDefDataList } from "trainbrain-shared";
import { getPieceDef } from "@/app/services/api/piecedef";
import { store as pieceDefStore } from "@/app/services/stores/piecedefs";
import { store as errorStore } from "@/app/services/stores/error";
import { store as editModeStore } from "@/app/services/stores/editmode";
import { getUiPieceDefList, PieceDefWithName } from "@/app/services/piecedef";
import PieceDefCard from "./piecedefcard";

import styles from "./piecedefs.module.css";

export default function ControlsSection() {
  const editModeState = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);
  const inEditMode = editModeState.editMode;

  const [loading, setLoading] = useState<Boolean>(true);

  // Fetch the layout from the back-end server
  useEffect(() => {
    getPieceDef()
      .then((pieceDefList: PieceDefDataList) => {
        pieceDefStore.setPieceDefs(pieceDefList);
        setLoading(false);
      })
      .catch((error: Error) => {
        setLoading(false);
        console.error("Error fetching track piece definitions from backend server", error);
        errorStore.setError(error.message);
      });
  }, []);

  // Only show the piece definitions list in edit mode
  if (!inEditMode) {
    return false;
  }

  if (loading) {
    return (
      <CircularProgress className={styles.progress} />
    )
  }

  return (
    <Card className={styles.card}>
      <CardContent className={styles.cardContent}>
        <Stack className={styles.stack} spacing={1}>
          { renderPieceDefList(getUiPieceDefList()) }
        </Stack>
      </CardContent>
    </Card>
  )
}

// Render the list of piece definitions
function renderPieceDefList(pieceDefs: PieceDefWithName[]) {
  return (
    pieceDefs.map((data, index) => getPieceDefComponent(index, data.name, data.pieceDef))
  )
}

// Return the component that renders the particular piece definition
function getPieceDefComponent(key: number, name: string, definition: PieceDefData) {
  return (
    <PieceDefCard key={key} name={name} definition={definition} />
  )
}
