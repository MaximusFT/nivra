import { describe, expect, it } from "vitest";

import { getChildren } from "../../architecture/queries";
import { commerceArchitecture } from "./architecture";
import { commerceLayouts } from "./layout";

describe("Commerce fixture integrity", () => {
  it("uses unique IDs across the architecture model", () => {
    const ids = [
      commerceArchitecture.elements,
      commerceArchitecture.relations,
      commerceArchitecture.contracts,
      commerceArchitecture.views,
      commerceArchitecture.boundaries,
    ].flatMap((collection) => collection.map(({ id }) => id));

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("references existing elements from every relation", () => {
    const elementIds = new Set(commerceArchitecture.elements.map(({ id }) => id));

    for (const relation of commerceArchitecture.relations) {
      expect(elementIds.has(relation.sourceId), `${relation.id} source`).toBe(true);
      expect(elementIds.has(relation.targetId), `${relation.id} target`).toBe(true);
    }
  });

  it("references existing elements and relations from every view", () => {
    const elementIds = new Set(commerceArchitecture.elements.map(({ id }) => id));
    const relationIds = new Set(commerceArchitecture.relations.map(({ id }) => id));

    for (const view of commerceArchitecture.views) {
      for (const elementId of view.elementIds) {
        expect(elementIds.has(elementId), `${view.id} element ${elementId}`).toBe(true);
      }
      for (const relationId of view.relationIds) {
        expect(relationIds.has(relationId), `${view.id} relation ${relationId}`).toBe(true);
      }
    }
  });

  it("provides a deterministic position for every visible element", () => {
    for (const view of commerceArchitecture.views) {
      const layout = commerceLayouts.find(({ viewId }) => view.id === viewId);
      expect(layout, view.id).toBeDefined();

      const positionedIds = new Set(layout?.elements.map(({ elementId }) => elementId));
      for (const elementId of view.elementIds) {
        expect(positionedIds.has(elementId), `${view.id} layout ${elementId}`).toBe(true);
      }
    }
  });

  it("gives every LLD element a valid parent", () => {
    const elementIds = new Set(commerceArchitecture.elements.map(({ id }) => id));
    const lldElements = commerceArchitecture.elements.filter(({ level }) => level === "lld");

    for (const element of lldElements) {
      expect(element.parentId, element.id).toBeDefined();
      expect(elementIds.has(element.parentId!), `${element.id} parent`).toBe(true);
    }
  });
});

describe("Checkout hierarchy", () => {
  it("resolves the canonical Checkout LLD children", () => {
    const childIds = getChildren(commerceArchitecture, "checkout-mfe").map(({ id }) => id);

    expect(childIds).toEqual([
      "checkout-page",
      "checkout-domain",
      "basket-adapter",
      "pricing-module",
      "payment-module",
      "order-module",
      "checkout-api-client",
    ]);
  });
});

describe("Golden scenario relations", () => {
  it("models hidden Product runtime coupling as shared state", () => {
    expect(commerceArchitecture.relations).toContainEqual(
      expect.objectContaining({
        sourceId: "basket-adapter",
        targetId: "product-store",
        type: "shares-state",
      }),
    );
  });

  it("models Product pricing integration as an explicit REST call", () => {
    expect(commerceArchitecture.relations).toContainEqual(
      expect.objectContaining({
        sourceId: "pricing-module",
        targetId: "product-service",
        type: "calls",
        protocol: "REST",
      }),
    );
  });
});
