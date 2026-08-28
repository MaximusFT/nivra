import type { ArchitectureConstraint } from "../../architecture/model";

export const checkoutGoldenConstraints: ArchitectureConstraint[] = [
  {
    id: "checkout-runtime-isolation",
    name: "Checkout Runtime Isolation",
    description: "Checkout must not depend on Product runtime state.",
    severity: "error",
    rule: {
      type: "forbidden-dependency",
      sourceId: "checkout-mfe",
      targetId: "product-store",
    },
  },
  {
    id: "independent-checkout-deployment",
    name: "Independent Checkout Deployment",
    description: "Checkout must remain independently deployable.",
    severity: "error",
    rule: { type: "independent-deployment", elementId: "checkout-mfe" },
  },
  {
    id: "no-circular-dependencies",
    name: "No Circular Dependencies",
    description: "Architecture dependencies must remain acyclic.",
    severity: "error",
    rule: { type: "no-cycles" },
  },
  {
    id: "allowed-product-integration",
    name: "Allowed Product Integration",
    description: "Checkout may use the Product REST API.",
    severity: "error",
    rule: {
      type: "allowed-protocol",
      sourceId: "pricing-module",
      targetId: "product-service",
      protocols: ["REST"],
    },
  },
];
