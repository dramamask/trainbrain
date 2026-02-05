// Error used in scenarios where a node can't delete itself because it's still connected to a piece
// Depending on the situation this may not be a problem
export class StillConnectedError extends Error {
  public name: string;

  constructor(message: string) {
    super(message);
    this.name = "StillConnectedError";

    // Set the prototype explicitly to make 'instanceof' work correctly
    Object.setPrototypeOf(this, StillConnectedError.prototype);
  }
}
