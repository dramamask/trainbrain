"use client";

import { useEffect, useState } from "react";
import { CircularProgress, Stack } from "@mui/material";
import { TrackPieceDef, TrackPieceDefList } from "trainbrain-shared";
import { getPieceDef } from "@/app/services/api/piecedef";
import { store as pieceDefStore } from "@/app/services/stores/piecedefs";
import { store as errorStore } from "@/app/services/stores/error";

import styles from "./piecedefs.module.css";

export default function ControlsSection() {
  const [loading, setLoading] = useState<Boolean>(true);

  // Fetch the layout from the back-end server
  useEffect(() => {
    getPieceDef()
      .then((pieceDefList: TrackPieceDefList) => {
        pieceDefStore.setPieceDefs(pieceDefList);
        setLoading(false);
      })
      .catch((error: Error) => {
        setLoading(false);
        console.error("Error fetching track piece definitions from backend server", error);
        errorStore.setError(error.message);
      });
  }, []);

  if (loading) {
    return (
      <CircularProgress className={styles.progress} />
    )
  }

  return (
    <Stack className={styles.stackContainer}>
      <div>
        { renderPieceDefList(pieceDefStore.getPieceDefList()) }
      </div>
    </Stack>
  )
}

// Render the list of piece definitions
function renderPieceDefList(pieceDefs: any) {
  return (
    Object.entries(pieceDefs).map(([key, value]) => getPieceDefComponent(key, value))
  )
}

// Return the component that renders the particular piece definition
function getPieceDefComponent(key: string, value: TrackPieceDef) {
  return (
    <Stack className={styles.pieceContainer}>
      <div className={styles.name}>
        {key}
      </div>
      <div className={styles.description}>
        {value.description}
        </div>
    </Stack>
  )
}
