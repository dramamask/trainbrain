//----------------------------------------------------------------------------------------------------
//
// We use this function for scrolling and zooming purposes, to position a viewport over the image.
// We want to position the viewport based on the position of a "virtual" scrollbar.
// We use the css background-position percentage (for a background-image) value to accomplish the
// viewport effect.
//
//----------------------------------------------------------------------------------------------------

/**
 * Returns a css style object that contains the x and y value for the background-pos of a background
 * image as well as the background-size values.
 *
 * @param {number} scollBarXPercentage - The position of the horizontal scrollbar (left = 0)
 * @param {number} scollBarYPercentage - The position of the vertical scrollbar (top = 0)
 * @param {number} zoomFactor - The zoom factor. A zoomfactor of 2 is 200% zoom, etc.
 */
export function getBackgroundImageStyle(
  scollBarXPercentage: number,
  scollBarYPercentage: number,
  zoomFactor: number
): object {
  // Assemble css style object with background-position and background-style (in React css style format)
  const cssStyle = {
    backgroundPosition: `${scollBarXPercentage}% ${scollBarYPercentage}%`,
    backgroundSize: `${zoomFactor * 100}% ${zoomFactor * 100}%`
  }

  return cssStyle;
}
