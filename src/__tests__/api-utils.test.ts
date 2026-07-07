import { describe, it, expect } from "vitest";
import {
  parseIdParam,
  parseContactInput,
  parseTagInput,
  parseInteractionInput,
} from "../lib/api-utils";

describe("parseIdParam", () => {
  it("parses valid integer strings", () => {
    expect(parseIdParam("1")).toBe(1);
    expect(parseIdParam("42")).toBe(42);
    expect(parseIdParam("999")).toBe(999);
  });

  it("rejects zero and negative", () => {
    expect(() => parseIdParam("0")).toThrow("Invalid id");
    expect(() => parseIdParam("-1")).toThrow("Invalid id");
  });

  it("rejects non-numeric strings", () => {
    expect(() => parseIdParam("abc")).toThrow("Invalid id");
    expect(() => parseIdParam("1.5")).toThrow("Invalid id");
  });

  it("rejects empty and nullish", () => {
    expect(() => parseIdParam("")).toThrow("Invalid id");
    expect(() => parseIdParam("undefined")).toThrow("Invalid id");
  });
});

describe("parseContactInput", () => {
  it("accepts valid input with all fields", () => {
    const result = parseContactInput({
      name: "John",
      phone: "123",
      email: "john@test.com",
      company: "Acme",
      notes: "A note",
      tagIds: [1, 2],
    });
    expect(result).toEqual({
      name: "John",
      phone: "123",
      email: "john@test.com",
      company: "Acme",
      notes: "A note",
      tagIds: [1, 2],
    });
  });

  it("trims whitespace from strings", () => {
    const result = parseContactInput({
      name: "  John  ",
      phone: "  123  ",
    });
    expect(result.name).toBe("John");
    expect(result.phone).toBe("123");
  });

  it("requires name", () => {
    expect(() => parseContactInput({ phone: "123" })).toThrow("Name is required");
    expect(() => parseContactInput({ name: "", phone: "123" })).toThrow("Name is required");
    expect(() => parseContactInput({ name: "   ", phone: "123" })).toThrow("Name is required");
  });

  it("requires phone", () => {
    expect(() => parseContactInput({ name: "John" })).toThrow("Phone is required");
    expect(() => parseContactInput({ name: "John", phone: "" })).toThrow("Phone is required");
  });

  it("validates email format", () => {
    expect(() =>
      parseContactInput({ name: "John", phone: "123", email: "invalid" })
    ).toThrow("Email must be a valid email address");
    expect(() =>
      parseContactInput({ name: "John", phone: "123", email: "@test.com" })
    ).toThrow("Email must be a valid email address");
  });

  it("accepts valid email", () => {
    const result = parseContactInput({
      name: "John",
      phone: "123",
      email: "john@test.com",
    });
    expect(result.email).toBe("john@test.com");
  });

  it("returns undefined for tagIds when not provided", () => {
    const result = parseContactInput({ name: "John", phone: "123" });
    expect(result.tagIds).toBeUndefined();
  });

  it("returns [] for tagIds when explicitly empty", () => {
    const result = parseContactInput({ name: "John", phone: "123", tagIds: [] });
    expect(result.tagIds).toEqual([]);
  });

  it("validates tagIds are positive integers", () => {
    expect(() =>
      parseContactInput({ name: "John", phone: "123", tagIds: [0] })
    ).toThrow("tagIds must only contain positive numeric IDs");
    expect(() =>
      parseContactInput({ name: "John", phone: "123", tagIds: [-1] })
    ).toThrow("tagIds must only contain positive numeric IDs");
    expect(() =>
      parseContactInput({ name: "John", phone: "123", tagIds: [1.5] })
    ).toThrow("tagIds must only contain positive numeric IDs");
  });

  it("deduplicates tagIds", () => {
    const result = parseContactInput({ name: "John", phone: "123", tagIds: [1, 1, 2, 2] });
    expect(result.tagIds).toEqual([1, 2]);
  });
});

describe("parseTagInput", () => {
  it("accepts valid input", () => {
    const result = parseTagInput({ name: "VIP", color: "#ff0000" });
    expect(result).toEqual({ name: "VIP", color: "#ff0000" });
  });

  it("requires name", () => {
    expect(() => parseTagInput({ color: "#ff0000" })).toThrow("Name is required");
    expect(() => parseTagInput({ name: "", color: "#ff0000" })).toThrow("Name is required");
  });

  it("defaults color to indigo", () => {
    const result = parseTagInput({ name: "VIP" });
    expect(result.color).toBe("#6366f1");
  });

  it("validates hex color format", () => {
    expect(() => parseTagInput({ name: "VIP", color: "red" })).toThrow(
      "Color must be a valid hex value"
    );
    expect(() => parseTagInput({ name: "VIP", color: "#fff" })).not.toThrow();
    expect(() => parseTagInput({ name: "VIP", color: "#ffffff" })).not.toThrow();
    expect(() => parseTagInput({ name: "VIP", color: "#fffff" })).toThrow(
      "Color must be a valid hex value"
    );
  });
});

describe("parseInteractionInput", () => {
  it("accepts valid input", () => {
    const result = parseInteractionInput({ type: "call", content: "Called about renewal" });
    expect(result).toEqual({ type: "call", content: "Called about renewal" });
  });

  it("requires content", () => {
    expect(() => parseInteractionInput({ type: "call" })).toThrow("Content is required");
    expect(() => parseInteractionInput({ type: "call", content: "" })).toThrow(
      "Content is required"
    );
    expect(() => parseInteractionInput({ type: "call", content: "   " })).toThrow(
      "Content is required"
    );
  });

  it("defaults type to note", () => {
    const result = parseInteractionInput({ content: "Some note" });
    expect(result.type).toBe("note");
  });

  it("validates type", () => {
    expect(() =>
      parseInteractionInput({ type: "invalid", content: "Test" })
    ).toThrow("Interaction type is invalid");
  });

  it("accepts all valid types", () => {
    for (const type of ["note", "call", "meeting", "whatsapp"]) {
      const result = parseInteractionInput({ type, content: "Test" });
      expect(result.type).toBe(type);
    }
  });
});
