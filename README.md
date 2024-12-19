# result

A robust TypeScript implementation of the Result pattern for elegant error handling.

## Features

- Type-safe error handling
- Chainable operations
- Nullable value handling
- Rich API for error and success cases
- Zero dependencies
- Full TypeScript support with detailed type information

## Installation

```bash
npm install @kardell/result
```

## Basic Usage

```ts
import { Result } from "@kardell/result";

// Success case
const success = Result.of<number, Error>(42);
console.log(success.data); // 42

// Failure case
const failure = Result.failure<string, Error>(
  new Error("Something went wrong")
);
console.log(failure.error?.message); // 'Something went wrong'
```

## Advanced Features

### Transform Values with `apply`

```ts
const result = Result.of<number, Error>(42)
  .apply((n) => n * 2)
  .apply((n) => n.toString());

console.log(result.data); // "84"
```

### Handle Nullable Values

```ts
const userData: string | null = null;
const result = Result.fromNullable(userData)(new Error("User not found"));

result.fold(
  (data) => console.log(data),
  (error) => console.error(error.message) // Prints: User not found
);
```

### Chaining operations

```ts
const result = Result.of<number, Error>(42)
  .apply((n) => n * 2)
  .apply((n) => n.toString());

console.log(result.data); // "84"
```

### Pattern Matching with `fold`

```ts
const result = Result.of<number, Error>(42);

const message = result.fold(
  (value) => `Success: ${value}`,
  (error) => `Error: ${error.message}`
);
console.log(result.data); // "Success: 42"
```

### Fallbacks

```ts
const result = Result.failure<number, Error>(
  new Error("Processing failed")
).onFailureReturn(0);

console.log(result.data); // 0
```

## Examples

### API Calls

```ts

// api client
async function fetchUser(id: string): Promise<Result<User, StatusError>> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      return Result.failure(new Error(`HTTP error: ${response.status}`));
    }
    const data = await response.json();
    return Result.of(data);
  } catch (error) {
    return Result.failure(
      error instanceof Error ? error : new Error("Unknown error")
    );
  }
}

// api handler
async userHandler(id: string): MyResponseType {
    const user = await fetchUser(id);

    return user.fold(
        (user) => new MyResponseType(200, user),
        ({status, message}) => new MyResponseType(status, { message })
    );
}

```

### Data Processing

```ts
function processData(input: string): Result<number, Error> {
  return Result.fromNullable(input)(new Error("Input is required"))
    .apply((str) => parseInt(str, 10))
    .failOnCondition((n) => isNaN(n), new Error("Invalid number"));
}
```

## API Reference

### Static Methods

- `of<V, E>(value: V): Result<V, E>` - Creates a success result
- `failure<V, E>(error: E): Result<V, E>` - Creates a failure result
- `fromNullable<V, E>(value: V | null | undefined): (error: E) => Result<V, E>` - Handles nullable values

### Instance Methods

- `apply<T>(fn: (v: V) => T): Result<T, E>` - Transform success values
- `applyOnFailure(fn: (e: E) => E): Result<V, E>` - Transform errors
- `fold<L, R>(onSuccess: (v: V) => R, onError: (e: E) => L): L | R` - Pattern matching
- `failOnCondition(predicate: (v: V) => boolean, error: E): Result<V, E>` - Conditional failures
- `onFailureReturn(value: V, filter?: (e: E) => boolean): Result<V, E>` - Provide fallback values
- `peek(fn: (v: V) => void): Result<V, E>` - Side effects for success cases
- `onFailurePeek(fn: (e: E) => void): Result<V, E>` - Side effects for failure cases

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
