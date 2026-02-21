import { WorldData } from "trainbrain-shared";

// Info about a layout
export interface LayoutDefData {
  name: string;
  dbFileName: string;
  world: WorldData;
}

// Content of the layouts json DB file
export interface LayoutsData {
  activeLayout: string;
  layouts: Record<string, LayoutDefData>;
}