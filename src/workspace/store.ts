import { create } from 'zustand';

import type { ArchitectureModel } from '../architecture/model';
import { applyProposal } from '../architecture/proposals';
import { validateArchitecture, type ValidationResult } from '../architecture/validation';
import { commerceArchitecture } from '../fixtures/commerce/architecture';
import { COMMERCE_HLD_VIEW_ID } from '../shared/ids';
import type { AgentActivityEntry, WebMcpStatus, WorkspaceActions, WorkspaceMode } from './actions';
import { clearWorkspacePersistence, readWorkspacePersistence, writeWorkspacePersistence } from './persistence';

export interface WorkspaceState {
  architecture: ArchitectureModel;
  activeViewId: string;
  activeMode: WorkspaceMode;
  activeProposalId?: string;
  savedBranchProposalIds: string[];
  selectedElementIds: string[];
  selectedRelationIds: string[];
  validationResult?: ValidationResult;
  agentActivity: AgentActivityEntry[];
  webMcpStatus: WebMcpStatus;
}

export type WorkspaceStore = WorkspaceState & WorkspaceActions;

function createInitialState(): WorkspaceState {
  const persisted = readWorkspacePersistence();
  const proposals = persisted?.proposals ?? [];
  const activeProposalId = proposals.some(({ id }) => id === persisted?.activeProposalId)
    ? persisted?.activeProposalId
    : undefined;
  const activeMode = persisted?.activeMode === 'proposal' && activeProposalId ? 'proposal' : 'current';

  return {
    architecture: {
      ...commerceArchitecture,
      constraints: persisted?.constraints ?? [],
      findings: persisted?.findings ?? [],
      proposals,
    },
    activeViewId: activeMode === 'proposal' ? 'checkout-lld' : COMMERCE_HLD_VIEW_ID,
    activeMode,
    activeProposalId,
    savedBranchProposalIds: persisted?.savedBranchProposalIds?.filter((proposalId) =>
      proposals.some(({ id }) => id === proposalId),
    ) ?? [],
    selectedElementIds: [],
    selectedRelationIds: [],
    validationResult: undefined,
    agentActivity: [],
    webMcpStatus: 'checking',
  };
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  ...createInitialState(),
  setWebMcpStatus: (webMcpStatus) => set({ webMcpStatus }),
  upsertAgentActivity: (entry) =>
    set((state) => ({
      agentActivity: [...state.agentActivity.filter(({ id }) => id !== entry.id), entry].slice(-50),
    })),
  setActiveView: (activeViewId) => set({ activeViewId, selectedElementIds: [], selectedRelationIds: [] }),
  setActiveMode: (activeMode) =>
    set((state) => {
      if (activeMode === 'proposal' && !state.activeProposalId) return state;
      return {
        activeMode,
        validationResult: undefined,
      };
    }),
  selectElements: (selectedElementIds) => set({ selectedElementIds: [...selectedElementIds] }),
  selectRelations: (selectedRelationIds) => set({ selectedRelationIds: [...selectedRelationIds] }),
  addFinding: (finding) =>
    set((state) => ({
      architecture: {
        ...state.architecture,
        findings: [...state.architecture.findings.filter(({ id }) => id !== finding.id), finding],
      },
    })),
  focusFinding: (findingId) =>
    set((state) => {
      const finding = state.architecture.findings.find(({ id }) => id === findingId);
      if (!finding) return state;

      const elementIds = finding.elementIds ?? [];
      const relationIds = finding.relationIds ?? [];
      const hasEvidence = elementIds.length > 0 || relationIds.length > 0;
      const evidenceView = hasEvidence
        ? state.architecture.views.find(
            (view) =>
              elementIds.every((elementId) => view.elementIds.includes(elementId)) &&
              relationIds.every((relationId) => view.relationIds.includes(relationId)),
          )
        : undefined;

      return {
        activeViewId: evidenceView?.id ?? state.activeViewId,
        selectedElementIds: relationIds.length > 0 ? [] : [...elementIds],
        selectedRelationIds: [...relationIds],
      };
    }),
  addConstraint: (constraint) =>
    set((state) => ({
      architecture: {
        ...state.architecture,
        constraints: [...state.architecture.constraints.filter(({ id }) => id !== constraint.id), constraint],
      },
      validationResult: undefined,
    })),
  validateCurrent: () =>
    set((state) => ({
      validationResult: validateArchitecture({ architecture: state.architecture }),
    })),
  createProposal: (proposal) =>
    set((state) => ({
      architecture: {
        ...state.architecture,
        proposals: [...state.architecture.proposals.filter(({ id }) => id !== proposal.id), proposal],
      },
      activeMode: 'proposal',
      activeProposalId: proposal.id,
      activeViewId: proposal.id === 'checkout-isolation' ? 'checkout-lld' : state.activeViewId,
      selectedElementIds: state.selectedElementIds,
      selectedRelationIds: state.selectedRelationIds.length > 0 ? state.selectedRelationIds : (proposal.changes.removeRelationIds.length > 0 ? [...proposal.changes.removeRelationIds] : []),
      validationResult: undefined,
    })),
  saveActiveProposalAsBranch: () =>
    set((state) => {
      if (!state.activeProposalId || !state.validationResult?.passed || state.activeMode !== "proposal") return state;
      return {
        savedBranchProposalIds: [...new Set([...state.savedBranchProposalIds, state.activeProposalId])],
      };
    }),
  switchArchitectureBranch: (branchId) =>
    set((state) => {
      if (branchId === "current/commerce-1.35") {
        return {
          activeMode: "current",
          selectedElementIds: [],
          selectedRelationIds: [],
          validationResult: undefined,
        };
      }
      if (!state.savedBranchProposalIds.includes(branchId)) return state;
      return {
        activeMode: "proposal",
        activeProposalId: branchId,
        activeViewId: branchId === "checkout-isolation" ? "checkout-lld" : state.activeViewId,
        selectedElementIds: [],
        selectedRelationIds: [],
        validationResult: undefined,
      };
    }),
  validateActive: () =>
    set((state) => {
      const proposal = state.activeProposalId
        ? state.architecture.proposals.find(({ id }) => id === state.activeProposalId)
        : undefined;
      const effectiveArchitecture =
        state.activeMode === 'proposal' && proposal ? applyProposal(state.architecture, proposal) : state.architecture;

      return {
        validationResult: validateArchitecture({ architecture: effectiveArchitecture }),
      };
    }),
  focusValidationCheck: (constraintId) =>
    set((state) => {
      const check = state.validationResult?.checks.find((candidate) => candidate.constraintId === constraintId);
      if (!check) return state;

      const evidenceView = state.architecture.views.find((view) =>
        check.relationIds.length > 0
          ? check.relationIds.every((relationId) => view.relationIds.includes(relationId))
          : check.elementIds.every((elementId) => view.elementIds.includes(elementId)),
      );

      return {
        activeViewId: evidenceView?.id ?? state.activeViewId,
        selectedElementIds: check.relationIds.length > 0 ? [] : [...check.elementIds],
        selectedRelationIds: [...check.relationIds],
      };
    }),
  resetWorkspace: () => {
    clearWorkspacePersistence();
    set((state) => ({
      architecture: commerceArchitecture,
      activeViewId: COMMERCE_HLD_VIEW_ID,
      activeMode: 'current',
      activeProposalId: undefined,
      savedBranchProposalIds: [],
      selectedElementIds: [],
      selectedRelationIds: [],
      validationResult: undefined,
      agentActivity: [],
      webMcpStatus: state.webMcpStatus,
    }));
  },
}));

useWorkspaceStore.subscribe((state) => {
  writeWorkspacePersistence(state);
});
