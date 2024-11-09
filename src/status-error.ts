export class StatusError extends Error {
  status: number;
  details: string | undefined;
  constructor(message: string, status: number, details?: string) {
    super(message);
    this.status = status;
    this.name = "StatusError";
    this.details = details;
  }

  static NotFound(msg = "Not Found"): StatusError {
    return new StatusError(msg, 404);
  }

  static Internal(msg = "Internal Error"): StatusError {
    return new StatusError(msg, 500);
  }

  static BadRequest(msg = "Bad Request"): StatusError {
    return new StatusError(msg, 400);
  }

  static Forbidden(msg = "Not Allowed"): StatusError {
    return new StatusError(msg, 403);
  }

  public withDetails(details: string): StatusError {
    return new StatusError(this.message, this.status, details);
  }
}
