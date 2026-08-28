import { getViewById } from "../architecture/queries";
import type { WorkspaceStore } from "./store";

export const selectActiveView = (state: WorkspaceStore) =>
  getViewById(state.architecture, state.activeViewId);

export const selectArchitectureSummary = (state: WorkspaceStore) => ({
  name: state.architecture.name,
  version: state.architecture.version,
  elementCount: state.architecture.elements.length,
  relationCount: state.architecture.relations.length,
});
