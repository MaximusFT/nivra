# Nivra — Five-Step Demo Script

Target duration: under three minutes.

Russian timed teleprompter with exact UI actions: [VIDEO_SCRIPT_RU.md](VIDEO_SCRIPT_RU.md).

## Before recording

1. Use a clean browser profile with WebMCP enabled.
2. Open Nivra and confirm the footer says `WebMCP ready`.
3. Select **Reset Demo**.
4. Keep the Context panel visible.

Opening narration:

```text
Nivra is a shared architecture workspace for an architect and an AI agent. This demo starts from an imported Commerce architecture snapshot. I want to verify one assumption: is Checkout really independently deployable?
```

## 1. Read the shared architecture

Prompt:

```text
Read the active architecture. Is Checkout independently deployable?
```

Expected result: the agent calls `get_architecture`. Point out that the HLD presents Checkout as a separately deployed frontend artifact.

The workspace can also be explored manually. Selecting Checkout opens its owner, deployment information, evidence source and an explicit **Explore Checkout internals** action; selecting unrelated elements shows their own context instead of Checkout actions.

For a self-contained rehearsal without an external agent, select **Run guided agent demo**. Nivra clearly labels this as a local simulation and stages the same four verified operations in Agent Activity: read architecture, inspect Checkout, open evidence and record a Finding.

Select **Explore evidence manually** to skip the staged sequence and open the same shared-state relation directly. The footer keeps the latest two steps visible; **View all** opens the complete activity history.

## 2. Reveal the hidden coupling

Prompt:

```text
Inspect Checkout, open its low-level view, and show the most important evidence for any coupling risk.
```

Expected result: the agent calls `inspect_element` and `show_architecture_view`; Checkout LLD focuses `Basket Adapter -> Product Store` with the `shares state` label.

Narration:

```text
A separate box does not guarantee an independent system. Nivra found that Basket Adapter consumes Product's in-process runtime state across a deployment boundary. Pricing uses an explicit Product API contract, so that dependency is acceptable.
```

## 3. Record explicit policy

Prompt:

```text
Record the policy required to make Checkout independently deployable, then validate the current architecture.
```

Expected result: the agent calls `add_constraint` for the four canonical rules and `validate_architecture` with `current`. The Policy panel shows `2 passed / 2 failed`.

In the manual path, select **Turn finding into policy**, review the four decisions, then select **Save and validate policy**. The failed result explains that Checkout is not independently deployable and reveals one next action. The Proposal action is intentionally hidden before validation.

## 4. Create a remediation proposal

Prompt:

```text
Create a remediation proposal that removes the runtime state dependency without changing Current Architecture.
```

Expected result: the agent calls `create_proposal`. The workspace moves to Proposal mode and shows both sides of the diff at once: the new Checkout Snapshot Contract is marked `ADDED`, while Product Store and the old runtime relation remain visible as muted `REMOVED` evidence.

## 5. Verify and preserve Current

Prompt:

```text
Validate the proposal, then switch back to Current and confirm that the original architecture is unchanged.
```

Expected result: the agent calls `validate_architecture` for Proposal and Current. Proposal reports `4 passed / 0 failed`; Current restores the original `shares state` relation. Select **Prepare implementation plan** to produce a five-step delivery brief, then select **Save as architecture branch**.

The temporary Current/Proposal comparison becomes a durable branch selector. `proposal/checkout-isolation` shows the accepted architecture without diff markers; switching to `current/commerce-1.35` restores the original runtime dependency.

Closing narration:

```text
The agent did not replace the architect. It exposed evidence, the human turned a trade-off into policy, and Nivra saved the verified alternative as an architecture branch ready for delivery. Current Architecture was never overwritten.
```

## Fallback

When an external WebMCP client is unavailable, select **Run guided agent demo**, then continue from the generated Finding through Policy, Proposal, verification and implementation planning. The footer identifies this activity as `Demo simulation`; it does not impersonate a connected external agent. The documented browser gate remains `npm run test:webmcp`.
