import { describe, expect, it } from "vitest";

import { checkoutGoldenConstraints } from "../fixtures/commerce/constraints";
import { goldenCheckoutProposal } from "../fixtures/commerce/proposals";
import {
  clearWorkspacePersistence,
  createPersistedWorkspace,
  readWorkspacePersistence,
  WORKSPACE_STORAGE_KEY,
  writeWorkspacePersistence,
} from "./persistence";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const canonicalState = {
  architecture: { constraints: [], findings: [], proposals: [] },
  activeMode: "current" as const,
  activeProposalId: undefined,
};

describe("workspace persistence", () => {
  it("serializes only durable workspace state", () => {
    const payload = createPersistedWorkspace({
      architecture: {
        constraints: checkoutGoldenConstraints,
        findings: [],
        proposals: [goldenCheckoutProposal],
      },
      activeMode: "proposal",
      activeProposalId: goldenCheckoutProposal.id,
    });

    expect(payload).toEqual(
      expect.objectContaining({
        version: 1,
        activeMode: "proposal",
        activeProposalId: "checkout-isolation",
      }),
    );
    expect(payload).not.toHaveProperty("selectedElementIds");
    expect(payload).not.toHaveProperty("validationResult");
    expect(payload).not.toHaveProperty("webMcpStatus");
  });

  it("round-trips a valid payload", () => {
    const storage = new MemoryStorage();
    const state = {
      architecture: {
        constraints: checkoutGoldenConstraints,
        findings: [],
        proposals: [goldenCheckoutProposal],
      },
      activeMode: "proposal" as const,
      activeProposalId: goldenCheckoutProposal.id,
    };

    writeWorkspacePersistence(state, storage);
    expect(readWorkspacePersistence(storage)).toEqual(createPersistedWorkspace(state));
  });

  it("ignores malformed and obsolete payloads", () => {
    const storage = new MemoryStorage();
    storage.setItem(WORKSPACE_STORAGE_KEY, "not json");
    expect(readWorkspacePersistence(storage)).toBeUndefined();

    storage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify({ ...canonicalState, version: 99 }));
    expect(readWorkspacePersistence(storage)).toBeUndefined();
  });

  it("removes canonical state and supports explicit clearing", () => {
    const storage = new MemoryStorage();
    storage.setItem(WORKSPACE_STORAGE_KEY, "stale");
    writeWorkspacePersistence(canonicalState, storage);
    expect(storage.getItem(WORKSPACE_STORAGE_KEY)).toBeNull();

    storage.setItem(WORKSPACE_STORAGE_KEY, "stale");
    clearWorkspacePersistence(storage);
    expect(storage.getItem(WORKSPACE_STORAGE_KEY)).toBeNull();
  });
});
