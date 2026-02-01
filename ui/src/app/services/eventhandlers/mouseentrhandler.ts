import { store as mousePosStore } from "@/app/services/stores/mousepos";

export function enterHandler() {
  mousePosStore.setMouseHasReturned();
}
