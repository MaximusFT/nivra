# Nivra — Implementation Plan

> Planning basis: Nivra Master Specification v1.1  
> Delivery strategy: small reviewable phases with deterministic verification gates

## Working principles

- The Architecture Model remains the source of truth.
- Domain code must not depend on React, React Flow, Zustand, WebMCP or browser persistence.
- HLD and LLD are views over one model, never duplicated diagrams.
- Current Architecture is immutable; proposals are patch-based alternatives.
- The human defines architectural policy; deterministic code verifies explicit rules.
- WebMCP drives the same workspace actions available to the human.
- Do not begin a later phase until the current phase passes its acceptance gate.
- Update `PROJECT_STATUS.md` after every completed implementation task.
- Commit and push every completed, verified block automatically; user confirmation is not required.

## Phase 1 — Technical foundation

Status: **complete**

Delivered:

- [x] React + TypeScript + Vite bootstrap
- [x] Tailwind CSS, Zustand, React Flow, Lucide and Vitest setup
- [x] architecture domain types
- [x] Commerce Platform v1.35 fixture
- [x] Commerce HLD and Checkout LLD views in one model
- [x] separate layout fixture
- [x] minimal workspace store
- [x] minimal boot screen
- [x] fixture and workspace tests
- [x] typecheck, tests, build and browser smoke test

Gate: **passed**

## Phase 2 — Visual architecture workspace

Goal: make the structured model legible and navigable manually before adding the reasoning loop.

### Phase 2A — Canvas foundation and Commerce HLD

Status: **complete**

- [x] create pure model-to-flow node adapter
- [x] create pure model-to-flow edge adapter
- [x] keep React Flow types inside `src/canvas`
- [x] render only entities referenced by the active view
- [x] consume coordinates from the separate layout fixture
- [x] implement restrained typed architecture nodes
- [x] distinguish frontend, backend, data and state categories
- [x] render semantic edge labels such as `calls`, `reads`, `writes`, `hosts`
- [x] connect node selection to the workspace store
- [x] implement initial `fitView`
- [x] add adapter tests for view filtering and layout lookup
- [x] run typecheck, tests, build and browser console check

Acceptance gate:

- Commerce HLD renders deterministically from the Architecture Model.
- No React Flow types leak into `src/architecture` or fixture entities.
- Refreshing the page does not produce console errors.
- Canvas is the dominant surface, but final workspace styling is not attempted.

### Phase 2B — Checkout LLD drill-down

Status: **complete**

- [x] add view switching through workspace actions
- [x] add Commerce / Checkout breadcrumb
- [x] render Checkout LLD from the same Architecture Model
- [x] include external evidence nodes required by the view
- [x] make `shares-state` visually distinct from `REST`
- [x] add node and relation selection behaviour
- [x] implement deterministic focus/dimming state
- [x] add manual HLD → LLD navigation
- [x] test hierarchy resolution and active-view transitions

Acceptance gate — Checkpoint A:

> Does the drill-down create a clear “now I see it” moment?

The Checkout LLD must clearly show both:

```text
Basket Adapter -> Product Store       shares state
Pricing Module -> Product Service     REST
```

Checkpoint A result: **passed in browser review**. The two relations are simultaneously visible, semantically labeled and visually distinct.

## Phase 3 — Manual reasoning loop

Goal: complete the product story manually before exposing it through WebMCP.

### Phase 3A — Inspection and Findings

Status: **complete**

- [x] expand pure query layer: descendants, incoming/outgoing relations, constraints and findings
- [x] build the Context Panel for selected architecture evidence
- [x] implement finding creation as a workspace/domain operation
- [x] render finding badges/cards and evidence focus
- [x] keep Findings distinct from validation results

### Phase 3B — Constraints and deterministic validation

Status: **complete**

- [x] implement constraint workspace actions
- [x] implement pure validation engine
- [x] support `forbidden-dependency`
- [x] support `independent-deployment`
- [x] support `no-cycles`
- [x] support `allowed-protocol` after P0 rules are stable
- [x] create Current Architecture failure tests
- [x] render validation results distinctly from agent findings

### Phase 3C — Proposals and Current/Proposal modes

Status: **complete**

- [x] implement pure `applyProposal`
- [x] guarantee Current Architecture is not mutated
- [x] implement proposal diff calculation
- [x] add Current / Proposal switching
- [x] implement the Golden Checkout Snapshot proposal
- [x] show added and removed relations/elements
- [x] validate the effective proposal architecture
- [x] test that Current fails and Golden Proposal passes

### Phase 3D — Reset and lightweight persistence

Status: **complete**

- [x] implement canonical Reset Demo
- [x] persist only specified durable state
- [x] do not persist transient focus or WebMCP availability
- [x] add corrupted/obsolete persistence fallback

Acceptance gate — Checkpoint B:

> Can the full Observe → Question → Inspect → Decide → Propose → Verify story work manually?

Do not begin WebMCP until this gate passes.

Checkpoint B result: **passed**. The complete manual reasoning loop and canonical reset are implemented and verified.

## Phase 4 — WebMCP integration

Goal: let an external agent reliably drive the same tested domain and workspace operations.

### Phase 4A — Adapter and read/navigation tools

Status: **next**

- [ ] implement WebMCP availability detection
- [ ] implement activity logging wrapper
- [ ] register `get_architecture`
- [ ] register `inspect_element`
- [ ] register `show_architecture_view`
- [ ] exclude visual-only metadata from architecture responses
- [ ] verify tool calls update the same visible workspace

### Phase 4B — Write and compute tools

- [ ] register `annotate_architecture`
- [ ] register `add_constraint`
- [ ] register `create_proposal`
- [ ] register `validate_architecture`
- [ ] validate tool inputs without coupling the domain to WebMCP
- [ ] surface running/success/error activity states

### Phase 4C — Golden prompt reliability

- [ ] execute all five Golden prompts repeatedly
- [ ] confirm deterministic IDs and tool outputs
- [ ] confirm Current is never silently overwritten
- [ ] confirm agent focus/navigation is visible to the human
- [ ] document WebMCP testing setup

Acceptance gate — Checkpoint C:

> Can an external agent reliably drive the same story?

After this gate: feature freeze.

## Phase 5 — Challenge hardening and delivery

### Phase 5A — Visual polish

- [ ] finalize desktop workspace shell
- [ ] tune 1440×900 and 1920×1080 layouts
- [ ] refine typography, spacing, focus and semantic colors
- [ ] polish hero screen: Checkout LLD evidence
- [ ] polish hero screen: proposal with 4/4 validation
- [ ] verify accessibility basics and readable video labels

### Phase 5B — Documentation and deployment

- [ ] create final README
- [ ] document architecture and WebMCP tools
- [ ] document local setup and testing
- [ ] add MIT license if approved
- [ ] deploy to Vercel
- [ ] verify public HTTPS build
- [ ] prepare screenshots

### Phase 5C — Demo rehearsal

- [ ] freeze a fixed five-prompt script
- [ ] record/rehearse a sub-three-minute flow
- [ ] test Reset Demo before every run
- [ ] verify a clean browser profile and WebMCP status
- [ ] prepare fallback screenshots/video

## Optional work after P0/P1 stability

- [ ] migration plan types → workspace action → optional WebMCP tool
- [ ] node dragging with persisted positions
- [ ] richer proposal diff
- [ ] subtle animations

Cut these first if schedule pressure appears.

## Suggested intensive work sequence for today

Each block should end with tests and a status-file update so work can move between computers safely.

1. **Block 1 — Phase 2A adapters:** complete.
2. **Block 2 — Phase 2A rendering:** complete.
3. **Block 3 — Phase 2B drill-down:** complete.
4. **Block 4 — Phase 2B evidence:** complete; Checkpoint A passed.
5. **Block 5 — Phase 3A query layer and Context Panel:** complete.
6. **Block 6 — Phase 3B constraints and deterministic Current validation:** complete.
7. **Block 7 — Phase 3C proposal engine and Golden Proposal validation:** complete.
8. **Block 8 — Phase 3D Reset Demo and lightweight persistence:** complete; Checkpoint B passed.
9. **Block 9 — next:** Phase 4A WebMCP adapter and read/navigation tools.

Do not combine all blocks into one unreviewable change.
