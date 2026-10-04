import { expect, test } from "bun:test";
import { add, mul, sub } from "./math";

test("add", () => {
  expect(add(2, 3)).toBe(5);
});

test("sub returns a positive result", () => {
  expect(sub(5, 3)).toBe(2);
});

test("sub returns a negative result", () => {
  expect(sub(3, 5)).toBe(-2);
});

test("mul returns a positive result", () => {
  expect(mul(2, 3)).toBe(6);
});

test("mul returns a negative result", () => {
  expect(mul(-2, 3)).toBe(-6);
});

test("mul returns zero for a zero operand", () => {
  expect(mul(0, 5)).toBe(0);
});
