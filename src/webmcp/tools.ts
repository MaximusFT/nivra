import type { ModelContextTool } from "@mcp-b/webmcp-types";

import { inspectElement } from "../architecture/queries";
import { getEffectiveWorkspaceArchitecture } from "../workspace/selectors";
import { useWorkspaceStore } from "../workspace/store";
import { withAgentActivity } from "./activity";

function getEffectiveState() {
  const state = useWorkspaceStore.getState();
  const architecture = getEffectiveWorkspaceArchitecture(state);
  return { state, architecture };
}

export const getArchitectureTool = {
  name: "get_architecture",
  title: "Get architecture",
  description:
    "Read Nivra's active structured architecture, including elements, relations, boundaries, constraints, findings, ownership, and deployment metadata. Visual layout is excluded.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true },
  execute: () =>
    withAgentActivity("get_architecture", "Read active architecture", () => {
      const { state, architecture } = getEffectiveState();
      return {
        mode: state.activeMode,
        activeProposalId: state.activeProposalId,
        activeViewId: state.activeViewId,
        architecture: {
          id: architecture.id,
          name: architecture.name,
          version: architecture.version,
          elements: architecture.elements,
          relations: architecture.relations,
          contracts: architecture.contracts,
          views: architecture.views,
          boundaries: architecture.boundaries,
          constraints: architecture.constraints,
          findings: architecture.findings,
        },
      };
    }),
} satisfies ModelContextTool<Record<string, never>>;

const inspectElementInputSchema = {
  type: "object",
  properties: {
    elementId: {
      type: "string",
      description: "Stable ID of the architecture element to inspect.",
    },
  },
  required: ["elementId"],
  additionalProperties: false,
} as const;

export const inspectElementTool = {
  name: "inspect_element",
  title: "Inspect architecture element",
  description:
    "Inspect one architecture element and return its children, incoming and outgoing relations, constraints, and findings.",
  inputSchema: inspectElementInputSchema,
  annotations: { readOnlyHint: true },
  execute: ({ elementId }) =>
    withAgentActivity("inspect_element", `Inspect ${elementId}`, () => {
      const { architecture } = getEffectiveState();
      const inspection = inspectElement(architecture, elementId);
      if (!inspection) throw new Error(`Architecture element '${elementId}' was not found.`);
      return inspection;
    }),
} satisfies ModelContextTool<{ elementId: string }>;

const showArchitectureViewInputSchema = {
  type: "object",
  properties: {
    viewId: {
      type: "string",
      description: "Stable ID of the architecture view to show.",
    },
    focusElementIds: {
      type: "array",
      items: { type: "string" },
      description: "Optional element IDs to focus after opening the view.",
    },
    focusRelationIds: {
      type: "array",
      items: { type: "string" },
      description: "Optional relation IDs to focus after opening the view.",
    },
  },
  required: ["viewId"],
  additionalProperties: false,
} as const;

interface ShowArchitectureViewInput extends Record<string, unknown> {
  viewId: string;
  focusElementIds?: string[];
  focusRelationIds?: string[];
}

export const showArchitectureViewTool = {
  name: "show_architecture_view",
  title: "Show architecture view",
  description:
    "Open an architecture view in the shared Nivra workspace and optionally focus elements or relations visible in that view.",
  inputSchema: showArchitectureViewInputSchema,
  annotations: { readOnlyHint: false },
  execute: ({ viewId, focusElementIds = [], focusRelationIds = [] }) =>
    withAgentActivity("show_architecture_view", `Show ${viewId}`, () => {
      const { architecture } = getEffectiveState();
      const view = architecture.views.find(({ id }) => id === viewId);
      if (!view) throw new Error(`Architecture view '${viewId}' was not found.`);

      const invalidElementIds = focusElementIds.filter((id) => !view.elementIds.includes(id));
      const invalidRelationIds = focusRelationIds.filter((id) => !view.relationIds.includes(id));
      if (invalidElementIds.length > 0 || invalidRelationIds.length > 0) {
        throw new Error("Focus IDs must be visible in the requested architecture view.");
      }

      const actions = useWorkspaceStore.getState();
      actions.setActiveView(viewId);
      actions.selectElements(focusElementIds);
      actions.selectRelations(focusRelationIds);

      return {
        view,
        focusedElementIds: focusElementIds,
        focusedRelationIds: focusRelationIds,
      };
    }),
} satisfies ModelContextTool<ShowArchitectureViewInput>;
