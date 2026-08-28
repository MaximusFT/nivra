# Nivra — Project Status

> Last updated: 2026-08-28  
> Current phase: Phase 3B complete; Phase 3C next
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

Phase 3B added deterministic architectural policy verification:

- a pure TypeScript validation engine with typed results;
- `forbidden-dependency`, `independent-deployment`, `no-cycles` and `allowed-protocol` rules;
- descendant-aware forbidden dependency checks;
- inherited deployment-unit resolution for LLD elements;
- case-insensitive protocol comparison;
- immutable, idempotent workspace constraints and explicit validation action;
- a Policy tab that is visually and structurally separate from Findings;
- evidence restoration from failed validation checks.

Golden Current validation is deterministic: **2 passed / 2 failed**.

## Verification baseline

The following checks passed after the latest change:

```text
npm run typecheck  PASS
npm test           PASS — 24 tests
npm run build      PASS
Browser runtime    PASS — constraints, 2/2 Current validation and failed-check evidence work; no console errors
```

Always run all three command-line checks before ending an implementation task.

## Exact next task

Start **Phase 3C — Proposals and Current/Proposal modes**, as defined in `docs/IMPLEMENTATION_PLAN.md`.

The next implementation task should be limited to:

1. implement pure `applyProposal` without mutating Current Architecture;
2. implement proposal diff calculation;
3. define the Golden Checkout Snapshot proposal patch;
4. add immutable proposal creation and Current/Proposal workspace modes;
5. render proposal additions/removals distinctly on the same canvas;
6. validate the effective proposal architecture;
7. prove in tests and browser that Current fails 2/2 while Proposal passes 4/0.

Do not add WebMCP in Phase 3C.

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
