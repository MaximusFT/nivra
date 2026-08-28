import type { AgentActivityEntry } from "../workspace/actions";
import { useWorkspaceStore } from "../workspace/store";

let activitySequence = 0;

function nextActivityId(timestamp: number): string {
  activitySequence += 1;
  return `webmcp-${timestamp}-${activitySequence}`;
}

export async function withAgentActivity<TResult>(
  tool: string,
  description: string,
  operation: () => TResult | Promise<TResult>,
): Promise<TResult> {
  const timestamp = Date.now();
  const entry: AgentActivityEntry = {
    id: nextActivityId(timestamp),
    timestamp,
    tool,
    description,
    status: "running",
  };

  useWorkspaceStore.getState().upsertAgentActivity(entry);

  try {
    const result = await operation();
    useWorkspaceStore.getState().upsertAgentActivity({ ...entry, status: "success" });
    return result;
  } catch (error) {
    useWorkspaceStore.getState().upsertAgentActivity({ ...entry, status: "error" });
    throw error;
  }
}
