import type {
  ArchitectureElement,
  ArchitectureModel,
  ArchitectureProposal,
  ArchitectureRelation,
} from "../model";

export interface ProposalDiff {
  addedElements: string[];
  updatedElements: string[];
  removedElements: string[];
  addedRelations: string[];
  updatedRelations: string[];
  removedRelations: string[];
}

function applyElementChanges(
  elements: ArchitectureElement[],
  proposal: ArchitectureProposal,
): ArchitectureElement[] {
  const removedIds = new Set(proposal.changes.removeElementIds);
  const updates = new Map(proposal.changes.updateElements.map((update) => [update.id, update.changes]));

  return [
    ...elements
      .filter(({ id }) => !removedIds.has(id))
      .map((element) => ({ ...element, ...updates.get(element.id) })),
    ...proposal.changes.addElements,
  ];
}

function applyRelationChanges(
  relations: ArchitectureRelation[],
  proposal: ArchitectureProposal,
  elementIds: Set<string>,
): ArchitectureRelation[] {
  const removedIds = new Set(proposal.changes.removeRelationIds);
  const updates = new Map(proposal.changes.updateRelations.map((update) => [update.id, update.changes]));

  return [
    ...relations
      .filter(({ id, sourceId, targetId }) =>
        !removedIds.has(id) && elementIds.has(sourceId) && elementIds.has(targetId),
      )
      .map((relation) => ({ ...relation, ...updates.get(relation.id) })),
    ...proposal.changes.addRelations.filter(
      ({ sourceId, targetId }) => elementIds.has(sourceId) && elementIds.has(targetId),
    ),
  ];
}

export function getProposalDiff(proposal: ArchitectureProposal): ProposalDiff {
  return {
    addedElements: proposal.changes.addElements.map(({ id }) => id),
    updatedElements: proposal.changes.updateElements.map(({ id }) => id),
    removedElements: [...proposal.changes.removeElementIds],
    addedRelations: proposal.changes.addRelations.map(({ id }) => id),
    updatedRelations: proposal.changes.updateRelations.map(({ id }) => id),
    removedRelations: [...proposal.changes.removeRelationIds],
  };
}

export function applyProposal(
  architecture: ArchitectureModel,
  proposal: ArchitectureProposal,
): ArchitectureModel {
  if (proposal.baseVersion !== architecture.version) {
    throw new Error(
      `Proposal ${proposal.id} is based on v${proposal.baseVersion}, not v${architecture.version}.`,
    );
  }

  const elements = applyElementChanges(architecture.elements, proposal);
  const elementIds = new Set(elements.map(({ id }) => id));
  const relations = applyRelationChanges(architecture.relations, proposal, elementIds);
  const relationIds = new Set(relations.map(({ id }) => id));
  const addedElementIds = new Set(proposal.changes.addElements.map(({ id }) => id));
  const addedRelationIds = new Set(proposal.changes.addRelations.map(({ id }) => id));

  const views = architecture.views.map((view) => {
    const visibleElementIds = new Set(
      view.elementIds.filter((elementId) => elementIds.has(elementId)),
    );

    for (const element of elements) {
      if (addedElementIds.has(element.id) && element.parentId === view.rootElementId) {
        visibleElementIds.add(element.id);
      }
    }

    const visibleRelationIds = new Set(
      view.relationIds.filter((relationId) => relationIds.has(relationId)),
    );
    for (const relation of relations) {
      if (
        addedRelationIds.has(relation.id) &&
        visibleElementIds.has(relation.sourceId) &&
        visibleElementIds.has(relation.targetId)
      ) {
        visibleRelationIds.add(relation.id);
      }
    }

    if (view.rootElementId) {
      const connectedIds = new Set<string>();
      for (const relation of relations) {
        if (!visibleRelationIds.has(relation.id)) continue;
        connectedIds.add(relation.sourceId);
        connectedIds.add(relation.targetId);
      }

      for (const elementId of [...visibleElementIds]) {
        const element = elements.find(({ id }) => id === elementId);
        const belongsToRoot = element?.parentId === view.rootElementId;
        if (!belongsToRoot && !connectedIds.has(elementId)) {
          visibleElementIds.delete(elementId);
        }
      }
    }

    return {
      ...view,
      elementIds: [...visibleElementIds],
      relationIds: [...visibleRelationIds],
    };
  });

  return {
    ...architecture,
    elements,
    relations,
    views,
  };
}
