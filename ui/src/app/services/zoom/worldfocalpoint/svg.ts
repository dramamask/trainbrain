//----------------------------------------------------------------------------------------------------
//
// We use these functions for zooming purposes, to position a viewport over a focal point. The
// SVG element can draw the entire layout. We only want it to draw the layout that is part of our
// viewport. The world width and height represent the total size of our complete layout.
// We want to center the viewport over the focal point. We use the SVG viewBox to to accomplish
// the viewport effect.
//
// The viewBox values are pretty simple. It consistes of 4 values: x, y, dX, dY. The x and y
// values are the coordinates where the viewBox starts (x 0 is left, y 0 is top). The dX and dY
// values are the width and height of the viewBox.
//
//----------------------------------------------------------------------------------------------------

/**
 * Calculate the SVG viewBox values, which is the part of the world that we are rending in the SVG element.
 *
 * @param {number} focalPointX - The x position of the focal point of the view window
 * @param {number} focalPointY - The y position of the focal point of the view window
 * @param {number} worldWidth - The width of the world box
 * @param {number} worldHeight - The height of the world box
 * @param {number} zoomFactor - The zoom factor. A zoomfactor of 2 is 200% zoom, etc.
 */
export function getSvgViewBox(
  focalPointX: number,
  focalPointY: number,
  worldWidth: number,
  worldHeight: number,
  zoomFactor: number
): string {
  let viewBoxX = getSVGViewBoxPos(focalPointX, worldWidth, zoomFactor);
  let viewBoxY = getSVGViewBoxPos((worldHeight - focalPointY), worldHeight, zoomFactor);

  let viewBox = `${viewBoxX} ${viewBoxY} ${worldWidth / zoomFactor} ${worldHeight / zoomFactor}`;

  return viewBox;
}

/**
 * Calculate the X value for the SVG viewBox, which is the part of the world that we are rending in the SVG element.
 *
 * @param {number} focalPointX - The x position of the focal point of the view window
 * @param {number} worldWidth - The width of the world box
 * @param {number} zoomFactor - The zoom factor. A zoomfactor of 2 is 200% zoom, etc.
 */
export function getSvgViewBoxX( focalPointX: number, worldWidth: number, zoomFactor: number) {
  return getSVGViewBoxPos(focalPointX, worldWidth, zoomFactor);
}

/**
 * Calculate the Y value for the SVG viewBox, which is the part of the world that we are rending in the SVG element.
 *
 * @param {number} focalPointY - The y position of the focal point of the view window
 * @param {number} worldHeight - The height of the world box
 * @param {number} zoomFactor - The zoom factor. A zoomfactor of 2 is 200% zoom, etc.
 */
export function getSvgViewBoxY( focalPointY: number, worldHeight: number, zoomFactor: number) {
  return getSVGViewBoxPos(focalPointY, worldHeight, zoomFactor);
}

/**
 * Get the value for the viewBox x or y coordinate
 *
 * @param {number} focalPointPos - The x or y position of the focal point of the view window
 *                                 Beware 0 x is left, 0 y is top in this function!!!!
 * @param {number} worldSize - The width or height of the world box
 * @param {number} zoomFactor - The zoom factor. A zoomfactor of 2 is 200% zoom, etc.
 *
 * */
function getSVGViewBoxPos(
  focalPointPos: number,
  worldSize: number,
  zoomFactor: number
): number {
  // Size of the view window, as a fraction
  const windowSizeFraction = (1 / zoomFactor);

  // Viewbox position
  let viewBoxPos = focalPointPos - (worldSize * (windowSizeFraction / 2));

  // Maximum position of the window. Further than this and it will go outside of the world boundry
  const maxWindowPos = worldSize  * (1 - windowSizeFraction);

  //  Make sure the window doesn't move outside of the world boundries
  if (viewBoxPos < 0) {viewBoxPos = 0};
  if (viewBoxPos > maxWindowPos) {viewBoxPos = maxWindowPos};

  return viewBoxPos;
}
