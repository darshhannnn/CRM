import { describe, it, expect } from "vitest";
import { formatDate, getInitials, stringToColor } from "../lib/utils";

describe("formatDate", () => {
  it("returns time for today", () => {
    const now = new Date();
    const result = formatDate(now);
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it("returns 'Yesterday' for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatDate(yesterday)).toBe("Yesterday");
  });

  it("returns weekday for this week", () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const result = formatDate(threeDaysAgo);
    expect(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]).toContain(
      result
    );
  });

  it("returns formatted date for older dates", () => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const result = formatDate(twoWeeksAgo);
    expect(result).toMatch(/\w{3} \d{1,2}, \d{4}/);
  });

  it("returns formatted date for future dates", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = formatDate(tomorrow);
    expect(result).toMatch(/\w{3} \d{1,2}, \d{4}/);
  });

  it("handles string input", () => {
    const result = formatDate("2024-01-15T12:00:00Z");
    expect(result).toBeTruthy();
  });

  it("returns 'Invalid date' for invalid input", () => {
    expect(formatDate("not-a-date")).toBe("Invalid date");
  });
});

describe("getInitials", () => {
  it("returns first two initials for full names", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns single initial for single names", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("returns first two initials for multi-word names", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });

  it("handles single character names", () => {
    expect(getInitials("A")).toBe("A");
  });

  it("returns '?' for empty string", () => {
    expect(getInitials("")).toBe("?");
  });

  it("handles leading/trailing whitespace", () => {
    expect(getInitials("  John  ")).toBe("J");
    expect(getInitials("  John Doe  ")).toBe("JD");
  });

  it("handles names with multiple spaces", () => {
    expect(getInitials("John  Doe")).toBe("JD");
  });
});

describe("stringToColor", () => {
  it("returns a hex color", () => {
    const color = stringToColor("test");
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("returns consistent colors for same input", () => {
    expect(stringToColor("hello")).toBe(stringToColor("hello"));
  });

  it("returns different colors for different inputs", () => {
    expect(stringToColor("hello")).not.toBe(stringToColor("world"));
  });

  it("handles empty string", () => {
    const color = stringToColor("");
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });
});
