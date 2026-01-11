import { Card, CardContent, Stack } from "@mui/material";
import { TrackPieceDef } from "trainbrain-shared";

interface props {
  name: string;
  definition: TrackPieceDef;
}

import styles from "./piecedefcard.module.css"

export default function PieceDefCard({name, definition}: props) {
  return (
    <Card sx={{ flexShrink: 0}}>
      <CardContent className={styles.cardContent}>
        <Stack className={styles.pieceContainer} key={name}>
          <div className={styles.name}>
            {name}
          </div>
          <div className={styles.category}>
            {definition.category}
          </div>
          <div className={styles.description}>
            {definition.description}.
            </div>
        </Stack>
      </CardContent>
    </Card>
  )
}
