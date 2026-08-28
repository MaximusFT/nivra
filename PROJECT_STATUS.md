# Nivra — Project Status

> Last updated: 2026-08-28  
> Current phase: Phase 3A complete; Phase 3B next
> Current branch: `main`

This is the first file to read when resuming Nivra on another computer or in a new Codex task.

## Source of truth

Read project context in this order:

1. `PROJECT_STATUS.md` — current state and exact next action.
2. `docs/IMPLEMENTATION_PLAN.md` — phased delivery plan and acceptance gates.
3. `docs/ARCHITECTURE_DECISIONS.md` — decisions already made and unresolved questions.
4. `Nivra_Master_Specification_v1.1.md` — product and architecture source of truth.
5. The latest numbered `Codex_Handoff_Prompt_*.md`, when one exists — scope for the active implementation task.

If a handoff prompt conflicts with the Master Specification, stop and ask the user which document should win. Do not silently expand scope.

## Current implementation

Phase 1 established the technical foundation:

- React, TypeScript and Vite application bootstrap;
- Tailwind CSS, Zustand, Vitest, Lucide React and `@xyflow/react` installed;
- framework-independent Architecture Model;
- Commerce Platform v1.35 fixture;
- shared HLD and Checkout LLD model with stable IDs;
- separate deterministic layout fixture;
- minimal Zustand workspace store and selectors;
- minimal foundation screen;
- fixture-integrity and workspace tests.

The critical Golden Scenario semantics already exist:

- `basket-adapter -> product-store` is `shares-state`;
- `pricing-module -> product-service` is `calls` over `REST`;
- `product-store` is an LLD child of `shared-store`;
- initial findings, constraints, proposals and migration plans are empty.

The React/Zustand infinite-render issue was fixed by applying `useShallow` to the object-returning summary selector in `src/app/App.tsx`.

Phase 2A added:

- pure Architecture Model → React Flow node and edge adapters;
- deterministic Commerce HLD rendering from the active view and layout fixture;
- typed architecture nodes with frontend/backend/data/state differentiation;
- semantic edge labels and relation-specific colors;
- workspace-backed node and relation selection;
- fit-to-view, zoom controls and a small category legend;
- adapter tests that protect view filtering, fixture positions and semantic relations.

Phase 2B completed the first product checkpoint:

- manual Commerce HLD ↔ Checkout LLD switching;
- Commerce / Checkout breadcrumb and level-aware header;
- complete deterministic LLD positions;
- visibly distinct red `shares state` runtime coupling and blue `REST` integration;
- relation legend for the architectural trade-off;
- deterministic focus/dimming for selected nodes, relations and direct evidence;
- selection reset on view changes;
- focus, layout and workspace transition tests.

Checkpoint A passed in browser review: the Checkout LLD creates the intended “now I see it” moment without Findings or agent explanation.

Phase 3A added the manual inspection and observation loop:

- pure queries for descendants, incoming/outgoing relations, constraints, findings and element inspection;
- a structured Context Panel for selected elements and relations;
- immutable, idempotent Finding creation in the workspace;
- Finding cards and evidence badges on affected nodes;
- evidence restoration: clicking a Finding selects its evidence and opens the matching view;
- end-to-end browser verification from relation inspection through Finding focus.

## Verification baseline

The following checks passed after the latest change:

```text
npm run typecheck  PASS
npm test           PASS — 20 tests
npm run build      PASS
Browser runtime    PASS — inspection and Findings loop works end-to-end; no console errors
```

Always run all three command-line checks before ending an implementation task.

## Exact next task

Start **Phase 3B — Constraints and deterministic validation**, as defined in `docs/IMPLEMENTATION_PLAN.md`.

The next implementation task should be limited to:

1. define concrete validation result and per-constraint result types;
2. implement the pure validation engine outside React, Zustand and WebMCP;
3. support `forbidden-dependency`, `independent-deployment` and `no-cycles` first;
4. add `allowed-protocol` only after the P0 rules are stable;
5. add immutable workspace constraint and validation actions;
6. add a Constraints/Validation UI clearly separate from Findings;
7. test the canonical Current Architecture failure cases.

Do not add Proposals or WebMCP in Phase 3B.

## Resume procedure on another computer

```powershell
git pull --ff-only
npm install
npm run typecheck
npm test
npm run dev
```

Then read the files listed under **Source of truth** and continue from **Exact next task**.

## End-of-task handoff procedure

At the end of every implementation task:

1. update the current phase and exact next task in this file;
2. mark completed work in `docs/IMPLEMENTATION_PLAN.md`;
3. record new non-obvious decisions in `docs/ARCHITECTURE_DECISIONS.md`;
4. record verification commands and results here;
5. run `git status --short` and ensure no generated files are accidentally tracked;
6. commit and push before switching computers.

Never rely on chat history as the only record of project state.

## Git delivery policy

The user has explicitly authorized automatic Git delivery. After every completed and verified work block, Codex must update the handoff files, create a commit and push it to `origin` without requesting additional confirmation.

Do not commit partially verified implementation work. If a block is interrupted or failing, record the state locally and finish or repair it before pushing.

The initial foundation was committed and pushed successfully. `main` tracks `origin/main`.
