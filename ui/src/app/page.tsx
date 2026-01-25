import { Box, Grid } from "@mui/material";

import KeyboardEventHandler from "@/app/components/keyboardEventHandler";
import SideBar from "@/app/components/sidebar/sidebar";
import TrackLayout from "@/app/components/tracklayout";
import ControlsSection from "@/app/components/controlssection/controlssection";

import styles from "./page.module.css";

export default function Home() {
  return (
    <Box className={styles.mainBox} height="100dvh">
        <Grid
          container
          spacing={0} // Horizontal spacing in between grid items
          justifyContent="flex-start"
          alignItems="stretch"
        >
          <KeyboardEventHandler />
          <Grid sx={{ width: '100px'}}>
            <SideBar />
          </Grid>
          <Grid size="auto">
            <div className={styles.trackLayoutContainer}>
              <TrackLayout />
            </div>
          </Grid>
          <Grid size="grow">
            <ControlsSection />
          </Grid>
        </Grid>
    </Box>
  )
}
