import { describe, expect, it } from "vitest";
import { formatBRL } from "@/lib/pdv/format";
import { parseQuantityQuery } from "@/lib/pdv/parseQuantityQuery";

describe("parseQuantityQuery", () => {
  it.each([
    ["4*123", { qty: 4, query: "123" }],
    ["abc", { qty: 1, query: "abc" }],
    ["0*123", { qty: 1, query: "123" }],
    ["*123", { qty: 1, query: "123" }],
  ])("parses %s", (value, expected) => {
    expect(parseQuantityQuery(value)).toEqual(expected);
  });
});

describe("formatBRL", () => {
  it("formats Brazilian currency", () => {
    expect(formatBRL(1234.5)).toBe("R$ 1.234,50");
  });
});
