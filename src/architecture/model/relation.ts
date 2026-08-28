export type ArchitectureRelationType =
  | "depends-on"
  | "calls"
  | "publishes"
  | "subscribes"
  | "reads"
  | "writes"
  | "shares-state"
  | "hosts";

export interface ArchitectureRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: ArchitectureRelationType;
  protocol?: string;
  description?: string;
  contractId?: string;
  metadata?: Record<string, unknown>;
}
