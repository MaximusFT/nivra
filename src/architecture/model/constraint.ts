export type ArchitectureSeverity = "info" | "warning" | "error";

export type ConstraintRule =
  | { type: "forbidden-dependency"; sourceId: string; targetId: string }
  | { type: "independent-deployment"; elementId: string }
  | { type: "no-cycles" }
  | { type: "allowed-protocol"; sourceId: string; targetId: string; protocols: string[] };

export interface ArchitectureConstraint {
  id: string;
  name: string;
  description: string;
  severity: ArchitectureSeverity;
  rule: ConstraintRule;
}
