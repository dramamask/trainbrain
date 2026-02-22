import { Request, Response, NextFunction } from 'express';
import { trace } from '@opentelemetry/api';
import { matchedData } from 'express-validator';
import { constants } from "http2";
import { LayoutNamesData, UiLayout } from 'trainbrain-shared';
import { layouts } from "../services/init.js";

// API endpoint to return info of the available layouts
export const getLayouts = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const span = trace.getActiveSpan();
    span?.setAttribute('_.request.type', 'getLayouts');

    const layoutNames: LayoutNamesData = layouts.getLayoutNamesData();

    span?.setAttribute('_.response.numLayouts', layoutNames.layouts.length);
    span?.setAttribute('_.response.activeLayout', layoutNames.activeLayout);

    res.header("Content-Type", "application/json");
    res.status(constants.HTTP_STATUS_OK).send(layoutNames);
    span?.end();
  } catch (error) {
    const span = trace.getActiveSpan();
    span?.recordException(error as Error);
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({error: (error as Error).message});
    span?.end();
  }
}

// API endpoint to set the active layout.
// Note that this API returns the new active UI Layout
export const setActiveLayout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // matchedData only includes fields defined in the validator middleware for this route
    const data = matchedData<{index: string}>(req);

    const span = trace.getActiveSpan();
    span?.setAttribute('_.request.type', 'setActiveLayout');
    span?.setAttribute('_.request.newActiveLayout', data.index);

    await layouts.setActiveLayout(data.index);

    const uiLayout = layouts.getActiveLayout().getUiLayout();
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