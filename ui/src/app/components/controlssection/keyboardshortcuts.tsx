import { Card, CardContent, Stack } from "@mui/material";
import { KEY } from "@/app/services/keyeventhandlers/keydefinitions";

import styles from "./keyboardshortcuts.module.css"

export default function KeyboardShortcuts() {
  return (
      <Card className={styles.card}>
        <CardContent className={styles.cardContent}>
          <Stack className={styles.stack} spacing={1}>
            {
              Object.entries(KEY).flatMap(([key, value]) => {
                console.log(key);
                return "something"; // TODO: make this part
              })
            }
          </Stack>
        </CardContent>
      </Card>
    )
}