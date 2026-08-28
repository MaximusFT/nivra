# Nivra — WebMCP Testing

Nivra includes a repeatable browser-level Checkpoint C harness. It starts an isolated local Vite server and a temporary Chromium profile with WebMCP enabled, discovers the seven registered tools, runs the complete Golden workflow through `ModelContext.executeTool()`, and removes the temporary profile when finished.

## Prerequisites

- Node.js and dependencies installed with `npm install`;
- Google Chrome or Chromium with the experimental WebMCP feature;
- no manually started development server is required.

The script automatically checks the usual Chrome paths on Windows, macOS and Linux. Set `NIVRA_CHROME_PATH` when Chromium is installed elsewhere.

## Run Checkpoint C

```powershell
npm run test:webmcp
```

The default is three complete repetitions. To choose another positive count:

```powershell
$env:NIVRA_WEBMCP_REPEATS = "5"
npm run test:webmcp
```

The environment variable affects only this command. The harness uses random free localhost ports and an isolated temporary browser profile.

## Assertions per repetition

The harness verifies:

1. all seven P0 tools are registered;
2. the two read/navigation prompts reveal and focus Checkout LLD evidence;
3. Finding and Constraint retries remain idempotent by stable ID;
4. Current validation remains `2 passed / 2 failed`;
5. the Golden Proposal retry returns the same diff;
6. Proposal validation remains `4 passed / 0 failed`;
7. switching back through `validate_architecture` proves Current still contains the original runtime relation and no proposal-only element;
8. Agent Activity remains visible and contains no error state.

The four canonical constraints are used so this browser workflow matches the deterministic manual Checkpoint B baseline.

## Expected output

The command prints a JSON report with `"status": "passed"`, the registered tool names and one evidence record per repetition. Any registration, tool, invariant, UI visibility or cleanup-critical failure exits non-zero.

## Browser without WebMCP

Ordinary browsers may not expose `document.modelContext`. Nivra treats this as a supported fallback and shows `WebMCP unavailable`; the architecture workspace remains fully usable manually. Use the harness above for the WebMCP-enabled verification path.
