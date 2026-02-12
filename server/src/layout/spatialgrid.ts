const CELL_SIZE = 100; // mm

/**
 * A spatial grid to help find nodes that are within the CELL_SIZE distance of each other
 *
 * Note that the T in the class name means that we are using generics
 */
export class SpatialGrid<T> {
    private grid: Map<string, T[]> = new Map();
    private cellSize: number = CELL_SIZE; // One cell is cellSize my cellSize millimeters in size

     // Pass in a function that tells the grid how to get X and Y from your object
    constructor(private getCoords: (item: T) => { x: number, y: number }) {}

    // Convert coordinates to a grid cell key
    private getKey(x: number, y: number): string {
      return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
    }

    // Call this once after nodes have shifted positions
    addItems(items: Map<any, T>): void {
      this.grid.clear();
      for (const item of items.values()) {
        const { x, y } = this.getCoords(item);
        const key = this.getKey(x, y);

        let cell = this.grid.get(key);
        if (!cell) {
          cell = [];
          this.grid.set(key, cell);
        }
        cell.push(item);
      }
    }

    // Find the nodes that are within gridSize of the given coordinate
    findNearby(x: number, y: number): T[] {
      const cx = Math.floor(x / this.cellSize);
      const cy = Math.floor(y / this.cellSize);
      const results: T[] = [];
      const sqLimit = 10000;

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const cell = this.grid.get(`${cx + dx},${cy + dy}`);
          if (cell) {
            for (const item of cell) {
              const pos = this.getCoords(item);
              const dSq = (x - pos.x) ** 2 + (y - pos.y) ** 2;
              if (dSq <= sqLimit) results.push(item);
            }
          }
        }
      }
      return results;
    }

    // Clear the grid (call this every frame if nodes move)
    clear(): void {
      this.grid.clear();
    }
}
