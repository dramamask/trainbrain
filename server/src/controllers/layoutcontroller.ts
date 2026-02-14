import { Request, Response, NextFunction } from 'express';
import { trace } from '@opentelemetry/api';
import { matchedData } from 'express-validator';
import { constants } from "http2";
import { layout } from "../services/init.js";
import { AddLayoutPieceData, AddNodeData, Coordinate, MovePieceData, UiLayout, UpdateNodeData } from 'trainbrain-shared';

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
    span?.end();
  } catch (error) {
    const span = trace.getActiveSpan();
    span?.recordException(error as Error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({error: (error as Error).message});
    span?.end();
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
    span?.end();
  } catch (error) {
    const span = trace.getActiveSpan();
    span?.recordException(error as Error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({error: (error as Error).message});
    span?.end();
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
    span?.end();
  } catch (error) {
    const span = trace.getActiveSpan();
    span?.recordException(error as Error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({error: (error as Error).message});
    span?.end();
  }
}

// API endpoint to move or rotate a node and everything that is connected to it
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
    span?.end();
  } catch (error) {
    const span = trace.getActiveSpan();
    span?.recordException(error as Error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({error: (error as Error).message});
    span?.end();
  }
}

// API endpoint to move or rotate a node and everything that is connected to it
export const disconnectPiecesAtNode = async (req: Request, res: Response, next: NextFunction) => {
  // matchedData only includes fields defined in the validator middleware for this route
  const data = matchedData<{index: string}>(req);

  try {
    const span = trace.getActiveSpan();
    span?.setAttribute('_.request.type', 'updateNode');
    span?.setAttribute('_.request.nodeId', data.index);

    await layout.disconnectPiecesAtNode(data.index);

    const uiLayout = layout.getUiLayout();
    const status = getHttpStatusCode(uiLayout);

    span?.setAttribute('_.response.numNodes', uiLayout.nodes.length);
    span?.setAttribute('_.response.numPieces', uiLayout.pieces.length);

    res.header("Content-Type", "application/json");
    res.status(status).send(JSON.stringify(uiLayout));
    span?.end();
  } catch (error) {
    const span = trace.getActiveSpan();
    span?.recordException(error as Error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({error: (error as Error).message});
    span?.end();
  }
}

// API endpoint to move a piece and everything that is connected to it
export const movePiece = async (req: Request, res: Response, next: NextFunction) => {
  // matchedData only includes fields defined in the validator middleware for this route
  const data = matchedData<MovePieceData>(req);

  try {
    const span = trace.getActiveSpan();
    span?.setAttribute('_.request.type', 'updateNode');
    span?.setAttribute('_.request.pieceId', data.index);
    span?.setAttribute('_.request.x', data.xIncrement);
    span?.setAttribute('_.request.y', data.yIncrement);

    await layout.movePiece(data.index, data.xIncrement, data.yIncrement);

    const uiLayout = layout.getUiLayout();
    const status = getHttpStatusCode(uiLayout);

    span?.setAttribute('_.response.numNodes', uiLayout.nodes.length);
    span?.setAttribute('_.response.numPieces', uiLayout.pieces.length);

    res.header("Content-Type", "application/json");
    res.status(status).send(JSON.stringify(uiLayout));
    span?.end();
  } catch (error) {
    const span = trace.getActiveSpan();
    span?.recordException(error as Error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({error: (error as Error).message});
    span?.end();
  }
}

// API endpoint to move a flip a piece that is only connected to one other piece.
export const flipPiece = async (req: Request, res: Response, next: NextFunction) => {
  // matchedData only includes fields defined in the validator middleware for this route
  const data = matchedData<{index: string}>(req);

  try {
    const span = trace.getActiveSpan();
    span?.setAttribute('_.request.type', 'flipPiece');
    span?.setAttribute('_.request.pieceId', data.index);

    await layout.flipPiece(data.index);

    const uiLayout = layout.getUiLayout();
    const status = getHttpStatusCode(uiLayout);

    span?.setAttribute('_.response.numNodes', uiLayout.nodes.length);
    span?.setAttribute('_.response.numPieces', uiLayout.pieces.length);

    res.header("Content-Type", "application/json");
    res.status(status).send(JSON.stringify(uiLayout));
    span?.end();
  } catch (error) {
    const span = trace.getActiveSpan();
    span?.recordException(error as Error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({error: (error as Error).message});
    span?.end();
  }
}

// // Endpoint to add a piece to the track layout
export const deleteLayoutElement = async (req: Request, res: Response, next: NextFunction) => {
  // matchedData only includes fields defined in the validator middleware for this route
  const data = matchedData(req);

  try {
    const span = trace.getActiveSpan();
    span?.setAttribute('_.request.type', 'deleteLayoutElement');
    span?.setAttribute('_.request.pieceId', data.pieceId);
    span?.setAttribute('_.request.nodeId', data.nodeId);

    await layout.deleteLayoutElement(data.pieceId, data.nodeId);

    const uiLayout = layout.getUiLayout();
    const status = getHttpStatusCode(uiLayout);

    span?.setAttribute('_.response.numNodes', uiLayout.nodes.length);
    span?.setAttribute('_.response.numPieces', uiLayout.pieces.length);

    res.header("Content-Type", "application/json");
    res.status(status).send(JSON.stringify(uiLayout));
    span?.end();
  } catch (error) {
    const span = trace.getActiveSpan();
    span?.recordException(error as Error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({error: (error as Error).message});
    span?.end();
  }
}

// Returns the status code that we should use when returning the UI Layout,
// based on the fact if there's an error message in the UI Layout message struct.
function getHttpStatusCode(layout: UiLayout): number {
  if (layout.error != "") {
    return constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
  }
  return constants.HTTP_STATUS_OK;
}
