import { getViewById } from "../architecture/queries";
import { applyProposal } from "../architecture/proposals";
import type { ArchitectureModel } from "../architecture/model";
import type { WorkspaceStore } from "./store";

export const selectActiveView = (state: WorkspaceStore) =>
  getViewById(state.architecture, state.activeViewId);

export const selectArchitectureSummary = (state: WorkspaceStore) => ({
  name: state.architecture.name,
  version: state.architecture.version,
  elementCount: state.architecture.elements.length,
  relationCount: state.architecture.relations.length,
});

export interface EffectiveArchitectureInput {
  architecture: ArchitectureModel;
  activeMode: WorkspaceStore["activeMode"];
  activeProposalId?: string;
}

export function getEffectiveWorkspaceArchitecture({
  architecture,
  activeMode,
  activeProposalId,
}: EffectiveArchitectureInput): ArchitectureModel {
  if (activeMode !== "proposal" || !activeProposalId) return architecture;
  const proposal = architecture.proposals.find(({ id }) => id === activeProposalId);
  return proposal ? applyProposal(architecture, proposal) : architecture;
}
