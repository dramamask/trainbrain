import { capitalCase } from "change-case";
import { Card, CardContent, Grid, Stack } from "@mui/material";
import { KEY } from "@/app/services/keyeventhandlers/keydefinitions";

import styles from "./keyboardshortcuts.module.css"
import csStyles from "./controlssection.module.css";

export default function KeyboardShortcuts() {
  return (
      <Card className={styles.card}>
        <CardContent className={styles.cardContent}>
          <Stack className={styles.stack}>
            <div className={csStyles.title + " " + styles.heading}>Keyboard Shortcuts</div>
            {
              Object.entries(KEY).flatMap(([key, value]) => {
                return (
                    <Grid container key={key}>
                      <Grid className={csStyles.text} size={3.5}><b>{getKeyName(value)}</b></Grid>
                      <Grid className={csStyles.text + " " + styles.text} size="grow">{capitalCase(key)}</Grid>
                    </Grid>
                )
              })
            }
          </Stack>
        </CardContent>
      </Card>
    )
}

// Make sure we handle things well when keyName is an array
function getKeyName(keyName: any): string {
  if (Array.isArray(keyName)) {
    return keyName.join(", ");
  }
  return humanReadableKeyName(keyName);
}

// Make key names more human readable
function humanReadableKeyName(keyName: string): string {
  if (keyName.length == 1) {
    return keyName;
  }

  return capitalCase(keyName);
}
