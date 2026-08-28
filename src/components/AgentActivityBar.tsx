import { Bot, Check, CircleAlert, LoaderCircle } from "lucide-react";

import { useWorkspaceStore } from "../workspace/store";

const statusLabels = {
  checking: "Checking WebMCP",
  ready: "WebMCP ready",
  unavailable: "WebMCP unavailable",
} as const;

export function AgentActivityBar() {
  const webMcpStatus = useWorkspaceStore((state) => state.webMcpStatus);
  const entries = useWorkspaceStore((state) => state.agentActivity);
  const visibleEntries = entries.slice(-3).reverse();

  return (
    <footer className="flex h-16 shrink-0 items-center gap-4 border-t border-slate-200 bg-white px-5">
      <div className="flex min-w-44 items-center gap-2 border-r border-slate-200 pr-4">
        <span className="grid size-7 place-items-center rounded-lg bg-slate-100 text-slate-600">
          <Bot aria-hidden="true" size={15} />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Agent Activity</p>
          <p className={`text-xs ${webMcpStatus === "ready" ? "text-emerald-700" : "text-slate-500"}`}>
            {statusLabels[webMcpStatus]}
          </p>
        </div>
      </div>

      {visibleEntries.length === 0 ? (
        <p className="text-xs text-slate-400">Tool calls will appear here in real time.</p>
      ) : (
        <ol className="flex min-w-0 flex-1 items-center gap-5 overflow-hidden">
          {visibleEntries.map((entry) => (
            <li className="flex min-w-0 items-center gap-2" key={entry.id}>
              {entry.status === "running" ? (
                <LoaderCircle aria-hidden="true" className="shrink-0 animate-spin text-sky-600" size={14} />
              ) : entry.status === "success" ? (
                <Check aria-hidden="true" className="shrink-0 text-emerald-600" size={14} />
              ) : (
                <CircleAlert aria-hidden="true" className="shrink-0 text-rose-600" size={14} />
              )}
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-700">{entry.tool}</p>
                <p className="truncate text-[11px] text-slate-400">{entry.description}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </footer>
  );
}
