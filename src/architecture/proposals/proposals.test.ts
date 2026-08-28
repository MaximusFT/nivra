import { describe, expect, it } from "vitest";

import { commerceArchitecture } from "../../fixtures/commerce/architecture";
import { checkoutGoldenConstraints } from "../../fixtures/commerce/constraints";
import { goldenCheckoutProposal } from "../../fixtures/commerce/proposals";
import { validateArchitecture } from "../validation";
import { applyProposal, getProposalDiff } from ".";

describe("proposal engine", () => {
  it("applies a patch without mutating Current Architecture", () => {
    const effective = applyProposal(commerceArchitecture, goldenCheckoutProposal);

    expect(effective).not.toBe(commerceArchitecture);
    expect(commerceArchitecture.elements.some(({ id }) => id === "checkout-snapshot-contract")).toBe(false);
    expect(effective.elements.some(({ id }) => id === "checkout-snapshot-contract")).toBe(true);
    expect(commerceArchitecture.relations.some(({ id }) => id === "basket-adapter-shares-product-store")).toBe(true);
    expect(effective.relations.some(({ id }) => id === "basket-adapter-shares-product-store")).toBe(false);
  });

  it("derives effective Checkout LLD membership", () => {
    const effective = applyProposal(commerceArchitecture, goldenCheckoutProposal);
    const checkoutView = effective.views.find(({ id }) => id === "checkout-lld");

    expect(checkoutView?.elementIds).toContain("checkout-snapshot-contract");
    expect(checkoutView?.elementIds).not.toContain("product-store");
    expect(checkoutView?.relationIds).toContain("basket-adapter-reads-checkout-snapshot");
    expect(checkoutView?.relationIds).not.toContain("basket-adapter-shares-product-store");
  });

  it("calculates a stable proposal diff", () => {
    expect(getProposalDiff(goldenCheckoutProposal)).toEqual({
      addedElements: ["checkout-snapshot-contract"],
      updatedElements: [],
      removedElements: [],
      addedRelations: ["basket-adapter-reads-checkout-snapshot"],
      updatedRelations: [],
      removedRelations: ["basket-adapter-shares-product-store"],
    });
  });

  it("makes the Golden Proposal pass all constraints", () => {
    const effective = applyProposal(commerceArchitecture, goldenCheckoutProposal);
    const result = validateArchitecture({ architecture: effective, constraints: checkoutGoldenConstraints });

    expect(result.passed).toBe(true);
    expect(result.summary).toEqual({ passed: 4, failed: 0 });
  });
});
