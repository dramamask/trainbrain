import { store as mousePosStore, getMousePos } from "@/app/services/stores/mousepos";
import { store as scrollStore } from "@/app/services/stores/scroll";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as zoomStore } from "@/app/services/stores/zoomfactor";
import { getSVGViewBoxPos } from "@/app/services/zoom/worldfocalpoint/svg";
import { getScrollBarPercentage } from "@/app/services/zoom/scrollbar/svg";

const UP = -1;
const DOWN = 1;

/**
 * Mouse Wheel event handler for use inside an SVG component
 */
export function wheelHandler (e: React.WheelEvent<SVGSVGElement>) {
  // deltaY is negative when scrolling up, positive when scrolling down
  const direction = e.deltaY > 0 ? DOWN : UP;

  if (direction == UP) {
    zoomStore.zoomIn(true);
  } else {
    zoomStore.zoomOut(true);
  }

  console.log("Wheel handler: e.deltaY is ", e.deltaY);

  // TODO: move this code into a function function. Add that function to the service/zoom/scrollbar/svg file?

  const { mouseInViewBox, x, y } = getMousePos(mousePosStore.getSnapshot());
  const { worldWidth, worldHeight } = trackLayoutStore.getWorldSize();

  if (mouseInViewBox) {
    const viewBoxX = getSVGViewBoxPos(x, worldWidth, zoomStore.getZoomFactor());
    const viewBoxY = getSVGViewBoxPos(y, worldHeight, zoomStore.getZoomFactor());

    const scrollPosX = getScrollBarPercentage(viewBoxX, worldWidth, zoomStore.getZoomFactor());
    const scrollPosY = 100 - getScrollBarPercentage(viewBoxY, worldHeight, zoomStore.getZoomFactor());

    scrollStore.setXScrollPos(scrollPosX);
    scrollStore.setYScrollPos(scrollPosY);
  }
};
