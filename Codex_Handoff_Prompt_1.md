# Nivra — Codex Handoff Prompt #1

You are starting implementation of **Nivra**, a project for the OpenAI WebMCP Challenge.

I will provide the **Nivra Master Specification v1.1** as the product and architecture source of truth.

Read the full specification before making implementation decisions.

## Important working rule

**Do NOT attempt to build the whole product.**

This task is intentionally limited to:

1. project bootstrap;
2. application structural foundation;
3. core domain model;
4. workspace foundation;
5. Commerce demo fixture skeleton;
6. basic verification/tests.

Do not implement the architecture canvas, WebMCP tools, proposals UI, validation UI, or the final visual design yet.

The goal of this first task is to establish a clean technical foundation that we can review before continuing.

---

# 1. First: inspect the repository

Before changing anything:

- inspect the current repository structure;
- inspect `package.json` if it exists;
- inspect existing configuration;
- identify whether the project is empty or already bootstrapped;
- preserve useful existing setup instead of recreating it unnecessarily.

Briefly report what already exists.

If the repository is empty, initialize the application according to the stack below.

---

# 2. Required technology

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- `@xyflow/react`
- Vitest
- Lucide React

Do not add additional libraries unless there is a concrete need for this phase.

In particular, do not add:

- backend frameworks;
- database libraries;
- authentication;
- API clients;
- graph layout engines;
- component frameworks;
- schema-validation frameworks unless clearly necessary.

Prefer simple TypeScript over extra dependencies.

---

# 3. Application architecture

Maintain strict separation between:

```text
Domain
Workspace
Presentation
WebMCP adapter
Fixtures
```

For this first task we primarily implement:

```text
Domain
Workspace foundation
Fixtures
```

Presentation should only contain enough code to boot the application successfully.

---

# 4. Target source structure

Use this structure as the intended direction:

```text
src/
│
├── app/
│   ├── App.tsx
│   └── bootstrap.ts
│
├── architecture/
│   ├── model/
│   │   ├── architecture.ts
│   │   ├── element.ts
│   │   ├── relation.ts
│   │   ├── contract.ts
│   │   ├── view.ts
│   │   ├── boundary.ts
│   │   ├── constraint.ts
│   │   ├── finding.ts
│   │   ├── proposal.ts
│   │   └── migration.ts
│   │
│   ├── queries/
│   │   └── index.ts
│   │
│   ├── proposals/
│   │   └── index.ts
│   │
│   └── validation/
│       └── index.ts
│
├── workspace/
│   ├── store.ts
│   ├── selectors.ts
│   ├── actions.ts
│   └── persistence.ts
│
├── canvas/
│
├── components/
│
├── webmcp/
│
├── fixtures/
│   └── commerce/
│       ├── architecture.ts
│       ├── views.ts
│       ├── layout.ts
│       └── metadata.ts
│
└── shared/
    ├── ids.ts
    └── utils.ts
```

Do not create empty files purely to satisfy this diagram.

Create directories/files only when they have a useful purpose in this phase.

---

# 5. Critical architectural rule

The **Architecture Model is the source of truth**.

It must not depend on:

- React;
- React Flow;
- Zustand;
- WebMCP;
- localStorage.

The domain layer must be plain TypeScript.

Do not use React Flow types in architecture entities.

Future flow should be:

```text
Architecture Model
      ↓
presentation adapter
      ↓
React Flow
```

but the adapter is **not part of this task yet**.

---

# 6. Domain model

Implement the following concepts cleanly.

## ArchitectureModel

It should contain:

- `id`
- `name`
- `version`
- `elements`
- `relations`
- `contracts`
- `views`
- `boundaries`
- `constraints`
- `findings`
- `proposals`
- `migrationPlans`

Use strongly typed interfaces/types.

---

## ArchitectureElement

Support:

- `id`
- `name`
- `kind`
- `area`
- `level`
- optional `parentId`
- optional `description`
- optional `technology`
- optional `owner`
- optional `deploymentUnit`
- optional metadata

Architecture levels:

```text
system
hld
lld
```

Architecture areas:

```text
frontend
backend
data
infrastructure
external
```

Element kinds should support at minimum:

```text
system
application
microfrontend
service
module
component
api
contract
datastore
queue
state
external-system
infrastructure
```

---

## ArchitectureRelation

Support:

- `id`
- `sourceId`
- `targetId`
- relation `type`
- optional `protocol`
- optional `description`
- optional `contractId`
- optional metadata

Relation types:

```text
depends-on
calls
publishes
subscribes
reads
writes
shares-state
hosts
```

---

## ArchitectureContract

Support:

```text
rest
graphql
event
function
shared-library
snapshot
```

Include:

- id
- name
- type
- providerId
- consumerIds
- optional description
- optional version

---

## ArchitectureView

Support:

```text
application
infrastructure
deployment
data-flow
```

Include:

- id
- name
- type
- architecture level
- optional rootElementId
- elementIds
- relationIds

---

## ArchitectureBoundary

Support:

```text
domain
team
deployment
security
```

---

## ArchitectureConstraint

Implement the constraint model but **do not build the validation engine yet**.

Supported rule types:

```text
forbidden-dependency
independent-deployment
no-cycles
allowed-protocol
```

Use a discriminated union.

---

## ArchitectureFinding

Support:

Severity:

```text
info
warning
error
```

Source:

```text
agent
validator
human
```

Status:

```text
open
resolved
ignored
```

---

## ArchitectureProposal

Use a patch-based representation.

Current Architecture must be conceptually immutable.

Proposal changes must support:

- add elements;
- update elements;
- remove elements;
- add relations;
- update relations;
- remove relations.

Do not implement the proposal engine yet unless a tiny pure helper is necessary for testing types.

---

## MigrationPlan

Implement only the domain types.

No UI and no migration logic.

---

# 7. Stable IDs

Fixture IDs must be human-readable and predictable.

Good:

```text
checkout-mfe
basket-adapter
product-store
product-service
```

Bad:

```text
node-17
entity-a92f
```

This is important because future WebMCP tools and tests will reason using these IDs.

---

# 8. Commerce Platform fixture skeleton

Create:

**Commerce Platform — v1.35**

The fixture should already contain enough real structure to become the foundation for the later Golden Scenario.

Do not fully optimize the demo story yet, but establish the canonical entities.

## HLD elements

At minimum:

```text
app-shell
product-mfe
cart-mfe
checkout-mfe
account-mfe
shared-store
backend-api
product-service
checkout-service
auth-service
commerce-db
```

Add reasonable:

- type/kind;
- architecture area;
- level;
- owner;
- deployment unit;
- short descriptions where useful.

---

# 9. Ownership metadata

Use:

```text
Product MFE       → Catalog Team
Cart MFE          → Cart Team
Checkout MFE      → Checkout Team
Account MFE       → Account Team

Product Service   → Catalog Team
Checkout Service  → Checkout Team
Auth Service      → Platform Team
```

Exact names can be centralized if helpful.

---

# 10. Deployment metadata

Establish at minimum:

```text
product-mfe
deploymentUnit: storefront

cart-mfe
deploymentUnit: storefront

checkout-mfe
deploymentUnit: checkout

shared-store
deploymentUnit: storefront-runtime
```

This difference will later be important for the independent-deployment scenario.

---

# 11. Checkout LLD skeleton

Create child elements under:

```text
checkout-mfe
```

At minimum:

```text
checkout-page
checkout-domain
basket-adapter
pricing-module
payment-module
order-module
checkout-api-client
```

The fixture must support the HLD → LLD hierarchy through `parentId`.

---

# 12. Critical fixture dependencies

Include the two semantically different dependencies that drive the future challenge demo.

### Hidden runtime coupling

```text
Basket Adapter
--shares-state-->
Product Store / Shared Product state
```

### Explicit integration

```text
Pricing Module
--calls REST-->
Product Service
```

These must remain distinguishable in the model.

The fixture should make it possible later to explain:

> shared runtime state is an architectural coupling problem;

while:

> an explicit REST dependency may be acceptable.

Do not preload Findings or Constraints.

Initial fixture state must have:

```text
findings: []
constraints: []
proposals: []
migrationPlans: []
```

The future agent must discover the problem.

---

# 13. Views

Create at least:

```text
commerce-hld
checkout-lld
```

`commerce-hld` should reference only the HLD entities and relations needed for that view.

`checkout-lld` should expose the Checkout internal model and any external elements required to understand its dependencies.

Do not duplicate architecture entities to create separate views.

Views reference the same model.

---

# 14. Fixture history metadata

Store simple product history metadata somewhere appropriate:

```text
v1.20 — Checkout extracted from monolith
v1.28 — Checkout deployment separated
v1.31 — Pricing moved to Product API
v1.35 — Current production architecture
```

This is contextual fixture information.

Do not build a revision engine.

---

# 15. Layout fixture

Create a separate layout representation for future React Flow positions.

Important:

**layout positions must not live inside ArchitectureElement.**

Example conceptual type:

```typescript
interface ElementLayout {
  elementId: string;
  x: number;
  y: number;
}
```

You may add initial HLD/LLD coordinates now if useful.

Do not implement React Flow rendering yet.

---

# 16. Workspace foundation

Create a minimal Zustand workspace store.

It should be capable of holding at minimum:

```text
architecture
activeViewId
activeMode
activeProposalId
selectedElementIds
selectedRelationIds
validationResult
agentActivity
webMcpStatus
```

Modes:

```text
current
proposal
```

WebMCP statuses:

```text
checking
ready
unavailable
```

Do not implement WebMCP registration.

---

# 17. Workspace actions

Only implement simple actions that already make architectural sense.

Examples:

```text
setActiveView
selectElements
selectRelations
resetWorkspace
```

Do not implement future behaviour speculatively.

Avoid adding dozens of actions before they are needed.

---

# 18. Persistence

Persistence is not the priority of this task.

You may provide a small abstraction or placeholder module, but do not spend significant time on localStorage behaviour yet.

The project should work correctly without persistence.

---

# 19. Minimal application UI

The app only needs enough UI to confirm that everything boots.

For example:

```text
Nivra
Commerce Platform · v1.35

Foundation ready.
Active view: Commerce HLD
Elements: X
Relations: Y
```

Do not design the real workspace yet.

Do not build:

- navigation sidebar;
- architecture canvas;
- Context Panel;
- proposal UI;
- Findings UI;
- Constraints UI;
- Agent Activity UI.

Those come later.

---

# 20. Tests

Add focused unit tests for the foundation.

At minimum verify:

### Fixture integrity

- every relation source exists;
- every relation target exists;
- every view references existing elements;
- every view references existing relations;
- every LLD child has a valid parent;
- IDs are unique.

### Checkout hierarchy

Verify that Checkout LLD children resolve correctly.

### Critical relations

Verify fixture contains:

```text
basket-adapter → product state
```

as `shares-state`.

Verify:

```text
pricing-module → product-service
```

as `calls` with REST protocol.

Do not write huge test suites.

We want protection around the domain model and fixture integrity.

---

# 21. Code quality

Prefer:

- explicit TypeScript types;
- small pure modules;
- readable names;
- predictable data structures.

Avoid:

- clever generic abstractions;
- unnecessary class hierarchies;
- premature factories;
- dependency injection frameworks;
- abstract repositories;
- enterprise boilerplate.

This is a Challenge product with a short timeline.

Simple and structurally sound beats over-engineered.

---

# 22. Important non-goals for this task

DO NOT implement:

- React Flow canvas;
- visual architecture nodes;
- graph edges;
- HLD → LLD animation;
- Findings UI;
- Constraints UI;
- Current/Proposal UI;
- proposal diff;
- validation engine;
- WebMCP;
- Agent Activity;
- migration plans;
- GitHub integration;
- backend;
- database;
- authentication;
- automatic architecture generation;
- infrastructure imports;
- landing page.

If something is not required to establish the foundation, leave it for the next task.

---

# 23. Completion criteria

This task is complete when:

1. The project installs and starts successfully.
2. TypeScript passes.
3. Tests pass.
4. Architecture domain types are independent of React/React Flow.
5. Commerce Platform v1.35 fixture exists.
6. HLD and Checkout LLD share the same Architecture Model.
7. Critical hidden coupling is represented semantically.
8. Basic Zustand workspace initializes from the fixture.
9. Minimal UI confirms the application loaded.
10. No unnecessary future features were implemented.

---

# 24. Before finishing

Run the appropriate commands for:

- type checking;
- tests;
- build.

Fix errors before considering the task complete.

---

# 25. Final response

When finished, do not simply say “done”.

Give me:

### What you changed

Concise summary.

### Architecture decisions

Any decisions you made that were not explicitly dictated by the specification.

### Files created/changed

High-level list.

### Verification

Commands run and whether they passed.

### Open questions

Anything ambiguous that should be decided before Phase 2.

### Scope check

Explicitly confirm that you did **not** proceed into canvas/WebMCP/final UI implementation.

Then stop.

Do not start Phase 2 until I review this implementation.