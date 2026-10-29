import test from "node:test";
import assert from "node:assert/strict";
import { convertCurrency } from "../src/domain/currency.js";

test("converts a valid amount at the supplied exchange rate", () => {
  assert.equal(convertCurrency(100, 1.25), 125);
  assert.equal(convertCurrency("25.50", 2), 51);
});

test("returns zero for zero amount and identity rate", () => {
  assert.equal(convertCurrency(0, 1), 0);
  assert.equal(convertCurrency(123.45, 1), 123.45);
});

test("rejects empty, negative, and non-finite amounts", () => {
  assert.equal(convertCurrency("", 1.25), null);
  assert.equal(convertCurrency(-1, 1.25), null);
  assert.equal(convertCurrency("not a number", 1.25), null);
});

test("rejects invalid exchange rates", () => {
  assert.equal(convertCurrency(5, 0), null);
  assert.equal(convertCurrency(5, -2), null);
  assert.equal(convertCurrency(5, Number.NaN), null);
});
