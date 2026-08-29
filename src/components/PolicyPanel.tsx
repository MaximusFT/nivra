import { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clipboard,
  FileText,
  GitCompare,
  Play,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { checkoutGoldenConstraints } from '../fixtures/commerce/constraints';
import { goldenCheckoutProposal } from '../fixtures/commerce/proposals';
import { getProposalDiff } from '../architecture/proposals';
import { useWorkspaceStore } from '../workspace/store';

export function PolicyPanel() {
  const [implementationPlanVisible, setImplementationPlanVisible] = useState(false);
  const [implementationPlanCopied, setImplementationPlanCopied] = useState(false);
  const {
    constraints,
    validationResult,
    proposals,
    activeMode,
    activeProposalId,
    selectedElementIds,
    addConstraint,
    createProposal,
    setActiveMode,
    validateActive,
    focusValidationCheck,
  } = useWorkspaceStore(
    useShallow((state) => ({
      constraints: state.architecture.constraints,
      validationResult: state.validationResult,
      proposals: state.architecture.proposals,
      activeMode: state.activeMode,
      activeProposalId: state.activeProposalId,
      selectedElementIds: state.selectedElementIds,
      addConstraint: state.addConstraint,
      createProposal: state.createProposal,
      setActiveMode: state.setActiveMode,
      validateActive: state.validateActive,
      focusValidationCheck: state.focusValidationCheck,
    })),
  );
  const activeProposal = activeProposalId ? proposals.find(({ id }) => id === activeProposalId) : undefined;
  const proposalDiff = activeProposal ? getProposalDiff(activeProposal) : undefined;
  const selectedElement = selectedElementIds[0]
    ? useWorkspaceStore.getState().architecture.elements.find(({ id }) => id === selectedElementIds[0])
    : undefined;
  const checkoutElementIds = new Set([
    'checkout-mfe',
    'checkout-page',
    'checkout-domain',
    'basket-adapter',
    'pricing-module',
    'payment-module',
    'order-module',
    'checkout-api-client',
    'checkout-service',
  ]);
  const selectedOutsideCheckout = selectedElement && !checkoutElementIds.has(selectedElement.id);

  const addGoldenConstraints = () => {
    for (const constraint of checkoutGoldenConstraints) {
      addConstraint(constraint);
    }
    useWorkspaceStore.getState().validateActive();
  };

  const implementationSteps = [
    'Introduce the Checkout Snapshot Contract.',
    'Publish a Product snapshot through the explicit contract.',
    'Migrate Basket Adapter away from Product Store runtime state.',
    'Verify Checkout deployment and policy compliance.',
    'Remove the legacy Product Store dependency.',
  ];

  const copyImplementationPlan = async () => {
    const markdown = [
      '# Checkout Isolation',
      '',
      ...implementationSteps.map((step, index) => `${index + 1}. ${step}`),
    ].join('\n');
    await navigator.clipboard.writeText(markdown);
    setImplementationPlanCopied(true);
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4">
      {selectedOutsideCheckout ? (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <span className="grid size-9 place-items-center rounded-md bg-white text-emerald-700 shadow-sm">
            <CheckCircle2 aria-hidden="true" size={17} />
          </span>
          <h3 className="mt-3 text-sm font-semibold text-slate-900">No policy issues for {selectedElement.name}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            The current review is scoped to Checkout independence. This element has no related failed checks or open
            findings.
          </p>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
            Current scope · Checkout isolation
          </p>
        </section>
      ) : (
        <>
          <section>
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-indigo-50 text-indigo-700">
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
              <div className="mt-5 overflow-hidden rounded-lg border border-indigo-200 bg-indigo-50">
                <div className="border-b border-indigo-200 bg-white/70 px-3 py-2.5">
                  <p className="text-xs font-semibold text-indigo-950">Checkout independence decisions</p>
                  <p className="mt-0.5 text-[11px] text-indigo-700">Review what is acceptable before validation.</p>
                </div>
                <ul className="space-y-2 p-3 text-[11px] text-slate-700">
                  <li className="flex items-start gap-2">
                    <Check aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-700" size={13} />
                    REST calls to the Product API are allowed.
                  </li>
                  <li className="flex items-start gap-2">
                    <X aria-hidden="true" className="mt-0.5 shrink-0 text-red-700" size={13} />
                    Shared Product runtime state is forbidden.
                  </li>
                  <li className="flex items-start gap-2">
                    <Check aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-700" size={13} />
                    Checkout must remain independently deployable.
                  </li>
                  <li className="flex items-start gap-2">
                    <Check aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-700" size={13} />
                    Dependency cycles are forbidden.
                  </li>
                </ul>
                <button
                  className="flex w-full items-center justify-between border-t border-indigo-200 bg-indigo-700 px-3 py-2.5 text-xs font-semibold text-white hover:bg-indigo-600"
                  onClick={addGoldenConstraints}
                  type="button"
                >
                  Save and validate policy
                  <ArrowRight aria-hidden="true" size={14} />
                </button>
              </div>
            ) : (
              <ul className="mt-5 space-y-2">
                {constraints.map((constraint) => (
                  <li className="rounded-lg border border-slate-200 p-3" key={constraint.id}>
                    <p className="text-xs font-semibold text-slate-800">{constraint.name}</p>
                    <p className="mt-1 text-[11px] leading-4 text-slate-500">{constraint.description}</p>
                    <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-indigo-500">
                      {constraint.rule.type.replaceAll('-', ' ')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {activeProposal ? (
            <section className="mt-6 border-t border-slate-200 pt-5">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-violet-50 text-violet-700">
                  <GitCompare aria-hidden="true" size={17} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Architecture Proposal</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Current remains immutable.</p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-violet-900">{activeProposal.name}</p>
                    <p className="mt-0.5 text-[10px] text-violet-600">based on v{activeProposal.baseVersion}</p>
                  </div>
                  <button
                    className="rounded-md bg-white px-2.5 py-1.5 text-[10px] font-semibold text-violet-700 shadow-sm"
                    onClick={() => setActiveMode(activeMode === 'proposal' ? 'current' : 'proposal')}
                    type="button"
                  >
                    Show {activeMode === 'proposal' ? 'Current' : 'Proposal'}
                  </button>
                </div>
                <ul className="mt-3 space-y-1 text-[11px]">
                  {proposalDiff?.addedElements.map((id) => (
                    <li className="text-emerald-700" key={id}>
                      + Checkout Snapshot Contract
                    </li>
                  ))}
                  {proposalDiff?.removedRelations.map((id) => (
                    <li className="text-red-700" key={id}>
                      − Product Store runtime dependency
                    </li>
                  ))}
                  {proposalDiff?.addedRelations.map((id) => (
                    <li className="text-emerald-700" key={id}>
                      + Snapshot contract dependency
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          <section className="mt-6 border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Architecture Validation</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {activeMode === 'proposal'
                    ? `Proposal · ${activeProposal?.name ?? 'Unknown'}`
                    : 'Current · Commerce Platform v1.35'}
                </p>
              </div>
              {validationResult ? (
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                    validationResult.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {validationResult.passed ? 'PASSED' : 'FAILED'}
                </span>
              ) : null}
            </div>

            {constraints.length > 0 && (!validationResult || activeMode === 'proposal') ? (
              <button
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
                  validationResult?.passed
                    ? 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    : 'bg-slate-900 text-white hover:bg-slate-700'
                }`}
                onClick={validateActive}
                type="button"
              >
                <Play aria-hidden="true" size={13} />
                {validationResult?.passed ? 'Revalidate proposal' : `Validate ${activeMode} architecture`}
              </button>
            ) : null}

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

                {!validationResult.passed ? (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-semibold text-amber-900">Checkout is not independently deployable</p>
                    <p className="mt-1 text-[11px] leading-4 text-amber-800">
                      Runtime state crosses the Checkout boundary. Replace it with an explicit contract before
                      deployment.
                    </p>
                    {!activeProposal ? (
                      <div>
                        <button
                          className="mt-3 flex w-full items-center justify-between rounded-md bg-amber-900 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-800"
                          onClick={() => createProposal(goldenCheckoutProposal)}
                          type="button"
                        >
                          Create remediation proposal
                          <ArrowRight aria-hidden="true" size={14} />
                        </button>
                        <p className="mt-2 text-[10px] leading-4 text-amber-700">
                          Uses the verified Checkout isolation demo template. A connected agent can create its own patch
                          through WebMCP.
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-semibold text-emerald-900">All Checkout policies are satisfied</p>
                    <p className="mt-1 text-[11px] leading-4 text-emerald-800">
                      The proposal replaces runtime state sharing with an explicit snapshot contract. Current remains
                      unchanged.
                    </p>
                  </div>
                )}

                <ul className="mt-3 space-y-2">
                  {validationResult.checks.map((check) => {
                    const passed = check.status === 'passed';
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
                            className={`mt-0.5 shrink-0 ${passed ? 'text-emerald-600' : 'text-red-600'}`}
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

                {validationResult.passed && activeMode === 'proposal' ? (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    {!implementationPlanVisible ? (
                      <button
                        className="flex w-full items-center justify-between rounded-md bg-emerald-700 px-3 py-2.5 text-xs font-semibold text-white hover:bg-emerald-600"
                        onClick={() => setImplementationPlanVisible(true)}
                        type="button"
                      >
                        <span className="flex items-center gap-2">
                          <FileText aria-hidden="true" size={14} />
                          Prepare implementation plan
                        </span>
                        <ArrowRight aria-hidden="true" size={14} />
                      </button>
                    ) : (
                      <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                        <p className="text-xs font-semibold text-emerald-950">
                          Checkout Isolation · ready for delivery
                        </p>
                        <ol className="mt-2 space-y-1.5 text-[11px] leading-4 text-emerald-900">
                          {implementationSteps.map((step, index) => (
                            <li className="flex gap-2" key={step}>
                              <span className="font-semibold">{index + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ol>
                        <button
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-emerald-300 bg-white px-3 py-2 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100"
                          onClick={() => void copyImplementationPlan()}
                          type="button"
                        >
                          {implementationPlanCopied ? (
                            <Check aria-hidden="true" size={13} />
                          ) : (
                            <Clipboard aria-hidden="true" size={13} />
                          )}
                          {implementationPlanCopied ? 'Copied as Markdown' : 'Copy implementation brief'}
                        </button>
                      </section>
                    )}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                <AlertCircle aria-hidden="true" className="mt-0.5 shrink-0" size={14} />
                Validation is deterministic and separate from Findings.
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
