import { Request, Response, NextFunction } from 'express';
import { matchedData } from 'express-validator';
import { layout } from "../services/init.js";
import { Coordinate, UiLayout } from 'trainbrain-shared';

// Endpoint to get the track layout
export const getLayout = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const uiLayout = layout.getUiLayout();
    const status = getHttpStatusCode(uiLayout);

    res.header("Content-Type", "application/json");
    res.status(status).send(uiLayout);
  } catch (error) {
    console.error("Unknown error at the edge", error);
    res.status(500).send("Unknown error at the edge. Check server logs.");
  }
}

// Endpoint to update the track layout start position
export const updateStartPosition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // matchedData only includes fields defined in the validator middleware for this route
  const data = matchedData(req);

  const newStartPos: Coordinate = {
    x: Number(data.x),
    y: Number(data.y),
    heading: Number(data.heading)
  };

  try {
    await layout.updateStartPosition(newStartPos);
    const uiLayout = layout.getUiLayout();
    const status = getHttpStatusCode(uiLayout);

    res.header("Content-Type", "application/json");
    res.status(status).send(JSON.stringify(uiLayout));
  } catch (error) {
    console.error("Unknown error at the edge", error);
    res.status(500).send("Unknown error at the edge. Check server logs.");
  }
}

// Returns the status code that we should use when returning the UI Layout,
// based on the fact if there's an error message in the UI Layout message struct.
function getHttpStatusCode(layout: UiLayout): number {
  if (layout.messages.error != "") {
    return 500;
  }
  return 200;
}