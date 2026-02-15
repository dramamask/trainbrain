import { Card, CardContent, Stack } from "@mui/material";

import csStyles from "./controlssection.module.css";
import styles from "./piecesused.module.css";

interface Props {
  // Define any props that PiecesUsed component expects
}

/**
 * UI section that shows which pieces are used in the layout.
 */
export default function PiecesUsed(props: Props) {
  return (
      <Card className={csStyles.card + " " + styles.card}>
        <CardContent className={csStyles.cardContent}>
          <div className={csStyles.heading}>Pieces in Layout</div>
        </CardContent>
      </Card>
  )
}
