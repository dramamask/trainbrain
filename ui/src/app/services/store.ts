import { UiLayout } from "trainbrain-shared";

export const editMode = {
  isEditMode: false,

  isEnabled() {
    return this.isEditMode;
  },

  set(value: boolean) {
    this.isEditMode = value;
  },
}

export const trackLayout = {
  layout: {},

  get() {
    return this.layout;
  },

  set(value: UiLayout) {
    this.layout = value;
  },
}
