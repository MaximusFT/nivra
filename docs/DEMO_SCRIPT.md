# Nivra — Five-Step Demo Script

Target duration: under three minutes.

## Before recording

1. Use a clean browser profile with WebMCP enabled.
2. Open Nivra and confirm the footer says `WebMCP ready`.
3. Select **Reset Demo**.
4. Keep the Context panel visible.

## 1. Read the shared architecture

Prompt:

```text
Read the active architecture. Is Checkout independently deployable?
```

Expected result: the agent calls `get_architecture`. Point out that the HLD presents Checkout as a separately deployed frontend artifact.

## 2. Reveal the hidden coupling

Prompt:

```text
Inspect Checkout, open its low-level view, and show the most important evidence for any coupling risk.
```

Expected result: the agent calls `inspect_element` and `show_architecture_view`; Checkout LLD focuses `Basket Adapter -> Product Store` with the `shares state` label.

## 3. Record explicit policy

Prompt:

```text
Record the policy required to make Checkout independently deployable, then validate the current architecture.
```

Expected result: the agent calls `add_constraint` for the four canonical rules and `validate_architecture` with `current`. The Policy panel shows `2 passed / 2 failed`.

## 4. Propose the smallest alternative

Prompt:

```text
Create the smallest proposal that removes the runtime state dependency without changing Current Architecture.
```

Expected result: the agent calls `create_proposal`. The workspace moves to Proposal mode and shows the added Checkout Snapshot Contract plus the removed Product Store runtime dependency.

## 5. Verify and preserve Current

Prompt:

```text
Validate the proposal, then switch back to Current and confirm that the original architecture is unchanged.
```

Expected result: the agent calls `validate_architecture` for Proposal and Current. Proposal reports `4 passed / 0 failed`; Current restores the original `shares state` relation.

## Fallback

When WebMCP is unavailable, run the same story manually: select Checkout LLD, use **Policy** to add the Checkout constraints, create the smallest proposal, then validate Current and Proposal. The documented browser gate remains `npm run test:webmcp`.