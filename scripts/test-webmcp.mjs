import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import WebSocket from 'ws';

const root = resolve(import.meta.dirname, '..');
const repeatCount = Number.parseInt(process.env.NIVRA_WEBMCP_REPEATS ?? '3', 10);
const requestedTargetUrl = process.env.NIVRA_WEBMCP_URL?.trim();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function findChrome() {
  const candidates = [
    process.env.NIVRA_CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean);
  const chrome = candidates.find((candidate) => existsSync(candidate));
  if (!chrome) {
    throw new Error('Chrome was not found. Set NIVRA_CHROME_PATH to a Chromium executable.');
  }
  return chrome;
}

function availablePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Could not allocate a local port.'));
        return;
      }
      server.close(() => resolvePort(address.port));
    });
  });
}

async function waitFor(check, message, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const result = await check();
      if (result) return result;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
  }
  throw new Error(`${message}${lastError ? `: ${lastError.message}` : ''}`);
}

async function stopProcess(child) {
  if (!child) return;
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise((resolveExit) => child.once('exit', resolveExit));
  child.kill();
  await Promise.race([exited, new Promise((resolveDelay) => setTimeout(resolveDelay, 1_000))]);
}

class CdpClient {
  #id = 0;
  #pending = new Map();

  constructor(url) {
    this.socket = new WebSocket(url);
  }

  async connect() {
    await new Promise((resolveOpen, reject) => {
      this.socket.addEventListener('open', resolveOpen, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data.toString());
      if (!message.id) return;
      const pending = this.#pending.get(message.id);
      if (!pending) return;
      this.#pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
  }

  send(method, params = {}) {
    const id = ++this.#id;
    return new Promise((resolveResult, reject) => {
      this.#pending.set(id, { resolve: resolveResult, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const response = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (response.exceptionDetails) {
      const description = response.exceptionDetails.exception?.description ?? response.exceptionDetails.text;
      throw new Error(description);
    }
    return response.result.value;
  }

  close() {
    this.socket.close();
  }
}

function toolExpression(name, input) {
  const inputJson = JSON.stringify(input);
  return `(async () => {
    const context = document.modelContext;
    if (!context) throw new Error("document.modelContext is unavailable");
    if (typeof context.executeTool !== "function") throw new Error("ModelContext.executeTool is unavailable");
    const tools = await context.getTools();
    const tool = tools.find((candidate) => candidate.name === ${JSON.stringify(name)});
    if (!tool) throw new Error("Tool not registered: ${name}");
    const raw = await context.executeTool(tool, ${JSON.stringify(inputJson)});
    return raw === null ? null : JSON.parse(raw);
  })()`;
}

const goldenConstraints = [
  {
    id: 'checkout-runtime-isolation',
    name: 'Checkout Runtime Isolation',
    description: 'Checkout must not depend on Product runtime state.',
    severity: 'error',
    rule: { type: 'forbidden-dependency', sourceId: 'checkout-mfe', targetId: 'product-store' },
  },
  {
    id: 'independent-checkout-deployment',
    name: 'Independent Checkout Deployment',
    description: 'Checkout must remain independently deployable.',
    severity: 'error',
    rule: { type: 'independent-deployment', elementId: 'checkout-mfe' },
  },
  {
    id: 'no-circular-dependencies',
    name: 'No Circular Dependencies',
    description: 'Architecture dependencies must remain acyclic.',
    severity: 'error',
    rule: { type: 'no-cycles' },
  },
  {
    id: 'allowed-product-integration',
    name: 'Allowed Product Integration',
    description: 'Checkout may use the Product REST API.',
    severity: 'error',
    rule: { type: 'allowed-protocol', sourceId: 'pricing-module', targetId: 'product-service', protocols: ['REST'] },
  },
];

const goldenProposal = {
  id: 'checkout-isolation',
  name: 'Checkout Isolation',
  description: 'Replace Product runtime state coupling with a Checkout-owned snapshot contract.',
  baseVersion: 1.35,
  changes: {
    addElements: [
      {
        id: 'checkout-snapshot-contract',
        name: 'Checkout Snapshot Contract',
        kind: 'contract',
        area: 'frontend',
        level: 'lld',
        parentId: 'checkout-mfe',
        owner: 'Checkout Team',
        deploymentUnit: 'checkout',
        description: 'Checkout-owned snapshot of the basket data required to complete an order.',
      },
    ],
    updateElements: [],
    removeElementIds: [],
    addRelations: [
      {
        id: 'basket-adapter-reads-checkout-snapshot',
        sourceId: 'basket-adapter',
        targetId: 'checkout-snapshot-contract',
        type: 'reads',
        protocol: 'snapshot',
        description: 'Basket Adapter consumes a Checkout-owned snapshot contract.',
      },
    ],
    updateRelations: [],
    removeRelationIds: ['basket-adapter-shares-product-store'],
  },
};

async function executeGoldenRun(cdp, runNumber) {
  await cdp.evaluate(`(() => {
    const button = [...document.querySelectorAll("button")].find((candidate) => candidate.textContent.includes("Reset Demo"));
    if (!button) throw new Error("Reset Demo button not found");
    button.click();
  })()`);

  const call = (name, input = {}) => cdp.evaluate(toolExpression(name, input));

  // Prompt 1 — review Current and record the isolation risk.
  const initial = await call('get_architecture');
  assert(initial.mode === 'current', `Run ${runNumber}: expected Current mode.`);
  const firstFinding = {
    id: 'checkout-isolation-risk',
    title: 'Checkout isolation risk',
    description: 'Checkout is deployed separately but still depends on Product runtime state.',
    severity: 'warning',
    elementIds: ['basket-adapter', 'product-store'],
    relationIds: ['basket-adapter-shares-product-store'],
  };
  await call('annotate_architecture', firstFinding);
  await call('annotate_architecture', firstFinding);

  // Prompt 2 — inspect Checkout internals, show the LLD and keep the evidence visible.
  const inspection = await call('inspect_element', { elementId: 'checkout-mfe' });
  assert(
    inspection.children.some(({ id }) => id === 'basket-adapter'),
    `Run ${runNumber}: Checkout inspection is incomplete.`,
  );
  await call('show_architecture_view', {
    viewId: 'checkout-lld',
    focusElementIds: ['basket-adapter', 'product-store'],
    focusRelationIds: ['basket-adapter-shares-product-store'],
  });
  await call('annotate_architecture', {
    id: 'checkout-runtime-evidence',
    title: 'Runtime state coupling evidence',
    description: 'Basket Adapter shares Product Store state across deployment boundaries.',
    severity: 'warning',
    elementIds: ['basket-adapter', 'product-store'],
    relationIds: ['basket-adapter-shares-product-store'],
  });

  const focused = await waitFor(async () => {
    const value = await cdp.evaluate(`(() => ({
      selectedNodes: [...document.querySelectorAll(".react-flow__node.selected")].map((node) => node.dataset.id),
      selectedEdges: [...document.querySelectorAll(".react-flow__edge.selected")].map((edge) => edge.dataset.id),
      lowLevelVisible: document.body.textContent?.includes("Low-Level Design") ?? false
    }))()`);
    return value?.lowLevelVisible ? value : undefined;
  }, `Run ${runNumber}: Checkout LLD is not visible.`);

  // Prompt 3 — persist the canonical policy. Retry one ID to prove idempotency.
  for (const constraint of goldenConstraints) await call('add_constraint', constraint);
  await call('add_constraint', goldenConstraints[0]);
  const currentValidation = await call('validate_architecture', { mode: 'current' });
  assert(currentValidation.validation.summary.passed === 2, `Run ${runNumber}: Current passed count changed.`);
  assert(currentValidation.validation.summary.failed === 2, `Run ${runNumber}: Current failed count changed.`);

  // Prompt 4 — create and retry the smallest patch-based alternative.
  const proposal = await call('create_proposal', goldenProposal);
  const proposalRetry = await call('create_proposal', goldenProposal);
  assert(
    JSON.stringify(proposal.diff) === JSON.stringify(proposalRetry.diff),
    `Run ${runNumber}: proposal retry changed the diff.`,
  );

  // Prompt 5 — deterministic Proposal verification.
  const proposalValidation = await call('validate_architecture', { mode: 'proposal' });
  assert(proposalValidation.validation.summary.passed === 4, `Run ${runNumber}: Proposal passed count changed.`);
  assert(proposalValidation.validation.summary.failed === 0, `Run ${runNumber}: Proposal failed count changed.`);

  // Switch back through the public tool and prove Current was not overwritten.
  await call('validate_architecture', { mode: 'current' });
  const currentAfterProposal = await call('get_architecture');
  assert(
    currentAfterProposal.architecture.relations.some(({ id }) => id === 'basket-adapter-shares-product-store'),
    `Run ${runNumber}: Current runtime relation was overwritten.`,
  );
  assert(
    !currentAfterProposal.architecture.elements.some(({ id }) => id === 'checkout-snapshot-contract'),
    `Run ${runNumber}: Proposal element leaked into Current.`,
  );
  assert(
    currentAfterProposal.architecture.findings.length === 2,
    `Run ${runNumber}: finding retries were not idempotent.`,
  );
  assert(
    currentAfterProposal.architecture.constraints.length === 4,
    `Run ${runNumber}: constraint retries were not idempotent.`,
  );

  const activity = await cdp.evaluate(`(() => ({
    ready: document.body.innerText.includes("WebMCP ready"),
    hasRecentTool: document.body.innerText.includes("get_architecture"),
    hasErrorIcon: document.querySelector(".text-rose-600") !== null
  }))()`);
  assert(activity.ready, `Run ${runNumber}: WebMCP status is not ready.`);
  assert(activity.hasRecentTool, `Run ${runNumber}: Agent Activity did not show a recent tool.`);
  assert(!activity.hasErrorIcon, `Run ${runNumber}: Agent Activity contains an error.`);

  return {
    run: runNumber,
    registeredTools: 7,
    focusedNodes: focused.selectedNodes,
    focusedEdges: focused.selectedEdges,
    current: currentValidation.validation.summary,
    proposal: proposalValidation.validation.summary,
    findings: currentAfterProposal.architecture.findings.length,
    constraints: currentAfterProposal.architecture.constraints.length,
    currentPreserved: true,
    activityVisible: true,
  };
}

async function main() {
  assert(Number.isInteger(repeatCount) && repeatCount > 0, 'NIVRA_WEBMCP_REPEATS must be a positive integer.');
  if (requestedTargetUrl) {
    const protocol = new URL(requestedTargetUrl).protocol;
    assert(protocol === 'http:' || protocol === 'https:', 'NIVRA_WEBMCP_URL must use HTTP or HTTPS.');
  }
  const chromePath = findChrome();
  const cdpPort = await availablePort();
  const vitePort = requestedTargetUrl ? undefined : await availablePort();
  const targetUrl = requestedTargetUrl ?? `http://127.0.0.1:${vitePort}/`;
  const profileDir = await mkdtemp(join(tmpdir(), 'nivra-webmcp-'));
  const vite = vitePort
    ? spawn(
      process.execPath,
      [
        join(root, 'node_modules', 'vite', 'bin', 'vite.js'),
        '--host',
        '127.0.0.1',
        '--port',
        String(vitePort),
        '--strictPort',
      ],
      { cwd: root, stdio: 'ignore' },
    )
    : undefined;
  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--enable-features=WebMCP',
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${profileDir}`,
      'about:blank',
    ],
    { stdio: 'ignore', windowsHide: true },
  );

  let cdp;
  try {
    await waitFor(async () => (await fetch(targetUrl)).ok, `${requestedTargetUrl ? 'Target URL' : 'Vite'} did not respond`);
    const target = await waitFor(async () => {
      const targets = await fetch(`http://127.0.0.1:${cdpPort}/json/list`).then((response) => response.json());
      return targets.find(({ type }) => type === 'page');
    }, 'Chromium debugging target did not start');

    cdp = new CdpClient(target.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');
    await cdp.send('Page.navigate', { url: targetUrl });
    const toolMetadata = await waitFor(async () => {
      const value = await cdp.evaluate(`(async () => {
        if (!document.modelContext || !document.body.innerText.includes("WebMCP ready")) return null;
        const tools = await document.modelContext.getTools();
        return {
          names: tools.map(({ name }) => name),
          executeToolAvailable: typeof document.modelContext.executeTool === "function"
        };
      })()`);
      return value?.names.length === 7 ? value : undefined;
    }, 'Seven WebMCP tools were not registered');
    assert(toolMetadata.executeToolAvailable, 'Chromium does not expose ModelContext.executeTool for testing.');

    const reports = [];
    for (let run = 1; run <= repeatCount; run += 1) {
      reports.push(await executeGoldenRun(cdp, run));
    }

    console.log(
      JSON.stringify(
        {
          status: 'passed',
          targetUrl,
          repeatCount,
          tools: toolMetadata.names,
          reports,
        },
        null,
        2,
      ),
    );
  } finally {
    cdp?.close();
    await Promise.all([stopProcess(chrome), stopProcess(vite)]);
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
    await rm(profileDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
});
