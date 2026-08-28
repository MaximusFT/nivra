import type {
  ArchitectureConstraint,
  ArchitectureElement,
  ArchitectureFinding,
  ArchitectureModel,
  ArchitectureProposal,
  ArchitectureRelation,
  ConstraintRule,
} from "../architecture/model";

type JsonRecord = Record<string, unknown>;

const stableIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const severities = ["info", "warning", "error"] as const;
const elementKinds = [
  "system", "application", "microfrontend", "service", "module", "component", "api",
  "contract", "datastore", "queue", "state", "external-system", "infrastructure",
] as const;
const elementAreas = ["frontend", "backend", "data", "infrastructure", "external"] as const;
const elementLevels = ["system", "hld", "lld"] as const;
const relationTypes = [
  "depends-on", "calls", "publishes", "subscribes", "reads", "writes", "shares-state", "hosts",
] as const;

function fail(message: string): never {
  throw new Error(`Invalid WebMCP input: ${message}`);
}

function record(value: unknown, path: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fail(`${path} must be an object.`);
  }
  return value as JsonRecord;
}

function onlyKeys(value: JsonRecord, allowed: string[], path: string): void {
  const unexpected = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unexpected.length > 0) fail(`${path} contains unsupported field '${unexpected[0]}'.`);
}

function text(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fail(`${path} must be a non-empty string.`);
  }
  return value;
}

function optionalText(value: unknown, path: string): string | undefined {
  return value === undefined ? undefined : text(value, path);
}

function stableId(value: unknown, path: string): string {
  const id = text(value, path);
  if (!stableIdPattern.test(id)) {
    fail(`${path} must use lowercase kebab-case.`);
  }
  return id;
}

function stringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) return fail(`${path} must be an array.`);
  return value.map((item, index) => text(item, `${path}[${index}]`));
}

function optionalStringArray(value: unknown, path: string): string[] | undefined {
  return value === undefined ? undefined : stringArray(value, path);
}

function enumValue<const TValues extends readonly string[]>(
  value: unknown,
  values: TValues,
  path: string,
): TValues[number] {
  if (typeof value !== "string" || !values.includes(value)) {
    return fail(`${path} must be one of: ${values.join(", ")}.`);
  }
  return value as TValues[number];
}

function unique(values: string[], path: string): void {
  if (new Set(values).size !== values.length) fail(`${path} must not contain duplicate IDs.`);
}

function assertReferences(ids: string[], available: Set<string>, path: string): void {
  const missing = ids.find((id) => !available.has(id));
  if (missing) fail(`${path} references unknown ID '${missing}'.`);
}

export function parseFindingInput(
  input: unknown,
  architecture: ArchitectureModel,
): ArchitectureFinding {
  const value = record(input, "finding");
  onlyKeys(value, ["id", "title", "description", "severity", "elementIds", "relationIds"], "finding");
  const elementIds = optionalStringArray(value.elementIds, "finding.elementIds");
  const relationIds = optionalStringArray(value.relationIds, "finding.relationIds");
  if ((elementIds?.length ?? 0) + (relationIds?.length ?? 0) === 0) {
    fail("finding must reference at least one element or relation.");
  }
  if (elementIds) {
    unique(elementIds, "finding.elementIds");
    assertReferences(elementIds, new Set(architecture.elements.map(({ id }) => id)), "finding.elementIds");
  }
  if (relationIds) {
    unique(relationIds, "finding.relationIds");
    assertReferences(relationIds, new Set(architecture.relations.map(({ id }) => id)), "finding.relationIds");
  }

  return {
    id: stableId(value.id, "finding.id"),
    title: text(value.title, "finding.title"),
    description: text(value.description, "finding.description"),
    severity: enumValue(value.severity, severities, "finding.severity"),
    source: "agent",
    elementIds,
    relationIds,
    status: "open",
  };
}

function parseConstraintRule(input: unknown, architecture: ArchitectureModel): ConstraintRule {
  const value = record(input, "constraint.rule");
  const type = text(value.type, "constraint.rule.type");
  const elementIds = new Set(architecture.elements.map(({ id }) => id));

  if (type === "no-cycles") {
    onlyKeys(value, ["type"], "constraint.rule");
    return { type };
  }
  if (type === "independent-deployment") {
    onlyKeys(value, ["type", "elementId"], "constraint.rule");
    const elementId = text(value.elementId, "constraint.rule.elementId");
    assertReferences([elementId], elementIds, "constraint.rule");
    return { type, elementId };
  }
  if (type === "forbidden-dependency" || type === "allowed-protocol") {
    onlyKeys(
      value,
      type === "allowed-protocol" ? ["type", "sourceId", "targetId", "protocols"] : ["type", "sourceId", "targetId"],
      "constraint.rule",
    );
    const sourceId = text(value.sourceId, "constraint.rule.sourceId");
    const targetId = text(value.targetId, "constraint.rule.targetId");
    assertReferences([sourceId, targetId], elementIds, "constraint.rule");
    if (type === "allowed-protocol") {
      const protocols = stringArray(value.protocols, "constraint.rule.protocols");
      if (protocols.length === 0) fail("constraint.rule.protocols must not be empty.");
      unique(protocols.map((protocol) => protocol.toLowerCase()), "constraint.rule.protocols");
      return { type, sourceId, targetId, protocols };
    }
    return { type, sourceId, targetId };
  }

  return fail("constraint.rule.type is unsupported.");
}

export function parseConstraintInput(
  input: unknown,
  architecture: ArchitectureModel,
): ArchitectureConstraint {
  const value = record(input, "constraint");
  onlyKeys(value, ["id", "name", "description", "severity", "rule"], "constraint");
  return {
    id: stableId(value.id, "constraint.id"),
    name: text(value.name, "constraint.name"),
    description: text(value.description, "constraint.description"),
    severity: enumValue(value.severity, severities, "constraint.severity"),
    rule: parseConstraintRule(value.rule, architecture),
  };
}

function parseElement(input: unknown, path: string): ArchitectureElement {
  const value = record(input, path);
  onlyKeys(value, ["id", "name", "kind", "area", "level", "parentId", "description", "technology", "owner", "deploymentUnit", "metadata"], path);
  const metadata = value.metadata === undefined ? undefined : record(value.metadata, `${path}.metadata`);
  return {
    id: stableId(value.id, `${path}.id`),
    name: text(value.name, `${path}.name`),
    kind: enumValue(value.kind, elementKinds, `${path}.kind`),
    area: enumValue(value.area, elementAreas, `${path}.area`),
    level: enumValue(value.level, elementLevels, `${path}.level`),
    parentId: optionalText(value.parentId, `${path}.parentId`),
    description: optionalText(value.description, `${path}.description`),
    technology: optionalText(value.technology, `${path}.technology`),
    owner: optionalText(value.owner, `${path}.owner`),
    deploymentUnit: optionalText(value.deploymentUnit, `${path}.deploymentUnit`),
    metadata,
  };
}

function parseRelation(input: unknown, path: string): ArchitectureRelation {
  const value = record(input, path);
  onlyKeys(value, ["id", "sourceId", "targetId", "type", "protocol", "description", "contractId", "metadata"], path);
  const metadata = value.metadata === undefined ? undefined : record(value.metadata, `${path}.metadata`);
  return {
    id: stableId(value.id, `${path}.id`),
    sourceId: text(value.sourceId, `${path}.sourceId`),
    targetId: text(value.targetId, `${path}.targetId`),
    type: enumValue(value.type, relationTypes, `${path}.type`),
    protocol: optionalText(value.protocol, `${path}.protocol`),
    description: optionalText(value.description, `${path}.description`),
    contractId: optionalText(value.contractId, `${path}.contractId`),
    metadata,
  };
}

function parseElementUpdate(input: unknown, path: string): ArchitectureProposal["changes"]["updateElements"][number] {
  const value = record(input, path);
  onlyKeys(value, ["id", "changes"], path);
  const changes = record(value.changes, `${path}.changes`);
  onlyKeys(changes, ["name", "kind", "area", "level", "parentId", "description", "technology", "owner", "deploymentUnit", "metadata"], `${path}.changes`);
  if (Object.keys(changes).length === 0) fail(`${path}.changes must not be empty.`);
  const parsed: Partial<ArchitectureElement> = {};
  if ("name" in changes) parsed.name = text(changes.name, `${path}.changes.name`);
  if ("kind" in changes) parsed.kind = enumValue(changes.kind, elementKinds, `${path}.changes.kind`);
  if ("area" in changes) parsed.area = enumValue(changes.area, elementAreas, `${path}.changes.area`);
  if ("level" in changes) parsed.level = enumValue(changes.level, elementLevels, `${path}.changes.level`);
  if ("parentId" in changes) parsed.parentId = text(changes.parentId, `${path}.changes.parentId`);
  if ("description" in changes) parsed.description = text(changes.description, `${path}.changes.description`);
  if ("technology" in changes) parsed.technology = text(changes.technology, `${path}.changes.technology`);
  if ("owner" in changes) parsed.owner = text(changes.owner, `${path}.changes.owner`);
  if ("deploymentUnit" in changes) parsed.deploymentUnit = text(changes.deploymentUnit, `${path}.changes.deploymentUnit`);
  if ("metadata" in changes) parsed.metadata = record(changes.metadata, `${path}.changes.metadata`);
  return { id: text(value.id, `${path}.id`), changes: parsed };
}

function parseRelationUpdate(input: unknown, path: string): ArchitectureProposal["changes"]["updateRelations"][number] {
  const value = record(input, path);
  onlyKeys(value, ["id", "changes"], path);
  const changes = record(value.changes, `${path}.changes`);
  onlyKeys(changes, ["sourceId", "targetId", "type", "protocol", "description", "contractId", "metadata"], `${path}.changes`);
  if (Object.keys(changes).length === 0) fail(`${path}.changes must not be empty.`);
  const parsed: Partial<ArchitectureRelation> = {};
  if ("sourceId" in changes) parsed.sourceId = text(changes.sourceId, `${path}.changes.sourceId`);
  if ("targetId" in changes) parsed.targetId = text(changes.targetId, `${path}.changes.targetId`);
  if ("type" in changes) parsed.type = enumValue(changes.type, relationTypes, `${path}.changes.type`);
  if ("protocol" in changes) parsed.protocol = text(changes.protocol, `${path}.changes.protocol`);
  if ("description" in changes) parsed.description = text(changes.description, `${path}.changes.description`);
  if ("contractId" in changes) parsed.contractId = text(changes.contractId, `${path}.changes.contractId`);
  if ("metadata" in changes) parsed.metadata = record(changes.metadata, `${path}.changes.metadata`);
  return { id: text(value.id, `${path}.id`), changes: parsed };
}

function mappedArray<T>(value: unknown, path: string, parser: (item: unknown, path: string) => T): T[] {
  if (!Array.isArray(value)) return fail(`${path} must be an array.`);
  return value.map((item, index) => parser(item, `${path}[${index}]`));
}

export function parseProposalInput(
  input: unknown,
  architecture: ArchitectureModel,
): ArchitectureProposal {
  const value = record(input, "proposal");
  onlyKeys(value, ["id", "name", "description", "baseVersion", "changes"], "proposal");
  const changesValue = record(value.changes, "proposal.changes");
  onlyKeys(changesValue, ["addElements", "updateElements", "removeElementIds", "addRelations", "updateRelations", "removeRelationIds"], "proposal.changes");
  if (typeof value.baseVersion !== "number" || !Number.isFinite(value.baseVersion)) {
    fail("proposal.baseVersion must be a finite number.");
  }
  if (value.baseVersion !== architecture.version) {
    fail(`proposal.baseVersion must equal current architecture version ${architecture.version}.`);
  }

  const addElements = mappedArray(changesValue.addElements, "proposal.changes.addElements", parseElement);
  const updateElements = mappedArray(changesValue.updateElements, "proposal.changes.updateElements", parseElementUpdate);
  const removeElementIds = stringArray(changesValue.removeElementIds, "proposal.changes.removeElementIds");
  const addRelations = mappedArray(changesValue.addRelations, "proposal.changes.addRelations", parseRelation);
  const updateRelations = mappedArray(changesValue.updateRelations, "proposal.changes.updateRelations", parseRelationUpdate);
  const removeRelationIds = stringArray(changesValue.removeRelationIds, "proposal.changes.removeRelationIds");
  const currentElementIds = new Set(architecture.elements.map(({ id }) => id));
  const currentRelationIds = new Set(architecture.relations.map(({ id }) => id));

  unique(addElements.map(({ id }) => id), "proposal.changes.addElements");
  unique(updateElements.map(({ id }) => id), "proposal.changes.updateElements");
  unique(removeElementIds, "proposal.changes.removeElementIds");
  unique(addRelations.map(({ id }) => id), "proposal.changes.addRelations");
  unique(updateRelations.map(({ id }) => id), "proposal.changes.updateRelations");
  unique(removeRelationIds, "proposal.changes.removeRelationIds");
  assertReferences(updateElements.map(({ id }) => id), currentElementIds, "proposal.changes.updateElements");
  assertReferences(removeElementIds, currentElementIds, "proposal.changes.removeElementIds");
  assertReferences(updateRelations.map(({ id }) => id), currentRelationIds, "proposal.changes.updateRelations");
  assertReferences(removeRelationIds, currentRelationIds, "proposal.changes.removeRelationIds");

  const conflictingElement = addElements.find(({ id }) => currentElementIds.has(id));
  if (conflictingElement) fail(`added element ID '${conflictingElement.id}' already exists.`);
  const conflictingRelation = addRelations.find(({ id }) => currentRelationIds.has(id));
  if (conflictingRelation) fail(`added relation ID '${conflictingRelation.id}' already exists.`);

  const effectiveElementIds = new Set([
    ...architecture.elements.map(({ id }) => id).filter((id) => !removeElementIds.includes(id)),
    ...addElements.map(({ id }) => id),
  ]);
  for (const element of addElements) {
    if (element.parentId) assertReferences([element.parentId], effectiveElementIds, `element '${element.id}'`);
  }
  for (const update of updateElements) {
    if (update.changes.parentId) assertReferences([update.changes.parentId], effectiveElementIds, `element '${update.id}'`);
  }
  for (const relation of addRelations) {
    assertReferences([relation.sourceId, relation.targetId], effectiveElementIds, `relation '${relation.id}'`);
  }
  for (const update of updateRelations) {
    const current = architecture.relations.find(({ id }) => id === update.id);
    if (!current) continue;
    assertReferences(
      [update.changes.sourceId ?? current.sourceId, update.changes.targetId ?? current.targetId],
      effectiveElementIds,
      `relation '${update.id}'`,
    );
  }

  return {
    id: stableId(value.id, "proposal.id"),
    name: text(value.name, "proposal.name"),
    description: optionalText(value.description, "proposal.description"),
    baseVersion: value.baseVersion,
    changes: { addElements, updateElements, removeElementIds, addRelations, updateRelations, removeRelationIds },
    createdBy: "agent",
  };
}

export function parseValidationMode(input: unknown): "current" | "proposal" | undefined {
  const value = record(input, "validation");
  onlyKeys(value, ["mode"], "validation");
  return value.mode === undefined
    ? undefined
    : enumValue(value.mode, ["current", "proposal"] as const, "validation.mode");
}
