# Nivra — Checkpoint C Report

Date: 2026-08-28  
Result: **passed**

Checkpoint question:

> Can an external agent reliably drive the same story?

Yes. The browser-level harness completed three isolated Golden workflow repetitions through Chromium's WebMCP `ModelContext.executeTool()` surface.

## Verified tool set

- `get_architecture`
- `inspect_element`
- `show_architecture_view`
- `annotate_architecture`
- `add_constraint`
- `create_proposal`
- `validate_architecture`

## Repetition evidence

| Run | Registered | Focused evidence | Current | Proposal | Findings | Constraints | Current preserved | Activity visible |
| --- | ---: | --- | --- | --- | ---: | ---: | --- | --- |
| 1 | 7 | Basket Adapter → Product Store | 2 passed / 2 failed | 4 passed / 0 failed | 2 | 4 | yes | yes |
| 2 | 7 | Basket Adapter → Product Store | 2 passed / 2 failed | 4 passed / 0 failed | 2 | 4 | yes | yes |
| 3 | 7 | Basket Adapter → Product Store | 2 passed / 2 failed | 4 passed / 0 failed | 2 | 4 | yes | yes |

Each repetition began with Reset Demo and included deliberate retries of Finding, Constraint and Proposal writes. Stable IDs remained idempotent, the proposal diff remained identical, and Agent Activity showed no error state.

After Proposal validation, the harness switched back to Current through the public `validate_architecture` tool and confirmed:

- `basket-adapter-shares-product-store` still exists;
- `checkout-snapshot-contract` does not exist in Current;
- proposal-only state never leaked into Current.

## Reproduce

Run:

```powershell
npm run test:webmcp
```

See `docs/WEBMCP_TESTING.md` for prerequisites, environment overrides and every asserted invariant.

## Production verification

The same harness completed three additional Golden repetitions against `https://nivra-psi.vercel.app` on 2026-08-29. All seven tools registered, Current remained `2 passed / 2 failed`, Proposal remained `4 passed / 0 failed`, and the Current immutability and visible Activity assertions passed in every run.
