import { describe, expect, it } from "vitest";

import { isWebMcpAvailable } from "./availability";

describe("WebMCP availability", () => {
  it("reports unavailable in the non-browser test environment", () => {
    expect(isWebMcpAvailable()).toBe(false);
  });
});
