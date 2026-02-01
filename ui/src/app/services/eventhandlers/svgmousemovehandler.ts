import {store as mousePosStore} from "@/app/services/stores/mousepos";
import {store as zoomStore} from "@/app/services/stores/zoomfactor";

let ticking = false; // Used to throttle mouse pos capturing to be in line with screen render frequency

/**
 * Mouse move handler for mouse moves inside an SVG component
 */
export function moveHandler(e: React.MouseEvent<SVGSVGElement>) {
  // If a calculation is already scheduled for the next frame,  just exit immediately. Don't do any work.
  if (ticking) {
    return
  }
  // Close the gate
  ticking = true;

  const {clientX, clientY, currentTarget} = e;
  const svg = currentTarget;

  // Ask the browser: "The next time you are about to paint the screen, run this specific code."
  requestAnimationFrame(() => {
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;

    const ctm = svg.getScreenCTM();
    if (ctm) {
      let { x, y } = point.matrixTransform(ctm.inverse());
      y = (svg.viewBox.baseVal.height * zoomStore.getZoomFactor()) - y; // Invert y because out y=0 is at the bottom of the screen
      mousePosStore.setPos(x, y);
    }

    // Open the gate so the next frame can accept a move event
    ticking = false;
  })
}
