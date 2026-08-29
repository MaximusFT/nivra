import type {
  ArchitectureConstraint,
  ArchitectureFinding,
  ArchitectureProposal,
} from "../architecture/model";
import type { WorkspaceMode } from "./actions";

export const WORKSPACE_STORAGE_KEY = "nivra.workspace.v1";
export const WORKSPACE_PERSISTENCE_VERSION = 1;

export interface PersistedWorkspace {
  version: typeof WORKSPACE_PERSISTENCE_VERSION;
  constraints: ArchitectureConstraint[];
  findings: ArchitectureFinding[];
  proposals: ArchitectureProposal[];
  activeProposalId?: string;
  savedBranchProposalIds?: string[];
  activeMode: WorkspaceMode;
}

export interface PersistableWorkspaceState {
  architecture: {
    constraints: ArchitectureConstraint[];
    findings: ArchitectureFinding[];
    proposals: ArchitectureProposal[];
  };
  activeProposalId?: string;
  savedBranchProposalIds?: string[];
  activeMode: WorkspaceMode;
}

function defaultStorage(): Storage | undefined {
  return typeof localStorage === "undefined" ? undefined : localStorage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isIdentifiedArray(value: unknown): value is Array<{ id: string }> {
  return Array.isArray(value) && value.every((item) => isRecord(item) && typeof item.id === "string");
}

export function createPersistedWorkspace(
  state: PersistableWorkspaceState,
): PersistedWorkspace {
  return {
    version: WORKSPACE_PERSISTENCE_VERSION,
    constraints: state.architecture.constraints,
    findings: state.architecture.findings,
    proposals: state.architecture.proposals,
    activeProposalId: state.activeProposalId,
    savedBranchProposalIds: state.savedBranchProposalIds ?? [],
    activeMode: state.activeMode,
  };
}

export function readWorkspacePersistence(
  storage: Storage | undefined = defaultStorage(),
): PersistedWorkspace | undefined {
  if (!storage) return undefined;

  try {
    const rawValue = storage.getItem(WORKSPACE_STORAGE_KEY);
    if (!rawValue) return undefined;
    const value: unknown = JSON.parse(rawValue);

    if (
      !isRecord(value) ||
      value.version !== WORKSPACE_PERSISTENCE_VERSION ||
      !isIdentifiedArray(value.constraints) ||
      !isIdentifiedArray(value.findings) ||
      !isIdentifiedArray(value.proposals) ||
      (value.activeMode !== "current" && value.activeMode !== "proposal") ||
      (value.activeProposalId !== undefined && typeof value.activeProposalId !== "string") ||
      (value.savedBranchProposalIds !== undefined &&
        (!Array.isArray(value.savedBranchProposalIds) ||
          !value.savedBranchProposalIds.every((item) => typeof item === "string")))
    ) {
      return undefined;
    }

    return value as unknown as PersistedWorkspace;
  } catch {
    return undefined;
  }
}

export function writeWorkspacePersistence(
  state: PersistableWorkspaceState,
  storage: Storage | undefined = defaultStorage(),
): void {
  if (!storage) return;
  const payload = createPersistedWorkspace(state);
  const isCanonical =
    payload.constraints.length === 0 &&
    payload.findings.length === 0 &&
    payload.proposals.length === 0 &&
    payload.activeMode === "current" &&
    payload.activeProposalId === undefined &&
    (payload.savedBranchProposalIds?.length ?? 0) === 0;

  if (isCanonical) {
    storage.removeItem(WORKSPACE_STORAGE_KEY);
    return;
  }

  storage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(payload));
}

export function clearWorkspacePersistence(
  storage: Storage | undefined = defaultStorage(),
): void {
  storage?.removeItem(WORKSPACE_STORAGE_KEY);
}
