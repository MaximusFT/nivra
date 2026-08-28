import { create } from "zustand";

import type { ArchitectureModel } from "../architecture/model";
import { validateArchitecture, type ValidationResult } from "../architecture/validation";
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
  validationResult?: ValidationResult;
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
  setActiveView: (activeViewId) =>
    set({ activeViewId, selectedElementIds: [], selectedRelationIds: [] }),
  selectElements: (selectedElementIds) => set({ selectedElementIds: [...selectedElementIds] }),
  selectRelations: (selectedRelationIds) => set({ selectedRelationIds: [...selectedRelationIds] }),
  addFinding: (finding) =>
    set((state) => ({
      architecture: {
        ...state.architecture,
        findings: [
          ...state.architecture.findings.filter(({ id }) => id !== finding.id),
          finding,
        ],
      },
    })),
  focusFinding: (findingId) =>
    set((state) => {
      const finding = state.architecture.findings.find(({ id }) => id === findingId);
      if (!finding) return state;

      const elementIds = finding.elementIds ?? [];
      const relationIds = finding.relationIds ?? [];
      const hasEvidence = elementIds.length > 0 || relationIds.length > 0;
      const evidenceView = hasEvidence ? state.architecture.views.find(
        (view) =>
          elementIds.every((elementId) => view.elementIds.includes(elementId)) &&
          relationIds.every((relationId) => view.relationIds.includes(relationId)),
      ) : undefined;

      return {
        activeViewId: evidenceView?.id ?? state.activeViewId,
        selectedElementIds: [...elementIds],
        selectedRelationIds: [...relationIds],
      };
    }),
  addConstraint: (constraint) =>
    set((state) => ({
      architecture: {
        ...state.architecture,
        constraints: [
          ...state.architecture.constraints.filter(({ id }) => id !== constraint.id),
          constraint,
        ],
      },
      validationResult: undefined,
    })),
  validateCurrent: () =>
    set((state) => ({
      validationResult: validateArchitecture({ architecture: state.architecture }),
    })),
  focusValidationCheck: (constraintId) =>
    set((state) => {
      const check = state.validationResult?.checks.find(
        (candidate) => candidate.constraintId === constraintId,
      );
      if (!check) return state;

      const evidenceView = state.architecture.views.find((view) =>
        check.relationIds.length > 0
          ? check.relationIds.every((relationId) => view.relationIds.includes(relationId))
          : check.elementIds.every((elementId) => view.elementIds.includes(elementId)),
      );

      return {
        activeViewId: evidenceView?.id ?? state.activeViewId,
        selectedElementIds: [...check.elementIds],
        selectedRelationIds: [...check.relationIds],
      };
    }),
  resetWorkspace: () => set(createInitialState()),
}));
