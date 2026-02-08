import {store as measureStore} from "@/app/services/stores/measure";
import {store as mousePosStore} from "@/app/services/stores/mousepos";

export function clickHandler(e: React.MouseEvent<SVGSVGElement>) {
  if (!measureStore.getEnabled()) {
    return;
  }

  const mousePos = mousePosStore.getPos();
  if (mousePos) {
    measureStore.setPos(mousePos);
  }
}
