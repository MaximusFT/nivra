import { beforeEach, describe, expect, it } from "vitest";

import { CHECKOUT_LLD_VIEW_ID, COMMERCE_HLD_VIEW_ID } from "../shared/ids";
import { checkoutGoldenConstraints } from "../fixtures/commerce/constraints";
import { goldenCheckoutProposal } from "../fixtures/commerce/proposals";
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

  it("adds constraints and stores deterministic validation separately from findings", () => {
    for (const constraint of checkoutGoldenConstraints) {
      useWorkspaceStore.getState().addConstraint(constraint);
    }
    useWorkspaceStore.getState().validateCurrent();

    const state = useWorkspaceStore.getState();
    expect(state.architecture.constraints).toHaveLength(4);
    expect(state.architecture.findings).toEqual([]);
    expect(state.validationResult?.summary).toEqual({ passed: 2, failed: 2 });

    useWorkspaceStore.getState().focusValidationCheck("checkout-runtime-isolation");
    expect(useWorkspaceStore.getState().activeViewId).toBe(CHECKOUT_LLD_VIEW_ID);
    expect(useWorkspaceStore.getState().selectedRelationIds).toEqual([
      "basket-adapter-shares-product-store",
    ]);
  });

  it("switches to an immutable proposal and validates its effective architecture", () => {
    for (const constraint of checkoutGoldenConstraints) {
      useWorkspaceStore.getState().addConstraint(constraint);
    }
    useWorkspaceStore.getState().createProposal(goldenCheckoutProposal);
    useWorkspaceStore.getState().validateActive();

    const state = useWorkspaceStore.getState();
    expect(state.activeMode).toBe("proposal");
    expect(state.activeProposalId).toBe("checkout-isolation");
    expect(state.architecture.relations.some(({ id }) => id === "basket-adapter-shares-product-store")).toBe(true);
    expect(state.validationResult?.summary).toEqual({ passed: 4, failed: 0 });

    useWorkspaceStore.getState().setActiveMode("current");
    expect(useWorkspaceStore.getState().activeMode).toBe("current");
  });

  it("saves a verified proposal as an architecture branch and switches without mutating Current", () => {
    for (const constraint of checkoutGoldenConstraints) {
      useWorkspaceStore.getState().addConstraint(constraint);
    }
    useWorkspaceStore.getState().createProposal(goldenCheckoutProposal);
    useWorkspaceStore.getState().saveActiveProposalAsBranch();
    expect(useWorkspaceStore.getState().savedBranchProposalIds).toEqual([]);

    useWorkspaceStore.getState().validateActive();
    useWorkspaceStore.getState().saveActiveProposalAsBranch();

    expect(useWorkspaceStore.getState().savedBranchProposalIds).toEqual(["checkout-isolation"]);

    useWorkspaceStore.getState().switchArchitectureBranch("current/commerce-1.35");
    expect(useWorkspaceStore.getState().activeMode).toBe("current");
    expect(useWorkspaceStore.getState().architecture.relations.some(({ id }) => id === "basket-adapter-shares-product-store")).toBe(true);

    useWorkspaceStore.getState().switchArchitectureBranch("checkout-isolation");
    expect(useWorkspaceStore.getState().activeMode).toBe("proposal");
    expect(useWorkspaceStore.getState().activeProposalId).toBe("checkout-isolation");
  });
});
