import type { ModelContext } from "@mcp-b/webmcp-types";

export function getModelContext(): ModelContext | undefined {
  if (typeof document !== "undefined" && document.modelContext) {
    return document.modelContext;
  }

  if (typeof navigator !== "undefined") {
    return navigator.modelContext;
  }

  return undefined;
}

export function isWebMcpAvailable(): boolean {
  return getModelContext() !== undefined;
}
