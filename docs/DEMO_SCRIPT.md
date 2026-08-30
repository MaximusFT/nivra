# Nivra — Three-Minute Video Teleprompter

Target duration: **2:45–2:55**. Text calibrated for a calm speaking pace without long pauses.

Russian timed teleprompter: [VIDEO_SCRIPT_RU.md](VIDEO_SCRIPT_RU.md).

## Before recording

- Open `https://nivra-psi.vercel.app` in Chrome with WebMCP.
- Confirm the footer displays `WebMCP ready · 7 tools`.
- Set browser zoom to 100% and recording resolution to 1920×1080.
- Click `Reset Demo`.
- Do not move cursor unnecessarily.

## 0:00–0:20 — Problem & Product

**On screen:** Initial Commerce HLD. Do not click anything.

**Speak:**

> Large architecture is hard to keep in mind, especially when it changes every sprint. Nivra is a shared architecture workspace for an engineer and an AI agent. The human sees an interactive map, while the agent works with the same structured model via WebMCP. Today, I want to verify one assumption: can Checkout really be developed and released independently?

## 0:20–0:38 — Architectural Context

**On screen:** Click `Product Service`, then `Checkout MFE`. Pause on Context.

**Speak:**

> This demo starts from an imported Commerce Platform snapshot. I can select any element to view its owner, deployment unit, and dependencies. Checkout looks like a separate microfrontend, but a separate box on a diagram does not guarantee independence. It has its own low-level view that can be explored.

## 0:38–1:02 — Agent Analysis

**On screen:** Click empty canvas background, then `Run guided agent demo`. Do not move cursor until all four steps appear.

**Speak:**

> I am running guided analysis. For an autonomous demo, Nivra transparently executes the same verified sequence of WebMCP tool calls. In a live session, a connected agent invokes these tools. It reads the model, inspects the Checkout boundary, opens internal architecture, and records the observed risk. All operations appear in Agent Activity, and the full history can be expanded at any time.

## 1:02–1:28 — Hidden Coupling

**On screen:** Point to the red `shares state` relation. Click it if needed. In Context, highlight `Crosses boundary` and `No explicit contract`.

**Speak:**

> Here is the key piece of evidence. Basket Adapter directly uses Product Store at runtime. This dependency crosses a deployment boundary with no explicit contract, so changing Product's internal state could break Checkout. In comparison, Pricing Module integrates with Product Service via REST and a versioned API contract. That dependency is explicit and controlled.

## 1:28–1:50 — Human Decision & Current Validation

**On screen:** Click `Turn finding into policy`, then `Save and validate policy`.

**Speak:**

> The agent uncovered facts, but the architectural decision remains with the human. I permit REST integration, forbid shared runtime state, and require independent deployment without cycles. Nivra turns these decisions into executable policy and validates Current Architecture. The result is two rules passed and two failed. Now it is clear not only what is broken, but why.

## 1:50–2:15 — Proposal & Visual Diff

**On screen:** Click `Create remediation proposal`. Highlight the two diverging relations labeled `REMOVED` and `ADDED`.

**Speak:**

> I am creating a remediation proposal. Current Architecture is never overwritten. Nivra presents the replacement directly on the canvas: the old runtime dependency on Product Store is muted and marked as removed, while the new Checkout Snapshot Contract appears as added. This is a separate alternative that can be compared against the baseline.

## 2:15–2:36 — Deterministic Success

**On screen:** Click `Validate proposal architecture`, then `Prepare implementation plan`.

**Speak:**

> Now Nivra deterministically validates the Proposal against the exact same rules. All four policies pass. From this verified solution, Nivra generates an implementation brief: add the contract, publish the snapshot, migrate the adapter, verify independent deployment, and remove the legacy dependency. This plan can be copied as Markdown directly into delivery workflows.

## 2:36–2:55 — Preserving the Branch & Conclusion

**On screen:** Click `Save as architecture branch`. In the branch selector, choose `current/commerce-1.35`, then switch back to `proposal/checkout-isolation · verified`.

**Speak:**

> The final output is not chat advice, but a verified architecture branch. I can return to canonical Current with the original red coupling or switch to saved Checkout Isolation as the clean target architecture. Nivra combines agent discovery, human policy, proposal generation, and verifiable delivery paths without ever altering Current without the architect's consent.

## Backup Shortcuts

If the recording exceeds three minutes:

1. In the 0:20 block, skip clicking `Product Service` and select `Checkout MFE` directly.
2. In the 1:02 block, omit the sentence comparing Pricing Module.
3. In the closing block, switch branches only once to Current and conclude on the red relation.

## Honest Framing Note

The `Run guided agent demo` button triggers an in-browser execution of the verified WebMCP tool sequence via `document.modelContext.executeTool`. Do not claim an external LLM is reasoning in real time during this automated demo step. For live external WebMCP client recordings, use the WebMCP prompts below.

## WebMCP Prompts for Live Agent Sessions

When recording with a connected external WebMCP client (e.g. VS Code Chat), use these five exact prompts:

1. **Read Architecture:**
   > Read the active architecture. Is Checkout independently deployable?

2. **Inspect & Reveal Evidence:**
   > Inspect Checkout, open its low-level view, and show the most important evidence for any coupling risk.

3. **Record Policy & Validate:**
   > Record the policy required to make Checkout independently deployable, then validate the current architecture.

4. **Create Proposal:**
   > Create a remediation proposal that removes the runtime state dependency without changing Current Architecture.

5. **Verify & Preserve:**
   > Validate the proposal, then switch back to Current and confirm that the original architecture is unchanged.

