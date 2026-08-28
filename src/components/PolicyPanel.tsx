import { AlertCircle, CheckCircle2, Play, Plus, ShieldCheck, XCircle } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { checkoutGoldenConstraints } from "../fixtures/commerce/constraints";
import { useWorkspaceStore } from "../workspace/store";

export function PolicyPanel() {
  const {
    constraints,
    validationResult,
    addConstraint,
    validateCurrent,
    focusValidationCheck,
  } = useWorkspaceStore(
    useShallow((state) => ({
      constraints: state.architecture.constraints,
      validationResult: state.validationResult,
      addConstraint: state.addConstraint,
      validateCurrent: state.validateCurrent,
      focusValidationCheck: state.focusValidationCheck,
    })),
  );

  const addGoldenConstraints = () => {
    for (const constraint of checkoutGoldenConstraints) {
      addConstraint(constraint);
    }
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4">
      <section>
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
            <ShieldCheck aria-hidden="true" size={17} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Architectural Policy</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Human decisions expressed as deterministic constraints.
            </p>
          </div>
        </div>

        {constraints.length === 0 ? (
          <button
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
            onClick={addGoldenConstraints}
            type="button"
          >
            <Plus aria-hidden="true" size={14} />
            Add Checkout constraints
          </button>
        ) : (
          <ul className="mt-5 space-y-2">
            {constraints.map((constraint) => (
              <li className="rounded-xl border border-slate-200 p-3" key={constraint.id}>
                <p className="text-xs font-semibold text-slate-800">{constraint.name}</p>
                <p className="mt-1 text-[11px] leading-4 text-slate-500">{constraint.description}</p>
                <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-indigo-500">
                  {constraint.rule.type.replaceAll("-", " ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 border-t border-slate-200 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Architecture Validation</h3>
            <p className="mt-1 text-xs text-slate-500">Current · Commerce Platform v1.35</p>
          </div>
          {validationResult ? (
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                validationResult.passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
            >
              {validationResult.passed ? "PASSED" : "FAILED"}
            </span>
          ) : null}
        </div>

        <button
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          disabled={constraints.length === 0}
          onClick={validateCurrent}
          type="button"
        >
          <Play aria-hidden="true" size={13} />
          Validate current architecture
        </button>

        {validationResult ? (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-emerald-50 p-3 text-center">
                <strong className="block text-xl text-emerald-700">{validationResult.summary.passed}</strong>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">passed</span>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-center">
                <strong className="block text-xl text-red-700">{validationResult.summary.failed}</strong>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600">failed</span>
              </div>
            </div>

            <ul className="mt-3 space-y-2">
              {validationResult.checks.map((check) => {
                const passed = check.status === "passed";
                const Icon = passed ? CheckCircle2 : XCircle;
                const hasEvidence = check.elementIds.length > 0 || check.relationIds.length > 0;

                return (
                  <li key={check.constraintId}>
                    <button
                      className="flex w-full items-start gap-2 rounded-lg border border-slate-200 p-2.5 text-left transition-colors enabled:hover:bg-slate-50 disabled:cursor-default"
                      disabled={!hasEvidence}
                      onClick={() => focusValidationCheck(check.constraintId)}
                      type="button"
                    >
                      <Icon
                        aria-hidden="true"
                        className={`mt-0.5 shrink-0 ${passed ? "text-emerald-600" : "text-red-600"}`}
                        size={14}
                      />
                      <span>
                        <strong className="block text-xs text-slate-700">{check.name}</strong>
                        <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">{check.message}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            <AlertCircle aria-hidden="true" className="mt-0.5 shrink-0" size={14} />
            Validation is deterministic and separate from Findings.
          </div>
        )}
      </section>
    </div>
  );
}
