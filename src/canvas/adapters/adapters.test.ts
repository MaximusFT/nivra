import { describe, expect, it } from "vitest";

import { commerceArchitecture } from "../../fixtures/commerce/architecture";
import { commerceLayouts } from "../../fixtures/commerce/layout";
import { COMMERCE_HLD_VIEW_ID } from "../../shared/ids";
import { toFlowEdges } from "./toFlowEdges";
import { toFlowNodes } from "./toFlowNodes";

function getHldFixture() {
  const view = commerceArchitecture.views.find(({ id }) => id === COMMERCE_HLD_VIEW_ID);
  const layout = commerceLayouts.find(({ viewId }) => viewId === COMMERCE_HLD_VIEW_ID);

  if (!view || !layout) {
    throw new Error("Commerce HLD fixture is incomplete.");
  }

  return { view, layout };
}

describe("React Flow adapters", () => {
  it("creates nodes only for elements referenced by the active view", () => {
    const { view, layout } = getHldFixture();
    const nodes = toFlowNodes({ architecture: commerceArchitecture, view, layout });

    expect(nodes).toHaveLength(view.elementIds.length);
    expect(nodes.map(({ id }) => id)).toEqual(view.elementIds);
    expect(nodes.some(({ id }) => id === "basket-adapter")).toBe(false);
  });

  it("uses deterministic fixture positions and selection state", () => {
    const { view, layout } = getHldFixture();
    const nodes = toFlowNodes({
      architecture: commerceArchitecture,
      view,
      layout,
      selectedElementIds: ["checkout-mfe"],
    });

    expect(nodes.find(({ id }) => id === "app-shell")?.position).toEqual({ x: 80, y: 260 });
    expect(nodes.find(({ id }) => id === "checkout-mfe")?.selected).toBe(true);
  });

  it("creates semantic edges only when both endpoints are visible", () => {
    const { view } = getHldFixture();
    const edges = toFlowEdges({ architecture: commerceArchitecture, view });

    expect(edges).toHaveLength(view.relationIds.length);
    expect(edges.find(({ id }) => id === "product-mfe-calls-backend-api")).toEqual(
      expect.objectContaining({
        source: "product-mfe",
        target: "backend-api",
        label: "REST",
      }),
    );
    expect(edges.some(({ id }) => id === "basket-adapter-shares-product-store")).toBe(false);
  });

  it("marks proposal additions and removals as presentation-only change states", () => {
    const { view, layout } = getHldFixture();
    const nodes = toFlowNodes({
      architecture: commerceArchitecture,
      view,
      layout,
      addedElementIds: ["checkout-mfe"],
      removedElementIds: ["shared-store"],
    });
    const edges = toFlowEdges({
      architecture: commerceArchitecture,
      view,
      addedRelationIds: ["checkout-mfe-calls-backend-api"],
      removedRelationIds: ["product-mfe-writes-shared-store"],
    });

    expect(nodes.find(({ id }) => id === "checkout-mfe")?.data.changeStatus).toBe("added");
    expect(nodes.find(({ id }) => id === "shared-store")?.data.changeStatus).toBe("removed");
    expect(edges.find(({ id }) => id === "checkout-mfe-calls-backend-api")?.data?.changeStatus).toBe("added");
    expect(edges.find(({ id }) => id === "product-mfe-writes-shared-store")?.data?.changeStatus).toBe("removed");
  });
});
