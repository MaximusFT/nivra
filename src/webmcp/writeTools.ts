import type { ModelContextTool } from "@mcp-b/webmcp-types";

import { getProposalDiff } from "../architecture/proposals";
import { getEffectiveWorkspaceArchitecture } from "../workspace/selectors";
import { useWorkspaceStore } from "../workspace/store";
import { withAgentActivity } from "./activity";
import {
  parseConstraintInput,
  parseFindingInput,
  parseProposalInput,
  parseValidationMode,
} from "./inputValidation";

const severitySchema = { type: "string", enum: ["info", "warning", "error"] } as const;
const stringIdArraySchema = { type: "array", items: { type: "string" }, uniqueItems: true } as const;

const annotateArchitectureInputSchema = {
  type: "object",
  properties: {
    id: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", description: "Stable, idempotent kebab-case finding ID." },
    title: { type: "string", minLength: 1 },
    description: { type: "string", minLength: 1 },
    severity: severitySchema,
    elementIds: stringIdArraySchema,
    relationIds: stringIdArraySchema,
  },
  required: ["id", "title", "description", "severity"],
  additionalProperties: false,
} as const;

export const annotateArchitectureTool = {
  name: "annotate_architecture",
  title: "Annotate architecture",
  description:
    "Create or update an agent Finding with stable evidence IDs. Use this to make an observed architecture risk visible to the human.",
  inputSchema: annotateArchitectureInputSchema,
  annotations: { readOnlyHint: false },
  execute: (input) =>
    withAgentActivity("annotate_architecture", "Record architecture finding", () => {
      const state = useWorkspaceStore.getState();
      const effectiveArchitecture = getEffectiveWorkspaceArchitecture(state);
      const finding = parseFindingInput(input, effectiveArchitecture);
      state.addFinding(finding);
      useWorkspaceStore.getState().focusFinding(finding.id);
      return { finding };
    }),
} satisfies ModelContextTool<Record<string, unknown>>;

const constraintRuleSchema = {
  oneOf: [
    {
      type: "object",
      properties: { type: { const: "forbidden-dependency" }, sourceId: { type: "string" }, targetId: { type: "string" } },
      required: ["type", "sourceId", "targetId"],
      additionalProperties: false,
    },
    {
      type: "object",
      properties: { type: { const: "independent-deployment" }, elementId: { type: "string" } },
      required: ["type", "elementId"],
      additionalProperties: false,
    },
    {
      type: "object",
      properties: { type: { const: "no-cycles" } },
      required: ["type"],
      additionalProperties: false,
    },
    {
      type: "object",
      properties: {
        type: { const: "allowed-protocol" },
        sourceId: { type: "string" },
        targetId: { type: "string" },
        protocols: { type: "array", items: { type: "string" }, minItems: 1, uniqueItems: true },
      },
      required: ["type", "sourceId", "targetId", "protocols"],
      additionalProperties: false,
    },
  ],
} as const;

const addConstraintInputSchema = {
  type: "object",
  properties: {
    id: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", description: "Stable, idempotent kebab-case constraint ID." },
    name: { type: "string", minLength: 1 },
    description: { type: "string", minLength: 1 },
    severity: severitySchema,
    rule: constraintRuleSchema,
  },
  required: ["id", "name", "description", "severity", "rule"],
  additionalProperties: false,
} as const;

export const addConstraintTool = {
  name: "add_constraint",
  title: "Add architecture constraint",
  description:
    "Create or update an explicit deterministic architecture rule. Supported rules are forbidden dependency, independent deployment, no cycles, and allowed protocol.",
  inputSchema: addConstraintInputSchema,
  annotations: { readOnlyHint: false },
  execute: (input) =>
    withAgentActivity("add_constraint", "Record architecture constraint", () => {
      const state = useWorkspaceStore.getState();
      const constraint = parseConstraintInput(input, state.architecture);
      state.addConstraint(constraint);
      return { constraint };
    }),
} satisfies ModelContextTool<Record<string, unknown>>;

const elementSchema = {
  type: "object",
  properties: {
    id: { type: "string" }, name: { type: "string" },
    kind: { type: "string", enum: ["system", "application", "microfrontend", "service", "module", "component", "api", "contract", "datastore", "queue", "state", "external-system", "infrastructure"] },
    area: { type: "string", enum: ["frontend", "backend", "data", "infrastructure", "external"] },
    level: { type: "string", enum: ["system", "hld", "lld"] },
    parentId: { type: "string" }, description: { type: "string" }, technology: { type: "string" },
    owner: { type: "string" }, deploymentUnit: { type: "string" }, metadata: { type: "object" },
  },
  required: ["id", "name", "kind", "area", "level"],
  additionalProperties: false,
} as const;

const relationSchema = {
  type: "object",
  properties: {
    id: { type: "string" }, sourceId: { type: "string" }, targetId: { type: "string" },
    type: { type: "string", enum: ["depends-on", "calls", "publishes", "subscribes", "reads", "writes", "shares-state", "hosts"] },
    protocol: { type: "string" }, description: { type: "string" }, contractId: { type: "string" }, metadata: { type: "object" },
  },
  required: ["id", "sourceId", "targetId", "type"],
  additionalProperties: false,
} as const;

const updateSchema = {
  type: "object",
  properties: { id: { type: "string" }, changes: { type: "object", minProperties: 1 } },
  required: ["id", "changes"],
  additionalProperties: false,
} as const;

const createProposalInputSchema = {
  type: "object",
  properties: {
    id: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", description: "Stable, idempotent kebab-case proposal ID." },
    name: { type: "string", minLength: 1 },
    description: { type: "string" },
    baseVersion: { type: "number" },
    changes: {
      type: "object",
      properties: {
        addElements: { type: "array", items: elementSchema },
        updateElements: { type: "array", items: updateSchema },
        removeElementIds: stringIdArraySchema,
        addRelations: { type: "array", items: relationSchema },
        updateRelations: { type: "array", items: updateSchema },
        removeRelationIds: stringIdArraySchema,
      },
      required: ["addElements", "updateElements", "removeElementIds", "addRelations", "updateRelations", "removeRelationIds"],
      additionalProperties: false,
    },
  },
  required: ["id", "name", "baseVersion", "changes"],
  additionalProperties: false,
} as const;

export const createProposalTool = {
  name: "create_proposal",
  title: "Create architecture proposal",
  description:
    "Create or update a patch-based alternative to Current Architecture. The proposal becomes active, while Current elements and relations remain untouched.",
  inputSchema: createProposalInputSchema,
  annotations: { readOnlyHint: false },
  execute: (input) =>
    withAgentActivity("create_proposal", "Create architecture alternative", () => {
      const state = useWorkspaceStore.getState();
      const proposal = parseProposalInput(input, state.architecture);
      state.createProposal(proposal);
      return { proposal, diff: getProposalDiff(proposal), activeMode: "proposal" as const };
    }),
} satisfies ModelContextTool<Record<string, unknown>>;

const validateArchitectureInputSchema = {
  type: "object",
  properties: {
    mode: { type: "string", enum: ["current", "proposal"], description: "Architecture mode to validate. Defaults to the visible active mode." },
  },
  additionalProperties: false,
} as const;

export const validateArchitectureTool = {
  name: "validate_architecture",
  title: "Validate architecture",
  description:
    "Run Nivra's deterministic constraint engine against Current or the active Proposal and show the result in the shared workspace.",
  inputSchema: validateArchitectureInputSchema,
  annotations: { readOnlyHint: false },
  execute: (input) =>
    withAgentActivity("validate_architecture", "Run deterministic validation", () => {
      const requestedMode = parseValidationMode(input);
      const state = useWorkspaceStore.getState();
      if (requestedMode === "proposal" && !state.activeProposalId) {
        throw new Error("Cannot validate proposal mode because no active proposal exists.");
      }
      if (requestedMode) state.setActiveMode(requestedMode);
      useWorkspaceStore.getState().validateActive();
      const resultState = useWorkspaceStore.getState();
      if (!resultState.validationResult) throw new Error("Architecture validation did not produce a result.");
      return { mode: resultState.activeMode, validation: resultState.validationResult };
    }),
} satisfies ModelContextTool<Record<string, unknown>>;
