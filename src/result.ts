import { StatusError } from "./status-error";

export type Nullable<T> = undefined | null | T;

type LogFunc = (msg: string) => void;
interface Logger {
  debug: LogFunc;
  info: LogFunc;
  log: LogFunc;
  warn: LogFunc;
  error: LogFunc;
}

let logger: Logger = console;

export const setLogger = (l: Logger): void => {
  logger = l;
};

export class Result<V> {
  private _error: StatusError | undefined;

  private _data: V | undefined;

  static failure<V>(error: StatusError): Result<V> {
    const res = new Result<V>();
    res._error = error;
    return res;
  }

  static of<V>(value: V): Result<V> {
    const res = new Result<V>();
    res._data = value;
    return res;
  }

  static fromNullable<V>(data: Nullable<V>): (arg0: StatusError) => Result<V> {
    return (error: StatusError) => {
      if (data === null || data === undefined) {
        return Result.failure<V>(error);
      }
      // check for empty arrays
      if (Array.isArray(data) && data.length === 0) {
        return Result.failure<V>(error);
      }
      // check for empty objects
      if (typeof data === "object" && Object.keys(data).length === 0) {
        return Result.failure<V>(error);
      }
      return Result.of<V>(data);
    };
  }

  get error(): StatusError | undefined {
    return this._error;
  }

  get data(): V {
    return this._data as V;
  }

  apply<T>(func: (value: V) => T): Result<T> {
    if (!this._error) {
      return Result.of(func(this._data as V));
    }
    return Result.failure(this._error);
  }

  applyOnError(func: (value: StatusError) => StatusError): Result<V> {
    if (this._error) {
      return Result.failure(func(this._error));
    }
    return Result.of(this._data as V);
  }

  fold<L, R>(onData: (arg: V) => R, onError: (e: StatusError) => L): L | R {
    if (!this._error) {
      return onData(this._data as V);
    }
    return onError(this._error);
  }

  errorOnCondition(
    condition: (arg: V) => boolean,
    error: StatusError
  ): Result<V> {
    if (this._error) {
      return Result.failure(this._error);
    }
    if (condition(this._data as V)) {
      return Result.failure(error);
    }
    return Result.of(this._data as V);
  }

  onErrorReturn(newValue: V, statusFilter?: number): Result<V> {
    if (!this._error) {
      return Result.of(this._data as V);
    }
    if (!statusFilter || statusFilter === this._error.status) {
      return Result.of(newValue);
    }
    return Result.failure(this._error);
  }

  logOnError(options?: { msg?: string; status?: number }): Result<V> {
    if (this._error && this._error.status === (options?.status ?? 500)) {
      if (!!options?.msg) {
        logger.error(<string>options?.msg);
      } else {
        logger.error(`Result contains error: ${this._error}`);
      }
    }
    return this;
  }
}
