import { Card, CardContent, Stack, Tooltip } from "@mui/material";
import { AddLayoutPieceData, PieceDefCurveAttributes, PieceDefData, PieceDefStraightAttributes, PieceDefSwitchAttributes, UiLayout } from "trainbrain-shared";
import { store as selectionStore } from "@/app/services/stores/selection";
import { store as errorStore } from "@/app/services/stores/error";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { addTrackPiece } from "@/app/services/api/tracklayout";
import { getLastInsertedNode } from "@/app/services/tracklayout";
import PieceDefIcon from "./piecedeficon";

const CURVE = "curve";
const SWITCH = "switch";

interface props {
  pieceDefId: string;
  definition: PieceDefData;
}

import styles from "./piecedefcard.module.css"
import controlsSectionStyles from "../controlssection.module.css";

export default function PieceDefCard({pieceDefId, definition}: props) {
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    addTrackPieceToLayout(pieceDefId, definition);
  };

  return (
    <Card
      sx={{ flexShrink: 0} /* Do not shrink the card when the container is too small to fit all the cards*/}
      onClick={handleClick}
    >
      <CardContent className={styles.cardContent} sx={{paddingLeft: '0 !important'}}>
        <Stack direction="row" spacing={0}>
          <div className={styles.iconContainer}>
            <PieceDefIcon pieceDef={definition} />
          </div>
          <Tooltip title={definition.partNum}>
          <Stack className={styles.pieceContainer}>
            <div className={controlsSectionStyles.title + " " + styles.title}>
              {definition.category + getLgbRadius(definition)}
            </div>
            <div className={controlsSectionStyles.text + " " + styles.text}>
              { getPieceSpecificInfo(definition) }
            </div>
          </Stack>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  )
}

// Call the API endpoint to insert the track piece into the layout.
// The endpoint returns the new UI Layout definition. We store that in the trackLayoutStore.
function addTrackPieceToLayout(pieceDefId: string, pieceDef: PieceDefData): void {
  // Get the selected node
  const selectedNode = selectionStore.getSelectedNode();

  // Assemble the data for the API call
  const data: AddLayoutPieceData = {
    nodeId: selectedNode,
    pieceDefId: pieceDefId,
    orientation: getOrientation(pieceDef),
  }

  // Call the API to add the track piece
  addTrackPiece(data)
    .then((layoutData: UiLayout) => {
        // Store the new track layout that was returned by the API endpoint (includes the newly inserted piece)
        trackLayoutStore.setTrackLayout(layoutData);

        // Select (one of) the node(s) that was just added
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
 * Return the piece's attributes as structured text
 */
function getPieceSpecificInfo(data: PieceDefData): string {
  let attributes;

  switch(data.category.toLowerCase()) {
    case "straight":
      attributes = data.attributes as PieceDefStraightAttributes;
      return `Length: ${attributes.length }mm.`;
    case "curve":
      attributes = data.attributes as PieceDefCurveAttributes;
      return `Angle: ${attributes.angle}°, radius: ${attributes.radius} mm`;
    case "switch":
      attributes = data.attributes as PieceDefSwitchAttributes;
      return `Angle: ${attributes.angle}°, radius: ${attributes.radius} mm, length: ${attributes.length} mm`;
  }

  return "";
}

/**
 * Return the lgbRadius value from the pieceDef attributes, if one is defined
 */
function getLgbRadius(def: PieceDefData): string {
  if (def.category == CURVE || def.category == SWITCH) {
    const curveAttr = def.attributes as PieceDefCurveAttributes;
    const lgbRadius = curveAttr.lgbRadius ?? "";
    return " " + lgbRadius;
  }
  return "";
}

/**
 * Return the curve piece orientation if the piece is a curve. Otherwise just return an emptry string.
 */
function getOrientation(pieceDef: PieceDefData): string {
  if (pieceDef.category == CURVE) {
    return (pieceDef.attributes as PieceDefCurveAttributes).orientation ?? "";
  }
  return "";
}
