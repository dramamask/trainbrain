"use client";

import TrackLayout from "@/app/components/tracklayout";

import styles from "./page.module.css";

export default function Home()
{
  return (
    <div className={styles.trackLayoutContainer}>
      <TrackLayout />
    </div>
  )
}
