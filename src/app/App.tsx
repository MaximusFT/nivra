import { Box, CheckCircle2, Circle } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { ArchitectureCanvas } from "../canvas/ArchitectureCanvas";
import { selectActiveView, selectArchitectureSummary } from "../workspace/selectors";
import { useWorkspaceStore } from "../workspace/store";

export function App() {
  const summary = useWorkspaceStore(useShallow(selectArchitectureSummary));
  const activeView = useWorkspaceStore(selectActiveView);

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
            <p className="text-sm font-semibold text-slate-800">{activeView?.name ?? "Unknown view"}</p>
            <p className="text-[11px] text-slate-500">High-Level Design</p>
          </div>
          <p className="text-xs text-slate-500">
            {activeView?.elementIds.length ?? 0} elements · {activeView?.relationIds.length ?? 0} relations
          </p>
        </div>
        <div className="min-h-0 flex-1">
          <ArchitectureCanvas />
        </div>
      </section>
    </main>
  );
}
