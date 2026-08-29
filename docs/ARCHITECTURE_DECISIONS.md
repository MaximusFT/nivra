# Nivra — Architecture Decisions

> Record decisions here when they are not directly dictated by the Master Specification.  
> Keep entries concise and do not rewrite historical decisions; mark them superseded when necessary.

## D-001 — One Architecture Model for all views

Status: accepted
Date: 2026-08-28

Commerce HLD and Checkout LLD reference the same elements and relations. Views contain IDs only and never duplicate entities.

Reason: the shared structured model is Nivra's core product invariant.

## D-002 — Product Store is an LLD child of Shared Store

Status: accepted
Date: 2026-08-28

`product-store` represents Product-domain runtime state and has `parentId: "shared-store"`.

Reason: the Golden Scenario needs a precise LLD evidence target while preserving `shared-store` as the HLD runtime-state concept.

Phase 2B review result: the hierarchy is visually understandable when `product-store` appears as the precise external state dependency in Checkout LLD.

## D-003 — Hidden Checkout coupling is revealed at LLD

Status: accepted
Date: 2026-08-28

The HLD does not expose a direct Checkout → Shared Store relation. The actual `basket-adapter -> product-store` `shares-state` relation appears in Checkout LLD.

Reason: this preserves the intended demo narrative: Checkout looks independently deployable at HLD, then deeper inspection reveals runtime coupling.

## D-004 — Protocol is currently a display-friendly string

Status: accepted
Date: 2026-08-28

Relations currently store `protocol: "REST"` while contract types use the normalized value `rest`.

Reason: the domain specification defines relation protocol as an unrestricted optional string and contract type as a union.

Phase 3B resolution: validation normalizes protocol values case-insensitively while relations preserve display-friendly labels such as `REST`.

## D-005 — Layout belongs to the fixture presentation boundary

Status: accepted  
Date: 2026-08-28

Coordinates live in `src/fixtures/commerce/layout.ts`, never in `ArchitectureElement`.

Reason: layout is deterministic visual metadata, not architecture semantics.

## D-006 — Validation result shape is deferred

Status: superseded by D-014
Date: 2026-08-28

Phase 1 temporarily held `validationResult?: unknown` because it was explicitly prohibited from designing the validation engine. Phase 3B replaced it with the concrete `ValidationResult` defined by D-014.

## D-007 — Workspace reset reuses the canonical immutable fixture

Status: accepted for Phase 1  
Date: 2026-08-28

The initial store and reset action reference `commerceArchitecture` directly. Existing actions only replace workspace fields and do not mutate architecture arrays.

Review point: when write actions arrive, protect the canonical fixture through immutable updates or a deliberate clone/factory boundary.

## D-008 — Object-returning Zustand selectors require stable comparison

Status: accepted  
Date: 2026-08-28

Selectors that return newly allocated objects must be consumed with `useShallow`, split into primitive selectors or otherwise stabilized.

Reason: an unstable `getSnapshot` caused React's maximum update depth error during the Phase 1 browser smoke test.

## D-009 — React Flow is isolated behind canvas adapters

Status: accepted
Date: 2026-08-28

`src/canvas/adapters` is the only mapping boundary between Architecture Model/view/layout data and React Flow nodes or edges. The adapters filter by active view, attach visual positions and add presentation metadata.

Reason: the domain and fixtures must remain usable by validation and WebMCP without importing React Flow concepts.

## D-010 — View root provides context without requiring a canvas node

Status: accepted
Date: 2026-08-28

`checkout-lld.rootElementId` remains `checkout-mfe`, but `checkout-mfe` is not included in the view's visible `elementIds`.

Reason: the root establishes hierarchy and breadcrumb context. Rendering it as an unconnected node would add noise to the internal dependency view.

## D-011 — Selection focus uses one-hop architectural evidence

Status: accepted
Date: 2026-08-28

Selecting a relation focuses its two endpoints. Selecting an element focuses that element, its directly connected visible elements and the connecting relations. Unrelated nodes and edges are dimmed.

Reason: one-hop focus makes evidence legible without implying broader transitive impact analysis, which belongs to later reasoning features.

## D-012 — Workspace Findings are immutable and idempotent by ID

Status: accepted
Date: 2026-08-28

Adding a Finding creates a new Architecture Model value and replaces any existing Finding with the same ID.

Reason: future WebMCP retries must not duplicate the same observation, and the canonical fixture must remain untouched.

## D-013 — Finding focus resolves the first view containing all evidence

Status: accepted
Date: 2026-08-28

When a Finding is opened, the workspace selects its element/relation evidence and activates the first architecture view containing all referenced IDs. If no matching view exists, the current view remains active.

Reason: Findings must restore visible evidence deterministically without storing presentation-only view state inside the domain entity.

## D-014 — Validation is pure, typed and evidence-bearing

Status: accepted
Date: 2026-08-28

Validation returns one typed check per explicit constraint, an aggregate pass/fail summary and element/relation evidence IDs. Validation never creates Findings and never depends on workspace or presentation code.

Rule semantics for Challenge V1:

- forbidden dependencies include relations from source descendants to target descendants;
- independent deployment fails when shared runtime state crosses the element family's deployment boundary;
- LLD elements inherit deployment units through `parentId`;
- cycle detection operates over the complete directed relation graph;
- allowed protocol comparison is case-insensitive.

Reason: the LLM may explain results, but deterministic application code must decide whether Current or Proposal satisfies human policy.

## D-015 — Effective proposal views are derived from the patch

Status: accepted
Date: 2026-08-28

`applyProposal` updates elements and relations, then derives effective view membership without extending the proposal patch format. Added children of a view root become visible, added relations become visible when both endpoints are visible, and disconnected external evidence nodes are pruned from the effective LLD view.

Reason: proposals remain architecture patches rather than presentation patches, while the visual workspace still shows the effective alternative deterministically.

## D-016 — Current Architecture remains stored and proposal mode is derived

Status: accepted
Date: 2026-08-28

The Zustand store always retains Current Architecture as its canonical `architecture`. Proposal mode derives an effective architecture with `applyProposal`; switching back to Current reveals the original relation unchanged.

Reason: Current must never appear silently overwritten, and deterministic validation must be able to evaluate both states independently.

## D-017 — Persistence stores durable decisions, not transient workspace state

Status: accepted
Date: 2026-08-28

The versioned localStorage payload contains constraints, findings, proposals, active proposal ID and active mode. Selection/focus, validation result, active WebMCP state and agent activity are reconstructed or cleared.

Canonical empty Current state removes the persistence key instead of writing an empty payload. Invalid JSON, obsolete versions and structurally invalid arrays fall back to the canonical fixture.

Reason: persisted state should preserve human decisions and alternatives without making a stale visual/debug session part of the Architecture Model.

## D-018 — WebMCP is a browser adapter over shared operations

Status: accepted
Date: 2026-08-28

Nivra registers tools through the canonical `document.modelContext` API and keeps a guarded `navigator.modelContext` fallback for earlier preview runtimes. Registration uses an `AbortSignal`, and all browser-specific code lives under `src/webmcp`.

Tool handlers read the effective Current/Proposal architecture through workspace selectors and invoke the same Zustand actions used by the human interface. They never import React or React Flow, and no WebMCP type enters the architecture domain.

Reason: external agents and humans must operate on one shared workspace without coupling the source-of-truth model to an experimental browser API.

## D-019 — WebMCP reads expose semantics and activity remains transient

Status: accepted
Date: 2026-08-28

`get_architecture` returns the active effective model's semantic entities, views, boundaries, constraints and findings, plus current workspace mode/view identifiers. It deliberately excludes proposal catalogs, migration plans and canvas layout positions from this read response.

Every tool invocation upserts one transient activity entry from `running` to `success` or `error`. Activity is capped at 20 entries, is visible in the workspace footer and is cleared by Reset Demo without changing the detected WebMCP availability for the current page.

Reason: agents receive relevant structured truth without presentation metadata, while humans can see and debug agent participation without persisting stale execution state.

## D-020 — WebMCP writes use schema plus semantic boundary validation

Status: accepted
Date: 2026-08-28

Every write tool publishes a closed JSON Schema and then independently parses the received value before invoking a workspace action. The parser fixes agent-owned fields (`source: "agent"`, `status: "open"`, `createdBy: "agent"`) and rejects unknown fields, unstable IDs, invalid enums, missing evidence/rule references and structurally invalid proposal patches.

Proposal validation additionally checks the exact Current base version, duplicate/conflicting IDs, added/updated parent references, and effective relation endpoints. Only a fully parsed `ArchitectureProposal` reaches `createProposal`; the workspace continues to store Current and derives Proposal mode separately.

Reason: browser schema validation improves tool calling, but application invariants must still hold when handlers are retried, tested directly or invoked by runtimes with differing schema enforcement.

## D-021 — Checkpoint C uses a browser-owned black-box harness

Status: accepted
Date: 2026-08-28

`scripts/test-webmcp.mjs` launches an isolated Vite server and temporary Chromium profile with `WebMCP` enabled, discovers the registered tools and invokes them only through the browser's `ModelContext.executeTool()` testing extension. It does not import the Zustand store or tool handlers.

The default reliability gate is three complete repetitions from Reset Demo. Each run includes deliberate stable-ID retries, DOM focus/activity assertions, deterministic Current/Proposal validation, and a final semantic read proving Current was not overwritten. The harness uses free localhost ports, supports `NIVRA_CHROME_PATH`, owns process shutdown and removes its temporary profile.

Reason: unit tests protect handlers and invariants, but Checkpoint C requires black-box proof that registration, browser transport, workspace actions and visible React state work together.

## D-022 — Initial production deployment uses the Vercel CLI

Status: superseded by D-023 for routine releases
Date: 2026-08-29

The production application was initially deployed to `https://nivra-psi.vercel.app` under the `maximusfts-projects/nivra` Vercel project using Vercel's detected Vite defaults and an explicit CLI release.

The WebMCP harness accepts `NIVRA_WEBMCP_URL` for black-box verification of a deployed target. Three complete Golden repetitions passed against the production HTTPS URL after deployment.

Reason: the first explicit release provided repeatable proof that the published artifact, not only local Vite, supports the full agent workflow.

## D-023 — Pushes to `main` automatically deploy to Vercel production

Status: accepted
Date: 2026-08-29

The Vercel project is connected to the private `MaximusFT/nivra` GitHub repository through the Vercel GitHub App. App access is limited to this repository. Every push to `main` triggers a production build and release; pull requests and other branches may create preview deployments. The explicit Vercel CLI flow remains a recovery path.

The connection was verified with commit `d92cdbb`: Vercel built it automatically, marked the production deployment Ready in 5 seconds and updated the stable alias. HTTP and three full WebMCP repetitions passed against the updated production URL.

Reason: development computers only need GitHub access. Vercel performs the build and release remotely, so work can continue from machines where direct Vercel access is restricted.

## D-024 — Demo navigation follows evidence before action

Status: accepted
Date: 2026-08-29

Selecting an architecture element always opens its own Context. Elements that own a deeper view expose an explicit contextual drill-down; clicking a node never navigates implicitly. Inspection identifies the demo architecture snapshot as its source, and relation evidence includes protocol, contract and inherited deployment-boundary information.

Policy remains scoped to the Checkout isolation review but shows a safe contextual state when an unrelated element is selected. The Proposal action is hidden until Current validation fails, after which the failed result explains the blocking issue and presents one recommended action. Agent Activity displays real tool calls in sequence with both human-readable labels and exact WebMCP tool names; no artificial delay is introduced.

Reason: the challenge application must remain understandable when explored after the video, while preserving the emotional flow from apparently independent HLD to hidden LLD evidence, human policy, minimal Proposal and deterministic verification.

## D-025 — Standalone demo simulation is explicit and action-backed

Status: accepted
Date: 2026-08-29

When no external WebMCP client is available, the workspace may stage a guided agent demo. Each timeline entry is explicitly labeled `Demo simulation`, uses the same tool name as the corresponding WebMCP operation and invokes the existing workspace actions. Short presentation pacing makes transitions readable but does not claim model latency. The simulation stops after recording evidence so the human still owns policy and remediation decisions.

The compact activity footer shows only the two latest operations. A dismissible history drawer exposes up to 50 newest-first operations, preserving transparency without allowing a long session to crowd the architecture canvas.

Proposal mode overlays presentation-only ghosts for removed evidence while the effective Architecture Model remains unchanged. After deterministic validation succeeds, the UI derives a copyable implementation brief without claiming a live Jira integration or mutating Current Architecture.

Reason: standalone judges need to understand the complete product flow without mistaking scripted presentation for a connected AI service, and visual comparison must remain separate from architecture semantics.

## D-026 — Verified proposals become architecture branches

Status: accepted
Date: 2026-08-29

Only an active Proposal with a passing deterministic validation result can be saved as an architecture branch. The branch stores a durable reference to the immutable Proposal patch rather than copying or replacing Current Architecture. Before save, Current/Proposal controls and the parallel visual diff support review. After save, a branch selector switches between `current/commerce-1.35` and the clean effective `proposal/checkout-isolation` architecture without diff markers.

Architecture branches are explicitly not Git branches. A future delivery connector may associate them with source-control branches, ADRs or work-management items, but Challenge V1 does not claim that integration.

Reason: a verified alternative needs a durable review state and a clear demo conclusion, while preserving Current Architecture and existing WebMCP contracts.

## Open decisions before their implementation phases

- Phase 2B: visual treatment for `shares-state` versus explicit protocols.
- Phase 3B: exact `ValidationResult` and per-rule result schema.
- Phase 3C: immutable fixture clone/factory strategy for write operations and reset.
