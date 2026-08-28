import type { ModelContext } from "@mcp-b/webmcp-types";

import { useWorkspaceStore } from "../workspace/store";
import { getModelContext } from "./availability";
import { getArchitectureTool, inspectElementTool, showArchitectureViewTool } from "./tools";
import {
  addConstraintTool,
  annotateArchitectureTool,
  createProposalTool,
  validateArchitectureTool,
} from "./writeTools";

let registrationPromise: Promise<void> | undefined;

export function registerWebMcpTools(
  modelContext: ModelContext | undefined = getModelContext(),
): Promise<void> {
  if (registrationPromise) return registrationPromise;

  if (!modelContext) {
    useWorkspaceStore.getState().setWebMcpStatus("unavailable");
    return Promise.resolve();
  }

  const controller = new AbortController();
  const options = { signal: controller.signal };
  registrationPromise = Promise.all([
    modelContext.registerTool(getArchitectureTool, options),
    modelContext.registerTool(inspectElementTool, options),
    modelContext.registerTool(showArchitectureViewTool, options),
    modelContext.registerTool(annotateArchitectureTool, options),
    modelContext.registerTool(addConstraintTool, options),
    modelContext.registerTool(createProposalTool, options),
    modelContext.registerTool(validateArchitectureTool, options),
  ])
    .then(() => {
      useWorkspaceStore.getState().setWebMcpStatus("ready");
    })
    .catch((error: unknown) => {
      controller.abort();
      registrationPromise = undefined;
      useWorkspaceStore.getState().setWebMcpStatus("unavailable");
      console.error("WebMCP tool registration failed", error);
    });

  return registrationPromise;
}
