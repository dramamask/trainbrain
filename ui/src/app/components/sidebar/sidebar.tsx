import { Stack } from "@mui/material"
import EditMode from "./editmode";
import ZoomControl from "./zoomcontrol";

import styles from "./sidebar.module.css";

// The main container for the side bar
export default function SideBar() {
  return (
    <Stack className={styles.mainStack} spacing={4}>
      <div className={styles.logoContainer}>
        <img className={styles.logo} src="/trainbrain-logo-transparent.png" />
      </div>
      <ZoomControl />
      <EditMode />
    </Stack>
  )
}
