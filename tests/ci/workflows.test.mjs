import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Routing contract of the shared self-hosted pool (Mac ARM64 + Windows X64).
// Same-repository events use the architecture-neutral project label; fork PRs
// stay on GitHub-hosted runners and never reach the host Docker socket.
const LABEL = 'react-doctor-local-hermes-ephemeral';
const SHARED = ['self-hosted', 'Linux', LABEL];
// Workflows reachable from pull_request (or carrying the qualification input).
const ROUTED = ['.github/workflows/ci.yml'];
// Push/tag-only workflows: forks cannot trigger them, static neutral list.
const STATIC = [];
// Workflow that runs these guards.
const GUARD = '.github/workflows/ci.yml';

const trust =
  "github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository";
const selector = `\${{ fromJSON((${trust}) && (inputs.qualification_host == 'mac' && '${JSON.stringify([...SHARED, 'ci-host-tlpr-mac'])}' || inputs.qualification_host == 'x64' && '${JSON.stringify([...SHARED, 'X64'])}' || '${JSON.stringify(SHARED)}') || '"ubuntu-latest"') }}`;
const staticSelector = `[${SHARED.join(', ')}]`;
const evidence = `      - name: Execution architecture evidence\n        if: \${{ ${trust} }}\n        run: bash scripts/ci-host-evidence.sh\n`;
const read = (file) => readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');

function jobs(text) {
  const body = text.slice(text.indexOf('\njobs:\n'));
  return body.split(/\n(?=  [A-Za-z0-9_-]+:\n)/).slice(1);
}

function validateRouted(text) {
  assert.match(
    text,
    /\n  workflow_dispatch:\n    inputs:\n      qualification_host:\n        description: .+\n        required: false\n        default: shared\n        type: choice\n        options: \[shared, mac, x64\]\n/,
  );
  assert.match(text, /\npermissions:\n  contents: (read|write)\n/);
  const runsOn = text.match(/^    runs-on:.*$/gm) ?? [];
  assert.ok(runsOn.length > 0, 'at least one pool job');
  for (const line of runsOn) assert.equal(line, `    runs-on: ${selector}`, 'trusted neutral selector');
  const list = jobs(text);
  assert.equal(list.length, runsOn.length, 'every job uses the selector');
  for (const job of list) {
    const checkout = job.search(/\n      - name: Checkout[^\n]*\n        uses: actions\/checkout@v\d+\n/);
    const proof = job.indexOf(evidence);
    assert.ok(checkout >= 0, 'named checkout');
    assert.ok(proof > checkout, 'evidence after checkout, skipped only for forks');
    for (const tool of ['actions/setup-node@', 'actions/setup-python@', 'pnpm/action-setup@']) {
      const p = job.indexOf(`uses: ${tool}`);
      if (p >= 0) assert.ok(proof < p, `evidence before ${tool}`);
    }
  }
}

function validateCaches(text) {
  assert.doesNotMatch(text, /enableCrossOsArchive/);
  // Built-in setup caches are OS and architecture scoped from these majors on.
  for (const [, major] of text.matchAll(/uses: actions\/setup-node@v(\d+)/g)) assert.ok(Number(major) >= 4);
  for (const [, major] of text.matchAll(/uses: actions\/setup-python@v(\d+)/g)) assert.ok(Number(major) >= 5);
  const caches = text.split(/\n(?=      - )/).filter((step) => /uses: ['"]?actions\/cache(\/(restore|save))?@/.test(step));
  for (const step of caches) {
    const keys = step.match(/^ +key:.*$/gm) ?? [];
    assert.equal(keys.length, 1, 'one explicit cache key');
    assert.ok(keys[0].includes('${{ runner.os }}-${{ runner.arch }}'), 'cache key is OS and ABI scoped');
    const restore = step.match(/restore-keys:[^\n]*\n((?: {12}.*\n?)*)/);
    if (restore) {
      assert.doesNotMatch(restore[0], /restore-keys: *[^|\s]/, 'block restore-keys only');
      for (const prefix of restore[1].split('\n').filter((l) => l.trim())) {
        assert.ok(prefix.includes('${{ runner.os }}-${{ runner.arch }}'), 'restore prefix is OS and ABI scoped');
      }
    }
  }
}

function validateStatic(text) {
  const runsOn = text.match(/^    runs-on:.*$/gm) ?? [];
  assert.ok(runsOn.length > 0);
  for (const line of runsOn) assert.equal(line, `    runs-on: ${staticSelector}`, 'static neutral pool');
  assert.doesNotMatch(text, /\n  pull_request(_target)?:/, 'static list only without fork triggers');
}

function validateGuard(text) {
  assert.match(text, /      - name: CI regression guards\n        run: node --test tests\/ci\/\*\.test\.mjs\n/);
  assert.doesNotMatch(text, /name: CI regression guards\n(        .*\n)*?        (if|continue-on-error):/);
}

for (const file of ROUTED) {
  test(`${file}: routing, evidence and cache contract`, () => {
    validateRouted(read(file));
    validateCaches(read(file));
  });
}
for (const file of STATIC) {
  test(`${file}: architecture-neutral pool`, () => {
    validateStatic(read(file));
    validateCaches(read(file));
  });
}
test(`${GUARD}: guards run in normal CI`, () => validateGuard(read(GUARD)));

test('selector truth table: forks hosted, same-repo PR/push/manual share the pool', () => {
  const expression = selector.slice(4, -3).replaceAll('fromJSON(', 'JSON.parse(');
  const evaluate = new Function('github', 'inputs', `return (${expression});`);
  for (const event of ['pull_request', 'push', 'workflow_dispatch']) {
    for (const sameRepo of [true, false]) {
      for (const choice of [undefined, 'shared', 'mac', 'x64']) {
        const full = sameRepo ? 'owner/repo' : 'fork/repo';
        const github = { event_name: event, repository: 'owner/repo', event: { pull_request: { head: { repo: { full_name: full } } } } };
        const expected =
          event === 'pull_request' && !sameRepo
            ? 'ubuntu-latest'
            : [...SHARED, ...(choice === 'mac' ? ['ci-host-tlpr-mac'] : choice === 'x64' ? ['X64'] : [])];
        assert.deepEqual(evaluate(github, { qualification_host: choice }), expected);
      }
    }
  }
  for (const event_name of ['push', 'workflow_dispatch']) {
    assert.deepEqual(evaluate({ event_name, event: {}, repository: 'owner/repo' }, {}), SHARED);
  }
});

const mutations = [
  ['X64 pin', `|| '${JSON.stringify(SHARED)}'`, `|| '${JSON.stringify([...SHARED, 'X64'])}'`],
  ['ARM64 pin', `|| '${JSON.stringify(SHARED)}'`, `|| '${JSON.stringify([...SHARED, 'ARM64'])}'`],
  ['Linux selector', '"Linux"', '"macOS"'],
  ['project label', `"${LABEL}"`, '"wrong-pool"'],
  ['Mac additive label', 'ci-host-tlpr-mac', 'ARM64'],
  ['x64 ABI label', '"X64"', '"ci-host-windows"'],
  ['fork routing trust', `fromJSON((${trust})`, 'fromJSON((true)'],
  ['fork hosted fallback', `'"ubuntu-latest"'`, `'"self-hosted"'`],
  ['fork evidence trust', `if: \${{ ${trust} }}\n        run: bash`, 'if: always()\n        run: bash'],
  ['evidence removed', 'run: bash scripts/ci-host-evidence.sh', 'run: echo skipped'],
  ['manual choices', 'options: [shared, mac, x64]', 'options: [shared, mac]'],
  ['old setup-node cache', 'uses: actions/setup-node@v4', 'uses: actions/setup-node@v3'],
];
for (const [name, before, after] of mutations) {
  test(`mutation rejected: ${name}`, () => {
    const file = ROUTED.find((f) => read(f).includes(before));
    if (!file) return assert.ok(name === 'old setup-node cache', `mutation target missing: ${name}`);
    const text = read(file);
    assert.throws(() => {
      const mutated = text.replaceAll(before, after);
      validateRouted(mutated);
      validateCaches(mutated);
    });
  });
}

test('mutation rejected: guard step removed or softened', () => {
  const text = read(GUARD);
  assert.throws(() => validateGuard(text.replaceAll('run: node --test tests/ci/*.test.mjs', 'run: echo skipped')));
  assert.throws(() =>
    validateGuard(text.replace('- name: CI regression guards\n', '- name: CI regression guards\n        continue-on-error: true\n')),
  );
});

test('mutation rejected: cache key without ABI or with broad restore', () => {
  const fixture = `      - name: Cache\n        uses: actions/cache@v4\n        with:\n          path: x\n          key: k-\${{ runner.os }}-\${{ runner.arch }}-1\n          restore-keys: |\n            k-\${{ runner.os }}-\${{ runner.arch }}-\n`;
  validateCaches(fixture);
  assert.throws(() => validateCaches(fixture.replace('-${{ runner.arch }}-1', '-1')));
  assert.throws(() => validateCaches(`${fixture}            k-\n`));
  assert.throws(() => validateCaches(fixture.replace('restore-keys: |\n           ', 'restore-keys:')));
  assert.throws(() => validateCaches(fixture.replace('uses: actions/cache@v4', "uses: 'actions/cache/restore@v4'").replace('-${{ runner.arch }}-1', '-1')));
});

for (const file of STATIC) {
  test(`mutation rejected: ${file} X64 pin`, () => {
    const text = read(file);
    assert.throws(() => validateStatic(text.replaceAll(staticSelector, `[self-hosted, Linux, X64, ${LABEL}]`)));
  });
}
