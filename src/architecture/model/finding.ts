import type { ArchitectureSeverity } from "./constraint";

export type ArchitectureFindingSource = "agent" | "validator" | "human";
export type ArchitectureFindingStatus = "open" | "resolved" | "ignored";

export interface ArchitectureFinding {
  id: string;
  title: string;
  description: string;
  severity: ArchitectureSeverity;
  source: ArchitectureFindingSource;
  elementIds?: string[];
  relationIds?: string[];
  status: ArchitectureFindingStatus;
}
