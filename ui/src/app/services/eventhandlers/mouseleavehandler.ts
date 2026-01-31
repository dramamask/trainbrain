import { store as mousePosStore } from "@/app/services/stores/mousepos";

export function leaveHandler() {
  mousePosStore.setMouseHasLeft();
}
