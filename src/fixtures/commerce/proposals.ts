import type { ArchitectureProposal } from "../../architecture/model";

export const goldenCheckoutProposal: ArchitectureProposal = {
  id: "checkout-isolation",
  name: "Checkout Isolation",
  description: "Replace Product runtime state coupling with a Checkout-owned snapshot contract.",
  baseVersion: 1.35,
  createdBy: "agent",
  changes: {
    addElements: [
      {
        id: "checkout-snapshot-contract",
        name: "Checkout Snapshot Contract",
        kind: "contract",
        area: "frontend",
        level: "lld",
        parentId: "checkout-mfe",
        owner: "Checkout Team",
        deploymentUnit: "checkout",
        description: "Checkout-owned snapshot of the basket data required to complete an order.",
      },
    ],
    updateElements: [],
    removeElementIds: [],
    addRelations: [
      {
        id: "basket-adapter-reads-checkout-snapshot",
        sourceId: "basket-adapter",
        targetId: "checkout-snapshot-contract",
        type: "reads",
        protocol: "snapshot",
        description: "Basket Adapter consumes a Checkout-owned snapshot contract.",
      },
    ],
    updateRelations: [],
    removeRelationIds: ["basket-adapter-shares-product-store"],
  },
};
