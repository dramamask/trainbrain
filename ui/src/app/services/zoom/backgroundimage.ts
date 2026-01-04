//----------------------------------------------------------------------------------------------------
//
// We use these functions for zooming purposes, to position a viewport over a focal point. The
// background image is a large image. The world width and height represent the background image
// total width and height. We want to center the viewport over the focal point. We use the css
// background-position percentage (for a background-image) value to accompliosh the viewport
// effect.
//
// The background-position percentage value for a background image is a bit of a strange beast.//
// It's best explained with some examples for the background-position percentage value:
// - 0%  : left side of viewport is left side of background image.
// - 50% : middle of viewport is middle of background image.
// - 100%: right side of viewport is right side of background image.
//
// Those are easy to understand, but not necessarily logical, until you read the explanation of
// the 25% background-position value. A value of 25% means that the 25% x-coordinate of the viewport
// is aligned with the 25% x-coordinate of the background image. Conversly, the 25% y-coordinate of
// the viewport is aligned with 25% y-coordinate of the background image. This, of course, works
// with all the percentage values.
//
//----------------------------------------------------------------------------------------------------

/**
 * Returns a css style object that contains the x and y value for the background-pos of a background
 * image as well as the background-size values.
 *
 * @param {number} focalPointX - The x position of the focal point of the view window
 * @param {number} focalPointY - The y position of the focal point of the view window
 * @param {number} worldWidth - The width of the world box
 * @param {number} worldHeight - The height of the world box
 * @param {number} zoomFactor - The zoom factor
 */
export function getBackgroundImageStyle(
  focalPointX: number,
  focalPointY: number,
  worldWidth: number,
  worldHeight: number,
  zoomFactor: number
): object {
  // Get background-position value as fraction
  const backgroundPosFractionX = getBackgroundPosAsFraction(focalPointX, worldWidth, zoomFactor);
  const backgroundPosFractionY = getBackgroundPosAsFraction(focalPointY, worldHeight, zoomFactor);

  // Transform background-position values to percentage,
  // and for y change the 0 coordinate to the top instead of the bottom
  const backgroundPosX = backgroundPosFractionX * 100;
  const backgroundPosY = 100 - (backgroundPosFractionY * 100);

  // Assemble css style object with background-position and background-style (in React css style format)
  const cssStyle = {
    backgroundPosition: `${backgroundPosX}% ${backgroundPosY}%`,
    backgroundSize: `${zoomFactor * 100}% ${zoomFactor * 100}%`
  }

  return cssStyle;
}

/**
 * Get the value for the background-position property of a background image, as a fraction.
 *
 * @param {number} focalPointPos - The x or y position of the focal point of the view window
 * @param {number} worldSize - The width or height of the world box
 * @param {number} zoomFactor - The zoom factor
 */
function getBackgroundPosAsFraction(focalPointPos: number, worldSize: number, zoomFactor: number): number {
  // Position of the focal point, as a fraction
  let piecePosFraction = (focalPointPos / worldSize);

  // Width of the view window, as a fraction
  let windowWidthFraction = (1 / zoomFactor);

  // Position of the view window, as a fraction
  let windowPosFraction = piecePosFraction - (windowWidthFraction / 2);

  // BackgroundPosition value, as a fraction
  // Note that this calcuation goes back to the 25% example at the top of the page
  let backgroundPosFraction = windowPosFraction / ((zoomFactor - 1) / zoomFactor);

  // Make sure the window doesn't move outside of the image boundries
  if (backgroundPosFraction < 0) {backgroundPosFraction = 0};
  if (backgroundPosFraction > 1) {backgroundPosFraction = 1};

  return backgroundPosFraction;
}
