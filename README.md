# Nivra

Nivra is a shared visual architecture workspace for humans and AI agents. The human works with an interactive diagram while an agent reads, navigates, annotates, proposes and validates the same structured Architecture Model through browser-native WebMCP tools.

**Live application:** https://nivra-psi.vercel.app

## Demo story

The included Commerce Platform fixture makes one architecture trade-off visible:

1. Commerce HLD suggests Checkout is independently deployable.
2. Checkout LLD reveals that Basket Adapter shares Product Store runtime state.
3. Explicit policy rules make the risk deterministic: Current is `2 passed / 2 failed`.
4. The agent creates a patch-based Checkout Snapshot Contract proposal.
5. The Proposal validates as `4 passed / 0 failed`, while Current remains unchanged.

## Run locally

Prerequisite: Node.js 20 or newer.

```sh
npm install --registry=https://registry.npmjs.org
npm run dev
```

Open the local address printed by Vite. The workspace works in ordinary browsers; it reports `WebMCP unavailable` when the experimental browser API is not enabled.

## Verify

```sh
npm run typecheck
npm test
npm run build
npm run test:webmcp
```

`test:webmcp` launches an isolated local Vite instance and Chromium profile, then runs the complete scenario three times through `ModelContext.executeTool()`. It requires Google Chrome or Chromium with WebMCP available. See [docs/WEBMCP_TESTING.md](docs/WEBMCP_TESTING.md) for prerequisites and environment overrides.

## Deploy to Vercel

The Vercel project is connected to `MaximusFT/nivra`. Every push to `main` automatically builds and updates production, so normal delivery from any computer is:

```sh
git push origin main
```

Pull requests and non-production branches produce preview deployments. An explicit CLI deployment remains available as a recovery path from an authenticated machine:

```sh
npx --yes --registry=https://registry.npmjs.org vercel --prod
```

Open the production HTTPS URL in Chrome with WebMCP enabled for the agent-driven demonstration. A standard browser still supports the complete manual workflow.

Current production deployment: [nivra-psi.vercel.app](https://nivra-psi.vercel.app).

## WebMCP tools

| Tool | Purpose |
| --- | --- |
| `get_architecture` | Read the active structured architecture without canvas layout metadata. |
| `inspect_element` | Inspect an element, including descendants, relations, rules and findings. |
| `show_architecture_view` | Open a shared view and optionally focus visible evidence. |
| `annotate_architecture` | Create or update an idempotent agent finding. |
| `add_constraint` | Create or update a deterministic architecture rule. |
| `create_proposal` | Create or update a patch-based alternative without mutating Current. |
| `validate_architecture` | Validate Current or the active Proposal and show the result to the human. |

Write inputs use stable kebab-case IDs and are validated at the browser adapter boundary. Tool invocation activity is visible in the workspace footer.

## Architecture

The domain model under [src/architecture](src/architecture) is plain TypeScript and owns the source of truth. React Flow, Zustand, localStorage and WebMCP remain at adapter boundaries:

```text
Architecture Model -> workspace actions -> React workspace
                                      -> WebMCP browser tools
```

HLD and LLD are views of the same model. Current Architecture is immutable; Proposals are patch-derived alternatives. Further decisions are captured in [docs/ARCHITECTURE_DECISIONS.md](docs/ARCHITECTURE_DECISIONS.md).

## Project status

Functional MVP gates A, B and C have passed. The remaining delivery work is visual refinement, public deployment and rehearsal. See [PROJECT_STATUS.md](PROJECT_STATUS.md) for the current handoff state and [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for the fixed demo sequence.

## License

This project is licensed under the [MIT License](LICENSE).
