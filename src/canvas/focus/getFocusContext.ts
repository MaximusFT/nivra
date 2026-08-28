import type { ArchitectureModel, ArchitectureView } from "../../architecture/model";

export interface ArchitectureFocusContext {
  elementIds: string[];
  relationIds: string[];
}

export interface GetFocusContextOptions {
  architecture: ArchitectureModel;
  view: ArchitectureView;
  selectedElementIds: string[];
  selectedRelationIds: string[];
}

export function getFocusContext({
  architecture,
  view,
  selectedElementIds,
  selectedRelationIds,
}: GetFocusContextOptions): ArchitectureFocusContext {
  if (selectedElementIds.length === 0 && selectedRelationIds.length === 0) {
    return { elementIds: [], relationIds: [] };
  }

  const visibleElementIds = new Set(view.elementIds);
  const visibleRelationIds = new Set(view.relationIds);
  const focusedElementIds = new Set(
    selectedElementIds.filter((elementId) => visibleElementIds.has(elementId)),
  );
  const focusedRelationIds = new Set(
    selectedRelationIds.filter((relationId) => visibleRelationIds.has(relationId)),
  );

  for (const relation of architecture.relations) {
    if (!visibleRelationIds.has(relation.id)) continue;

    const isSelectedRelation = focusedRelationIds.has(relation.id);
    const touchesSelectedElement =
      selectedElementIds.includes(relation.sourceId) || selectedElementIds.includes(relation.targetId);

    if (isSelectedRelation || touchesSelectedElement) {
      focusedRelationIds.add(relation.id);
      focusedElementIds.add(relation.sourceId);
      focusedElementIds.add(relation.targetId);
    }
  }

  return {
    elementIds: [...focusedElementIds],
    relationIds: [...focusedRelationIds],
  };
}
