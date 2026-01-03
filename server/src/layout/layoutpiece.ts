import { Coordinate, UiLayoutPiece } from "trainbrain-shared";
import { LayoutPiece as LayoutPieceData } from "../types/layout.js";
import { TrackPieceDef } from "../types/pieces.js";

export abstract class LayoutPiece {
  id: string = "";
  type: string = "";
  attributes: object = {};
  previous: LayoutPiece | null = null;
  next: LayoutPiece | null = null;
  start: Coordinate = <Coordinate>{};
  end: Coordinate = <Coordinate>{};

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    this.id = id;
    this.type = data.type;
  }

  public initConnections(previous: LayoutPiece | null, next: LayoutPiece | null) {
    this.previous = previous;
    this.next = next;
  }

  public abstract initCoordinates(): void;

  public abstract setStartCoordinate(position: Coordinate ): void;

  // TODO: public abstract getUiLayoutPiece(): UiLayoutPiece;

  // Convert from degrees to radians
  protected degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Round a number to two decimal points
  protected roundTo2(value: number): number {
    return Math.round(value * 100) / 100;
  }

  // Rotate a given point a number of degrees
  protected rotatePoint(x: number, y: number, degrees: number): { x: number; y: number } {
    if ((degrees % 360) == 0) {
      return {x: x, y: y};
    }

    const radians = ((0 - degrees) * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const newX = x * cos - y * sin;
    const newY = x * sin + y * cos;

    return { x: newX, y: newY }
  }

  // Returns true if the Coordinate object is populated, i.e. has x and y keys
  protected isPopulated(obj: any): boolean {
    // 1. Ensure obj is a valid non-null object
  if (!obj || typeof obj !== 'object') return false;

  // 2. Strict check: Both keys must be present and not null/undefined
  // Using '!= null' checks for both null AND undefined at once
  return (obj.x != null && obj.y != null);
  }
}
