import { useEffect, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { commerceLayouts } from "../fixtures/commerce/layout";
import { getProposalDiff } from "../architecture/proposals";
import { getEffectiveWorkspaceArchitecture } from "../workspace/selectors";
import { useWorkspaceStore } from "../workspace/store";
import { toFlowEdges, toFlowNodes } from "./adapters";
import { getFocusContext } from "./focus/getFocusContext";
import { ArchitectureNode } from "./nodes/ArchitectureNode";

const nodeTypes = { architecture: ArchitectureNode } satisfies NodeTypes;

function CanvasContent() {
  const { fitView } = useReactFlow();
  const {
    architecture,
    activeViewId,
    activeMode,
    activeProposalId,
    selectedElementIds,
    selectedRelationIds,
    selectElements,
    selectRelations,
  } = useWorkspaceStore(
    useShallow((state) => ({
      architecture: state.architecture,
      activeViewId: state.activeViewId,
      activeMode: state.activeMode,
      activeProposalId: state.activeProposalId,
      selectedElementIds: state.selectedElementIds,
      selectedRelationIds: state.selectedRelationIds,
      selectElements: state.selectElements,
      selectRelations: state.selectRelations,
    })),
  );

  const activeProposal = activeProposalId
    ? architecture.proposals.find(({ id }) => id === activeProposalId)
    : undefined;
  const effectiveArchitecture = useMemo(
    () => getEffectiveWorkspaceArchitecture({ architecture, activeMode, activeProposalId }),
    [activeMode, activeProposalId, architecture],
  );
  const proposalDiff = useMemo(
    () => (activeMode === "proposal" && activeProposal ? getProposalDiff(activeProposal) : undefined),
    [activeMode, activeProposal],
  );
  const view = effectiveArchitecture.views.find(({ id }) => id === activeViewId);
  const layout = commerceLayouts.find(({ viewId }) => viewId === activeViewId);
  const visibleRelations = view
    ? effectiveArchitecture.relations.filter(({ id }) => view.relationIds.includes(id))
    : [];
  const hasSharedState = visibleRelations.some(({ type }) => type === "shares-state");
  const hasSnapshot = visibleRelations.some(({ protocol }) => protocol?.toLowerCase() === "snapshot");

  const focus = useMemo(
    () =>
      view
        ? getFocusContext({
            architecture: effectiveArchitecture,
            view,
            selectedElementIds,
            selectedRelationIds,
          })
        : { elementIds: [], relationIds: [] },
    [effectiveArchitecture, selectedElementIds, selectedRelationIds, view],
  );

  const nodes = useMemo(
    () =>
      view && layout
        ? toFlowNodes({
            architecture: effectiveArchitecture,
            view,
            layout,
            selectedElementIds,
            focusedElementIds: focus.elementIds,
            addedElementIds: proposalDiff?.addedElements,
          })
        : [],
    [effectiveArchitecture, focus.elementIds, layout, proposalDiff?.addedElements, selectedElementIds, view],
  );

  const edges = useMemo(
    () =>
      view
        ? toFlowEdges({
            architecture: effectiveArchitecture,
            view,
            selectedRelationIds,
            focusedRelationIds: focus.relationIds,
            addedRelationIds: proposalDiff?.addedRelations,
          })
        : [],
    [effectiveArchitecture, focus.relationIds, proposalDiff?.addedRelations, selectedRelationIds, view],
  );

  useEffect(() => {
    void fitView({ padding: 0.16, maxZoom: 1, duration: 240 });
  }, [activeViewId, fitView]);

  if (!view || !layout) {
    return <div className="grid h-full place-items-center text-sm text-slate-500">View unavailable.</div>;
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.16, maxZoom: 1 }}
      minZoom={0.45}
      maxZoom={1.4}
      nodesConnectable={false}
      nodesDraggable={false}
      onNodeClick={(_, node) => {
        selectElements([node.id]);
        selectRelations([]);
      }}
      onEdgeClick={(_, edge) => {
        selectElements([]);
        selectRelations([edge.id]);
      }}
      onPaneClick={() => {
        selectElements([]);
        selectRelations([]);
      }}
    >
      <Background color="#94a3b8" gap={28} size={1} variant={BackgroundVariant.Dots} />
      <Controls
        className="!overflow-hidden !rounded-md !border !border-slate-200 !bg-white !shadow-sm"
        showInteractive={false}
      />
      {view.level === "lld" ? (
        <Panel position="top-left">
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white/95 p-1.5 text-[11px] shadow-sm backdrop-blur">
            {hasSharedState ? (
              <span className="rounded bg-red-50 px-2.5 py-1.5 font-semibold text-red-700">
                shares state · runtime coupling
              </span>
            ) : null}
            {hasSnapshot ? (
              <span className="rounded bg-indigo-50 px-2.5 py-1.5 font-semibold text-indigo-700">
                snapshot · Checkout contract
              </span>
            ) : null}
            <span className="rounded bg-blue-50 px-2.5 py-1.5 font-semibold text-blue-700">
              REST · explicit API
            </span>
          </div>
        </Panel>
      ) : null}
      <Panel position="bottom-right">
        <div className="flex items-center gap-4 rounded-md border border-slate-200 bg-white/95 px-3 py-2 text-[11px] text-slate-600 shadow-sm backdrop-blur">
          <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-blue-500" />Frontend</span>
          <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-violet-500" />Backend</span>
          <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-amber-500" />Data</span>
        </div>
      </Panel>
    </ReactFlow>
  );
}

export function ArchitectureCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
}
