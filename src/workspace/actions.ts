import type { ArchitectureConstraint, ArchitectureFinding } from "../architecture/model";

export type WorkspaceMode = "current" | "proposal";
export type WebMcpStatus = "checking" | "ready" | "unavailable";

export interface AgentActivityEntry {
  id: string;
  timestamp: number;
  tool: string;
  description: string;
  status: "running" | "success" | "error";
}

export interface WorkspaceActions {
  setActiveView: (viewId: string) => void;
  selectElements: (elementIds: string[]) => void;
  selectRelations: (relationIds: string[]) => void;
  addFinding: (finding: ArchitectureFinding) => void;
  focusFinding: (findingId: string) => void;
  addConstraint: (constraint: ArchitectureConstraint) => void;
  validateCurrent: () => void;
  focusValidationCheck: (constraintId: string) => void;
  resetWorkspace: () => void;
}
