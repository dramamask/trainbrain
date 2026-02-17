'use client'

import { JSX, useSyncExternalStore } from "react";
import { Card, CardContent, Grid, Stack } from "@mui/material";
import { store as layoutStore } from "@/app/services/stores/tracklayout";
import { store as pieceDefStore } from "@/app/services/stores/piecedefs";
import { store as editModeStore } from "@/app/services/stores/editmode";
import {
  PieceDefCurveAttributes,
  PieceDefStraightAttributes,
  PieceDefSwitchAttributes,
  UiLayout
} from "trainbrain-shared";

import csStyles from "./controlssection.module.css";
import styles from "./piecesused.module.css";

interface Props {
  // Define any props that PiecesUsed component expects
}

/**
 * UI section that shows which pieces are used in the layout.
 */
export default function PiecesUsed(props: Props) {
  const layoutState = useSyncExternalStore(layoutStore.subscribe, layoutStore.getSnapshot, layoutStore.getServerSnapshot);
  const editModeState = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);

  if (editModeState.editMode) {
    return null;
  }

  return (
      <Card className={csStyles.card + " " + styles.card}>
        <CardContent className={csStyles.cardContent}>
          <div className={csStyles.heading}>Pieces in Layout</div>
            <Stack>
              { renderPiecesUsed(layoutState.trackLayout) }
          </Stack>
          { renderTotalStraightLength(layoutState.trackLayout) }
        </CardContent>
      </Card>
  )
}

/**
 * Render the pieces that are used
 * @param trackLayout
 * @returns
 */
function renderPiecesUsed(trackLayout: UiLayout): JSX.Element[] {
  if (!('piecesUsed' in trackLayout)) {
    return [];
  }

  return (
    Object.entries(trackLayout.piecesUsed.pieces).map(([pieceDefId, numOf]) => {
      return (
        <Grid container spacing={1}>
          <Grid className={csStyles.text} size={10}><b>{getPieceName(pieceDefId)}</b></Grid>
            <Grid className={csStyles.text} size={2} sx={{ textAlign: 'right' }}>{numOf}</Grid>
        </Grid>
      )
    })
  )
}

/**
 * Render the total length of straight pieces used in the layout
 */
function renderTotalStraightLength(trackLayout: UiLayout): JSX.Element | null {
  if (!('piecesUsed' in trackLayout)) {
    return null;
  }

  return (
    <div className={csStyles.text + " " + styles.total}>
      <b>{(trackLayout.piecesUsed.straightLength / 304.8).toFixed(1)} feet of straights</b>
    </div>
  )
}

/**
 * Get the "name" of the piece
 */
function getPieceName(pieceDefId: string): string {
  const pieceDef = pieceDefStore.getPieceDefData(pieceDefId);

  switch(pieceDef?.category) {
    case "straight":
      const straightAttr = pieceDef.attributes as PieceDefStraightAttributes;
      return `Straight ${straightAttr.length}mm`;
    case "curve":
      let curveAttr = pieceDef.attributes as PieceDefCurveAttributes;
      return `Curve ${curveAttr.lgbRadius} ${curveAttr.angle}°`;
    case "switch":
      const switchAttr = pieceDef.attributes as PieceDefSwitchAttributes;
      return `Switch ${switchAttr.lgbRadius} ${switchAttr.variant}`;
  };

  return "";
}
