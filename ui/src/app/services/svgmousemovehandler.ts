import {store as mousePosStore} from "@/app/services/stores/mousepos";

export const moveHandler = (e: React.MouseEvent<SVGSVGElement>) => {
  const svg = e.currentTarget;
  const point = svg.createSVGPoint();
  point.x = e.clientX;
  point.y = e.clientY;

  const ctm = svg.getScreenCTM();
  if (ctm) {
    let { x, y } = point.matrixTransform(ctm.inverse());
    y = svg.viewBox.baseVal.height - y; // Invert y because out y=0 is at the bottom of the screen
    mousePosStore.setPos(x, y);
  }
};
