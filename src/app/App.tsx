import { Box, CheckCircle2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { selectActiveView, selectArchitectureSummary } from "../workspace/selectors";
import { useWorkspaceStore } from "../workspace/store";

export function App() {
  const summary = useWorkspaceStore(useShallow(selectArchitectureSummary));
  const activeView = useWorkspaceStore(selectActiveView);

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-slate-900 text-white">
            <Box aria-hidden="true" size={20} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Nivra</h1>
            <p className="text-sm text-slate-500">Architecture is the shared context.</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-lg font-medium">
            {summary.name} <span className="text-slate-400">· v{summary.version}</span>
          </p>
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <CheckCircle2 aria-hidden="true" size={18} />
            <span>Foundation ready.</span>
          </div>
          <dl className="grid grid-cols-2 gap-3 pt-3 text-sm">
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-slate-500">Active view</dt>
              <dd className="mt-1 font-medium">{activeView?.name ?? "Unknown"}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-slate-500">Model size</dt>
              <dd className="mt-1 font-medium">
                {summary.elementCount} elements · {summary.relationCount} relations
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
