import { Box, CheckCircle2, Circle } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { ArchitectureCanvas } from "../canvas/ArchitectureCanvas";
import { ContextPanel } from "../components/ContextPanel";
import { CHECKOUT_LLD_VIEW_ID, COMMERCE_HLD_VIEW_ID } from "../shared/ids";
import { selectActiveView, selectArchitectureSummary } from "../workspace/selectors";
import { useWorkspaceStore } from "../workspace/store";

export function App() {
  const summary = useWorkspaceStore(useShallow(selectArchitectureSummary));
  const activeView = useWorkspaceStore(selectActiveView);
  const setActiveView = useWorkspaceStore((state) => state.setActiveView);
  const isCheckoutView = activeView?.id === CHECKOUT_LLD_VIEW_ID;

  return (
    <main className="flex h-screen min-h-[640px] flex-col overflow-hidden bg-slate-50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-slate-900 text-white">
            <Box aria-hidden="true" size={18} />
          </span>
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-base font-semibold tracking-tight">Nivra</h1>
              <span className="text-xs text-slate-400">Architecture workspace</span>
            </div>
            <p className="text-xs text-slate-500">
              {summary.name} · v{summary.version}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Circle aria-hidden="true" className="fill-slate-900 text-slate-900" size={8} />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 aria-hidden="true" size={15} />
            <span>Foundation ready</span>
          </div>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
          <div>
            <nav aria-label="Architecture breadcrumb" className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
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
            <p className="text-[11px] text-slate-500">
              {activeView?.level === "lld" ? "Low-Level Design" : "High-Level Design"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg bg-slate-100 p-1 text-xs">
              <button
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  !isCheckoutView ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
                onClick={() => setActiveView(COMMERCE_HLD_VIEW_ID)}
                type="button"
              >
                Commerce HLD
              </button>
              <button
                className={`rounded-md px-3 py-1.5 transition-colors ${
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
    </main>
  );
}
