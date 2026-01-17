import { JSX } from "@emotion/react/jsx-runtime";
import { capitalCase } from "change-case";
import { Card, CardContent, Grid, Stack } from "@mui/material";
import { KEYS, UI_CATEGORY } from "@/app/services/keyeventhandlers/keydefinitions";

import styles from "./keyboardshortcuts.module.css"
import csStyles from "./controlssection.module.css";

export default function KeyboardShortcuts() {
  return (
      <Card className={styles.card}>
        <CardContent className={styles.cardContent}>
            <div className={styles.heading}>Keyboard Shortcuts</div>
            <Grid container spacing={1}>
              <Grid size="auto">
                <Stack>{ renderKeys() }</Stack>
              </Grid>
              <Grid size="grow">
                <Stack>{ renderDescriptions() }</Stack>
              </Grid>
            </Grid>
        </CardContent>
      </Card>
    )
}

// Render the list of keyboard shortcut keys
function renderKeys(): JSX.Element[] {
  const listItems: JSX.Element[] = [];

  Object.entries(KEYS).flatMap(([key, value]) => {
    const style = (key == UI_CATEGORY ? styles.category : csStyles.text);
    const item = getKeyName(value) + (key == UI_CATEGORY ? ':' : '');

    listItems.push(
      <div key={key} className={style}><b>{item}</b></div>
    )
  });

  return listItems;
}

// Render the list of descriptions for the keyboard shortcuts
function renderDescriptions(): JSX.Element[] {
  const listItems: JSX.Element[] = [];

  Object.entries(KEYS).flatMap(([key, value]) => {
    const item = (key == UI_CATEGORY ? '\u00A0' :capitalCase(key));
    const style = (key == UI_CATEGORY ? styles.category : csStyles.text);

    listItems.push(
      <div key={key} className={style}>{item}</div>
    )
  });

  return listItems;
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
