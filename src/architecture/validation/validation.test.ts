import { describe, expect, it } from "vitest";

import type { ArchitectureConstraint, ArchitectureModel } from "../model";
import { commerceArchitecture } from "../../fixtures/commerce/architecture";
import { validateArchitecture } from ".";

const goldenConstraints: ArchitectureConstraint[] = [
  {
    id: "checkout-runtime-isolation",
    name: "Checkout Runtime Isolation",
    description: "Checkout must not depend on Product runtime state.",
    severity: "error",
    rule: { type: "forbidden-dependency", sourceId: "checkout-mfe", targetId: "product-store" },
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
      protocols: ["rest"],
    },
  },
];

describe("architecture validation", () => {
  it("deterministically reports the Golden Current state", () => {
    const result = validateArchitecture({ architecture: commerceArchitecture, constraints: goldenConstraints });

    expect(result.passed).toBe(false);
    expect(result.summary).toEqual({ passed: 2, failed: 2 });
    expect(result.checks.map(({ constraintId, status }) => ({ constraintId, status }))).toEqual([
      { constraintId: "checkout-runtime-isolation", status: "failed" },
      { constraintId: "independent-checkout-deployment", status: "failed" },
      { constraintId: "no-circular-dependencies", status: "passed" },
      { constraintId: "allowed-product-integration", status: "passed" },
    ]);
  });

  it("detects dependency cycles", () => {
    const architecture: ArchitectureModel = {
      ...commerceArchitecture,
      relations: [
        ...commerceArchitecture.relations,
        {
          id: "commerce-db-calls-backend-api",
          sourceId: "commerce-db",
          targetId: "backend-api",
          type: "calls",
        },
      ],
    };
    const result = validateArchitecture({ architecture, constraints: [goldenConstraints[2]!] });

    expect(result.checks[0]).toEqual(
      expect.objectContaining({ status: "failed" }),
    );
    expect(result.checks[0]?.relationIds).toContain("commerce-db-calls-backend-api");
  });

  it("normalizes allowed protocol case", () => {
    const result = validateArchitecture({
      architecture: commerceArchitecture,
      constraints: [goldenConstraints[3]!],
    });

    expect(result.checks[0]?.status).toBe("passed");
  });
});
