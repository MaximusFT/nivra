import { beforeEach, describe, expect, it } from "vitest";

import { CHECKOUT_LLD_VIEW_ID, COMMERCE_HLD_VIEW_ID } from "../shared/ids";
import { useWorkspaceStore } from "../workspace/store";
import { withAgentActivity } from "./activity";
import { getArchitectureTool, inspectElementTool, showArchitectureViewTool } from "./tools";

describe("WebMCP Phase 4A tools", () => {
  beforeEach(() => {
    useWorkspaceStore.getState().resetWorkspace();
    useWorkspaceStore.getState().setWebMcpStatus("checking");
  });

  it("returns semantic architecture state without visual positions", async () => {
    const result = await getArchitectureTool.execute();

    expect(result.mode).toBe("current");
    expect(result.activeViewId).toBe(COMMERCE_HLD_VIEW_ID);
    expect(result.architecture.elements.some(({ id }) => id === "checkout-mfe")).toBe(true);
    expect(result.architecture).not.toHaveProperty("layout");
    expect(result.architecture).not.toHaveProperty("positions");
    expect(useWorkspaceStore.getState().agentActivity.at(-1)?.status).toBe("success");
  });

  it("inspects an element through pure architecture queries", async () => {
    const result = await inspectElementTool.execute({ elementId: "checkout-mfe" });

    expect(result.element.id).toBe("checkout-mfe");
    expect(result.children.map(({ id }) => id)).toContain("basket-adapter");
    expect(result.outgoingRelations.length).toBeGreaterThan(0);
  });

  it("logs failed tool calls", async () => {
    await expect(inspectElementTool.execute({ elementId: "missing" })).rejects.toThrow(
      "was not found",
    );

    expect(useWorkspaceStore.getState().agentActivity.at(-1)).toMatchObject({
      tool: "inspect_element",
      status: "error",
    });
  });

  it("navigates and focuses through the shared workspace actions", async () => {
    await showArchitectureViewTool.execute({
      viewId: CHECKOUT_LLD_VIEW_ID,
      focusElementIds: ["basket-adapter", "product-store"],
      focusRelationIds: ["basket-adapter-shares-product-store"],
    });

    const state = useWorkspaceStore.getState();
    expect(state.activeViewId).toBe(CHECKOUT_LLD_VIEW_ID);
    expect(state.selectedElementIds).toEqual(["basket-adapter", "product-store"]);
    expect(state.selectedRelationIds).toEqual(["basket-adapter-shares-product-store"]);
  });

  it("rejects focus outside the requested view without changing context", async () => {
    await expect(
      showArchitectureViewTool.execute({
        viewId: COMMERCE_HLD_VIEW_ID,
        focusElementIds: ["basket-adapter"],
      }),
    ).rejects.toThrow("must be visible");

    expect(useWorkspaceStore.getState().activeViewId).toBe(COMMERCE_HLD_VIEW_ID);
    expect(useWorkspaceStore.getState().selectedElementIds).toEqual([]);
  });

  it("exposes running state before an operation completes", async () => {
    let release: (() => void) | undefined;
    const pending = withAgentActivity(
      "test_tool",
      "Wait for completion",
      () => new Promise<void>((resolve) => { release = resolve; }),
    );

    expect(useWorkspaceStore.getState().agentActivity.at(-1)?.status).toBe("running");
    release?.();
    await pending;
    expect(useWorkspaceStore.getState().agentActivity.at(-1)?.status).toBe("success");
  });
});
