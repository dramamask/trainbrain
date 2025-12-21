/**
 * This file is an abstraction layer around the lowdb access to the track layout json file
 */

import { UiLayout } from "trainbrain-shared";

export function getDefaultData(): UiLayout {
  const emptyLayout: UiLayout = {
    messages: { error: " "},
    pieces: []
  };

  return emptyLayout;
}

