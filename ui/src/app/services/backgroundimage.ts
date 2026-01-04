//----------------------------------------------------------------------------------------------------
//
// We use these functions to position a viewport over a focal point. The background image
// is a large image. The world width and height represent the background image total width
// and height. We want to center the viewport over the focal point. We use the css
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
 * Returns the x value for the background-pos value of a background image
 *
 * @param {number} focalPointXPos - The x position of the focal point of the view window
 * @param {number} worldWidth - The width of the world box
 * @param {number} zoomFactor - The zoom factor
 */
export function getBackgroundPosX(focalPointXPos: number, worldWidth: number, zoomFactor: number): number {
  const backgroundPosFractionX = getBackgroundPosAsFraction(focalPointXPos, worldWidth, zoomFactor);

  // Transform to percentage
  const backgroundPosX = backgroundPosFractionX * 100;

  return backgroundPosX;
}

/**
 * Returns the y value for the background-pos value of a background image
 *
 * @param {number} focalPointYPos - The y position of the focal point of the view window
 * @param {number} worldHeight - The width of the world box
 * @param {number} zoomFactor - The zoom factor
 */
export function getBackgroundPosY(focalPointYPos: number, worldWidth: number, zoomFactor: number): number {
  const backgroundPosFractionY = getBackgroundPosAsFraction(focalPointYPos, worldWidth, zoomFactor);

  // Transform to percentage and change the 0 coordinate to the top instead of the bottom
  const backgroundPosY = 100 - (backgroundPosFractionY * 100);

  return backgroundPosY;
}

/**
 * Get the value for the backgroundPos property of a background image, as a fraction. *
 *
 * @param {number} focalPointPos - The x or y position of the focal point of the view window
 * @param {number} worldSize - The width or height of the world box
 * @param {number} zoomFactor - The zoom factor
 */
function getBackgroundPosAsFraction(focalPointPos: number, worldSize: number, zoomFactor: number): number {
  let piecePosFractionX = (focalPointPos / worldSize); // position of the focal point, as a fraction
  const windowWidthFraction = 0.25; // Width of the view window, as a fraction
  // Make sure the window doesn't move outside of the image boundries
  if (piecePosFractionX < windowWidthFraction) {piecePosFractionX = windowWidthFraction};
  if (piecePosFractionX > (1 - windowWidthFraction)) {piecePosFractionX = 1 - windowWidthFraction};
  const windowPosFractionX = piecePosFractionX - windowWidthFraction; // X position of the view window, as a fraction
  const backgroundPosFractionX = windowPosFractionX * 2; // BackgroundPosition x value, as a fraction

  return backgroundPosFractionX;
}
