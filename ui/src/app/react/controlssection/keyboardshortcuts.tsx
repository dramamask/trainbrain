import { JSX } from "@emotion/react/jsx-runtime";
import { capitalCase, sentenceCase } from "change-case";
import { Card, CardContent, Grid, Stack } from "@mui/material";
import { KEYS, EDIT_MODE_KEYS, KeyDefintions } from "@/app/services/eventhandlers/keyeventhandlers/keydefinitions";

import styles from "./keyboardshortcuts.module.css"
import csStyles from "./controlssection.module.css";

export default function KeyboardShortcuts() {
  return (
      <Card className={csStyles.card}>
        <CardContent className={csStyles.cardContent}>
            <div className={csStyles.heading}>Controls Summary</div>
            <Grid container spacing={1}>
              <Grid size="auto">
                <Stack>
                  <div className={styles.category}><b>ALLWAYS:</b></div>
                  { renderKeys(KEYS) }
                  <div className={csStyles.text}><b>Mouse wheel</b></div>
                  <div className={csStyles.text}><b>Ctrl Mouse wheel</b></div>
                  <div className={styles.category}><b>ONLY IN EDITMODE:</b></div>
                  { renderKeys(EDIT_MODE_KEYS) }
                  <div className={csStyles.text}><b>Ctrl Arrow</b></div>
                </Stack>
              </Grid>
              <Grid size="grow">
                <Stack>
                  <div className={styles.category}><b>&nbsp;</b></div>
                  { renderDescriptions(KEYS) }
                  <div className={csStyles.text}>Scroll track map</div>
                  <div className={csStyles.text}>Zoom track map</div>
                  <div className={styles.category}><b>&nbsp;</b></div>
                  { renderDescriptions(EDIT_MODE_KEYS) }
                  <div className={csStyles.text}>Move Node Faster</div>
                </Stack>
              </Grid>
            </Grid>
        </CardContent>
      </Card>
    )
}

// Render the list of keyboard shortcut keys
function renderKeys(keys: KeyDefintions): JSX.Element[] {
  const listItems: JSX.Element[] = [];
  Object.entries(keys).flatMap(([key, value]) => {
    listItems.push(
      <div key={key} className={csStyles.text}><b>{getKeyName(value)}</b></div>
    )
  });

  return listItems;
}

// Render the list of descriptions for the keyboard shortcuts
function renderDescriptions(keys: KeyDefintions): JSX.Element[] {
  const listItems: JSX.Element[] = [];
  Object.entries(keys).flatMap(([key, value]) => {
    listItems.push(
      <div key={key} className={csStyles.text}>{sentenceCase(key)}</div>
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
