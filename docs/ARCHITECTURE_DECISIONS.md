# Nivra — Architecture Decisions

> Record decisions here when they are not directly dictated by the Master Specification.  
> Keep entries concise and do not rewrite historical decisions; mark them superseded when necessary.

## D-001 — One Architecture Model for all views

Status: accepted  
Date: 2026-08-28

Commerce HLD and Checkout LLD reference the same elements and relations. Views contain IDs only and never duplicate entities.

Reason: the shared structured model is Nivra's core product invariant.

## D-002 — Product Store is an LLD child of Shared Store

Status: accepted pending visual review  
Date: 2026-08-28

`product-store` represents Product-domain runtime state and has `parentId: "shared-store"`.

Reason: the Golden Scenario needs a precise LLD evidence target while preserving `shared-store` as the HLD runtime-state concept.

Review point: confirm during Phase 2B that this hierarchy is visually understandable. If it creates ambiguity, revisit the naming or presentation without duplicating model entities.

## D-003 — Hidden Checkout coupling is revealed at LLD

Status: accepted  
Date: 2026-08-28

The HLD does not expose a direct Checkout → Shared Store relation. The actual `basket-adapter -> product-store` `shares-state` relation appears in Checkout LLD.

Reason: this preserves the intended demo narrative: Checkout looks independently deployable at HLD, then deeper inspection reveals runtime coupling.

## D-004 — Protocol is currently a display-friendly string

Status: provisional  
Date: 2026-08-28

Relations currently store `protocol: "REST"` while contract types use the normalized value `rest`.

Reason: the domain specification defines relation protocol as an unrestricted optional string and contract type as a union.

Review point: before validation/WebMCP, decide whether protocol comparisons normalize case internally while preserving display labels.

## D-005 — Layout belongs to the fixture presentation boundary

Status: accepted  
Date: 2026-08-28

Coordinates live in `src/fixtures/commerce/layout.ts`, never in `ArchitectureElement`.

Reason: layout is deterministic visual metadata, not architecture semantics.

## D-006 — Validation result shape is deferred

Status: provisional  
Date: 2026-08-28

The workspace currently holds `validationResult?: unknown`.

Reason: Phase 1 needed the workspace slot but was explicitly prohibited from designing the validation engine. Replace this with the concrete validation result type in Phase 3B.

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

## Open decisions before their implementation phases

- Phase 2B: visual treatment for `shares-state` versus explicit protocols.
- Phase 3B: exact `ValidationResult` and per-rule result schema.
- Phase 3C: immutable fixture clone/factory strategy for write operations and reset.
- Phase 4: WebMCP runtime API shape and supported input-validation boundary.
- Phase 5: final deployment URL and license approval.

