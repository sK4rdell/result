/**
 * A type representing a value that may be null or undefined.
 * This type is used to represent nullable values in TypeScript.
 * @typeParam T - The type of the nullable value
 */
export type Nullable<T> = undefined | null | T;

/**
 * A class representing a result that can either contain a value of type V or an error of type E.
 * This implementation follows the Result pattern, commonly used for error handling.
 *
 * @typeParam V - The type of the successful value
 * @typeParam E - The type of the error, must extend Error
 */

export class Result<V, E extends Error> {
  private _error: E | undefined;

  private _data: V | undefined;

  /**
   * Creates a new Result instance representing a failure with the given error.
   *
   * @static
   * @typeParam V - The type of the successful value
   * @typeParam E - The type of the error
   * @param error - The error to be contained in the Result
   * @returns A new Result instance containing the error
   */
  static failure<V, E extends Error>(error: E): Result<V, E> {
    const res = new Result<V, E>();
    res._error = error;
    return res;
  }

  /**
   * Creates a new Result instance containing the given value.
   *
   * @static
   * @typeParam V - The type of the successful value
   * @typeParam E - The type of the error
   * @param value - The value to be contained in the Result
   * @returns A new Result instance containing the value
   */
  static of<V, E extends Error>(value: V): Result<V, E> {
    const res = new Result<V, E>();
    res._data = value;
    return res;
  }

  /**
   * Creates a Result from a nullable value. Returns a function that takes an error
   * to be used when the value is null, undefined, an empty array, or an empty object.
   *
   * @static
   * @typeParam V - The type of the successful value
   * @typeParam E - The type of the error
   * @param data - The nullable value to be checked
   * @returns A function that takes an error and returns a Result
   * @example
   * const data: Nullable<string> = null;
   * const error = new Error("Data is null");
   * const result = Result.fromNullable<string, Error>(data)(error);
   */
  static fromNullable<V, E extends Error>(
    data: Nullable<V>
  ): (arg0: E) => Result<V, E> {
    return (error: E) => {
      if (data === null || data === undefined) {
        return Result.failure<V, E>(error);
      }
      // check for empty arrays
      if (Array.isArray(data) && data.length === 0) {
        return Result.failure<V, E>(error);
      }
      // check for empty objects
      if (typeof data === "object" && Object.keys(data).length === 0) {
        return Result.failure<V, E>(error);
      }
      return Result.of<V, E>(data);
    };
  }

  /**
   * Gets the error contained in this Result, if any.
   *
   * @returns The error if present, undefined otherwise
   */
  get error(): E | undefined {
    return this._error;
  }

  /**
   * Gets the data contained in this Result.
   *
   * @returns The contained value
   */
  get data(): V {
    return this._data as V;
  }

  /**
   * Applies a transformation function to the contained value if this Result is successful.
   *
   * @typeParam T - The type of the transformed value
   * @param func - The transformation function to apply to the value
   * @returns A new Result containing either the transformed value or the original error
   */
  apply<T>(func: (value: V) => T): Result<T, E> {
    if (!this._error) {
      return Result.of(func(this._data as V));
    }
    return Result.failure(this._error);
  }

  /**
   * Applies a transformation function to the error if this Result is a failure.
   *
   * @param func - The transformation function to apply to the error
   * @returns A new Result containing either the original value or the transformed error
   */
  applyOnFailure(func: (value: E) => E): Result<V, E> {
    if (this._error) {
      return Result.failure(func(this._error));
    }
    return Result.of(this._data as V);
  }

  /**
   * Folds the Result into a single value, handling both success and failure cases.
   *
   * @typeParam L - The type returned by the error handler
   * @typeParam R - The type returned by the success handler
   * @param onData - Function to handle the success case
   * @param onError - Function to handle the failure case
   * @returns Either the result of onData or onError
   * @example
   * const result = Result.of(42);
   * const value = result.fold(
   *  (data) => `The value is ${data}`,
   * (error) => `An error occurred: ${error.message}`
   * );
   * console.log(value); // Output: The value is 42
   */
  fold<L, R>(onData: (arg: V) => R, onError: (e: E) => L): L | R {
    if (!this._error) {
      return onData(this._data as V);
    }
    return onError(this._error);
  }

  /**
   * Converts this Result to a failure if the contained value meets a specified condition.
   *
   * @param condition - The predicate function to test the value
   * @param error - The error to use if the condition is met
   * @returns A new Result that may be converted to a failure based on the condition
   * @example
   * const result = Result.of(42);
   * const newResult = result.failOnCondition(
   * (data) => data === 42,
   * new Error("The value is 42")
   * );
   * console.log(newResult.error); // Output: Error: The value is 42
   * console.log(newResult.data); // Output: 42
   */
  failOnCondition(condition: (arg: V) => boolean, error: E): Result<V, E> {
    if (this._error) {
      return Result.failure(this._error);
    }
    if (condition(this._data as V)) {
      return Result.failure(error);
    }
    return Result.of(this._data as V);
  }

  /**
   * Returns a new `Result` instance with a new value if the current instance contains an error.
   * Optionally, a filter function can be provided to conditionally replace the value based on the error.
   *
   * @param newValue - The new value to return if the current instance contains an error.
   * @param filter - An optional function to filter which errors should trigger the replacement.
   * @returns A new `Result` instance with the new value if an error is present and the filter (if provided) matches, otherwise the current instance.
   * @example
   * const result = Result.failure(new Error("An error occurred"));
   * const newResult = result.onFailureReturn(42);
   * console.log(newResult.data); // Output: 42
   * console.log(newResult.error); // Output: Error: An error occurred
   * @example
   * const result = Result.failure(new Error("An error occurred"));
   * const newResult = result.onFailureReturn(42, (e) => e.message === "An error occurred");
   * console.log(newResult.data); // Output: 42
   */
  onFailureReturn(newValue: V, filter?: (e: E) => boolean): Result<V, E> {
    if (!this._error) {
      return Result.of(this._data as V);
    }
    if (!filter || filter(this._error)) {
      return Result.of(newValue);
    }
    return Result.failure(this._error);
  }

  /**
   * Executes a provided function if the current instance contains an error.
   * The function is called with the error as its argument.
   * This method is useful for performing side effects based on the presence of an error.
   *
   * @param func - The function to execute if an error is present
   * @returns The current Result instance
   * @example
   * const result = Result.failure(new Error("An error occurred"));
   * result.onFailure((error) => console.error(error.message));
   * @example
   * const result = Result.of(42);
   * result.onFailure((error) => console.error(error.message));
   * // No output
   * @example
   * const result = Result.failure(new Error("An error occurred"));
   * result.onFailure((error) => console.error(error.message)).onFailure((error) => console.error(error.message));
   * // Output: An error occurred
   */
  onFailurePeek(func: (arg: E) => void): Result<V, E> {
    if (this._error) {
      func(this._error);
    }
    return this;
  }

  /**
   * Executes a provided function if the current instance contains a value.
   * The function is called with the value as its argument.
   * This method is useful for performing side effects based on the presence of a value.
   *
   * @param func - The function to execute if a value is present
   * @returns The current Result instance
   * @example
   * const result = Result.of(42);
   * result.onSuccess((data) => console.log(data));
   * // Output: 42
   * @example
   * const result = Result.failure(new Error("An error occurred"));
   * result.onSuccess((data) => console.log(data));
   * // No output
   * @example
   * const result = Result.of(42);
   * result.onSuccess((data) => console.log(data)).onSuccess((data) => console.log(data));
   * // Output: 42
   */
  peek(func: (arg: V) => void): Result<V, E> {
    if (this._data) {
      func(this._data);
    }
    return this;
  }
}
