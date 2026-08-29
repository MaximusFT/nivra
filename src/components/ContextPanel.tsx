import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Box, Plus, Search, ShieldCheck } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { getElementById, inspectElement } from "../architecture/queries";
import type { ArchitectureFinding, ArchitectureModel, ArchitectureRelation } from "../architecture/model";
import { useWorkspaceStore } from "../workspace/store";
import { getEffectiveWorkspaceArchitecture } from "../workspace/selectors";
import { PolicyPanel } from "./PolicyPanel";

function relationFinding(relation: ArchitectureRelation): ArchitectureFinding {
  const isRuntimeCoupling = relation.type === "shares-state";

  return {
    id: `finding-${relation.id}`,
    title: isRuntimeCoupling ? "Checkout isolation risk" : `Review ${relation.type.replaceAll("-", " ")}`,
    description: isRuntimeCoupling
      ? "Checkout is deployed separately but still depends on Product runtime state."
      : relation.description ?? "This architecture relation should be reviewed.",
    severity: isRuntimeCoupling ? "warning" : "info",
    source: "human",
    elementIds: [relation.sourceId, relation.targetId],
    relationIds: [relation.id],
    status: "open",
  };
}

function RelationListItem({
  relation,
  direction,
  architecture,
}: {
  relation: ArchitectureRelation;
  direction: "incoming" | "outgoing";
  architecture: ArchitectureModel;
}) {
  const peerId = direction === "incoming" ? relation.sourceId : relation.targetId;
  const peer = getElementById(architecture, peerId);
  const Icon = direction === "incoming" ? ArrowDownLeft : ArrowUpRight;

  return (
    <li className="flex items-start gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
      <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" size={13} />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-700">{peer?.name ?? peerId}</p>
        <p className="text-[10px] uppercase tracking-wide text-slate-400">
          {relation.protocol ?? relation.type.replaceAll("-", " ")}
        </p>
      </div>
    </li>
  );
}

export function ContextPanel() {
  const [activeTab, setActiveTab] = useState<"inspect" | "policy">("inspect");
  const {
    architecture,
    selectedElementIds,
    selectedRelationIds,
    activeMode,
    activeProposalId,
    addFinding,
    focusFinding,
  } = useWorkspaceStore(
    useShallow((state) => ({
      architecture: state.architecture,
      selectedElementIds: state.selectedElementIds,
      selectedRelationIds: state.selectedRelationIds,
      activeMode: state.activeMode,
      activeProposalId: state.activeProposalId,
      addFinding: state.addFinding,
      focusFinding: state.focusFinding,
    })),
  );

  const effectiveArchitecture = useMemo(
    () => getEffectiveWorkspaceArchitecture({ architecture, activeMode, activeProposalId }),
    [activeMode, activeProposalId, architecture],
  );

  const selectedElementId = selectedElementIds[0];
  const selectedRelationId = selectedRelationIds[0];
  const inspection = selectedElementId
    ? inspectElement(effectiveArchitecture, selectedElementId)
    : undefined;
  const relation = selectedRelationId
    ? effectiveArchitecture.relations.find(({ id }) => id === selectedRelationId)
    : undefined;
  const relationSource = relation ? getElementById(effectiveArchitecture, relation.sourceId) : undefined;
  const relationTarget = relation ? getElementById(effectiveArchitecture, relation.targetId) : undefined;
  const findingId = relation ? `finding-${relation.id}` : undefined;
  const relationAlreadyAnnotated = findingId
    ? effectiveArchitecture.findings.some(({ id }) => id === findingId)
    : false;

  return (
    <aside className="flex w-[336px] shrink-0 flex-col border-l border-slate-200 bg-white shadow-[-8px_0_24px_rgba(15,23,42,0.025)]">
      <div className="grid grid-cols-2 gap-1 border-b border-slate-200 p-2">
        <button
          className={`flex items-center justify-center gap-2 rounded px-3 py-2 text-xs font-semibold transition-colors ${
            activeTab === "inspect" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-800"
          }`}
          onClick={() => setActiveTab("inspect")}
          type="button"
        >
          <Search aria-hidden="true" size={14} />
          Context
        </button>
        <button
          className={`flex items-center justify-center gap-2 rounded px-3 py-2 text-xs font-semibold transition-colors ${
            activeTab === "policy" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-800"
          }`}
          onClick={() => setActiveTab("policy")}
          type="button"
        >
          <ShieldCheck aria-hidden="true" size={14} />
          Policy
        </button>
      </div>

      {activeTab === "inspect" ? (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {inspection ? (
          <section>
            <div className="mb-4 flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                <Box aria-hidden="true" size={17} />
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900">{inspection.element.name}</h3>
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">
                  {inspection.element.kind.replaceAll("-", " ")}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <dt className="text-slate-400">Owner</dt>
                <dd className="mt-1 font-medium text-slate-700">{inspection.element.owner ?? "Unassigned"}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <dt className="text-slate-400">Deployment</dt>
                <dd className="mt-1 truncate font-medium text-slate-700">
                  {inspection.element.deploymentUnit ?? "Not specified"}
                </dd>
              </div>
            </dl>

            {inspection.element.description ? (
              <p className="mt-4 text-xs leading-5 text-slate-600">{inspection.element.description}</p>
            ) : null}

            <div className="mt-5">
              <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Dependencies
              </h4>
              <ul className="space-y-1.5">
                {inspection.incomingRelations.map((item) => (
                  <RelationListItem architecture={effectiveArchitecture} direction="incoming" key={item.id} relation={item} />
                ))}
                {inspection.outgoingRelations.map((item) => (
                  <RelationListItem architecture={effectiveArchitecture} direction="outgoing" key={item.id} relation={item} />
                ))}
                {inspection.incomingRelations.length + inspection.outgoingRelations.length === 0 ? (
                  <li className="text-xs text-slate-400">No direct relations.</li>
                ) : null}
              </ul>
            </div>
          </section>
        ) : relation ? (
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">Relation</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">
              {relationSource?.name ?? relation.sourceId}
            </h3>
            <p className="my-2 text-xs font-semibold text-slate-400">↓ {relation.protocol ?? relation.type.replaceAll("-", " ")}</p>
            <h3 className="text-base font-semibold text-slate-900">
              {relationTarget?.name ?? relation.targetId}
            </h3>
            {relation.description ? (
              <p className="mt-4 text-xs leading-5 text-slate-600">{relation.description}</p>
            ) : null}
            <button
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-default disabled:bg-slate-200 disabled:text-slate-500"
              disabled={relationAlreadyAnnotated}
              onClick={() => addFinding(relationFinding(relation))}
              type="button"
            >
              <Plus aria-hidden="true" size={14} />
              {relationAlreadyAnnotated ? "Finding added" : "Add finding"}
            </button>
          </section>
        ) : (
            <section className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center">
            <Search aria-hidden="true" className="mx-auto text-slate-300" size={22} />
            <h3 className="mt-3 text-sm font-medium text-slate-700">Inspect architecture</h3>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Select an element or relation to inspect its structured context.
            </p>
          </section>
        )}
          </div>

          <section className="max-h-[40%] overflow-y-auto border-t border-slate-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Findings</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            {effectiveArchitecture.findings.length}
          </span>
        </div>
        {effectiveArchitecture.findings.length === 0 ? (
          <p className="text-xs leading-5 text-slate-400">No findings yet. Inspect a relation to record an observation.</p>
        ) : (
          <ul className="space-y-2">
            {effectiveArchitecture.findings.map((finding) => (
              <li key={finding.id}>
                <button
                  className="w-full rounded-lg border border-amber-200 bg-amber-50 p-3 text-left transition-colors hover:border-amber-300"
                  onClick={() => focusFinding(finding.id)}
                  type="button"
                >
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700">
                    <AlertTriangle aria-hidden="true" size={12} />
                    {finding.source} finding
                  </span>
                  <strong className="mt-1.5 block text-xs text-slate-800">{finding.title}</strong>
                  <span className="mt-1 block text-[11px] leading-4 text-slate-600">{finding.description}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
          </section>
        </>
      ) : (
        <PolicyPanel />
      )}
    </aside>
  );
}
