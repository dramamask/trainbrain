//----------------------------------------------------------------------------------------------------
//
// We use this functions for zooming and scrolling purposes, to position a viewport over the svg world.
// The SVG element can draw the entire layout. We only want it to draw the layout that is part of our
// viewport. We want to position the viewport based on the position of a "virtual" scrollbar.
//
// The viewBox values are pretty simple. It consistes of 4 values: x, y, dX, dY. The x and y
// values are the coordinates where the viewBox starts (x 0 is left, y 0 is top). The dX and dY
// values are the width and height of the viewBox.
//
//----------------------------------------------------------------------------------------------------

/**
 * Calculate the SVG viewBox values, which is the part of the world that we are rending in the SVG element.
 *
 * @param {number} scollBarXPercentage - The position of the horizontal scrollbar (left = 0)
 * @param {number} scollBarYPercentage - The position of the vertical scrollbar (top = 0)
 * @param {number} worldWidth - The width of the world box
 * @param {number} worldHeight - The height of the world box
 * @param {number} zoomFactor - The zoom factor. A zoomfactor of 2 is 200% zoom, etc.
 */
export function getSvgViewBox(
  scollBarXPercentage: number,
  scollBarYPercentage: number,
  worldWidth: number,
  worldHeight: number,
  zoomFactor: number
): string {
  let viewBoxX = getSVGViewBoxPos(scollBarXPercentage, worldWidth, zoomFactor);
  let viewBoxY = getSVGViewBoxPos(scollBarYPercentage, worldHeight, zoomFactor);

  let viewBox = `${viewBoxX} ${viewBoxY} ${worldWidth / zoomFactor} ${worldHeight / zoomFactor}`;

  return viewBox;
}

/**
 * Get the value for the viewBox x or y coordinate
 *
 * @param {number} scrollBarPercentage - The x or y scrollbar percentage of the view window
 * @param {number} worldSize - The width or height of the world box
 * @param {number} zoomFactor - The zoom factor. A zoomfactor of 2 is 200% zoom, etc.
 *
 * */
function getSVGViewBoxPos(
  scrollBarPercentage: number,
  worldSize: number,
  zoomFactor: number
): number {
  return (scrollBarPercentage * (1 - (1 / zoomFactor))) * (worldSize / 100);
}

/**
 * Get the scrollbar percentage value (x or y), for the given information.
 * This formula was created from the getSVGViewBoxPos() formula, but here svgViewBoxPos is known and scrollBarPercentage is unknown.
 *
 * @param {number} svgViewBoxPos - SVG viewbox x or y coordinate
 * @param {number} worldSize - The width or height of the world box
 * @param {number} zoomFactor - The zoom factor. A zoomfactor of 2 is 200% zoom, etc.
 */
export function getScrollBarPercentage(
  svgViewBoxPos: number,
  worldSize: number,
  zoomFactor: number
): number {
  if (zoomFactor <= 1) {
    return 0;
  }

  return (100 * svgViewBoxPos * zoomFactor) / (worldSize * (zoomFactor - 1));
}
