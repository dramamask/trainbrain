// Error used in scenarios where an assumptions was made that two
// layout pieces arweree connected to each other, but they are not.
export class NotConnectedError extends Error {
  public name: string;

  constructor(message: string) {
    super(message);
    this.name = "NotConnectedError";
  }
}
