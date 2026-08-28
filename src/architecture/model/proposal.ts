import type { ArchitectureElement } from "./element";
import type { ArchitectureRelation } from "./relation";

export interface ProposalChanges {
  addElements: ArchitectureElement[];
  updateElements: Array<{ id: string; changes: Partial<ArchitectureElement> }>;
  removeElementIds: string[];
  addRelations: ArchitectureRelation[];
  updateRelations: Array<{ id: string; changes: Partial<ArchitectureRelation> }>;
  removeRelationIds: string[];
}

export interface ArchitectureProposal {
  id: string;
  name: string;
  description?: string;
  baseVersion: number;
  changes: ProposalChanges;
  createdBy: "agent" | "human";
}
