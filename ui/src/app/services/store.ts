import { UiLayout } from "trainbrain-shared";

// Track Layout store
export const trackLayout = {
  layout: <UiLayout>{},

  get(): UiLayout {
    return this.layout;
  },

  set(value: UiLayout) {
    this.layout = value;
  },
}
