import { describe, expect, it } from "vitest";

import type { ArchitectureModel } from "../model";
import { commerceArchitecture } from "../../fixtures/commerce/architecture";
import {
  findIncomingRelations,
  findOutgoingRelations,
  getDescendants,
  getFindingsForElement,
  inspectElement,
} from ".";

describe("architecture queries", () => {
  it("resolves descendants without mixing unrelated LLD elements", () => {
    expect(getDescendants(commerceArchitecture, "checkout-mfe").map(({ id }) => id)).toEqual([
      "checkout-page",
      "checkout-domain",
      "basket-adapter",
      "pricing-module",
      "payment-module",
      "order-module",
      "checkout-api-client",
    ]);
  });

  it("finds incoming and outgoing relations", () => {
    expect(findIncomingRelations(commerceArchitecture, "product-store").map(({ id }) => id)).toEqual([
      "basket-adapter-shares-product-store",
    ]);
    expect(findOutgoingRelations(commerceArchitecture, "pricing-module").map(({ id }) => id)).toEqual([
      "pricing-module-calls-product-service",
    ]);
  });

  it("returns a complete element inspection", () => {
    const inspection = inspectElement(commerceArchitecture, "basket-adapter");

    expect(inspection?.element.name).toBe("Basket Adapter");
    expect(inspection?.incomingRelations.map(({ sourceId }) => sourceId)).toContain("checkout-domain");
    expect(inspection?.outgoingRelations.map(({ targetId }) => targetId)).toContain("product-store");
  });

  it("associates relation findings with both evidence endpoints", () => {
    const architecture: ArchitectureModel = {
      ...commerceArchitecture,
      findings: [
        {
          id: "checkout-isolation-risk",
          title: "Checkout isolation risk",
          description: "Checkout shares Product runtime state.",
          severity: "warning",
          source: "human",
          relationIds: ["basket-adapter-shares-product-store"],
          status: "open",
        },
      ],
    };

    expect(getFindingsForElement(architecture, "basket-adapter")).toHaveLength(1);
    expect(getFindingsForElement(architecture, "product-store")).toHaveLength(1);
    expect(getFindingsForElement(architecture, "pricing-module")).toHaveLength(0);
  });
});
