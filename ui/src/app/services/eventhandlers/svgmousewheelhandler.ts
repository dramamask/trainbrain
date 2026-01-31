import { store as zoomStore } from "@/app/services/stores/zoomfactor";

const UP = -1;
const DOWN = 1;

/**
 * Mouse Wheel event handler for use inside an SVG component
 */
export function wheelHandler (e: React.WheelEvent<SVGSVGElement>) {
  // deltaY is negative when scrolling up, positive when scrolling down
  const direction = e.deltaY > 0 ? DOWN : UP;

  if (direction == UP) {
    zoomStore.zoomIn()
  } else {
    zoomStore.zoomOut()
  }
};
