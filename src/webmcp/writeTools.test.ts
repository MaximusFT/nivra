import { beforeEach, describe, expect, it } from "vitest";

import { checkoutGoldenConstraints } from "../fixtures/commerce/constraints";
import { goldenCheckoutProposal } from "../fixtures/commerce/proposals";
import { CHECKOUT_LLD_VIEW_ID } from "../shared/ids";
import { useWorkspaceStore } from "../workspace/store";
import {
  addConstraintTool,
  annotateArchitectureTool,
  createProposalTool,
  validateArchitectureTool,
} from "./writeTools";

const { createdBy: _createdBy, ...goldenProposalInput } = goldenCheckoutProposal;

describe("WebMCP Phase 4B tools", () => {
  beforeEach(() => {
    useWorkspaceStore.getState().resetWorkspace();
    useWorkspaceStore.getState().setWebMcpStatus("ready");
  });

  it("creates an agent finding and focuses its visible evidence", async () => {
    const result = await annotateArchitectureTool.execute({
      id: "checkout-product-runtime-coupling",
      title: "Checkout isolation risk",
      description: "Checkout still depends on Product runtime state.",
      severity: "warning",
      elementIds: ["basket-adapter", "product-store"],
      relationIds: ["basket-adapter-shares-product-store"],
    });

    expect(result.finding).toMatchObject({ source: "agent", status: "open" });
    const state = useWorkspaceStore.getState();
    expect(state.architecture.findings).toHaveLength(1);
    expect(state.activeViewId).toBe(CHECKOUT_LLD_VIEW_ID);
    expect(state.selectedRelationIds).toEqual(["basket-adapter-shares-product-store"]);
  });

  it("rejects invalid evidence without changing architecture", async () => {
    await expect(annotateArchitectureTool.execute({
      id: "invalid-finding",
      title: "Invalid",
      description: "References missing evidence.",
      severity: "warning",
      elementIds: ["missing-element"],
    })).rejects.toThrow("unknown ID");

    expect(useWorkspaceStore.getState().architecture.findings).toEqual([]);
    expect(useWorkspaceStore.getState().agentActivity.at(-1)?.status).toBe("error");
  });

  it("adds typed constraints idempotently by stable ID", async () => {
    const constraint = checkoutGoldenConstraints[0];
    await addConstraintTool.execute({ ...constraint });
    await addConstraintTool.execute({ ...constraint, description: "Updated decision." });

    expect(useWorkspaceStore.getState().architecture.constraints).toEqual([
      { ...constraint, description: "Updated decision." },
    ]);
  });

  it("rejects a constraint that references an unknown element", async () => {
    await expect(addConstraintTool.execute({
      id: "missing-boundary",
      name: "Missing boundary",
      description: "Invalid reference",
      severity: "error",
      rule: { type: "independent-deployment", elementId: "missing" },
    })).rejects.toThrow("unknown ID");
  });

  it("creates the Golden Proposal without mutating Current relations", async () => {
    const currentRelation = useWorkspaceStore.getState().architecture.relations.find(
      ({ id }) => id === "basket-adapter-shares-product-store",
    );
    const result = await createProposalTool.execute(goldenProposalInput);

    const state = useWorkspaceStore.getState();
    expect(result.diff.removedRelations).toEqual(["basket-adapter-shares-product-store"]);
    expect(state.activeMode).toBe("proposal");
    expect(state.activeProposalId).toBe("checkout-isolation");
    expect(state.architecture.relations.find(
      ({ id }) => id === "basket-adapter-shares-product-store",
    )).toBe(currentRelation);
  });

  it("rejects proposals based on another architecture version", async () => {
    await expect(createProposalTool.execute({
      ...goldenProposalInput,
      baseVersion: 99,
    })).rejects.toThrow("must equal current architecture version");

    expect(useWorkspaceStore.getState().architecture.proposals).toEqual([]);
  });

  it("rejects proposal relations whose endpoints would not exist", async () => {
    await expect(createProposalTool.execute({
      ...goldenProposalInput,
      changes: {
        ...goldenProposalInput.changes,
        addRelations: [{
          id: "invalid-relation",
          sourceId: "basket-adapter",
          targetId: "missing-element",
          type: "reads",
        }],
      },
    })).rejects.toThrow("unknown ID");
  });

  it("rejects invalid values nested inside proposal updates", async () => {
    await expect(createProposalTool.execute({
      ...goldenProposalInput,
      changes: {
        ...goldenProposalInput.changes,
        updateElements: [{ id: "checkout-domain", changes: { kind: "spaceship" } }],
      },
    })).rejects.toThrow("must be one of");
  });

  it("validates Current and Proposal deterministically in the visible workspace", async () => {
    for (const constraint of checkoutGoldenConstraints) {
      await addConstraintTool.execute({ ...constraint });
    }

    const current = await validateArchitectureTool.execute({ mode: "current" });
    expect(current.validation.summary).toEqual({ passed: 2, failed: 2 });

    await createProposalTool.execute(goldenProposalInput);
    const proposal = await validateArchitectureTool.execute({ mode: "proposal" });
    expect(proposal.validation.summary).toEqual({ passed: 4, failed: 0 });
    expect(useWorkspaceStore.getState().validationResult?.passed).toBe(true);
  });

  it("cannot validate a proposal before one exists", async () => {
    await expect(validateArchitectureTool.execute({ mode: "proposal" })).rejects.toThrow(
      "no active proposal",
    );
  });
});
