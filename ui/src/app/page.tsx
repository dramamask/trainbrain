"use client";

import dynamic from "next/dynamic";
import { Box, Grid } from "@mui/material";
import TrackLayout from "@/app/components/tracklayout";

import styles from "./page.module.css";

export default function Home()
{
  return (
    <Box height="100dvh">
        <Grid
          container
          spacing={0} // Horizontal spacing in between grid items
          justifyContent="flex-start"
          alignItems="stretch"
        >
          <Grid size={1}>
            <div className={styles.logoContainer}>
              <img className={styles.logo} src="/trainbrain-logo.png" />
            </div>
          </Grid>
          <Grid size="grow">
            <div className={styles.trackLayoutContainer}>
              <TrackLayout />
            </div>
          </Grid>
        </Grid>
    </Box>
  )
}
