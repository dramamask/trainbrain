import { Grid, Stack } from "@mui/material";
import PieceDefs from "./piecedefslist/piecedefs";
import Info from "./info";
import KeyboardShortcuts from "./keyboardshortcuts";

import styles from "./controlssection.module.css";

// The main container for the controlssection
export default function ControlsSection() {
  return (
    <div className={styles.mainContainer}>
      <Grid container spacing="10px">
        <Grid size="auto">
          <PieceDefs />
        </Grid>
        <Grid size="auto">
          <Stack spacing="10px">
            <Info />
            <KeyboardShortcuts />
          </Stack>
        </Grid>
        <Grid size="grow">
          &nbsp;
        </Grid>
      </Grid>
    </div>
  )
}
