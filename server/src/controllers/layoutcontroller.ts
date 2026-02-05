import { Request, Response, NextFunction } from 'express';
import { trace } from '@opentelemetry/api';
import { matchedData } from 'express-validator';
import { constants } from "http2";
import { layout } from "../services/init.js";
import { AddLayoutPieceData, AddNodeData, Coordinate, UiLayout, UpdateNodeData } from 'trainbrain-shared';

// API endpoint to get the track layout
export const getLayout = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const span = trace.getActiveSpan();
    span?.setAttribute('_.request.type', 'getLayout');

    const uiLayout = layout.getUiLayout();
    const status = getHttpStatusCode(uiLayout);

    span?.setAttribute('_.response.numNodes', uiLayout.nodes.length);
    span?.setAttribute('_.response.numPieces', uiLayout.pieces.length);

    res.header("Content-Type", "application/json");
    res.status(status).send(uiLayout);
  } catch (error) {
    const span = trace.getActiveSpan();
    span?.recordException(error as Error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({error: (error as Error).message});
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
    span?.setAttribute('_.request.orientation', data.orientation);

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
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({error: (error as Error).message});
  }
}

// API endpoint to add a node in an arbitrary position.
// This is done so layout pieces can be added in new positions, not connected to other pieces (yet).
export const addNode = async (req: Request, res: Response, next: NextFunction) => {
  // matchedData only includes fields defined in the validator middleware for this route
  const data = matchedData<AddNodeData>(req);

  try {
    const span = trace.getActiveSpan();
    span?.setAttribute('_.request.type', 'addNode');
    span?.setAttribute('_.request.x', data.x);
    span?.setAttribute('_.request.y', data.y);

    const coordinate: Coordinate = {
      x: data.x,
      y: data.y,
    };
    await layout.addNode(coordinate);

    const uiLayout = layout.getUiLayout();
    const status = getHttpStatusCode(uiLayout);

    span?.setAttribute('_.response.numNodes', uiLayout.nodes.length);
    span?.setAttribute('_.response.numPieces', uiLayout.pieces.length);

    res.header("Content-Type", "application/json");
    res.status(status).send(JSON.stringify(uiLayout));
  } catch (error) {
    const span = trace.getActiveSpan();
    span?.recordException(error as Error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({error: (error as Error).message});
  }
}

// API endpoint to change the position of a node and/or the heading the piecces connected to the node
// This is used to move or rotate a node and everything that is connected to it
export const updateNode = async (req: Request, res: Response, next: NextFunction) => {
  // matchedData only includes fields defined in the validator middleware for this route
  const data = matchedData<UpdateNodeData>(req);

  try {
    const span = trace.getActiveSpan();
    span?.setAttribute('_.request.type', 'updateNode');
    span?.setAttribute('_.request.nodeId', data.index);
    span?.setAttribute('_.request.x', data.x);
    span?.setAttribute('_.request.y', data.y);
    span?.setAttribute('_.request.heading_increment', data.headingIncrement);

    const newCoordinate: Coordinate = {
      x: data.x,
      y: data.y,
    };
    const headingIncrement = data.headingIncrement;
    await layout.updateNode(data.index, newCoordinate, headingIncrement);

    const uiLayout = layout.getUiLayout();
    const status = getHttpStatusCode(uiLayout);

    span?.setAttribute('_.response.numNodes', uiLayout.nodes.length);
    span?.setAttribute('_.response.numPieces', uiLayout.pieces.length);

    res.header("Content-Type", "application/json");
    res.status(status).send(JSON.stringify(uiLayout));
  } catch (error) {
    const span = trace.getActiveSpan();
    span?.recordException(error as Error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({error: (error as Error).message});
  }
}

// // Endpoint to add a piece to the track layout
export const deleteLayoutElement = async (req: Request, res: Response, next: NextFunction) => {
  // matchedData only includes fields defined in the validator middleware for this route
  const data = matchedData(req);

  try {
    const span = trace.getActiveSpan();
    span?.setAttribute('_.request.type', 'deleteLayoutPiece');
    span?.setAttribute('_.request.pieceId', data.pieceId);
    span?.setAttribute('_.request.nodeId', data.nodeId);

    await layout.deleteLayoutElement(data.pieceId);

    const uiLayout = layout.getUiLayout();
    const status = getHttpStatusCode(uiLayout);

    span?.setAttribute('_.response.numNodes', uiLayout.nodes.length);
    span?.setAttribute('_.response.numPieces', uiLayout.pieces.length);

    res.header("Content-Type", "application/json");
    res.status(status).send(JSON.stringify(uiLayout));
  } catch (error) {
    const span = trace.getActiveSpan();
    span?.recordException(error as Error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({error: (error as Error).message});
  }
}

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
  if (layout.error != "") {
    return constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
  }
  return constants.HTTP_STATUS_OK;
}
