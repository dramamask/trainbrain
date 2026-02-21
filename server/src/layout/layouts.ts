import { Low, Memory } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';
import { FatalError } from '../errors/FatalError.js';
import { getDbPath } from '../services/db.js';
import { Layout } from "../layout/layout.js";

const DB_FILE_NAME = "layouts";

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
    const activeLayoutDbFilename = this.db.data.layouts[activeLayoutId].dbFilename;
    this.activeLayout = new Layout(activeLayoutDbFilename);

    await this.activeLayout.init();
  }

  /**
   * Return an array of the layout names
   */
  public getLayoutNames(): string[] {
    return Object.values(this.db.data.layouts).map(layoutDef => layoutDef.name);
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
