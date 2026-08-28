import { Database, PanelsTopLeft, Server, Share2, Workflow } from "lucide-react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

import type { ArchitectureFlowNode } from "../adapters";

const areaStyles = {
  frontend: {
    shell: "border-blue-200 bg-blue-50/95",
    icon: "bg-blue-100 text-blue-700",
  },
  backend: {
    shell: "border-violet-200 bg-violet-50/95",
    icon: "bg-violet-100 text-violet-700",
  },
  data: {
    shell: "border-amber-200 bg-amber-50/95",
    icon: "bg-amber-100 text-amber-700",
  },
  infrastructure: {
    shell: "border-slate-300 bg-slate-50/95",
    icon: "bg-slate-200 text-slate-700",
  },
  external: {
    shell: "border-emerald-200 bg-emerald-50/95",
    icon: "bg-emerald-100 text-emerald-700",
  },
} as const;

function NodeIcon({ kind }: { kind: ArchitectureFlowNode["data"]["kind"] }) {
  if (kind === "datastore") return <Database aria-hidden="true" size={17} />;
  if (kind === "service" || kind === "api") return <Server aria-hidden="true" size={17} />;
  if (kind === "state") return <Share2 aria-hidden="true" size={17} />;
  if (kind === "microfrontend" || kind === "application") {
    return <PanelsTopLeft aria-hidden="true" size={17} />;
  }
  return <Workflow aria-hidden="true" size={17} />;
}

export function ArchitectureNode({ data, selected }: NodeProps<ArchitectureFlowNode>) {
  const styles = areaStyles[data.area];

  return (
    <article
      className={`w-[196px] rounded-xl border px-3.5 py-3 shadow-sm transition-shadow ${styles.shell} ${
        selected ? "ring-2 ring-blue-500 ring-offset-2 shadow-md" : ""
      }`}
    >
      <Handle className="!size-2 !border-white !bg-slate-400" type="target" position={Position.Left} />
      <div className="flex items-start gap-3">
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${styles.icon}`}>
          <NodeIcon kind={data.kind} />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-[13px] font-semibold text-slate-900">{data.label}</h2>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
            {data.kind.replaceAll("-", " ")}
          </p>
          {data.owner ? <p className="mt-2 truncate text-[11px] text-slate-600">{data.owner}</p> : null}
        </div>
      </div>
      <Handle className="!size-2 !border-white !bg-slate-400" type="source" position={Position.Right} />
    </article>
  );
}
