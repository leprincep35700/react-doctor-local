import { createRequire } from "node:module";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import pc from "picocolors";
import { main } from "knip";
import { createOptions } from "knip/session";
import os from "node:os";
import { fileURLToPath } from "node:url";
//#region src/constants.ts
const SOURCE_FILE_PATTERN = /\.(tsx?|jsx?)$/;
const JSX_FILE_PATTERN = /\.(tsx|jsx)$/;
const GIT_LS_FILES_MAX_BUFFER_BYTES = 50 * 1024 * 1024;
const DEFAULT_BRANCH_CANDIDATES = ["main", "master"];
const ERROR_RULE_PENALTY = 1.5;
const WARNING_RULE_PENALTY = .75;
const KNIP_CONFIG_LOCATIONS = [
	"knip.json",
	"knip.jsonc",
	".knip.json",
	".knip.jsonc",
	"knip.ts",
	"knip.js",
	"knip.config.ts",
	"knip.config.js"
];
const ADOPTABLE_LINT_CONFIG_FILENAMES = [".oxlintrc.json", ".eslintrc.json"];
const IGNORED_DIRECTORIES = new Set([
	"node_modules",
	"dist",
	"build",
	"coverage"
]);
const PROXY_OUTPUT_MAX_BYTES = 50 * 1024 * 1024;
const buildNoReactDependencyError = (directory) => `No React dependency found in ${directory}/package.json. Add "react" to dependencies (or peerDependencies) and re-run.`;
//#endregion
//#region src/utils/summarize-diagnostics.ts
const summarizeDiagnostics = (diagnostics, worstScore = null, worstScoreLabel = null) => {
	let errorCount = 0;
	let warningCount = 0;
	const affectedFiles = /* @__PURE__ */ new Set();
	for (const diagnostic of diagnostics) {
		if (diagnostic.severity === "error") errorCount++;
		else warningCount++;
		affectedFiles.add(diagnostic.filePath);
	}
	return {
		errorCount,
		warningCount,
		affectedFileCount: affectedFiles.size,
		totalDiagnosticCount: diagnostics.length,
		score: worstScore,
		scoreLabel: worstScoreLabel
	};
};
//#endregion
//#region src/utils/build-json-report.ts
const toJsonDiff = (diff) => {
	if (!diff) return null;
	return {
		baseBranch: diff.baseBranch,
		currentBranch: diff.currentBranch,
		changedFileCount: diff.changedFiles.length,
		isCurrentChanges: Boolean(diff.isCurrentChanges)
	};
};
const findWorstScoredProject = (projects) => {
	let worst = null;
	let worstScore = Number.POSITIVE_INFINITY;
	for (const project of projects) {
		const score = project.score?.score;
		if (typeof score !== "number") continue;
		if (score < worstScore) {
			worstScore = score;
			worst = project;
		}
	}
	return worst;
};
const buildJsonReport = (input) => {
	const projects = input.scans.map(({ directory, result }) => ({
		directory,
		project: result.project,
		diagnostics: result.diagnostics,
		score: result.score,
		skippedChecks: result.skippedChecks,
		elapsedMilliseconds: result.elapsedMilliseconds
	}));
	const flattenedDiagnostics = projects.flatMap((entry) => entry.diagnostics);
	const worstScoredProject = findWorstScoredProject(projects);
	const summary = summarizeDiagnostics(flattenedDiagnostics, worstScoredProject?.score?.score ?? null, worstScoredProject?.score?.label ?? null);
	return {
		schemaVersion: 1,
		version: input.version,
		ok: true,
		directory: input.directory,
		mode: input.mode,
		diff: toJsonDiff(input.diff),
		projects,
		diagnostics: flattenedDiagnostics,
		summary,
		elapsedMilliseconds: input.totalElapsedMilliseconds,
		error: null
	};
};
//#endregion
//#region src/utils/format-error-chain.ts
const collectErrorChain = (rootError) => {
	const errorChain = [];
	const visitedErrors = /* @__PURE__ */ new Set();
	let currentError = rootError;
	while (currentError !== void 0 && !visitedErrors.has(currentError)) {
		visitedErrors.add(currentError);
		errorChain.push(currentError);
		currentError = currentError instanceof Error ? currentError.cause : void 0;
	}
	return errorChain;
};
const formatErrorMessage = (error) => error instanceof Error ? error.message || error.name : String(error);
const getErrorChainMessages = (rootError) => collectErrorChain(rootError).map(formatErrorMessage);
//#endregion
//#region src/utils/build-json-report-error.ts
const safeStringify = (value) => {
	try {
		return String(value);
	} catch {
		return "Unrepresentable error";
	}
};
const safeGetErrorChain = (error) => {
	try {
		return getErrorChainMessages(error);
	} catch {
		return [safeStringify(error)];
	}
};
const buildJsonReportError = (input) => {
	const chain = safeGetErrorChain(input.error);
	const errorPayload = input.error instanceof Error ? {
		message: input.error.message || input.error.name || "Error",
		name: input.error.name || "Error",
		chain
	} : {
		message: safeStringify(input.error),
		name: "Error",
		chain
	};
	return {
		schemaVersion: 1,
		version: input.version,
		ok: false,
		directory: input.directory,
		mode: input.mode ?? "full",
		diff: null,
		projects: [],
		diagnostics: [],
		summary: {
			errorCount: 0,
			warningCount: 0,
			affectedFileCount: 0,
			totalDiagnosticCount: 0,
			score: null,
			scoreLabel: null
		},
		elapsedMilliseconds: input.elapsedMilliseconds,
		error: errorPayload
	};
};
//#endregion
//#region src/utils/calculate-score-locally.ts
const getScoreLabel = (score) => {
	if (score >= 75) return "Great";
	if (score >= 50) return "Needs work";
	return "Critical";
};
const countUniqueRules = (diagnostics) => {
	const errorRules = /* @__PURE__ */ new Set();
	const warningRules = /* @__PURE__ */ new Set();
	for (const diagnostic of diagnostics) {
		const ruleKey = `${diagnostic.plugin}/${diagnostic.rule}`;
		if (diagnostic.severity === "error") errorRules.add(ruleKey);
		else warningRules.add(ruleKey);
	}
	return {
		errorRuleCount: errorRules.size,
		warningRuleCount: warningRules.size
	};
};
const scoreFromRuleCounts = (errorRuleCount, warningRuleCount) => {
	const penalty = errorRuleCount * ERROR_RULE_PENALTY + warningRuleCount * WARNING_RULE_PENALTY;
	return Math.max(0, Math.round(100 - penalty));
};
const calculateScoreLocally = (diagnostics) => {
	const { errorRuleCount, warningRuleCount } = countUniqueRules(diagnostics);
	const score = scoreFromRuleCounts(errorRuleCount, warningRuleCount);
	return {
		score,
		label: getScoreLabel(score)
	};
};
//#endregion
//#region src/utils/calculate-score.ts
const calculateScore = async (diagnostics) => calculateScoreLocally(diagnostics);
//#endregion
//#region src/plugin/constants.ts
const FETCH_CALLEE_NAMES = new Set([
	"fetch",
	"ky",
	"got",
	"wretch",
	"ofetch"
]);
const FETCH_MEMBER_OBJECTS = new Set([
	"axios",
	"ky",
	"got",
	"ofetch",
	"wretch",
	"request"
]);
const TIMER_AND_SCHEDULER_DIRECT_CALLEE_NAMES = new Set([
	"setTimeout",
	"setInterval",
	"requestAnimationFrame",
	"requestIdleCallback",
	"queueMicrotask"
]);
const SUBSCRIPTION_METHOD_NAMES = new Set([
	"subscribe",
	"addEventListener",
	"addListener",
	"on",
	"watch",
	"listen",
	"sub"
]);
new Set([
	...new Set([
		"unsubscribe",
		"removeEventListener",
		"removeListener",
		"off",
		"unwatch",
		"unlisten",
		"unsub"
	]),
	"cleanup",
	"dispose",
	"destroy",
	"teardown"
]);
new Set([
	...SUBSCRIPTION_METHOD_NAMES,
	"connect",
	"disconnect",
	"open",
	"close",
	"fetch",
	"post",
	"put",
	"patch"
]);
new Set([
	...FETCH_MEMBER_OBJECTS,
	"api",
	"client",
	"http",
	"fetcher"
]);
new Set([...FETCH_CALLEE_NAMES, ...TIMER_AND_SCHEDULER_DIRECT_CALLEE_NAMES]);
new Set([
	...FETCH_CALLEE_NAMES,
	"post",
	"put",
	"patch",
	"navigate",
	"navigateTo",
	"showNotification",
	"toast",
	"alert",
	"confirm",
	"logVisit",
	"captureEvent"
]);
const MOTION_LIBRARY_PACKAGES = new Set(["framer-motion", "motion"]);
//#endregion
//#region src/utils/is-file.ts
const isFile = (filePath) => {
	try {
		return fs.statSync(filePath).isFile();
	} catch {
		return false;
	}
};
//#endregion
//#region src/utils/read-package-json.ts
const cachedPackageJsons = /* @__PURE__ */ new Map();
const clearPackageJsonCache = () => {
	cachedPackageJsons.clear();
};
const readPackageJsonUncached = (packageJsonPath) => {
	try {
		return JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
	} catch (error) {
		if (error instanceof SyntaxError) return {};
		if (error instanceof Error && "code" in error) {
			const { code } = error;
			if (code === "EISDIR" || code === "EACCES") return {};
		}
		throw error;
	}
};
const readPackageJson = (packageJsonPath) => {
	const absolutePath = path.resolve(packageJsonPath);
	const cached = cachedPackageJsons.get(absolutePath);
	if (cached !== void 0) return cached;
	const result = readPackageJsonUncached(absolutePath);
	cachedPackageJsons.set(absolutePath, result);
	return result;
};
//#endregion
//#region src/utils/check-reduced-motion.ts
const REDUCED_MOTION_GREP_PATTERN = "prefers-reduced-motion|useReducedMotion|MotionConfig|reducedMotion";
const REDUCED_MOTION_FILE_GLOBS = [
	"*.ts",
	"*.tsx",
	"*.js",
	"*.jsx",
	"*.css",
	"*.scss"
];
const MISSING_REDUCED_MOTION_DIAGNOSTIC = {
	filePath: "package.json",
	plugin: "react-doctor",
	rule: "require-reduced-motion",
	severity: "error",
	message: "Project uses a motion library but has no prefers-reduced-motion handling — required for accessibility (WCAG 2.3.3)",
	help: "Add `useReducedMotion()` from your animation library, or a `@media (prefers-reduced-motion: reduce)` CSS query",
	line: 0,
	column: 0,
	category: "Accessibility"
};
const checkReducedMotion = (rootDirectory) => {
	const packageJsonPath = path.join(rootDirectory, "package.json");
	if (!isFile(packageJsonPath)) return [];
	let hasMotionLibrary = false;
	try {
		const packageJson = readPackageJson(packageJsonPath);
		const allDependencies = {
			...packageJson.dependencies,
			...packageJson.devDependencies
		};
		hasMotionLibrary = Object.keys(allDependencies).some((packageName) => MOTION_LIBRARY_PACKAGES.has(packageName));
	} catch {
		return [];
	}
	if (!hasMotionLibrary) return [];
	const result = spawnSync("git", [
		"grep",
		"-ql",
		"-E",
		REDUCED_MOTION_GREP_PATTERN,
		"--",
		...REDUCED_MOTION_FILE_GLOBS
	], {
		cwd: rootDirectory,
		stdio: [
			"ignore",
			"pipe",
			"pipe"
		]
	});
	if (result.error) return [MISSING_REDUCED_MOTION_DIAGNOSTIC];
	if (result.status === 0) return [];
	return [MISSING_REDUCED_MOTION_DIAGNOSTIC];
};
//#endregion
//#region src/utils/parse-gitattributes-linguist.ts
const LINGUIST_ATTRIBUTE_PATTERN = /^linguist-(?:vendored|generated)(?:=([a-zA-Z0-9]+))?$/i;
const FALSY_VALUES = new Set([
	"false",
	"0",
	"off",
	"no"
]);
const isTruthyLinguistAttribute = (token) => {
	const match = LINGUIST_ATTRIBUTE_PATTERN.exec(token);
	if (!match) return false;
	if (match[1] === void 0) return true;
	return !FALSY_VALUES.has(match[1].toLowerCase());
};
const parseGitattributesLinguistPaths = (filePath) => {
	let content;
	try {
		content = fs.readFileSync(filePath, "utf-8");
	} catch {
		return [];
	}
	const paths = [];
	for (const rawLine of content.split("\n")) {
		const line = rawLine.trim();
		if (line.length === 0 || line.startsWith("#")) continue;
		const tokens = line.split(/\s+/);
		if (tokens.length < 2) continue;
		const [pathSpec, ...attributes] = tokens;
		if (attributes.some(isTruthyLinguistAttribute)) paths.push(pathSpec);
	}
	return paths;
};
//#endregion
//#region src/utils/highlighter.ts
const highlighter = {
	error: pc.red,
	warn: pc.yellow,
	info: pc.cyan,
	success: pc.green,
	dim: pc.dim,
	gray: pc.gray,
	bold: pc.bold
};
const logger = {
	error(...args) {
		console.error(highlighter.error(args.join(" ")));
	},
	warn(...args) {
		console.warn(highlighter.warn(args.join(" ")));
	},
	info(...args) {
		console.log(highlighter.info(args.join(" ")));
	},
	success(...args) {
		console.log(highlighter.success(args.join(" ")));
	},
	dim(...args) {
		console.log(highlighter.dim(args.join(" ")));
	},
	log(...args) {
		console.log(args.join(" "));
	},
	break() {
		console.log("");
	}
};
//#endregion
//#region src/utils/read-ignore-file.ts
const stripGitignoreEscape = (pattern) => {
	if (pattern.startsWith("\\#") || pattern.startsWith("\\!")) return pattern.slice(1);
	return pattern;
};
const readIgnoreFile = (filePath) => {
	let content;
	try {
		content = fs.readFileSync(filePath, "utf-8");
	} catch (error) {
		const errnoCode = error?.code;
		if (errnoCode && errnoCode !== "ENOENT") logger.warn(`Could not read ignore file ${filePath}: ${errnoCode}`);
		return [];
	}
	const patterns = [];
	for (const line of content.split("\n")) {
		const trimmed = line.trim();
		if (trimmed.length === 0) continue;
		if (trimmed.startsWith("#")) continue;
		patterns.push(stripGitignoreEscape(trimmed));
	}
	return patterns;
};
//#endregion
//#region src/utils/collect-ignore-patterns.ts
const IGNORE_FILENAMES = [
	".eslintignore",
	".oxlintignore",
	".prettierignore"
];
const cachedPatternsByRoot = /* @__PURE__ */ new Map();
const clearIgnorePatternsCache = () => {
	cachedPatternsByRoot.clear();
};
const computeIgnorePatterns = (rootDirectory) => {
	const seen = /* @__PURE__ */ new Set();
	const patterns = [];
	const addPattern = (pattern) => {
		if (seen.has(pattern)) return;
		seen.add(pattern);
		patterns.push(pattern);
	};
	for (const filename of IGNORE_FILENAMES) for (const pattern of readIgnoreFile(path.join(rootDirectory, filename))) addPattern(pattern);
	for (const linguistPath of parseGitattributesLinguistPaths(path.join(rootDirectory, ".gitattributes"))) addPattern(linguistPath);
	return patterns;
};
const collectIgnorePatterns = (rootDirectory) => {
	const cached = cachedPatternsByRoot.get(rootDirectory);
	if (cached !== void 0) return cached;
	const patterns = computeIgnorePatterns(rootDirectory);
	cachedPatternsByRoot.set(rootDirectory, patterns);
	return patterns;
};
//#endregion
//#region src/utils/find-monorepo-root.ts
const isMonorepoRoot = (directory) => {
	if (isFile(path.join(directory, "pnpm-workspace.yaml"))) return true;
	if (isFile(path.join(directory, "nx.json"))) return true;
	const packageJsonPath = path.join(directory, "package.json");
	if (!isFile(packageJsonPath)) return false;
	const packageJson = readPackageJson(packageJsonPath);
	return Array.isArray(packageJson.workspaces) || Boolean(packageJson.workspaces?.packages);
};
const findMonorepoRoot = (startDirectory) => {
	let currentDirectory = path.dirname(startDirectory);
	while (currentDirectory !== path.dirname(currentDirectory)) {
		if (isMonorepoRoot(currentDirectory)) return currentDirectory;
		currentDirectory = path.dirname(currentDirectory);
	}
	return null;
};
//#endregion
//#region src/utils/is-plain-object.ts
const isPlainObject = (value) => {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === null || prototype === Object.prototype;
};
//#endregion
//#region src/utils/discover-project.ts
const REACT_COMPILER_PACKAGES = new Set([
	"babel-plugin-react-compiler",
	"react-compiler-runtime",
	"eslint-plugin-react-compiler"
]);
const TANSTACK_QUERY_PACKAGES = new Set([
	"@tanstack/react-query",
	"@tanstack/query-core",
	"react-query"
]);
const NEXT_CONFIG_FILENAMES = [
	"next.config.js",
	"next.config.mjs",
	"next.config.ts",
	"next.config.cjs"
];
const BABEL_CONFIG_FILENAMES = [
	".babelrc",
	".babelrc.json",
	"babel.config.js",
	"babel.config.json",
	"babel.config.cjs",
	"babel.config.mjs"
];
const VITE_CONFIG_FILENAMES = [
	"vite.config.js",
	"vite.config.ts",
	"vite.config.mjs",
	"vite.config.mts",
	"vite.config.cjs",
	"vite.config.cts",
	"vitest.config.ts",
	"vitest.config.js"
];
const EXPO_APP_CONFIG_FILENAMES = [
	"app.json",
	"app.config.js",
	"app.config.ts"
];
const REACT_COMPILER_PACKAGE_REFERENCE_PATTERN = /babel-plugin-react-compiler|react-compiler-runtime|eslint-plugin-react-compiler|["']react-compiler["']/;
const REACT_COMPILER_ENABLED_FLAG_PATTERN = /["']?reactCompiler["']?\s*:\s*(?:true\b|\{)/;
const FRAMEWORK_PACKAGES = {
	next: "nextjs",
	"@tanstack/react-start": "tanstack-start",
	vite: "vite",
	"react-scripts": "cra",
	"@remix-run/react": "remix",
	gatsby: "gatsby",
	expo: "expo",
	"react-native": "react-native"
};
const countSourceFilesViaFilesystem = (rootDirectory) => {
	let count = 0;
	const stack = [rootDirectory];
	while (stack.length > 0) {
		const currentDirectory = stack.pop();
		const entries = fs.readdirSync(currentDirectory, { withFileTypes: true });
		for (const entry of entries) {
			if (entry.isDirectory()) {
				if (!entry.name.startsWith(".") && !IGNORED_DIRECTORIES.has(entry.name)) stack.push(path.join(currentDirectory, entry.name));
				continue;
			}
			if (entry.isFile() && SOURCE_FILE_PATTERN.test(entry.name)) count++;
		}
	}
	return count;
};
const countSourceFilesViaGit = (rootDirectory) => {
	const result = spawnSync("git", [
		"ls-files",
		"-z",
		"--cached",
		"--others",
		"--exclude-standard"
	], {
		cwd: rootDirectory,
		encoding: "utf-8",
		maxBuffer: GIT_LS_FILES_MAX_BUFFER_BYTES
	});
	if (result.error || result.status !== 0) return null;
	return result.stdout.split("\0").filter((filePath) => filePath.length > 0 && SOURCE_FILE_PATTERN.test(filePath)).length;
};
const countSourceFiles = (rootDirectory) => countSourceFilesViaGit(rootDirectory) ?? countSourceFilesViaFilesystem(rootDirectory);
const collectAllDependencies = (packageJson) => ({
	...packageJson.peerDependencies,
	...packageJson.dependencies,
	...packageJson.devDependencies
});
const detectFramework = (dependencies) => {
	for (const [packageName, frameworkName] of Object.entries(FRAMEWORK_PACKAGES)) if (dependencies[packageName]) return frameworkName;
	return "unknown";
};
const isCatalogReference = (version) => version.startsWith("catalog:");
const extractCatalogName = (version) => {
	if (!isCatalogReference(version)) return null;
	const name = version.slice(8).trim();
	return name.length > 0 ? name : null;
};
const resolveVersionFromCatalog = (catalog, packageName) => {
	const version = catalog[packageName];
	if (typeof version === "string" && !isCatalogReference(version)) return version;
	return null;
};
const parsePnpmWorkspaceCatalogs = (rootDirectory) => {
	const workspacePath = path.join(rootDirectory, "pnpm-workspace.yaml");
	if (!isFile(workspacePath)) return {
		defaultCatalog: {},
		namedCatalogs: {}
	};
	const content = fs.readFileSync(workspacePath, "utf-8");
	const defaultCatalog = {};
	const namedCatalogs = {};
	let currentSection = "none";
	let currentCatalogName = "";
	for (const line of content.split("\n")) {
		const trimmed = line.trim();
		if (trimmed.length === 0 || trimmed.startsWith("#")) continue;
		const indentLevel = line.search(/\S/);
		if (indentLevel === 0 && trimmed === "catalog:") {
			currentSection = "catalog";
			continue;
		}
		if (indentLevel === 0 && trimmed === "catalogs:") {
			currentSection = "catalogs";
			continue;
		}
		if (indentLevel === 0) {
			currentSection = "none";
			continue;
		}
		if (currentSection === "catalog" && indentLevel > 0) {
			const colonIndex = trimmed.indexOf(":");
			if (colonIndex > 0) {
				const key = trimmed.slice(0, colonIndex).trim().replace(/["']/g, "");
				const value = trimmed.slice(colonIndex + 1).trim().replace(/["']/g, "");
				if (key && value) defaultCatalog[key] = value;
			}
			continue;
		}
		if (currentSection === "catalogs" && indentLevel > 0) {
			if (trimmed.endsWith(":") && !trimmed.includes(" ")) {
				currentCatalogName = trimmed.slice(0, -1).replace(/["']/g, "");
				currentSection = "named-catalog";
				namedCatalogs[currentCatalogName] = {};
				continue;
			}
		}
		if (currentSection === "named-catalog" && indentLevel > 0) {
			if (indentLevel <= 2 && trimmed.endsWith(":") && !trimmed.includes(" ")) {
				currentCatalogName = trimmed.slice(0, -1).replace(/["']/g, "");
				namedCatalogs[currentCatalogName] = {};
				continue;
			}
			const colonIndex = trimmed.indexOf(":");
			if (colonIndex > 0 && currentCatalogName) {
				const key = trimmed.slice(0, colonIndex).trim().replace(/["']/g, "");
				const value = trimmed.slice(colonIndex + 1).trim().replace(/["']/g, "");
				if (key && value) namedCatalogs[currentCatalogName][key] = value;
			}
		}
	}
	return {
		defaultCatalog,
		namedCatalogs
	};
};
const resolveCatalogVersionFromCollection = (catalogs, packageName, catalogReference) => {
	if (catalogReference) {
		const namedCatalog = catalogs.namedCatalogs[catalogReference];
		if (namedCatalog?.[packageName]) return namedCatalog[packageName];
	}
	if (catalogs.defaultCatalog[packageName]) return catalogs.defaultCatalog[packageName];
	for (const namedCatalog of Object.values(catalogs.namedCatalogs)) if (namedCatalog[packageName]) return namedCatalog[packageName];
	return null;
};
const resolveCatalogVersion = (packageJson, packageName, rootDirectory) => {
	const rawVersion = collectAllDependencies(packageJson)[packageName];
	const catalogName = rawVersion ? extractCatalogName(rawVersion) : null;
	if (isPlainObject(packageJson.catalog)) {
		const version = resolveVersionFromCatalog(packageJson.catalog, packageName);
		if (version) return version;
	}
	if (isPlainObject(packageJson.catalogs)) {
		const namedCatalog = catalogName ? packageJson.catalogs[catalogName] : void 0;
		if (namedCatalog && isPlainObject(namedCatalog)) {
			const version = resolveVersionFromCatalog(namedCatalog, packageName);
			if (version) return version;
		}
		for (const catalogEntries of Object.values(packageJson.catalogs)) if (isPlainObject(catalogEntries)) {
			const version = resolveVersionFromCatalog(catalogEntries, packageName);
			if (version) return version;
		}
	}
	const workspaces = packageJson.workspaces;
	if (workspaces && !Array.isArray(workspaces) && isPlainObject(workspaces.catalog)) {
		const version = resolveVersionFromCatalog(workspaces.catalog, packageName);
		if (version) return version;
	}
	if (rootDirectory) {
		const pnpmVersion = resolveCatalogVersionFromCollection(parsePnpmWorkspaceCatalogs(rootDirectory), packageName, catalogName);
		if (pnpmVersion) return pnpmVersion;
	}
	return null;
};
const extractDependencyInfo = (packageJson) => {
	const allDependencies = collectAllDependencies(packageJson);
	const rawVersion = allDependencies.react ?? null;
	return {
		reactVersion: rawVersion && !isCatalogReference(rawVersion) ? rawVersion : null,
		framework: detectFramework(allDependencies)
	};
};
const parsePnpmWorkspacePatterns = (rootDirectory) => {
	const workspacePath = path.join(rootDirectory, "pnpm-workspace.yaml");
	if (!isFile(workspacePath)) return [];
	const content = fs.readFileSync(workspacePath, "utf-8");
	const patterns = [];
	let isInsidePackagesBlock = false;
	for (const line of content.split("\n")) {
		const trimmed = line.trim();
		if (trimmed === "packages:") {
			isInsidePackagesBlock = true;
			continue;
		}
		if (isInsidePackagesBlock && trimmed.startsWith("-")) patterns.push(trimmed.replace(/^-\s*/, "").replace(/["']/g, ""));
		else if (isInsidePackagesBlock && trimmed.length > 0 && !trimmed.startsWith("#")) isInsidePackagesBlock = false;
	}
	return patterns;
};
const NX_PROJECT_DISCOVERY_DIRS = [
	"apps",
	"libs",
	"packages"
];
const getNxWorkspaceDirectories = (rootDirectory) => {
	if (!isFile(path.join(rootDirectory, "nx.json"))) return [];
	const collected = [];
	for (const candidate of NX_PROJECT_DISCOVERY_DIRS) {
		const candidatePath = path.join(rootDirectory, candidate);
		if (!fs.existsSync(candidatePath) || !fs.statSync(candidatePath).isDirectory()) continue;
		for (const entry of fs.readdirSync(candidatePath, { withFileTypes: true })) {
			if (!entry.isDirectory()) continue;
			const projectDirectory = path.join(candidatePath, entry.name);
			if (isFile(path.join(projectDirectory, "project.json")) || isFile(path.join(projectDirectory, "package.json"))) collected.push(`${candidate}/${entry.name}`);
		}
	}
	return collected;
};
const getWorkspacePatterns = (rootDirectory, packageJson) => {
	const pnpmPatterns = parsePnpmWorkspacePatterns(rootDirectory);
	if (pnpmPatterns.length > 0) return pnpmPatterns;
	if (Array.isArray(packageJson.workspaces)) return packageJson.workspaces;
	if (packageJson.workspaces?.packages) return packageJson.workspaces.packages;
	const nxPatterns = getNxWorkspaceDirectories(rootDirectory);
	if (nxPatterns.length > 0) return nxPatterns;
	return [];
};
const resolveWorkspaceDirectories = (rootDirectory, pattern) => {
	const cleanPattern = pattern.replace(/["']/g, "").replace(/\/\*\*$/, "/*");
	if (!cleanPattern.includes("*")) {
		const directoryPath = path.join(rootDirectory, cleanPattern);
		if (fs.existsSync(directoryPath) && isFile(path.join(directoryPath, "package.json"))) return [directoryPath];
		return [];
	}
	const wildcardIndex = cleanPattern.indexOf("*");
	const baseDirectory = path.join(rootDirectory, cleanPattern.slice(0, wildcardIndex));
	const suffixAfterWildcard = cleanPattern.slice(wildcardIndex + 1);
	if (!fs.existsSync(baseDirectory) || !fs.statSync(baseDirectory).isDirectory()) return [];
	return fs.readdirSync(baseDirectory).map((entry) => path.join(baseDirectory, entry, suffixAfterWildcard)).filter((entryPath) => fs.existsSync(entryPath) && fs.statSync(entryPath).isDirectory() && isFile(path.join(entryPath, "package.json")));
};
const findDependencyInfoFromMonorepoRoot = (directory) => {
	const monorepoRoot = findMonorepoRoot(directory);
	if (!monorepoRoot) return {
		reactVersion: null,
		framework: "unknown"
	};
	const monorepoPackageJsonPath = path.join(monorepoRoot, "package.json");
	if (!isFile(monorepoPackageJsonPath)) return {
		reactVersion: null,
		framework: "unknown"
	};
	const rootPackageJson = readPackageJson(monorepoPackageJsonPath);
	const rootInfo = extractDependencyInfo(rootPackageJson);
	const catalogVersion = resolveCatalogVersion(rootPackageJson, "react", monorepoRoot);
	const workspaceInfo = findReactInWorkspaces(monorepoRoot, rootPackageJson);
	return {
		reactVersion: rootInfo.reactVersion ?? catalogVersion ?? workspaceInfo.reactVersion,
		framework: rootInfo.framework !== "unknown" ? rootInfo.framework : workspaceInfo.framework
	};
};
const findReactInWorkspaces = (rootDirectory, packageJson) => {
	const patterns = getWorkspacePatterns(rootDirectory, packageJson);
	const result = {
		reactVersion: null,
		framework: "unknown"
	};
	for (const pattern of patterns) {
		const directories = resolveWorkspaceDirectories(rootDirectory, pattern);
		for (const workspaceDirectory of directories) {
			const info = extractDependencyInfo(readPackageJson(path.join(workspaceDirectory, "package.json")));
			if (info.reactVersion && !result.reactVersion) result.reactVersion = info.reactVersion;
			if (info.framework !== "unknown" && result.framework === "unknown") result.framework = info.framework;
			if (result.reactVersion && result.framework !== "unknown") return result;
		}
	}
	return result;
};
const hasCompilerPackage = (packageJson) => {
	const allDependencies = collectAllDependencies(packageJson);
	return Object.keys(allDependencies).some((packageName) => REACT_COMPILER_PACKAGES.has(packageName));
};
const hasCompilerInConfigFile = (filePath) => {
	if (!isFile(filePath)) return false;
	const content = fs.readFileSync(filePath, "utf-8");
	return REACT_COMPILER_ENABLED_FLAG_PATTERN.test(content) || REACT_COMPILER_PACKAGE_REFERENCE_PATTERN.test(content);
};
const hasCompilerInConfigFiles = (directory, filenames) => filenames.some((filename) => hasCompilerInConfigFile(path.join(directory, filename)));
const isProjectBoundary$2 = (directory) => {
	if (fs.existsSync(path.join(directory, ".git"))) return true;
	return isMonorepoRoot(directory);
};
const detectReactCompiler = (directory, packageJson) => {
	if (hasCompilerPackage(packageJson)) return true;
	if (hasCompilerInConfigFiles(directory, NEXT_CONFIG_FILENAMES)) return true;
	if (hasCompilerInConfigFiles(directory, BABEL_CONFIG_FILENAMES)) return true;
	if (hasCompilerInConfigFiles(directory, VITE_CONFIG_FILENAMES)) return true;
	if (hasCompilerInConfigFiles(directory, EXPO_APP_CONFIG_FILENAMES)) return true;
	if (isProjectBoundary$2(directory)) return false;
	let ancestorDirectory = path.dirname(directory);
	while (ancestorDirectory !== path.dirname(ancestorDirectory)) {
		const ancestorPackagePath = path.join(ancestorDirectory, "package.json");
		if (isFile(ancestorPackagePath)) {
			if (hasCompilerPackage(readPackageJson(ancestorPackagePath))) return true;
		}
		if (isProjectBoundary$2(ancestorDirectory)) return false;
		ancestorDirectory = path.dirname(ancestorDirectory);
	}
	return false;
};
const cachedProjectInfos = /* @__PURE__ */ new Map();
const clearProjectCache = () => {
	cachedProjectInfos.clear();
};
const discoverProject = (directory) => {
	const cached = cachedProjectInfos.get(directory);
	if (cached !== void 0) return cached;
	const packageJsonPath = path.join(directory, "package.json");
	if (!isFile(packageJsonPath)) throw new Error(`No package.json found in ${directory}`);
	const packageJson = readPackageJson(packageJsonPath);
	let { reactVersion, framework } = extractDependencyInfo(packageJson);
	if (!reactVersion) reactVersion = resolveCatalogVersion(packageJson, "react", directory);
	if (!reactVersion) {
		const monorepoRoot = findMonorepoRoot(directory);
		if (monorepoRoot) {
			const monorepoPackageJsonPath = path.join(monorepoRoot, "package.json");
			if (isFile(monorepoPackageJsonPath)) reactVersion = resolveCatalogVersion(readPackageJson(monorepoPackageJsonPath), "react", monorepoRoot);
		}
	}
	if (!reactVersion || framework === "unknown") {
		const workspaceInfo = findReactInWorkspaces(directory, packageJson);
		if (!reactVersion && workspaceInfo.reactVersion) reactVersion = workspaceInfo.reactVersion;
		if (framework === "unknown" && workspaceInfo.framework !== "unknown") framework = workspaceInfo.framework;
	}
	if ((!reactVersion || framework === "unknown") && !isMonorepoRoot(directory)) {
		const monorepoInfo = findDependencyInfoFromMonorepoRoot(directory);
		if (!reactVersion) reactVersion = monorepoInfo.reactVersion;
		if (framework === "unknown") framework = monorepoInfo.framework;
	}
	const projectName = packageJson.name ?? path.basename(directory);
	const hasTypeScript = fs.existsSync(path.join(directory, "tsconfig.json"));
	const sourceFileCount = countSourceFiles(directory);
	const hasReactCompiler = detectReactCompiler(directory, packageJson);
	const allDependencies = collectAllDependencies(packageJson);
	const hasTanStackQuery = Object.keys(allDependencies).some((packageName) => TANSTACK_QUERY_PACKAGES.has(packageName));
	const projectInfo = {
		rootDirectory: directory,
		projectName,
		reactVersion,
		framework,
		hasTypeScript,
		hasReactCompiler,
		hasTanStackQuery,
		sourceFileCount
	};
	cachedProjectInfos.set(directory, projectInfo);
	return projectInfo;
};
//#endregion
//#region src/utils/jsx-include-paths.ts
const computeJsxIncludePaths = (includePaths) => includePaths.length > 0 ? includePaths.filter((filePath) => JSX_FILE_PATTERN.test(filePath)) : void 0;
//#endregion
//#region src/utils/validate-config-types.ts
const BOOLEAN_FIELD_NAMES = [
	"lint",
	"deadCode",
	"verbose",
	"customRulesOnly",
	"respectInlineDisables",
	"adoptExistingLintConfig"
];
const warnConfigField$1 = (message) => {
	process.stderr.write(`[react-doctor] ${message}\n`);
};
const coerceMaybeBooleanString = (fieldName, value) => {
	if (typeof value === "boolean" || value === void 0) return value;
	if (value === "true") {
		warnConfigField$1(`config field "${fieldName}" is the string "true"; treating as boolean true.`);
		return true;
	}
	if (value === "false") {
		warnConfigField$1(`config field "${fieldName}" is the string "false"; treating as boolean false.`);
		return false;
	}
	warnConfigField$1(`config field "${fieldName}" must be a boolean (got ${typeof value}); ignoring this field.`);
};
const validateConfigTypes = (config) => {
	const validated = { ...config };
	for (const fieldName of BOOLEAN_FIELD_NAMES) {
		const original = config[fieldName];
		if (original === void 0) continue;
		const coerced = coerceMaybeBooleanString(fieldName, original);
		if (coerced === void 0) delete validated[fieldName];
		else validated[fieldName] = coerced;
	}
	return validated;
};
//#endregion
//#region src/utils/load-config.ts
const CONFIG_FILENAME = "react-doctor.config.json";
const PACKAGE_JSON_CONFIG_KEY = "reactDoctor";
const loadConfigFromDirectory = (directory) => {
	const configFilePath = path.join(directory, CONFIG_FILENAME);
	if (isFile(configFilePath)) try {
		const fileContent = fs.readFileSync(configFilePath, "utf-8");
		const parsed = JSON.parse(fileContent);
		if (isPlainObject(parsed)) return validateConfigTypes(parsed);
		logger.warn(`${CONFIG_FILENAME} must be a JSON object, ignoring.`);
	} catch (error) {
		logger.warn(`Failed to parse ${CONFIG_FILENAME}: ${error instanceof Error ? error.message : String(error)}`);
	}
	const packageJsonPath = path.join(directory, "package.json");
	if (isFile(packageJsonPath)) try {
		const fileContent = fs.readFileSync(packageJsonPath, "utf-8");
		const packageJson = JSON.parse(fileContent);
		if (isPlainObject(packageJson)) {
			const embeddedConfig = packageJson[PACKAGE_JSON_CONFIG_KEY];
			if (isPlainObject(embeddedConfig)) return validateConfigTypes(embeddedConfig);
		}
	} catch {
		return null;
	}
	return null;
};
const isProjectBoundary$1 = (directory) => fs.existsSync(path.join(directory, ".git")) || isMonorepoRoot(directory);
const cachedConfigs = /* @__PURE__ */ new Map();
const clearConfigCache = () => {
	cachedConfigs.clear();
};
const loadConfig = (rootDirectory) => {
	const cached = cachedConfigs.get(rootDirectory);
	if (cached !== void 0) return cached;
	const localConfig = loadConfigFromDirectory(rootDirectory);
	if (localConfig) {
		cachedConfigs.set(rootDirectory, localConfig);
		return localConfig;
	}
	if (isProjectBoundary$1(rootDirectory)) {
		cachedConfigs.set(rootDirectory, null);
		return null;
	}
	let ancestorDirectory = path.dirname(rootDirectory);
	while (ancestorDirectory !== path.dirname(ancestorDirectory)) {
		const ancestorConfig = loadConfigFromDirectory(ancestorDirectory);
		if (ancestorConfig) {
			cachedConfigs.set(rootDirectory, ancestorConfig);
			return ancestorConfig;
		}
		if (isProjectBoundary$1(ancestorDirectory)) {
			cachedConfigs.set(rootDirectory, null);
			return null;
		}
		ancestorDirectory = path.dirname(ancestorDirectory);
	}
	cachedConfigs.set(rootDirectory, null);
	return null;
};
//#endregion
//#region src/utils/match-glob-pattern.ts
const REGEX_SPECIAL_CHARACTERS = /[.+^${}()|[\]\\]/g;
const compileGlobPattern = (pattern) => {
	const normalizedPattern = pattern.replace(/\\/g, "/").replace(/^\//, "");
	let regexSource = "^";
	let characterIndex = 0;
	while (characterIndex < normalizedPattern.length) if (normalizedPattern[characterIndex] === "*" && normalizedPattern[characterIndex + 1] === "*") if (normalizedPattern[characterIndex + 2] === "/") {
		regexSource += "(?:.+/)?";
		characterIndex += 3;
	} else {
		regexSource += ".*";
		characterIndex += 2;
	}
	else if (normalizedPattern[characterIndex] === "*") {
		regexSource += "[^/]*";
		characterIndex++;
	} else if (normalizedPattern[characterIndex] === "?") {
		regexSource += "[^/]";
		characterIndex++;
	} else {
		regexSource += normalizedPattern[characterIndex].replace(REGEX_SPECIAL_CHARACTERS, "\\$&");
		characterIndex++;
	}
	regexSource += "$";
	return new RegExp(regexSource);
};
//#endregion
//#region src/utils/to-relative-path.ts
const toRelativePath = (filePath, rootDirectory) => {
	const normalizedFilePath = filePath.replace(/\\/g, "/");
	const normalizedRoot = rootDirectory.replace(/\\/g, "/").replace(/\/$/, "") + "/";
	if (normalizedFilePath.startsWith(normalizedRoot)) return normalizedFilePath.slice(normalizedRoot.length);
	return normalizedFilePath.replace(/^\.\//, "");
};
//#endregion
//#region src/utils/apply-ignore-overrides.ts
const warnConfigField = (message) => {
	process.stderr.write(`[react-doctor] ${message}\n`);
};
const isStringArray = (value) => Array.isArray(value) && value.every((entry) => typeof entry === "string");
const collectStringList = (value) => Array.isArray(value) ? value.filter((entry) => typeof entry === "string") : [];
const validateOverrideEntry = (entry, index) => {
	if (!isPlainObject(entry)) {
		warnConfigField(`ignore.overrides[${index}] must be an object with { files, rules }; ignoring this entry.`);
		return null;
	}
	if (!isStringArray(entry.files)) {
		warnConfigField(`ignore.overrides[${index}].files must be an array of strings; ignoring this entry.`);
		return null;
	}
	if (entry.rules !== void 0 && !isStringArray(entry.rules)) {
		warnConfigField(`ignore.overrides[${index}].rules must be an array of "plugin/rule" strings or omitted; treating as missing (override would suppress every rule for the matched files).`);
		return { files: entry.files };
	}
	return entry.rules === void 0 ? { files: entry.files } : {
		files: entry.files,
		rules: entry.rules
	};
};
const compileIgnoreOverrides = (userConfig) => {
	const overrides = userConfig?.ignore?.overrides;
	if (overrides === void 0) return [];
	if (!Array.isArray(overrides)) {
		warnConfigField(`ignore.overrides must be an array of { files, rules } entries; ignoring.`);
		return [];
	}
	return overrides.flatMap((entry, index) => {
		const validated = validateOverrideEntry(entry, index);
		if (!validated) return [];
		const filePatterns = collectStringList(validated.files).map(compileGlobPattern);
		if (filePatterns.length === 0) return [];
		return [{
			filePatterns,
			ruleIds: new Set(collectStringList(validated.rules))
		}];
	});
};
const isDiagnosticIgnoredByOverrides = (diagnostic, rootDirectory, overrides) => {
	if (overrides.length === 0) return false;
	const relativeFilePath = toRelativePath(diagnostic.filePath, rootDirectory);
	const ruleIdentifier = `${diagnostic.plugin}/${diagnostic.rule}`;
	return overrides.some((override) => override.filePatterns.some((pattern) => pattern.test(relativeFilePath)) && (override.ruleIds.size === 0 || override.ruleIds.has(ruleIdentifier)));
};
//#endregion
//#region src/utils/find-jsx-opener-span.ts
const JSX_OPENER_TAG_PATTERN = /<[A-Za-z][\w.]*/g;
const JSX_TAG_NAME_FOLLOW = /[A-Za-z]/;
const isOpenerMatchInsideLineComment = (line, openerCharIndex) => {
	let stringDelimiter = null;
	for (let charIndex = 0; charIndex < openerCharIndex; charIndex++) {
		const character = line[charIndex];
		if (stringDelimiter !== null) {
			if (character === "\\") {
				charIndex++;
				continue;
			}
			if (character === stringDelimiter) stringDelimiter = null;
			continue;
		}
		if (character === "\"" || character === "'" || character === "`") {
			stringDelimiter = character;
			continue;
		}
		if (character === "/" && line[charIndex + 1] === "/") return true;
	}
	return false;
};
const findOpenerTagOnLine = (line) => {
	for (const match of line.matchAll(JSX_OPENER_TAG_PATTERN)) {
		if (match.index === void 0) continue;
		if (!isOpenerMatchInsideLineComment(line, match.index)) return { startCharIndex: match.index + match[0].length };
	}
	return null;
};
const findJsxOpenerSpan = (lines, openerLineIndex) => {
	const openerLine = lines[openerLineIndex];
	if (openerLine === void 0) return null;
	const opener = findOpenerTagOnLine(openerLine);
	if (!opener) return null;
	const lookaheadLimit = Math.min(lines.length, openerLineIndex + 32);
	let braceDepth = 0;
	let innerAngleDepth = 0;
	let stringDelimiter = null;
	for (let lineIndex = openerLineIndex; lineIndex < lookaheadLimit; lineIndex++) {
		const currentLine = lines[lineIndex];
		const startCharForLine = lineIndex === openerLineIndex ? opener.startCharIndex : 0;
		for (let charIndex = startCharForLine; charIndex < currentLine.length; charIndex++) {
			const character = currentLine[charIndex];
			if (stringDelimiter !== null) {
				if (character === "\\") {
					charIndex++;
					continue;
				}
				if (character === stringDelimiter) stringDelimiter = null;
				continue;
			}
			if (character === "\"" || character === "'" || character === "`") {
				stringDelimiter = character;
				continue;
			}
			if (character === "{") {
				braceDepth++;
				continue;
			}
			if (character === "}") {
				braceDepth--;
				continue;
			}
			if (braceDepth !== 0) continue;
			if (character === "<") {
				const followCharacter = currentLine[charIndex + 1];
				if (followCharacter !== void 0 && JSX_TAG_NAME_FOLLOW.test(followCharacter)) innerAngleDepth++;
				continue;
			}
			if (character !== ">") continue;
			const previousCharacter = currentLine[charIndex - 1];
			const nextCharacter = currentLine[charIndex + 1];
			if (previousCharacter === "=" || nextCharacter === "=") continue;
			if (innerAngleDepth > 0) {
				innerAngleDepth--;
				continue;
			}
			return lineIndex;
		}
	}
	return null;
};
//#endregion
//#region src/utils/find-enclosing-jsx-opener.ts
const findEnclosingMultilineJsxOpenerStart = (lines, diagnosticLineIndex) => {
	for (let candidateIndex = diagnosticLineIndex - 1; candidateIndex >= 0 && diagnosticLineIndex - candidateIndex <= 32; candidateIndex--) {
		const openerCloseIndex = findJsxOpenerSpan(lines, candidateIndex);
		if (openerCloseIndex !== null && openerCloseIndex >= diagnosticLineIndex) return candidateIndex;
	}
	return null;
};
//#endregion
//#region src/utils/find-stacked-disable-comments.ts
const DISABLE_NEXT_LINE_PATTERN = /(?:\/\/|\/\*)\s*react-doctor-disable-next-line\b(?:\s+([\w/\-.,\s]+?))?\s*(?:\*\/)?\s*\}?\s*$/;
const findStackedDisableCommentsAbove = (lines, anchorIndex) => {
	const collected = [];
	let isStillInChain = true;
	for (let candidateIndex = anchorIndex - 1; candidateIndex >= 0 && anchorIndex - candidateIndex <= 10; candidateIndex--) {
		const candidateLine = lines[candidateIndex];
		if (candidateLine === void 0) break;
		const match = candidateLine.match(DISABLE_NEXT_LINE_PATTERN);
		if (match) {
			collected.push({
				commentLineIndex: candidateIndex,
				ruleList: match[1],
				isInChain: isStillInChain
			});
			continue;
		}
		isStillInChain = false;
	}
	return collected;
};
//#endregion
//#region src/utils/is-rule-listed-in-comment.ts
const isRuleListedInComment = (ruleList, ruleId) => {
	if (!ruleList?.trim()) return true;
	return ruleList.split(/[,\s]+/).some((token) => token.trim() === ruleId);
};
//#endregion
//#region src/utils/evaluate-suppression.ts
const DISABLE_LINE_PATTERN = /(?:\/\/|\/\*)\s*react-doctor-disable-line\b(?:\s+([\w/\-.,\s]+?))?\s*(?:\*\/)?\s*\}?\s*$/;
const formatLineGap = (gapLineCount) => `${gapLineCount} line${gapLineCount === 1 ? "" : "s"}`;
const hasChainSuppressor = (comments, ruleId) => comments.some((comment) => comment.isInChain && isRuleListedInComment(comment.ruleList, ruleId));
const findAdjacentRuleListMismatch = (comments, ruleId) => comments.find((comment) => comment.isInChain && Boolean(comment.ruleList?.trim()) && !isRuleListedInComment(comment.ruleList, ruleId));
const findOutOfChainMatch = (comments, ruleId) => comments.find((comment) => !comment.isInChain && isRuleListedInComment(comment.ruleList, ruleId));
const buildAdjacentMismatchHint = (comment, ruleId) => {
	const ruleListText = comment.ruleList?.trim() ?? "";
	return `An adjacent react-doctor-disable-next-line at line ${comment.commentLineIndex + 1} lists "${ruleListText}" — ${ruleId} is not in that list. Use the comma form: react-doctor-disable-next-line ${ruleListText}, ${ruleId}`;
};
const buildGapHint = (comment, diagnosticLineIndex, ruleId) => {
	const commentLineNumber = comment.commentLineIndex + 1;
	const diagnosticLineNumber = diagnosticLineIndex + 1;
	return `A react-doctor-disable-next-line for ${ruleId} sits at line ${commentLineNumber}, but ${formatLineGap(diagnosticLineNumber - commentLineNumber - 1)} of code separate it from the diagnostic on line ${diagnosticLineNumber}. Move the comment immediately above line ${diagnosticLineNumber}, or extract the surrounding code into a helper so the suppression is adjacent.`;
};
const classifyFromComments = (commentsByAnchor, diagnosticLineIndex, ruleId) => {
	for (const comments of commentsByAnchor) {
		const adjacentMismatch = findAdjacentRuleListMismatch(comments, ruleId);
		if (adjacentMismatch) return buildAdjacentMismatchHint(adjacentMismatch, ruleId);
		const outOfChainMatch = findOutOfChainMatch(comments, ruleId);
		if (outOfChainMatch) return buildGapHint(outOfChainMatch, diagnosticLineIndex, ruleId);
	}
	return null;
};
const evaluateSuppression = (lines, diagnosticLineIndex, ruleId) => {
	const sameLineMatch = lines[diagnosticLineIndex]?.match(DISABLE_LINE_PATTERN);
	if (sameLineMatch && isRuleListedInComment(sameLineMatch[1], ruleId)) return {
		isSuppressed: true,
		nearMissHint: null
	};
	const directComments = findStackedDisableCommentsAbove(lines, diagnosticLineIndex);
	if (hasChainSuppressor(directComments, ruleId)) return {
		isSuppressed: true,
		nearMissHint: null
	};
	const openerStartIndex = findEnclosingMultilineJsxOpenerStart(lines, diagnosticLineIndex);
	const openerComments = openerStartIndex !== null && openerStartIndex > 0 ? findStackedDisableCommentsAbove(lines, openerStartIndex) : [];
	if (hasChainSuppressor(openerComments, ruleId)) return {
		isSuppressed: true,
		nearMissHint: null
	};
	return {
		isSuppressed: false,
		nearMissHint: classifyFromComments([directComments, openerComments], diagnosticLineIndex, ruleId)
	};
};
//#endregion
//#region src/utils/is-ignored-file.ts
const compileIgnoredFilePatterns = (userConfig) => {
	const files = userConfig?.ignore?.files;
	if (!Array.isArray(files)) return [];
	return files.filter((entry) => typeof entry === "string").map(compileGlobPattern);
};
const isFileIgnoredByPatterns = (filePath, rootDirectory, patterns) => {
	if (patterns.length === 0) return false;
	const relativePath = toRelativePath(filePath, rootDirectory);
	return patterns.some((pattern) => pattern.test(relativePath));
};
//#endregion
//#region src/utils/filter-diagnostics.ts
const OPENING_TAG_PATTERN = /<([A-Z][\w.]*)/;
const JSX_CHILD_OPEN_PATTERN = /<[A-Za-z]/;
const escapeRegExpSpecials = (rawText) => rawText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const resolveCandidateReadPath = (rootDirectory, filePath) => {
	const normalizedFile = filePath.replace(/\\/g, "/");
	if (normalizedFile.startsWith("/") || /^[a-zA-Z]:\//.test(normalizedFile) || /^[a-zA-Z]:\\/.test(filePath)) return filePath;
	return `${rootDirectory.replace(/\\/g, "/").replace(/\/$/, "")}/${normalizedFile.replace(/^\.\//, "")}`;
};
const createFileLinesCache = (rootDirectory, readFileLinesSync) => {
	const cache = /* @__PURE__ */ new Map();
	return (filePath) => {
		const cached = cache.get(filePath);
		if (cached !== void 0) return cached;
		const lines = readFileLinesSync(resolveCandidateReadPath(rootDirectory, filePath));
		cache.set(filePath, lines);
		return lines;
	};
};
const isInsideTextComponent = (lines, diagnosticLine, textComponentNames) => {
	for (let lineIndex = diagnosticLine - 1; lineIndex >= 0; lineIndex--) {
		const match = lines[lineIndex].match(OPENING_TAG_PATTERN);
		if (!match) continue;
		const fullTagName = match[1];
		const leafTagName = fullTagName.includes(".") ? fullTagName.split(".").at(-1) ?? fullTagName : fullTagName;
		return textComponentNames.has(fullTagName) || textComponentNames.has(leafTagName);
	}
	return false;
};
const findOpenerAtOrAbove = (lines, upperBoundLineIndex) => {
	for (let lineIndex = upperBoundLineIndex; lineIndex >= 0; lineIndex--) {
		const match = lines[lineIndex].match(OPENING_TAG_PATTERN);
		if (!match) continue;
		const fullName = match[1];
		return {
			fullName,
			leafName: fullName.includes(".") ? fullName.split(".").at(-1) ?? fullName : fullName,
			lineIndex
		};
	}
	return null;
};
const resolveJsxRange = (lines, opener) => {
	const closingPattern = new RegExp(`</(?:${escapeRegExpSpecials(opener.fullName)}|${escapeRegExpSpecials(opener.leafName)})\\s*>`);
	let closerLineIndex = -1;
	let closerColumn = -1;
	for (let lineIndex = opener.lineIndex; lineIndex < lines.length; lineIndex++) {
		const match = closingPattern.exec(lines[lineIndex]);
		if (!match) continue;
		closerLineIndex = lineIndex;
		closerColumn = match.index;
		break;
	}
	if (closerLineIndex < 0) return null;
	const openerLine = lines[opener.lineIndex];
	const tagStartIndex = openerLine.indexOf(`<${opener.fullName}`);
	if (tagStartIndex < 0) return null;
	const openerEndIndex = openerLine.indexOf(">", tagStartIndex);
	let bodyText;
	if (opener.lineIndex === closerLineIndex) {
		if (openerEndIndex < 0 || openerEndIndex >= closerColumn) return null;
		bodyText = openerLine.slice(openerEndIndex + 1, closerColumn);
	} else {
		const segments = [];
		if (openerEndIndex >= 0) segments.push(openerLine.slice(openerEndIndex + 1));
		for (let lineIndex = opener.lineIndex + 1; lineIndex < closerLineIndex; lineIndex++) segments.push(lines[lineIndex]);
		segments.push(lines[closerLineIndex].slice(0, closerColumn));
		bodyText = segments.join("\n");
	}
	return {
		closerLineIndex,
		closerColumn,
		bodyText
	};
};
const isInsideStringOnlyWrapper = (lines, diagnosticLine, diagnosticColumn, wrapperNames) => {
	const diagnosticLineIndex = diagnosticLine - 1;
	const diagnosticColumnIndex = Math.max(0, diagnosticColumn - 1);
	let upperBoundLineIndex = diagnosticLineIndex;
	while (upperBoundLineIndex >= 0) {
		const opener = findOpenerAtOrAbove(lines, upperBoundLineIndex);
		if (!opener) return false;
		const range = resolveJsxRange(lines, opener);
		if (range === null) {
			upperBoundLineIndex = opener.lineIndex - 1;
			continue;
		}
		if (range.closerLineIndex < diagnosticLineIndex || range.closerLineIndex === diagnosticLineIndex && range.closerColumn <= diagnosticColumnIndex) {
			upperBoundLineIndex = opener.lineIndex - 1;
			continue;
		}
		if (!wrapperNames.has(opener.fullName) && !wrapperNames.has(opener.leafName)) return false;
		return !JSX_CHILD_OPEN_PATTERN.test(range.bodyText);
	}
	return false;
};
const filterIgnoredDiagnostics = (diagnostics, config, rootDirectory, readFileLinesSync) => {
	const ignoredRules = new Set(Array.isArray(config.ignore?.rules) ? config.ignore.rules.filter((rule) => typeof rule === "string") : []);
	const ignoredFilePatterns = compileIgnoredFilePatterns(config);
	const compiledOverrides = compileIgnoreOverrides(config);
	const textComponentNames = new Set(Array.isArray(config.textComponents) ? config.textComponents.filter((name) => typeof name === "string") : []);
	const hasTextComponents = textComponentNames.size > 0;
	const rawTextWrapperComponentNames = new Set(Array.isArray(config.rawTextWrapperComponents) ? config.rawTextWrapperComponents.filter((name) => typeof name === "string") : []);
	const hasRawTextWrappers = rawTextWrapperComponentNames.size > 0;
	const getFileLines = createFileLinesCache(rootDirectory, readFileLinesSync);
	return diagnostics.filter((diagnostic) => {
		const ruleIdentifier = `${diagnostic.plugin}/${diagnostic.rule}`;
		if (ignoredRules.has(ruleIdentifier)) return false;
		if (isFileIgnoredByPatterns(diagnostic.filePath, rootDirectory, ignoredFilePatterns)) return false;
		if (isDiagnosticIgnoredByOverrides(diagnostic, rootDirectory, compiledOverrides)) return false;
		if ((hasTextComponents || hasRawTextWrappers) && diagnostic.rule === "rn-no-raw-text" && diagnostic.line > 0) {
			const lines = getFileLines(diagnostic.filePath);
			if (lines) {
				if (hasTextComponents && isInsideTextComponent(lines, diagnostic.line, textComponentNames)) return false;
				if (hasRawTextWrappers && isInsideStringOnlyWrapper(lines, diagnostic.line, diagnostic.column, rawTextWrapperComponentNames)) return false;
			}
		}
		return true;
	});
};
const filterInlineSuppressions = (diagnostics, rootDirectory, readFileLinesSync) => {
	const getFileLines = createFileLinesCache(rootDirectory, readFileLinesSync);
	return diagnostics.flatMap((diagnostic) => {
		if (diagnostic.line <= 0) return [diagnostic];
		const lines = getFileLines(diagnostic.filePath);
		if (!lines) return [diagnostic];
		const ruleIdentifier = `${diagnostic.plugin}/${diagnostic.rule}`;
		const evaluation = evaluateSuppression(lines, diagnostic.line - 1, ruleIdentifier);
		if (evaluation.isSuppressed) return [];
		return evaluation.nearMissHint ? [{
			...diagnostic,
			suppressionHint: evaluation.nearMissHint
		}] : [diagnostic];
	});
};
//#endregion
//#region src/utils/merge-and-filter-diagnostics.ts
const mergeAndFilterDiagnostics = (mergedDiagnostics, directory, userConfig, readFileLinesSync, options = {}) => {
	const filtered = userConfig ? filterIgnoredDiagnostics(mergedDiagnostics, userConfig, directory, readFileLinesSync) : mergedDiagnostics;
	if (options.respectInlineDisables === false) return filtered;
	return filterInlineSuppressions(filtered, directory, readFileLinesSync);
};
//#endregion
//#region src/utils/parse-react-major.ts
const parseReactMajor = (reactVersion) => {
	if (typeof reactVersion !== "string") return null;
	const trimmed = reactVersion.trim();
	if (trimmed.length === 0) return null;
	const match = trimmed.match(/(\d+)/);
	if (!match) return null;
	const major = Number.parseInt(match[1], 10);
	if (!Number.isFinite(major) || major <= 0) return null;
	return major;
};
//#endregion
//#region src/utils/read-file-lines-node.ts
const createNodeReadFileLinesSync = (rootDirectory) => {
	return (filePath) => {
		const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(rootDirectory, filePath);
		try {
			return fs.readFileSync(absolutePath, "utf-8").split("\n");
		} catch {
			return null;
		}
	};
};
//#endregion
//#region src/utils/resolve-lint-include-paths.ts
const listSourceFilesViaGit = (rootDirectory) => {
	const result = spawnSync("git", [
		"ls-files",
		"-z",
		"--cached",
		"--others",
		"--exclude-standard",
		"--recurse-submodules"
	], {
		cwd: rootDirectory,
		encoding: "utf-8",
		maxBuffer: GIT_LS_FILES_MAX_BUFFER_BYTES
	});
	if (result.error || result.status !== 0) return null;
	return result.stdout.split("\0").filter((filePath) => filePath.length > 0 && SOURCE_FILE_PATTERN.test(filePath));
};
const listSourceFilesViaFilesystem = (rootDirectory) => {
	const filePaths = [];
	const stack = [rootDirectory];
	while (stack.length > 0) {
		const currentDirectory = stack.pop();
		const entries = fs.readdirSync(currentDirectory, { withFileTypes: true });
		for (const entry of entries) {
			const absolutePath = path.join(currentDirectory, entry.name);
			if (entry.isDirectory()) {
				if (!entry.name.startsWith(".") && !IGNORED_DIRECTORIES.has(entry.name)) stack.push(absolutePath);
				continue;
			}
			if (entry.isFile() && SOURCE_FILE_PATTERN.test(entry.name)) filePaths.push(path.relative(rootDirectory, absolutePath).replace(/\\/g, "/"));
		}
	}
	return filePaths;
};
const listSourceFiles = (rootDirectory) => listSourceFilesViaGit(rootDirectory) ?? listSourceFilesViaFilesystem(rootDirectory);
const resolveLintIncludePaths = (rootDirectory, userConfig) => {
	if (!Array.isArray(userConfig?.ignore?.files) || userConfig.ignore.files.length === 0) return;
	const ignoredPatterns = compileIgnoredFilePatterns(userConfig);
	return listSourceFiles(rootDirectory).filter((filePath) => {
		if (!JSX_FILE_PATTERN.test(filePath)) return false;
		return !isFileIgnoredByPatterns(filePath, rootDirectory, ignoredPatterns);
	});
};
//#endregion
//#region src/utils/collect-unused-file-paths.ts
const collectUnusedFilePaths = (filesIssues) => {
	if (filesIssues instanceof Set) return [...filesIssues];
	if (Array.isArray(filesIssues)) return filesIssues.filter((entry) => typeof entry === "string");
	if (!isPlainObject(filesIssues)) return [];
	const unusedFilePaths = [];
	for (const innerValue of Object.values(filesIssues)) {
		if (!isPlainObject(innerValue)) continue;
		for (const issue of Object.values(innerValue)) if (isPlainObject(issue) && typeof issue.filePath === "string") unusedFilePaths.push(issue.filePath);
	}
	return unusedFilePaths;
};
//#endregion
//#region src/utils/extract-failed-plugin-name.ts
const PLUGIN_CONFIG_PATTERN = /(?:^|[/\\\s])([a-z][a-z0-9-]*)\.config\./i;
const RC_DOTFILE_PATTERN = /(?:^|[/\\])\.([a-z][a-z0-9-]*?)rc(?:\.[a-z]+)?(?:\b|$)/i;
const extractFailedPluginName = (error) => {
	for (const errorMessage of getErrorChainMessages(error)) {
		const pluginNameMatch = errorMessage.match(PLUGIN_CONFIG_PATTERN);
		if (pluginNameMatch?.[1]) return pluginNameMatch[1].toLowerCase();
		const rcMatch = errorMessage.match(RC_DOTFILE_PATTERN);
		if (rcMatch?.[1]) return rcMatch[1].toLowerCase();
	}
	return null;
};
//#endregion
//#region src/utils/has-knip-config.ts
const hasKnipConfig = (directory) => KNIP_CONFIG_LOCATIONS.some((configFilename) => isFile(path.join(directory, configFilename)));
//#endregion
//#region src/utils/sanitize-knip-config-patterns.ts
const isMeaningfulPattern = (value) => typeof value !== "string" || value.trim().length > 0;
const sanitizeStringArray = (values) => values.filter((entry) => typeof entry === "string" ? entry.trim().length > 0 : true);
const sanitizeKnipConfigPatterns = (parsedConfig) => {
	for (const [key, value] of Object.entries(parsedConfig)) {
		if (typeof value === "string") {
			if (!isMeaningfulPattern(value)) delete parsedConfig[key];
			continue;
		}
		if (Array.isArray(value)) {
			if (value.length === 0) continue;
			const sanitized = sanitizeStringArray(value);
			if (sanitized.length === value.length) continue;
			if (sanitized.length === 0) delete parsedConfig[key];
			else parsedConfig[key] = sanitized;
			continue;
		}
		if (isPlainObject(value)) sanitizeKnipConfigPatterns(value);
	}
};
//#endregion
//#region src/utils/run-knip.ts
const KNIP_ISSUE_TYPE_DESCRIPTORS = new Map([
	["files", {
		category: "Dead Code",
		message: "Unused file",
		severity: "warning"
	}],
	["exports", {
		category: "Dead Code",
		message: "Unused export",
		severity: "warning"
	}],
	["types", {
		category: "Dead Code",
		message: "Unused type",
		severity: "warning"
	}],
	["duplicates", {
		category: "Dead Code",
		message: "Duplicate export",
		severity: "warning"
	}]
]);
const FALLBACK_KNIP_DESCRIPTOR = {
	category: "Dead Code",
	message: "Issue",
	severity: "warning"
};
const collectIssueRecords = (records, issueType, rootDirectory) => {
	const descriptor = KNIP_ISSUE_TYPE_DESCRIPTORS.get(issueType) ?? FALLBACK_KNIP_DESCRIPTOR;
	const diagnostics = [];
	for (const issues of Object.values(records)) for (const issue of Object.values(issues)) diagnostics.push({
		filePath: path.relative(rootDirectory, issue.filePath),
		plugin: "knip",
		rule: issueType,
		severity: descriptor.severity,
		message: `${descriptor.message}: ${issue.symbol}`,
		help: "",
		line: 0,
		column: 0,
		category: descriptor.category
	});
	return diagnostics;
};
const silenced = async (fn) => {
	const originalLog = console.log;
	const originalInfo = console.info;
	const originalWarn = console.warn;
	const originalError = console.error;
	const noop = () => {};
	console.log = noop;
	console.info = noop;
	console.warn = noop;
	console.error = noop;
	try {
		return await fn();
	} finally {
		console.log = originalLog;
		console.info = originalInfo;
		console.warn = originalWarn;
		console.error = originalError;
	}
};
const TSCONFIG_FILENAMES$1 = ["tsconfig.base.json", "tsconfig.json"];
const resolveTsConfigFile = (directory) => TSCONFIG_FILENAMES$1.find((filename) => fs.existsSync(path.join(directory, filename)));
const tryDisableFailedPlugin = (error, parsedConfig, disabledPlugins) => {
	const failedPlugin = extractFailedPluginName(error);
	if (!failedPlugin || !Object.hasOwn(parsedConfig, failedPlugin) || disabledPlugins.has(failedPlugin)) return false;
	disabledPlugins.add(failedPlugin);
	parsedConfig[failedPlugin] = false;
	return true;
};
const runKnipWithOptions = async (knipCwd, workspaceName) => {
	const tsConfigFile = resolveTsConfigFile(knipCwd);
	const options = await silenced(() => createOptions({
		cwd: knipCwd,
		isShowProgress: false,
		...workspaceName ? { workspace: workspaceName } : {},
		...tsConfigFile ? { tsConfigFile } : {}
	}));
	const parsedConfig = options.parsedConfig;
	sanitizeKnipConfigPatterns(parsedConfig);
	const disabledPlugins = /* @__PURE__ */ new Set();
	let lastKnipError;
	for (let attempt = 0; attempt < 6; attempt++) try {
		return await silenced(() => main(options));
	} catch (error) {
		lastKnipError = error;
		if (!tryDisableFailedPlugin(error, parsedConfig, disabledPlugins)) throw error;
	}
	throw lastKnipError;
};
const hasNodeModules = (directory) => {
	const nodeModulesPath = path.join(directory, "node_modules");
	return fs.existsSync(nodeModulesPath) && fs.statSync(nodeModulesPath).isDirectory();
};
const resolveWorkspaceName = (rootDirectory) => {
	const packageJsonPath = path.join(rootDirectory, "package.json");
	return (isFile(packageJsonPath) ? readPackageJson(packageJsonPath) : {}).name ?? path.basename(rootDirectory);
};
const runKnipForProject = async (rootDirectory, monorepoRoot) => {
	if (!monorepoRoot || hasKnipConfig(rootDirectory)) return runKnipWithOptions(rootDirectory);
	try {
		return await runKnipWithOptions(monorepoRoot, resolveWorkspaceName(rootDirectory));
	} catch {
		return runKnipWithOptions(rootDirectory);
	}
};
const runKnip = async (rootDirectory) => {
	const monorepoRoot = findMonorepoRoot(rootDirectory);
	if (!(hasNodeModules(rootDirectory) || monorepoRoot !== null && hasNodeModules(monorepoRoot))) return [];
	const { issues } = await runKnipForProject(rootDirectory, monorepoRoot);
	const diagnostics = [];
	const filesDescriptor = KNIP_ISSUE_TYPE_DESCRIPTORS.get("files") ?? FALLBACK_KNIP_DESCRIPTOR;
	for (const unusedFilePath of collectUnusedFilePaths(issues.files)) diagnostics.push({
		filePath: path.relative(rootDirectory, unusedFilePath),
		plugin: "knip",
		rule: "files",
		severity: filesDescriptor.severity,
		message: filesDescriptor.message,
		help: "This file is not imported by any other file in the project.",
		line: 0,
		column: 0,
		category: filesDescriptor.category
	});
	for (const issueType of [
		"exports",
		"types",
		"duplicates"
	]) diagnostics.push(...collectIssueRecords(issues[issueType], issueType, rootDirectory));
	return diagnostics;
};
//#endregion
//#region src/utils/batch-include-paths.ts
const estimateArgsLength = (args) => args.reduce((total, argument) => total + argument.length + 1, 0);
const batchIncludePaths = (baseArgs, includePaths) => {
	const baseArgsLength = estimateArgsLength(baseArgs);
	const batches = [];
	let currentBatch = [];
	let currentBatchLength = baseArgsLength;
	for (const filePath of includePaths) {
		const entryLength = filePath.length + 1;
		const exceedsArgLength = currentBatch.length > 0 && currentBatchLength + entryLength > 24e3;
		const exceedsFileCount = currentBatch.length >= 500;
		if (exceedsArgLength || exceedsFileCount) {
			batches.push(currentBatch);
			currentBatch = [];
			currentBatchLength = baseArgsLength;
		}
		currentBatch.push(filePath);
		currentBatchLength += entryLength;
	}
	if (currentBatch.length > 0) batches.push(currentBatch);
	return batches;
};
//#endregion
//#region src/utils/can-oxlint-extend-config.ts
const EXTENDS_LOCAL_PATH_PREFIXES = [
	"./",
	"../",
	"/"
];
const isLocalPathExtend = (entry) => {
	for (const prefix of EXTENDS_LOCAL_PATH_PREFIXES) if (entry.startsWith(prefix)) return true;
	return false;
};
const stripJsoncComments = (raw) => {
	let result = "";
	let cursor = 0;
	let inString = false;
	let stringQuote = "";
	while (cursor < raw.length) {
		const character = raw[cursor];
		const nextCharacter = raw[cursor + 1];
		if (inString) {
			result += character;
			if (character === "\\" && cursor + 1 < raw.length) {
				result += nextCharacter;
				cursor += 2;
				continue;
			}
			if (character === stringQuote) inString = false;
			cursor += 1;
			continue;
		}
		if (character === "\"" || character === "'") {
			inString = true;
			stringQuote = character;
			result += character;
			cursor += 1;
			continue;
		}
		if (character === "/" && nextCharacter === "/") {
			const lineEndIndex = raw.indexOf("\n", cursor);
			cursor = lineEndIndex === -1 ? raw.length : lineEndIndex;
			continue;
		}
		if (character === "/" && nextCharacter === "*") {
			const blockEndIndex = raw.indexOf("*/", cursor + 2);
			cursor = blockEndIndex === -1 ? raw.length : blockEndIndex + 2;
			continue;
		}
		result += character;
		cursor += 1;
	}
	return result;
};
const parseJsonOrJsonc = (raw) => {
	try {
		return JSON.parse(raw);
	} catch {
		return JSON.parse(stripJsoncComments(raw));
	}
};
const canOxlintExtendConfig = (configPath) => {
	if (!configPath.endsWith(".eslintrc.json")) return true;
	let parsed;
	try {
		parsed = parseJsonOrJsonc(fs.readFileSync(configPath, "utf-8"));
	} catch {
		return true;
	}
	if (!isPlainObject(parsed)) return true;
	const extendsValue = parsed.extends;
	if (extendsValue === void 0 || extendsValue === null) return true;
	const extendsEntries = Array.isArray(extendsValue) ? extendsValue : [extendsValue];
	if (extendsEntries.length === 0) return true;
	return extendsEntries.some((entry) => typeof entry === "string" && isLocalPathExtend(entry));
};
//#endregion
//#region src/utils/detect-user-lint-config.ts
const findFirstLintConfigInDirectory = (directory) => {
	for (const filename of ADOPTABLE_LINT_CONFIG_FILENAMES) {
		const candidatePath = path.join(directory, filename);
		if (isFile(candidatePath)) return candidatePath;
	}
	return null;
};
const isProjectBoundary = (directory) => fs.existsSync(path.join(directory, ".git")) || isMonorepoRoot(directory);
const detectUserLintConfigPaths = (rootDirectory) => {
	const directLintConfig = findFirstLintConfigInDirectory(rootDirectory);
	if (directLintConfig) return [directLintConfig];
	if (isProjectBoundary(rootDirectory)) return [];
	let ancestorDirectory = path.dirname(rootDirectory);
	while (ancestorDirectory !== path.dirname(ancestorDirectory)) {
		const ancestorLintConfig = findFirstLintConfigInDirectory(ancestorDirectory);
		if (ancestorLintConfig) return [ancestorLintConfig];
		if (isProjectBoundary(ancestorDirectory)) return [];
		ancestorDirectory = path.dirname(ancestorDirectory);
	}
	return [];
};
//#endregion
//#region src/oxlint-config.ts
const esmRequire$1 = createRequire(import.meta.url);
const NEXTJS_RULES = {
	"react-doctor/nextjs-no-img-element": "warn",
	"react-doctor/nextjs-async-client-component": "error",
	"react-doctor/nextjs-no-a-element": "warn",
	"react-doctor/nextjs-no-use-search-params-without-suspense": "warn",
	"react-doctor/nextjs-no-client-fetch-for-server-data": "warn",
	"react-doctor/nextjs-missing-metadata": "warn",
	"react-doctor/nextjs-no-client-side-redirect": "warn",
	"react-doctor/nextjs-no-redirect-in-try-catch": "warn",
	"react-doctor/nextjs-image-missing-sizes": "warn",
	"react-doctor/nextjs-no-native-script": "warn",
	"react-doctor/nextjs-inline-script-missing-id": "warn",
	"react-doctor/nextjs-no-font-link": "warn",
	"react-doctor/nextjs-no-css-link": "warn",
	"react-doctor/nextjs-no-polyfill-script": "warn",
	"react-doctor/nextjs-no-head-import": "error",
	"react-doctor/nextjs-no-side-effect-in-get-handler": "error"
};
const REACT_NATIVE_RULES = {
	"react-doctor/rn-no-raw-text": "error",
	"react-doctor/rn-no-deprecated-modules": "error",
	"react-doctor/rn-no-legacy-expo-packages": "warn",
	"react-doctor/rn-no-dimensions-get": "warn",
	"react-doctor/rn-no-inline-flatlist-renderitem": "warn",
	"react-doctor/rn-no-legacy-shadow-styles": "warn",
	"react-doctor/rn-prefer-reanimated": "warn",
	"react-doctor/rn-no-single-element-style-array": "warn",
	"react-doctor/rn-prefer-pressable": "warn",
	"react-doctor/rn-prefer-expo-image": "warn",
	"react-doctor/rn-no-non-native-navigator": "warn",
	"react-doctor/rn-no-scroll-state": "error",
	"react-doctor/rn-no-scrollview-mapped-list": "warn",
	"react-doctor/rn-no-inline-object-in-list-item": "warn",
	"react-doctor/rn-animate-layout-property": "error",
	"react-doctor/rn-prefer-content-inset-adjustment": "warn",
	"react-doctor/rn-pressable-shared-value-mutation": "warn",
	"react-doctor/rn-list-data-mapped": "warn",
	"react-doctor/rn-list-callback-per-row": "warn",
	"react-doctor/rn-list-recyclable-without-types": "warn",
	"react-doctor/rn-animation-reaction-as-derived": "warn",
	"react-doctor/rn-bottom-sheet-prefer-native": "warn",
	"react-doctor/rn-scrollview-dynamic-padding": "warn",
	"react-doctor/rn-style-prefer-boxshadow": "warn"
};
const TANSTACK_START_RULES = {
	"react-doctor/tanstack-start-route-property-order": "error",
	"react-doctor/tanstack-start-no-direct-fetch-in-loader": "warn",
	"react-doctor/tanstack-start-server-fn-validate-input": "warn",
	"react-doctor/tanstack-start-no-useeffect-fetch": "warn",
	"react-doctor/tanstack-start-missing-head-content": "warn",
	"react-doctor/tanstack-start-no-anchor-element": "warn",
	"react-doctor/tanstack-start-server-fn-method-order": "error",
	"react-doctor/tanstack-start-no-navigate-in-render": "warn",
	"react-doctor/tanstack-start-no-dynamic-server-fn-import": "error",
	"react-doctor/tanstack-start-no-use-server-in-handler": "error",
	"react-doctor/tanstack-start-no-secrets-in-loader": "error",
	"react-doctor/tanstack-start-get-mutation": "warn",
	"react-doctor/tanstack-start-redirect-in-try-catch": "warn",
	"react-doctor/tanstack-start-loader-parallel-fetch": "warn"
};
const REACT_COMPILER_RULES = {
	"react-hooks-js/set-state-in-render": "error",
	"react-hooks-js/immutability": "error",
	"react-hooks-js/refs": "error",
	"react-hooks-js/purity": "error",
	"react-hooks-js/hooks": "error",
	"react-hooks-js/set-state-in-effect": "error",
	"react-hooks-js/globals": "error",
	"react-hooks-js/error-boundaries": "error",
	"react-hooks-js/preserve-manual-memoization": "error",
	"react-hooks-js/unsupported-syntax": "error",
	"react-hooks-js/component-hook-factories": "error",
	"react-hooks-js/static-components": "error",
	"react-hooks-js/use-memo": "error",
	"react-hooks-js/void-use-memo": "error",
	"react-hooks-js/incompatible-library": "error",
	"react-hooks-js/todo": "error"
};
const readPluginRuleNames = (pluginSpecifier) => {
	try {
		const pluginModule = esmRequire$1(pluginSpecifier);
		const rules = pluginModule.rules ?? pluginModule.default?.rules;
		if (rules === void 0) return /* @__PURE__ */ new Set();
		return new Set(Object.keys(rules));
	} catch {
		return /* @__PURE__ */ new Set();
	}
};
const resolveReactHooksJsPlugin = (hasReactCompiler, customRulesOnly) => {
	if (!hasReactCompiler || customRulesOnly) return null;
	let pluginSpecifier;
	try {
		pluginSpecifier = esmRequire$1.resolve("eslint-plugin-react-hooks");
	} catch {
		return null;
	}
	return {
		entry: {
			name: "react-hooks-js",
			specifier: pluginSpecifier
		},
		availableRuleNames: readPluginRuleNames(pluginSpecifier)
	};
};
const filterRulesToAvailable = (rules, pluginNamespace, availableRuleNames) => {
	if (availableRuleNames.size === 0) return rules;
	const ruleKeyPrefix = `${pluginNamespace}/`;
	const filtered = {};
	for (const [ruleKey, severity] of Object.entries(rules)) {
		if (!ruleKey.startsWith(ruleKeyPrefix)) {
			filtered[ruleKey] = severity;
			continue;
		}
		const ruleName = ruleKey.slice(ruleKeyPrefix.length);
		if (availableRuleNames.has(ruleName)) filtered[ruleKey] = severity;
	}
	return filtered;
};
const TANSTACK_QUERY_RULES = {
	"react-doctor/query-stable-query-client": "warn",
	"react-doctor/query-no-rest-destructuring": "warn",
	"react-doctor/query-no-void-query-fn": "warn",
	"react-doctor/query-no-query-in-effect": "warn",
	"react-doctor/query-mutation-missing-invalidation": "warn",
	"react-doctor/query-no-usequery-for-mutation": "warn"
};
const BUILTIN_REACT_RULES = {
	"react/rules-of-hooks": "error",
	"react/no-direct-mutation-state": "error",
	"react/jsx-no-duplicate-props": "error",
	"react/jsx-key": "error",
	"react/no-children-prop": "warn",
	"react/no-danger": "warn",
	"react/jsx-no-script-url": "error",
	"react/no-render-return-value": "warn",
	"react/no-string-refs": "warn",
	"react/no-is-mounted": "warn",
	"react/require-render-return": "error",
	"react/no-unknown-property": "warn"
};
const BUILTIN_A11Y_RULES = {
	"jsx-a11y/alt-text": "error",
	"jsx-a11y/anchor-is-valid": "warn",
	"jsx-a11y/click-events-have-key-events": "warn",
	"jsx-a11y/no-static-element-interactions": "warn",
	"jsx-a11y/role-has-required-aria-props": "error",
	"jsx-a11y/no-autofocus": "warn",
	"jsx-a11y/heading-has-content": "warn",
	"jsx-a11y/html-has-lang": "warn",
	"jsx-a11y/no-redundant-roles": "warn",
	"jsx-a11y/scope": "warn",
	"jsx-a11y/tabindex-no-positive": "warn",
	"jsx-a11y/label-has-associated-control": "warn",
	"jsx-a11y/no-distracting-elements": "error",
	"jsx-a11y/iframe-has-title": "warn"
};
const GLOBAL_REACT_DOCTOR_RULES = {
	"react-doctor/no-derived-state-effect": "warn",
	"react-doctor/no-fetch-in-effect": "warn",
	"react-doctor/no-mirror-prop-effect": "warn",
	"react-doctor/no-mutable-in-deps": "error",
	"react-doctor/no-cascading-set-state": "warn",
	"react-doctor/no-effect-chain": "warn",
	"react-doctor/no-effect-event-handler": "warn",
	"react-doctor/no-effect-event-in-deps": "error",
	"react-doctor/no-event-trigger-state": "warn",
	"react-doctor/no-prop-callback-in-effect": "warn",
	"react-doctor/no-derived-useState": "warn",
	"react-doctor/no-direct-state-mutation": "warn",
	"react-doctor/no-set-state-in-render": "warn",
	"react-doctor/prefer-use-effect-event": "warn",
	"react-doctor/prefer-useReducer": "warn",
	"react-doctor/prefer-use-sync-external-store": "warn",
	"react-doctor/rerender-lazy-state-init": "warn",
	"react-doctor/rerender-functional-setstate": "warn",
	"react-doctor/rerender-dependencies": "error",
	"react-doctor/rerender-state-only-in-handlers": "warn",
	"react-doctor/rerender-defer-reads-hook": "warn",
	"react-doctor/advanced-event-handler-refs": "warn",
	"react-doctor/effect-needs-cleanup": "error",
	"react-doctor/no-giant-component": "warn",
	"react-doctor/no-render-in-render": "warn",
	"react-doctor/no-many-boolean-props": "warn",
	"react-doctor/no-react19-deprecated-apis": "warn",
	"react-doctor/no-render-prop-children": "warn",
	"react-doctor/no-nested-component-definition": "error",
	"react-doctor/react-compiler-destructure-method": "warn",
	"react-doctor/no-legacy-class-lifecycles": "error",
	"react-doctor/no-legacy-context-api": "error",
	"react-doctor/no-default-props": "warn",
	"react-doctor/no-react-dom-deprecated-apis": "warn",
	"react-doctor/no-usememo-simple-expression": "warn",
	"react-doctor/no-layout-property-animation": "error",
	"react-doctor/rerender-memo-with-default-value": "warn",
	"react-doctor/rerender-memo-before-early-return": "warn",
	"react-doctor/rerender-transitions-scroll": "warn",
	"react-doctor/rerender-derived-state-from-hook": "warn",
	"react-doctor/async-defer-await": "warn",
	"react-doctor/async-await-in-loop": "warn",
	"react-doctor/rendering-animate-svg-wrapper": "warn",
	"react-doctor/rendering-hoist-jsx": "warn",
	"react-doctor/rendering-hydration-mismatch-time": "warn",
	"react-doctor/no-inline-prop-on-memo-component": "warn",
	"react-doctor/rendering-hydration-no-flicker": "warn",
	"react-doctor/rendering-script-defer-async": "warn",
	"react-doctor/rendering-usetransition-loading": "warn",
	"react-doctor/no-transition-all": "warn",
	"react-doctor/no-global-css-variable-animation": "error",
	"react-doctor/no-large-animated-blur": "warn",
	"react-doctor/no-scale-from-zero": "warn",
	"react-doctor/no-permanent-will-change": "warn",
	"react-doctor/no-eval": "error",
	"react-doctor/no-secrets-in-client-code": "warn",
	"react-doctor/no-generic-handler-names": "warn",
	"react-doctor/js-flatmap-filter": "warn",
	"react-doctor/js-combine-iterations": "warn",
	"react-doctor/js-tosorted-immutable": "warn",
	"react-doctor/js-hoist-regexp": "warn",
	"react-doctor/js-hoist-intl": "warn",
	"react-doctor/js-cache-property-access": "warn",
	"react-doctor/js-length-check-first": "warn",
	"react-doctor/js-min-max-loop": "warn",
	"react-doctor/js-set-map-lookups": "warn",
	"react-doctor/js-batch-dom-css": "warn",
	"react-doctor/js-index-maps": "warn",
	"react-doctor/js-cache-storage": "warn",
	"react-doctor/js-early-exit": "warn",
	"react-doctor/no-barrel-import": "warn",
	"react-doctor/no-dynamic-import-path": "warn",
	"react-doctor/no-full-lodash-import": "warn",
	"react-doctor/no-moment": "warn",
	"react-doctor/prefer-dynamic-import": "warn",
	"react-doctor/use-lazy-motion": "warn",
	"react-doctor/no-undeferred-third-party": "warn",
	"react-doctor/no-array-index-as-key": "warn",
	"react-doctor/no-polymorphic-children": "warn",
	"react-doctor/rendering-conditional-render": "warn",
	"react-doctor/rendering-svg-precision": "warn",
	"react-doctor/no-prevent-default": "warn",
	"react-doctor/no-uncontrolled-input": "warn",
	"react-doctor/no-document-start-view-transition": "warn",
	"react-doctor/no-flush-sync": "warn",
	"react-doctor/server-auth-actions": "error",
	"react-doctor/server-after-nonblocking": "warn",
	"react-doctor/server-no-mutable-module-state": "error",
	"react-doctor/server-cache-with-object-literal": "warn",
	"react-doctor/server-hoist-static-io": "warn",
	"react-doctor/server-dedup-props": "warn",
	"react-doctor/server-sequential-independent-await": "warn",
	"react-doctor/server-fetch-without-revalidate": "warn",
	"react-doctor/client-passive-event-listeners": "warn",
	"react-doctor/client-localstorage-no-version": "warn",
	"react-doctor/no-inline-bounce-easing": "warn",
	"react-doctor/no-z-index-9999": "warn",
	"react-doctor/no-inline-exhaustive-style": "warn",
	"react-doctor/no-side-tab-border": "warn",
	"react-doctor/no-pure-black-background": "warn",
	"react-doctor/no-gradient-text": "warn",
	"react-doctor/no-dark-mode-glow": "warn",
	"react-doctor/no-justified-text": "warn",
	"react-doctor/no-tiny-text": "warn",
	"react-doctor/no-wide-letter-spacing": "warn",
	"react-doctor/no-gray-on-colored-background": "warn",
	"react-doctor/no-layout-transition-inline": "warn",
	"react-doctor/no-disabled-zoom": "error",
	"react-doctor/no-outline-none": "warn",
	"react-doctor/no-long-transition-duration": "warn",
	"react-doctor/design-no-bold-heading": "warn",
	"react-doctor/design-no-redundant-padding-axes": "warn",
	"react-doctor/design-no-redundant-size-axes": "warn",
	"react-doctor/design-no-space-on-flex-children": "warn",
	"react-doctor/design-no-em-dash-in-jsx-text": "warn",
	"react-doctor/design-no-three-period-ellipsis": "warn",
	"react-doctor/design-no-default-tailwind-palette": "warn",
	"react-doctor/design-no-vague-button-label": "warn",
	"react-doctor/async-parallel": "warn"
};
const ALL_REACT_DOCTOR_RULE_KEYS = new Set([
	...Object.keys(GLOBAL_REACT_DOCTOR_RULES),
	...Object.keys(NEXTJS_RULES),
	...Object.keys(REACT_NATIVE_RULES),
	...Object.keys(TANSTACK_START_RULES),
	...Object.keys(TANSTACK_QUERY_RULES)
]);
const VERSION_GATED_RULE_IDS = new Map([
	["react-doctor/no-react19-deprecated-apis", {
		minMajor: 19,
		mode: "deprecation-warning"
	}],
	["react-doctor/no-default-props", {
		minMajor: 19,
		mode: "deprecation-warning"
	}],
	["react-doctor/no-react-dom-deprecated-apis", {
		minMajor: 18,
		mode: "deprecation-warning"
	}],
	["react-doctor/prefer-use-effect-event", {
		minMajor: 19,
		mode: "prefer-newer-api"
	}]
]);
const filterRulesByReactMajor = (rules, reactMajorVersion) => {
	return Object.fromEntries(Object.entries(rules).filter(([ruleKey]) => {
		const gate = VERSION_GATED_RULE_IDS.get(ruleKey);
		if (gate === void 0) return true;
		if (gate.mode === "deprecation-warning") return true;
		if (reactMajorVersion === null) return true;
		return reactMajorVersion >= gate.minMajor;
	}));
};
const createOxlintConfig = ({ pluginPath, framework, hasReactCompiler, hasTanStackQuery, customRulesOnly = false, reactMajorVersion = null, extendsPaths = [] }) => {
	const reactHooksJsPlugin = resolveReactHooksJsPlugin(hasReactCompiler, customRulesOnly);
	const reactCompilerRules = reactHooksJsPlugin ? filterRulesToAvailable(REACT_COMPILER_RULES, "react-hooks-js", reactHooksJsPlugin.availableRuleNames) : {};
	return {
		...extendsPaths.length > 0 ? { extends: extendsPaths } : {},
		categories: {
			correctness: "off",
			suspicious: "off",
			pedantic: "off",
			perf: "off",
			restriction: "off",
			style: "off",
			nursery: "off"
		},
		plugins: customRulesOnly ? [] : ["react", "jsx-a11y"],
		jsPlugins: reactHooksJsPlugin ? [reactHooksJsPlugin.entry, pluginPath] : [pluginPath],
		rules: {
			...customRulesOnly ? {} : BUILTIN_REACT_RULES,
			...customRulesOnly ? {} : BUILTIN_A11Y_RULES,
			...reactCompilerRules,
			...filterRulesByReactMajor(GLOBAL_REACT_DOCTOR_RULES, reactMajorVersion),
			...framework === "nextjs" ? NEXTJS_RULES : {},
			...framework === "expo" || framework === "react-native" ? REACT_NATIVE_RULES : {},
			...framework === "tanstack-start" ? TANSTACK_START_RULES : {},
			...hasTanStackQuery ? TANSTACK_QUERY_RULES : {}
		}
	};
};
//#endregion
//#region src/utils/neutralize-disable-directives.ts
const DISABLE_DIRECTIVE_PATTERN = /(eslint|oxlint)-disable/;
const findFilesWithDisableDirectivesViaGit = (rootDirectory, includePaths) => {
	const grepArgs = [
		"grep",
		"-l",
		"--untracked",
		"-E",
		"(eslint|oxlint)-disable"
	];
	if (includePaths && includePaths.length > 0) grepArgs.push("--", ...includePaths);
	const result = spawnSync("git", grepArgs, {
		cwd: rootDirectory,
		encoding: "utf-8",
		maxBuffer: GIT_LS_FILES_MAX_BUFFER_BYTES
	});
	if (result.error || result.status === null) return null;
	if (result.status === 128) return null;
	return result.stdout.split("\n").filter((filePath) => filePath.length > 0 && SOURCE_FILE_PATTERN.test(filePath));
};
const findFilesWithDisableDirectivesViaFilesystem = (rootDirectory, includePaths) => {
	const matches = [];
	const checkFile = (relativePath) => {
		if (!SOURCE_FILE_PATTERN.test(relativePath)) return;
		const absolutePath = path.join(rootDirectory, relativePath);
		let content;
		try {
			content = fs.readFileSync(absolutePath, "utf-8");
		} catch {
			return;
		}
		if (DISABLE_DIRECTIVE_PATTERN.test(content)) matches.push(relativePath);
	};
	if (includePaths && includePaths.length > 0) {
		for (const candidate of includePaths) checkFile(candidate);
		return matches;
	}
	const stack = [rootDirectory];
	while (stack.length > 0) {
		const current = stack.pop();
		if (current === void 0) continue;
		let entries;
		try {
			entries = fs.readdirSync(current, { withFileTypes: true });
		} catch {
			continue;
		}
		for (const entry of entries) {
			if (entry.isDirectory()) {
				if (entry.name.startsWith(".") || IGNORED_DIRECTORIES.has(entry.name)) continue;
				stack.push(path.join(current, entry.name));
				continue;
			}
			if (!entry.isFile()) continue;
			const absolute = path.join(current, entry.name);
			checkFile(path.relative(rootDirectory, absolute));
		}
	}
	return matches;
};
const findFilesWithDisableDirectives = (rootDirectory, includePaths) => findFilesWithDisableDirectivesViaGit(rootDirectory, includePaths) ?? findFilesWithDisableDirectivesViaFilesystem(rootDirectory, includePaths);
const neutralizeContent = (content) => content.replaceAll("eslint-disable", "eslint_disable").replaceAll("oxlint-disable", "oxlint_disable");
const neutralizeDisableDirectives = (rootDirectory, includePaths) => {
	const filePaths = findFilesWithDisableDirectives(rootDirectory, includePaths);
	const originalContents = /* @__PURE__ */ new Map();
	let isRestored = false;
	const restore = () => {
		if (isRestored) return;
		isRestored = true;
		for (const [absolutePath, originalContent] of originalContents) try {
			fs.writeFileSync(absolutePath, originalContent);
		} catch {}
	};
	const onExit = () => restore();
	process.once("exit", onExit);
	for (const relativePath of filePaths) {
		const absolutePath = path.join(rootDirectory, relativePath);
		let originalContent;
		try {
			originalContent = fs.readFileSync(absolutePath, "utf-8");
		} catch {
			continue;
		}
		const neutralizedContent = neutralizeContent(originalContent);
		if (neutralizedContent !== originalContent) {
			originalContents.set(absolutePath, originalContent);
			fs.writeFileSync(absolutePath, neutralizedContent);
		}
	}
	return () => {
		restore();
		process.removeListener("exit", onExit);
	};
};
//#endregion
//#region src/utils/run-oxlint.ts
const esmRequire = createRequire(import.meta.url);
const PLUGIN_CATEGORY_MAP = {
	react: "Correctness",
	"react-hooks": "Correctness",
	"react-hooks-js": "React Compiler",
	"react-doctor": "Other",
	"jsx-a11y": "Accessibility",
	knip: "Dead Code",
	eslint: "Correctness",
	oxc: "Correctness",
	typescript: "Correctness",
	unicorn: "Correctness",
	import: "Bundle Size",
	promise: "Correctness",
	n: "Correctness",
	node: "Correctness",
	vitest: "Correctness",
	jest: "Correctness",
	nextjs: "Next.js"
};
const RULE_CATEGORY_MAP = {
	"react-doctor/no-derived-state-effect": "State & Effects",
	"react-doctor/no-fetch-in-effect": "State & Effects",
	"react-doctor/no-mirror-prop-effect": "State & Effects",
	"react-doctor/no-mutable-in-deps": "State & Effects",
	"react-doctor/no-cascading-set-state": "State & Effects",
	"react-doctor/no-effect-chain": "State & Effects",
	"react-doctor/no-effect-event-handler": "State & Effects",
	"react-doctor/no-effect-event-in-deps": "State & Effects",
	"react-doctor/no-event-trigger-state": "State & Effects",
	"react-doctor/no-prop-callback-in-effect": "State & Effects",
	"react-doctor/no-derived-useState": "State & Effects",
	"react-doctor/no-direct-state-mutation": "State & Effects",
	"react-doctor/no-set-state-in-render": "State & Effects",
	"react-doctor/prefer-use-effect-event": "State & Effects",
	"react-doctor/prefer-useReducer": "State & Effects",
	"react-doctor/prefer-use-sync-external-store": "State & Effects",
	"react-doctor/rerender-lazy-state-init": "Performance",
	"react-doctor/rerender-functional-setstate": "Performance",
	"react-doctor/rerender-dependencies": "State & Effects",
	"react-doctor/rerender-state-only-in-handlers": "Performance",
	"react-doctor/rerender-defer-reads-hook": "Performance",
	"react-doctor/advanced-event-handler-refs": "Performance",
	"react-doctor/effect-needs-cleanup": "State & Effects",
	"react-doctor/no-generic-handler-names": "Architecture",
	"react-doctor/no-giant-component": "Architecture",
	"react-doctor/no-many-boolean-props": "Architecture",
	"react-doctor/no-react19-deprecated-apis": "Architecture",
	"react-doctor/no-render-prop-children": "Architecture",
	"react-doctor/no-render-in-render": "Architecture",
	"react-doctor/no-nested-component-definition": "Correctness",
	"react-doctor/react-compiler-destructure-method": "Architecture",
	"react-doctor/no-legacy-class-lifecycles": "Correctness",
	"react-doctor/no-legacy-context-api": "Correctness",
	"react-doctor/no-default-props": "Architecture",
	"react-doctor/no-react-dom-deprecated-apis": "Architecture",
	"react-doctor/no-usememo-simple-expression": "Performance",
	"react-doctor/no-layout-property-animation": "Performance",
	"react-doctor/rerender-memo-with-default-value": "Performance",
	"react-doctor/rerender-memo-before-early-return": "Performance",
	"react-doctor/rerender-transitions-scroll": "Performance",
	"react-doctor/rerender-derived-state-from-hook": "Performance",
	"react-doctor/async-defer-await": "Performance",
	"react-doctor/async-await-in-loop": "Performance",
	"react-doctor/rendering-animate-svg-wrapper": "Performance",
	"react-doctor/rendering-hoist-jsx": "Performance",
	"react-doctor/rendering-hydration-mismatch-time": "Correctness",
	"react-doctor/rendering-usetransition-loading": "Performance",
	"react-doctor/rendering-hydration-no-flicker": "Performance",
	"react-doctor/rendering-script-defer-async": "Performance",
	"react-doctor/no-inline-prop-on-memo-component": "Performance",
	"react-doctor/no-transition-all": "Performance",
	"react-doctor/no-global-css-variable-animation": "Performance",
	"react-doctor/no-large-animated-blur": "Performance",
	"react-doctor/no-scale-from-zero": "Performance",
	"react-doctor/no-permanent-will-change": "Performance",
	"react-doctor/no-secrets-in-client-code": "Security",
	"react-doctor/no-barrel-import": "Bundle Size",
	"react-doctor/no-dynamic-import-path": "Bundle Size",
	"react-doctor/no-full-lodash-import": "Bundle Size",
	"react-doctor/no-moment": "Bundle Size",
	"react-doctor/prefer-dynamic-import": "Bundle Size",
	"react-doctor/use-lazy-motion": "Bundle Size",
	"react-doctor/no-undeferred-third-party": "Bundle Size",
	"react-doctor/no-array-index-as-key": "Correctness",
	"react-doctor/no-polymorphic-children": "Architecture",
	"react-doctor/rendering-conditional-render": "Correctness",
	"react-doctor/rendering-svg-precision": "Performance",
	"react-doctor/no-prevent-default": "Correctness",
	"react-doctor/no-uncontrolled-input": "Correctness",
	"react-doctor/no-document-start-view-transition": "Correctness",
	"react-doctor/no-flush-sync": "Performance",
	"react-doctor/nextjs-no-img-element": "Next.js",
	"react-doctor/nextjs-async-client-component": "Next.js",
	"react-doctor/nextjs-no-a-element": "Next.js",
	"react-doctor/nextjs-no-use-search-params-without-suspense": "Next.js",
	"react-doctor/nextjs-no-client-fetch-for-server-data": "Next.js",
	"react-doctor/nextjs-missing-metadata": "Next.js",
	"react-doctor/nextjs-no-client-side-redirect": "Next.js",
	"react-doctor/nextjs-no-redirect-in-try-catch": "Next.js",
	"react-doctor/nextjs-image-missing-sizes": "Next.js",
	"react-doctor/nextjs-no-native-script": "Next.js",
	"react-doctor/nextjs-inline-script-missing-id": "Next.js",
	"react-doctor/nextjs-no-font-link": "Next.js",
	"react-doctor/nextjs-no-css-link": "Next.js",
	"react-doctor/nextjs-no-polyfill-script": "Next.js",
	"react-doctor/nextjs-no-head-import": "Next.js",
	"react-doctor/nextjs-no-side-effect-in-get-handler": "Security",
	"react-doctor/server-auth-actions": "Server",
	"react-doctor/server-after-nonblocking": "Server",
	"react-doctor/server-no-mutable-module-state": "Server",
	"react-doctor/server-cache-with-object-literal": "Server",
	"react-doctor/server-hoist-static-io": "Server",
	"react-doctor/server-dedup-props": "Server",
	"react-doctor/server-sequential-independent-await": "Server",
	"react-doctor/server-fetch-without-revalidate": "Server",
	"react-doctor/client-passive-event-listeners": "Performance",
	"react-doctor/client-localstorage-no-version": "Correctness",
	"react-doctor/query-stable-query-client": "TanStack Query",
	"react-doctor/query-no-rest-destructuring": "TanStack Query",
	"react-doctor/query-no-void-query-fn": "TanStack Query",
	"react-doctor/query-no-query-in-effect": "TanStack Query",
	"react-doctor/query-mutation-missing-invalidation": "TanStack Query",
	"react-doctor/query-no-usequery-for-mutation": "TanStack Query",
	"react-doctor/no-inline-bounce-easing": "Performance",
	"react-doctor/no-z-index-9999": "Architecture",
	"react-doctor/no-inline-exhaustive-style": "Architecture",
	"react-doctor/no-side-tab-border": "Architecture",
	"react-doctor/no-pure-black-background": "Architecture",
	"react-doctor/no-gradient-text": "Architecture",
	"react-doctor/no-dark-mode-glow": "Architecture",
	"react-doctor/no-justified-text": "Accessibility",
	"react-doctor/no-tiny-text": "Accessibility",
	"react-doctor/no-wide-letter-spacing": "Architecture",
	"react-doctor/no-gray-on-colored-background": "Accessibility",
	"react-doctor/no-layout-transition-inline": "Performance",
	"react-doctor/no-disabled-zoom": "Accessibility",
	"react-doctor/no-outline-none": "Accessibility",
	"react-doctor/no-long-transition-duration": "Performance",
	"react-doctor/design-no-bold-heading": "Architecture",
	"react-doctor/design-no-redundant-padding-axes": "Architecture",
	"react-doctor/design-no-redundant-size-axes": "Architecture",
	"react-doctor/design-no-space-on-flex-children": "Architecture",
	"react-doctor/design-no-em-dash-in-jsx-text": "Architecture",
	"react-doctor/design-no-three-period-ellipsis": "Architecture",
	"react-doctor/design-no-default-tailwind-palette": "Architecture",
	"react-doctor/design-no-vague-button-label": "Accessibility",
	"react-doctor/js-flatmap-filter": "Performance",
	"react-doctor/js-combine-iterations": "Performance",
	"react-doctor/js-tosorted-immutable": "Performance",
	"react-doctor/js-hoist-regexp": "Performance",
	"react-doctor/js-hoist-intl": "Performance",
	"react-doctor/js-cache-property-access": "Performance",
	"react-doctor/js-length-check-first": "Performance",
	"react-doctor/js-min-max-loop": "Performance",
	"react-doctor/js-set-map-lookups": "Performance",
	"react-doctor/js-batch-dom-css": "Performance",
	"react-doctor/js-index-maps": "Performance",
	"react-doctor/js-cache-storage": "Performance",
	"react-doctor/js-early-exit": "Performance",
	"react-doctor/no-eval": "Security",
	"react-doctor/async-parallel": "Performance",
	"react-doctor/rn-no-raw-text": "React Native",
	"react-doctor/rn-no-deprecated-modules": "React Native",
	"react-doctor/rn-no-legacy-expo-packages": "React Native",
	"react-doctor/rn-no-dimensions-get": "React Native",
	"react-doctor/rn-no-inline-flatlist-renderitem": "React Native",
	"react-doctor/rn-no-legacy-shadow-styles": "React Native",
	"react-doctor/rn-prefer-reanimated": "React Native",
	"react-doctor/rn-no-single-element-style-array": "React Native",
	"react-doctor/rn-prefer-pressable": "React Native",
	"react-doctor/rn-prefer-expo-image": "React Native",
	"react-doctor/rn-no-non-native-navigator": "React Native",
	"react-doctor/rn-no-scroll-state": "React Native",
	"react-doctor/rn-no-scrollview-mapped-list": "React Native",
	"react-doctor/rn-no-inline-object-in-list-item": "React Native",
	"react-doctor/rn-animate-layout-property": "React Native",
	"react-doctor/rn-prefer-content-inset-adjustment": "React Native",
	"react-doctor/rn-pressable-shared-value-mutation": "React Native",
	"react-doctor/rn-list-data-mapped": "React Native",
	"react-doctor/rn-list-callback-per-row": "React Native",
	"react-doctor/rn-list-recyclable-without-types": "React Native",
	"react-doctor/rn-animation-reaction-as-derived": "React Native",
	"react-doctor/rn-bottom-sheet-prefer-native": "React Native",
	"react-doctor/rn-scrollview-dynamic-padding": "React Native",
	"react-doctor/rn-style-prefer-boxshadow": "React Native",
	"react-doctor/tanstack-start-route-property-order": "TanStack Start",
	"react-doctor/tanstack-start-no-direct-fetch-in-loader": "TanStack Start",
	"react-doctor/tanstack-start-server-fn-validate-input": "TanStack Start",
	"react-doctor/tanstack-start-no-useeffect-fetch": "TanStack Start",
	"react-doctor/tanstack-start-missing-head-content": "TanStack Start",
	"react-doctor/tanstack-start-no-anchor-element": "TanStack Start",
	"react-doctor/tanstack-start-server-fn-method-order": "TanStack Start",
	"react-doctor/tanstack-start-no-navigate-in-render": "TanStack Start",
	"react-doctor/tanstack-start-no-dynamic-server-fn-import": "TanStack Start",
	"react-doctor/tanstack-start-no-use-server-in-handler": "TanStack Start",
	"react-doctor/tanstack-start-no-secrets-in-loader": "Security",
	"react-doctor/tanstack-start-get-mutation": "Security",
	"react-doctor/tanstack-start-redirect-in-try-catch": "TanStack Start",
	"react-doctor/tanstack-start-loader-parallel-fetch": "Performance"
};
const RULE_HELP_MAP = {
	"no-derived-state-effect": "For derived state, compute inline: `const x = fn(dep)`. For state resets on prop change, use a key prop: `<Component key={prop} />`. See https://react.dev/learn/you-might-not-need-an-effect",
	"no-fetch-in-effect": "Use `useQuery()` from @tanstack/react-query, `useSWR()`, or fetch in a Server Component instead",
	"no-mirror-prop-effect": "Delete both the `useState` and the `useEffect` and read the prop directly during render. Mirroring a prop into local state forces a stale first render before the effect re-syncs",
	"no-mutable-in-deps": "Read mutable values (`location.pathname`, `ref.current`) inside the effect body instead of in the deps array, or subscribe with `useSyncExternalStore`. Mutations to these don't trigger re-renders, so listing them in deps doesn't make the effect react to changes",
	"no-cascading-set-state": "Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`",
	"no-effect-chain": "Compute as much as possible during render (e.g. `const isGameOver = round > 5`) and write all related state inside the event handler that originally fires the chain. Each effect link adds an extra render and makes the code rigid as requirements evolve",
	"no-effect-event-handler": "Move the conditional logic into onClick, onChange, or onSubmit handlers directly",
	"no-event-trigger-state": "Delete the trigger state (`useState(null)` plus the `useEffect` that watches it) and call the side-effect (`post(...)` / `navigate(...)` / `track(...)`) directly inside the event handler that previously called the setter. State should not exist purely to schedule effect runs",
	"no-derived-useState": "Remove useState and compute the value inline: `const value = transform(propName)`",
	"no-direct-state-mutation": "Replace the mutation with a setter call that produces a new reference: `setItems([...items, newItem])`, `setItems(items.filter(x => x !== target))`, `setItems(items.toSorted(...))`. React only re-renders on a new reference, so in-place updates are silently dropped",
	"no-set-state-in-render": "Move the setter call into a `useEffect`, an event handler, or replace the state with a value computed during render. Calling a setter at render time triggers another render, which calls the setter again — an infinite loop",
	"prefer-use-effect-event": "Wrap the callback with `useEffectEvent(callback)` (React 19+) and call the resulting binding from inside the sub-handler. The Effect Event captures the latest props/state without being a reactive dep, so the effect doesn't re-subscribe on every parent render. See https://react.dev/reference/react/useEffectEvent",
	"prefer-useReducer": "Group related state: `const [state, dispatch] = useReducer(reducer, { field1, field2, ... })`",
	"prefer-use-sync-external-store": "Replace the `useState(getSnapshot())` + `useEffect(() => store.subscribe(() => setSnapshot(getSnapshot())))` pair with `useSyncExternalStore(store.subscribe, getSnapshot)`. The hook handles tearing during concurrent renders and SSR snapshots; the manual subscribe pattern doesn't",
	"rerender-lazy-state-init": "Wrap in an arrow function so it only runs once: `useState(() => expensiveComputation())`",
	"rerender-functional-setstate": "Use the callback form: `setState(prev => prev + 1)` to always read the latest value",
	"rerender-dependencies": "Extract to a useMemo, useRef, or module-level constant so the reference is stable",
	"no-effect-event-in-deps": "Call the useEffectEvent callback inside the effect body without listing it; its identity is intentionally unstable",
	"no-prop-callback-in-effect": "Lift the shared state into a Provider so both sides read the same source — no useEffect-driven sync needed",
	"no-generic-handler-names": "Rename to describe the action: e.g. `handleSubmit` → `saveUserProfile`, `handleClick` → `toggleSidebar`",
	"no-giant-component": "Extract logical sections into focused components: `<UserHeader />`, `<UserActions />`, etc.",
	"no-many-boolean-props": "Split into compound components or named variants: `<Button.Primary />`, `<DialogConfirm />` instead of stacking `isPrimary`, `isConfirm` flags",
	"no-react19-deprecated-apis": "Pass `ref` as a regular prop on function components — `forwardRef` is no longer needed in React 19+. Replace `useContext(X)` with `use(X)` for branch-aware context reads. Only enabled on projects detected as React 19+.",
	"no-legacy-class-lifecycles": "Move side effects in `componentWillMount` to `componentDidMount`; replace `componentWillReceiveProps` with `componentDidUpdate` (compare prevProps) or the static `getDerivedStateFromProps` for pure state derivation; replace `componentWillUpdate` with `getSnapshotBeforeUpdate` paired with `componentDidUpdate`. The `UNSAFE_` prefix only silences the warning — React 19 removes both forms.",
	"no-legacy-context-api": "Replace `childContextTypes` + `getChildContext` with `const MyContext = createContext(...)` + `<MyContext.Provider value={...}>`; replace `contextTypes` with `static contextType = MyContext` (single context) or `useContext()` / `use()` from a function component. The provider and every consumer must migrate together — partial migrations leave consumers reading the wrong context.",
	"no-default-props": "React 19 removes `Component.defaultProps` for function components. Move the defaults into the destructured props parameter: `function Foo({ size = \"md\", variant = \"primary\" })` instead of `Foo.defaultProps = { size: \"md\", variant: \"primary\" }`.",
	"no-react-dom-deprecated-apis": "Switch the legacy `react-dom` root API (`render` / `hydrate` / `unmountComponentAtNode`) to `createRoot` / `hydrateRoot` / `root.unmount()` from `react-dom/client`. Replace `findDOMNode` with a ref. The whole `react-dom/test-utils` entry point is removed in React 19 — use `act` from `react` and `fireEvent` / `render` from `@testing-library/react`. Only enabled on projects detected as React 18+.",
	"no-render-prop-children": "Replace `renderXxx` props with compound subcomponents (e.g. `<Modal.Header>`) or `children` so the parent doesn't dictate every customization point",
	"no-render-in-render": "Extract to a named component: `const ListItem = ({ item }) => <div>{item.name}</div>`",
	"no-nested-component-definition": "Move to a separate file or to module scope above the parent component",
	"no-usememo-simple-expression": "Remove useMemo — property access, math, and ternaries are already cheap without memoization",
	"no-layout-property-animation": "Use `transform: translateX()` or `scale()` instead — they run on the compositor and skip layout/paint",
	"rerender-memo-with-default-value": "Move to module scope: `const EMPTY_ITEMS: Item[] = []` then use as the default value",
	"rendering-animate-svg-wrapper": "Wrap the SVG: `<motion.div animate={...}><svg>...</svg></motion.div>`",
	"rendering-hoist-jsx": "Move the static JSX to module scope: `const ICON = <svg>...</svg>` outside the component so it isn't recreated each render",
	"rerender-memo-before-early-return": "Extract the JSX into a memoized child component so the parent's early return short-circuits before the child renders",
	"rerender-transitions-scroll": "Wrap the setState in startTransition (mark as non-urgent), use useDeferredValue, or stash in a ref + rAF throttle so scroll/pointer events don't trigger a re-render per fire",
	"rerender-state-only-in-handlers": "Replace useState with useRef when the value is only mutated and never read in render — `ref.current = ...` updates without re-rendering the component",
	"rerender-defer-reads-hook": "Read the URL state inside the handler (e.g. `new URL(window.location.href).searchParams`) so the component doesn't subscribe and re-render on every URL change",
	"rerender-derived-state-from-hook": "Use a threshold/media-query hook (e.g. `useMediaQuery(\"(max-width: 767px)\")`) — the component re-renders only when the threshold flips, not every pixel",
	"advanced-event-handler-refs": "Store the handler in a ref and have the listener read `handlerRef.current()` — the subscription stays put while the latest handler is always called",
	"effect-needs-cleanup": "Return a cleanup function that releases the subscription / timer: `return () => target.removeEventListener(name, handler)` for listeners, `return () => clearInterval(id)` / `clearTimeout(id)` for timers, or `return unsubscribe` if the subscribe call already returned one",
	"async-defer-await": "Move the `await` after the synchronous early-return guard so the skip path stays fast",
	"async-await-in-loop": "Collect the items and use `await Promise.all(items.map(...))` to run independent operations concurrently",
	"react-compiler-destructure-method": "Destructure the method up front: `const { push } = useRouter()` then call `push(...)` directly — clearer dependency graph and easier for React Compiler to memoize",
	"client-localstorage-no-version": "Bake a version into the storage key (e.g. \"myKey:v1\"); a future schema change can ignore old data instead of crashing on it",
	"server-sequential-independent-await": "Wrap independent awaits in `Promise.all([...])` so they race instead of waterfalling — second call doesn't depend on the first",
	"server-fetch-without-revalidate": "Pass `{ next: { revalidate: <seconds> } }` (or `cache: \"no-store\"` / `next: { tags: [...] }`) so stale cached data doesn't silently persist",
	"rn-list-callback-per-row": "Hoist the handler with useCallback at list scope and pass the row id as a primitive prop, so the row's memo() shallow-compare actually hits",
	"rn-list-recyclable-without-types": "Add `getItemType={item => item.kind}` so FlashList keeps separate recycle pools per item type — heterogeneous rows shouldn't share recycled cells",
	"rn-style-prefer-boxshadow": "Use the cross-platform CSS `boxShadow` string (RN v7+): `boxShadow: \"0 2px 8px rgba(0,0,0,0.1)\"` instead of platform-specific shadow*/elevation keys",
	"rendering-hydration-mismatch-time": "Wrap dynamic time/random values in useEffect+useState (client-only) or add suppressHydrationWarning to the parent if intentional",
	"no-polymorphic-children": "Expose explicit subcomponents (`<Button.Text>`, `<Button.Icon>`) so consumers don't need to switch on `typeof children`",
	"rendering-svg-precision": "Truncate path/points/transform decimals to 1–2 digits — sub-pixel precision adds bytes with no visible difference",
	"no-document-start-view-transition": "Render a <ViewTransition> component and update inside startTransition / useDeferredValue — React calls startViewTransition for you",
	"no-flush-sync": "Use startTransition for non-urgent updates — flushSync forces a sync flush that skips View Transitions and concurrent rendering",
	"rendering-usetransition-loading": "Replace with `const [isPending, startTransition] = useTransition()` — avoids a re-render for the loading state",
	"rendering-hydration-no-flicker": "Use `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` or add `suppressHydrationWarning` to the element",
	"rendering-script-defer-async": "Add `defer` for DOM-dependent scripts or `async` for independent ones (analytics). In Next.js, use `<Script strategy=\"afterInteractive\" />` instead",
	"no-inline-prop-on-memo-component": "Hoist the inline `() => ...` / `[]` / `{}` to a stable reference (useMemo, useCallback, or module scope) so the memoized child doesn't re-render every parent render",
	"no-transition-all": "List specific properties: `transition: \"opacity 200ms, transform 200ms\"` — or in Tailwind use `transition-colors`, `transition-opacity`, or `transition-transform`",
	"no-global-css-variable-animation": "Set the variable on the nearest element instead of a parent, or use `@property` with `inherits: false` to prevent cascade. Better yet, use targeted `element.style.transform` updates",
	"no-large-animated-blur": "Keep blur radius under 10px, or apply blur to a smaller element. Large blurs multiply GPU memory usage with layer size",
	"no-scale-from-zero": "Use `initial={{ scale: 0.95, opacity: 0 }}` — elements should deflate like a balloon, not vanish into a point",
	"no-permanent-will-change": "Add will-change on animation start (`onMouseEnter`) and remove on end (`onAnimationEnd`). Permanent promotion wastes GPU memory and can degrade performance",
	"no-secrets-in-client-code": "Move to server-side `process.env.SECRET_NAME`. Only `NEXT_PUBLIC_*` vars are safe for the client (and should not contain secrets)",
	"no-barrel-import": "Import from the direct path: `import { Button } from './components/Button'` instead of `./components`",
	"no-dynamic-import-path": "Use a string-literal path: `import('./feature/heavy.js')` so the bundler can split this chunk",
	"no-full-lodash-import": "Import the specific function: `import debounce from 'lodash/debounce'` — saves ~70kb",
	"no-moment": "Replace with `import { format } from 'date-fns'` (tree-shakeable) or `import dayjs from 'dayjs'` (2kb)",
	"prefer-dynamic-import": "Use `const Component = dynamic(() => import('library'), { ssr: false })` from next/dynamic or React.lazy()",
	"use-lazy-motion": "Use `import { LazyMotion, m } from \"framer-motion\"` with `domAnimation` features — saves ~30kb",
	"no-undeferred-third-party": "Use `next/script` with `strategy=\"lazyOnload\"` or add the `defer` attribute",
	"no-inline-bounce-easing": "Use `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo) for natural deceleration — objects in the real world don't bounce",
	"no-z-index-9999": "Define a z-index scale in your design tokens (e.g. dropdown: 10, modal: 20, toast: 30). Create a new stacking context with `isolation: isolate` instead of escalating values",
	"no-inline-exhaustive-style": "Move styles to a CSS class, CSS module, Tailwind utilities, or a styled component — inline objects with many properties hurt readability and create new references every render",
	"no-side-tab-border": "Use a subtler accent (box-shadow inset, background gradient, or border-bottom) instead of a thick one-sided border",
	"no-pure-black-background": "Tint the background slightly toward your brand hue — e.g. `#0a0a0f` or Tailwind's `bg-gray-950`. Pure black looks harsh on modern displays",
	"no-gradient-text": "Use solid text colors for readability. If you need emphasis, use font weight, size, or a distinct color instead of gradients",
	"no-dark-mode-glow": "Use a subtle `box-shadow` with neutral colors for depth, or `border` with low opacity. Colored glows on dark backgrounds are the default AI-generated aesthetic",
	"no-justified-text": "Use `text-align: left` for body text, or add `hyphens: auto` and `overflow-wrap: break-word` if you must justify",
	"no-tiny-text": "Use at least 12px for body content, 16px is ideal. Small text is hard to read, especially on high-DPI mobile screens",
	"no-wide-letter-spacing": "Reserve wide tracking (letter-spacing > 0.05em) for short uppercase labels, navigation items, and buttons — not body text",
	"no-gray-on-colored-background": "Use a darker shade of the background color for text, or white/near-white for contrast. Gray text on colored backgrounds looks washed out",
	"no-layout-transition-inline": "Use `transform` and `opacity` for transitions — they run on the compositor thread. For height animations, use `grid-template-rows: 0fr → 1fr`",
	"no-disabled-zoom": "Remove `user-scalable=no` and `maximum-scale` from the viewport meta tag. If your layout breaks at 200% zoom, fix the layout — don't punish users with disabilities",
	"no-outline-none": "Use `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px }` to show focus only for keyboard users while hiding it for mouse clicks",
	"no-long-transition-duration": "Keep UI transitions under 1s — 100-150ms for instant feedback, 200-300ms for state changes, 300-500ms for layout changes. Use longer durations only for page-load hero animations",
	"design-no-bold-heading": "Use `font-semibold` (600) or `font-medium` (500) on headings — 700+ crushes letter counter shapes at display sizes",
	"design-no-redundant-padding-axes": "Collapse `px-N py-N` to `p-N` when both axes match. Keep them split only when one axis varies at a breakpoint (`py-2 md:py-3`)",
	"design-no-redundant-size-axes": "Collapse `w-N h-N` to `size-N` (Tailwind v3.4+) when both axes match",
	"design-no-space-on-flex-children": "Use `gap-*` on the flex/grid parent. `space-x-*` / `space-y-*` produce phantom gaps when a sibling is conditionally rendered, lose vertical spacing on wrapped lines, and don't mirror in RTL",
	"design-no-em-dash-in-jsx-text": "Replace em dashes in JSX text with commas, colons, semicolons, periods, or parentheses — em dashes read as model-output filler",
	"design-no-three-period-ellipsis": "Use the typographic ellipsis \"…\" (or `&hellip;`) instead of three periods — pairs with action-with-followup labels (\"Rename…\", \"Loading…\")",
	"design-no-default-tailwind-palette": "Replace `indigo-*` / `gray-*` / `slate-*` with project tokens, your brand color, or a less-default neutral (`zinc`, `neutral`, `stone`)",
	"design-no-vague-button-label": "Name the action: \"Save changes\" instead of \"Continue\", \"Send invite\" instead of \"Submit\", \"Delete account\" instead of \"OK\". The label IS the button's accessible name",
	"no-array-index-as-key": "Use a stable unique identifier: `key={item.id}` or `key={item.slug}` — index keys break on reorder/filter",
	"rendering-conditional-render": "Change to `{items.length > 0 && <List />}` or use a ternary: `{items.length ? <List /> : null}`",
	"no-prevent-default": "Use `<form action={serverAction}>` (works without JS) or `<button>` instead of `<a>` with preventDefault",
	"no-uncontrolled-input": "Pass an explicit initial value to `useState` (e.g. `useState(\"\")` instead of `useState()`), add `onChange` (or `readOnly` to opt out) when you supply `value`, and drop `defaultValue` on controlled inputs — React ignores it",
	"nextjs-no-img-element": "`import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset",
	"nextjs-async-client-component": "Fetch data in a parent Server Component and pass it as props, or use useQuery/useSWR in the client component",
	"nextjs-no-a-element": "`import Link from 'next/link'` — enables client-side navigation, prefetching, and preserves scroll position",
	"nextjs-no-use-search-params-without-suspense": "Wrap the component using useSearchParams: `<Suspense fallback={<Skeleton />}><SearchComponent /></Suspense>`",
	"nextjs-no-client-fetch-for-server-data": "Remove 'use client' and fetch directly in the Server Component — no API round-trip, secrets stay on server",
	"nextjs-missing-metadata": "Add `export const metadata = { title: '...', description: '...' }` or `export async function generateMetadata()`",
	"nextjs-no-client-side-redirect": "Avoid redirects inside useEffect. Use an event handler, middleware, or server-side redirect (App Router: redirect() from next/navigation; Pages Router: getServerSideProps redirect)",
	"nextjs-no-redirect-in-try-catch": "Move the redirect/notFound call outside the try block, or add `unstable_rethrow(error)` in the catch",
	"nextjs-image-missing-sizes": "Add sizes for responsive behavior: `sizes=\"(max-width: 768px) 100vw, 50vw\"` matching your layout breakpoints",
	"nextjs-no-native-script": "`import Script from \"next/script\"` — use `strategy=\"afterInteractive\"` for analytics or `\"lazyOnload\"` for widgets",
	"nextjs-inline-script-missing-id": "Add `id=\"descriptive-name\"` so Next.js can track, deduplicate, and re-execute the script correctly",
	"nextjs-no-font-link": "`import { Inter } from \"next/font/google\"` — self-hosted, zero layout shift, no render-blocking requests",
	"nextjs-no-css-link": "Import CSS directly: `import './styles.css'` or use CSS Modules: `import styles from './Button.module.css'`",
	"nextjs-no-polyfill-script": "Next.js includes polyfills for fetch, Promise, Object.assign, Array.from, and 50+ others automatically",
	"nextjs-no-head-import": "Use the Metadata API instead: `export const metadata = { title: '...' }` or `export async function generateMetadata()`",
	"nextjs-no-side-effect-in-get-handler": "Move the side effect to a POST handler and use a <form> or fetch with method POST — GET requests can be triggered by prefetching and are vulnerable to CSRF",
	"server-auth-actions": "Add `const session = await auth()` at the top and throw/redirect if unauthorized before any data access",
	"server-after-nonblocking": "`import { after } from 'next/server'` then wrap: `after(() => analytics.track(...))` — response isn't blocked",
	"server-no-mutable-module-state": "Move per-request data into the action body, headers/cookies, or a request-scope (React.cache, AsyncLocalStorage). Module-scope `let`/`var` is shared across requests.",
	"server-cache-with-object-literal": "Pass primitives to React.cache()-wrapped functions — argument identity (not deep equality) is the dedup key, so a fresh `{}` per render bypasses the cache",
	"server-hoist-static-io": "Hoist the read to module scope: `const FONT_DATA = await fetch(new URL('./fonts/Inter.ttf', import.meta.url)).then(r => r.arrayBuffer())` runs once at module load",
	"server-dedup-props": "Pass the source array once and derive the projection on the client — passing both doubles RSC serialization bytes",
	"client-passive-event-listeners": "Add `{ passive: true }` as the third argument: `addEventListener('scroll', handler, { passive: true })`. Only do this if the handler does NOT call `event.preventDefault()` — passive listeners silently ignore `preventDefault()`, which breaks features like pull-to-refresh suppression, custom gestures, and nested-scroll containment.",
	"query-stable-query-client": "Move `new QueryClient()` to module scope or wrap in `useState(() => new QueryClient())` — recreating it on every render resets the entire cache",
	"query-no-rest-destructuring": "Destructure only the fields you need: `const { data, isLoading } = useQuery(...)` — rest destructuring subscribes to all fields and causes extra re-renders",
	"query-no-void-query-fn": "queryFn must return a value for the cache. Use the `enabled` option to conditionally disable the query instead of returning undefined",
	"query-no-query-in-effect": "React Query manages refetching automatically via queryKey dependencies and the `enabled` option — manual refetch() in useEffect is usually unnecessary",
	"query-mutation-missing-invalidation": "Add `onSuccess: () => queryClient.invalidateQueries({ queryKey: ['...'] })` so cached data stays in sync after the mutation",
	"query-no-usequery-for-mutation": "Use `useMutation()` for POST/PUT/DELETE — it provides onSuccess/onError callbacks, doesn't auto-refetch, and correctly models write operations",
	"js-flatmap-filter": "Use `.flatMap(item => condition ? [value] : [])` — transforms and filters in a single pass instead of creating an intermediate array",
	"js-hoist-intl": "Hoist `new Intl.NumberFormat(...)` to module scope or wrap in `useMemo` — Intl constructors allocate dozens of objects per locale lookup",
	"js-cache-property-access": "Hoist the deep member access into a const at the top of the loop body: `const { x, y } = obj.deeply.nested`",
	"js-length-check-first": "Short-circuit with `a.length === b.length && a.every((x, i) => x === b[i])` — unequal-length arrays exit immediately",
	"js-combine-iterations": "Combine `.map().filter()` (or similar chains) into a single pass with `.reduce()` or a `for...of` loop to avoid iterating the array twice",
	"js-tosorted-immutable": "Use `array.toSorted()` (ES2023) instead of `[...array].sort()` for immutable sorting without the spread allocation",
	"js-hoist-regexp": "Hoist `new RegExp(...)` (or large regex literals) to a module-level constant so it isn't recompiled on every loop iteration",
	"js-min-max-loop": "Use `Math.min(...array)` / `Math.max(...array)` instead of sorting just to read the first or last element",
	"js-set-map-lookups": "Use a `Set` or `Map` for repeated membership tests / keyed lookups — `Array.includes`/`find` is O(n) per call",
	"js-batch-dom-css": "Batch DOM/CSS reads and writes — interleaving them inside a loop causes layout thrashing. Read first, then write",
	"js-index-maps": "Build an index `Map` once outside the loop instead of `array.find(...)` inside it",
	"js-cache-storage": "Cache repeated `localStorage`/`sessionStorage` reads in a local variable — each access serializes/deserializes",
	"js-early-exit": "Add an early `return` / `continue` to flatten deep nesting and short-circuit when the predicate is already known",
	"no-eval": "Use `JSON.parse` for serialized data, `Function(...)` (still careful) for trusted templates, or refactor to avoid dynamic code execution",
	"async-parallel": "Use `const [a, b] = await Promise.all([fetchA(), fetchB()])` to run independent operations concurrently",
	"rn-no-raw-text": "Wrap text in a `<Text>` component: `<Text>{value}</Text>` — raw strings outside `<Text>` crash on React Native",
	"rn-no-deprecated-modules": "Import from the community package instead — deprecated modules were removed from the react-native core",
	"rn-no-legacy-expo-packages": "Migrate to the recommended replacement package — legacy Expo packages are no longer maintained",
	"rn-no-dimensions-get": "Use `const { width, height } = useWindowDimensions()` — it updates reactively on rotation and resize",
	"rn-no-inline-flatlist-renderitem": "Extract renderItem to a named function or wrap in useCallback to avoid re-creating on every render",
	"rn-no-legacy-shadow-styles": "Use `boxShadow` for cross-platform shadows on the new architecture instead of platform-specific shadow properties",
	"rn-prefer-reanimated": "Use `import Animated from 'react-native-reanimated'` — animations run on the UI thread instead of the JS thread",
	"rn-no-single-element-style-array": "Use `style={value}` instead of `style={[value]}` — single-element arrays add unnecessary allocation",
	"rn-prefer-pressable": "Use `<Pressable>` from react-native (or react-native-gesture-handler) instead of legacy Touchable* components",
	"rn-prefer-expo-image": "Use `<Image>` from `expo-image` instead of `react-native` — same prop API, plus disk + memory caching, placeholders, and crossfades",
	"rn-no-non-native-navigator": "Use `@react-navigation/native-stack` (or `native-tabs` in v7+) for platform-native transitions and gestures",
	"rn-no-scroll-state": "Track scroll position with a Reanimated shared value (`useAnimatedScrollHandler`) or a ref — `setState` on every scroll event causes re-render storms",
	"rn-no-scrollview-mapped-list": "Use FlashList, LegendList, or FlatList — `<ScrollView>{items.map(...)}</ScrollView>` mounts every row in memory",
	"rn-no-inline-object-in-list-item": "Hoist style/object props outside renderItem (StyleSheet.create, useMemo at list scope, or pass primitives) so memo() row components stop bailing",
	"rn-animate-layout-property": "Animate `transform: [{ translateX/Y }, { scale }]` and `opacity` instead of layout props — layout runs on the JS thread; transform/opacity run on the GPU compositor",
	"rn-prefer-content-inset-adjustment": "Drop the SafeAreaView wrapper and set `contentInsetAdjustmentBehavior=\"automatic\"` on the ScrollView for native safe-area handling",
	"rn-pressable-shared-value-mutation": "Wrap in <GestureDetector gesture={Gesture.Tap()...}> so the press animation runs on the UI thread instead of bouncing across the JS bridge",
	"rn-list-data-mapped": "Wrap the projection in `useMemo(() => items.map(...), [items])` so the list's `data` prop has a stable reference across parent renders",
	"rn-animation-reaction-as-derived": "Replace useAnimatedReaction with `useDerivedValue(() => ..., [deps])` — shorter, native dependency tracking, no side-effect implication",
	"rn-bottom-sheet-prefer-native": "Use `<Modal presentationStyle=\"formSheet\">` (RN v7+) for native gesture handling and snap points",
	"rn-scrollview-dynamic-padding": "Use `contentInset={{ bottom: dynamicValue }}` — the OS applies it as an offset without reflowing the scroll content",
	"tanstack-start-route-property-order": "Follow the order: params/validateSearch → loaderDeps → context → beforeLoad → loader → head. See https://tanstack.com/router/latest/docs/eslint/create-route-property-order",
	"tanstack-start-no-direct-fetch-in-loader": "Use `createServerFn()` from @tanstack/react-start — provides type-safe RPC, input validation, and proper server/client code splitting",
	"tanstack-start-server-fn-validate-input": "Add `.inputValidator(schema)` before `.handler()` — data crosses a network boundary and must be validated at runtime",
	"tanstack-start-no-useeffect-fetch": "Fetch data in the route `loader` instead — the router coordinates loading before rendering to avoid waterfalls",
	"tanstack-start-missing-head-content": "Add `<HeadContent />` inside `<head>` in your __root route — without it, route `head()` meta tags are silently dropped",
	"tanstack-start-no-anchor-element": "`import { Link } from '@tanstack/react-router'` — enables type-safe routes, preloading via `preload=\"intent\"`, and client-side navigation",
	"tanstack-start-server-fn-method-order": "Chain methods in order: .middleware() → .inputValidator() → .client() → .server() → .handler() — types depend on this sequence",
	"tanstack-start-no-navigate-in-render": "Use `throw redirect({ to: '/path' })` in `beforeLoad` or `loader` instead — navigate() during render causes hydration issues",
	"tanstack-start-no-dynamic-server-fn-import": "Use `import { myFn } from '~/utils/my.functions'` — the bundler replaces server code with RPC stubs only for static imports",
	"tanstack-start-no-use-server-in-handler": "TanStack Start handles server boundaries automatically via the Vite plugin — \"use server\" inside createServerFn causes compilation errors",
	"tanstack-start-no-secrets-in-loader": "Loaders are isomorphic (run on both server and client). Wrap secret access in `createServerFn()` so it stays server-only",
	"tanstack-start-get-mutation": "Use `createServerFn({ method: 'POST' })` for data modifications — GET requests can be triggered by prefetching and are vulnerable to CSRF",
	"tanstack-start-redirect-in-try-catch": "TanStack Router's `redirect()` and `notFound()` throw special errors caught by the router. Move them outside the try block or re-throw in the catch",
	"tanstack-start-loader-parallel-fetch": "Use `const [a, b] = await Promise.all([fetchA(), fetchB()])` to avoid request waterfalls in route loaders"
};
const FILEPATH_WITH_LOCATION_PATTERN = /\S+\.\w+:\d+:\d+[\s\S]*$/;
const REACT_COMPILER_MESSAGE = "React Compiler can't optimize this code";
const lookupOwnString = (record, key) => Object.hasOwn(record, key) ? record[key] : void 0;
const cleanDiagnosticMessage = (message, help, plugin, rule) => {
	if (plugin === "react-hooks-js") return {
		message: REACT_COMPILER_MESSAGE,
		help: message.replace(FILEPATH_WITH_LOCATION_PATTERN, "").trim() || help
	};
	return {
		message: message.replace(FILEPATH_WITH_LOCATION_PATTERN, "").trim() || message,
		help: help || lookupOwnString(RULE_HELP_MAP, rule) || ""
	};
};
const parseRuleCode = (code) => {
	const match = code.match(/^(.+)\((.+)\)$/);
	if (!match) return {
		plugin: "unknown",
		rule: code
	};
	return {
		plugin: match[1].replace(/^eslint-plugin-/, ""),
		rule: match[2]
	};
};
const resolveOxlintBinary = () => {
	const oxlintMainPath = esmRequire.resolve("oxlint");
	const oxlintPackageDirectory = path.resolve(path.dirname(oxlintMainPath), "..");
	return path.join(oxlintPackageDirectory, "bin", "oxlint");
};
const resolvePluginPath = () => {
	const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
	const pluginPath = path.join(currentDirectory, "react-doctor-plugin.js");
	if (fs.existsSync(pluginPath)) return pluginPath;
	const distPluginPath = path.resolve(currentDirectory, "../../dist/react-doctor-plugin.js");
	if (fs.existsSync(distPluginPath)) return distPluginPath;
	return pluginPath;
};
const resolveDiagnosticCategory = (plugin, rule) => {
	return lookupOwnString(RULE_CATEGORY_MAP, `${plugin}/${rule}`) ?? lookupOwnString(PLUGIN_CATEGORY_MAP, plugin) ?? "Other";
};
const SANITIZED_ENV = (() => {
	const sanitized = {};
	for (const [name, value] of Object.entries(process.env)) {
		if (name === "NODE_OPTIONS" || name === "NODE_DEBUG") continue;
		if (name.startsWith("npm_config_")) continue;
		sanitized[name] = value;
	}
	return sanitized;
})();
const OXLINT_SPAWN_TIMEOUT_MS = 5 * 6e4;
const spawnOxlint = (args, rootDirectory, nodeBinaryPath) => new Promise((resolve, reject) => {
	const child = spawn(nodeBinaryPath, args, {
		cwd: rootDirectory,
		env: SANITIZED_ENV
	});
	const timeoutHandle = setTimeout(() => {
		child.kill("SIGKILL");
		reject(/* @__PURE__ */ new Error(`oxlint did not return within ${OXLINT_SPAWN_TIMEOUT_MS / 1e3}s — please report`));
	}, OXLINT_SPAWN_TIMEOUT_MS);
	timeoutHandle.unref?.();
	const stdoutBuffers = [];
	const stderrBuffers = [];
	let stdoutByteCount = 0;
	let stderrByteCount = 0;
	let didKillForSize = false;
	const killIfTooLarge = (incomingBytes, isStdout) => {
		if (isStdout) stdoutByteCount += incomingBytes;
		else stderrByteCount += incomingBytes;
		if (stdoutByteCount + stderrByteCount > 52428800 && !didKillForSize) {
			didKillForSize = true;
			child.kill("SIGKILL");
			return true;
		}
		return false;
	};
	child.stdout.on("data", (buffer) => {
		if (didKillForSize) return;
		stdoutBuffers.push(buffer);
		killIfTooLarge(buffer.length, true);
	});
	child.stderr.on("data", (buffer) => {
		if (didKillForSize) return;
		stderrBuffers.push(buffer);
		killIfTooLarge(buffer.length, false);
	});
	child.on("error", (error) => {
		clearTimeout(timeoutHandle);
		reject(/* @__PURE__ */ new Error(`Failed to run oxlint: ${error.message}`));
	});
	child.on("close", (_code, signal) => {
		clearTimeout(timeoutHandle);
		if (didKillForSize) {
			reject(/* @__PURE__ */ new Error(`oxlint output exceeded ${PROXY_OUTPUT_MAX_BYTES} bytes — scan a smaller subset with --diff or --staged`));
			return;
		}
		if (signal) {
			const stderrOutput = Buffer.concat(stderrBuffers).toString("utf-8").trim();
			const hint = signal === "SIGABRT" ? " (out of memory — try scanning fewer files with --diff)" : "";
			const detail = stderrOutput ? `: ${stderrOutput}` : "";
			reject(/* @__PURE__ */ new Error(`oxlint was killed by ${signal}${hint}${detail}`));
			return;
		}
		const output = Buffer.concat(stdoutBuffers).toString("utf-8").trim();
		if (!output) {
			const stderrOutput = Buffer.concat(stderrBuffers).toString("utf-8").trim();
			if (stderrOutput) {
				reject(/* @__PURE__ */ new Error(`Failed to run oxlint: ${stderrOutput}`));
				return;
			}
		}
		resolve(output);
	});
});
const isOxlintOutput = (value) => {
	if (typeof value !== "object" || value === null) return false;
	const candidate = value;
	return Array.isArray(candidate.diagnostics);
};
const parseOxlintOutput = (stdout) => {
	if (!stdout) return [];
	const jsonStart = stdout.indexOf("{");
	const sanitizedStdout = jsonStart > 0 ? stdout.slice(jsonStart) : stdout;
	let parsed;
	try {
		parsed = JSON.parse(sanitizedStdout);
	} catch {
		throw new Error(`Failed to parse oxlint output: ${stdout.slice(0, 200)}`);
	}
	if (!isOxlintOutput(parsed)) throw new Error(`Unexpected oxlint output shape: ${stdout.slice(0, 200)}`);
	return parsed.diagnostics.filter((diagnostic) => diagnostic.code && SOURCE_FILE_PATTERN.test(diagnostic.filename)).map((diagnostic) => {
		const { plugin, rule } = parseRuleCode(diagnostic.code);
		const primaryLabel = diagnostic.labels[0];
		const cleaned = cleanDiagnosticMessage(diagnostic.message, diagnostic.help, plugin, rule);
		return {
			filePath: diagnostic.filename,
			plugin,
			rule,
			severity: diagnostic.severity,
			message: cleaned.message,
			help: cleaned.help,
			url: diagnostic.url,
			line: primaryLabel?.span.line ?? 0,
			column: primaryLabel?.span.column ?? 0,
			category: resolveDiagnosticCategory(plugin, rule)
		};
	});
};
const TSCONFIG_FILENAMES = ["tsconfig.json", "tsconfig.base.json"];
const resolveTsConfigRelativePath = (rootDirectory) => {
	for (const filename of TSCONFIG_FILENAMES) if (fs.existsSync(path.join(rootDirectory, filename))) return `./${filename}`;
	return null;
};
let didValidateRuleRegistration = false;
const validateRuleRegistration = () => {
	if (didValidateRuleRegistration) return;
	didValidateRuleRegistration = true;
	const missingHelp = [];
	const missingCategory = [];
	for (const fullKey of ALL_REACT_DOCTOR_RULE_KEYS) {
		const ruleName = fullKey.replace(/^react-doctor\//, "");
		if (!Object.hasOwn(RULE_CATEGORY_MAP, fullKey)) missingCategory.push(fullKey);
		if (!Object.hasOwn(RULE_HELP_MAP, ruleName)) missingHelp.push(fullKey);
	}
	if (missingCategory.length > 0 || missingHelp.length > 0) {
		const detail = [missingCategory.length > 0 ? `Missing RULE_CATEGORY_MAP entries: ${missingCategory.join(", ")}` : null, missingHelp.length > 0 ? `Missing RULE_HELP_MAP entries: ${missingHelp.join(", ")}` : null].filter((entry) => entry !== null).join("; ");
		console.warn(`[react-doctor] rule-registration drift: ${detail}`);
	}
};
const runOxlint = async (options) => {
	const { rootDirectory, hasTypeScript, framework, hasReactCompiler, hasTanStackQuery, reactMajorVersion = null, includePaths, nodeBinaryPath = process.execPath, customRulesOnly = false, respectInlineDisables = true, adoptExistingLintConfig = true } = options;
	validateRuleRegistration();
	if (includePaths !== void 0 && includePaths.length === 0) return [];
	const configDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "react-doctor-oxlintrc-"));
	const configPath = path.join(configDirectory, "oxlintrc.json");
	const pluginPath = resolvePluginPath();
	const extendsPaths = (adoptExistingLintConfig && !customRulesOnly ? detectUserLintConfigPaths(rootDirectory) : []).filter(canOxlintExtendConfig);
	const config = createOxlintConfig({
		pluginPath,
		framework,
		hasReactCompiler,
		hasTanStackQuery,
		customRulesOnly,
		reactMajorVersion,
		extendsPaths
	});
	const restoreDisableDirectives = respectInlineDisables ? () => {} : neutralizeDisableDirectives(rootDirectory, includePaths);
	try {
		const baseArgs = [
			resolveOxlintBinary(),
			"-c",
			configPath,
			"--format",
			"json"
		];
		if (hasTypeScript) {
			const tsconfigRelativePath = resolveTsConfigRelativePath(rootDirectory);
			if (tsconfigRelativePath) baseArgs.push("--tsconfig", tsconfigRelativePath);
		}
		const combinedPatterns = collectIgnorePatterns(rootDirectory);
		if (combinedPatterns.length > 0) {
			const combinedIgnorePath = path.join(configDirectory, "combined.ignore");
			fs.writeFileSync(combinedIgnorePath, `${combinedPatterns.join("\n")}\n`);
			baseArgs.push("--ignore-path", combinedIgnorePath);
		}
		const fileBatches = includePaths !== void 0 ? batchIncludePaths(baseArgs, includePaths) : [["."]];
		const writeOxlintConfig = (configToWrite) => {
			fs.rmSync(configPath, { force: true });
			const fileHandle = fs.openSync(configPath, "wx", 384);
			try {
				fs.writeFileSync(fileHandle, JSON.stringify(configToWrite));
			} finally {
				fs.closeSync(fileHandle);
			}
		};
		const spawnLintBatches = async () => {
			const allDiagnostics = [];
			for (const batch of fileBatches) {
				const stdout = await spawnOxlint([...baseArgs, ...batch], rootDirectory, nodeBinaryPath);
				allDiagnostics.push(...parseOxlintOutput(stdout));
			}
			return allDiagnostics;
		};
		writeOxlintConfig(config);
		try {
			return await spawnLintBatches();
		} catch (error) {
			if (extendsPaths.length === 0) throw error;
			writeOxlintConfig(createOxlintConfig({
				pluginPath,
				framework,
				hasReactCompiler,
				hasTanStackQuery,
				customRulesOnly,
				reactMajorVersion,
				extendsPaths: []
			}));
			return await spawnLintBatches();
		}
	} finally {
		restoreDisableDirectives();
		fs.rmSync(configDirectory, {
			recursive: true,
			force: true
		});
	}
};
//#endregion
//#region src/utils/get-diff-files.ts
const runGit = (cwd, args) => {
	const result = spawnSync("git", args, {
		cwd,
		stdio: [
			"ignore",
			"pipe",
			"pipe"
		],
		encoding: "utf-8"
	});
	if (result.error || result.status !== 0) return null;
	return result.stdout.toString().trim();
};
const getCurrentBranch = (directory) => {
	const branch = runGit(directory, [
		"rev-parse",
		"--abbrev-ref",
		"HEAD"
	]);
	if (!branch) return null;
	return branch === "HEAD" ? null : branch;
};
const detectDefaultBranch = (directory) => {
	const reference = runGit(directory, ["symbolic-ref", "refs/remotes/origin/HEAD"]);
	if (reference) return reference.replace("refs/remotes/origin/", "");
	const output = runGit(directory, [
		"for-each-ref",
		"--format=%(refname:short)",
		...DEFAULT_BRANCH_CANDIDATES.map((candidate) => `refs/heads/${candidate}`)
	]);
	if (output) {
		const firstLine = output.split("\n")[0]?.trim();
		if (firstLine) return firstLine;
	}
	return null;
};
const branchExists = (directory, branch) => {
	const result = spawnSync("git", [
		"rev-parse",
		"--verify",
		branch
	], {
		cwd: directory,
		stdio: [
			"ignore",
			"pipe",
			"pipe"
		]
	});
	return !result.error && result.status === 0;
};
const runGitNullSeparated = (cwd, args) => {
	const result = spawnSync("git", args, {
		cwd,
		stdio: [
			"ignore",
			"pipe",
			"pipe"
		],
		encoding: "utf-8"
	});
	if (result.error || result.status !== 0) return null;
	return result.stdout.toString().split("\0").filter((filePath) => filePath.length > 0);
};
const getChangedFilesSinceBranch = (directory, baseBranch) => {
	const mergeBase = runGit(directory, [
		"merge-base",
		baseBranch,
		"HEAD"
	]);
	if (mergeBase === null) return null;
	return runGitNullSeparated(directory, [
		"diff",
		"-z",
		"--name-only",
		"--diff-filter=ACMR",
		"--relative",
		mergeBase
	]);
};
const getUncommittedChangedFiles = (directory) => {
	return runGitNullSeparated(directory, [
		"diff",
		"-z",
		"--name-only",
		"--diff-filter=ACMR",
		"--relative",
		"HEAD"
	]) ?? [];
};
const getDiffInfo = (directory, explicitBaseBranch) => {
	if (explicitBaseBranch !== void 0 && explicitBaseBranch.trim().length === 0) throw new Error("Diff base branch cannot be empty.");
	const currentBranch = getCurrentBranch(directory);
	if (!currentBranch) return null;
	const baseBranch = explicitBaseBranch ?? detectDefaultBranch(directory);
	if (!baseBranch) return null;
	if (explicitBaseBranch && !branchExists(directory, explicitBaseBranch)) throw new Error(`Diff base branch "${explicitBaseBranch}" does not exist (run \`git fetch\` to update remote refs).`);
	if (currentBranch === baseBranch) {
		const uncommittedFiles = getUncommittedChangedFiles(directory);
		if (uncommittedFiles.length === 0) return null;
		return {
			currentBranch,
			baseBranch,
			changedFiles: uncommittedFiles,
			isCurrentChanges: true
		};
	}
	const changedFiles = getChangedFilesSinceBranch(directory, baseBranch);
	if (changedFiles === null) return null;
	return {
		currentBranch,
		baseBranch,
		changedFiles
	};
};
const filterSourceFiles = (filePaths) => filePaths.filter((filePath) => SOURCE_FILE_PATTERN.test(filePath));
//#endregion
//#region src/index.ts
const clearCaches = () => {
	clearProjectCache();
	clearConfigCache();
	clearPackageJsonCache();
	clearIgnorePatternsCache();
};
const toJsonReport = (result, options) => buildJsonReport({
	version: options.version,
	directory: options.directory ?? result.project.rootDirectory,
	mode: options.mode ?? "full",
	diff: null,
	scans: [{
		directory: result.project.rootDirectory,
		result: {
			diagnostics: result.diagnostics,
			score: result.score,
			skippedChecks: [],
			project: result.project,
			elapsedMilliseconds: result.elapsedMilliseconds
		}
	}],
	totalElapsedMilliseconds: result.elapsedMilliseconds
});
const EMPTY_DIAGNOSTICS = [];
const settledOrEmpty = (settled, label) => {
	if (settled.status === "fulfilled") return settled.value;
	console.error(`${label} rejected:`, settled.reason);
	return EMPTY_DIAGNOSTICS;
};
const diagnose = async (directory, options = {}) => {
	const startTime = globalThis.performance.now();
	const resolvedDirectory = path.resolve(directory);
	const userConfig = loadConfig(resolvedDirectory);
	const includePaths = options.includePaths ?? [];
	const isDiffMode = includePaths.length > 0;
	const projectInfo = discoverProject(resolvedDirectory);
	if (!projectInfo.reactVersion) throw new Error(buildNoReactDependencyError(resolvedDirectory));
	const lintIncludePaths = computeJsxIncludePaths(includePaths) ?? resolveLintIncludePaths(resolvedDirectory, userConfig);
	const readFileLinesSync = createNodeReadFileLinesSync(resolvedDirectory);
	const effectiveLint = options.lint ?? userConfig?.lint ?? true;
	const effectiveDeadCode = options.deadCode ?? userConfig?.deadCode ?? true;
	const effectiveRespectInlineDisables = options.respectInlineDisables ?? userConfig?.respectInlineDisables ?? true;
	const lintPromise = effectiveLint ? runOxlint({
		rootDirectory: resolvedDirectory,
		hasTypeScript: projectInfo.hasTypeScript,
		framework: projectInfo.framework,
		hasReactCompiler: projectInfo.hasReactCompiler,
		hasTanStackQuery: projectInfo.hasTanStackQuery,
		reactMajorVersion: parseReactMajor(projectInfo.reactVersion),
		includePaths: lintIncludePaths,
		customRulesOnly: userConfig?.customRulesOnly ?? false,
		respectInlineDisables: effectiveRespectInlineDisables,
		adoptExistingLintConfig: userConfig?.adoptExistingLintConfig ?? true
	}).catch((error) => {
		console.error("Lint failed:", error);
		return EMPTY_DIAGNOSTICS;
	}) : Promise.resolve(EMPTY_DIAGNOSTICS);
	const deadCodePromise = effectiveDeadCode && !isDiffMode ? runKnip(resolvedDirectory).catch((error) => {
		console.error("Dead code analysis failed:", error);
		return EMPTY_DIAGNOSTICS;
	}) : Promise.resolve(EMPTY_DIAGNOSTICS);
	const [lintSettled, deadCodeSettled] = await Promise.allSettled([lintPromise, deadCodePromise]);
	const lintDiagnostics = settledOrEmpty(lintSettled, "Lint");
	const deadCodeDiagnostics = settledOrEmpty(deadCodeSettled, "Dead code");
	const environmentDiagnostics = isDiffMode ? [] : checkReducedMotion(resolvedDirectory);
	const diagnostics = mergeAndFilterDiagnostics([
		...lintDiagnostics,
		...deadCodeDiagnostics,
		...environmentDiagnostics
	], resolvedDirectory, userConfig, readFileLinesSync, { respectInlineDisables: effectiveRespectInlineDisables });
	const elapsedMilliseconds = globalThis.performance.now() - startTime;
	return {
		diagnostics,
		score: await calculateScore(diagnostics),
		project: projectInfo,
		elapsedMilliseconds
	};
};
//#endregion
export { buildJsonReport, buildJsonReportError, clearCaches, diagnose, filterSourceFiles, getDiffInfo, summarizeDiagnostics, toJsonReport };

//# sourceMappingURL=index.js.map