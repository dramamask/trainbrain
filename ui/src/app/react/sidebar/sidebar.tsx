import { Stack } from "@mui/material"
import EditMode from "./editmode";
import LayoutSelect from "./layoutselect";
import Measure from "./measure";
import ZoomControl from "./zoomcontrol";

import styles from "./sidebar.module.css";

// The main container for the side bar
export default function SideBar() {
  return (
    <Stack className={styles.mainStack} spacing={3}>
      <div className={styles.logoContainer}>
        <img className={styles.logo} src="/trainbrain-logo-transparent.png" />
      </div>
      <LayoutSelect />
      <ZoomControl />
      <EditMode />
      <Measure />
    </Stack>
  )
}
