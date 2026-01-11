import { Request, Response, NextFunction } from 'express';
import { matchedData } from 'express-validator';
import { constants } from "http2";
import { layout } from "../services/init.js";
import { Coordinate, UiLayout } from 'trainbrain-shared';
import { AddLayoutPieceData } from '../shared_types/layout.js';

// Endpoint to get the track layout
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
    await layout.addLayoutPiece(data);

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

// Endpoint to add a piece to the track layout
export const deleteLayoutPiece = async (req: Request, res: Response, next: NextFunction) => {
  // matchedData only includes fields defined in the validator middleware for this route
  const data = matchedData(req);

  try {
    await layout.deleteLayoutPiece(data.index);

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

// Endpoint to rotate a piece in the track layout
// Rotation logic depends on the type of track piece
export const rotateLayoutPiece = async (req: Request, res: Response, next: NextFunction) => {
  // matchedData only includes fields defined in the validator middleware for this route
  const data = matchedData(req);

  try {
    await layout.rotateLayoutPiece(data.index);

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

// Endpoint to update the track layout start position
export const updateStartPosition = async (req: Request, res: Response, next: NextFunction) => {
  // matchedData only includes fields defined in the validator middleware for this route
  const data = matchedData(req);

  try {
    const newStartPos: Coordinate = {
      x: Number(data.x),
      y: Number(data.y),
      heading: Number(data.heading)
    };
    await layout.updateStartPosition(newStartPos);

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

// Returns the status code that we should use when returning the UI Layout,
// based on the fact if there's an error message in the UI Layout message struct.
function getHttpStatusCode(layout: UiLayout): number {
  if (layout.messages.error != "") {
    return constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
  }
  return constants.HTTP_STATUS_OK;
}