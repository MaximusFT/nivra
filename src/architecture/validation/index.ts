import type {
  ArchitectureConstraint,
  ArchitectureElement,
  ArchitectureModel,
  ArchitectureRelation,
} from "../model";
import { getDescendants, getElementById } from "../queries";

export interface ValidationCheckResult {
  constraintId: string;
  name: string;
  status: "passed" | "failed";
  message: string;
  elementIds: string[];
  relationIds: string[];
}

export interface ValidationResult {
  architectureId: string;
  architectureVersion: number;
  passed: boolean;
  summary: {
    passed: number;
    failed: number;
  };
  checks: ValidationCheckResult[];
}

export interface ValidateArchitectureOptions {
  architecture: ArchitectureModel;
  constraints?: ArchitectureConstraint[];
}

function elementFamilyIds(architecture: ArchitectureModel, elementId: string): Set<string> {
  return new Set([
    elementId,
    ...getDescendants(architecture, elementId).map(({ id }) => id),
  ]);
}

function relationsBetween(
  architecture: ArchitectureModel,
  sourceIds: Set<string>,
  targetIds: Set<string>,
): ArchitectureRelation[] {
  return architecture.relations.filter(
    ({ sourceId, targetId }) => sourceIds.has(sourceId) && targetIds.has(targetId),
  );
}

function evidenceElementIds(
  relations: ArchitectureRelation[],
  fallbackIds: string[],
): string[] {
  if (relations.length === 0) return fallbackIds;
  return [...new Set(relations.flatMap(({ sourceId, targetId }) => [sourceId, targetId]))];
}

function resolveDeploymentUnit(
  architecture: ArchitectureModel,
  element: ArchitectureElement | undefined,
): string | undefined {
  let current = element;
  const visited = new Set<string>();

  while (current && !visited.has(current.id)) {
    if (current.deploymentUnit) return current.deploymentUnit;
    visited.add(current.id);
    current = current.parentId ? getElementById(architecture, current.parentId) : undefined;
  }

  return undefined;
}

function validateForbiddenDependency(
  architecture: ArchitectureModel,
  constraint: ArchitectureConstraint & {
    rule: Extract<ArchitectureConstraint["rule"], { type: "forbidden-dependency" }>;
  },
): ValidationCheckResult {
  const sourceIds = elementFamilyIds(architecture, constraint.rule.sourceId);
  const targetIds = elementFamilyIds(architecture, constraint.rule.targetId);
  const violations = relationsBetween(architecture, sourceIds, targetIds);

  return {
    constraintId: constraint.id,
    name: constraint.name,
    status: violations.length === 0 ? "passed" : "failed",
    message:
      violations.length === 0
        ? "No forbidden dependency is present."
        : `${violations.length} forbidden dependency${violations.length === 1 ? "" : "ies"} found.`,
    elementIds: evidenceElementIds(violations, [constraint.rule.sourceId, constraint.rule.targetId]),
    relationIds: violations.map(({ id }) => id),
  };
}

function validateIndependentDeployment(
  architecture: ArchitectureModel,
  constraint: ArchitectureConstraint & {
    rule: Extract<ArchitectureConstraint["rule"], { type: "independent-deployment" }>;
  },
): ValidationCheckResult {
  const familyIds = elementFamilyIds(architecture, constraint.rule.elementId);
  const runtimeCouplings = architecture.relations.filter((relation) => {
    const crossesBoundary =
      familyIds.has(relation.sourceId) !== familyIds.has(relation.targetId);
    if (!crossesBoundary || relation.type !== "shares-state") return false;

    const sourceUnit = resolveDeploymentUnit(
      architecture,
      getElementById(architecture, relation.sourceId),
    );
    const targetUnit = resolveDeploymentUnit(
      architecture,
      getElementById(architecture, relation.targetId),
    );

    return sourceUnit !== targetUnit;
  });

  return {
    constraintId: constraint.id,
    name: constraint.name,
    status: runtimeCouplings.length === 0 ? "passed" : "failed",
    message:
      runtimeCouplings.length === 0
        ? "No shared runtime state crosses the deployment boundary."
        : "Shared runtime state crosses the deployment boundary.",
    elementIds: evidenceElementIds(runtimeCouplings, [constraint.rule.elementId]),
    relationIds: runtimeCouplings.map(({ id }) => id),
  };
}

function findCycleRelations(architecture: ArchitectureModel): string[] {
  const outgoing = new Map<string, ArchitectureRelation[]>();
  for (const relation of architecture.relations) {
    const relations = outgoing.get(relation.sourceId) ?? [];
    relations.push(relation);
    outgoing.set(relation.sourceId, relations);
  }

  const visited = new Set<string>();
  const active = new Set<string>();
  const path: ArchitectureRelation[] = [];

  function visit(elementId: string): string[] | undefined {
    visited.add(elementId);
    active.add(elementId);

    for (const relation of outgoing.get(elementId) ?? []) {
      if (active.has(relation.targetId)) {
        const cycleStart = path.findIndex(({ sourceId }) => sourceId === relation.targetId);
        return [...path.slice(Math.max(cycleStart, 0)), relation].map(({ id }) => id);
      }

      if (!visited.has(relation.targetId)) {
        path.push(relation);
        const cycle = visit(relation.targetId);
        if (cycle) return cycle;
        path.pop();
      }
    }

    active.delete(elementId);
    return undefined;
  }

  for (const element of architecture.elements) {
    if (visited.has(element.id)) continue;
    const cycle = visit(element.id);
    if (cycle) return cycle;
  }

  return [];
}

function validateNoCycles(
  architecture: ArchitectureModel,
  constraint: ArchitectureConstraint,
): ValidationCheckResult {
  const cycleRelationIds = findCycleRelations(architecture);

  return {
    constraintId: constraint.id,
    name: constraint.name,
    status: cycleRelationIds.length === 0 ? "passed" : "failed",
    message: cycleRelationIds.length === 0 ? "No dependency cycles found." : "A dependency cycle was found.",
    elementIds: [],
    relationIds: cycleRelationIds,
  };
}

function validateAllowedProtocol(
  architecture: ArchitectureModel,
  constraint: ArchitectureConstraint & {
    rule: Extract<ArchitectureConstraint["rule"], { type: "allowed-protocol" }>;
  },
): ValidationCheckResult {
  const sourceIds = elementFamilyIds(architecture, constraint.rule.sourceId);
  const targetIds = elementFamilyIds(architecture, constraint.rule.targetId);
  const dependencies = relationsBetween(architecture, sourceIds, targetIds);
  const allowed = new Set(constraint.rule.protocols.map((protocol) => protocol.toLowerCase()));
  const violations = dependencies.filter(
    ({ protocol }) => !protocol || !allowed.has(protocol.toLowerCase()),
  );

  return {
    constraintId: constraint.id,
    name: constraint.name,
    status: violations.length === 0 ? "passed" : "failed",
    message:
      violations.length === 0
        ? "All matching dependencies use an allowed protocol."
        : "A matching dependency uses a disallowed or unspecified protocol.",
    elementIds: [constraint.rule.sourceId, constraint.rule.targetId],
    relationIds: violations.map(({ id }) => id),
  };
}

function validateConstraint(
  architecture: ArchitectureModel,
  constraint: ArchitectureConstraint,
): ValidationCheckResult {
  switch (constraint.rule.type) {
    case "forbidden-dependency":
      return validateForbiddenDependency(architecture, constraint as Parameters<typeof validateForbiddenDependency>[1]);
    case "independent-deployment":
      return validateIndependentDeployment(architecture, constraint as Parameters<typeof validateIndependentDeployment>[1]);
    case "no-cycles":
      return validateNoCycles(architecture, constraint);
    case "allowed-protocol":
      return validateAllowedProtocol(architecture, constraint as Parameters<typeof validateAllowedProtocol>[1]);
  }
}

export function validateArchitecture({
  architecture,
  constraints = architecture.constraints,
}: ValidateArchitectureOptions): ValidationResult {
  const checks = constraints.map((constraint) => validateConstraint(architecture, constraint));
  const passed = checks.filter(({ status }) => status === "passed").length;
  const failed = checks.length - passed;

  return {
    architectureId: architecture.id,
    architectureVersion: architecture.version,
    passed: failed === 0,
    summary: { passed, failed },
    checks,
  };
}
