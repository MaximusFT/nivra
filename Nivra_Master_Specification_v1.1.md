# Nivra — Master Specification v1.1

> **Status:** Challenge MVP specification  
> **Product name:** Nivra  
> **Target:** OpenAI WebMCP Challenge  
> **Architecture:** Client-side React application  
> **Primary objective:** Deliver one polished, deterministic human-agent architecture workflow that is clearly stronger because of WebMCP.

---

# 1. Product Definition

## 1.1 One-line description

**Nivra is a shared visual architecture workspace where humans and AI agents explore, understand, modify, and verify the same structured software architecture together.**

Core idea:

> **Architecture is the shared context.**

The human sees architecture visually.

The agent sees the same architecture as structured data and interacts with it through WebMCP tools.

---

# 2. Core Problem

AI can already discuss software architecture in text.

The problem is that the AI and the engineer usually do not operate inside the same architectural workspace.

Typical workflow:

1. Architect explains a system to AI.
2. AI responds in text.
3. Architect manually maps the answer back to diagrams.
4. Architecture changes.
5. Conversation and diagrams drift apart.
6. Important assumptions remain hidden across different abstraction levels.

Nivra removes this disconnect.

The diagram is not just an image.

It is a visual representation of a structured:

**Architecture Model**

shared between the human and the agent.

---

# 3. Core Product Loop

Nivra is primarily a **reasoning workspace**, not an architecture validator.

The core workflow is:

## Understand

The agent reads structured architecture.

## Explore

Human and agent move through different views and levels of abstraction.

## Decide

The human establishes architectural constraints and acceptable trade-offs.

## Explore Alternatives

The agent creates a proposal without overwriting the current architecture.

## Verify

Nivra deterministically checks the proposal where machine-readable rules exist.

Validation is therefore the **last part of the reasoning loop**, not the product itself.

---

# 4. Product Philosophy

Nivra must not replace the architect.

The primary interaction is not:

> Design my architecture for me.

It is:

> Help me reason about this architecture.

The human remains responsible for:

- business requirements;
- technical constraints;
- architectural policy;
- trade-offs;
- accepting or rejecting proposals.

The agent helps:

- inspect dependencies;
- reveal hidden coupling;
- reason across abstraction levels;
- identify risks;
- navigate the architecture;
- propose alternatives;
- explain consequences.

Nivra helps verify explicit rules where possible.

---

# 5. Primary User

Challenge V1 targets:

**Software Architect / Staff Engineer / Tech Lead**

Typical questions:

- What prevents this component from being independently deployable?
- Where is coupling stronger than the HLD suggests?
- Why do you consider these systems coupled?
- What will break if we extract Checkout?
- Which dependency is actually dangerous?
- What is the smallest change that solves the problem?
- Does this proposal satisfy the constraints we agreed on?
- How can we migrate incrementally?

---

# 6. Future Audience

The same Architecture Model may later support other stakeholders.

### Architect View

- systems;
- dependencies;
- protocols;
- constraints;
- findings.

### Engineering View

- modules;
- APIs;
- runtime dependencies;
- implementation boundaries.

### Product / Management View

- business domains;
- teams;
- risks;
- planned changes;
- migration state.

A future Product Owner could inspect the same system without seeing implementation-level noise.

This is not part of Challenge V1.

---

# 7. Architecture Levels

Nivra supports multiple levels of one Architecture Model.

## 7.1 HLD — High-Level Design

Examples:

- applications;
- app shells;
- microfrontends;
- services;
- APIs;
- shared state;
- databases;
- external systems.

Used to reason about:

- system topology;
- ownership;
- deployment boundaries;
- major dependencies.

---

## 7.2 LLD — Low-Level Design

LLD exposes the internal structure of an HLD element.

Example:

```text
Checkout MFE
│
├── Checkout Page
├── Checkout Domain
├── Basket Adapter
├── Pricing Module
├── Payment Module
├── Order Module
└── Checkout API Client
```

Frontend LLD may later contain:

- routes;
- modules;
- React components;
- state stores;
- API clients;
- domain modules.

Backend LLD may contain:

- services;
- bounded contexts;
- repositories;
- events;
- consumers;
- contracts.

---

# 8. Infrastructure Views

Infrastructure is not another LLD level.

It is another view of the same model.

Future views may include:

- Application Architecture;
- Infrastructure;
- Deployment;
- Data Flow.

Challenge V1 implements only:

- Commerce HLD;
- Checkout LLD.

---

# 9. Challenge Story

The Challenge demo uses one believable Commerce system.

Central pain:

> **A separate box on a diagram does not mean an independent system.**

The team believes Checkout is independent because it is already a separate microfrontend.

The agent notices that this assumption may be false.

The architect challenges the conclusion:

> Checkout is already a separate microfrontend. Why do you still consider it coupled?

The agent drills into Checkout LLD.

Nivra reveals:

```text
Basket Adapter
      ↓ shares state
Product Store
```

and, separately:

```text
Pricing Module
      ↓ REST
Product API
```

The human decides:

- shared Product runtime state is unacceptable;
- explicit Product API dependency is acceptable;
- Checkout must remain independently deployable.

The agent creates the smallest architecture proposal satisfying those decisions.

Nivra verifies the result.

---

# 10. Emotional Demo Flow

```text
Looks independent.
↓
Something may be wrong.
↓
Show me why.
↓
Hidden coupling appears.
↓
Human chooses the trade-off.
↓
Turn the decision into a rule.
↓
Create the smallest proposal.
↓
Verify it.
```

This is the primary Challenge narrative.

---

# 11. Architecture Model

The Architecture Model is the source of truth.

React Flow is only its visual representation.

```typescript
interface ArchitectureModel {
  id: string;
  name: string;
  version: number;

  elements: ArchitectureElement[];
  relations: ArchitectureRelation[];

  views: ArchitectureView[];
  boundaries: ArchitectureBoundary[];

  constraints: ArchitectureConstraint[];
  findings: ArchitectureFinding[];

  proposals: ArchitectureProposal[];
  migrationPlans: MigrationPlan[];
}
```

---

# 12. Architecture Element

```typescript
interface ArchitectureElement {
  id: string;
  name: string;

  kind: ArchitectureElementKind;
  area: ArchitectureArea;
  level: ArchitectureLevel;

  parentId?: string;

  description?: string;
  technology?: string;
  owner?: string;
  deploymentUnit?: string;

  metadata?: Record<string, unknown>;
}
```

---

# 13. Architecture Level

```typescript
type ArchitectureLevel =
  | "system"
  | "hld"
  | "lld";
```

---

# 14. Architecture Area

```typescript
type ArchitectureArea =
  | "frontend"
  | "backend"
  | "data"
  | "infrastructure"
  | "external";
```

Frontend and backend use the same underlying domain model.

---

# 15. Element Kinds

```typescript
type ArchitectureElementKind =
  | "system"
  | "application"
  | "microfrontend"
  | "service"
  | "module"
  | "component"
  | "api"
  | "contract"
  | "datastore"
  | "queue"
  | "state"
  | "external-system"
  | "infrastructure";
```

Challenge V1 deliberately keeps this list small.

---

# 16. Hierarchy

HLD → LLD is represented through `parentId`.

Example:

```text
checkout-mfe
  ├── checkout-page
  ├── checkout-domain
  ├── basket-adapter
  ├── pricing-module
  └── payment-module
```

This allows the agent to reason over hierarchical architecture rather than unrelated diagrams.

---

# 17. Architecture Relation

```typescript
interface ArchitectureRelation {
  id: string;

  sourceId: string;
  targetId: string;

  type: ArchitectureRelationType;

  protocol?: string;
  description?: string;

  contractId?: string;

  metadata?: Record<string, unknown>;
}
```

---

# 18. Relation Types

```typescript
type ArchitectureRelationType =
  | "depends-on"
  | "calls"
  | "publishes"
  | "subscribes"
  | "reads"
  | "writes"
  | "shares-state"
  | "hosts";
```

Relation semantics matter more than the visual arrow.

For example:

```text
Checkout --shares-state--> Product Store
```

is fundamentally different from:

```text
Checkout --calls REST--> Product API
```

---

# 19. Architecture Contracts

```typescript
interface ArchitectureContract {
  id: string;

  name: string;

  type:
    | "rest"
    | "graphql"
    | "event"
    | "function"
    | "shared-library"
    | "snapshot";

  providerId: string;
  consumerIds: string[];

  description?: string;
  version?: string;
}
```

Challenge V1 uses contracts mainly as architecture semantics.

No API designer is required.

---

# 20. Architecture Views

```typescript
interface ArchitectureView {
  id: string;

  name: string;

  type:
    | "application"
    | "infrastructure"
    | "deployment"
    | "data-flow";

  level: ArchitectureLevel;

  rootElementId?: string;

  elementIds: string[];
  relationIds: string[];
}
```

Challenge fixtures:

```text
commerce-hld
checkout-lld
```

---

# 21. Boundaries

```typescript
interface ArchitectureBoundary {
  id: string;

  name: string;

  type:
    | "domain"
    | "team"
    | "deployment"
    | "security";

  elementIds: string[];
}
```

Future uses include:

- team ownership;
- deployment boundaries;
- security boundaries;
- business domains.

---

# 22. Constraints

Constraints represent architectural decisions.

```typescript
interface ArchitectureConstraint {
  id: string;

  name: string;
  description: string;

  severity:
    | "info"
    | "warning"
    | "error";

  rule: ConstraintRule;
}
```

Challenge V1:

```typescript
type ConstraintRule =
  | {
      type: "forbidden-dependency";
      sourceId: string;
      targetId: string;
    }
  | {
      type: "independent-deployment";
      elementId: string;
    }
  | {
      type: "no-cycles";
    }
  | {
      type: "allowed-protocol";
      sourceId: string;
      targetId: string;
      protocols: string[];
    };
```

---

# 23. Findings

```typescript
interface ArchitectureFinding {
  id: string;

  title: string;
  description: string;

  severity:
    | "info"
    | "warning"
    | "error";

  source:
    | "agent"
    | "validator"
    | "human";

  elementIds?: string[];
  relationIds?: string[];

  status:
    | "open"
    | "resolved"
    | "ignored";
}
```

A Finding is an observation.

It is not automatically a violation.

---

# 24. Proposals

The agent must not silently overwrite Current Architecture.

```typescript
interface ArchitectureProposal {
  id: string;

  name: string;
  description?: string;

  baseVersion: number;

  changes: ProposalChanges;

  createdBy:
    | "agent"
    | "human";
}
```

---

# 25. Proposal Changes

```typescript
interface ProposalChanges {
  addElements: ArchitectureElement[];

  updateElements: Array<{
    id: string;
    changes: Partial<ArchitectureElement>;
  }>;

  removeElementIds: string[];

  addRelations: ArchitectureRelation[];

  updateRelations: Array<{
    id: string;
    changes: Partial<ArchitectureRelation>;
  }>;

  removeRelationIds: string[];
}
```

Challenge V1 implements only:

```text
Current
Proposal
```

No full branch engine.

---

# 26. Future Versioning

Future conceptual model:

```text
Commerce Platform v1.35
│
├── Current
├── checkout-isolation
├── kafka-migration
└── auth-platform
```

Potential future features:

- branches;
- revisions;
- diffs;
- architecture history;
- merge;
- comparison;
- presentation views.

Not part of Challenge V1.

---

# 27. Migration Plans

```typescript
interface MigrationPlan {
  id: string;
  name: string;
  steps: MigrationStep[];
}
```

```typescript
interface MigrationStep {
  id: string;

  order: number;

  title: string;
  description: string;

  affectedElementIds: string[];
}
```

Migration Plan is P2.

---

# 28. WebMCP Principle

Nivra does not embed an AI chatbot as its primary interface.

Instead:

```text
Human
   ↕
Nivra Visual Workspace
   ↕
Architecture Model
   ↕
WebMCP Tools
   ↕
External AI Agent
```

The agent participates inside the human's existing architecture workspace.

---

# 29. Why WebMCP Matters

Without WebMCP:

```text
Architecture Tool
+
Separate AI chat
```

The two contexts easily diverge.

With WebMCP:

```text
Agent reads real architecture state
↓
Agent navigates real views
↓
Agent changes visible workspace state
↓
Human reacts to those changes
↓
Agent continues from the same context
```

This shared-state interaction is the primary Challenge differentiator.

---

# 30. WebMCP Tool Set

## P0

- `get_architecture`
- `inspect_element`
- `show_architecture_view`
- `annotate_architecture`
- `add_constraint`
- `create_proposal`
- `validate_architecture`

## P2

- `create_migration_plan`

---

# 31. get_architecture

**READ**

Returns structured architecture:

- elements;
- relations;
- ownership;
- deployment metadata;
- boundaries;
- constraints;
- findings.

No React positions or purely visual metadata.

---

# 32. inspect_element

**READ**

Returns:

- element;
- children;
- incoming relations;
- outgoing relations;
- constraints;
- findings.

Critical workflow:

```text
Checkout HLD
↓
inspect_element
↓
Checkout internals
```

---

# 33. show_architecture_view

**UI / NAVIGATION**

Changes shared visual context.

Example:

```text
Commerce HLD
↓
Checkout LLD
```

Can focus:

- elements;
- relations.

This is a primary demo moment.

---

# 34. annotate_architecture

**WRITE**

Creates architecture findings.

UI may show:

- badges;
- highlighted nodes;
- highlighted relations;
- finding cards.

---

# 35. add_constraint

**WRITE**

Turns a human architectural decision into an explicit rule.

Example:

> Checkout must not depend on Product runtime state.

The rule becomes persistent architecture state.

---

# 36. create_proposal

**WRITE**

Creates an alternative architecture.

Current Architecture remains untouched.

---

# 37. validate_architecture

**READ / COMPUTE**

Nivra performs deterministic validation.

The LLM may explain results.

The LLM does not decide whether its own proposal passes.

---

# 38. create_migration_plan

**WRITE**

Optional.

Creates incremental steps from Current to Proposal.

---

# 39. Agent Activity

Every WebMCP tool call creates an activity entry.

```typescript
interface AgentActivityEntry {
  id: string;

  timestamp: number;

  tool: string;
  description: string;

  status:
    | "running"
    | "success"
    | "error";
}
```

Example:

```text
13:42  get_architecture
       Commerce HLD

13:43  inspect_element
       Checkout

13:43  show_architecture_view
       Checkout LLD
```

Purpose:

- transparency;
- debugging;
- visible WebMCP evidence.

---

# 40. Workspace State

```typescript
interface WorkspaceState {
  architecture: ArchitectureModel;

  activeViewId: string;

  activeMode:
    | "current"
    | "proposal";

  activeProposalId?: string;

  selectedElementIds: string[];
  selectedRelationIds: string[];

  validationResult?: ValidationResult;

  agentActivity: AgentActivityEntry[];

  webMcpStatus:
    | "checking"
    | "ready"
    | "unavailable";
}
```

---

# 41. Technology Stack

```text
React
TypeScript
Vite
```

Canvas:

```text
@xyflow/react
```

State:

```text
Zustand
```

Styling:

```text
Tailwind CSS
```

Icons:

```text
Lucide React
```

Tests:

```text
Vitest
```

---

# 42. Client-Side Architecture

```text
Browser
   │
   ├── React UI
   ├── Zustand Workspace
   ├── Architecture Domain
   ├── Validation Engine
   ├── WebMCP Adapter
   └── localStorage
```

No:

- backend;
- authentication;
- remote database;
- Railway;
- Turso.

---

# 43. Source of Truth

**Architecture Model is the source of truth.**

React Flow is only the renderer.

```text
Architecture Model
       ↓
React Flow Adapter
       ↓
Canvas
```

---

# 44. React Flow Adapters

```typescript
toFlowNodes(
  architecture,
  view,
  uiState
)
```

```typescript
toFlowEdges(
  architecture,
  view,
  uiState
)
```

React Flow-specific types must not leak into the domain layer.

---

# 45. Layout

Challenge fixture positions are predefined.

No automatic graph layout engine is required.

Reason:

- deterministic demo;
- predictable screenshots;
- reduced implementation risk.

---

# 46. Project Structure

```text
src/
│
├── app/
│
├── architecture/
│   ├── model/
│   ├── queries/
│   ├── proposals/
│   └── validation/
│
├── workspace/
│
├── canvas/
│   ├── adapters/
│   ├── nodes/
│   └── edges/
│
├── components/
│
├── webmcp/
│   ├── registerTools.ts
│   ├── availability.ts
│   ├── activityLogger.ts
│   └── tools/
│
├── fixtures/
│   └── commerce/
│
└── shared/
```

---

# 47. Separation of Concerns

## Domain

Knows nothing about:

- React;
- React Flow;
- WebMCP;
- localStorage.

## Workspace

Owns current application state.

## Presentation

Renders workspace.

## WebMCP Adapter

Maps external agent capabilities onto domain queries and workspace actions.

---

# 48. Query Layer

Reusable functions include:

```text
getArchitectureSnapshot
inspectElement
getDescendants
findIncomingRelations
findOutgoingRelations
getConstraintsForElement
```

---

# 49. Workspace Actions

```text
showArchitectureView
addFindings
addConstraint
createProposal
setValidationResult
resetDemo
```

WebMCP handlers invoke these actions.

React updates through Zustand.

---

# 50. Effective Architecture

Current:

```text
architecture
```

Proposal:

```text
Current Architecture
+
Proposal Changes
↓
Effective Architecture
```

Function:

```typescript
applyProposal(
  architecture,
  proposal
)
```

Current remains immutable.

---

# 51. Proposal Diff

```typescript
interface ProposalDiff {
  addedElements: string[];
  updatedElements: string[];
  removedElements: string[];

  addedRelations: string[];
  updatedRelations: string[];
  removedRelations: string[];
}
```

UI:

```text
+ Added
~ Changed
- Removed
```

---

# 52. Validation Engine

Pure TypeScript.

```typescript
validateArchitecture({
  architecture,
  constraints
})
```

No React.

No WebMCP.

No LLM.

---

# 53. Challenge Validation Rules

P0:

- `forbidden-dependency`
- `independent-deployment`
- `no-cycles`

P1:

- `allowed-protocol`

---

# 54. Validation UX Principle

Validation should answer:

> Does this proposed state satisfy the explicit architectural decision?

It should not attempt to answer:

> Is this architecture universally good?

Example:

```text
Checkout Runtime Isolation
FAILED

Basket Adapter shares Product Store.
```

---

# 55. Persistence

Challenge V1 uses:

```text
localStorage
```

Persist:

- constraints;
- findings;
- proposals;
- active proposal;
- node positions;
- migration plan.

Temporary focus and WebMCP state are not persisted.

---

# 56. Reset Demo

One-click `Reset Demo` restores canonical state.

It:

1. clears persisted workspace;
2. restores Commerce v1.35;
3. removes findings;
4. removes constraints;
5. removes proposals;
6. restores HLD;
7. clears Agent Activity.

---

# 57. Demo Fixture

Challenge V1 contains one prebuilt system:

**Commerce Platform — v1.35**

History:

```text
v1.20
Checkout extracted from monolith.

v1.28
Checkout deployment separated.

v1.31
Pricing moved to Product API.

v1.35
Current production architecture.
```

Key architectural debt:

Checkout retained shared Product state during the migration to reduce implementation risk.

It was once a reasonable compromise.

The product requirements later changed.

---

# 58. HLD Elements

Frontend:

```text
app-shell
product-mfe
cart-mfe
checkout-mfe
account-mfe
shared-store
```

Backend:

```text
backend-api
product-service
checkout-service
auth-service
```

Data:

```text
commerce-db
```

Recommended size:

- 9–12 HLD nodes;
- 10–15 relations.

---

# 59. Team Ownership

Example:

```text
Product MFE
Catalog Team

Cart MFE
Cart Team

Checkout MFE
Checkout Team

Product Service
Catalog Team

Checkout Service
Checkout Team
```

---

# 60. Deployment Metadata

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

Checkout has a separate artifact but still consumes state from another runtime boundary.

---

# 61. Checkout LLD

```text
checkout-page
checkout-domain
basket-adapter
pricing-module
payment-module
order-module
checkout-api-client
product-store
product-service
checkout-service
```

---

# 62. Hidden Coupling

Real problem:

```text
Basket Adapter
     ↓
shares state
     ↓
Product Store
```

Checkout knows another domain's runtime representation.

---

# 63. Acceptable Dependency

```text
Pricing Module
     ↓
REST
     ↓
Product Service
```

This intentionally demonstrates:

> Dependency ≠ architectural failure.

The human decides which trade-offs are acceptable.

---

# 64. Initial Fixture State

```text
findings: []
constraints: []
proposals: []
```

The agent discovers the issue.

---

# 65. Human Architectural Decision

After drill-down:

> The Product API dependency is acceptable for now, but Checkout must not depend on Product runtime state and must remain independently deployable.

Creates:

- Checkout Runtime Isolation
- Independent Checkout Deployment

Optional:

- Allowed Product Integration Protocol

---

# 66. Golden Proposal

Goal:

> smallest necessary change

not rewrite.

Before:

```text
Basket Adapter
     ↓
Product Store
```

Proposal introduces:

```text
Checkout Snapshot Contract
```

Result:

```text
Cart / Product
      ↓
Checkout Snapshot Contract
      ↓
Checkout Domain
```

Pricing still uses Product REST API.

---

# 67. Proposal Changes

```text
+ checkout-snapshot-contract

- basket-adapter → product-store

+ basket-adapter → checkout-snapshot-contract
```

Existing Product API relation remains.

---

# 68. Golden Validation

Target:

```text
✓ Checkout runtime isolation

✓ Independent deployment

✓ No circular dependencies

✓ Allowed Product integration
```

Final:

```text
4 passed
0 failed
```

---

# 69. Golden Prompt Sequence

## Prompt 1

> We're trying to let the Checkout team deploy independently. Review the current architecture and show me anything that could prevent that.

Expected:

```text
get_architecture
annotate_architecture
```

## Prompt 2

> Checkout is already a separate microfrontend. Why do you still consider it coupled to Product? Show me.

Expected:

```text
inspect_element
show_architecture_view
annotate_architecture
```

## Prompt 3

> The Product API dependency is acceptable, but Checkout must not depend on Product runtime state, and it must remain independently deployable. Add those as architectural constraints.

Expected:

```text
add_constraint
add_constraint
```

## Prompt 4

> Propose the smallest architecture change that satisfies those constraints. Don't redesign the whole system.

Expected:

```text
create_proposal
```

## Prompt 5

> Validate the proposal.

Expected:

```text
validate_architecture
```

## Optional Prompt 6

> Give me an incremental migration path without a rewrite.

Expected:

```text
create_migration_plan
```

---

# 70. Human-Agent Roles

The user is not a spectator.

### Goal

Human defines desired outcome.

### Challenge

Human questions AI reasoning.

### Decision

Human establishes acceptable trade-offs.

### Scope

Human prevents unnecessary redesign.

### Verification

Human asks for evidence.

---

# 71. Main UI

Desktop-first.

Targets:

```text
1440 × 900
1920 × 1080
```

Layout:

```text
┌─────────────────────────────────────────────────────┐
│ Header                                              │
├────────────┬──────────────────────────┬──────────────┤
│ Navigation │ Architecture Canvas      │ Context      │
│            │                          │ Panel        │
├────────────┴──────────────────────────┴──────────────┤
│ Agent Activity                                      │
└─────────────────────────────────────────────────────┘
```

Canvas remains dominant.

---

# 72. Visual Style

Nivra should feel:

> **Calm, technical, precise, trustworthy.**

Avoid:

- AI gradients everywhere;
- cyberpunk visuals;
- generic admin-dashboard cards;
- excessive borders;
- visual noise.

---

# 73. Visual Theme

Recommended:

**light neutral interface**

Example tokens:

```text
Canvas:          #F7F8FA
Panels:          #FFFFFF
Primary text:    #171A1F
Secondary text:  #68707D
Border:          #DFE3E8
```

Semantic accents:

- blue: focus/info;
- amber: warning;
- red: failure;
- green: validated;
- violet/indigo: proposal.

---

# 74. Typography

Recommended:

```text
Inter
Geist
or system sans-serif
```

Important demo labels must remain readable in 1080p video.

---

# 75. Nodes

Approximate:

```text
170–210px wide
72–90px high
```

Example:

```text
Checkout

Microfrontend
Checkout Team
```

Always display:

- name;
- type.

Optional:

- owner.

---

# 76. Node Categories

Challenge V1:

- Frontend;
- Backend;
- Data;
- Contract / Integration;
- External.

Use subtle visual differentiation.

---

# 77. Edges

Edges communicate architecture semantics.

Examples:

```text
calls
reads
writes
shares state
hosts
REST
event
```

The user must easily distinguish:

```text
shares state
```

from:

```text
REST
```

---

# 78. Focus Mode

When Nivra shows evidence:

```text
Focused nodes/edges      100%
Unrelated architecture   30–45%
```

This is more valuable than complex animation.

---

# 79. Finding UI

Example:

```text
AGENT FINDING

Checkout isolation risk

Checkout is deployed separately
but still depends on Product runtime state.
```

Click → focus evidence.

---

# 80. Constraint UI

Example:

```text
ARCHITECTURAL CONSTRAINT

Checkout Runtime Isolation

Checkout must not depend
on Product runtime state.
```

Constraint should feel like architectural policy.

Not AI advice.

---

# 81. Current / Proposal

Current:

```text
CURRENT
Commerce Platform · v1.35
```

Proposal:

```text
PROPOSAL
Checkout Isolation
based on v1.35
```

Current never appears overwritten.

---

# 82. Proposal Diff

```text
+ Added
- Removed
~ Changed
```

No complex Git-style visual diff in Challenge V1.

---

# 83. Validation UI

Example:

```text
ARCHITECTURE VALIDATION

4 passed
0 failed

✓ Checkout runtime isolation
✓ Independent deployment
✓ No circular dependencies
✓ Allowed Product integration
```

Clearly distinct from Agent Findings.

---

# 84. HLD → LLD Drill-Down

Primary visual transition:

```text
Commerce Platform
High-Level Design
```

↓

```text
Commerce Platform / Checkout
Low-Level Design
```

Use:

- breadcrumb;
- `fitView()`;
- subtle transition.

---

# 85. Hero Screen #1

Most important Challenge screenshot:

```text
Checkout LLD
```

showing:

```text
Basket Adapter → Product Store
                 shares state
```

beside:

```text
Pricing Module → Product API
                 REST
```

This demonstrates the architectural trade-off visually.

---

# 86. Hero Screen #2

Resolution:

```text
Checkout Isolation Proposal

- Product Store dependency
+ Checkout Snapshot Contract

VALIDATION
4 / 4 passed
```

---

# 87. Product Entry

No landing page.

The URL opens directly into:

```text
Nivra
Commerce Platform · v1.35
Current
High-Level Design
```

No login.

No onboarding.

No project creation.

---

# 88. Hosting

Recommended:

**Vercel**

```text
GitHub
↓
Vercel
↓
Public HTTPS URL
```

---

# 89. Domain

No custom domain required.

Acceptable Challenge deployment:

```text
https://nivra.vercel.app
```

or closest available Vercel project URL.

Optional future subdomain can use an existing domain.

---

# 90. Repository

Public GitHub repository.

Recommended repository name:

```text
nivra
```

or:

```text
nivra-webmcp
```

Recommended license:

**MIT**

---

# 91. Branding

Challenge public name:

# Nivra

Working tagline candidates:

> **Architecture is the shared context.**

and:

> **A shared architecture reasoning workspace for humans and agents.**

Do not spend significant Challenge time on further branding.

---

# 92. README

```text
# Nivra

One-line description

## The Problem

## Why WebMCP?

## Human + Agent Workflow

## Live Demo

## Architecture

## WebMCP Tools

## Run Locally

## Testing with WebMCP

## Tech Stack

## License
```

---

# 93. Demo Video

Under:

**3 minutes**

Story:

```text
Problem
↓
Current HLD
↓
Agent analysis
↓
Human disagreement
↓
LLD evidence
↓
Human decision
↓
Proposal
↓
Validation
```

Final recording uses a fixed script and fixed prompts.

---

# 94. Core Messaging

Primary:

> **Architecture is the shared context.**

Product:

> **Nivra lets humans and AI agents reason inside the same structured architecture workspace.**

Demo:

> **A separate box on a diagram doesn't mean an independent system.**

Optional closing line:

> **The agent doesn't draw architecture for you. It reasons inside your architecture with you.**

---

# 95. Seven-Day Build Plan

## Day 1

Foundation:

- React/Vite/TS;
- domain types;
- project structure;
- fixture skeleton;
- workspace layout.

## Day 2

Commerce HLD:

- nodes;
- edges;
- ownership;
- deployment metadata;
- architecture canvas.

## Day 3

Checkout LLD:

- hidden coupling;
- manual drill-down;
- breadcrumbs;
- focus;
- Findings.

## Day 4

Product loop:

- constraints;
- validation;
- proposals;
- Current/Proposal;
- Current fails;
- Proposal passes.

## Day 5

WebMCP:

- adapter;
- read tools;
- navigation tool;
- write tools.

## Day 6

Full agent loop:

- complete tools;
- Agent Activity;
- repeated golden-flow testing;
- reliability fixes.

Then:

**feature freeze**

## Day 7

- visual polish;
- deployment;
- README;
- Devpost;
- screenshots;
- demo script;
- rehearsal.

Deadline day is a buffer.

---

# 96. P0 — Must Ship

- Commerce HLD;
- Checkout LLD;
- HLD→LLD drill-down;
- Findings;
- Constraints;
- Current / Proposal;
- deterministic validation;
- Reset Demo;
- `get_architecture`;
- `inspect_element`;
- `show_architecture_view`;
- `annotate_architecture`;
- `add_constraint`;
- `create_proposal`;
- `validate_architecture`.

---

# 97. P1 — Strongly Recommended

- Agent Activity;
- localStorage;
- good focus behaviour;
- WebMCP status;
- proposal diff;
- version label;
- node selection.

---

# 98. P2 — Luxury

- Migration Plan;
- node dragging;
- advanced animations;
- advanced diff;
- additional validation rules;
- demo mode.

---

# 99. Explicit Non-Goals

Do not implement for Challenge:

- authentication;
- accounts;
- backend;
- remote database;
- teams;
- collaboration;
- GitHub import;
- AWS/GCP/Azure imports;
- Vercel/Cloudflare discovery;
- Kubernetes analysis;
- source-code architecture inference;
- full diagram editor;
- real branching;
- revision history;
- merge;
- infrastructure view;
- Product Owner presentation mode;
- multiple demo architectures;
- mobile editing.

---

# 100. Scope Cut Order

If necessary, cut:

1. Migration Plan
2. allowed-protocol sophistication
3. node dragging
4. localStorage
5. advanced proposal diff
6. fancy animations

Never cut:

- HLD→LLD;
- human-defined constraints;
- Current vs Proposal;
- deterministic verification;
- WebMCP read/write loop.

---

# 101. Three Checkpoints

## Checkpoint A

After LLD:

> Does the drill-down create a clear “now I see it” moment?

## Checkpoint B

Before WebMCP:

> Can the whole product story work manually?

## Checkpoint C

After WebMCP:

> Can an external agent reliably drive the same story?

If yes:

**feature freeze.**

---

# 102. Product Success Criterion

A judge should understand:

> The agent is not discussing a screenshot.

> The agent and architect operate over the same structured architecture.

---

# 103. Challenge Differentiation

Nivra is **not primarily**:

- autonomous software development;
- architecture governance;
- source-code scanning;
- CI architecture enforcement;
- AI architecture generation.

Nivra is:

> **a shared visual reasoning environment for humans and agents.**

Its distinctive interaction is:

```text
Observe
↓
Question
↓
Inspect
↓
Understand
↓
Decide
↓
Propose
↓
Verify
```

---

# 104. Core Engineering Principle

Three independent capabilities:

```text
Architecture Model
      ↓
represents the system

Reasoning Workspace
      ↓
lets human and agent explore it

Validation Engine
      ↓
checks explicit decisions
```

WebMCP connects the external agent to all three.

---

# 105. Final Human-Agent Principle

```text
Human defines a goal
↓
Agent reads structured architecture
↓
Agent identifies a concern
↓
Human challenges it
↓
Agent drills into deeper architecture
↓
Evidence appears visually
↓
Human chooses the architectural trade-off
↓
The decision becomes an explicit constraint
↓
Agent creates a minimal proposal
↓
Nivra verifies it
↓
Human remains in control
```

---

# 106. Final Product Principle

Nivra should not communicate:

> **Look what AI can do.**

It should communicate:

> **Look how much better humans and agents can reason when architecture itself becomes their shared context.**
