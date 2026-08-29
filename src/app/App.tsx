import { Box, CheckCircle2, Circle, RotateCcw } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { ArchitectureCanvas } from "../canvas/ArchitectureCanvas";
import { AgentActivityBar } from "../components/AgentActivityBar";
import { ContextPanel } from "../components/ContextPanel";
import { CHECKOUT_LLD_VIEW_ID, COMMERCE_HLD_VIEW_ID } from "../shared/ids";
import { selectActiveView, selectArchitectureSummary } from "../workspace/selectors";
import { useWorkspaceStore } from "../workspace/store";

export function App() {
  const summary = useWorkspaceStore(useShallow(selectArchitectureSummary));
  const activeView = useWorkspaceStore(selectActiveView);
  const setActiveView = useWorkspaceStore((state) => state.setActiveView);
  const activeMode = useWorkspaceStore((state) => state.activeMode);
  const activeProposalId = useWorkspaceStore((state) => state.activeProposalId);
  const setActiveMode = useWorkspaceStore((state) => state.setActiveMode);
  const resetWorkspace = useWorkspaceStore((state) => state.resetWorkspace);
  const isCheckoutView = activeView?.id === CHECKOUT_LLD_VIEW_ID;

  return (
    <main className="flex h-screen min-h-[640px] flex-col overflow-hidden bg-[#f4f6f8] text-slate-800">
      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200/90 bg-white/95 px-6 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur">
        <div className="flex items-center gap-3.5">
          <span className="grid size-9 place-items-center rounded-lg bg-slate-900 text-white shadow-sm">
            <Box aria-hidden="true" size={18} />
          </span>
          <div>
            <div className="flex items-baseline gap-2.5">
              <h1 className="text-[17px] font-semibold text-slate-950">Nivra</h1>
              <span className="text-xs text-slate-400">Architecture workspace</span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              {summary.name} · v{summary.version}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div className="flex rounded-md border border-slate-200 bg-slate-100/80 p-0.5 text-[11px]">
            <button
              className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 ${
                activeMode === "current" ? "bg-white font-semibold text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveMode("current")}
              type="button"
            >
              <Circle aria-hidden="true" className="fill-slate-900 text-slate-900" size={7} />
              Current
            </button>
            <button
              className={`rounded px-2.5 py-1.5 ${
                activeMode === "proposal" ? "bg-white font-semibold text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              } disabled:cursor-not-allowed disabled:opacity-40`}
              disabled={!activeProposalId}
              onClick={() => setActiveMode("proposal")}
              type="button"
            >
              Proposal
            </button>
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 aria-hidden="true" size={15} />
            <span>Workspace ready</span>
          </div>
          <button
            className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
            onClick={resetWorkspace}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={13} />
            Reset Demo
          </button>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <nav aria-label="Architecture breadcrumb" className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <button
                className="rounded px-1 py-0.5 transition-colors hover:bg-slate-100"
                onClick={() => setActiveView(COMMERCE_HLD_VIEW_ID)}
                type="button"
              >
                Commerce Platform
              </button>
              {isCheckoutView ? (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="px-1 py-0.5">Checkout</span>
                </>
              ) : null}
            </nav>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">
              {activeView?.level === "lld" ? "Low-Level Design" : "High-Level Design"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex rounded-md border border-slate-200 bg-slate-100/80 p-0.5 text-xs">
              <button
                className={`rounded px-3 py-1.5 transition-colors ${
                  !isCheckoutView ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
                onClick={() => setActiveView(COMMERCE_HLD_VIEW_ID)}
                type="button"
              >
                Commerce HLD
              </button>
              <button
                className={`rounded px-3 py-1.5 transition-colors ${
                  isCheckoutView ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
                onClick={() => setActiveView(CHECKOUT_LLD_VIEW_ID)}
                type="button"
              >
                Checkout LLD
              </button>
            </div>
            <p className="text-xs text-slate-500">
              {activeView?.elementIds.length ?? 0} elements · {activeView?.relationIds.length ?? 0} relations
            </p>
          </div>
        </div>
        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1">
            <ArchitectureCanvas />
          </div>
          <ContextPanel />
        </div>
      </section>
      <AgentActivityBar />
    </main>
  );
}
