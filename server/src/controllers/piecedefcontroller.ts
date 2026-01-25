import { trace } from '@opentelemetry/api';
import { Request, Response, NextFunction } from 'express';
import { constants } from "http2";
import { layout } from "../services/init.js";

// Endpoint to get the track piece definitions
export const getPieceDefinitions = (_req: Request, res: Response, _next: NextFunction): void => {
  try {
    const span = trace.getActiveSpan();
    span?.setAttribute('_.request.type', 'getPieceDefinitions');

    const data = layout.getPieceDefs().getData();

    span?.setAttribute('_.response.numPieceDefs', Object.keys(data).length);

    res.header("Content-Type", "application/json");
    res.status(constants.HTTP_STATUS_OK).send(data);
  } catch (error) {
    console.error("Unknown error at the edge", error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      .send("Unknown error at the edge. Check server logs.");
  }
}
