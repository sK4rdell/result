import { Result } from "./result";

describe("Result", () => {
  describe("Creation and basic operations", () => {
    it("should create successful result", () => {
      const result = Result.of<number, Error>(42);
      expect(result.data).toBe(42);
      expect(result.error).toBeUndefined();
    });

    it("should create failure result", () => {
      const error = new Error("test error");
      const result = Result.failure<number, Error>(error);
      expect(result.error).toBe(error);
      expect(() => result.data).toBeUndefined;
    });

    it("should create result from nullable - with value", () => {
      const value = "test";
      const result = Result.fromNullable<string, Error>(value)(
        new Error("error")
      );
      expect(result.data).toBe("test");
    });

    it("should create result from nullable - with null", () => {
      const value = null;
      const error = new Error("error");
      const result = Result.fromNullable<string, Error>(value)(error);
      expect(result.error).toBe(error);
    });

    it("should create result from nullable - with empty array", () => {
      const value: string[] = [];
      const error = new Error("error");
      const result = Result.fromNullable<string[], Error>(value)(error);
      expect(result.error).toBe(error);
    });
  });

  describe("Transformations", () => {
    it("should apply transformation on success", () => {
      const result = Result.of<number, Error>(42).apply((x) => x * 2);
      expect(result.data).toBe(84);
    });

    it("should not apply transformation on failure", () => {
      const error = new Error("test error");
      const result = Result.failure<number, Error>(error).apply((x) => x * 2);
      expect(result.error).toBe(error);
    });

    it("should apply error transformation on failure", () => {
      const error = new Error("original error");
      const result = Result.failure<number, Error>(error).applyOnFailure(
        (e) => new Error(`transformed: ${e.message}`)
      );
      expect(result.error?.message).toBe("transformed: original error");
    });
  });

  describe("Folding and conditions", () => {
    it("should fold success case", () => {
      const result = Result.of<number, Error>(42);
      const folded = result.fold(
        (data) => `Success: ${data}`,
        (error) => `Error: ${error.message}`
      );
      expect(folded).toBe("Success: 42");
    });

    it("should fold failure case", () => {
      const result = Result.failure<number, Error>(new Error("test error"));
      const folded = result.fold(
        (data) => `Success: ${data}`,
        (error) => `Error: ${error.message}`
      );
      expect(folded).toBe("Error: test error");
    });

    it("should fail on condition", () => {
      const result = Result.of<number, Error>(42).failOnCondition(
        (x) => x > 40,
        new Error("too large")
      );
      expect(result.error?.message).toBe("too large");
    });
  });

  describe("Recovery and side effects", () => {
    it("should return new value on failure", () => {
      const result = Result.failure<number, Error>(
        new Error("test error")
      ).onFailureReturn(42);
      expect(result.data).toBe(42);
    });

    it("should execute peek on success", () => {
      let sideEffect = 0;
      Result.of<number, Error>(42).peek((x) => {
        sideEffect = x;
      });
      expect(sideEffect).toBe(42);
    });

    it("should execute onFailurePeek on failure", () => {
      let sideEffect = "";
      Result.failure<number, Error>(new Error("test error")).onFailurePeek(
        (e) => {
          sideEffect = e.message;
        }
      );
      expect(sideEffect).toBe("test error");
    });

    it("should filter failure replacement", () => {
      const result = Result.failure<number, Error>(
        new Error("test error")
      ).onFailureReturn(42, (e) => e.message === "different error");
      expect(result.error?.message).toBe("test error");
    });
  });
});
