"use client";

import dynamic from "next/dynamic";
import { Grid } from "@mui/material";
import TrackLayout from "@/app/components/tracklayout";

import styles from "./page.module.css";

export default function Home()
{
  return (
    <div className={styles.appContainer}>
      <div className={styles.header}>
        <Grid
          container
          spacing={0} // Horizontal spacing in between grid items
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          <Grid size={2}>
            <div className={styles.logoContainer}>
              <img className={styles.logo} src="/trainbrain-logo.png" />
            </div>
          </Grid>
          <Grid size="grow">
            {/* Future menu items go here */}
          </Grid>
        </Grid>
      </div>
      <div className={styles.trackLayoutContainer}>
        <TrackLayout />
      </div>
    </div>
  )
}
