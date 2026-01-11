import { JSX } from "@emotion/react/jsx-runtime";
import { capitalCase } from "change-case";
import { Card, CardContent, Grid, Stack } from "@mui/material";
import { KEY } from "@/app/services/keyeventhandlers/keydefinitions";

import styles from "./keyboardshortcuts.module.css"
import csStyles from "./controlssection.module.css";

export default function KeyboardShortcuts() {
  return (
      <Card className={styles.card}>
        <CardContent className={styles.cardContent}>
            <div className={csStyles.title + " " + styles.heading}>Keyboard Shortcuts</div>
            <Grid container spacing={1}>
              <Grid size="auto">
                <Stack>{ renderKeys(KEY) }</Stack>
              </Grid>
              <Grid size="grow">
                <Stack>{ renderDescriptions(KEY) }</Stack>
              </Grid>
            </Grid>
        </CardContent>
      </Card>
    )
}

// Render the list of keys for the keyboard shortcut list
function renderKeys(keyObjectList: object): JSX.Element[] {
  const listItems: JSX.Element[] = [];

  Object.entries(keyObjectList).flatMap(([key, value]) => {
    listItems.push(
      <div key={key} className={csStyles.text}><b>{getKeyName(value)}</b></div>
    )
  });

  return listItems;
}

// Render the list of descriptions for the keyboard shortcut list
function renderDescriptions(keyObjectList: object): JSX.Element[] {
  const listItems: JSX.Element[] = [];

  Object.entries(keyObjectList).flatMap(([key, value]) => {
    listItems.push(
      <div className={csStyles.text}>{capitalCase(key)}</div>
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
