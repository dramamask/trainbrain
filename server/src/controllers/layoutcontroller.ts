import { Request, Response, NextFunction } from 'express';
import { trace } from '@opentelemetry/api';
import { matchedData } from 'express-validator';
import { constants } from "http2";
import { layout } from "../services/init.js";
import { AddLayoutPieceData, Coordinate, UiLayout, UpdateNodeData } from 'trainbrain-shared';

// API endpoint to get the track layout
export const getLayout = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const uiLayout = layout.getUiLayout();
    const status = getHttpStatusCode(uiLayout);

    res.header("Content-Type", "application/json");
    res.status(status).send(uiLayout);
  } catch (error) {
    console.error("Unknown error at the edge", error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      .send("Unknown error at the edge. Check server logs.");
  }
}

// Endpoint to add a piece to the track layout
export const addLayoutPiece = async (req: Request, res: Response, next: NextFunction) => {
  // matchedData only includes fields defined in the validator middleware for this route
  const data = matchedData<AddLayoutPieceData>(req);

  try {
    const span = trace.getActiveSpan();
    span?.setAttribute('_.request.type', 'addLayoutPiece');
    span?.setAttribute('_.request.nodeId', data.nodeId);
    span?.setAttribute('_.request.pieceDefId', data.pieceDefId);

    await layout.addLayoutPiece(data);

    const uiLayout = layout.getUiLayout();
    const status = getHttpStatusCode(uiLayout);

    span?.setAttribute('_.response.numNodes', uiLayout.nodes.length);
    span?.setAttribute('_.response.numPieces', uiLayout.pieces.length);

    res.header("Content-Type", "application/json");
    res.status(status).send(JSON.stringify(uiLayout));
  } catch (error) {
    const span = trace.getActiveSpan();
    span?.recordException(error as Error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      .send("Unknown error at the edge. Check server logs.");
  }
}

// API endpoint to change the position of a node and/or the heading the piecces connected to the node
// This is used to move or rotate a node and everything that is connected to it
export const updateNode = async (req: Request, res: Response, next: NextFunction) => {
  // matchedData only includes fields defined in the validator middleware for this route
  const data = matchedData<UpdateNodeData>(req);

  try {
    const newCoordinate: Coordinate = {
      x: data.x,
      y: data.y,
    };
    const headingIncrement = data.headingIncrement;
    await layout.updateNode(data.index, newCoordinate, headingIncrement);

    const uiLayout = layout.getUiLayout();
    const status = getHttpStatusCode(uiLayout);

    res.header("Content-Type", "application/json");
    res.status(status).send(JSON.stringify(uiLayout));
  } catch (error) {
    console.error("Unknown error at the edge", error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      .send("Unknown error at the edge. Check server logs.");
  }
}

// // Endpoint to add a piece to the track layout
// export const deleteLayoutPiece = async (req: Request, res: Response, next: NextFunction) => {
//   // matchedData only includes fields defined in the validator middleware for this route
//   const data = matchedData(req);

//   try {
//     await layout.deleteLayoutPiece(data.index);

//     const uiLayout = layout.getUiLayout();
//     const status = getHttpStatusCode(uiLayout);

//     res.header("Content-Type", "application/json");
//     res.status(status).send(JSON.stringify(uiLayout));
//   } catch (error) {
//     console.error("Unknown error at the edge", error);
//     res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
//       .send("Unknown error at the edge. Check server logs.");
//   }
// }

// TODO: rotate is the wrong word. It's flip, or change orientation or something like that.
// // Endpoint to rotate a piece in the track layout
// // Rotation logic depends on the type of track piece
// export const rotateLayoutPiece = async (req: Request, res: Response, next: NextFunction) => {
//   // matchedData only includes fields defined in the validator middleware for this route
//   const data = matchedData(req);

//   try {
//     await layout.rotateLayoutPiece(data.index);

//     const uiLayout = layout.getUiLayout();
//     const status = getHttpStatusCode(uiLayout);

//     res.header("Content-Type", "application/json");
//     res.status(status).send(JSON.stringify(uiLayout));
//   } catch (error) {
//     console.error("Unknown error at the edge", error);
//     res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
//       .send("Unknown error at the edge. Check server logs.");
//   }
// }

// Returns the status code that we should use when returning the UI Layout,
// based on the fact if there's an error message in the UI Layout message struct.
function getHttpStatusCode(layout: UiLayout): number {
  if (layout.messages.error != "") {
    return constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
  }
  return constants.HTTP_STATUS_OK;
}