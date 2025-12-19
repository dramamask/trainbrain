import { Stack } from "@mui/material"
import EditMode from "./editmode";

import styles from "./sidebar.module.css";

export default function SideBar() {
  return (
    <Stack className={styles.mainStack} spacing={4}>
      <div className={styles.logoContainer}>
        <img className={styles.logo} src="/trainbrain-logo.png" />
      </div>
      <EditMode />
    </Stack>
  )
}
