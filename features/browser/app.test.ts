import { describe, expect, it } from "vitest";
import { toBrowserUrl } from "./app";

describe("toBrowserUrl", () => {
  it("normalizes input", () => {
    expect(toBrowserUrl("  ")).toBeNull();
    expect(toBrowserUrl("https://a.com")).toBe("https://a.com");
    expect(toBrowserUrl("github.com/x")).toBe("https://github.com/x");
    expect(toBrowserUrl("localhost:3000")).toBe("http://localhost:3000");
    expect(toBrowserUrl("bb plugin sdk")).toBe("https://www.google.com/search?q=bb%20plugin%20sdk");
  });
});
