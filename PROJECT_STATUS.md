# Nivra — Project Status

> Last updated: 2026-08-29
> Current phase: Phase 5B deployment complete; final delivery assets next
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

Phase 3C completed the Current/Proposal reasoning loop:

- pure patch-based `applyProposal` and proposal diff calculation;
- strict base-version check and immutable Current Architecture;
- Golden Checkout Isolation proposal;
- derived effective view membership for added and disconnected external elements;
- Current/Proposal workspace modes and header switching;
- proposal-specific node/edge presentation and semantic legend;
- validation of the active architecture mode;
- browser proof that Current remains unchanged after viewing the Proposal.

Golden result: **Current 2 passed / 2 failed → Proposal 4 passed / 0 failed**.

Phase 3D added reproducible demo state:

- a versioned `nivra.workspace.v1` localStorage payload;
- persistence limited to constraints, findings, proposals and active proposal/mode;
- safe malformed and obsolete payload fallback;
- transient selection, validation and WebMCP status excluded from persistence;
- canonical Reset Demo restoring Current Commerce HLD and clearing durable state;
- visible one-click Reset Demo control.

Checkpoint B passed: the full Observe → Inspect → Decide → Propose → Verify story now works manually and can be reset to canonical state.

Phase 4A established the external-agent read/navigation boundary:

- current `document.modelContext.registerTool()` integration with guarded legacy fallback;
- isolated WebMCP availability detection and registration adapter;
- `get_architecture` structured active-model read without canvas positions;
- `inspect_element` backed by the existing pure query layer;
- `show_architecture_view` backed by the same workspace actions as manual navigation;
- optional element/relation focus validation against the requested view;
- running/success/error activity logging for every tool invocation;
- visible Agent Activity bar and WebMCP availability status;
- abort-signal-owned tool registrations and read-only annotations for read tools.

Browser verification with Chromium's `WebMCP` feature enabled showed **WebMCP ready** and a clean 1440×900 workspace render.

Phase 4B completed the WebMCP P0 tool set:

- `annotate_architecture` creates idempotent agent Findings and focuses their visible evidence;
- `add_constraint` stores all four supported deterministic rule variants;
- `create_proposal` creates a patch-based active alternative while preserving Current relations/elements;
- `validate_architecture` validates explicit Current/Proposal mode and updates the shared Policy result;
- write inputs are validated again inside the adapter, beyond browser JSON Schema enforcement;
- stable kebab-case IDs, enums, evidence references, rule references, proposal base version, duplicate/conflicting IDs, parent references, relation endpoints and nested update values are checked before workspace mutation;
- all seven P0 tools register through the same WebMCP lifecycle and activity wrapper.

The automated Golden result is preserved through WebMCP handlers: **Current 2 passed / 2 failed → Proposal 4 passed / 0 failed**, with Current runtime relations untouched.

Phase 4C completed browser-level reliability verification:

- a cross-platform `npm run test:webmcp` harness locates Chrome/Chromium or accepts `NIVRA_CHROME_PATH`;
- it launches isolated Vite and temporary Chromium processes on free localhost ports with WebMCP enabled;
- it discovers and invokes all seven tools through `ModelContext.executeTool()`;
- the complete Golden workflow runs three times by default, beginning from Reset Demo;
- deliberate Finding, Constraint and Proposal retries prove stable-ID idempotency;
- DOM assertions prove Checkout LLD focus and Agent Activity visibility;
- Current/Proposal validation and Current immutability are checked after every repetition;
- process shutdown and temporary profile cleanup are owned by the harness.

All three recorded runs produced the same evidence. **Checkpoint C passed.** See `docs/CHECKPOINT_C_REPORT.md` and `docs/WEBMCP_TESTING.md`.

## Verification baseline

The following checks passed after the latest change:

```text
npm run typecheck  PASS
npm test           PASS — 51 tests
npm run build      PASS
npm run test:webmcp PASS — 3 complete Chromium runs; 7 tools; Current 2/2 → Proposal 4/0
Browser runtime    PASS — focus and Agent Activity visible; Current preserved; unavailable fallback verified
Production HTTPS   PASS — https://nivra-psi.vercel.app; HTTP 200; Vercel Ready
Production WebMCP  PASS — 3 complete Chromium runs against HTTPS; all 7 tools reliable
```

Always run all command-line checks before ending an implementation task.

## Exact next task

Complete the remaining **Phase 5B/5C delivery assets**, as defined in `docs/IMPLEMENTATION_PLAN.md`.

The production application is live at **https://nivra-psi.vercel.app**. The next task is limited to:

1. decide whether the user approves adding an MIT license;
2. capture final production screenshots for the Checkout LLD evidence and Proposal `4/4` states;
3. prepare a fallback screenshot/video package if required for submission;
4. perform the final fixed demo rehearsal against the production URL;
5. avoid feature changes unless production verification reveals a blocking defect.

Phase 5A is complete. It refined the global visual foundation and desktop application shell, then made graph evidence and the Context/Policy panels denser and more legible. Intentional system typography, a restrained workspace grid, stronger header/view hierarchy, consistent compact controls and visible keyboard focus preserve the established workflow. The WebMCP browser harness now uses semantic DOM text instead of CSS-rendered text.

Desktop verification passed at 1440×900 and 1920×1080: no horizontal overflow, Checkout LLD runtime coupling evidence and Agent Activity remained visible, and the browser console was clean after reload.

Phase 5B documentation and deployment are complete: `README.md` documents setup, verification, architecture and all seven tools; `docs/DEMO_SCRIPT.md` defines the fixed five-step, sub-three-minute flow; Vercel serves the production build at `https://nivra-psi.vercel.app`.

Production verification passed in both ordinary-browser fallback mode and WebMCP-enabled Chromium. The black-box harness now accepts `NIVRA_WEBMCP_URL` and completed three full Golden repetitions against the public HTTPS deployment.

Phase 4 is feature-complete. Avoid expanding product scope during visual polish.

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
