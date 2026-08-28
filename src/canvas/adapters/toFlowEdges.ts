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
  focusedRelationIds?: string[];
  addedRelationIds?: string[];
}

export function toFlowEdges({
  architecture,
  view,
  selectedRelationIds = [],
  focusedRelationIds = [],
  addedRelationIds = [],
}: ToFlowEdgesOptions): ArchitectureFlowEdge[] {
  const visibleElementIds = new Set(view.elementIds);
  const visibleRelationIds = new Set(view.relationIds);
  const selectedIds = new Set(selectedRelationIds);
  const focusedIds = new Set(focusedRelationIds);
  const hasFocus = focusedIds.size > 0;
  const addedIds = new Set(addedRelationIds);

  return architecture.relations
    .filter(
      (relation) =>
        visibleRelationIds.has(relation.id) &&
        visibleElementIds.has(relation.sourceId) &&
        visibleElementIds.has(relation.targetId),
    )
    .map((relation) => {
      const color = relationColors[relation.type];
      const isSelected = selectedIds.has(relation.id);
      const isFocused = !hasFocus || focusedIds.has(relation.id);
      const isSharedState = relation.type === "shares-state";
      const isAdded = addedIds.has(relation.id);

      return {
        id: relation.id,
        source: relation.sourceId,
        target: relation.targetId,
        type: "smoothstep",
        label: formatRelationLabel(relation.type, relation.protocol),
        selected: isSelected,
        data: {
          relationType: relation.type,
          protocol: relation.protocol,
          description: relation.description,
          changeStatus: isAdded ? "added" : undefined,
        },
        style: {
          stroke: isAdded ? "#4f46e5" : color,
          strokeWidth: isSelected ? 3 : isSharedState ? 2.4 : 1.5,
          strokeDasharray: isSharedState ? "7 4" : undefined,
          opacity: isFocused ? 1 : 0.18,
        },
        labelStyle: {
          fill: isSharedState ? "#b91c1c" : relation.protocol ? "#1d4ed8" : "#475569",
          fontSize: 11,
          fontWeight: isSharedState ? 700 : 600,
        },
        labelBgStyle: {
          fill: isSharedState ? "#fef2f2" : "#f7f8fa",
          fillOpacity: 0.96,
        },
        labelBgPadding: [5, 3],
        labelBgBorderRadius: 4,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isAdded ? "#4f46e5" : color,
          width: 16,
          height: 16,
        },
      };
    });
}
