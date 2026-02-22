import { WorldData } from "trainbrain-shared";

// Info about a layout
export interface LayoutDefData {
  name: string;
  dbFileName: string;
  world: WorldData;
}

// Data about the different layouts that exist
export interface LayoutsData {
  activeLayout: string;
  layouts: Record<string, LayoutDefData>;
}
