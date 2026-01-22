import { Card, CardContent, Stack } from "@mui/material";
import { AddLayoutPieceData, PieceDefData, UiLayout } from "trainbrain-shared";
import { store as selectionStore } from "@/app/services/stores/selection";
import { store as errorStore } from "@/app/services/stores/error";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { addTrackPiece } from "@/app/services/api/tracklayout";
import { getLastInsertedLayoutPieceAndNodeId } from "@/app/services/tracklayout";

interface props {
  name: string;
  definition: PieceDefData;
}

import styles from "./piecedefcard.module.css"
import controlsSectionStyles from "../controlssection.module.css";

export default function PieceDefCard({name, definition}: props) {
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    addTrackPieceToLayout(name);
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
function addTrackPieceToLayout(pieceDefName:string): void {
  // Get the selected piece (unless the layout is empty)
  let selectedPiece = "";
  if (trackLayoutStore.getTrackLayout().pieces.length > 0) {
    selectedPiece = selectionStore.getSelectedLayoutPiece();
    if (selectedPiece == "") {
      errorStore.setError(getNoPieceSelectedMessage());
    }
  }

  // Get the selected node
  const selectedNode = selectionStore.getSelectedNode();
  if (selectedNode == "") {
    errorStore.setError(getNoNodeSelectedMessage());
    return;
  }

  // Assemble the data for the API call
  const data: AddLayoutPieceData = {
    nodeId: selectedNode,
    pieceId: selectedPiece,
    pieceDefId: pieceDefName,
  }

  // Call the API to add the track piece
  addTrackPiece(data)
    .then((layoutData: UiLayout) => {
        // Store the new track layout that was returned by the API endpoint (includes the newly inserted piece)
        trackLayoutStore.setTrackLayout(layoutData);

        // Select the newly inserted piece and node
        const [pieceId, nodeId] = getLastInsertedLayoutPieceAndNodeId(layoutData);
        console.log("Setting selected piece: ", pieceId);
        console.log("Setting selected node: ", nodeId);
        selectionStore.setSelectedLayoutPiece(pieceId);
        selectionStore.setSelectedNode(nodeId);
      })
      .catch((error: Error) => {
        errorStore.setError(error.message);
        console.error("handleKeyDown().setStartPosition()", error);
      });
}

// Return the message that will be displayed when no node is selected
function getNoNodeSelectedMessage(): string {
  let msg = "Please select a node (on the layout map). ";
  msg += "Then click an item in the list to insert that particular piece into the layout. "

  if (trackLayoutStore.getTrackLayout().pieces.length == 0) {
    msg += "The new piece will be connected to the selected node, pointing up.";
  } else {
    msg += "The new piece will be connected to the track piece you selected, on the side of the selected node.";
  }

  return msg;
}

// Get the message that will be displayed when no layout piece is selected
function getNoPieceSelectedMessage(): string {
  let msg = "Please select a track piece first (on the layout map). Then click select a node. ";
  msg += "Then click an item in the list to insert that particular piece into the layout. "
  msg += "The new piece will be connected to the track piece you selected, on the side of the selected node.";

  return msg;
}
