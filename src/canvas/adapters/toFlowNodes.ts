import type { ArchitectureModel, ArchitectureView } from "../../architecture/model";
import type { ViewLayout } from "../../fixtures/commerce/layout";
import type { ArchitectureFlowNode } from "./types";

export interface ToFlowNodesOptions {
  architecture: ArchitectureModel;
  view: ArchitectureView;
  layout: ViewLayout;
  selectedElementIds?: string[];
}

export function toFlowNodes({
  architecture,
  view,
  layout,
  selectedElementIds = [],
}: ToFlowNodesOptions): ArchitectureFlowNode[] {
  const visibleElementIds = new Set(view.elementIds);
  const selectedIds = new Set(selectedElementIds);
  const positions = new Map(
    layout.elements.map(({ elementId, x, y }) => [elementId, { x, y }] as const),
  );

  return architecture.elements
    .filter((element) => visibleElementIds.has(element.id))
    .map((element) => ({
      id: element.id,
      type: "architecture",
      position: positions.get(element.id) ?? { x: 0, y: 0 },
      selected: selectedIds.has(element.id),
      draggable: false,
      data: {
        label: element.name,
        kind: element.kind,
        area: element.area,
        owner: element.owner,
        deploymentUnit: element.deploymentUnit,
      },
    }));
}
