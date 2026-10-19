import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Routing contract of the shared self-hosted pool (Mac ARM64 + Windows X64).
// Same-repository events use the architecture-neutral project label; fork PRs
// stay on GitHub-hosted runners and never reach the host Docker socket.
const LABEL = "react-doctor-local-hermes-ephemeral";
const SHARED = ["self-hosted", "Linux", LABEL];
// Workflows reachable from pull_request (dynamic trusted selector).
const ROUTED = [".github/workflows/ci.yml"];
// Push/tag-only workflows: forks cannot trigger them, static neutral list.
const STATIC = [];
// Workflow that runs these guards.
const GUARD = ".github/workflows/ci.yml";

const trust =
  "github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository";
const selector = `\${{ fromJSON((${trust}) && (inputs.qualification_host == 'mac' && '${JSON.stringify([...SHARED, "ci-host-tlpr-mac"])}' || inputs.qualification_host == 'x64' && '${JSON.stringify([...SHARED, "X64"])}' || '${JSON.stringify(SHARED)}') || '"ubuntu-latest"') }}`;
const staticSelector = `[${SHARED.join(", ")}]`;
const pad = (n) => " ".repeat(n);
const evidence = [
  `${pad(6)}- name: Execution architecture evidence`,
  `${pad(8)}if: \${{ ${trust} }}`,
  `${pad(8)}run: bash scripts/ci-host-evidence.sh`,
  "",
].join("\n");
const dispatch = [
  `${pad(2)}workflow_dispatch:`,
  `${pad(4)}inputs:`,
  `${pad(6)}qualification_host:`,
  `${pad(8)}description: Runner qualification (x64 selects ABI only)`,
  `${pad(8)}required: false`,
  `${pad(8)}default: shared`,
  `${pad(8)}type: choice`,
  `${pad(8)}options: [shared, mac, x64]`,
  "",
].join("\n");
const read = (file) => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
const indent = (line) => line.length - line.trimStart().length;
// Text without YAML comments (full-line and trailing ` #`), for key-level checks.
const code = (text) =>
  text
    .split("\n")
    .filter((l) => !l.trimStart().startsWith("#"))
    .map((l) => l.replace(/\s+#.*$/, ""))
    .join("\n");
const keyCount = (text, key) =>
  (code(text).match(new RegExp(`^\\s*(- )?['"]?${key}['"]?\\s*:`, "gm")) ?? []).length;

// Event names of the top-level `on:` key (scalar, flow list or block mapping).
function triggers(text) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => /^["']?on["']?:/.test(l));
  assert.ok(start >= 0, "top-level on:");
  const inline = lines[start]
    .replace(/^["']?on["']?:/, "")
    .replace(/#.*/, "")
    .trim();
  if (inline)
    return inline
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""));
  const block = [];
  for (const line of lines.slice(start + 1)) {
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;
    if (indent(line) === 0) break;
    block.push(line);
  }
  assert.ok(block.length > 0, "triggers declared");
  const level = indent(block[0]);
  for (const line of block) assert.ok(indent(line) >= level, "consistent trigger indentation");
  return block
    .filter((line) => indent(line) === level)
    .map((line) =>
      line
        .trim()
        .replace(/:.*$/, "")
        .replace(/^- /, "")
        .replace(/^["']|["']$/g, ""),
    );
}

// Job bodies under the top-level `jobs:` key.
function jobs(text) {
  const lines = text.split("\n");
  const start = lines.indexOf("jobs:");
  assert.ok(start >= 0, "top-level jobs:");
  const list = [];
  for (const line of lines.slice(start + 1)) {
    if (line.trim() !== "" && indent(line) === 0 && !line.startsWith("#")) break;
    if (line.trim() !== "" && !line.trimStart().startsWith("#") && indent(line) <= 2) {
      // Every job header must be recognised: nothing is silently skipped.
      assert.match(line, /^ {2}[A-Za-z0-9_-]+: *(#.*)?$/, `job header ${line}`);
      list.push([]);
    } else if (list.length) list[list.length - 1].push(line);
  }
  return list.map((body) => `\n${body.join("\n")}\n`);
}

// Steps of a job, each as its own text block.
function steps(job) {
  return job.split(/\n(?= {6}- )/).slice(1);
}

function validateJobs(text, expectedRunsOn) {
  const list = jobs(text);
  assert.ok(list.length > 0, "at least one pool job");
  for (const job of list) {
    const runsOn = job.match(/^ {4}runs-on:.*$/gm) ?? [];
    assert.deepEqual(runsOn, [`${pad(4)}runs-on: ${expectedRunsOn}`], "neutral pool selector");
    assert.equal(keyCount(job, "runs-on"), 1, "single runs-on key");
    assert.doesNotMatch(job, /^ {4}if: *(false|\$\{\{ *false *\}\})/m, "job not disabled");
    const checkout = job.search(/\n {6}- name: Checkout[^\n]*\n {8}uses: actions\/checkout@v\d+\n/);
    const proof = job.indexOf(evidence);
    assert.ok(checkout >= 0, "named checkout");
    assert.ok(proof > checkout, "evidence after checkout");
    assert.equal(job.split(evidence).length, 2, "one evidence step per job");
    for (const tool of ["actions/setup-node@", "actions/setup-python@", "pnpm/action-setup@"]) {
      const p = job.indexOf(`uses: ${tool}`);
      if (p >= 0) assert.ok(proof < p, `evidence before ${tool}`);
    }
  }
}

function validateRouted(text) {
  validateTriggerText(text);
  const events = triggers(text);
  assert.ok(events.includes("workflow_dispatch"), "manual qualification");
  for (const event of events)
    assert.ok(["push", "pull_request", "workflow_dispatch"].includes(event), `trigger ${event}`);
  assert.ok(text.includes(`\n${dispatch}`), "qualification_host input");
  assert.match(text, /\npermissions:\n {2}contents: (read|write)\n/);
  validateJobs(text, selector);
}

function validateTriggerText(text) {
  assert.doesNotMatch(
    code(text),
    /pull_request_target|workflow_run/,
    "no privileged fork-reachable triggers",
  );
}

function validateStatic(text) {
  validateTriggerText(text);
  for (const event of triggers(text))
    assert.ok(["push", "workflow_dispatch", "schedule"].includes(event), `trigger ${event}`);
  validateJobs(text, staticSelector);
}

function validateCaches(text) {
  assert.doesNotMatch(text, /enableCrossOsArchive/);
  // Built-in setup caches are OS and architecture scoped from these majors on.
  for (const [, major] of text.matchAll(/uses: ['"]?actions\/setup-node@v(\d+)/g))
    assert.ok(Number(major) >= 4);
  for (const [, major] of text.matchAll(/uses: ['"]?actions\/setup-python@v(\d+)/g))
    assert.ok(Number(major) >= 5);
  const scoped = "${{ runner.os }}-${{ runner.arch }}";
  for (const step of text.split(/\n(?= *- )/)) {
    if (!/uses: *['"]?actions\/cache(\/(restore|save))?@/.test(step)) continue;
    const lines = step.split("\n");
    const value = (l) => l.replace(/\s+#.*$/, "");
    const keys = lines.filter((l) => /^ *key:/.test(l)).map(value);
    assert.equal(keys.length, 1, "one explicit cache key");
    assert.ok(keys[0].includes(scoped), "cache key is OS and ABI scoped");
    const r = lines.findIndex((l) => /^ *restore-keys:/.test(l));
    if (r < 0) continue;
    assert.match(lines[r], /restore-keys: *\|-?$/, "block restore-keys only");
    for (const line of lines.slice(r + 1)) {
      if (line.trim() === "") continue;
      if (indent(line) <= indent(lines[r])) break;
      assert.ok(value(line).includes(scoped), "restore prefix is OS and ABI scoped");
    }
  }
}

function validateGuard(text) {
  const job = jobs(text).find((j) => j.includes("- name: CI regression guards"));
  assert.ok(job, "guard step present");
  assert.doesNotMatch(job, /^ {4}(if|continue-on-error):/m, "guard job unconditional");
  const step = steps(job).find((s) => s.includes("name: CI regression guards"));
  assert.match(
    step,
    /\n {8}run: node --test tests\/ci\/\*\.test\.mjs *(\n|$)/,
    "exact guard invocation",
  );
  assert.equal(keyCount(step, "run"), 1, "single guard command");
  assert.doesNotMatch(
    step,
    /^ {6}- (if|continue-on-error):|^ {8}(if|continue-on-error):/m,
    "guard step unconditional",
  );
  if (!ROUTED.includes(GUARD)) {
    for (const hosted of jobs(text)) {
      assert.equal(keyCount(hosted, "runs-on"), 1, "single runs-on key");
      assert.match(hosted, /\n {4}runs-on: ubuntu-latest\n/, "hosted CI unchanged");
    }
  }
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

if (!ROUTED.includes(GUARD)) {
  test("mutation rejected: hosted CI moved to a self-hosted pool", () => {
    const text = read(GUARD);
    for (const mutated of [
      text.replace("runs-on: ubuntu-latest", "runs-on: [self-hosted, Linux, unsafe]"),
      text.replace(
        `\n${pad(4)}runs-on: ubuntu-latest`,
        `\n${pad(4)}'runs-on': [self-hosted, Linux, unsafe]`,
      ),
    ]) {
      assert.notEqual(mutated, text);
      assert.throws(() => validateGuard(mutated));
    }
  });
}

test("selector truth table: forks hosted, same-repo PR/push/manual share the pool", () => {
  const expression = selector.slice(4, -3).replaceAll("fromJSON(", "JSON.parse(");
  const evaluate = new Function("github", "inputs", `return (${expression});`);
  for (const event of ["pull_request", "push", "workflow_dispatch"]) {
    for (const sameRepo of [true, false]) {
      for (const choice of [undefined, "shared", "mac", "x64"]) {
        const full = sameRepo ? "owner/repo" : "fork/repo";
        const github = {
          event_name: event,
          repository: "owner/repo",
          event: { pull_request: { head: { repo: { full_name: full } } } },
        };
        const expected =
          event === "pull_request" && !sameRepo
            ? "ubuntu-latest"
            : [
                ...SHARED,
                ...(choice === "mac" ? ["ci-host-tlpr-mac"] : choice === "x64" ? ["X64"] : []),
              ];
        assert.deepEqual(evaluate(github, { qualification_host: choice }), expected);
      }
    }
  }
  for (const event_name of ["push", "workflow_dispatch"]) {
    assert.deepEqual(evaluate({ event_name, event: {}, repository: "owner/repo" }, {}), SHARED);
  }
});

const routedMutations = [
  ["X64 pin", `|| '${JSON.stringify(SHARED)}'`, `|| '${JSON.stringify([...SHARED, "X64"])}'`],
  ["ARM64 pin", `|| '${JSON.stringify(SHARED)}'`, `|| '${JSON.stringify([...SHARED, "ARM64"])}'`],
  ["Linux selector", '"Linux"', '"macOS"'],
  ["project label", `"${LABEL}"`, '"wrong-pool"'],
  ["Mac additive label", "ci-host-tlpr-mac", "ARM64"],
  ["x64 ABI label", '"X64"', '"ci-host-windows"'],
  ["fork routing trust", `fromJSON((${trust})`, "fromJSON((true)"],
  ["fork hosted fallback", `'"ubuntu-latest"'`, `'"self-hosted"'`],
  [
    "fork evidence trust",
    `if: \${{ ${trust} }}\n${pad(8)}run: bash`,
    `if: always()\n${pad(8)}run: bash`,
  ],
  ["evidence removed", "run: bash scripts/ci-host-evidence.sh", "run: echo skipped"],
  ["manual choices", "options: [shared, mac, x64]", "options: [shared, mac]"],
  ["pull_request_target trigger", "\non:\n", "\non:\n  pull_request_target:\n"],
  ["flow pull_request_target trigger", null, null],
  ["job disabled", `\n${pad(4)}runs-on:`, `\n${pad(4)}if: false\n${pad(4)}runs-on:`],
  ["evidence moved before checkout", null, null],
  [
    "commented rogue job",
    "\njobs:\n",
    "\njobs:\n  rogue: # injected\n    runs-on: [self-hosted, Linux, X64]\n",
  ],
  [
    "quoted runs-on key",
    `\n${pad(4)}runs-on:`,
    `\n${pad(4)}'runs-on': [self-hosted, Linux, X64]\n${pad(4)}x-runs-on:`,
  ],
  ["nested pull_request_target", "\non:\n", "\non:\n    pull_request_target:\n"],
];
for (const [name, before, after] of routedMutations) {
  for (const file of ROUTED) {
    test(`mutation rejected: ${name} (${file})`, () => {
      const text = read(file);
      let mutated;
      if (name === "flow pull_request_target trigger") {
        mutated = text.replace(
          /\non:\n(?: .*\n|\n)*/,
          "\non: [pull_request_target, workflow_dispatch]\n",
        );
      } else if (name === "evidence moved before checkout") {
        const job = jobs(text)[0];
        const moved = job
          .replace(evidence, "")
          .replace(/\n {6}- name: Checkout/, `\n${evidence}${pad(6)}- name: Checkout`);
        mutated = text.replace(job.slice(1, -1), moved.slice(1, -1));
      } else {
        if (!text.includes(before)) return; // not every workflow carries every target
        mutated = text.replaceAll(before, after);
      }
      assert.notEqual(mutated, text, `mutation applied: ${name}`);
      assert.throws(() => {
        validateRouted(mutated);
        validateCaches(mutated);
      });
    });
  }
}

for (const file of STATIC) {
  for (const [name, mutate] of [
    ["X64 pin", (t) => t.replaceAll(staticSelector, `[self-hosted, Linux, X64, ${LABEL}]`)],
    ["pull_request trigger", (t) => t.replace("\non:\n", "\non:\n  pull_request:\n")],
    [
      "flow pull_request_target trigger",
      (t) => t.replace(/\non:\n(?: .*\n|\n)*/, "\non: [push, pull_request_target]\n"),
    ],
    [
      "evidence removed",
      (t) => t.replaceAll("run: bash scripts/ci-host-evidence.sh", "run: echo skipped"),
    ],
    [
      "nested pull_request_target",
      (t) => t.replace("\non:\n", "\non:\n    pull_request_target:\n"),
    ],
    [
      "commented rogue job",
      (t) =>
        t.replace(
          "\njobs:\n",
          "\njobs:\n  rogue: # injected\n    runs-on: [self-hosted, Linux, X64]\n",
        ),
    ],
    [
      "job disabled",
      (t) => t.replace(`\n${pad(4)}runs-on:`, `\n${pad(4)}if: \${{ false }}\n${pad(4)}runs-on:`),
    ],
  ]) {
    test(`mutation rejected: ${name} (${file})`, () => {
      const text = read(file);
      const mutated = mutate(text);
      assert.notEqual(mutated, text);
      assert.throws(() => validateStatic(mutated));
    });
  }
}

test("mutation rejected: guard step removed, softened or disabled", () => {
  const text = read(GUARD);
  const name = `${pad(6)}- name: CI regression guards\n`;
  for (const mutated of [
    text.replaceAll("run: node --test tests/ci/*.test.mjs", "run: echo skipped"),
    text.replace(name, `${name}${pad(8)}continue-on-error: true\n`),
    text.replace(name, `${pad(6)}- if: false\n${pad(8)}name: CI regression guards\n`),
    text.replace(name, `${name}${pad(8)}if: \${{ false }}\n`),
    text.replaceAll(
      "run: node --test tests/ci/*.test.mjs",
      "run: node --test tests/ci/*.test.mjs || true",
    ),
  ]) {
    assert.notEqual(mutated, text);
    assert.throws(() => validateGuard(mutated));
  }
  const job = jobs(text).find((j) => j.includes(name));
  const disabled = job.replace(/\n {4}runs-on:/, `\n${pad(4)}if: false\n${pad(4)}runs-on:`);
  assert.throws(() => validateGuard(text.replace(job.slice(1, -1), disabled.slice(1, -1))));
});

test("comments and step ids do not trip key-level checks", () => {
  for (const file of ROUTED) {
    const text = read(file);
    const commented = text
      .replace("\njobs:\n", "\n# Do not enable pull_request_target for fork PRs.\njobs:\n")
      .replace(
        `\n${pad(4)}runs-on:`,
        `\n${pad(4)}# Keep runs-on architecture neutral.\n${pad(4)}runs-on:`,
      );
    validateRouted(commented);
  }
  const text = read(GUARD);
  validateGuard(
    text.replace(
      `${pad(6)}- name: CI regression guards\n`,
      `${pad(6)}- name: CI regression guards\n${pad(8)}id: run-guards\n`,
    ),
  );
});

test("cache validator: ABI-scoped keys and restores only", () => {
  const fixture = [
    `${pad(6)}- name: Cache`,
    `${pad(8)}uses: actions/cache@v4`,
    `${pad(8)}with:`,
    `${pad(10)}path: x`,
    `${pad(10)}key: k-\${{ runner.os }}-\${{ runner.arch }}-1`,
    `${pad(10)}restore-keys: |`,
    `${pad(12)}k-\${{ runner.os }}-\${{ runner.arch }}-`,
    "",
  ].join("\n");
  validateCaches(fixture);
  assert.throws(() => validateCaches(fixture.replace("-${{ runner.arch }}-1", "-1")));
  assert.throws(() => validateCaches(`${fixture}${pad(12)}k-\n`));
  assert.throws(() => validateCaches(`${fixture}${pad(11)}k-\n`));
  assert.throws(() =>
    validateCaches(fixture.replace(`restore-keys: |\n${pad(12)}`, "restore-keys: ")),
  );
  assert.throws(() =>
    validateCaches(
      fixture
        .replace("uses: actions/cache@v4", "uses: 'actions/cache/restore@v4'")
        .replace("-${{ runner.arch }}-1", "-1"),
    ),
  );
  assert.throws(() =>
    validateCaches(fixture.replace("path: x", "path: x\n          enableCrossOsArchive: true")),
  );
  assert.throws(() =>
    validateCaches(
      fixture.replace(
        "key: k-${{ runner.os }}-${{ runner.arch }}-1",
        "key: broad # ${{ runner.os }}-${{ runner.arch }}",
      ),
    ),
  );
});
