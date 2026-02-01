import { store as mousePosStore, getMousePos } from "@/app/services/stores/mousepos";
import { store as scrollStore } from "@/app/services/stores/scroll";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as zoomStore } from "@/app/services/stores/zoomfactor";
import { getSvgViewBoxX, getSvgViewBoxY } from "@/app/services/zoom/worldfocalpoint/svg";

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

  //setScrollBarPos();

  const { mouseInViewBox, x, y } = getMousePos(mousePosStore.getSnapshot());
  const { worldWidth, worldHeight } = trackLayoutStore.getWorldSize();

  if (mouseInViewBox) {
    const viewBoxX = getSvgViewBoxX(x, worldWidth, zoomStore.getZoomFactor());
    const viewBoxY = getSvgViewBoxY(y, worldHeight, zoomStore.getZoomFactor());
    const scrollPosX = (viewBoxX / worldWidth) * 100;
    const scrollPosY = (viewBoxY / worldHeight) * 100;
    console.log("scrollPosX: " + scrollPosX);
    console.log("scrollPosY: " + scrollPosY);
    scrollStore.setXScrollPos(scrollPosX);
    scrollStore.setXScrollPos(scrollPosY);
  }
};
