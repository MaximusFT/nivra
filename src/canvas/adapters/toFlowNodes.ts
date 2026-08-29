import type { ArchitectureModel, ArchitectureView } from '../../architecture/model';
import type { ViewLayout } from '../../fixtures/commerce/layout';
import type { ArchitectureFlowNode } from './types';

export interface ToFlowNodesOptions {
  architecture: ArchitectureModel;
  view: ArchitectureView;
  layout: ViewLayout;
  selectedElementIds?: string[];
  focusedElementIds?: string[];
  addedElementIds?: string[];
  removedElementIds?: string[];
}

export function toFlowNodes({
  architecture,
  view,
  layout,
  selectedElementIds = [],
  focusedElementIds = [],
  addedElementIds = [],
  removedElementIds = [],
}: ToFlowNodesOptions): ArchitectureFlowNode[] {
  const visibleElementIds = new Set(view.elementIds);
  const selectedIds = new Set(selectedElementIds);
  const focusedIds = new Set(focusedElementIds);
  const hasFocus = focusedIds.size > 0;
  const addedIds = new Set(addedElementIds);
  const removedIds = new Set(removedElementIds);
  const positions = new Map(layout.elements.map(({ elementId, x, y }) => [elementId, { x, y }] as const));

  return architecture.elements
    .filter((element) => visibleElementIds.has(element.id))
    .map((element) => {
      const connectedRelationIds = new Set(
        architecture.relations
          .filter(({ sourceId, targetId }) => sourceId === element.id || targetId === element.id)
          .map(({ id }) => id),
      );
      const findingCount = architecture.findings.filter(
        (finding) =>
          finding.status === 'open' &&
          (finding.elementIds?.includes(element.id) ||
            finding.relationIds?.some((relationId) => connectedRelationIds.has(relationId))),
      ).length;

      return {
        id: element.id,
        type: 'architecture',
        position: positions.get(element.id) ?? { x: 0, y: 0 },
        selected: selectedIds.has(element.id),
        draggable: false,
        style: { opacity: hasFocus && !focusedIds.has(element.id) ? 0.32 : 1 },
        data: {
          label: element.name,
          kind: element.kind,
          area: element.area,
          owner: element.owner,
          deploymentUnit: element.deploymentUnit,
          findingCount,
          changeStatus: addedIds.has(element.id) ? 'added' : removedIds.has(element.id) ? 'removed' : undefined,
        },
      };
    });
}
