import type { ModelContext, ModelContextTool } from "@mcp-b/webmcp-types";
import { describe, expect, it, vi } from "vitest";

import { useWorkspaceStore } from "../workspace/store";
import { registerWebMcpTools } from "./register";

describe("WebMCP registration", () => {
  it("registers the Phase 4A tools and marks the workspace ready", async () => {
    const registeredNames: string[] = [];
    const registerTool = vi.fn(async (tool: ModelContextTool) => {
      registeredNames.push(tool.name);
    });
    const modelContext = {
      registerTool,
    } as unknown as ModelContext;

    await registerWebMcpTools(modelContext);

    expect(registeredNames).toEqual([
      "get_architecture",
      "inspect_element",
      "show_architecture_view",
    ]);
    expect(registerTool).toHaveBeenCalledTimes(3);
    expect(useWorkspaceStore.getState().webMcpStatus).toBe("ready");
  });
});
