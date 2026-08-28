import { create } from "zustand";

import type { ArchitectureModel } from "../architecture/model";
import { commerceArchitecture } from "../fixtures/commerce/architecture";
import { COMMERCE_HLD_VIEW_ID } from "../shared/ids";
import type { AgentActivityEntry, WebMcpStatus, WorkspaceActions, WorkspaceMode } from "./actions";

export interface WorkspaceState {
  architecture: ArchitectureModel;
  activeViewId: string;
  activeMode: WorkspaceMode;
  activeProposalId?: string;
  selectedElementIds: string[];
  selectedRelationIds: string[];
  validationResult?: unknown;
  agentActivity: AgentActivityEntry[];
  webMcpStatus: WebMcpStatus;
}

export type WorkspaceStore = WorkspaceState & WorkspaceActions;

function createInitialState(): WorkspaceState {
  return {
    architecture: commerceArchitecture,
    activeViewId: COMMERCE_HLD_VIEW_ID,
    activeMode: "current",
    activeProposalId: undefined,
    selectedElementIds: [],
    selectedRelationIds: [],
    validationResult: undefined,
    agentActivity: [],
    webMcpStatus: "checking",
  };
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  ...createInitialState(),
  setActiveView: (activeViewId) => set({ activeViewId }),
  selectElements: (selectedElementIds) => set({ selectedElementIds: [...selectedElementIds] }),
  selectRelations: (selectedRelationIds) => set({ selectedRelationIds: [...selectedRelationIds] }),
  resetWorkspace: () => set(createInitialState()),
}));
