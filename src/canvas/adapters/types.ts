import type { Edge, Node } from "@xyflow/react";

import type {
  ArchitectureArea,
  ArchitectureElementKind,
  ArchitectureRelationType,
} from "../../architecture/model";

export interface ArchitectureNodeData extends Record<string, unknown> {
  label: string;
  kind: ArchitectureElementKind;
  area: ArchitectureArea;
  owner?: string;
  deploymentUnit?: string;
}

export interface ArchitectureEdgeData extends Record<string, unknown> {
  relationType: ArchitectureRelationType;
  protocol?: string;
  description?: string;
}

export type ArchitectureFlowNode = Node<ArchitectureNodeData, "architecture">;
export type ArchitectureFlowEdge = Edge<ArchitectureEdgeData>;
