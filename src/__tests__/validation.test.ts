import { describe, it, expect } from "vitest";
import { ContactSchema, TagSchema, InteractionSchema } from "../lib/validation";

describe("ContactSchema", () => {
  it("accepts valid input", () => {
    const result = ContactSchema.safeParse({
      name: "John",
      phone: "123",
      email: "john@test.com",
      company: "Acme",
      notes: "A note",
      tagIds: [1, 2],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = ContactSchema.safeParse({ name: "", phone: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects empty phone", () => {
    const result = ContactSchema.safeParse({ name: "John", phone: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = ContactSchema.safeParse({ name: "John", phone: "123", email: "invalid" });
    expect(result.success).toBe(false);
  });

  it("accepts null email", () => {
    const result = ContactSchema.safeParse({ name: "John", phone: "123", email: null });
    expect(result.success).toBe(true);
  });

  it("rejects name over 200 chars", () => {
    const result = ContactSchema.safeParse({ name: "x".repeat(201), phone: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects tagIds with non-positive integers", () => {
    const result = ContactSchema.safeParse({ name: "John", phone: "123", tagIds: [0] });
    expect(result.success).toBe(false);
  });

  it("rejects tagIds over 50 items", () => {
    const result = ContactSchema.safeParse({ name: "John", phone: "123", tagIds: Array.from({ length: 51 }, (_, i) => i + 1) });
    expect(result.success).toBe(false);
  });

  it("accepts missing optional fields", () => {
    const result = ContactSchema.safeParse({ name: "John", phone: "123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tagIds).toBeUndefined();
    }
  });
});

describe("TagSchema", () => {
  it("accepts valid input", () => {
    const result = TagSchema.safeParse({ name: "VIP", color: "#ff0000" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = TagSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("defaults color", () => {
    const result = TagSchema.safeParse({ name: "VIP" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.color).toBe("#6366f1");
    }
  });

  it("rejects invalid hex color", () => {
    const result = TagSchema.safeParse({ name: "VIP", color: "red" });
    expect(result.success).toBe(false);
  });

  it("rejects name over 50 chars", () => {
    const result = TagSchema.safeParse({ name: "x".repeat(51) });
    expect(result.success).toBe(false);
  });
});

describe("InteractionSchema", () => {
  it("accepts valid input", () => {
    const result = InteractionSchema.safeParse({ type: "call", content: "Called about renewal" });
    expect(result.success).toBe(true);
  });

  it("rejects empty content", () => {
    const result = InteractionSchema.safeParse({ type: "call", content: "" });
    expect(result.success).toBe(false);
  });

  it("defaults type to note", () => {
    const result = InteractionSchema.safeParse({ content: "Some note" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("note");
    }
  });

  it("rejects invalid type", () => {
    const result = InteractionSchema.safeParse({ type: "invalid", content: "Test" });
    expect(result.success).toBe(false);
  });

  it("rejects content over 5000 chars", () => {
    const result = InteractionSchema.safeParse({ content: "x".repeat(5001) });
    expect(result.success).toBe(false);
  });

  it("accepts all valid types", () => {
    for (const type of ["note", "call", "meeting", "whatsapp"]) {
      const result = InteractionSchema.safeParse({ type, content: "Test" });
      expect(result.success).toBe(true);
    }
  });
});
