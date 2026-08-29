import { useState } from 'react';
import { Bot, Check, ChevronUp, CircleAlert, LoaderCircle, X } from 'lucide-react';

import { useWorkspaceStore } from '../workspace/store';

const statusLabels = {
  checking: 'Checking agent connection',
  ready: 'WebMCP ready · 7 tools',
  unavailable: 'WebMCP unavailable · manual mode',
} as const;

const toolLabels: Record<string, string> = {
  get_architecture: 'Reading architecture',
  inspect_element: 'Inspecting architecture evidence',
  show_architecture_view: 'Opening architecture view',
  annotate_architecture: 'Recording architecture finding',
  add_constraint: 'Adding architecture policy',
  create_proposal: 'Creating architecture proposal',
  validate_architecture: 'Validating architecture',
};

export function AgentActivityBar() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const webMcpStatus = useWorkspaceStore((state) => state.webMcpStatus);
  const entries = useWorkspaceStore((state) => state.agentActivity);
  const visibleEntries = entries.slice(-2);

  return (
    <>
      {historyOpen ? (
        <section
          aria-label="Agent activity history"
          className="fixed inset-x-0 bottom-[72px] z-50 max-h-[60vh] border-y border-slate-200 bg-white shadow-[0_-18px_48px_rgba(15,23,42,0.16)]"
        >
          <header className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Agent activity history</h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {entries.length} real or explicitly simulated tool steps
              </p>
            </div>
            <button
              aria-label="Close activity history"
              className="grid size-8 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              onClick={() => setHistoryOpen(false)}
              type="button"
            >
              <X aria-hidden="true" size={15} />
            </button>
          </header>
          <ol className="max-h-[calc(60vh-58px)] overflow-y-auto px-6 py-2">
            {[...entries].reverse().map((entry, reverseIndex) => (
              <li className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0" key={entry.id}>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500">
                  {entries.length - reverseIndex}
                </span>
                {entry.status === 'running' ? (
                  <LoaderCircle aria-hidden="true" className="mt-1 shrink-0 animate-spin text-sky-600" size={14} />
                ) : entry.status === 'success' ? (
                  <Check aria-hidden="true" className="mt-1 shrink-0 text-emerald-600" size={14} />
                ) : (
                  <CircleAlert aria-hidden="true" className="mt-1 shrink-0 text-rose-600" size={14} />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{toolLabels[entry.tool] ?? entry.tool}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {entry.tool} · {entry.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      <footer className="flex h-[72px] shrink-0 items-center gap-4 border-t border-slate-200 bg-white px-5">
        <div className="flex min-w-44 items-center gap-2 border-r border-slate-200 pr-4">
          <span className="grid size-7 place-items-center rounded-lg bg-slate-100 text-slate-600">
            <Bot aria-hidden="true" size={15} />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Agent Activity</p>
            <p className={`text-xs ${webMcpStatus === 'ready' ? 'text-emerald-700' : 'text-slate-500'}`}>
              {statusLabels[webMcpStatus]}
            </p>
          </div>
        </div>

        {visibleEntries.length === 0 ? (
          <div>
            <p className="text-xs font-medium text-slate-600">
              {webMcpStatus === 'ready' ? 'Ready for agent analysis' : 'Manual exploration is ready'}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">Real agent steps appear here as WebMCP tools run.</p>
          </div>
        ) : (
          <ol className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            {visibleEntries.map((entry, index) => (
              <li className="flex min-w-0 items-center gap-2" key={entry.id}>
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500">
                  {entries.length - visibleEntries.length + index + 1}
                </span>
                {entry.status === 'running' ? (
                  <LoaderCircle aria-hidden="true" className="shrink-0 animate-spin text-sky-600" size={14} />
                ) : entry.status === 'success' ? (
                  <Check aria-hidden="true" className="shrink-0 text-emerald-600" size={14} />
                ) : (
                  <CircleAlert aria-hidden="true" className="shrink-0 text-rose-600" size={14} />
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-700">{toolLabels[entry.tool] ?? entry.tool}</p>
                  <p className="truncate text-[11px] text-slate-400">
                    {entry.tool} · {entry.description}
                  </p>
                </div>
                {index < visibleEntries.length - 1 ? <span className="mx-1 text-slate-300">→</span> : null}
              </li>
            ))}
          </ol>
        )}
        {entries.length > 0 ? (
          <button
            aria-expanded={historyOpen}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            onClick={() => setHistoryOpen((open) => !open)}
            type="button"
          >
            <ChevronUp aria-hidden="true" className={historyOpen ? 'rotate-180' : ''} size={13} />
            {historyOpen ? 'Hide history' : `View all ${entries.length}`}
          </button>
        ) : null}
      </footer>
    </>
  );
}
