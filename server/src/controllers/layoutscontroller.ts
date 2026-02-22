import { Request, Response, NextFunction } from 'express';
import { trace } from '@opentelemetry/api';
import { constants } from "http2";
import { LayoutNamesData } from 'trainbrain-shared';
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
