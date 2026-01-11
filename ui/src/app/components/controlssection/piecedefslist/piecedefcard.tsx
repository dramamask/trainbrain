import { Card, CardContent, Stack } from "@mui/material";
import { ConnectionName, TrackPieceDef, UiLayout } from "trainbrain-shared";
import { store as selectionStore } from "@/app/services/stores/selection";
import { store as errorStore } from "@/app/services/stores/error";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as pieceDefStore } from "@/app/services/stores/piecedefs";
import { insertTrackPiece } from "@/app/services/api/tracklayout";

interface props {
  name: string;
  definition: TrackPieceDef;
}

import styles from "./piecedefcard.module.css"
import controlsSectionStyles from "../controlssection.module.css";

export default function PieceDefCard({name, definition}: props) {
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    const selectedLayoutPiece = selectionStore.getSelectedTrackPiece();
    if (selectedLayoutPiece == "") {
      errorStore.setError(getNoLayoutPieceSelectedMessage());
      return;
    }

    const selectedConnector = selectionStore.getSelectedConnector();
    if (selectedConnector == "") {
      errorStore.setError(getNoConnectorSelectedMessage());
      return;
    }

    insertTrackPieceInLayout(name, selectedLayoutPiece, selectedConnector as ConnectionName);
  };

  return (
    <Card
      sx={{ flexShrink: 0} /* Do not shrink the card when the container is too small to fit all the cards*/}
      onClick={handleClick}
    >
      <CardContent className={styles.cardContent}>
        <Stack className={styles.pieceContainer} key={name}>
          <div className={controlsSectionStyles.title + " " + styles.title}>
            {name}
          </div>
          <div className={controlsSectionStyles.category + " " + styles.category}>
            {definition.category}
          </div>
          <div className={controlsSectionStyles.text + " " + styles.text}>
            {definition.description}.
            </div>
        </Stack>
      </CardContent>
    </Card>
  )
}

// Call the API endpoint to insert the track piece into the layout.
// The endpoint returns the new UI Layout definition. We store that in the trackLayoutStore.
function insertTrackPieceInLayout(
  pieceDefName:string, selectedLayoutPiece: string, selectedConnector: ConnectionName
): void {
  const insertedPieceInfo = {
    connectionName: selectedConnector,
    connectToPiece: selectedLayoutPiece,
    pieceDefId: pieceDefName,
    layoutAttributes: getLayoutAttributes(pieceDefName),
  }

  insertTrackPiece(insertedPieceInfo)
    .then((layoutData: UiLayout) => {
        trackLayoutStore.setTrackLayout(layoutData);
      })
      .catch((error: Error) => {
        errorStore.setError(error.message);
        console.error("handleKeyDown().setStartPosition()", error);
      });
}

// Assemble layout attributes for the piece that is about to be inserted
function getLayoutAttributes(pieceDefName: string): object {
  let attributes = {};

  const data = pieceDefStore.getPieceDefData(pieceDefName);
  if (data == undefined) {
    errorStore.setError("Unexpected error. No data found for pieceDefName.")
    return {};
  }

  if (data.category == "curve") {
    attributes = {direction: "left"};
  }

  return attributes;
}

function getNoLayoutPieceSelectedMessage(): string {
  let msg = "First select a track piece in the layout. Then select one of the layout piece connectors. ";
  msg += "Next, click on an item in the list to insert that particular piece into the layout. "
  msg += "The new piece will be inserted to the selected connector (which is outlined in red).";

  return msg;
}

function getNoConnectorSelectedMessage(): string {
  let msg = "Select one of the layout piece connectors. ";
  msg += "Then click on an item in the list to insert that particular piece into the layout. "
  msg += "The new piece will be inserted to the selected connector (which is outlined in red).";

  return msg;
}
