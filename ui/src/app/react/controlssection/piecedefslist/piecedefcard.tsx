import { Card, CardContent, Stack } from "@mui/material";
import { AddLayoutPieceData, CurveAttributes, PieceDefData, StraightAttributes, SwitchAttributes, UiLayout } from "trainbrain-shared";
import { store as selectionStore } from "@/app/services/stores/selection";
import { store as errorStore } from "@/app/services/stores/error";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { addTrackPiece } from "@/app/services/api/tracklayout";
import { getLastInsertedNode } from "@/app/services/tracklayout";

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
            { getPieceSpecificInfo(definition) }
          </div>
          <div className={controlsSectionStyles.grayText + " " + styles.text}>
            Also known as: {definition.aka}.
          </div>
        </Stack>
      </CardContent>
    </Card>
  )
}

// Call the API endpoint to insert the track piece into the layout.
// The endpoint returns the new UI Layout definition. We store that in the trackLayoutStore.
function addTrackPieceToLayout(pieceDefName:string): void {
  // Get the selected node
  const selectedNode = selectionStore.getSelectedNode();

  // Assemble the data for the API call
  const data: AddLayoutPieceData = {
    nodeId: selectedNode,
    pieceDefId: pieceDefName,
  }

  // Call the API to add the track piece
  addTrackPiece(data)
    .then((layoutData: UiLayout) => {
        // Store the new track layout that was returned by the API endpoint (includes the newly inserted piece)
        trackLayoutStore.setTrackLayout(layoutData);

        // Select the newly inserted node
        const nodeId = getLastInsertedNode(layoutData);
        selectionStore.setSelectedNode(nodeId);
        selectionStore.deselectTrackPiece();
      })
      .catch((error: Error) => {
        errorStore.setError(error.message);
        console.error("handleKeyDown().setStartPosition()", error);
      });
}

/**
 * Return piece specific info text for the given piece
 */
function getPieceSpecificInfo(data: PieceDefData): string {
  let attributes;

  switch(data.category.toLowerCase()) {
    case "straight":
      attributes = data.attributes as StraightAttributes;
      return `Length: ${attributes.length }mm.`;
    case "curve":
      attributes = data.attributes as CurveAttributes;
      return `Angle: ${attributes.angle}°, radius: ${attributes.radius} mm.`;
    case "switch":
      attributes = data.attributes as SwitchAttributes;
      return `${attributes.variant} handed, angle: ${attributes.angle}°, radius: ${attributes.radius} mm, length: ${attributes.length} mm`;
  }

  return "";
}
