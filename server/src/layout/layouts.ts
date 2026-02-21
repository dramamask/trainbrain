import { Low } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';
import { FatalError } from '../errors/FatalError.js';
import { getDbPath } from '../services/db.js';
import { Layout } from "../layout/layout.js";

// Define the structure of the Layout DB json file
interface LayoutDefData {
  name: string;
  dbFilename: string;
}
interface LayoutsData {
  activeLayout: string;
  layouts: Record<string, LayoutDefData>;
}

// Default/empty data structure for the layouts json db
const emptyLayouts: LayoutsData = {
  activeLayout: "1",
  layouts: {"1": {name: "empty", dbFilename: "empty"}}
}

// Initialize the databases once
let layoutsDb: Low<LayoutsData>;

try {
  layoutsDb = await JSONFilePreset(getDbPath("layouts.json"), emptyLayouts);
} catch (error) {
  const message = "Error initializing layouts DB";
  console.error(message, error);
  throw new FatalError(message);
}

/**
 * Layouts class
 */
export class Layouts {
  protected readonly activeLayout: Layout;

  constructor() {
    const layoutId = layoutsDb.data.activeLayout;
    const layoutsDbFilename = layoutsDb.data.layouts[layoutId].dbFilename;
    this.activeLayout = new Layout(layoutsDbFilename);
  }

  /**
   * Initializations
   */
  public init() {
    this.activeLayout.init();
  }

  /**
   * Return an array of the layout names
   */
  public getLayoutNames(): string[] {
    return Object.values(layoutsDb.data.layouts).map(layoutDef => layoutDef.name);
  }

  /**
   * Return the active Layout object
   */
  public getActiveLayout(): Layout {
    return this.activeLayout;
  }
}
