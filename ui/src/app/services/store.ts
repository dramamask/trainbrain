import { UiLayout } from "trainbrain-shared";

// Edit Mode store
export const editMode = {
  isEditMode: false,

  isEnabled() {
    return this.isEditMode;
  },

  set(value: boolean) {
    this.isEditMode = value;
  },
}

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

// Error store
export const error = {
  error: "",

  get(): string {
    return this.error;
  },

  set(value: string) {
    this.error = value;
  },
}
