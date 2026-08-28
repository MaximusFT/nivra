import { MarkerType } from "@xyflow/react";

import type { ArchitectureModel, ArchitectureRelationType, ArchitectureView } from "../../architecture/model";
import type { ArchitectureFlowEdge } from "./types";

const relationColors: Record<ArchitectureRelationType, string> = {
  "depends-on": "#64748b",
  calls: "#2563eb",
  publishes: "#7c3aed",
  subscribes: "#7c3aed",
  reads: "#0891b2",
  writes: "#d97706",
  "shares-state": "#dc2626",
  hosts: "#475569",
};

function formatRelationLabel(type: ArchitectureRelationType, protocol?: string): string {
  if (protocol) {
    return protocol;
  }

  return type.replaceAll("-", " ");
}

export interface ToFlowEdgesOptions {
  architecture: ArchitectureModel;
  view: ArchitectureView;
  selectedRelationIds?: string[];
}

export function toFlowEdges({
  architecture,
  view,
  selectedRelationIds = [],
}: ToFlowEdgesOptions): ArchitectureFlowEdge[] {
  const visibleElementIds = new Set(view.elementIds);
  const visibleRelationIds = new Set(view.relationIds);
  const selectedIds = new Set(selectedRelationIds);

  return architecture.relations
    .filter(
      (relation) =>
        visibleRelationIds.has(relation.id) &&
        visibleElementIds.has(relation.sourceId) &&
        visibleElementIds.has(relation.targetId),
    )
    .map((relation) => {
      const color = relationColors[relation.type];

      return {
        id: relation.id,
        source: relation.sourceId,
        target: relation.targetId,
        type: "smoothstep",
        label: formatRelationLabel(relation.type, relation.protocol),
        selected: selectedIds.has(relation.id),
        data: {
          relationType: relation.type,
          protocol: relation.protocol,
          description: relation.description,
        },
        style: { stroke: color, strokeWidth: 1.5 },
        labelStyle: { fill: "#475569", fontSize: 11, fontWeight: 600 },
        labelBgStyle: { fill: "#f7f8fa", fillOpacity: 0.94 },
        labelBgPadding: [5, 3],
        labelBgBorderRadius: 4,
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
      };
    });
}
