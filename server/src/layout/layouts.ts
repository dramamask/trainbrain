import { Low, Memory } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';
import { FatalError } from '../errors/FatalError.js';
import { getDbPath } from '../services/db.js';
import { Layout } from "../layout/layout.js";
import type { LayoutDefData, LayoutsData } from '../data_types/layouts.js';

const DB_FILE_NAME = "layouts";

// Default/empty data structure for the layouts json db
const emptyLayouts: LayoutsData = {
  activeLayout: "1",
  layouts: {
    "1": {
      name: "empty",
      dbFilename: "empty",
      world: {
        width: 15545,
        height: 15240,
        image: "backyard.jpg"
      }
    }
  }
}

/**
 * Layouts class
 */
export class Layouts {
  protected readonly dbFileName: string;
  protected activeLayout: Layout | undefined;
  protected db: Low<LayoutsData>;

  constructor() {
    this.dbFileName = DB_FILE_NAME;
    this.db = new Low(new Memory(), emptyLayouts);
    this.activeLayout = undefined;
  }

  /**
   * Initializations
   */
  public async init() {
    await this.initDb();

    const activeLayoutId = this.db.data.activeLayout;
    const activeLayoutDefinition = this.db.data.layouts[activeLayoutId];
    this.activeLayout = new Layout(activeLayoutDefinition);

    await this.activeLayout.init();
  }

  /**
   * Return a kay-value list of layout IDs and names
   */
  public getLayoutNames(): Record<string,string> {
    const names: Record<string,string> = {};
    Object.entries(this.db.data.layouts).forEach(([id, layoutDef]) => {
      names[id] = layoutDef.name;
    });
    return names;
  }

  /**
   * Return the active Layout object
   */
  public getActiveLayout(): Layout {
    if (this.activeLayout) {
      return this.activeLayout;
    }

    throw new FatalError("We should have an active layout")
  }

  /**
   * Initialize the Layouts DB
   */
  protected async initDb(): Promise<void> {
    try {
      this.db = await JSONFilePreset(getDbPath(`${this.dbFileName}.json`), emptyLayouts);
    } catch (error) {
      const message = "Error initializing layouts DB";
      console.error(message, error);
      throw new FatalError(message);
    }
  }
}
