import { describe, expect, it } from "vitest";

import { commerceArchitecture } from "../../fixtures/commerce/architecture";
import { CHECKOUT_LLD_VIEW_ID } from "../../shared/ids";
import { getFocusContext } from "./getFocusContext";

const checkoutView = commerceArchitecture.views.find(({ id }) => id === CHECKOUT_LLD_VIEW_ID);

if (!checkoutView) {
  throw new Error("Checkout LLD view is missing.");
}

describe("architecture focus context", () => {
  it("focuses both endpoints of a selected relation", () => {
    const focus = getFocusContext({
      architecture: commerceArchitecture,
      view: checkoutView,
      selectedElementIds: [],
      selectedRelationIds: ["basket-adapter-shares-product-store"],
    });

    expect(focus.elementIds).toEqual(["basket-adapter", "product-store"]);
    expect(focus.relationIds).toEqual(["basket-adapter-shares-product-store"]);
  });

  it("focuses a selected element and its direct evidence", () => {
    const focus = getFocusContext({
      architecture: commerceArchitecture,
      view: checkoutView,
      selectedElementIds: ["basket-adapter"],
      selectedRelationIds: [],
    });

    expect(focus.elementIds).toEqual(
      expect.arrayContaining(["checkout-domain", "basket-adapter", "product-store"]),
    );
    expect(focus.relationIds).toEqual(
      expect.arrayContaining([
        "checkout-domain-depends-on-basket-adapter",
        "basket-adapter-shares-product-store",
      ]),
    );
  });
});
