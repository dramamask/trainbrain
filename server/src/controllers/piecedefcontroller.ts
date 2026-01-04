import { Request, Response, NextFunction } from 'express';
import { constants } from "http2";
import { pieceDefintionsDb } from '../services/db.js';

// Endpoint to get the track piece definitions
export const getPieceDefinitions = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const pieceDef = pieceDefintionsDb.data.definitions;

    // Remove the definition  for startPosition.
    // It's a bit hokie to do it this way but it is what it is.
    delete pieceDef.startPosition;

    res.header("Content-Type", "application/json");
    res.status(constants.HTTP_STATUS_OK).send(pieceDef);
  } catch (error) {
    console.error("Unknown error at the edge", error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      .send("Unknown error at the edge. Check server logs.");
  }
}
