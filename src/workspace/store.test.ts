import { beforeEach, describe, expect, it } from "vitest";

import { CHECKOUT_LLD_VIEW_ID, COMMERCE_HLD_VIEW_ID } from "../shared/ids";
import { useWorkspaceStore } from "./store";

describe("workspace store", () => {
  beforeEach(() => useWorkspaceStore.getState().resetWorkspace());

  it("initializes from the canonical Commerce fixture", () => {
    const state = useWorkspaceStore.getState();

    expect(state.architecture.name).toBe("Commerce Platform");
    expect(state.architecture.version).toBe(1.35);
    expect(state.activeViewId).toBe(COMMERCE_HLD_VIEW_ID);
    expect(state.activeMode).toBe("current");
  });

  it("supports the minimal navigation and selection actions", () => {
    useWorkspaceStore.getState().selectElements(["basket-adapter"]);
    useWorkspaceStore.getState().selectRelations(["basket-adapter-shares-product-store"]);
    useWorkspaceStore.getState().setActiveView(CHECKOUT_LLD_VIEW_ID);

    const state = useWorkspaceStore.getState();
    expect(state.activeViewId).toBe(CHECKOUT_LLD_VIEW_ID);
    expect(state.selectedElementIds).toEqual([]);
    expect(state.selectedRelationIds).toEqual([]);
  });

  it("adds a finding immutably and focuses its evidence view", () => {
    const originalArchitecture = useWorkspaceStore.getState().architecture;

    useWorkspaceStore.getState().addFinding({
      id: "checkout-isolation-risk",
      title: "Checkout isolation risk",
      description: "Checkout shares Product runtime state.",
      severity: "warning",
      source: "human",
      relationIds: ["basket-adapter-shares-product-store"],
      status: "open",
    });
    useWorkspaceStore.getState().focusFinding("checkout-isolation-risk");

    const state = useWorkspaceStore.getState();
    expect(state.architecture).not.toBe(originalArchitecture);
    expect(originalArchitecture.findings).toEqual([]);
    expect(state.architecture.findings).toHaveLength(1);
    expect(state.activeViewId).toBe(CHECKOUT_LLD_VIEW_ID);
    expect(state.selectedRelationIds).toEqual(["basket-adapter-shares-product-store"]);
  });
});
