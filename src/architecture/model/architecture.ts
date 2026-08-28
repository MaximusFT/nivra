import type { ArchitectureBoundary } from "./boundary";
import type { ArchitectureConstraint } from "./constraint";
import type { ArchitectureContract } from "./contract";
import type { ArchitectureElement } from "./element";
import type { ArchitectureFinding } from "./finding";
import type { MigrationPlan } from "./migration";
import type { ArchitectureProposal } from "./proposal";
import type { ArchitectureRelation } from "./relation";
import type { ArchitectureView } from "./view";

export interface ArchitectureModel {
  id: string;
  name: string;
  version: number;
  elements: ArchitectureElement[];
  relations: ArchitectureRelation[];
  contracts: ArchitectureContract[];
  views: ArchitectureView[];
  boundaries: ArchitectureBoundary[];
  constraints: ArchitectureConstraint[];
  findings: ArchitectureFinding[];
  proposals: ArchitectureProposal[];
  migrationPlans: MigrationPlan[];
}
