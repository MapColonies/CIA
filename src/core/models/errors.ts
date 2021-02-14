export class CoreNotFoundError extends Error {
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CoreNotFoundError.prototype);
  }
}
