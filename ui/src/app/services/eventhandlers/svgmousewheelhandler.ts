import { store as mousePosStore, getMousePos } from "@/app/services/stores/mousepos";
import { store as scrollStore } from "@/app/services/stores/scroll";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as zoomStore } from "@/app/services/stores/zoomfactor";
import { getSVGViewBoxPos } from "@/app/services/zoom/worldfocalpoint/svg";
import { getScrollBarPercentage } from "@/app/services/zoom/scrollbar/svg";

/**
 * Mouse Wheel event handler for use inside an SVG component
 */
export function wheelHandler (event: WheelEvent) {

  // Mouse wheel UP
  if (event.deltaY < 0) {
    // CTRL pressed? Zoom in.
    if (event.ctrlKey || event.metaKey) { // The metaKey is the Apple Mac Command key
      event.preventDefault();
      zoomStore.zoomIn(true);
      zoomToPositionByManipulatingScrollbars();
      return;
    }
    // CTRL not pressed? Scroll up;
    scrollStore.yScrollStepUp();
    return;
  }

  // Mouse wheel DOWN
  if (event.deltaY > 0) {
    // CTRL pressed? Zoom down.
    if (event.ctrlKey|| event.metaKey) { // The metaKey is the Apple Mac Command key {
      event.preventDefault();
      zoomStore.zoomOut(true);
      zoomToPositionByManipulatingScrollbars();
      return;
    }
    // CTRL not pressed? Scroll down;
    scrollStore.yScrollStepDown();
    return;
  }

  // Scroll right: move right
  if (event.deltaX > 0) {
    scrollStore.xScrollStepRight();
    return;
  }

  // Scroll left: move left
  if (event.deltaX < 0) {
    scrollStore.xScrollStepLeft();
    return;
  }
};

/**
 * Change the scrollbar positions so we zoom to the location where the mouse is pointing on the map
 */
function zoomToPositionByManipulatingScrollbars(): void {
  const { mouseInViewBox, x, y } = getMousePos(mousePosStore.getSnapshot());

  if (mouseInViewBox) {
    const { worldWidth, worldHeight } = trackLayoutStore.getWorldSize();

    const viewBoxX = getSVGViewBoxPos(x, worldWidth, zoomStore.getZoomFactor());
    const viewBoxY = getSVGViewBoxPos(y, worldHeight, zoomStore.getZoomFactor());

    const scrollPosX = getScrollBarPercentage(viewBoxX, worldWidth, zoomStore.getZoomFactor());
    const scrollPosY = 100 - getScrollBarPercentage(viewBoxY, worldHeight, zoomStore.getZoomFactor());

    scrollStore.setXScrollPos(scrollPosX);
    scrollStore.setYScrollPos(scrollPosY);
  }
}
