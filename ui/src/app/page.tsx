import { Box, Grid } from "@mui/material";

import KeyboardEventHandler from "@/app/components/keyboardEventHandler";
import SideBar from "@/app/components/sidebar/sidebar";
import TrackLayout from "@/app/components/tracklayout";

import styles from "./page.module.css";

export default function Home() {
  return (
    <Box height="100dvh">
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
          <Grid sx={{width: '483px'}}>
            <div className={styles.trackLayoutContainer}>
              <TrackLayout />
            </div>
          </Grid>
          <Grid size="grow">
            Controls go here
          </Grid>
        </Grid>
    </Box>
  )
}
