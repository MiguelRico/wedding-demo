export class AppError extends Error {
  constructor(message, { cause, code = "UNKNOWN", details } = {}) {
    super(message, { cause });
    this.code = code;
    this.details = details;
    this.name = "AppError";
  }
}

export const toAppError = (error, fallbackMessage, code = "UNKNOWN") =>
  error instanceof AppError
    ? error
    : new AppError(error?.message || fallbackMessage, { cause: error, code });
