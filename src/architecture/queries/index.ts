import type {
  ArchitectureConstraint,
  ArchitectureElement,
  ArchitectureFinding,
  ArchitectureModel,
  ArchitectureRelation,
  ArchitectureView,
} from "../model";

export interface ElementInspection {
  element: ArchitectureElement;
  children: ArchitectureElement[];
  incomingRelations: ArchitectureRelation[];
  outgoingRelations: ArchitectureRelation[];
  constraints: ArchitectureConstraint[];
  findings: ArchitectureFinding[];
}

export function getElementById(
  architecture: ArchitectureModel,
  elementId: string,
): ArchitectureElement | undefined {
  return architecture.elements.find((element) => element.id === elementId);
}

export function getChildren(
  architecture: ArchitectureModel,
  parentId: string,
): ArchitectureElement[] {
  return architecture.elements.filter((element) => element.parentId === parentId);
}

export function getDescendants(
  architecture: ArchitectureModel,
  parentId: string,
): ArchitectureElement[] {
  const descendants: ArchitectureElement[] = [];
  const pendingParentIds = [parentId];

  while (pendingParentIds.length > 0) {
    const currentParentId = pendingParentIds.shift();
    if (!currentParentId) continue;

    const children = getChildren(architecture, currentParentId);
    descendants.push(...children);
    pendingParentIds.push(...children.map(({ id }) => id));
  }

  return descendants;
}

export function findIncomingRelations(
  architecture: ArchitectureModel,
  elementId: string,
): ArchitectureRelation[] {
  return architecture.relations.filter(({ targetId }) => targetId === elementId);
}

export function findOutgoingRelations(
  architecture: ArchitectureModel,
  elementId: string,
): ArchitectureRelation[] {
  return architecture.relations.filter(({ sourceId }) => sourceId === elementId);
}

export function getConstraintsForElement(
  architecture: ArchitectureModel,
  elementId: string,
): ArchitectureConstraint[] {
  return architecture.constraints.filter(({ rule }) => {
    if (rule.type === "no-cycles") return false;
    if (rule.type === "independent-deployment") return rule.elementId === elementId;
    return rule.sourceId === elementId || rule.targetId === elementId;
  });
}

export function getFindingsForElement(
  architecture: ArchitectureModel,
  elementId: string,
): ArchitectureFinding[] {
  const relationIds = new Set(
    architecture.relations
      .filter(({ sourceId, targetId }) => sourceId === elementId || targetId === elementId)
      .map(({ id }) => id),
  );

  return architecture.findings.filter(
    (finding) =>
      finding.elementIds?.includes(elementId) ||
      finding.relationIds?.some((relationId) => relationIds.has(relationId)),
  );
}

export function inspectElement(
  architecture: ArchitectureModel,
  elementId: string,
): ElementInspection | undefined {
  const element = getElementById(architecture, elementId);
  if (!element) return undefined;

  return {
    element,
    children: getChildren(architecture, elementId),
    incomingRelations: findIncomingRelations(architecture, elementId),
    outgoingRelations: findOutgoingRelations(architecture, elementId),
    constraints: getConstraintsForElement(architecture, elementId),
    findings: getFindingsForElement(architecture, elementId),
  };
}

export function getViewById(
  architecture: ArchitectureModel,
  viewId: string,
): ArchitectureView | undefined {
  return architecture.views.find((view) => view.id === viewId);
}
