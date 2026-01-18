// Error used in scenarios where an error happens that can only come from a programming error or a bug.
// We probably want to stop execution and figure out what is going on.
export class FatalError extends Error {
  public name: string;

  constructor(message: string) {
    super(message);
    this.name = "FatalError";
  }
}
