import { expect, test } from "bun:test";
import { add, sub } from "./math";

test("add", () => {
  expect(add(2, 3)).toBe(5);
});

test("sub returns a positive result", () => {
  expect(sub(5, 3)).toBe(2);
});

test("sub returns a negative result", () => {
  expect(sub(3, 5)).toBe(-2);
});
