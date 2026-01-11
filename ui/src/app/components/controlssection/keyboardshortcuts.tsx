import { Card, CardContent, Stack } from "@mui/material";

import styles from "./keyboardshortcuts.module.css"

export default function KeyboardShortcuts() {
  return (
      <Card className={styles.card}>
        <CardContent className={styles.cardContent}>
          <Stack className={styles.stack} spacing={1}>

          </Stack>
        </CardContent>
      </Card>
    )
}