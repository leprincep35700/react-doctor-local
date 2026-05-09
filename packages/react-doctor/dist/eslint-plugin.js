import { createRequire } from "node:module";
//#region src/plugin/constants.ts
const LAYOUT_PROPERTIES = new Set([
	"width",
	"height",
	"top",
	"left",
	"right",
	"bottom",
	"padding",
	"paddingTop",
	"paddingRight",
	"paddingBottom",
	"paddingLeft",
	"margin",
	"marginTop",
	"marginRight",
	"marginBottom",
	"marginLeft",
	"borderWidth",
	"fontSize",
	"lineHeight",
	"gap"
]);
const MOTION_ANIMATE_PROPS = new Set([
	"animate",
	"initial",
	"exit",
	"whileHover",
	"whileTap",
	"whileFocus",
	"whileDrag",
	"whileInView"
]);
const HEAVY_LIBRARIES = new Set([
	"@monaco-editor/react",
	"monaco-editor",
	"recharts",
	"@react-pdf/renderer",
	"react-quill",
	"@codemirror/view",
	"@codemirror/state",
	"chart.js",
	"react-chartjs-2",
	"@toast-ui/editor",
	"draft-js"
]);
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
const INDEX_PARAMETER_NAMES = new Set([
	"index",
	"idx",
	"i"
]);
const BARREL_INDEX_SUFFIXES = [
	"/index",
	"/index.js",
	"/index.ts",
	"/index.tsx",
	"/index.mjs"
];
const PASSIVE_EVENT_NAMES = new Set([
	"scroll",
	"wheel",
	"touchstart",
	"touchmove",
	"touchend"
]);
const LOOP_TYPES = [
	"ForStatement",
	"ForInStatement",
	"ForOfStatement",
	"WhileStatement",
	"DoWhileStatement"
];
const AUTH_FUNCTION_NAMES = new Set([
	"auth",
	"getSession",
	"getServerSession",
	"getUser",
	"requireAuth",
	"checkAuth",
	"verifyAuth",
	"authenticate",
	"currentUser",
	"getAuth",
	"validateSession"
]);
const SECRET_PATTERNS = [
	/^sk_live_/,
	/^sk_test_/,
	/^AKIA[0-9A-Z]{16}$/,
	/^ghp_[a-zA-Z0-9]{36}$/,
	/^gho_[a-zA-Z0-9]{36}$/,
	/^github_pat_/,
	/^glpat-/,
	/^xox[bporas]-/,
	/^sk-[a-zA-Z0-9]{32,}$/
];
const SECRET_VARIABLE_PATTERN = /(?:api_?key|secret|token|password|credential|auth)/i;
const SECRET_FALSE_POSITIVE_SUFFIXES = new Set([
	"modal",
	"label",
	"text",
	"title",
	"name",
	"id",
	"key",
	"url",
	"path",
	"route",
	"page",
	"param",
	"field",
	"column",
	"header",
	"placeholder",
	"description",
	"type",
	"icon",
	"class",
	"style",
	"variant",
	"event",
	"action",
	"status",
	"state",
	"mode",
	"flag",
	"option",
	"config",
	"message",
	"error",
	"display",
	"view",
	"component",
	"element",
	"container",
	"wrapper",
	"button",
	"link",
	"input",
	"select",
	"dialog",
	"menu",
	"form",
	"step",
	"index",
	"count",
	"length",
	"role",
	"scope",
	"context",
	"provider",
	"ref",
	"handler",
	"query",
	"schema",
	"constant"
]);
const LOADING_STATE_PATTERN = /^(?:isLoading|isPending)$/;
const TANSTACK_ROUTE_FILE_PATTERN = /\/routes\//;
const TANSTACK_ROOT_ROUTE_FILE_PATTERN = /__root\.(tsx?|jsx?)$/;
const TANSTACK_ROUTE_PROPERTY_ORDER = [
	"params",
	"validateSearch",
	"loaderDeps",
	"search.middlewares",
	"ssr",
	"context",
	"beforeLoad",
	"loader",
	"onEnter",
	"onStay",
	"onLeave",
	"head",
	"scripts",
	"headers",
	"remountDeps"
];
const TANSTACK_ROUTE_CREATION_FUNCTIONS = new Set([
	"createFileRoute",
	"createRoute",
	"createRootRoute",
	"createRootRouteWithContext"
]);
const TANSTACK_SERVER_FN_NAMES = new Set(["createServerFn"]);
const TANSTACK_MIDDLEWARE_METHOD_ORDER = [
	"middleware",
	"inputValidator",
	"client",
	"server",
	"handler"
];
const TANSTACK_REDIRECT_FUNCTIONS = new Set(["redirect", "notFound"]);
const TANSTACK_SERVER_FN_FILE_PATTERN = /\.functions(\.[jt]sx?)?$/;
const TANSTACK_QUERY_HOOKS = new Set([
	"useQuery",
	"useInfiniteQuery",
	"useSuspenseQuery",
	"useSuspenseInfiniteQuery"
]);
const TANSTACK_MUTATION_HOOKS = new Set(["useMutation"]);
const QUERY_CACHE_UPDATE_METHODS = new Set([
	"invalidateQueries",
	"setQueryData",
	"setQueriesData",
	"resetQueries",
	"refetchQueries",
	"removeQueries",
	"cancelQueries",
	"clear"
]);
const STABLE_HOOK_WRAPPERS = new Set([
	"useState",
	"useMemo",
	"useRef"
]);
const SCRIPT_LOADING_ATTRIBUTES = new Set(["defer", "async"]);
const GENERIC_EVENT_SUFFIXES = new Set([
	"Click",
	"Change",
	"Input",
	"Blur",
	"Focus"
]);
const TRIVIAL_INITIALIZER_NAMES = new Set([
	"Boolean",
	"String",
	"Number",
	"Array",
	"Object",
	"parseInt",
	"parseFloat"
]);
const TRIVIAL_DERIVATION_CALLEE_NAMES = new Set([
	"Boolean",
	"String",
	"Number",
	"Array",
	"Object",
	"parseInt",
	"parseFloat",
	"isNaN",
	"isFinite",
	"BigInt",
	"Symbol"
]);
const BUILTIN_GLOBAL_NAMESPACE_NAMES = new Set([
	"Math",
	"Date",
	"JSON",
	"Object",
	"Array",
	"Number",
	"String",
	"Boolean",
	"RegExp",
	"Symbol",
	"BigInt",
	"Reflect"
]);
const SETTER_PATTERN = /^set[A-Z]/;
const RENDER_FUNCTION_PATTERN = /^render[A-Z]/;
const UPPERCASE_PATTERN = /^[A-Z]/;
const PAGE_FILE_PATTERN = /\/page\.(tsx?|jsx?)$/;
const REACT_HANDLER_PROP_PATTERN = /^on[A-Z]/;
const PAGE_OR_LAYOUT_FILE_PATTERN = /\/(page|layout)\.(tsx?|jsx?)$/;
const INTERNAL_PAGE_PATH_PATTERN = /\/(?:(?:\((?:dashboard|admin|settings|account|internal|manage|console|portal|auth|onboarding|app|ee|protected)\))|(?:dashboard|admin|settings|account|internal|manage|console|portal))\//i;
const TEST_FILE_PATTERN = /\.(?:test|spec|stories)\.[tj]sx?$/;
const OG_ROUTE_PATTERN = /\/og\b/i;
const PAGES_DIRECTORY_PATTERN = /\/pages\//;
const NEXTJS_NAVIGATION_FUNCTIONS = new Set([
	"redirect",
	"permanentRedirect",
	"notFound",
	"forbidden",
	"unauthorized"
]);
const GOOGLE_FONTS_PATTERN = /fonts\.googleapis\.com/;
const POLYFILL_SCRIPT_PATTERN = /polyfill\.io|polyfill\.min\.js|cdn\.polyfill/;
const EXECUTABLE_SCRIPT_TYPES = new Set([
	"text/javascript",
	"application/javascript",
	"module"
]);
const APP_DIRECTORY_PATTERN = /\/app\//;
const ROUTE_HANDLER_FILE_PATTERN = /\/route\.(tsx?|jsx?)$/;
const MUTATION_METHOD_NAMES = new Set([
	"create",
	"insert",
	"insertInto",
	"update",
	"upsert",
	"delete",
	"remove",
	"destroy",
	"set",
	"append"
]);
const MUTATING_ARRAY_METHODS = new Set([
	"push",
	"pop",
	"shift",
	"unshift",
	"splice",
	"sort",
	"reverse",
	"fill",
	"copyWithin"
]);
const MUTATING_HTTP_METHODS = new Set([
	"POST",
	"PUT",
	"DELETE",
	"PATCH"
]);
const MUTATING_ROUTE_SEGMENTS = new Set([
	"logout",
	"log-out",
	"signout",
	"sign-out",
	"unsubscribe",
	"delete",
	"remove",
	"revoke",
	"cancel",
	"deactivate"
]);
const EFFECT_HOOK_NAMES = new Set(["useEffect", "useLayoutEffect"]);
const HOOKS_WITH_DEPS = new Set([
	"useEffect",
	"useLayoutEffect",
	"useMemo",
	"useCallback"
]);
const TIMER_AND_SCHEDULER_DIRECT_CALLEE_NAMES = new Set([
	"setTimeout",
	"setInterval",
	"requestAnimationFrame",
	"requestIdleCallback",
	"queueMicrotask"
]);
const TIMER_CALLEE_NAMES_REQUIRING_CLEANUP = new Set(["setInterval", "setTimeout"]);
const TIMER_CLEANUP_CALLEE_NAMES = new Set(["clearInterval", "clearTimeout"]);
const MUTABLE_GLOBAL_ROOTS = new Set([
	"location",
	"window",
	"document",
	"navigator",
	"history",
	"screen",
	"performance"
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
const UNSUBSCRIPTION_METHOD_NAMES = new Set([
	"unsubscribe",
	"removeEventListener",
	"removeListener",
	"off",
	"unwatch",
	"unlisten",
	"unsub"
]);
const CLEANUP_LIKE_RELEASE_CALLEE_NAMES = new Set([
	...UNSUBSCRIPTION_METHOD_NAMES,
	"cleanup",
	"dispose",
	"destroy",
	"teardown"
]);
const EXTERNAL_SYNC_MEMBER_METHOD_NAMES = new Set([
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
const EXTERNAL_SYNC_HTTP_CLIENT_RECEIVERS = new Set([
	...FETCH_MEMBER_OBJECTS,
	"api",
	"client",
	"http",
	"fetcher"
]);
const EXTERNAL_SYNC_AMBIGUOUS_HTTP_METHOD_NAMES = new Set([
	"get",
	"head",
	"options",
	"delete"
]);
const EXTERNAL_SYNC_DIRECT_CALLEE_NAMES = new Set([...FETCH_CALLEE_NAMES, ...TIMER_AND_SCHEDULER_DIRECT_CALLEE_NAMES]);
const EXTERNAL_SYNC_OBSERVER_CONSTRUCTORS = new Set([
	"IntersectionObserver",
	"MutationObserver",
	"ResizeObserver",
	"PerformanceObserver"
]);
const EVENT_TRIGGERED_SIDE_EFFECT_CALLEES = new Set([
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
const EVENT_TRIGGERED_SIDE_EFFECT_MEMBER_METHODS = new Set([
	"post",
	"put",
	"patch",
	"delete",
	"navigate",
	"capture",
	"track",
	"logEvent"
]);
const EVENT_TRIGGERED_NAVIGATION_METHOD_NAMES = new Set(["push", "replace"]);
const NAVIGATION_RECEIVER_NAMES = new Set([
	"router",
	"navigation",
	"navigator",
	"history",
	"location"
]);
const CHAINABLE_ITERATION_METHODS = new Set([
	"map",
	"filter",
	"forEach",
	"flatMap"
]);
const STORAGE_OBJECTS$1 = new Set(["localStorage", "sessionStorage"]);
const BLUR_VALUE_PATTERN = /blur\((\d+(?:\.\d+)?)px\)/;
const ANIMATION_CALLBACK_NAMES = new Set(["requestAnimationFrame", "setInterval"]);
const REACT_NATIVE_TEXT_COMPONENTS = new Set([
	"Text",
	"TextInput",
	"Typography",
	"Paragraph",
	"Span",
	"H1",
	"H2",
	"H3",
	"H4",
	"H5",
	"H6"
]);
const REACT_NATIVE_TEXT_COMPONENT_KEYWORDS = new Set([
	"Text",
	"Title",
	"Label",
	"Heading",
	"Caption",
	"Subtitle",
	"Typography",
	"Paragraph",
	"Description",
	"Body"
]);
const DEPRECATED_RN_MODULE_REPLACEMENTS = new Map([
	["AsyncStorage", "@react-native-async-storage/async-storage"],
	["Picker", "@react-native-picker/picker"],
	["PickerIOS", "@react-native-picker/picker"],
	["DatePickerIOS", "@react-native-community/datetimepicker"],
	["DatePickerAndroid", "@react-native-community/datetimepicker"],
	["ProgressBarAndroid", "a community alternative"],
	["ProgressViewIOS", "a community alternative"],
	["SafeAreaView", "react-native-safe-area-context"],
	["Slider", "@react-native-community/slider"],
	["ViewPagerAndroid", "react-native-pager-view"],
	["WebView", "react-native-webview"],
	["NetInfo", "@react-native-community/netinfo"],
	["CameraRoll", "@react-native-camera-roll/camera-roll"],
	["Clipboard", "@react-native-clipboard/clipboard"],
	["ImageEditor", "@react-native-community/image-editor"],
	["MaskedViewIOS", "@react-native-masked-view/masked-view"]
]);
const LEGACY_EXPO_PACKAGE_REPLACEMENTS = new Map([
	["expo-av", "expo-audio for audio and expo-video for video"],
	["expo-permissions", "the permissions API in each module (e.g. Camera.requestPermissionsAsync())"],
	["@expo/vector-icons", "expo-symbols or expo-image (see https://docs.expo.dev/versions/latest/sdk/symbols/)"]
]);
const REACT_NATIVE_LIST_COMPONENTS = new Set([
	"FlatList",
	"SectionList",
	"VirtualizedList",
	"FlashList"
]);
const LEGACY_SHADOW_STYLE_PROPERTIES = new Set([
	"shadowColor",
	"shadowOffset",
	"shadowOpacity",
	"shadowRadius",
	"elevation"
]);
const BOUNCE_ANIMATION_NAMES = new Set([
	"bounce",
	"elastic",
	"wobble",
	"jiggle",
	"spring"
]);
const LONG_TRANSITION_DURATION_THRESHOLD_MS = 1e3;
const HEADING_TAG_NAMES = new Set([
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6"
]);
const HEAVY_HEADING_TAILWIND_WEIGHTS = new Set([
	"font-bold",
	"font-extrabold",
	"font-black"
]);
const TAILWIND_DEFAULT_PALETTE_NAMES = [
	"indigo",
	"gray",
	"slate"
];
const TAILWIND_DEFAULT_PALETTE_STOPS = [
	"50",
	"100",
	"200",
	"300",
	"400",
	"500",
	"600",
	"700",
	"800",
	"900",
	"950"
];
const TAILWIND_PALETTE_UTILITY_PREFIXES = [
	"text",
	"bg",
	"border",
	"ring",
	"fill",
	"stroke",
	"from",
	"to",
	"via",
	"decoration",
	"divide",
	"outline",
	"placeholder",
	"caret",
	"accent",
	"shadow"
];
const VAGUE_BUTTON_LABELS = new Set([
	"continue",
	"submit",
	"ok",
	"okay",
	"click here",
	"here",
	"yes",
	"no",
	"go",
	"done"
]);
const ELLIPSIS_EXCLUDED_TAG_NAMES = new Set([
	"code",
	"pre",
	"kbd",
	"samp",
	"var",
	"tt"
]);
const PADDING_HORIZONTAL_AXIS_PATTERN = /(?:^|\s)(-?)px-(\d+(?:\.\d+)?|\[[^\]]+\])(?=$|[\s:])/g;
const PADDING_VERTICAL_AXIS_PATTERN = /(?:^|\s)(-?)py-(\d+(?:\.\d+)?|\[[^\]]+\])(?=$|[\s:])/g;
const SIZE_WIDTH_AXIS_PATTERN = /(?:^|\s)(-?)w-(\d+(?:\.\d+)?|\[[^\]]+\])(?=$|[\s:])/g;
const SIZE_HEIGHT_AXIS_PATTERN = /(?:^|\s)(-?)h-(\d+(?:\.\d+)?|\[[^\]]+\])(?=$|[\s:])/g;
const FLEX_OR_GRID_DISPLAY_TOKENS = new Set([
	"flex",
	"inline-flex",
	"grid",
	"inline-grid"
]);
const SPACE_AXIS_PATTERN = /(?:^|\s)(?:-)?space-(x|y)-(\d+(?:\.\d+)?|\[[^\]]+\])(?=$|[\s:])/;
const TRAILING_THREE_PERIOD_ELLIPSIS_PATTERN = /[A-Za-z]\.\.\./;
//#endregion
//#region src/plugin/helpers.ts
const walkAst = (node, visitor) => {
	if (!node || typeof node !== "object") return;
	if (visitor(node) === false) return;
	for (const key of Object.keys(node)) {
		if (key === "parent") continue;
		const child = node[key];
		if (Array.isArray(child)) {
			for (const item of child) if (item && typeof item === "object" && item.type) walkAst(item, visitor);
		} else if (child && typeof child === "object" && child.type) walkAst(child, visitor);
	}
};
const walkInsideStatementBlocks = (node, visitor) => {
	if (!node || typeof node !== "object") return;
	if (node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression") return;
	visitor(node);
	for (const key of Object.keys(node)) {
		if (key === "parent") continue;
		const child = node[key];
		if (Array.isArray(child)) {
			for (const item of child) if (item && typeof item === "object" && item.type) walkInsideStatementBlocks(item, visitor);
		} else if (child && typeof child === "object" && child.type) walkInsideStatementBlocks(child, visitor);
	}
};
const isSetterIdentifier = (name) => SETTER_PATTERN.test(name);
const isSetterCall = (node) => node.type === "CallExpression" && node.callee?.type === "Identifier" && isSetterIdentifier(node.callee.name);
const isUppercaseName = (name) => UPPERCASE_PATTERN.test(name);
const isMemberProperty = (node, propertyName) => node.type === "MemberExpression" && node.property?.type === "Identifier" && node.property.name === propertyName;
const getRootIdentifierName = (node, options) => {
	if (!node) return null;
	if (node.type === "Identifier") return node.name;
	const followCallChains = options?.followCallChains === true;
	let cursor = node;
	while (cursor) {
		if (cursor.type === "MemberExpression") {
			cursor = cursor.object;
			continue;
		}
		if (followCallChains && cursor.type === "CallExpression") {
			const callee = cursor.callee;
			if (callee?.type !== "MemberExpression") return null;
			cursor = callee.object;
			continue;
		}
		break;
	}
	return cursor?.type === "Identifier" ? cursor.name : null;
};
const areExpressionsStructurallyEqual = (a, b) => {
	if (!a || !b) return a === b;
	if (a.type !== b.type) return false;
	if (a.type === "Identifier") return a.name === b.name;
	if (a.type === "Literal") return a.value === b.value;
	if (a.type === "MemberExpression") {
		if (a.computed !== b.computed) return false;
		return areExpressionsStructurallyEqual(a.object, b.object) && areExpressionsStructurallyEqual(a.property, b.property);
	}
	if (a.type === "CallExpression") {
		if (!areExpressionsStructurallyEqual(a.callee, b.callee)) return false;
		const argumentsA = a.arguments ?? [];
		const argumentsB = b.arguments ?? [];
		if (argumentsA.length !== argumentsB.length) return false;
		return argumentsA.every((argument, index) => areExpressionsStructurallyEqual(argument, argumentsB[index]));
	}
	return false;
};
const getEffectCallback = (node) => {
	if (!node.arguments?.length) return null;
	const callback = node.arguments[0];
	if (callback.type === "ArrowFunctionExpression" || callback.type === "FunctionExpression") return callback;
	return null;
};
const getCallbackStatements = (callback) => {
	if (callback.body?.type === "BlockStatement") return callback.body.body ?? [];
	return callback.body ? [callback.body] : [];
};
const countSetStateCalls = (node) => {
	let setStateCallCount = 0;
	walkAst(node, (child) => {
		if (isSetterCall(child)) setStateCallCount++;
	});
	return setStateCallCount;
};
const isSimpleExpression = (node) => {
	if (!node) return false;
	switch (node.type) {
		case "Identifier":
		case "Literal":
		case "TemplateLiteral": return true;
		case "BinaryExpression": return isSimpleExpression(node.left) && isSimpleExpression(node.right);
		case "UnaryExpression": return isSimpleExpression(node.argument);
		case "MemberExpression": return !node.computed && isSimpleExpression(node.object);
		case "ConditionalExpression": return isSimpleExpression(node.test) && isSimpleExpression(node.consequent) && isSimpleExpression(node.alternate);
		default: return false;
	}
};
const isComponentDeclaration = (node) => node.type === "FunctionDeclaration" && Boolean(node.id?.name) && isUppercaseName(node.id.name);
const isComponentAssignment = (node) => node.type === "VariableDeclarator" && node.id?.type === "Identifier" && isUppercaseName(node.id.name) && Boolean(node.init) && (node.init.type === "ArrowFunctionExpression" || node.init.type === "FunctionExpression");
const getCalleeName = (node) => {
	if (node.callee?.type === "Identifier") return node.callee.name;
	if (node.callee?.type === "MemberExpression" && node.callee.property?.type === "Identifier") return node.callee.property.name;
	return null;
};
const isHookCall = (node, hookName) => {
	if (node.type !== "CallExpression") return false;
	const calleeName = getCalleeName(node);
	if (!calleeName) return false;
	return typeof hookName === "string" ? calleeName === hookName : hookName.has(calleeName);
};
const hasDirective = (programNode, directive) => Boolean(programNode.body?.some((statement) => statement.type === "ExpressionStatement" && statement.expression?.type === "Literal" && statement.expression.value === directive));
const hasUseServerDirective = (node) => {
	if (node.body?.type !== "BlockStatement") return false;
	return Boolean(node.body.body?.some((statement) => statement.type === "ExpressionStatement" && statement.directive === "use server"));
};
const containsFetchCall = (node) => {
	let didFindFetchCall = false;
	walkAst(node, (child) => {
		if (didFindFetchCall || child.type !== "CallExpression") return;
		if (child.callee?.type === "Identifier" && FETCH_CALLEE_NAMES.has(child.callee.name)) didFindFetchCall = true;
		if (child.callee?.type === "MemberExpression" && child.callee.object?.type === "Identifier" && FETCH_MEMBER_OBJECTS.has(child.callee.object.name)) didFindFetchCall = true;
	});
	return didFindFetchCall;
};
const findJsxAttribute = (attributes, attributeName) => attributes?.find((attr) => attr.type === "JSXAttribute" && attr.name?.type === "JSXIdentifier" && attr.name.name === attributeName);
const hasJsxAttribute = (attributes, attributeName) => Boolean(findJsxAttribute(attributes, attributeName));
const createLoopAwareVisitors = (innerVisitors) => {
	let loopDepth = 0;
	const incrementLoopDepth = () => {
		loopDepth++;
	};
	const decrementLoopDepth = () => {
		loopDepth--;
	};
	const visitors = {};
	for (const loopType of LOOP_TYPES) {
		visitors[loopType] = incrementLoopDepth;
		visitors[`${loopType}:exit`] = decrementLoopDepth;
	}
	for (const [nodeType, handler] of Object.entries(innerVisitors)) visitors[nodeType] = (node) => {
		if (loopDepth > 0) handler(node);
	};
	return visitors;
};
const isCookiesOrHeadersCall = (node, methodName) => {
	if (node.type !== "CallExpression" || node.callee?.type !== "MemberExpression") return false;
	const { object, property } = node.callee;
	if (property?.type !== "Identifier" || !MUTATION_METHOD_NAMES.has(property.name)) return false;
	if (object?.type !== "CallExpression" || object.callee?.type !== "Identifier") return false;
	return object.callee.name === methodName;
};
const isMutatingDbCall = (node) => {
	if (node.type !== "CallExpression" || node.callee?.type !== "MemberExpression") return false;
	const { property } = node.callee;
	return property?.type === "Identifier" && MUTATION_METHOD_NAMES.has(property.name);
};
const isMutatingMethodProperty = (property) => property.type === "Property" && property.key?.type === "Identifier" && property.key.name === "method" && property.value?.type === "Literal" && typeof property.value.value === "string" && MUTATING_HTTP_METHODS.has(property.value.value.toUpperCase());
const isMutatingFetchCall = (node) => {
	if (node.type !== "CallExpression") return false;
	if (node.callee?.type !== "Identifier" || node.callee.name !== "fetch") return false;
	const optionsArgument = node.arguments?.[1];
	if (!optionsArgument || optionsArgument.type !== "ObjectExpression") return false;
	return Boolean(optionsArgument.properties?.some(isMutatingMethodProperty));
};
const findSideEffect = (node) => {
	let sideEffectDescription = null;
	walkAst(node, (child) => {
		if (sideEffectDescription) return;
		if (isCookiesOrHeadersCall(child, "cookies")) sideEffectDescription = `cookies().${child.callee.property.name}()`;
		else if (isCookiesOrHeadersCall(child, "headers")) sideEffectDescription = `headers().${child.callee.property.name}()`;
		else if (isMutatingFetchCall(child)) sideEffectDescription = `fetch() with method ${child.arguments[1].properties.find(isMutatingMethodProperty).value.value}`;
		else if (isMutatingDbCall(child)) {
			const methodName = child.callee.property.name;
			const objectName = child.callee.object?.type === "Identifier" ? child.callee.object.name : null;
			sideEffectDescription = objectName ? `${objectName}.${methodName}()` : `.${methodName}()`;
		}
	});
	return sideEffectDescription;
};
const collectPatternNames = (pattern, into) => {
	if (!pattern) return;
	if (pattern.type === "Identifier") {
		into.add(pattern.name);
		return;
	}
	if (pattern.type === "AssignmentPattern") {
		collectPatternNames(pattern.left, into);
		return;
	}
	if (pattern.type === "RestElement") {
		collectPatternNames(pattern.argument, into);
		return;
	}
	if (pattern.type === "ArrayPattern") {
		for (const element of pattern.elements ?? []) collectPatternNames(element, into);
		return;
	}
	if (pattern.type === "ObjectPattern") for (const property of pattern.properties ?? []) {
		if (property.type === "RestElement") {
			collectPatternNames(property.argument, into);
			continue;
		}
		if (property.type === "Property") collectPatternNames(property.value, into);
	}
};
const extractDestructuredPropNames = (params) => {
	const propNames = /* @__PURE__ */ new Set();
	for (const param of params) collectPatternNames(param, propNames);
	return propNames;
};
const isFunctionLikeVariableDeclarator = (node) => {
	if (node.type !== "VariableDeclarator") return false;
	return node.init?.type === "ArrowFunctionExpression" || node.init?.type === "FunctionExpression";
};
const createComponentPropStackTracker = (callbacks) => {
	const propParamStack = [];
	const isPropName = (name) => {
		for (let frameIndex = propParamStack.length - 1; frameIndex >= 0; frameIndex--) {
			const frame = propParamStack[frameIndex];
			if (frame.size === 0) return false;
			if (frame.has(name)) return true;
		}
		return false;
	};
	const getCurrentPropNames = () => {
		for (let frameIndex = propParamStack.length - 1; frameIndex >= 0; frameIndex--) {
			const frame = propParamStack[frameIndex];
			if (frame.size === 0) return /* @__PURE__ */ new Set();
			return frame;
		}
		return /* @__PURE__ */ new Set();
	};
	return {
		isPropName,
		getCurrentPropNames,
		visitors: {
			FunctionDeclaration(node) {
				if (!node.id?.name || !isUppercaseName(node.id.name)) {
					propParamStack.push(/* @__PURE__ */ new Set());
					return;
				}
				propParamStack.push(extractDestructuredPropNames(node.params ?? []));
				callbacks?.onComponentEnter?.(node.body);
			},
			"FunctionDeclaration:exit"() {
				propParamStack.pop();
			},
			VariableDeclarator(node) {
				if (isComponentAssignment(node)) {
					propParamStack.push(extractDestructuredPropNames(node.init?.params ?? []));
					callbacks?.onComponentEnter?.(node.init?.body);
					return;
				}
				if (isFunctionLikeVariableDeclarator(node)) propParamStack.push(/* @__PURE__ */ new Set());
			},
			"VariableDeclarator:exit"(node) {
				if (isComponentAssignment(node) || isFunctionLikeVariableDeclarator(node)) propParamStack.pop();
			}
		}
	};
};
const createComponentBindingStackTracker = (callbacks) => {
	const componentBindingStack = [];
	const isInsideComponent = () => componentBindingStack.length > 0;
	const isBoundName = (name) => {
		for (let frameIndex = componentBindingStack.length - 1; frameIndex >= 0; frameIndex--) if (componentBindingStack[frameIndex].has(name)) return true;
		return false;
	};
	const addBindingToCurrentFrame = (name) => {
		if (componentBindingStack.length === 0) return;
		componentBindingStack[componentBindingStack.length - 1].add(name);
	};
	return {
		isInsideComponent,
		isBoundName,
		addBindingToCurrentFrame,
		visitors: {
			FunctionDeclaration(node) {
				if (!node.id?.name || !isUppercaseName(node.id.name)) return;
				componentBindingStack.push(/* @__PURE__ */ new Set());
			},
			"FunctionDeclaration:exit"(node) {
				if (!node.id?.name || !isUppercaseName(node.id.name)) return;
				componentBindingStack.pop();
			},
			VariableDeclarator(node) {
				if (isComponentAssignment(node)) {
					componentBindingStack.push(/* @__PURE__ */ new Set());
					return;
				}
				callbacks?.onVariableDeclarator?.(node);
			},
			"VariableDeclarator:exit"(node) {
				if (isComponentAssignment(node)) componentBindingStack.pop();
			}
		}
	};
};
//#endregion
//#region src/plugin/rules/architecture.ts
const noGenericHandlerNames = { create: (context) => ({ JSXAttribute(node) {
	if (node.name?.type !== "JSXIdentifier" || !node.name.name.startsWith("on")) return;
	if (!node.value || node.value.type !== "JSXExpressionContainer") return;
	const eventSuffix = node.name.name.slice(2);
	if (!GENERIC_EVENT_SUFFIXES.has(eventSuffix)) return;
	const mirroredHandlerName = `handle${eventSuffix}`;
	const expression = node.value.expression;
	if (expression?.type === "Identifier" && expression.name === mirroredHandlerName) context.report({
		node,
		message: `Non-descriptive handler name "${expression.name}" — name should describe what it does, not when it runs`
	});
} }) };
const noGiantComponent = { create: (context) => {
	const reportOversizedComponent = (nameNode, componentName, bodyNode) => {
		if (!bodyNode.loc) return;
		const lineCount = bodyNode.loc.end.line - bodyNode.loc.start.line + 1;
		if (lineCount > 300) context.report({
			node: nameNode,
			message: `Component "${componentName}" is ${lineCount} lines — consider breaking it into smaller focused components`
		});
	};
	return {
		FunctionDeclaration(node) {
			if (!node.id?.name || !isUppercaseName(node.id.name)) return;
			reportOversizedComponent(node.id, node.id.name, node);
		},
		VariableDeclarator(node) {
			if (!isComponentAssignment(node)) return;
			reportOversizedComponent(node.id, node.id.name, node.init);
		}
	};
} };
const noRenderInRender = { create: (context) => ({ JSXExpressionContainer(node) {
	const expression = node.expression;
	if (expression?.type !== "CallExpression") return;
	let calleeName = null;
	if (expression.callee?.type === "Identifier") calleeName = expression.callee.name;
	else if (expression.callee?.type === "MemberExpression" && expression.callee.property?.type === "Identifier") calleeName = expression.callee.property.name;
	if (calleeName && RENDER_FUNCTION_PATTERN.test(calleeName)) context.report({
		node: expression,
		message: `Inline render function "${calleeName}()" — extract to a separate component for proper reconciliation`
	});
} }) };
const noNestedComponentDefinition = { create: (context) => {
	const componentStack = [];
	return {
		FunctionDeclaration(node) {
			if (!isComponentDeclaration(node)) return;
			if (componentStack.length > 0) context.report({
				node: node.id,
				message: `Component "${node.id.name}" defined inside "${componentStack[componentStack.length - 1]}" — creates new instance every render, destroying state`
			});
			componentStack.push(node.id.name);
		},
		"FunctionDeclaration:exit"(node) {
			if (isComponentDeclaration(node)) componentStack.pop();
		},
		VariableDeclarator(node) {
			if (!isComponentAssignment(node)) return;
			if (componentStack.length > 0) context.report({
				node: node.id,
				message: `Component "${node.id.name}" defined inside "${componentStack[componentStack.length - 1]}" — creates new instance every render, destroying state`
			});
			componentStack.push(node.id.name);
		},
		"VariableDeclarator:exit"(node) {
			if (isComponentAssignment(node)) componentStack.pop();
		}
	};
} };
const BOOLEAN_PROP_PREFIX_PATTERN = /^(?:is|has|should|can|show|hide|enable|disable|with)[A-Z]/;
const collectBooleanLikePropsFromBody = (componentBody, propsParamName) => {
	const found = /* @__PURE__ */ new Set();
	if (!componentBody) return found;
	walkAst(componentBody, (child) => {
		if (child.type !== "MemberExpression") return;
		if (child.computed) return;
		if (child.object?.type !== "Identifier") return;
		if (child.object.name !== propsParamName) return;
		if (child.property?.type !== "Identifier") return;
		if (!BOOLEAN_PROP_PREFIX_PATTERN.test(child.property.name)) return;
		found.add(child.property.name);
	});
	return found;
};
const noManyBooleanProps = { create: (context) => {
	const reportIfMany = (booleanLikePropNames, componentName, reportNode) => {
		if (booleanLikePropNames.length >= 4) context.report({
			node: reportNode,
			message: `Component "${componentName}" takes ${booleanLikePropNames.length} boolean-like props (${booleanLikePropNames.slice(0, 3).join(", ")}…) — consider compound components or explicit variants instead of stacking flags`
		});
	};
	const checkComponent = (param, body, componentName, reportNode) => {
		if (!param) return;
		if (param.type === "ObjectPattern") {
			const booleanLikePropNames = [];
			for (const property of param.properties ?? []) {
				if (property.type !== "Property") continue;
				const keyName = property.key?.type === "Identifier" ? property.key.name : null;
				if (!keyName) continue;
				if (BOOLEAN_PROP_PREFIX_PATTERN.test(keyName)) booleanLikePropNames.push(keyName);
			}
			reportIfMany(booleanLikePropNames, componentName, reportNode);
			return;
		}
		if (param.type === "Identifier") reportIfMany([...collectBooleanLikePropsFromBody(body, param.name)], componentName, reportNode);
	};
	return {
		FunctionDeclaration(node) {
			if (!isComponentDeclaration(node)) return;
			checkComponent(node.params?.[0], node.body, node.id.name, node.id);
		},
		VariableDeclarator(node) {
			if (!isComponentAssignment(node)) return;
			checkComponent(node.init?.params?.[0], node.init?.body, node.id.name, node.id);
		}
	};
} };
const REACT_19_DEPRECATED_MESSAGES = new Map([["forwardRef", "forwardRef is no longer needed on React 19+ — refs are regular props on function components; remove forwardRef and pass ref directly"], ["useContext", "useContext is superseded by `use()` on React 19+ — `use()` reads context conditionally inside hooks, branches, and loops; switch to `import { use } from 'react'`"]]);
const createDeprecatedReactImportRule = ({ source, messages, handleExtraSource }) => ({ create: (context) => {
	const namespaceBindings = /* @__PURE__ */ new Set();
	return {
		ImportDeclaration(node) {
			const sourceValue = node.source?.value;
			if (typeof sourceValue !== "string") return;
			if (handleExtraSource?.(node, context)) return;
			if (sourceValue !== source) return;
			for (const specifier of node.specifiers ?? []) {
				if (specifier.type === "ImportSpecifier") {
					const importedName = specifier.imported?.name;
					if (!importedName) continue;
					const message = messages.get(importedName);
					if (message) context.report({
						node: specifier,
						message
					});
					continue;
				}
				if (specifier.type === "ImportDefaultSpecifier" || specifier.type === "ImportNamespaceSpecifier") {
					const localName = specifier.local?.name;
					if (localName) namespaceBindings.add(localName);
				}
			}
		},
		MemberExpression(node) {
			if (namespaceBindings.size === 0) return;
			if (node.computed) return;
			if (node.object?.type !== "Identifier") return;
			if (!namespaceBindings.has(node.object.name)) return;
			if (node.property?.type !== "Identifier") return;
			const message = messages.get(node.property.name);
			if (message) context.report({
				node,
				message
			});
		}
	};
} });
const noReact19DeprecatedApis = createDeprecatedReactImportRule({
	source: "react",
	messages: REACT_19_DEPRECATED_MESSAGES
});
const RENDER_PROP_PATTERN = /^render[A-Z]/;
const noRenderPropChildren = { create: (context) => ({ JSXOpeningElement(node) {
	const renderPropAttrs = [];
	for (const attr of node.attributes ?? []) {
		if (attr.type !== "JSXAttribute") continue;
		if (attr.name?.type !== "JSXIdentifier") continue;
		const name = attr.name.name;
		if (!RENDER_PROP_PATTERN.test(name)) continue;
		renderPropAttrs.push({
			name,
			node: attr
		});
	}
	if (renderPropAttrs.length < 3) return;
	const propList = renderPropAttrs.slice(0, 3).map((entry) => entry.name).join(", ");
	context.report({
		node: renderPropAttrs[0].node,
		message: `${renderPropAttrs.length} render-prop slots on the same element (${propList}…) — collapse into compound subcomponents or \`children\` so consumers don't need to know about every customization point`
	});
} }) };
const HOOK_OBJECTS_WITH_METHODS = new Map([
	["useRouter", new Set([
		"push",
		"replace",
		"back",
		"forward",
		"refresh",
		"prefetch"
	])],
	["useNavigation", new Set([
		"navigate",
		"push",
		"goBack",
		"popToTop",
		"reset",
		"replace",
		"dispatch"
	])],
	["useSearchParams", new Set([
		"get",
		"getAll",
		"has",
		"set"
	])]
]);
const buildHookBindingMap = (componentBody) => {
	const result = /* @__PURE__ */ new Map();
	if (componentBody?.type !== "BlockStatement") return result;
	for (const statement of componentBody.body ?? []) {
		if (statement.type !== "VariableDeclaration") continue;
		for (const declarator of statement.declarations ?? []) {
			if (declarator.id?.type !== "Identifier") continue;
			if (declarator.init?.type !== "CallExpression") continue;
			const callee = declarator.init.callee;
			if (callee?.type !== "Identifier") continue;
			result.set(declarator.id.name, callee.name);
		}
	}
	return result;
};
const reactCompilerDestructureMethod = { create: (context) => {
	const hookBindingMapStack = [];
	const isComponent = (node) => {
		if (node.type === "FunctionDeclaration") return Boolean(node.id?.name && isUppercaseName(node.id.name));
		if (node.type === "VariableDeclarator") return isComponentAssignment(node);
		return false;
	};
	const enter = (node) => {
		if (!isComponent(node)) return;
		const body = node.type === "FunctionDeclaration" ? node.body : node.init?.body;
		hookBindingMapStack.push(buildHookBindingMap(body));
	};
	const exit = (node) => {
		if (isComponent(node)) hookBindingMapStack.pop();
	};
	return {
		FunctionDeclaration: enter,
		"FunctionDeclaration:exit": exit,
		VariableDeclarator: enter,
		"VariableDeclarator:exit": exit,
		MemberExpression(node) {
			if (hookBindingMapStack.length === 0) return;
			if (node.computed) return;
			if (node.object?.type !== "Identifier") return;
			if (node.property?.type !== "Identifier") return;
			const bindingName = node.object.name;
			const methodName = node.property.name;
			const hookSource = hookBindingMapStack[hookBindingMapStack.length - 1].get(bindingName);
			if (!hookSource) return;
			const allowedMethods = HOOK_OBJECTS_WITH_METHODS.get(hookSource);
			if (!allowedMethods || !allowedMethods.has(methodName)) return;
			if (node.parent?.type !== "CallExpression" || node.parent.callee !== node) return;
			context.report({
				node,
				message: `Destructure for clarity: \`const { ${methodName} } = ${hookSource}()\` then call \`${methodName}(...)\` directly — easier for React Compiler to memoize and clearer about which methods this component depends on`
			});
		}
	};
} };
const LEGACY_LIFECYCLE_REPLACEMENTS = new Map([
	["componentWillMount", "Move side effects to `componentDidMount`; move initial state to `constructor`"],
	["componentWillReceiveProps", "Move side effects to `componentDidUpdate` (compare prevProps); move pure state derivation to the static `getDerivedStateFromProps`"],
	["componentWillUpdate", "Move DOM reads to `getSnapshotBeforeUpdate` (passes the value to `componentDidUpdate`); move other work to `componentDidUpdate`"]
]);
const stripUnsafePrefix = (name) => {
	if (name.startsWith("UNSAFE_")) return {
		baseName: name.slice(7),
		hasUnsafePrefix: true
	};
	return {
		baseName: name,
		hasUnsafePrefix: false
	};
};
const buildLegacyLifecycleMessage = (originalName) => {
	const { baseName, hasUnsafePrefix } = stripUnsafePrefix(originalName);
	const replacement = LEGACY_LIFECYCLE_REPLACEMENTS.get(baseName);
	if (!replacement) return null;
	return `${hasUnsafePrefix ? `\`${originalName}\` is removed in React 19 (the UNSAFE_ prefix only silences the React 18 warning, it doesn't fix the concurrent-mode hazard).` : `\`${originalName}\` is removed in React 19 and warns in React 18.3.1.`} ${replacement}.`;
};
const noLegacyClassLifecycles = { create: (context) => {
	const checkMember = (memberNode) => {
		if (!memberNode) return;
		if (memberNode.type !== "MethodDefinition" && memberNode.type !== "PropertyDefinition") return;
		if (memberNode.key?.type !== "Identifier") return;
		const message = buildLegacyLifecycleMessage(memberNode.key.name);
		if (message) context.report({
			node: memberNode.key,
			message
		});
	};
	return { ClassBody(node) {
		for (const member of node.body ?? []) checkMember(member);
	} };
} };
const LEGACY_CONTEXT_NAMES = new Set([
	"childContextTypes",
	"contextTypes",
	"getChildContext"
]);
const buildLegacyContextMessage = (memberName) => {
	if (memberName === "childContextTypes" || memberName === "getChildContext") return `${memberName} is part of the legacy context API (REMOVED in React 19). Replace the provider with \`createContext\` + \`<MyContext.Provider value={...}>\` and consume via \`useContext()\` (or \`use()\` on React 19+) — every consumer must migrate together`;
	return "contextTypes is part of the legacy context API (REMOVED in React 19). Replace with `static contextType = MyContext` (single context) or read the modern context with `useContext()` / `use()` from a function component — coordinate with the provider's migration";
};
const isInsideClassBody = (node) => {
	let current = node.parent;
	while (current) {
		if (current.type === "ClassBody") return true;
		if (current.type === "FunctionDeclaration" || current.type === "FunctionExpression" || current.type === "ArrowFunctionExpression") return false;
		current = current.parent;
	}
	return false;
};
const noLegacyContextApi = { create: (context) => {
	const checkMember = (memberNode) => {
		if (!memberNode) return;
		if (memberNode.type !== "MethodDefinition" && memberNode.type !== "PropertyDefinition") return;
		if (memberNode.key?.type !== "Identifier") return;
		if (!LEGACY_CONTEXT_NAMES.has(memberNode.key.name)) return;
		context.report({
			node: memberNode.key,
			message: buildLegacyContextMessage(memberNode.key.name)
		});
	};
	return {
		ClassBody(node) {
			for (const member of node.body ?? []) checkMember(member);
		},
		AssignmentExpression(node) {
			if (node.operator !== "=") return;
			const left = node.left;
			if (left?.type !== "MemberExpression") return;
			if (left.computed) return;
			if (left.property?.type !== "Identifier") return;
			if (!LEGACY_CONTEXT_NAMES.has(left.property.name)) return;
			if (left.object?.type !== "Identifier") return;
			if (!isUppercaseName(left.object.name)) return;
			if (isInsideClassBody(node)) return;
			context.report({
				node: left,
				message: buildLegacyContextMessage(left.property.name)
			});
		}
	};
} };
const noDefaultProps = { create: (context) => ({ AssignmentExpression(node) {
	if (node.operator !== "=") return;
	const left = node.left;
	if (left?.type !== "MemberExpression") return;
	if (left.computed) return;
	if (left.property?.type !== "Identifier" || left.property.name !== "defaultProps") return;
	if (left.object?.type !== "Identifier") return;
	if (!isUppercaseName(left.object.name)) return;
	context.report({
		node: left,
		message: `${left.object.name}.defaultProps — React 19 removes \`defaultProps\` for function components and discourages it for class components. Move defaults into the destructured props parameter (e.g. \`function ${left.object.name}({ size = "md", ...rest })\`) so the rule applies cleanly to both shapes`
	});
} }) };
const REACT_DOM_DEPRECATED_MESSAGES = new Map([
	["render", "ReactDOM.render is the legacy root API — switch to `import { createRoot } from 'react-dom/client'` and call `createRoot(container).render(...)` (REMOVED in React 19)"],
	["hydrate", "ReactDOM.hydrate is the legacy SSR API — switch to `import { hydrateRoot } from 'react-dom/client'` and call `hydrateRoot(container, <App />)` (REMOVED in React 19)"],
	["unmountComponentAtNode", "ReactDOM.unmountComponentAtNode no longer works on roots created with `createRoot` — keep a reference to the root and call `root.unmount()` instead (REMOVED in React 19)"],
	["findDOMNode", "ReactDOM.findDOMNode crawls the rendered tree and breaks composition — accept a ref directly and read `ref.current` (REMOVED in React 19)"]
]);
const REACT_DOM_TEST_UTILS_REPLACEMENTS = new Map([
	["act", "`import { act } from 'react'` instead"],
	["Simulate", "`fireEvent` from `@testing-library/react` instead"],
	["renderIntoDocument", "`render` from `@testing-library/react` instead"],
	["findRenderedDOMComponentWithTag", "`getByRole` / `getByTestId` from `@testing-library/react`"],
	["findRenderedDOMComponentWithClass", "`getByRole` or `container.querySelector` from RTL"],
	["scryRenderedDOMComponentsWithTag", "`getAllByRole` from `@testing-library/react`"]
]);
const buildTestUtilsMessage = (importedName) => {
	const replacement = REACT_DOM_TEST_UTILS_REPLACEMENTS.get(importedName);
	return `react-dom/test-utils is removed in React 19. ${replacement ? `Use ${replacement}.` : "Switch to `act` from `react` or the equivalent in `@testing-library/react`."}`;
};
const reportTestUtilsImports = (node, context) => {
	for (const specifier of node.specifiers ?? []) {
		if (specifier.type === "ImportSpecifier") {
			const importedName = specifier.imported?.name ?? "default";
			context.report({
				node: specifier,
				message: buildTestUtilsMessage(importedName)
			});
			continue;
		}
		context.report({
			node: specifier,
			message: "react-dom/test-utils is removed in React 19. Use `act` from `react` and `fireEvent` / `render` from `@testing-library/react` instead"
		});
	}
};
const noReactDomDeprecatedApis = createDeprecatedReactImportRule({
	source: "react-dom",
	messages: REACT_DOM_DEPRECATED_MESSAGES,
	handleExtraSource: (node, context) => {
		if (node.source?.value !== "react-dom/test-utils") return false;
		reportTestUtilsImports(node, context);
		return true;
	}
});
//#endregion
//#region src/plugin/rules/bundle-size.ts
const noBarrelImport = { create: (context) => {
	let didReportForFile = false;
	return { ImportDeclaration(node) {
		if (didReportForFile) return;
		const source = node.source?.value;
		if (typeof source !== "string" || !source.startsWith(".")) return;
		if (BARREL_INDEX_SUFFIXES.some((suffix) => source.endsWith(suffix))) {
			didReportForFile = true;
			context.report({
				node,
				message: "Import from barrel/index file — import directly from the source module for better tree-shaking"
			});
		}
	} };
} };
const noFullLodashImport = { create: (context) => ({ ImportDeclaration(node) {
	const source = node.source?.value;
	if (source === "lodash" || source === "lodash-es") context.report({
		node,
		message: "Importing entire lodash library — import from 'lodash/functionName' instead"
	});
} }) };
const noMoment = { create: (context) => ({ ImportDeclaration(node) {
	if (node.source?.value === "moment") context.report({
		node,
		message: "moment.js is 300kb+ — use \"date-fns\" or \"dayjs\" instead"
	});
} }) };
const preferDynamicImport = { create: (context) => ({ ImportDeclaration(node) {
	const source = node.source?.value;
	if (typeof source === "string" && HEAVY_LIBRARIES.has(source)) context.report({
		node,
		message: `"${source}" is a heavy library — use React.lazy() or next/dynamic for code splitting`
	});
} }) };
const useLazyMotion = { create: (context) => ({ ImportDeclaration(node) {
	const source = node.source?.value;
	if (source !== "framer-motion" && source !== "motion/react") return;
	if (node.specifiers?.some((specifier) => specifier.type === "ImportSpecifier" && specifier.imported?.name === "motion")) context.report({
		node,
		message: "Import \"m\" with LazyMotion instead of \"motion\" — saves ~30kb in bundle size"
	});
} }) };
const noDynamicImportPath = { create: (context) => ({
	ImportExpression(node) {
		const source = node.source;
		if (source && source.type !== "Literal" && source.type !== "TemplateLiteral") {
			context.report({
				node,
				message: "Dynamic import path is not statically analyzable — use a string literal so the bundler can split this chunk"
			});
			return;
		}
		if (source?.type === "TemplateLiteral" && (source.expressions?.length ?? 0) > 0) context.report({
			node,
			message: "Template literal with interpolation in dynamic import — use a string literal so the bundler can split this chunk"
		});
	},
	CallExpression(node) {
		if (node.callee?.type !== "Identifier" || node.callee.name !== "require") return;
		const arg = node.arguments?.[0];
		if (!arg) return;
		if (arg.type !== "Literal" && arg.type !== "TemplateLiteral") {
			context.report({
				node,
				message: "Dynamic require() path is not statically analyzable — use a string literal so the bundler can trace this dependency"
			});
			return;
		}
		if (arg.type === "TemplateLiteral" && (arg.expressions?.length ?? 0) > 0) context.report({
			node,
			message: "Template literal with interpolation in require() — use a string literal so the bundler can trace this dependency"
		});
	}
}) };
const noUndeferredThirdParty = { create: (context) => ({ JSXOpeningElement(node) {
	if (node.name?.type !== "JSXIdentifier" || node.name.name !== "script") return;
	const attributes = node.attributes ?? [];
	if (!findJsxAttribute(attributes, "src")) return;
	if (!hasJsxAttribute(attributes, "defer") && !hasJsxAttribute(attributes, "async")) context.report({
		node,
		message: "Synchronous <script> with src — add defer or async to avoid blocking first paint"
	});
} }) };
//#endregion
//#region src/plugin/rules/client.ts
const clientPassiveEventListeners = { create: (context) => ({ CallExpression(node) {
	if (!isMemberProperty(node.callee, "addEventListener")) return;
	if ((node.arguments?.length ?? 0) < 2) return;
	const eventNameNode = node.arguments[0];
	if (eventNameNode.type !== "Literal" || !PASSIVE_EVENT_NAMES.has(eventNameNode.value)) return;
	const eventName = eventNameNode.value;
	const optionsArgument = node.arguments[2];
	if (!optionsArgument) {
		context.report({
			node,
			message: `"${eventName}" listener without { passive: true } — blocks scrolling performance. Only add { passive: true } if the handler does NOT call event.preventDefault() (passive listeners silently ignore preventDefault())`
		});
		return;
	}
	if (optionsArgument.type !== "ObjectExpression") return;
	if (!optionsArgument.properties?.some((property) => property.type === "Property" && property.key?.type === "Identifier" && property.key.name === "passive" && property.value?.type === "Literal" && property.value.value === true)) context.report({
		node,
		message: `"${eventName}" listener without { passive: true } — blocks scrolling performance. Only add { passive: true } if the handler does NOT call event.preventDefault() (passive listeners silently ignore preventDefault())`
	});
} }) };
const VERSIONED_KEY_PATTERN = /(?:[._:-]v\d+|@\d+|\bv\d+\b)/i;
const STORAGE_OBJECTS = new Set(["localStorage", "sessionStorage"]);
const isJsonStringifyCall = (node) => {
	if (node.type !== "CallExpression") return false;
	if (node.callee?.type !== "MemberExpression") return false;
	if (node.callee.object?.type !== "Identifier") return false;
	if (node.callee.object.name !== "JSON") return false;
	if (node.callee.property?.type !== "Identifier") return false;
	return node.callee.property.name === "stringify";
};
const clientLocalstorageNoVersion = { create: (context) => ({ CallExpression(node) {
	if (node.callee?.type !== "MemberExpression") return;
	if (node.callee.object?.type !== "Identifier") return;
	if (!STORAGE_OBJECTS.has(node.callee.object.name)) return;
	if (node.callee.property?.type !== "Identifier") return;
	if (node.callee.property.name !== "setItem") return;
	const keyArg = node.arguments?.[0];
	if (!keyArg) return;
	if (keyArg.type !== "Literal") return;
	if (typeof keyArg.value !== "string") return;
	if (VERSIONED_KEY_PATTERN.test(keyArg.value)) return;
	const valueArg = node.arguments?.[1];
	if (!valueArg) return;
	if (!isJsonStringifyCall(valueArg)) return;
	context.report({
		node: keyArg,
		message: `${node.callee.object.name}.setItem("${keyArg.value}", JSON.stringify(...)) — bake a version into the key (e.g. "${keyArg.value}:v1") so a future schema change can ignore old data instead of crashing on it`
	});
} }) };
//#endregion
//#region src/plugin/rules/design.ts
const isOvershootCubicBezier = (value) => {
	const match = value.match(/cubic-bezier\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/);
	if (!match) return false;
	const controlY1 = parseFloat(match[2]);
	const controlY2 = parseFloat(match[4]);
	return controlY1 < -.1 || controlY1 > 1.1 || controlY2 < -.1 || controlY2 > 1.1;
};
const hasBounceAnimationName = (value) => {
	const lowerValue = value.toLowerCase();
	for (const name of BOUNCE_ANIMATION_NAMES) if (lowerValue.includes(name)) return true;
	return false;
};
const getStringFromClassNameAttr = (node) => {
	const classAttr = findJsxAttribute(node.attributes ?? [], "className");
	if (!classAttr?.value) return null;
	if (classAttr.value.type === "Literal" && typeof classAttr.value.value === "string") return classAttr.value.value;
	if (classAttr.value.type === "JSXExpressionContainer" && classAttr.value.expression?.type === "Literal" && typeof classAttr.value.expression.value === "string") return classAttr.value.expression.value;
	if (classAttr.value.type === "JSXExpressionContainer" && classAttr.value.expression?.type === "TemplateLiteral" && classAttr.value.expression.quasis?.length === 1) return classAttr.value.expression.quasis[0].value?.raw ?? null;
	return null;
};
const getInlineStyleExpression = (node) => {
	if (node.name?.type !== "JSXIdentifier" || node.name.name !== "style") return null;
	if (node.value?.type !== "JSXExpressionContainer") return null;
	const expression = node.value.expression;
	if (expression?.type !== "ObjectExpression") return null;
	return expression;
};
const getStylePropertyStringValue = (property) => {
	if (property.value?.type === "Literal" && typeof property.value.value === "string") return property.value.value;
	return null;
};
const getStylePropertyNumberValue = (property) => {
	if (property.value?.type === "Literal" && typeof property.value.value === "number") return property.value.value;
	if (property.value?.type === "UnaryExpression" && property.value.operator === "-" && property.value.argument?.type === "Literal" && typeof property.value.argument.value === "number") return -property.value.argument.value;
	return null;
};
const getStylePropertyKey = (property) => {
	if (property.type !== "Property") return null;
	if (property.key?.type === "Identifier") return property.key.name;
	if (property.key?.type === "Literal" && typeof property.key.value === "string") return property.key.value;
	return null;
};
const parseColorToRgb = (value) => {
	const trimmed = value.trim().toLowerCase();
	const hex8Match = trimmed.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})[0-9a-f]{2}$/);
	if (hex8Match) return {
		red: parseInt(hex8Match[1], 16),
		green: parseInt(hex8Match[2], 16),
		blue: parseInt(hex8Match[3], 16)
	};
	const hex6Match = trimmed.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/);
	if (hex6Match) return {
		red: parseInt(hex6Match[1], 16),
		green: parseInt(hex6Match[2], 16),
		blue: parseInt(hex6Match[3], 16)
	};
	const hex4Match = trimmed.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])[0-9a-f]$/);
	if (hex4Match) return {
		red: parseInt(hex4Match[1] + hex4Match[1], 16),
		green: parseInt(hex4Match[2] + hex4Match[2], 16),
		blue: parseInt(hex4Match[3] + hex4Match[3], 16)
	};
	const hex3Match = trimmed.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/);
	if (hex3Match) return {
		red: parseInt(hex3Match[1] + hex3Match[1], 16),
		green: parseInt(hex3Match[2] + hex3Match[2], 16),
		blue: parseInt(hex3Match[3] + hex3Match[3], 16)
	};
	const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
	if (rgbMatch) return {
		red: parseInt(rgbMatch[1], 10),
		green: parseInt(rgbMatch[2], 10),
		blue: parseInt(rgbMatch[3], 10)
	};
	return null;
};
const hasColorChroma = (parsed) => Math.max(parsed.red, parsed.green, parsed.blue) - Math.min(parsed.red, parsed.green, parsed.blue) >= 30;
const isNeutralBorderColor = (value) => {
	const trimmed = value.trim().toLowerCase();
	if ([
		"gray",
		"grey",
		"silver",
		"white",
		"black",
		"transparent",
		"currentcolor"
	].includes(trimmed)) return true;
	const parsed = parseColorToRgb(trimmed);
	if (parsed) return !hasColorChroma(parsed);
	return false;
};
const extractBorderColorFromShorthand = (shorthandValue) => {
	const afterSolid = shorthandValue.match(/solid\s+(.+)$/i);
	if (!afterSolid) return null;
	return afterSolid[1].trim();
};
const isPureBlackColor = (value) => {
	const trimmed = value.trim().toLowerCase();
	if (trimmed === "#000" || trimmed === "#000000") return true;
	if (/^rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)$/.test(trimmed)) return true;
	return false;
};
const splitShadowLayers = (shadowValue) => shadowValue.split(/,(?![^(]*\))/);
const extractColorFromShadowLayer = (layer) => {
	const rgbMatch = layer.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
	if (rgbMatch) return {
		red: parseInt(rgbMatch[1], 10),
		green: parseInt(rgbMatch[2], 10),
		blue: parseInt(rgbMatch[3], 10)
	};
	const hexMatch = layer.match(/#([0-9a-f]{3,6})\b/i);
	if (hexMatch) return parseColorToRgb(`#${hexMatch[1]}`);
	return null;
};
const parseShadowLayerBlur = (layer) => {
	const numericTokens = [...layer.replace(/rgba?\([^)]*\)/g, "").replace(/#[0-9a-f]{3,8}\b/gi, "").matchAll(/(\d+(?:\.\d+)?)(px)?/g)].map((match) => parseFloat(match[1]));
	return numericTokens.length >= 3 ? numericTokens[2] : 0;
};
const hasColoredGlowShadow = (shadowValue) => {
	for (const layer of splitShadowLayers(shadowValue)) {
		const color = extractColorFromShadowLayer(layer);
		if (color && hasColorChroma(color) && parseShadowLayerBlur(layer) > 4) return true;
	}
	return false;
};
const isBackgroundDark = (bgValue) => {
	const trimmed = bgValue.trim().toLowerCase();
	if (isPureBlackColor(trimmed)) return true;
	const parsed = parseColorToRgb(trimmed);
	if (!parsed) return false;
	return parsed.red <= 35 && parsed.green <= 35 && parsed.blue <= 35;
};
const BORDER_SIDE_KEYS = new Map([
	["borderLeft", "left"],
	["borderRight", "right"],
	["borderInlineStart", "left"],
	["borderInlineEnd", "right"]
]);
const BORDER_SIDE_WIDTH_KEYS = new Set([
	"borderLeftWidth",
	"borderRightWidth",
	"borderInlineStartWidth",
	"borderInlineEndWidth"
]);
const noInlineBounceEasing = { create: (context) => ({
	JSXAttribute(node) {
		const expression = getInlineStyleExpression(node);
		if (!expression) return;
		for (const property of expression.properties ?? []) {
			const key = getStylePropertyKey(property);
			if (!key) continue;
			const value = getStylePropertyStringValue(property);
			if (!value) continue;
			if ((key === "transition" || key === "transitionTimingFunction" || key === "animation" || key === "animationTimingFunction") && isOvershootCubicBezier(value)) context.report({
				node: property,
				message: "Bounce/elastic easing feels dated — real objects decelerate smoothly. Use ease-out or cubic-bezier(0.16, 1, 0.3, 1) instead"
			});
			if ((key === "animation" || key === "animationName") && hasBounceAnimationName(value)) context.report({
				node: property,
				message: "Bounce/elastic animation name detected — these feel tacky. Use exponential easing (ease-out-quart/expo) for natural deceleration"
			});
		}
	},
	JSXOpeningElement(node) {
		const classStr = getStringFromClassNameAttr(node);
		if (!classStr) return;
		if (/\banimate-bounce\b/.test(classStr)) context.report({
			node,
			message: "animate-bounce feels dated and tacky — use a subtle ease-out transform for natural deceleration"
		});
	}
}) };
const noZIndex9999 = { create: (context) => ({
	JSXAttribute(node) {
		const expression = getInlineStyleExpression(node);
		if (!expression) return;
		for (const property of expression.properties ?? []) {
			if (getStylePropertyKey(property) !== "zIndex") continue;
			const zValue = getStylePropertyNumberValue(property);
			if (zValue !== null && Math.abs(zValue) >= 100) context.report({
				node: property,
				message: `z-index: ${zValue} is arbitrarily high — use a deliberate z-index scale (1–50). Extreme values signal a stacking context problem, not a fix`
			});
		}
	},
	CallExpression(node) {
		if (node.callee?.type !== "MemberExpression") return;
		if (node.callee.property?.type !== "Identifier" || node.callee.property.name !== "create") return;
		if (node.callee.object?.type !== "Identifier" || node.callee.object.name !== "StyleSheet") return;
		const argument = node.arguments?.[0];
		if (!argument || argument.type !== "ObjectExpression") return;
		walkAst(argument, (child) => {
			if (child.type !== "Property") return;
			if (getStylePropertyKey(child) !== "zIndex") return;
			if (child.value?.type === "Literal" && typeof child.value.value === "number") {
				const zValue = child.value.value;
				if (Math.abs(zValue) >= 100) context.report({
					node: child,
					message: `z-index: ${zValue} is arbitrarily high — use a deliberate z-index scale (1–50). Extreme values signal a stacking context problem, not a fix`
				});
			}
		});
	}
}) };
const noInlineExhaustiveStyle = { create: (context) => ({ JSXAttribute(node) {
	const expression = getInlineStyleExpression(node);
	if (!expression) return;
	const propertyCount = expression.properties?.filter((property) => property.type === "Property").length ?? 0;
	if (propertyCount >= 8) context.report({
		node: expression,
		message: `${propertyCount} inline style properties — extract to a CSS class, CSS module, or styled component for maintainability and reuse`
	});
} }) };
const noSideTabBorder = { create: (context) => ({
	JSXAttribute(node) {
		const expression = getInlineStyleExpression(node);
		if (!expression) return;
		let hasBorderRadius = false;
		for (const property of expression.properties ?? []) if (getStylePropertyKey(property) === "borderRadius") {
			const numValue = getStylePropertyNumberValue(property);
			const strValue = getStylePropertyStringValue(property);
			if (numValue !== null && numValue > 0 || strValue !== null && parseFloat(strValue) > 0) hasBorderRadius = true;
		}
		const threshold = hasBorderRadius ? 1 : 3;
		for (const property of expression.properties ?? []) {
			const key = getStylePropertyKey(property);
			if (!key) continue;
			const sideLabel = BORDER_SIDE_KEYS.get(key);
			if (sideLabel !== void 0) {
				const value = getStylePropertyStringValue(property);
				if (!value) continue;
				const widthMatch = value.match(/^(\d+)px\s+solid/);
				if (!widthMatch) continue;
				const borderColor = extractBorderColorFromShorthand(value);
				if (borderColor && isNeutralBorderColor(borderColor)) continue;
				const width = parseInt(widthMatch[1], 10);
				if (width >= threshold) context.report({
					node: property,
					message: `Thick one-sided border (${sideLabel}: ${width}px) — the most recognizable tell of AI-generated UIs. Use a subtler accent or remove it`
				});
			}
			if (BORDER_SIDE_WIDTH_KEYS.has(key)) {
				const numValue = getStylePropertyNumberValue(property);
				const strValue = getStylePropertyStringValue(property);
				const width = numValue ?? (strValue !== null ? parseFloat(strValue) : NaN);
				if (isNaN(width)) continue;
				const colorKey = key.replace("Width", "Color");
				if (!expression.properties?.some((colorProperty) => {
					if (getStylePropertyKey(colorProperty) !== colorKey) return false;
					const colorValue = getStylePropertyStringValue(colorProperty);
					return colorValue !== null && !isNeutralBorderColor(colorValue);
				})) continue;
				if (width >= threshold) context.report({
					node: property,
					message: `Thick one-sided border (${width}px) — the most recognizable tell of AI-generated UIs. Use a subtler accent or remove it`
				});
			}
		}
	},
	JSXOpeningElement(node) {
		const classStr = getStringFromClassNameAttr(node);
		if (!classStr) return;
		const sideMatch = classStr.match(/\bborder-[lrse]-(\d+)\b/);
		if (!sideMatch) return;
		if (/\bborder-(?:(?:gray|slate|zinc|neutral|stone)-\d+|white|black|transparent)\b/.test(classStr)) return;
		if (parseInt(sideMatch[1], 10) >= (/\brounded(?:-(?!none\b)\w+)?\b/.test(classStr) && !/\brounded-none\b/.test(classStr) ? 1 : 4)) context.report({
			node,
			message: `Thick one-sided border (${sideMatch[0]}) — the most recognizable tell of AI-generated UIs. Use a subtler accent or remove it`
		});
	}
}) };
const noPureBlackBackground = { create: (context) => ({
	JSXAttribute(node) {
		const expression = getInlineStyleExpression(node);
		if (!expression) return;
		for (const property of expression.properties ?? []) {
			const key = getStylePropertyKey(property);
			if (key !== "backgroundColor" && key !== "background") continue;
			const value = getStylePropertyStringValue(property);
			if (value && isPureBlackColor(value)) context.report({
				node: property,
				message: "Pure #000 background looks harsh — tint slightly toward your brand hue for a more refined feel (e.g. #0a0a0f)"
			});
		}
	},
	JSXOpeningElement(node) {
		const classStr = getStringFromClassNameAttr(node);
		if (!classStr) return;
		if (/\bbg-black\b(?!\/)/.test(classStr)) context.report({
			node,
			message: "Pure black background (bg-black) looks harsh — use a near-black tinted toward your brand hue (e.g. bg-gray-950)"
		});
	}
}) };
const noGradientText = { create: (context) => ({
	JSXAttribute(node) {
		const expression = getInlineStyleExpression(node);
		if (!expression) return;
		let hasBackgroundClipText = false;
		let hasGradientBackground = false;
		for (const property of expression.properties ?? []) {
			const key = getStylePropertyKey(property);
			const value = getStylePropertyStringValue(property);
			if (!key || !value) continue;
			if ((key === "backgroundClip" || key === "WebkitBackgroundClip") && value === "text") hasBackgroundClipText = true;
			if ((key === "backgroundImage" || key === "background") && value.includes("gradient")) hasGradientBackground = true;
		}
		if (hasBackgroundClipText && hasGradientBackground) context.report({
			node,
			message: "Gradient text (background-clip: text) is decorative rather than meaningful — a common AI tell. Use solid colors for text"
		});
	},
	JSXOpeningElement(node) {
		const classStr = getStringFromClassNameAttr(node);
		if (!classStr) return;
		if (/\bbg-clip-text\b/.test(classStr) && /\bbg-gradient-to-/.test(classStr)) context.report({
			node,
			message: "Gradient text (bg-clip-text + bg-gradient) is decorative rather than meaningful — a common AI tell. Use solid colors for text"
		});
	}
}) };
const noDarkModeGlow = { create: (context) => ({ JSXAttribute(node) {
	const expression = getInlineStyleExpression(node);
	if (!expression) return;
	let hasDarkBackground = false;
	let shadowProperty = null;
	let shadowValue = null;
	for (const property of expression.properties ?? []) {
		const key = getStylePropertyKey(property);
		if (!key) continue;
		if (key === "backgroundColor" || key === "background") {
			const value = getStylePropertyStringValue(property);
			if (value && isBackgroundDark(value)) hasDarkBackground = true;
		}
		if (key === "boxShadow") {
			shadowProperty = property;
			shadowValue = getStylePropertyStringValue(property);
		}
	}
	if (!hasDarkBackground || !shadowValue || !shadowProperty) return;
	if (hasColoredGlowShadow(shadowValue)) context.report({
		node: shadowProperty,
		message: "Colored glow on dark background — the default AI-generated 'cool' look. Use subtle, purposeful lighting instead"
	});
} }) };
const noJustifiedText = { create: (context) => ({ JSXAttribute(node) {
	const expression = getInlineStyleExpression(node);
	if (!expression) return;
	let isJustified = false;
	let hasHyphens = false;
	for (const property of expression.properties ?? []) {
		const key = getStylePropertyKey(property);
		const value = getStylePropertyStringValue(property);
		if (!key || !value) continue;
		if (key === "textAlign" && value === "justify") isJustified = true;
		if ((key === "hyphens" || key === "WebkitHyphens") && value === "auto") hasHyphens = true;
	}
	if (isJustified && !hasHyphens) context.report({
		node,
		message: "Justified text without hyphens creates uneven word spacing (\"rivers of white\"). Use text-align: left, or add hyphens: auto"
	});
} }) };
const noTinyText = { create: (context) => ({ JSXAttribute(node) {
	const expression = getInlineStyleExpression(node);
	if (!expression) return;
	for (const property of expression.properties ?? []) {
		if (getStylePropertyKey(property) !== "fontSize") continue;
		let pxValue = null;
		const numValue = getStylePropertyNumberValue(property);
		const strValue = getStylePropertyStringValue(property);
		if (numValue !== null) pxValue = numValue;
		else if (strValue !== null) {
			const pxMatch = strValue.match(/^([\d.]+)px$/);
			if (pxMatch) pxValue = parseFloat(pxMatch[1]);
			const remMatch = strValue.match(/^([\d.]+)rem$/);
			if (remMatch) pxValue = parseFloat(remMatch[1]) * 16;
		}
		if (pxValue !== null && pxValue > 0 && pxValue < 12) context.report({
			node: property,
			message: `Font size ${pxValue}px is too small — body text should be at least 12px for readability, 16px is ideal`
		});
	}
} }) };
const noWideLetterSpacing = { create: (context) => ({ JSXAttribute(node) {
	const expression = getInlineStyleExpression(node);
	if (!expression) return;
	let isUppercase = false;
	let letterSpacingProperty = null;
	let letterSpacingEm = null;
	for (const property of expression.properties ?? []) {
		const key = getStylePropertyKey(property);
		if (!key) continue;
		if (key === "textTransform") {
			if (getStylePropertyStringValue(property) === "uppercase") isUppercase = true;
		}
		if (key === "letterSpacing") {
			letterSpacingProperty = property;
			const strValue = getStylePropertyStringValue(property);
			const numValue = getStylePropertyNumberValue(property);
			if (strValue) {
				const emMatch = strValue.match(/^([\d.]+)em$/);
				if (emMatch) letterSpacingEm = parseFloat(emMatch[1]);
				const pxMatch = strValue.match(/^([\d.]+)px$/);
				if (pxMatch) letterSpacingEm = parseFloat(pxMatch[1]) / 16;
			}
			if (numValue !== null && numValue > 0) letterSpacingEm = numValue / 16;
		}
	}
	if (!isUppercase && letterSpacingProperty && letterSpacingEm !== null && letterSpacingEm > .05) context.report({
		node: letterSpacingProperty,
		message: `Letter spacing ${letterSpacingEm.toFixed(2)}em on body text disrupts natural character groupings. Reserve wide tracking for short uppercase labels only`
	});
} }) };
const noGrayOnColoredBackground = { create: (context) => ({ JSXOpeningElement(node) {
	const classStr = getStringFromClassNameAttr(node);
	if (!classStr) return;
	const grayTextMatch = classStr.match(/\btext-(?:gray|slate|zinc|neutral|stone)-\d+\b/);
	const coloredBgMatch = classStr.match(/\bbg-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/);
	if (grayTextMatch && coloredBgMatch) context.report({
		node,
		message: `Gray text (${grayTextMatch[0]}) on colored background (${coloredBgMatch[0]}) looks washed out — use a darker shade of the background color or white`
	});
} }) };
const noLayoutTransitionInline = { create: (context) => ({ JSXAttribute(node) {
	const expression = getInlineStyleExpression(node);
	if (!expression) return;
	for (const property of expression.properties ?? []) {
		const key = getStylePropertyKey(property);
		if (key !== "transition" && key !== "transitionProperty") continue;
		const value = getStylePropertyStringValue(property);
		if (!value) continue;
		const lower = value.toLowerCase();
		if (/\ball\b/.test(lower)) continue;
		const layoutMatch = lower.match(/\b(?:(?:max|min)-)?(?:width|height)\b|\bpadding(?:-(?:top|right|bottom|left))?\b|\bmargin(?:-(?:top|right|bottom|left))?\b/);
		if (layoutMatch) context.report({
			node: property,
			message: `Transitioning layout property "${layoutMatch[0]}" causes layout thrash every frame — use transform and opacity instead`
		});
	}
} }) };
const noDisabledZoom = { create: (context) => ({ JSXOpeningElement(node) {
	if (node.name?.type !== "JSXIdentifier" || node.name.name !== "meta") return;
	const nameAttr = findJsxAttribute(node.attributes ?? [], "name");
	if (!nameAttr?.value) return;
	if ((nameAttr.value.type === "Literal" ? nameAttr.value.value : null) !== "viewport") return;
	const contentAttr = findJsxAttribute(node.attributes ?? [], "content");
	if (!contentAttr?.value) return;
	const contentValue = contentAttr.value.type === "Literal" && typeof contentAttr.value.value === "string" ? contentAttr.value.value : null;
	if (!contentValue) return;
	const hasUserScalableNo = /user-scalable\s*=\s*no/i.test(contentValue);
	const maxScaleMatch = contentValue.match(/maximum-scale\s*=\s*([\d.]+)/i);
	const hasRestrictiveMaxScale = maxScaleMatch !== null && parseFloat(maxScaleMatch[1]) < 2;
	if (hasUserScalableNo && hasRestrictiveMaxScale) context.report({
		node,
		message: `user-scalable=no and maximum-scale=${maxScaleMatch[1]} disable pinch-to-zoom — this is an accessibility violation (WCAG 1.4.4). Remove both and fix layout if it breaks at 200% zoom`
	});
	else if (hasUserScalableNo) context.report({
		node,
		message: "user-scalable=no disables pinch-to-zoom — this is an accessibility violation (WCAG 1.4.4). Remove it and fix layout if it breaks at 200% zoom"
	});
	else if (hasRestrictiveMaxScale) context.report({
		node,
		message: `maximum-scale=${maxScaleMatch[1]} restricts zoom below 200% — this is an accessibility violation (WCAG 1.4.4). Use maximum-scale=5 or remove it`
	});
} }) };
const noOutlineNone = { create: (context) => ({ JSXAttribute(node) {
	const expression = getInlineStyleExpression(node);
	if (!expression) return;
	let hasOutlineNone = false;
	let outlineProperty = null;
	for (const property of expression.properties ?? []) {
		if (getStylePropertyKey(property) !== "outline") continue;
		const strValue = getStylePropertyStringValue(property);
		const numValue = getStylePropertyNumberValue(property);
		if (strValue === "none" || strValue === "0" || numValue === 0) {
			hasOutlineNone = true;
			outlineProperty = property;
		}
	}
	if (!hasOutlineNone || !outlineProperty) return;
	if (!expression.properties?.some((property) => {
		return getStylePropertyKey(property) === "boxShadow";
	})) context.report({
		node: outlineProperty,
		message: "outline: none removes keyboard focus visibility — use :focus-visible styling instead, or provide a box-shadow focus ring"
	});
} }) };
const noLongTransitionDuration = { create: (context) => ({ JSXAttribute(node) {
	const expression = getInlineStyleExpression(node);
	if (!expression) return;
	for (const property of expression.properties ?? []) {
		const key = getStylePropertyKey(property);
		if (!key) continue;
		const value = getStylePropertyStringValue(property);
		if (!value) continue;
		let durationMs = null;
		if (key === "transitionDuration" || key === "animationDuration") {
			let longestDurationPropertyMs = 0;
			for (const segment of value.split(",")) {
				const trimmedSegment = segment.trim();
				const msMatch = trimmedSegment.match(/^([\d.]+)ms$/);
				const secondsMatch = trimmedSegment.match(/^([\d.]+)s$/);
				if (msMatch) longestDurationPropertyMs = Math.max(longestDurationPropertyMs, parseFloat(msMatch[1]));
				else if (secondsMatch) longestDurationPropertyMs = Math.max(longestDurationPropertyMs, parseFloat(secondsMatch[1]) * 1e3);
			}
			if (longestDurationPropertyMs > 0) durationMs = longestDurationPropertyMs;
		}
		if (key === "transition" || key === "animation") {
			let longestDurationMs = 0;
			const segments = value.split(",");
			for (const segment of segments) {
				const firstTimeMatch = segment.match(/(?<![a-zA-Z\d])([\d.]+)(m?s)(?![a-zA-Z\d-])/);
				if (!firstTimeMatch) continue;
				const segmentDurationMs = firstTimeMatch[2] === "ms" ? parseFloat(firstTimeMatch[1]) : parseFloat(firstTimeMatch[1]) * 1e3;
				longestDurationMs = Math.max(longestDurationMs, segmentDurationMs);
			}
			if (longestDurationMs > 0) durationMs = longestDurationMs;
		}
		if (durationMs !== null && durationMs > 1e3) context.report({
			node: property,
			message: `${durationMs}ms transition is too slow for UI feedback — keep transitions under ${LONG_TRANSITION_DURATION_THRESHOLD_MS}ms. Use longer durations only for page-load hero animations`
		});
	}
} }) };
//#endregion
//#region src/plugin/rules/correctness.ts
const STRING_COERCION_FUNCTIONS = new Set(["String", "Number"]);
const extractIndexName = (node) => {
	if (node.type === "Identifier" && INDEX_PARAMETER_NAMES.has(node.name)) return node.name;
	if (node.type === "TemplateLiteral") {
		const indexExpression = node.expressions?.find((expression) => expression.type === "Identifier" && INDEX_PARAMETER_NAMES.has(expression.name));
		if (indexExpression) return indexExpression.name;
	}
	if (node.type === "CallExpression" && node.callee?.type === "MemberExpression" && node.callee.object?.type === "Identifier" && INDEX_PARAMETER_NAMES.has(node.callee.object.name) && node.callee.property?.type === "Identifier" && node.callee.property.name === "toString") return node.callee.object.name;
	if (node.type === "CallExpression" && node.callee?.type === "Identifier" && STRING_COERCION_FUNCTIONS.has(node.callee.name) && node.arguments?.[0]?.type === "Identifier" && INDEX_PARAMETER_NAMES.has(node.arguments[0].name)) return node.arguments[0].name;
	if (node.type === "BinaryExpression" && node.operator === "+" && (node.left?.type === "Identifier" && INDEX_PARAMETER_NAMES.has(node.left.name) && node.right?.type === "Literal" && node.right.value === "" || node.right?.type === "Identifier" && INDEX_PARAMETER_NAMES.has(node.right.name) && node.left?.type === "Literal" && node.left.value === "")) return node.left?.type === "Identifier" ? node.left.name : node.right.name;
	return null;
};
const isInsideStaticPlaceholderMap = (node) => {
	let current = node;
	while (current.parent) {
		current = current.parent;
		if (current.type === "CallExpression" && current.callee?.type === "MemberExpression" && current.callee.property?.name === "map") {
			const receiver = current.callee.object;
			if (receiver?.type === "CallExpression") {
				const callee = receiver.callee;
				if (callee?.type === "MemberExpression" && callee.object?.type === "Identifier" && callee.object.name === "Array" && callee.property?.name === "from") return true;
			}
			if (receiver?.type === "NewExpression" && receiver.callee?.type === "Identifier" && receiver.callee.name === "Array") return true;
		}
	}
	return false;
};
const noArrayIndexAsKey = { create: (context) => ({ JSXAttribute(node) {
	if (node.name?.type !== "JSXIdentifier" || node.name.name !== "key") return;
	if (!node.value || node.value.type !== "JSXExpressionContainer") return;
	const indexName = extractIndexName(node.value.expression);
	if (!indexName) return;
	if (isInsideStaticPlaceholderMap(node)) return;
	context.report({
		node,
		message: `Array index "${indexName}" used as key — causes bugs when list is reordered or filtered`
	});
} }) };
const PREVENT_DEFAULT_ELEMENTS = new Map([["form", ["onSubmit"]], ["a", ["onClick"]]]);
const containsPreventDefaultCall = (node) => {
	let didFindPreventDefault = false;
	walkAst(node, (child) => {
		if (didFindPreventDefault) return;
		if (child.type === "CallExpression" && child.callee?.type === "MemberExpression" && child.callee.property?.type === "Identifier" && child.callee.property.name === "preventDefault") didFindPreventDefault = true;
	});
	return didFindPreventDefault;
};
const buildPreventDefaultMessage = (elementName) => {
	if (elementName === "form") return "preventDefault() on <form> onSubmit — form won't work without JavaScript. Consider using a server action for progressive enhancement";
	return "preventDefault() on <a> onClick — use a <button> or routing component instead";
};
const noPreventDefault = { create: (context) => ({ JSXOpeningElement(node) {
	const elementName = node.name?.type === "JSXIdentifier" ? node.name.name : null;
	if (!elementName) return;
	const targetEventProps = PREVENT_DEFAULT_ELEMENTS.get(elementName);
	if (!targetEventProps) return;
	for (const targetEventProp of targetEventProps) {
		const eventAttribute = findJsxAttribute(node.attributes ?? [], targetEventProp);
		if (!eventAttribute?.value || eventAttribute.value.type !== "JSXExpressionContainer") continue;
		const expression = eventAttribute.value.expression;
		if (expression?.type !== "ArrowFunctionExpression" && expression?.type !== "FunctionExpression") continue;
		if (!containsPreventDefaultCall(expression)) continue;
		context.report({
			node,
			message: buildPreventDefaultMessage(elementName)
		});
		return;
	}
} }) };
const NUMERIC_NAME_HINTS = [
	"count",
	"length",
	"total",
	"size",
	"num"
];
const isNumericName = (name) => {
	for (const hint of NUMERIC_NAME_HINTS) {
		if (name === hint) return true;
		const camelSuffix = hint.charAt(0).toUpperCase() + hint.slice(1);
		if (name.endsWith(camelSuffix)) return true;
		if (name.endsWith(`_${hint}`)) return true;
		if (name.endsWith(`_${hint.toUpperCase()}`)) return true;
	}
	return false;
};
const renderingConditionalRender = { create: (context) => ({ LogicalExpression(node) {
	if (node.operator !== "&&") return;
	if (!(node.right?.type === "JSXElement" || node.right?.type === "JSXFragment")) return;
	const left = node.left;
	if (!left) return;
	const isLengthMemberAccess = left.type === "MemberExpression" && left.property?.type === "Identifier" && left.property.name === "length";
	const isNumericIdentifier = left.type === "Identifier" && isNumericName(left.name);
	if (isLengthMemberAccess || isNumericIdentifier) context.report({
		node,
		message: "Conditional rendering with a numeric value can render '0' — use `value > 0`, `Boolean(value)`, or a ternary"
	});
} }) };
const noPolymorphicChildren = { create: (context) => ({ BinaryExpression(node) {
	if (node.operator !== "===" && node.operator !== "==") return;
	const isTypeofChildren = (operand) => operand?.type === "UnaryExpression" && operand.operator === "typeof" && operand.argument?.type === "Identifier" && operand.argument.name === "children";
	if (!isTypeofChildren(node.left) && !isTypeofChildren(node.right)) return;
	const isStringLiteral = (operand) => operand?.type === "Literal" && operand.value === "string";
	if (!isStringLiteral(node.left) && !isStringLiteral(node.right)) return;
	context.report({
		node,
		message: "Polymorphic `typeof children === \"string\"` check — expose explicit subcomponents (e.g. `<Button.Text>`) instead of branching on what the consumer passed"
	});
} }) };
const SVG_PATH_HIGH_PRECISION_PATTERN = /\d+\.\d{4,}/;
const SVG_PATH_ATTRIBUTES = new Set([
	"d",
	"points",
	"transform"
]);
const renderingSvgPrecision = { create: (context) => ({ JSXAttribute(node) {
	if (node.name?.type !== "JSXIdentifier") return;
	if (!SVG_PATH_ATTRIBUTES.has(node.name.name)) return;
	if (node.value?.type !== "Literal") return;
	const value = node.value.value;
	if (typeof value !== "string") return;
	if (!SVG_PATH_HIGH_PRECISION_PATTERN.test(value)) return;
	context.report({
		node,
		message: `SVG ${node.name.name} attribute uses 4+ decimal precision — truncate to 1–2 decimals to shrink markup with no visible difference`
	});
} }) };
const UNCONTROLLED_INPUT_TAGS = new Set([
	"input",
	"textarea",
	"select"
]);
const VALUE_BYPASS_INPUT_TYPES = new Set([
	"hidden",
	"checkbox",
	"radio"
]);
const VALUE_PARTNER_ATTRIBUTES = ["onChange", "readOnly"];
const getInputTypeLiteral = (attributes) => {
	const typeAttribute = findJsxAttribute(attributes, "type");
	if (!typeAttribute || typeAttribute.value?.type !== "Literal") return null;
	const value = typeAttribute.value.value;
	return typeof value === "string" ? value : null;
};
const isUseStateUndefinedInitializer = (init) => {
	if (!init || init.type !== "CallExpression") return false;
	if (!isHookCall(init, "useState")) return false;
	const args = init.arguments ?? [];
	if (args.length === 0) return true;
	const firstArgument = args[0];
	return firstArgument?.type === "Identifier" && firstArgument.name === "undefined";
};
const collectUndefinedInitialStateNames = (componentBody) => {
	const stateNames = /* @__PURE__ */ new Set();
	if (componentBody?.type !== "BlockStatement") return stateNames;
	for (const statement of componentBody.body ?? []) {
		if (statement.type !== "VariableDeclaration") continue;
		for (const declarator of statement.declarations ?? []) {
			if (declarator.id?.type !== "ArrayPattern") continue;
			const valueElement = declarator.id.elements?.[0];
			if (valueElement?.type !== "Identifier") continue;
			if (!isUseStateUndefinedInitializer(declarator.init)) continue;
			stateNames.add(valueElement.name);
		}
	}
	return stateNames;
};
const hasJsxSpreadAttribute = (attributes) => attributes.some((attribute) => attribute.type === "JSXSpreadAttribute");
const noUncontrolledInput = { create: (context) => {
	const checkComponent = (componentBody) => {
		if (!componentBody) return;
		const undefinedInitialStateNames = componentBody.type === "BlockStatement" ? collectUndefinedInitialStateNames(componentBody) : /* @__PURE__ */ new Set();
		walkAst(componentBody, (child) => {
			if (child.type !== "JSXOpeningElement") return;
			if (child.name?.type !== "JSXIdentifier") return;
			const tagName = child.name.name;
			if (!UNCONTROLLED_INPUT_TAGS.has(tagName)) return;
			const attributes = child.attributes ?? [];
			if (hasJsxSpreadAttribute(attributes)) return;
			const valueAttribute = findJsxAttribute(attributes, "value");
			if (!valueAttribute) return;
			if (tagName === "input") {
				const inputType = getInputTypeLiteral(attributes);
				if (inputType !== null && VALUE_BYPASS_INPUT_TYPES.has(inputType)) return;
			}
			const hasAllowedPartner = VALUE_PARTNER_ATTRIBUTES.some((partnerAttributeName) => findJsxAttribute(attributes, partnerAttributeName));
			if (valueAttribute.value?.type === "JSXExpressionContainer" && valueAttribute.value.expression?.type === "Identifier" && undefinedInitialStateNames.has(valueAttribute.value.expression.name)) {
				const stateName = valueAttribute.value.expression.name;
				const partnerHint = hasAllowedPartner ? "Initialize useState with an explicit value" : "Initialize useState with an explicit value AND add onChange (or readOnly)";
				context.report({
					node: child,
					message: `<${tagName} value={${stateName}}> — "${stateName}" is initialized as undefined (uncontrolled), then becomes controlled on first set; React warns about this flip. ${partnerHint} (e.g. \`useState("")\`)`
				});
				return;
			}
			if (findJsxAttribute(attributes, "defaultValue")) {
				context.report({
					node: child,
					message: `<${tagName}> sets both \`value\` and \`defaultValue\` — defaultValue is ignored on a controlled input; remove one`
				});
				return;
			}
			if (!hasAllowedPartner) context.report({
				node: child,
				message: `<${tagName} value={...}> with no \`onChange\` or \`readOnly\` — React renders this as a silently read-only field`
			});
		});
	};
	return {
		FunctionDeclaration(node) {
			if (!node.id?.name || !isUppercaseName(node.id.name)) return;
			checkComponent(node.body);
		},
		VariableDeclarator(node) {
			if (!isComponentAssignment(node)) return;
			checkComponent(node.init?.body);
		}
	};
} };
//#endregion
//#region src/plugin/rules/js-performance.ts
const jsCombineIterations = { create: (context) => ({ CallExpression(node) {
	if (node.callee?.type !== "MemberExpression" || node.callee.property?.type !== "Identifier") return;
	const outerMethod = node.callee.property.name;
	if (!CHAINABLE_ITERATION_METHODS.has(outerMethod)) return;
	const innerCall = node.callee.object;
	if (innerCall?.type !== "CallExpression" || innerCall.callee?.type !== "MemberExpression" || innerCall.callee.property?.type !== "Identifier") return;
	const innerMethod = innerCall.callee.property.name;
	if (!CHAINABLE_ITERATION_METHODS.has(innerMethod)) return;
	if (innerMethod === "map" && outerMethod === "filter") {
		const filterArgument = node.arguments?.[0];
		if (filterArgument?.type === "Identifier" && filterArgument.name === "Boolean" || filterArgument?.type === "ArrowFunctionExpression" && filterArgument.params?.length === 1 && filterArgument.body?.type === "Identifier" && filterArgument.params[0]?.type === "Identifier" && filterArgument.body.name === filterArgument.params[0].name) return;
	}
	context.report({
		node,
		message: `.${innerMethod}().${outerMethod}() iterates the array twice — combine into a single loop with .reduce() or for...of`
	});
} }) };
const jsTosortedImmutable = { create: (context) => ({ CallExpression(node) {
	if (!isMemberProperty(node.callee, "sort")) return;
	const receiver = node.callee.object;
	if (receiver?.type === "ArrayExpression" && receiver.elements?.length === 1 && receiver.elements[0]?.type === "SpreadElement") context.report({
		node,
		message: "[...array].sort() — use array.toSorted() for immutable sorting (ES2023)"
	});
} }) };
const jsHoistRegexp = { create: (context) => createLoopAwareVisitors({ NewExpression(node) {
	if (node.callee?.type === "Identifier" && node.callee.name === "RegExp") context.report({
		node,
		message: "new RegExp() inside a loop — hoist to a module-level constant"
	});
} }) };
const jsMinMaxLoop = { create: (context) => ({ MemberExpression(node) {
	if (!node.computed) return;
	const object = node.object;
	if (object?.type !== "CallExpression" || !isMemberProperty(object.callee, "sort")) return;
	const isFirstElement = node.property?.type === "Literal" && node.property.value === 0;
	const isLastElement = node.property?.type === "BinaryExpression" && node.property.operator === "-" && node.property.right?.type === "Literal" && node.property.right.value === 1;
	if (isFirstElement || isLastElement) {
		const targetFunction = isFirstElement ? "min" : "max";
		context.report({
			node,
			message: `array.sort()[${isFirstElement ? "0" : "length-1"}] for min/max — use Math.${targetFunction}(...array) instead (O(n) vs O(n log n))`
		});
	}
} }) };
const jsSetMapLookups = { create: (context) => createLoopAwareVisitors({ CallExpression(node) {
	if (node.callee?.type !== "MemberExpression" || node.callee.property?.type !== "Identifier") return;
	const methodName = node.callee.property.name;
	if (methodName === "includes" || methodName === "indexOf") context.report({
		node,
		message: `array.${methodName}() in a loop is O(n) per call — convert to a Set for O(1) lookups`
	});
} }) };
const jsBatchDomCss = { create: (context) => {
	const isStyleAssignment = (node) => node.type === "ExpressionStatement" && node.expression?.type === "AssignmentExpression" && node.expression.left?.type === "MemberExpression" && node.expression.left.object?.type === "MemberExpression" && node.expression.left.object.property?.type === "Identifier" && node.expression.left.object.property.name === "style";
	return { BlockStatement(node) {
		const statements = node.body ?? [];
		for (let statementIndex = 1; statementIndex < statements.length; statementIndex++) if (isStyleAssignment(statements[statementIndex]) && isStyleAssignment(statements[statementIndex - 1])) context.report({
			node: statements[statementIndex],
			message: "Multiple sequential element.style assignments — batch with cssText or classList for fewer reflows"
		});
	} };
} };
const jsIndexMaps = { create: (context) => createLoopAwareVisitors({ CallExpression(node) {
	if (node.callee?.type !== "MemberExpression" || node.callee.property?.type !== "Identifier") return;
	const methodName = node.callee.property.name;
	if (methodName === "find" || methodName === "findIndex") context.report({
		node,
		message: `array.${methodName}() in a loop is O(n*m) — build a Map for O(1) lookups`
	});
} }) };
const jsCacheStorage = { create: (context) => {
	const storageReadCounts = /* @__PURE__ */ new Map();
	return { CallExpression(node) {
		if (!isMemberProperty(node.callee, "getItem")) return;
		if (node.callee.object?.type !== "Identifier" || !STORAGE_OBJECTS$1.has(node.callee.object.name)) return;
		if (node.arguments?.[0]?.type !== "Literal") return;
		const storageKey = String(node.arguments[0].value);
		const readCount = (storageReadCounts.get(storageKey) ?? 0) + 1;
		storageReadCounts.set(storageKey, readCount);
		if (readCount === 2) {
			const storageName = node.callee.object.name;
			context.report({
				node,
				message: `${storageName}.getItem("${storageKey}") called multiple times — cache the result in a variable`
			});
		}
	} };
} };
const jsEarlyExit = { create: (context) => ({ IfStatement(node) {
	if (node.consequent?.type !== "BlockStatement" || !node.consequent.body) return;
	let nestingDepth = 0;
	let currentBlock = node.consequent;
	while (currentBlock?.type === "BlockStatement" && currentBlock.body?.length === 1) {
		const innerStatement = currentBlock.body[0];
		if (innerStatement.type !== "IfStatement") break;
		nestingDepth++;
		currentBlock = innerStatement.consequent;
	}
	if (nestingDepth >= 3) context.report({
		node,
		message: `${nestingDepth + 1} levels of nested if statements — use early returns to flatten`
	});
} }) };
const asyncParallel = { create: (context) => {
	const filename = context.getFilename?.() ?? "";
	const isTestFile = TEST_FILE_PATTERN.test(filename);
	return { BlockStatement(node) {
		if (isTestFile) return;
		const consecutiveAwaitStatements = [];
		const flushConsecutiveAwaits = () => {
			if (consecutiveAwaitStatements.length >= 3) reportIfIndependent(consecutiveAwaitStatements, context);
			consecutiveAwaitStatements.length = 0;
		};
		for (const statement of node.body ?? []) if (statement.type === "VariableDeclaration" && statement.declarations?.length === 1 && statement.declarations[0].init?.type === "AwaitExpression" || statement.type === "ExpressionStatement" && statement.expression?.type === "AwaitExpression") consecutiveAwaitStatements.push(statement);
		else flushConsecutiveAwaits();
		flushConsecutiveAwaits();
	} };
} };
const reportIfIndependent = (statements, context) => {
	const declaredNames = /* @__PURE__ */ new Set();
	for (const statement of statements) {
		if (statement.type !== "VariableDeclaration") continue;
		const declarator = statement.declarations[0];
		const awaitArgument = declarator.init?.argument;
		let referencesEarlierResult = false;
		walkAst(awaitArgument, (child) => {
			if (child.type === "Identifier" && declaredNames.has(child.name)) referencesEarlierResult = true;
		});
		if (referencesEarlierResult) return;
		if (declarator.id?.type === "Identifier") declaredNames.add(declarator.id.name);
	}
	context.report({
		node: statements[0],
		message: `${statements.length} sequential await statements that appear independent — use Promise.all() for parallel execution`
	});
};
const jsFlatmapFilter = { create: (context) => ({ CallExpression(node) {
	if (node.callee?.type !== "MemberExpression" || node.callee.property?.type !== "Identifier") return;
	if (node.callee.property.name !== "filter") return;
	const filterArgument = node.arguments?.[0];
	if (!filterArgument) return;
	const isIdentityArrow = filterArgument.type === "ArrowFunctionExpression" && filterArgument.params?.length === 1 && filterArgument.body?.type === "Identifier" && filterArgument.params[0]?.type === "Identifier" && filterArgument.body.name === filterArgument.params[0].name;
	if (!(filterArgument.type === "Identifier" && filterArgument.name === "Boolean" || isIdentityArrow)) return;
	const innerCall = node.callee.object;
	if (innerCall?.type !== "CallExpression" || innerCall.callee?.type !== "MemberExpression" || innerCall.callee.property?.type !== "Identifier") return;
	if (innerCall.callee.property.name !== "map") return;
	context.report({
		node,
		message: ".map().filter(Boolean) iterates twice — use .flatMap() to transform and filter in a single pass"
	});
} }) };
const buildMemberAccessKey = (node) => {
	if (node.type === "Identifier") return node.name;
	if (node.type === "ThisExpression") return "this";
	if (node.type !== "MemberExpression" || node.computed) return null;
	const objectKey = buildMemberAccessKey(node.object);
	if (!objectKey) return null;
	if (node.property?.type !== "Identifier") return null;
	return `${objectKey}.${node.property.name}`;
};
const jsCachePropertyAccess = { create: (context) => {
	const inspectLoopBody = (loopBody) => {
		const counts = /* @__PURE__ */ new Map();
		walkAst(loopBody, (child) => {
			if (child.type !== "MemberExpression") return;
			if (child.computed) return;
			if (child.parent?.type === "MemberExpression" && child.parent.object === child) return;
			const key = buildMemberAccessKey(child);
			if (!key) return;
			if (key.split(".").length < 3) return;
			const existing = counts.get(key);
			if (existing) existing.count++;
			else counts.set(key, {
				count: 1,
				firstNode: child
			});
		});
		for (const [key, { count, firstNode }] of counts) if (count >= 3) context.report({
			node: firstNode,
			message: `${key} is read ${count} times inside this loop — hoist into a const at the top of the loop body`
		});
	};
	const handleLoop = (node) => {
		if (node.body) inspectLoopBody(node.body);
	};
	return {
		ForStatement: handleLoop,
		ForInStatement: handleLoop,
		ForOfStatement: handleLoop,
		WhileStatement: handleLoop,
		DoWhileStatement: handleLoop
	};
} };
const jsLengthCheckFirst = { create: (context) => ({ CallExpression(node) {
	if (node.callee?.type !== "MemberExpression") return;
	if (node.callee.property?.type !== "Identifier") return;
	if (node.callee.property.name !== "every") return;
	const callback = node.arguments?.[0];
	if (callback?.type !== "ArrowFunctionExpression" && callback?.type !== "FunctionExpression") return;
	const params = callback.params ?? [];
	if (params.length < 2) return;
	let referencesOtherArrayByIndex = false;
	walkAst(callback.body, (child) => {
		if (referencesOtherArrayByIndex) return;
		if (child.type === "MemberExpression" && child.computed && child.property?.type === "Identifier" && params[1]?.type === "Identifier" && child.property.name === params[1].name) referencesOtherArrayByIndex = true;
	});
	if (!referencesOtherArrayByIndex) return;
	let guard = node.parent ?? null;
	while (guard && guard.type !== "LogicalExpression" && guard.type !== "IfStatement") guard = guard.parent ?? null;
	if (guard?.type === "LogicalExpression" && guard.operator === "&&") {
		const left = guard.left;
		if (left?.type === "BinaryExpression" && left.operator === "===" && (isMemberProperty(left.left, "length") || isMemberProperty(left.right, "length"))) return;
	}
	context.report({
		node,
		message: ".every() over an array compared to another array — short-circuit with `a.length === b.length && a.every(...)` so unequal-length arrays exit immediately"
	});
} }) };
const INTL_CLASSES = new Set([
	"NumberFormat",
	"DateTimeFormat",
	"Collator",
	"RelativeTimeFormat",
	"ListFormat",
	"PluralRules",
	"Segmenter",
	"DisplayNames"
]);
const isIntlNewExpression = (node) => {
	if (node.type !== "NewExpression") return false;
	const callee = node.callee;
	if (callee?.type === "MemberExpression" && callee.object?.type === "Identifier" && callee.object.name === "Intl" && callee.property?.type === "Identifier" && INTL_CLASSES.has(callee.property.name)) return true;
	return false;
};
const jsHoistIntl = { create: (context) => ({ NewExpression(node) {
	if (!isIntlNewExpression(node)) return;
	let cursor = node.parent ?? null;
	let inFunctionBody = false;
	while (cursor) {
		if (cursor.type === "FunctionDeclaration" || cursor.type === "FunctionExpression" || cursor.type === "ArrowFunctionExpression") {
			inFunctionBody = true;
			break;
		}
		cursor = cursor.parent ?? null;
	}
	if (!inFunctionBody) return;
	const className = node.callee.property?.name ?? "Intl";
	context.report({
		node,
		message: `new Intl.${className}() inside a function — hoist to module scope or wrap in useMemo so it isn't recreated each call`
	});
} }) };
const findFirstAwaitOutsideNestedFunctions = (block) => {
	let firstAwait = null;
	walkAst(block, (child) => {
		if (firstAwait) return false;
		if (child !== block && (child.type === "FunctionDeclaration" || child.type === "FunctionExpression" || child.type === "ArrowFunctionExpression")) return false;
		if (child.type === "AwaitExpression") firstAwait = child;
	});
	return firstAwait;
};
const isFunctionishExpression = (node) => node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression";
const ITERATION_METHOD_NAMES_WITH_CALLBACK = new Set([
	"forEach",
	"map",
	"filter",
	"reduce",
	"reduceRight",
	"find",
	"findIndex",
	"some",
	"every",
	"flatMap"
]);
const PROMISE_CONCURRENCY_METHODS = new Set([
	"all",
	"allSettled",
	"race",
	"any"
]);
const isWrappedInPromiseConcurrency = (mapCall) => {
	const parent = mapCall.parent;
	if (parent?.type !== "CallExpression") return false;
	if (parent.arguments?.[0] !== mapCall) return false;
	const callee = parent.callee;
	if (callee?.type !== "MemberExpression" || callee.computed) return false;
	if (callee.object?.type !== "Identifier" || callee.object.name !== "Promise") return false;
	if (callee.property?.type !== "Identifier") return false;
	return PROMISE_CONCURRENCY_METHODS.has(callee.property.name);
};
const asyncAwaitInLoop = { create: (context) => {
	const inspectLoopBody = (loopBody, label) => {
		if (!loopBody) return;
		const firstAwait = findFirstAwaitOutsideNestedFunctions(loopBody);
		if (firstAwait) context.report({
			node: firstAwait,
			message: `await inside a ${label} runs the calls sequentially — for independent operations, collect them and use \`await Promise.all(items.map(...))\` to run them concurrently`
		});
	};
	return {
		ForStatement(node) {
			inspectLoopBody(node.body, "for-loop");
		},
		ForInStatement(node) {
			inspectLoopBody(node.body, "for…in loop");
		},
		ForOfStatement(node) {
			if (node.await) return;
			inspectLoopBody(node.body, "for…of loop");
		},
		WhileStatement(node) {
			inspectLoopBody(node.body, "while-loop");
		},
		DoWhileStatement(node) {
			inspectLoopBody(node.body, "do-while loop");
		},
		CallExpression(node) {
			if (node.callee?.type !== "MemberExpression") return;
			if (node.callee.property?.type !== "Identifier") return;
			const methodName = node.callee.property.name;
			if (!ITERATION_METHOD_NAMES_WITH_CALLBACK.has(methodName)) return;
			const callback = node.arguments?.[0];
			if (!callback || !isFunctionishExpression(callback)) return;
			if (!callback.async) return;
			const body = callback.body;
			if (!body) return;
			if ((methodName === "map" || methodName === "flatMap") && isWrappedInPromiseConcurrency(node)) return;
			const firstAwait = findFirstAwaitOutsideNestedFunctions(body);
			if (firstAwait) {
				const message = methodName === "forEach" ? "Async callback in .forEach — return values are dropped, so awaits don't actually wait. Use a `for…of` loop or `await Promise.all(items.map(async (item) => {...}))`" : `Async callback in .${methodName} — sequential awaits inside the callback waterfall. Use \`await Promise.all(items.map(async (item) => {...}))\` to run them concurrently`;
				context.report({
					node: firstAwait,
					message
				});
			}
		}
	};
} };
//#endregion
//#region src/plugin/rules/nextjs.ts
const nextjsNoImgElement = { create: (context) => {
	const filename = context.getFilename?.() ?? "";
	const isOgRoute = OG_ROUTE_PATTERN.test(filename);
	return { JSXOpeningElement(node) {
		if (isOgRoute) return;
		if (node.name?.type === "JSXIdentifier" && node.name.name === "img") context.report({
			node,
			message: "Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset"
		});
	} };
} };
const nextjsAsyncClientComponent = { create: (context) => {
	let fileHasUseClient = false;
	return {
		Program(programNode) {
			fileHasUseClient = hasDirective(programNode, "use client");
		},
		FunctionDeclaration(node) {
			if (!fileHasUseClient || !node.async) return;
			if (!node.id?.name || !isUppercaseName(node.id.name)) return;
			context.report({
				node,
				message: `Async client component "${node.id.name}" — client components cannot be async`
			});
		},
		VariableDeclarator(node) {
			if (!fileHasUseClient) return;
			if (!isComponentAssignment(node) || !node.init?.async) return;
			context.report({
				node,
				message: `Async client component "${node.id.name}" — client components cannot be async`
			});
		}
	};
} };
const nextjsNoAElement = { create: (context) => ({ JSXOpeningElement(node) {
	if (node.name?.type !== "JSXIdentifier" || node.name.name !== "a") return;
	const hrefAttribute = findJsxAttribute(node.attributes ?? [], "href");
	if (!hrefAttribute?.value) return;
	let hrefValue = null;
	if (hrefAttribute.value.type === "Literal") hrefValue = hrefAttribute.value.value;
	else if (hrefAttribute.value.type === "JSXExpressionContainer" && hrefAttribute.value.expression?.type === "Literal") hrefValue = hrefAttribute.value.expression.value;
	if (typeof hrefValue === "string" && hrefValue.startsWith("/")) context.report({
		node,
		message: "Use next/link instead of <a> for internal links — enables client-side navigation and prefetching"
	});
} }) };
const fileMentionsSuspense = (programNode) => {
	let didSee = false;
	walkAst(programNode, (child) => {
		if (didSee) return false;
		if (child.type === "JSXOpeningElement" && child.name?.type === "JSXIdentifier" && child.name.name === "Suspense") {
			didSee = true;
			return false;
		}
		if (child.type === "ImportDeclaration" && child.source?.value === "react") {
			if ((child.specifiers ?? []).some((specifier) => specifier.type === "ImportSpecifier" && specifier.imported?.name === "Suspense")) {
				didSee = true;
				return false;
			}
		}
	});
	return didSee;
};
const nextjsNoUseSearchParamsWithoutSuspense = { create: (context) => {
	let hasSuspenseInFile = false;
	return {
		Program(programNode) {
			hasSuspenseInFile = fileMentionsSuspense(programNode);
		},
		CallExpression(node) {
			if (hasSuspenseInFile) return;
			if (!isHookCall(node, "useSearchParams")) return;
			context.report({
				node,
				message: "useSearchParams() requires a <Suspense> boundary — without one, the entire page bails out to client-side rendering"
			});
		}
	};
} };
const nextjsNoClientFetchForServerData = { create: (context) => {
	let fileHasUseClient = false;
	return {
		Program(programNode) {
			fileHasUseClient = hasDirective(programNode, "use client");
		},
		CallExpression(node) {
			if (!fileHasUseClient || !isHookCall(node, EFFECT_HOOK_NAMES)) return;
			const callback = getEffectCallback(node);
			if (!callback || !containsFetchCall(callback)) return;
			const filename = context.getFilename?.() ?? "";
			if (PAGE_OR_LAYOUT_FILE_PATTERN.test(filename) || PAGES_DIRECTORY_PATTERN.test(filename)) context.report({
				node,
				message: "useEffect + fetch in a page/layout — fetch data server-side with a server component instead"
			});
		}
	};
} };
const nextjsMissingMetadata = { create: (context) => ({ Program(programNode) {
	const filename = context.getFilename?.() ?? "";
	if (!PAGE_FILE_PATTERN.test(filename)) return;
	if (INTERNAL_PAGE_PATH_PATTERN.test(filename)) return;
	if (!programNode.body?.some((statement) => {
		if (statement.type !== "ExportNamedDeclaration") return false;
		const declaration = statement.declaration;
		if (declaration?.type === "VariableDeclaration") return declaration.declarations?.some((declarator) => declarator.id?.type === "Identifier" && (declarator.id.name === "metadata" || declarator.id.name === "generateMetadata"));
		if (declaration?.type === "FunctionDeclaration") return declaration.id?.name === "generateMetadata";
		return false;
	})) context.report({
		node: programNode,
		message: "Page without metadata or generateMetadata export — hurts SEO"
	});
} }) };
const describeClientSideNavigation = (node, isPagesRouterFile) => {
	const redirectGuidance = isPagesRouterFile ? "handle navigation in an event handler, getServerSideProps redirect, or middleware" : "use redirect() from next/navigation or handle navigation in an event handler";
	if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
		const objectName = node.callee.object?.type === "Identifier" ? node.callee.object.name : null;
		const methodName = node.callee.property?.type === "Identifier" ? node.callee.property.name : null;
		if (objectName === "router" && (methodName === "push" || methodName === "replace")) return `router.${methodName}() in useEffect — ${redirectGuidance}`;
	}
	if (node.type === "AssignmentExpression" && node.left?.type === "MemberExpression") {
		const objectName = node.left.object?.type === "Identifier" ? node.left.object.name : null;
		const propertyName = node.left.property?.type === "Identifier" ? node.left.property.name : null;
		if (objectName === "window" && propertyName === "location") return `window.location assignment in useEffect — ${redirectGuidance}`;
		if (objectName === "location" && propertyName === "href") return `location.href assignment in useEffect — ${redirectGuidance}`;
	}
	return null;
};
const nextjsNoClientSideRedirect = { create: (context) => {
	const filename = context.getFilename?.() ?? "";
	const isPagesRouterFile = PAGES_DIRECTORY_PATTERN.test(filename);
	return { CallExpression(node) {
		if (!isHookCall(node, EFFECT_HOOK_NAMES)) return;
		const callback = getEffectCallback(node);
		if (!callback) return;
		walkAst(callback, (child) => {
			const navigationDescription = describeClientSideNavigation(child, isPagesRouterFile);
			if (navigationDescription) context.report({
				node: child,
				message: navigationDescription
			});
		});
	} };
} };
const nextjsNoRedirectInTryCatch = { create: (context) => {
	let tryCatchDepth = 0;
	return {
		TryStatement() {
			tryCatchDepth++;
		},
		"TryStatement:exit"() {
			tryCatchDepth--;
		},
		CallExpression(node) {
			if (tryCatchDepth === 0) return;
			if (node.callee?.type !== "Identifier") return;
			if (!NEXTJS_NAVIGATION_FUNCTIONS.has(node.callee.name)) return;
			context.report({
				node,
				message: `${node.callee.name}() inside try-catch — this throws a special error Next.js handles internally. Move it outside the try block or use unstable_rethrow() in the catch`
			});
		}
	};
} };
const nextjsImageMissingSizes = { create: (context) => ({ JSXOpeningElement(node) {
	if (node.name?.type !== "JSXIdentifier" || node.name.name !== "Image") return;
	const attributes = node.attributes ?? [];
	if (!hasJsxAttribute(attributes, "fill")) return;
	if (hasJsxAttribute(attributes, "sizes")) return;
	context.report({
		node,
		message: "next/image with fill but no sizes — the browser downloads the largest image. Add a sizes attribute for responsive behavior"
	});
} }) };
const nextjsNoNativeScript = { create: (context) => ({ JSXOpeningElement(node) {
	if (node.name?.type !== "JSXIdentifier" || node.name.name !== "script") return;
	const typeAttribute = findJsxAttribute(node.attributes ?? [], "type");
	const typeValue = typeAttribute?.value?.type === "Literal" ? typeAttribute.value.value : null;
	if (typeof typeValue === "string" && !EXECUTABLE_SCRIPT_TYPES.has(typeValue)) return;
	context.report({
		node,
		message: "Use next/script <Script> instead of <script> — provides loading strategy optimization and deferred loading"
	});
} }) };
const nextjsInlineScriptMissingId = { create: (context) => ({ JSXOpeningElement(node) {
	if (node.name?.type !== "JSXIdentifier" || node.name.name !== "Script") return;
	const attributes = node.attributes ?? [];
	if (hasJsxAttribute(attributes, "src")) return;
	if (hasJsxAttribute(attributes, "id")) return;
	context.report({
		node,
		message: "Inline <Script> without id — Next.js requires an id attribute to track inline scripts"
	});
} }) };
const nextjsNoFontLink = { create: (context) => ({ JSXOpeningElement(node) {
	if (node.name?.type !== "JSXIdentifier" || node.name.name !== "link") return;
	const hrefAttribute = findJsxAttribute(node.attributes ?? [], "href");
	if (!hrefAttribute?.value) return;
	const hrefValue = hrefAttribute.value.type === "Literal" ? hrefAttribute.value.value : null;
	if (typeof hrefValue === "string" && GOOGLE_FONTS_PATTERN.test(hrefValue)) context.report({
		node,
		message: "Loading Google Fonts via <link> — use next/font instead for self-hosting, zero layout shift, and no render-blocking requests"
	});
} }) };
const nextjsNoCssLink = { create: (context) => ({ JSXOpeningElement(node) {
	if (node.name?.type !== "JSXIdentifier" || node.name.name !== "link") return;
	const attributes = node.attributes ?? [];
	const relAttribute = findJsxAttribute(attributes, "rel");
	if (!relAttribute?.value) return;
	if ((relAttribute.value.type === "Literal" ? relAttribute.value.value : null) !== "stylesheet") return;
	const hrefAttribute = findJsxAttribute(attributes, "href");
	if (!hrefAttribute?.value) return;
	const hrefValue = hrefAttribute.value.type === "Literal" ? hrefAttribute.value.value : null;
	if (typeof hrefValue === "string" && GOOGLE_FONTS_PATTERN.test(hrefValue)) return;
	context.report({
		node,
		message: "<link rel=\"stylesheet\"> tag — import CSS directly for bundling and optimization"
	});
} }) };
const nextjsNoPolyfillScript = { create: (context) => ({ JSXOpeningElement(node) {
	if (node.name?.type !== "JSXIdentifier") return;
	if (node.name.name !== "script" && node.name.name !== "Script") return;
	const srcAttribute = findJsxAttribute(node.attributes ?? [], "src");
	if (!srcAttribute?.value) return;
	const srcValue = srcAttribute.value.type === "Literal" ? srcAttribute.value.value : null;
	if (typeof srcValue === "string" && POLYFILL_SCRIPT_PATTERN.test(srcValue)) context.report({
		node,
		message: "Polyfill CDN script — Next.js includes polyfills for fetch, Promise, Object.assign, and 50+ others automatically"
	});
} }) };
const nextjsNoHeadImport = { create: (context) => ({ ImportDeclaration(node) {
	if (node.source?.value !== "next/head") return;
	const filename = context.getFilename?.() ?? "";
	if (!APP_DIRECTORY_PATTERN.test(filename)) return;
	context.report({
		node,
		message: "next/head is not supported in the App Router — use the Metadata API instead"
	});
} }) };
const extractMutatingRouteSegment = (filename) => {
	const segments = filename.split("/");
	for (const segment of segments) {
		const cleaned = segment.replace(/^\[.*\]$/, "");
		if (MUTATING_ROUTE_SEGMENTS.has(cleaned)) return cleaned;
	}
	return null;
};
const getExportedGetHandlerBody = (node) => {
	if (node.type !== "ExportNamedDeclaration") return null;
	const declaration = node.declaration;
	if (!declaration) return null;
	if (declaration.type === "FunctionDeclaration" && declaration.id?.name === "GET") return declaration.body;
	if (declaration.type === "VariableDeclaration") {
		for (const declarator of declaration.declarations ?? []) if (declarator?.id?.type === "Identifier" && declarator.id.name === "GET" && declarator.init && (declarator.init.type === "ArrowFunctionExpression" || declarator.init.type === "FunctionExpression")) return declarator.init.body;
	}
	return null;
};
const nextjsNoSideEffectInGetHandler = { create: (context) => ({ ExportNamedDeclaration(node) {
	const filename = context.getFilename?.() ?? "";
	if (!ROUTE_HANDLER_FILE_PATTERN.test(filename)) return;
	const handlerBody = getExportedGetHandlerBody(node);
	if (!handlerBody) return;
	const mutatingSegment = extractMutatingRouteSegment(filename);
	if (mutatingSegment) {
		context.report({
			node,
			message: `GET handler on "/${mutatingSegment}" route — use POST to prevent CSRF and unintended prefetch triggers`
		});
		return;
	}
	const sideEffect = findSideEffect(handlerBody);
	if (sideEffect) context.report({
		node,
		message: `GET handler has side effects (${sideEffect}) — use POST to prevent CSRF and unintended prefetch triggers`
	});
} }) };
//#endregion
//#region src/plugin/rules/performance.ts
const isMemoCall = (node) => {
	if (node.type !== "CallExpression") return false;
	if (node.callee?.type === "Identifier" && node.callee.name === "memo") return true;
	if (node.callee?.type === "MemberExpression" && node.callee.object?.type === "Identifier" && node.callee.object.name === "React" && node.callee.property?.type === "Identifier" && node.callee.property.name === "memo") return true;
	return false;
};
const isInlineReference = (node) => {
	if (node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression" || node.type === "CallExpression" && node.callee?.type === "MemberExpression" && node.callee.property?.name === "bind") return "functions";
	if (node.type === "ObjectExpression") return "objects";
	if (node.type === "ArrayExpression") return "Arrays";
	if (node.type === "JSXElement" || node.type === "JSXFragment") return "JSX";
	return null;
};
const noInlinePropOnMemoComponent = { create: (context) => {
	const memoizedComponentNames = /* @__PURE__ */ new Set();
	return {
		VariableDeclarator(node) {
			if (node.id?.type !== "Identifier" || !node.init) return;
			if (isMemoCall(node.init)) memoizedComponentNames.add(node.id.name);
		},
		ExportDefaultDeclaration(node) {
			if (node.declaration && isMemoCall(node.declaration)) {
				const innerArgument = node.declaration.arguments?.[0];
				if (innerArgument?.type === "Identifier") memoizedComponentNames.add(innerArgument.name);
			}
		},
		JSXAttribute(node) {
			if (!node.value || node.value.type !== "JSXExpressionContainer") return;
			const openingElement = node.parent;
			if (!openingElement || openingElement.type !== "JSXOpeningElement") return;
			let elementName = null;
			if (openingElement.name?.type === "JSXIdentifier") elementName = openingElement.name.name;
			if (!elementName || !memoizedComponentNames.has(elementName)) return;
			const propType = isInlineReference(node.value.expression);
			if (propType) context.report({
				node: node.value.expression,
				message: `JSX attribute values should not contain ${propType} created in the same scope — ${elementName} is wrapped in memo(), so new references cause unnecessary re-renders`
			});
		}
	};
} };
const isTriviallyCheapExpression = (node) => {
	if (!node) return false;
	if (!isSimpleExpression(node)) return false;
	if (node.type === "Identifier") return false;
	if (node.type === "MemberExpression") return false;
	return true;
};
const noUsememoSimpleExpression = { create: (context) => ({ CallExpression(node) {
	if (!isHookCall(node, "useMemo")) return;
	const callback = node.arguments?.[0];
	if (!callback) return;
	if (callback.type !== "ArrowFunctionExpression" && callback.type !== "FunctionExpression") return;
	let returnExpression = null;
	if (callback.body?.type !== "BlockStatement") returnExpression = callback.body;
	else if (callback.body.body?.length === 1 && callback.body.body[0].type === "ReturnStatement") returnExpression = callback.body.body[0].argument;
	if (returnExpression && isTriviallyCheapExpression(returnExpression)) context.report({
		node,
		message: "useMemo wrapping a trivially cheap expression — memo overhead exceeds the computation"
	});
} }) };
const isMotionElement = (attributeNode) => {
	const openingElement = attributeNode.parent;
	if (!openingElement || openingElement.type !== "JSXOpeningElement") return false;
	const elementName = openingElement.name;
	if (elementName?.type === "JSXMemberExpression" && elementName.object?.type === "JSXIdentifier" && (elementName.object.name === "motion" || elementName.object.name === "m")) return true;
	if (elementName?.type === "JSXIdentifier" && elementName.name.startsWith("Motion")) return true;
	return false;
};
const noLayoutPropertyAnimation = { create: (context) => ({ JSXAttribute(node) {
	if (node.name?.type !== "JSXIdentifier" || !MOTION_ANIMATE_PROPS.has(node.name.name)) return;
	if (!node.value || node.value.type !== "JSXExpressionContainer") return;
	if (isMotionElement(node)) return;
	const expression = node.value.expression;
	if (expression?.type !== "ObjectExpression") return;
	for (const property of expression.properties ?? []) {
		if (property.type !== "Property") continue;
		let propertyName = null;
		if (property.key?.type === "Identifier") propertyName = property.key.name;
		else if (property.key?.type === "Literal") propertyName = property.key.value;
		if (propertyName && LAYOUT_PROPERTIES.has(propertyName)) context.report({
			node: property,
			message: `Animating layout property "${propertyName}" triggers layout recalculation every frame — use transform/scale or the layout prop`
		});
	}
} }) };
const noTransitionAll = { create: (context) => ({ JSXAttribute(node) {
	if (node.name?.type !== "JSXIdentifier" || node.name.name !== "style") return;
	if (node.value?.type !== "JSXExpressionContainer") return;
	const expression = node.value.expression;
	if (expression?.type !== "ObjectExpression") return;
	for (const property of expression.properties ?? []) {
		if (property.type !== "Property") continue;
		if ((property.key?.type === "Identifier" ? property.key.name : null) !== "transition") continue;
		if (property.value?.type === "Literal" && typeof property.value.value === "string" && property.value.value.startsWith("all")) context.report({
			node: property,
			message: "transition: \"all\" animates every property including layout — list only the properties you animate"
		});
	}
} }) };
const noGlobalCssVariableAnimation = { create: (context) => ({ CallExpression(node) {
	if (node.callee?.type !== "Identifier") return;
	if (!ANIMATION_CALLBACK_NAMES.has(node.callee.name)) return;
	const callback = node.arguments?.[0];
	if (!callback) return;
	const calleeName = node.callee.name;
	walkAst(callback, (child) => {
		if (child.type !== "CallExpression") return;
		if (!isMemberProperty(child.callee, "setProperty")) return;
		if (child.arguments?.[0]?.type !== "Literal") return;
		const variableName = child.arguments[0].value;
		if (typeof variableName !== "string" || !variableName.startsWith("--")) return;
		context.report({
			node: child,
			message: `CSS variable "${variableName}" updated in ${calleeName} — forces style recalculation on all inheriting elements every frame`
		});
	});
} }) };
const noLargeAnimatedBlur = { create: (context) => ({ JSXAttribute(node) {
	if (node.name?.type !== "JSXIdentifier") return;
	if (node.name.name !== "style" && !MOTION_ANIMATE_PROPS.has(node.name.name)) return;
	if (node.value?.type !== "JSXExpressionContainer") return;
	const expression = node.value.expression;
	if (expression?.type !== "ObjectExpression") return;
	for (const property of expression.properties ?? []) {
		if (property.type !== "Property") continue;
		const key = property.key?.type === "Identifier" ? property.key.name : null;
		if (key !== "filter" && key !== "backdropFilter" && key !== "WebkitBackdropFilter") continue;
		if (property.value?.type !== "Literal" || typeof property.value.value !== "string") continue;
		const match = BLUR_VALUE_PATTERN.exec(property.value.value);
		if (!match) continue;
		const blurRadius = Number.parseFloat(match[1]);
		if (blurRadius > 10) context.report({
			node: property,
			message: `blur(${blurRadius}px) is expensive — cost escalates with radius and layer size, can exceed GPU memory on mobile`
		});
	}
} }) };
const noScaleFromZero = { create: (context) => ({ JSXAttribute(node) {
	if (node.name?.type !== "JSXIdentifier") return;
	if (node.name.name !== "initial" && node.name.name !== "exit") return;
	if (node.value?.type !== "JSXExpressionContainer") return;
	const expression = node.value.expression;
	if (expression?.type !== "ObjectExpression") return;
	for (const property of expression.properties ?? []) {
		if (property.type !== "Property") continue;
		if ((property.key?.type === "Identifier" ? property.key.name : null) !== "scale") continue;
		if (property.value?.type === "Literal" && property.value.value === 0) context.report({
			node: property,
			message: "scale: 0 makes elements appear from nowhere — use scale: 0.95 with opacity: 0 for natural entrance"
		});
	}
} }) };
const noPermanentWillChange = { create: (context) => ({ JSXAttribute(node) {
	if (node.name?.type !== "JSXIdentifier" || node.name.name !== "style") return;
	if (node.value?.type !== "JSXExpressionContainer") return;
	const expression = node.value.expression;
	if (expression?.type !== "ObjectExpression") return;
	for (const property of expression.properties ?? []) {
		if (property.type !== "Property") continue;
		if ((property.key?.type === "Identifier" ? property.key.name : null) !== "willChange") continue;
		context.report({
			node: property,
			message: "Permanent will-change wastes GPU memory — apply only during active animation and remove after"
		});
	}
} }) };
const rerenderMemoWithDefaultValue = { create: (context) => {
	const checkDefaultProps = (params) => {
		for (const param of params) {
			if (param.type !== "ObjectPattern") continue;
			for (const property of param.properties ?? []) {
				if (property.type !== "Property" || property.value?.type !== "AssignmentPattern") continue;
				const defaultValue = property.value.right;
				if (defaultValue?.type === "ObjectExpression" && defaultValue.properties?.length === 0) context.report({
					node: defaultValue,
					message: "Default prop value {} creates a new object reference every render — extract to a module-level constant"
				});
				if (defaultValue?.type === "ArrayExpression" && defaultValue.elements?.length === 0) context.report({
					node: defaultValue,
					message: "Default prop value [] creates a new array reference every render — extract to a module-level constant"
				});
			}
		}
	};
	return {
		FunctionDeclaration(node) {
			if (!node.id?.name || !isUppercaseName(node.id.name)) return;
			checkDefaultProps(node.params ?? []);
		},
		VariableDeclarator(node) {
			if (!isComponentAssignment(node)) return;
			checkDefaultProps(node.init.params ?? []);
		}
	};
} };
const renderingAnimateSvgWrapper = { create: (context) => ({ JSXOpeningElement(node) {
	if (node.name?.type !== "JSXIdentifier" || node.name.name !== "svg") return;
	if (node.attributes?.some((attribute) => attribute.type === "JSXAttribute" && attribute.name?.type === "JSXIdentifier" && MOTION_ANIMATE_PROPS.has(attribute.name.name))) context.report({
		node,
		message: "Animation props directly on <svg> — wrap in a <div> or <motion.div> for better rendering performance"
	});
} }) };
const renderingUsetransitionLoading = { create: (context) => ({ VariableDeclarator(node) {
	if (node.id?.type !== "ArrayPattern" || !node.id.elements?.length) return;
	if (!node.init || !isHookCall(node.init, "useState")) return;
	if (!node.init.arguments?.length) return;
	const initializer = node.init.arguments[0];
	if (initializer.type !== "Literal" || initializer.value !== false) return;
	const stateVariableName = node.id.elements[0]?.name;
	if (!stateVariableName || !LOADING_STATE_PATTERN.test(stateVariableName)) return;
	context.report({
		node: node.init,
		message: `useState for "${stateVariableName}" — if this guards a state transition (not an async fetch), consider useTransition instead`
	});
} }) };
const renderingHydrationNoFlicker = { create: (context) => ({ CallExpression(node) {
	if (!isHookCall(node, EFFECT_HOOK_NAMES) || (node.arguments?.length ?? 0) < 2) return;
	const depsNode = node.arguments[1];
	if (depsNode.type !== "ArrayExpression" || depsNode.elements?.length !== 0) return;
	const callback = getEffectCallback(node);
	if (!callback) return;
	const bodyStatements = callback.body?.type === "BlockStatement" ? callback.body.body : [callback.body];
	if (!bodyStatements || bodyStatements.length !== 1) return;
	const soleStatement = bodyStatements[0];
	if (soleStatement?.type === "ExpressionStatement" && isSetterCall(soleStatement.expression)) context.report({
		node,
		message: "useEffect(setState, []) on mount causes a flash — consider useSyncExternalStore or suppressHydrationWarning"
	});
} }) };
const renderingScriptDeferAsync = { create: (context) => ({ JSXOpeningElement(node) {
	if (node.name?.type !== "JSXIdentifier" || node.name.name !== "script") return;
	const attributes = node.attributes ?? [];
	if (!attributes.some((attr) => attr.type === "JSXAttribute" && attr.name?.type === "JSXIdentifier" && attr.name.name === "src")) return;
	const typeAttribute = attributes.find((attr) => attr.type === "JSXAttribute" && attr.name?.type === "JSXIdentifier" && attr.name.name === "type");
	const typeValue = typeAttribute?.value?.type === "Literal" ? typeAttribute.value.value : null;
	if (typeof typeValue === "string" && !EXECUTABLE_SCRIPT_TYPES.has(typeValue)) return;
	if (typeValue === "module") return;
	if (!attributes.some((attr) => attr.type === "JSXAttribute" && attr.name?.type === "JSXIdentifier" && SCRIPT_LOADING_ATTRIBUTES.has(attr.name.name))) context.report({
		node,
		message: "<script src> without defer or async — blocks HTML parsing and delays First Contentful Paint. Add defer for DOM-dependent scripts or async for independent ones"
	});
} }) };
const jsxReferencesLocalScope = (jsxNode) => {
	let referencesScope = false;
	walkAst(jsxNode, (child) => {
		if (referencesScope) return;
		if (child.type === "JSXExpressionContainer" && child.expression?.type !== "JSXEmptyExpression") referencesScope = true;
		if (child.type === "JSXSpreadAttribute") referencesScope = true;
	});
	return referencesScope;
};
const renderingHoistJsx = { create: (context) => {
	let componentDepth = 0;
	const isComponentLike = (node) => {
		if (node.type === "FunctionDeclaration" && node.id?.name && isUppercaseName(node.id.name)) return true;
		if (node.type === "VariableDeclarator" && isComponentAssignment(node)) return true;
		return false;
	};
	const enter = (node) => {
		if (isComponentLike(node)) componentDepth++;
	};
	const exit = (node) => {
		if (isComponentLike(node)) componentDepth = Math.max(0, componentDepth - 1);
	};
	return {
		FunctionDeclaration: enter,
		"FunctionDeclaration:exit": exit,
		VariableDeclarator: enter,
		"VariableDeclarator:exit": exit,
		VariableDeclaration(node) {
			if (componentDepth === 0) return;
			if (node.kind !== "const") return;
			for (const declarator of node.declarations ?? []) {
				const init = declarator.init;
				if (!init) continue;
				if (init.type !== "JSXElement" && init.type !== "JSXFragment") continue;
				if (jsxReferencesLocalScope(init)) continue;
				const name = declarator.id?.type === "Identifier" ? declarator.id.name : "<unnamed>";
				context.report({
					node: declarator,
					message: `Static JSX "${name}" inside a component — hoist to module scope so it isn't recreated each render`
				});
			}
		}
	};
} };
const callbackReturnsJsx = (callback) => {
	if (!callback) return false;
	if (callback.type !== "ArrowFunctionExpression" && callback.type !== "FunctionExpression") return false;
	const body = callback.body;
	if (body?.type === "JSXElement" || body?.type === "JSXFragment") return true;
	if (body?.type !== "BlockStatement") return false;
	for (const stmt of body.body ?? []) if (stmt.type === "ReturnStatement" && (stmt.argument?.type === "JSXElement" || stmt.argument?.type === "JSXFragment")) return true;
	return false;
};
const containsEarlyReturn = (ifStatement) => {
	const consequent = ifStatement.consequent;
	if (!consequent) return false;
	if (consequent.type === "ReturnStatement") return true;
	if (consequent.type !== "BlockStatement") return false;
	for (const stmt of consequent.body ?? []) if (stmt.type === "ReturnStatement") return true;
	return false;
};
const rerenderMemoBeforeEarlyReturn = { create: (context) => {
	const inspectFunctionBody = (statements) => {
		let memoNode = null;
		for (const stmt of statements) {
			if (!memoNode) {
				if (stmt.type !== "VariableDeclaration") continue;
				for (const declarator of stmt.declarations ?? []) {
					const init = declarator.init;
					if (init?.type === "CallExpression" && isHookCall(init, "useMemo") && callbackReturnsJsx(init.arguments?.[0])) {
						memoNode = declarator;
						break;
					}
				}
				continue;
			}
			if (stmt.type === "IfStatement" && containsEarlyReturn(stmt)) {
				context.report({
					node: memoNode,
					message: "useMemo returning JSX runs before an early return — extract the JSX into a memoized child component so the parent bails out before the subtree renders"
				});
				return;
			}
		}
	};
	return {
		FunctionDeclaration(node) {
			if (!isUppercaseName(node.id?.name ?? "")) return;
			if (node.body?.type !== "BlockStatement") return;
			inspectFunctionBody(node.body.body ?? []);
		},
		VariableDeclarator(node) {
			if (!isComponentAssignment(node)) return;
			const body = node.init?.body;
			if (body?.type !== "BlockStatement") return;
			inspectFunctionBody(body.body ?? []);
		}
	};
} };
const NONDETERMINISTIC_RENDER_PATTERNS = [
	{
		display: "new Date()",
		matches: (node) => node.type === "NewExpression" && node.callee?.type === "Identifier" && node.callee.name === "Date"
	},
	{
		display: "Date.now()",
		matches: (node) => node.type === "CallExpression" && node.callee?.type === "MemberExpression" && node.callee.object?.type === "Identifier" && node.callee.object.name === "Date" && node.callee.property?.type === "Identifier" && node.callee.property.name === "now"
	},
	{
		display: "Math.random()",
		matches: (node) => node.type === "CallExpression" && node.callee?.type === "MemberExpression" && node.callee.object?.type === "Identifier" && node.callee.object.name === "Math" && node.callee.property?.type === "Identifier" && node.callee.property.name === "random"
	},
	{
		display: "performance.now()",
		matches: (node) => node.type === "CallExpression" && node.callee?.type === "MemberExpression" && node.callee.object?.type === "Identifier" && node.callee.object.name === "performance" && node.callee.property?.type === "Identifier" && node.callee.property.name === "now"
	},
	{
		display: "crypto.randomUUID()",
		matches: (node) => node.type === "CallExpression" && node.callee?.type === "MemberExpression" && node.callee.object?.type === "Identifier" && node.callee.object.name === "crypto" && node.callee.property?.type === "Identifier" && node.callee.property.name === "randomUUID"
	}
];
const findOpeningElementOfChild = (jsxNode) => {
	let cursor = jsxNode.parent ?? null;
	while (cursor) {
		if (cursor.type === "JSXElement") return cursor.openingElement;
		if (cursor.type === "JSXFragment") return null;
		cursor = cursor.parent ?? null;
	}
	return null;
};
const hasSuppressHydrationWarningAttribute = (openingElement) => {
	if (!openingElement) return false;
	for (const attr of openingElement.attributes ?? []) if (attr.type === "JSXAttribute" && attr.name?.type === "JSXIdentifier" && attr.name.name === "suppressHydrationWarning") return true;
	return false;
};
const HIGH_FREQUENCY_DOM_EVENTS = new Set([
	"scroll",
	"mousemove",
	"wheel",
	"pointermove",
	"touchmove",
	"drag"
]);
const isAddEventListenerCall = (node) => {
	if (node.type !== "CallExpression") return false;
	if (node.callee?.type !== "MemberExpression") return false;
	if (node.callee.property?.type !== "Identifier") return false;
	if (node.callee.property.name !== "addEventListener") return false;
	return true;
};
const handlerCallsSetState = (handler) => {
	if (handler.type !== "ArrowFunctionExpression" && handler.type !== "FunctionExpression") return null;
	let setStateCall = null;
	walkAst(handler.body, (child) => {
		if (setStateCall) return;
		if (child.type === "CallExpression" && child.callee?.type === "Identifier" && /^set[A-Z]/.test(child.callee.name)) setStateCall = child;
	});
	return setStateCall;
};
const rerenderTransitionsScroll = { create: (context) => ({ CallExpression(node) {
	if (!isAddEventListenerCall(node)) return;
	const eventArg = node.arguments?.[0];
	if (eventArg?.type !== "Literal") return;
	const eventName = eventArg.value;
	if (typeof eventName !== "string" || !HIGH_FREQUENCY_DOM_EVENTS.has(eventName)) return;
	const handler = node.arguments?.[1];
	if (!handler) return;
	const setStateCall = handlerCallsSetState(handler);
	if (!setStateCall) return;
	let cursor = setStateCall.parent ?? null;
	while (cursor && cursor !== handler) {
		if (cursor.type === "CallExpression" && cursor.callee?.type === "Identifier" && (cursor.callee.name === "startTransition" || cursor.callee.name === "requestAnimationFrame" || cursor.callee.name === "requestIdleCallback")) return;
		cursor = cursor.parent ?? null;
	}
	context.report({
		node: setStateCall,
		message: `setState in a "${eventName}" handler triggers re-renders at scroll/pointer frequency — wrap in startTransition (mark as non-urgent), use useDeferredValue, or stash in a ref + rAF throttle`
	});
} }) };
const renderingHydrationMismatchTime = { create: (context) => ({ JSXExpressionContainer(node) {
	if (!node.expression) return;
	const matched = NONDETERMINISTIC_RENDER_PATTERNS.find((pattern) => pattern.matches(node.expression));
	if (matched) {
		if (hasSuppressHydrationWarningAttribute(findOpeningElementOfChild(node))) return;
		context.report({
			node,
			message: `${matched.display} in JSX renders differently on server vs client — wrap in useEffect+useState (client-only) or add suppressHydrationWarning to the parent if intentional`
		});
		return;
	}
	walkAst(node.expression, (child) => {
		for (const pattern of NONDETERMINISTIC_RENDER_PATTERNS) if (pattern.matches(child)) {
			if (hasSuppressHydrationWarningAttribute(findOpeningElementOfChild(node))) return;
			context.report({
				node: child,
				message: `${pattern.display} reachable from JSX renders differently on server vs client — wrap in useEffect+useState (client-only) or add suppressHydrationWarning to the parent if intentional`
			});
			return;
		}
	});
} }) };
const collectIdentifierNames$1 = (node, into) => {
	if (!node) return;
	walkAst(node, (child) => {
		if (child.type === "Identifier") into.add(child.name);
	});
};
const isEarlyReturnIfStatement = (statement) => {
	if (statement.type !== "IfStatement") return false;
	const consequent = statement.consequent;
	if (!consequent) return false;
	if (consequent.type === "ReturnStatement") return true;
	if (consequent.type !== "BlockStatement") return false;
	for (const inner of consequent.body ?? []) if (inner.type === "ReturnStatement") return true;
	return false;
};
const asyncDeferAwait = { create: (context) => {
	const inspectStatements = (statements) => {
		for (let statementIndex = 0; statementIndex < statements.length - 1; statementIndex++) {
			const currentStatement = statements[statementIndex];
			if (currentStatement.type !== "VariableDeclaration") continue;
			const awaitedBindingNames = /* @__PURE__ */ new Set();
			let didAwait = false;
			for (const declarator of currentStatement.declarations ?? []) if (declarator.init?.type === "AwaitExpression") {
				didAwait = true;
				if (declarator.id?.type === "Identifier") awaitedBindingNames.add(declarator.id.name);
				else if (declarator.id?.type === "ObjectPattern") {
					for (const property of declarator.id.properties ?? []) if (property.type === "Property" && property.value?.type === "Identifier") awaitedBindingNames.add(property.value.name);
				}
			}
			if (!didAwait) continue;
			const nextStatement = statements[statementIndex + 1];
			if (!isEarlyReturnIfStatement(nextStatement)) continue;
			const testIdentifiers = /* @__PURE__ */ new Set();
			collectIdentifierNames$1(nextStatement.test, testIdentifiers);
			if ([...awaitedBindingNames].some((name) => testIdentifiers.has(name))) continue;
			const consequentIdentifiers = /* @__PURE__ */ new Set();
			collectIdentifierNames$1(nextStatement.consequent, consequentIdentifiers);
			if ([...awaitedBindingNames].some((name) => consequentIdentifiers.has(name))) continue;
			context.report({
				node: currentStatement,
				message: "await blocks the function before an early-return that doesn't use the awaited value — move the await after the synchronous guard so the skip path stays fast"
			});
		}
	};
	const enterFunction = (node) => {
		if (!node.async) return;
		if (node.body?.type !== "BlockStatement") return;
		inspectStatements(node.body.body ?? []);
	};
	return {
		FunctionDeclaration: enterFunction,
		FunctionExpression: enterFunction,
		ArrowFunctionExpression: enterFunction
	};
} };
const CONTINUOUS_VALUE_HOOK_PATTERN = /^use(?:Window(?:Width|Height|Dimensions)|Scroll(?:Position|Y|X)|MousePosition|ResizeObserver|IntersectionObserver)/;
const isThresholdComparison = (node, valueName) => {
	if (node.type !== "BinaryExpression") return false;
	if (![
		"<",
		"<=",
		">",
		">=",
		"===",
		"!==",
		"==",
		"!="
	].includes(node.operator)) return false;
	if (!(node.left?.type === "Identifier" && node.left.name === valueName || node.right?.type === "Identifier" && node.right.name === valueName)) return false;
	return node.left?.type === "Literal" || node.right?.type === "Literal";
};
const findThresholdDerivedBindings = (componentBody) => {
	const out = [];
	if (componentBody?.type !== "BlockStatement") return out;
	const statements = componentBody.body ?? [];
	for (let outerIndex = 0; outerIndex < statements.length; outerIndex++) {
		const outerStatement = statements[outerIndex];
		if (outerStatement.type !== "VariableDeclaration") continue;
		for (const declarator of outerStatement.declarations ?? []) {
			if (declarator.id?.type !== "Identifier") continue;
			const init = declarator.init;
			if (init?.type !== "CallExpression") continue;
			if (init.callee?.type !== "Identifier") continue;
			if (!CONTINUOUS_VALUE_HOOK_PATTERN.test(init.callee.name)) continue;
			const continuousName = declarator.id.name;
			const hookName = init.callee.name;
			for (let innerIndex = outerIndex + 1; innerIndex < statements.length; innerIndex++) {
				const innerStatement = statements[innerIndex];
				if (innerStatement.type !== "VariableDeclaration") break;
				let foundThreshold = false;
				for (const innerDecl of innerStatement.declarations ?? []) if (innerDecl.init && isThresholdComparison(innerDecl.init, continuousName)) {
					foundThreshold = true;
					break;
				}
				if (foundThreshold) {
					out.push({
						continuousName,
						hookName,
						declarator
					});
					break;
				}
			}
		}
	}
	return out;
};
const rerenderDerivedStateFromHook = { create: (context) => {
	const checkComponent = (componentBody) => {
		if (!componentBody || componentBody.type !== "BlockStatement") return;
		const bindings = findThresholdDerivedBindings(componentBody);
		for (const binding of bindings) context.report({
			node: binding.declarator,
			message: `${binding.hookName}() returns a continuously-changing value but you only compare it to a threshold — use a media-query / threshold hook (e.g. \`useMediaQuery("(max-width: 767px)")\`) so the component re-renders only when the threshold flips`
		});
	};
	return {
		FunctionDeclaration(node) {
			if (!node.id?.name || !isUppercaseName(node.id.name)) return;
			checkComponent(node.body);
		},
		VariableDeclarator(node) {
			if (!isComponentAssignment(node)) return;
			checkComponent(node.init?.body);
		}
	};
} };
//#endregion
//#region src/plugin/rules/react-ui.ts
const getOpeningElementTagName = (openingElement) => {
	if (!openingElement) return null;
	if (openingElement.name?.type === "JSXIdentifier") return openingElement.name.name;
	if (openingElement.name?.type === "JSXMemberExpression") {
		let cursor = openingElement.name;
		while (cursor.type === "JSXMemberExpression") cursor = cursor.property;
		if (cursor?.type === "JSXIdentifier") return cursor.name;
	}
	return null;
};
const getClassNameLiteral = (classAttribute) => {
	if (!classAttribute.value) return null;
	if (classAttribute.value.type === "Literal" && typeof classAttribute.value.value === "string") return classAttribute.value.value;
	if (classAttribute.value.type === "JSXExpressionContainer") {
		const expression = classAttribute.value.expression;
		if (expression?.type === "Literal" && typeof expression.value === "string") return expression.value;
		if (expression?.type === "TemplateLiteral" && expression.quasis?.length === 1) return expression.quasis[0].value?.raw ?? null;
	}
	return null;
};
const tokenizeClassName = (classNameValue) => classNameValue.split(/\s+/).filter(Boolean);
const getInlineStyleObjectExpression = (jsxAttribute) => {
	if (jsxAttribute.name?.type !== "JSXIdentifier" || jsxAttribute.name.name !== "style") return null;
	if (jsxAttribute.value?.type !== "JSXExpressionContainer") return null;
	const expression = jsxAttribute.value.expression;
	if (expression?.type !== "ObjectExpression") return null;
	return expression;
};
const getStylePropertyKeyName = (objectProperty) => {
	if (objectProperty.type !== "Property") return null;
	if (objectProperty.key?.type === "Identifier") return objectProperty.key.name;
	if (objectProperty.key?.type === "Literal" && typeof objectProperty.key.value === "string") return objectProperty.key.value;
	return null;
};
const getStylePropertyNumericValue = (objectProperty) => {
	const valueNode = objectProperty.value;
	if (!valueNode) return null;
	if (valueNode.type === "Literal" && typeof valueNode.value === "number") return valueNode.value;
	if (valueNode.type === "Literal" && typeof valueNode.value === "string") {
		const parsed = parseFloat(valueNode.value);
		return Number.isFinite(parsed) ? parsed : null;
	}
	return null;
};
const noBoldHeading = { create: (context) => ({ JSXOpeningElement(openingNode) {
	const tagName = getOpeningElementTagName(openingNode);
	if (!tagName || !HEADING_TAG_NAMES.has(tagName)) return;
	const classAttribute = findJsxAttribute(openingNode.attributes ?? [], "className");
	if (classAttribute) {
		const classNameLiteral = getClassNameLiteral(classAttribute);
		if (classNameLiteral) {
			for (const tailwindWeightToken of HEAVY_HEADING_TAILWIND_WEIGHTS) if (new RegExp(`(?:^|\\s)${tailwindWeightToken}(?:$|\\s|:)`).test(classNameLiteral)) {
				context.report({
					node: classAttribute,
					message: `${tailwindWeightToken} on <${tagName}> crushes counter shapes at display sizes — use font-semibold (600) or font-medium (500)`
				});
				return;
			}
		}
	}
	const styleAttribute = findJsxAttribute(openingNode.attributes ?? [], "style");
	if (!styleAttribute) return;
	const styleObject = getInlineStyleObjectExpression(styleAttribute);
	if (!styleObject) return;
	for (const objectProperty of styleObject.properties ?? []) {
		if (getStylePropertyKeyName(objectProperty) !== "fontWeight") continue;
		const numericWeight = getStylePropertyNumericValue(objectProperty);
		if (numericWeight !== null && numericWeight >= 700) {
			context.report({
				node: objectProperty,
				message: `fontWeight: ${numericWeight} on <${tagName}> crushes counter shapes at display sizes — use 500 or 600`
			});
			return;
		}
	}
} }) };
const collectAxisShorthandPairs = (classNameValue, horizontalPattern, verticalPattern) => {
	const horizontalValues = /* @__PURE__ */ new Set();
	for (const horizontalMatch of classNameValue.matchAll(horizontalPattern)) horizontalValues.add(`${horizontalMatch[1]}${horizontalMatch[2]}`);
	const matchedPairs = [];
	for (const verticalMatch of classNameValue.matchAll(verticalPattern)) {
		const verticalValue = `${verticalMatch[1]}${verticalMatch[2]}`;
		if (horizontalValues.has(verticalValue)) matchedPairs.push({ value: verticalValue });
	}
	return matchedPairs;
};
const hasResponsivePrefix = (classNameValue, axisPrefix) => new RegExp(`(?:^|\\s)\\w+:${axisPrefix}-`).test(classNameValue);
const noRedundantPaddingAxes = { create: (context) => ({ JSXAttribute(jsxAttribute) {
	if (jsxAttribute.name?.type !== "JSXIdentifier" || jsxAttribute.name.name !== "className") return;
	const classNameLiteral = getClassNameLiteral(jsxAttribute);
	if (!classNameLiteral) return;
	if (hasResponsivePrefix(classNameLiteral, "px") || hasResponsivePrefix(classNameLiteral, "py")) return;
	const matchedPairs = collectAxisShorthandPairs(classNameLiteral, PADDING_HORIZONTAL_AXIS_PATTERN, PADDING_VERTICAL_AXIS_PATTERN);
	if (matchedPairs.length === 0) return;
	for (const matchedPair of matchedPairs) context.report({
		node: jsxAttribute,
		message: `px-${matchedPair.value} py-${matchedPair.value} → use the shorthand p-${matchedPair.value}`
	});
} }) };
const noRedundantSizeAxes = { create: (context) => ({ JSXAttribute(jsxAttribute) {
	if (jsxAttribute.name?.type !== "JSXIdentifier" || jsxAttribute.name.name !== "className") return;
	const classNameLiteral = getClassNameLiteral(jsxAttribute);
	if (!classNameLiteral) return;
	if (hasResponsivePrefix(classNameLiteral, "w") || hasResponsivePrefix(classNameLiteral, "h")) return;
	const matchedPairs = collectAxisShorthandPairs(classNameLiteral, SIZE_WIDTH_AXIS_PATTERN, SIZE_HEIGHT_AXIS_PATTERN);
	if (matchedPairs.length === 0) return;
	for (const matchedPair of matchedPairs) context.report({
		node: jsxAttribute,
		message: `w-${matchedPair.value} h-${matchedPair.value} → use the shorthand size-${matchedPair.value} (Tailwind v3.4+)`
	});
} }) };
const noSpaceOnFlexChildren = { create: (context) => ({ JSXAttribute(jsxAttribute) {
	if (jsxAttribute.name?.type !== "JSXIdentifier" || jsxAttribute.name.name !== "className") return;
	const classNameLiteral = getClassNameLiteral(jsxAttribute);
	if (!classNameLiteral) return;
	const tokens = tokenizeClassName(classNameLiteral);
	let hasFlexOrGridLayout = false;
	for (const token of tokens) {
		const lastSegment = token.includes(":") ? token.slice(token.lastIndexOf(":") + 1) : token;
		if (FLEX_OR_GRID_DISPLAY_TOKENS.has(lastSegment)) {
			hasFlexOrGridLayout = true;
			break;
		}
	}
	if (!hasFlexOrGridLayout) return;
	const spaceMatch = classNameLiteral.match(SPACE_AXIS_PATTERN);
	if (!spaceMatch) return;
	const spaceAxis = spaceMatch[1];
	const spaceValue = spaceMatch[2];
	context.report({
		node: jsxAttribute,
		message: `space-${spaceAxis}-${spaceValue} on a flex/grid parent — use gap-${spaceAxis}-${spaceValue} instead. Per-sibling margins phantom-gap on conditional render and don't mirror in RTL`
	});
} }) };
const isInsideExcludedAncestor = (jsxTextNode) => {
	let cursor = jsxTextNode.parent;
	while (cursor) {
		if (cursor.type === "JSXElement") {
			const tagName = getOpeningElementTagName(cursor.openingElement);
			if (tagName && ELLIPSIS_EXCLUDED_TAG_NAMES.has(tagName.toLowerCase())) return true;
			const translateAttribute = findJsxAttribute(cursor.openingElement?.attributes ?? [], "translate");
			if (translateAttribute?.value?.type === "Literal" && translateAttribute.value.value === "no") return true;
		}
		cursor = cursor.parent;
	}
	return false;
};
const noEmDashInJsxText = { create: (context) => ({ JSXText(jsxTextNode) {
	if (!(typeof jsxTextNode.value === "string" ? jsxTextNode.value : "").includes("—")) return;
	if (isInsideExcludedAncestor(jsxTextNode)) return;
	context.report({
		node: jsxTextNode,
		message: "Em dash (—) in JSX text reads as model output — replace with comma, colon, semicolon, or parentheses"
	});
} }) };
const noThreePeriodEllipsis = { create: (context) => ({ JSXText(jsxTextNode) {
	const textValue = typeof jsxTextNode.value === "string" ? jsxTextNode.value : "";
	if (!TRAILING_THREE_PERIOD_ELLIPSIS_PATTERN.test(textValue)) return;
	if (isInsideExcludedAncestor(jsxTextNode)) return;
	context.report({
		node: jsxTextNode,
		message: "Three-period ellipsis (\"...\") in JSX text — use the actual ellipsis character \"…\" (or `&hellip;`)"
	});
} }) };
const buildDefaultPaletteRegex = () => {
	const utilityPrefixGroup = TAILWIND_PALETTE_UTILITY_PREFIXES.join("|");
	const paletteNameGroup = TAILWIND_DEFAULT_PALETTE_NAMES.join("|");
	const paletteStopGroup = TAILWIND_DEFAULT_PALETTE_STOPS.join("|");
	return new RegExp(`(?:^|\\s|:)(${utilityPrefixGroup})-(${paletteNameGroup})-(${paletteStopGroup})(?=$|[\\s:/])`, "g");
};
const DEFAULT_PALETTE_REGEX = buildDefaultPaletteRegex();
const noDefaultTailwindPalette = { create: (context) => ({ JSXAttribute(jsxAttribute) {
	if (jsxAttribute.name?.type !== "JSXIdentifier" || jsxAttribute.name.name !== "className") return;
	const classNameLiteral = getClassNameLiteral(jsxAttribute);
	if (!classNameLiteral) return;
	const reportedTokens = /* @__PURE__ */ new Set();
	for (const paletteMatch of classNameLiteral.matchAll(DEFAULT_PALETTE_REGEX)) {
		const matchedToken = `${paletteMatch[1]}-${paletteMatch[2]}-${paletteMatch[3]}`;
		if (reportedTokens.has(matchedToken)) continue;
		reportedTokens.add(matchedToken);
		const replacementSuggestion = paletteMatch[2] === "indigo" ? "use your project's brand color or zinc/neutral/stone" : "use zinc (true neutral), neutral (warmer), or stone (warmest)";
		context.report({
			node: jsxAttribute,
			message: `${matchedToken} reads as the Tailwind template default — ${replacementSuggestion}`
		});
	}
} }) };
const isButtonLikeTagName = (tagName) => {
	if (tagName === "button") return true;
	if (tagName === "Button") return true;
	return false;
};
const collectJsxLabelText = (jsxElementNode) => {
	const childList = jsxElementNode.children ?? [];
	if (childList.length === 0) return null;
	const collectedFragments = [];
	for (const childNode of childList) {
		if (childNode.type === "JSXText") {
			collectedFragments.push(typeof childNode.value === "string" ? childNode.value : "");
			continue;
		}
		if (childNode.type === "JSXExpressionContainer") {
			const expression = childNode.expression;
			if (expression?.type === "Literal" && typeof expression.value === "string") {
				collectedFragments.push(expression.value);
				continue;
			}
			if (expression?.type === "TemplateLiteral" && expression.quasis?.length === 1) {
				const rawTemplate = expression.quasis[0].value?.raw;
				if (typeof rawTemplate === "string" && expression.expressions.length === 0) {
					collectedFragments.push(rawTemplate);
					continue;
				}
			}
			return null;
		}
		if (childNode.type === "JSXFragment") {
			const fragmentLabel = collectJsxLabelText(childNode);
			if (fragmentLabel === null) return null;
			collectedFragments.push(fragmentLabel);
			continue;
		}
		if (childNode.type === "JSXElement") return null;
	}
	return collectedFragments.join("").trim();
};
const noVagueButtonLabel = { create: (context) => ({ JSXElement(jsxElementNode) {
	const tagName = getOpeningElementTagName(jsxElementNode.openingElement);
	if (!tagName || !isButtonLikeTagName(tagName)) return;
	const labelText = collectJsxLabelText(jsxElementNode);
	if (!labelText) return;
	const normalizedLabel = labelText.toLowerCase().replace(/[.!?…]+$/, "").trim();
	if (!VAGUE_BUTTON_LABELS.has(normalizedLabel)) return;
	context.report({
		node: jsxElementNode.openingElement ?? jsxElementNode,
		message: `Vague button label "${labelText}" — name the action ("Save changes", "Send invite", "Delete account") so screen readers and hesitant users know what happens`
	});
} }) };
//#endregion
//#region src/plugin/rules/react-native.ts
const resolveJsxElementName = (openingElement) => {
	const elementName = openingElement?.name;
	if (!elementName) return null;
	if (elementName.type === "JSXIdentifier") return elementName.name;
	if (elementName.type === "JSXMemberExpression") return elementName.property?.name ?? null;
	return null;
};
const truncateText = (text) => text.length > 30 ? `${text.slice(0, 30)}...` : text;
const isRawTextContent = (child) => {
	if (child.type === "JSXText") return Boolean(child.value?.trim());
	if (child.type !== "JSXExpressionContainer" || !child.expression) return false;
	const expression = child.expression;
	return expression.type === "Literal" && (typeof expression.value === "string" || typeof expression.value === "number") || expression.type === "TemplateLiteral";
};
const getRawTextDescription = (child) => {
	if (child.type === "JSXText") return `"${truncateText(child.value.trim())}"`;
	if (child.type === "JSXExpressionContainer" && child.expression) {
		const expression = child.expression;
		if (expression.type === "Literal" && typeof expression.value === "string") return `"${truncateText(expression.value)}"`;
		if (expression.type === "Literal" && typeof expression.value === "number") return `{${expression.value}}`;
		if (expression.type === "TemplateLiteral") return "template literal";
	}
	return "text content";
};
const isTextHandlingComponent = (elementName) => {
	if (REACT_NATIVE_TEXT_COMPONENTS.has(elementName)) return true;
	return [...REACT_NATIVE_TEXT_COMPONENT_KEYWORDS].some((keyword) => elementName.includes(keyword));
};
const rnNoRawText = { create: (context) => {
	let isDomComponentFile = false;
	return {
		Program(programNode) {
			isDomComponentFile = hasDirective(programNode, "use dom");
		},
		JSXElement(node) {
			if (isDomComponentFile) return;
			const elementName = resolveJsxElementName(node.openingElement);
			if (elementName && isTextHandlingComponent(elementName)) return;
			for (const child of node.children ?? []) {
				if (!isRawTextContent(child)) continue;
				context.report({
					node: child,
					message: `Raw ${getRawTextDescription(child)} outside a <Text> component — this will crash on React Native`
				});
			}
		}
	};
} };
const rnNoDeprecatedModules = { create: (context) => ({ ImportDeclaration(node) {
	if (node.source?.value !== "react-native") return;
	for (const specifier of node.specifiers ?? []) {
		if (specifier.type !== "ImportSpecifier") continue;
		const importedName = specifier.imported?.name;
		if (!importedName) continue;
		const replacement = DEPRECATED_RN_MODULE_REPLACEMENTS.get(importedName);
		if (!replacement) continue;
		context.report({
			node: specifier,
			message: `"${importedName}" was removed from react-native — use ${replacement} instead`
		});
	}
} }) };
const rnNoLegacyExpoPackages = { create: (context) => ({ ImportDeclaration(node) {
	const source = node.source?.value;
	if (typeof source !== "string") return;
	for (const [packageName, replacement] of LEGACY_EXPO_PACKAGE_REPLACEMENTS) if (source === packageName || source.startsWith(`${packageName}/`)) {
		context.report({
			node,
			message: `"${packageName}" is deprecated — use ${replacement}`
		});
		return;
	}
} }) };
const rnNoDimensionsGet = { create: (context) => ({ CallExpression(node) {
	if (node.callee?.type !== "MemberExpression") return;
	if (node.callee.object?.type !== "Identifier" || node.callee.object.name !== "Dimensions") return;
	if (isMemberProperty(node.callee, "get")) context.report({
		node,
		message: "Dimensions.get() does not update on screen rotation or resize — use useWindowDimensions() for reactive layout"
	});
	if (isMemberProperty(node.callee, "addEventListener")) context.report({
		node,
		message: "Dimensions.addEventListener() was removed in React Native 0.72 — use useWindowDimensions() instead"
	});
} }) };
const rnNoInlineFlatlistRenderitem = { create: (context) => ({ JSXAttribute(node) {
	if (node.name?.type !== "JSXIdentifier" || node.name.name !== "renderItem") return;
	if (!node.value || node.value.type !== "JSXExpressionContainer") return;
	const openingElement = node.parent;
	if (!openingElement || openingElement.type !== "JSXOpeningElement") return;
	const listComponentName = resolveJsxElementName(openingElement);
	if (!listComponentName || !REACT_NATIVE_LIST_COMPONENTS.has(listComponentName)) return;
	const expression = node.value.expression;
	if (expression?.type !== "ArrowFunctionExpression" && expression?.type !== "FunctionExpression") return;
	context.report({
		node: expression,
		message: `Inline renderItem on <${listComponentName}> creates a new function reference every render — extract to a named function or wrap in useCallback`
	});
} }) };
const reportLegacyShadowProperties = (objectExpression, context) => {
	const legacyShadowPropertyNames = [];
	for (const property of objectExpression.properties ?? []) {
		if (property.type !== "Property") continue;
		const propertyName = property.key?.type === "Identifier" ? property.key.name : null;
		if (propertyName && LEGACY_SHADOW_STYLE_PROPERTIES.has(propertyName)) legacyShadowPropertyNames.push(propertyName);
	}
	if (legacyShadowPropertyNames.length === 0) return;
	const quotedPropertyNames = legacyShadowPropertyNames.map((name) => `"${name}"`).join(", ");
	context.report({
		node: objectExpression,
		message: `Legacy shadow style${legacyShadowPropertyNames.length > 1 ? "s" : ""} ${quotedPropertyNames} — use boxShadow for cross-platform shadows on the new architecture`
	});
};
const rnNoLegacyShadowStyles = { create: (context) => ({
	JSXAttribute(node) {
		if (node.name?.type !== "JSXIdentifier" || node.name.name !== "style") return;
		if (node.value?.type !== "JSXExpressionContainer") return;
		const expression = node.value.expression;
		if (expression?.type === "ObjectExpression") reportLegacyShadowProperties(expression, context);
		else if (expression?.type === "ArrayExpression") {
			for (const element of expression.elements ?? []) if (element?.type === "ObjectExpression") reportLegacyShadowProperties(element, context);
		}
	},
	CallExpression(node) {
		if (node.callee?.type !== "MemberExpression") return;
		if (node.callee.object?.type !== "Identifier" || node.callee.object.name !== "StyleSheet") return;
		if (!isMemberProperty(node.callee, "create")) return;
		const stylesArgument = node.arguments?.[0];
		if (stylesArgument?.type !== "ObjectExpression") return;
		for (const styleDefinition of stylesArgument.properties ?? []) {
			if (styleDefinition.type !== "Property") continue;
			if (styleDefinition.value?.type !== "ObjectExpression") continue;
			reportLegacyShadowProperties(styleDefinition.value, context);
		}
	}
}) };
const rnPreferReanimated = { create: (context) => ({ ImportDeclaration(node) {
	if (node.source?.value !== "react-native") return;
	for (const specifier of node.specifiers ?? []) {
		if (specifier.type !== "ImportSpecifier") continue;
		if (specifier.imported?.name !== "Animated") continue;
		context.report({
			node: specifier,
			message: "Animated from react-native runs animations on the JS thread — use react-native-reanimated for performant UI-thread animations"
		});
	}
} }) };
const rnNoSingleElementStyleArray = { create: (context) => ({ JSXAttribute(node) {
	const propName = node.name?.type === "JSXIdentifier" ? node.name.name : null;
	if (!propName) return;
	if (propName !== "style" && !propName.endsWith("Style")) return;
	if (node.value?.type !== "JSXExpressionContainer") return;
	const expression = node.value.expression;
	if (expression?.type !== "ArrayExpression") return;
	if (expression.elements?.length !== 1) return;
	context.report({
		node: expression,
		message: `Single-element style array on "${propName}" — use ${propName}={value} instead of ${propName}={[value]} to avoid unnecessary array allocation`
	});
} }) };
const TOUCHABLE_COMPONENTS = new Set([
	"TouchableOpacity",
	"TouchableHighlight",
	"TouchableWithoutFeedback",
	"TouchableNativeFeedback"
]);
const rnPreferPressable = { create: (context) => ({ ImportDeclaration(node) {
	if (node.source?.value !== "react-native") return;
	for (const specifier of node.specifiers ?? []) {
		if (specifier.type !== "ImportSpecifier") continue;
		const importedName = specifier.imported?.name;
		if (!importedName || !TOUCHABLE_COMPONENTS.has(importedName)) continue;
		context.report({
			node: specifier,
			message: `${importedName} is legacy — use <Pressable> from react-native (or react-native-gesture-handler) for modern press handling`
		});
	}
} }) };
const rnPreferExpoImage = { create: (context) => ({ ImportDeclaration(node) {
	if (node.source?.value !== "react-native") return;
	for (const specifier of node.specifiers ?? []) {
		if (specifier.type !== "ImportSpecifier") continue;
		if (specifier.imported?.name !== "Image") continue;
		context.report({
			node: specifier,
			message: "Importing Image from react-native — prefer expo-image for caching, placeholders, and progressive loading (drop-in API)"
		});
	}
} }) };
const NON_NATIVE_NAVIGATOR_PACKAGES = new Set(["@react-navigation/stack", "@react-navigation/drawer"]);
const rnNoNonNativeNavigator = { create: (context) => ({ ImportDeclaration(node) {
	const source = node.source?.value;
	if (typeof source !== "string" || !NON_NATIVE_NAVIGATOR_PACKAGES.has(source)) return;
	const replacement = source.replace("@react-navigation/", "@react-navigation/native-");
	context.report({
		node,
		message: `${source} uses a JS-implemented navigator — use ${replacement} for native iOS/Android transitions and gestures`
	});
} }) };
const rnNoScrollState = { create: (context) => ({ JSXAttribute(node) {
	if (node.name?.type !== "JSXIdentifier") return;
	if (node.name.name !== "onScroll") return;
	if (node.value?.type !== "JSXExpressionContainer") return;
	const expression = node.value.expression;
	if (expression?.type !== "ArrowFunctionExpression" && expression?.type !== "FunctionExpression") return;
	let setStateCallNode = null;
	walkAst(expression.body, (child) => {
		if (setStateCallNode) return;
		if (child.type === "CallExpression" && child.callee?.type === "Identifier" && /^set[A-Z]/.test(child.callee.name)) setStateCallNode = child;
	});
	if (setStateCallNode) context.report({
		node: setStateCallNode,
		message: "setState in onScroll triggers re-renders on every scroll event — use a Reanimated shared value (useAnimatedScrollHandler) or a ref to track scroll position"
	});
} }) };
const SCROLLVIEW_NAMES = new Set(["ScrollView"]);
const rnNoScrollviewMappedList = { create: (context) => ({ JSXElement(node) {
	const elementName = resolveJsxElementName(node.openingElement);
	if (!elementName || !SCROLLVIEW_NAMES.has(elementName)) return;
	for (const child of node.children ?? []) {
		if (child.type !== "JSXExpressionContainer") continue;
		const expression = child.expression;
		if (expression?.type === "CallExpression" && expression.callee?.type === "MemberExpression" && expression.callee.property?.type === "Identifier" && expression.callee.property.name === "map") {
			context.report({
				node: child,
				message: `<${elementName}> rendering items.map(...) — use FlashList, LegendList, or FlatList so only visible rows mount`
			});
			return;
		}
	}
} }) };
const RENDER_ITEM_PROP_NAMES = new Set([
	"renderItem",
	"renderSectionHeader",
	"renderSectionFooter"
]);
const rnNoInlineObjectInListItem = { create: (context) => {
	let renderItemDepth = 0;
	const isRenderItemAttribute = (parent) => {
		if (parent?.type !== "JSXAttribute") return false;
		const attrName = parent.name?.type === "JSXIdentifier" ? parent.name.name : null;
		return attrName ? RENDER_ITEM_PROP_NAMES.has(attrName) : false;
	};
	const isRenderItemFunction = (node) => {
		if (node.type !== "ArrowFunctionExpression" && node.type !== "FunctionExpression") return false;
		const expressionContainer = node.parent;
		if (expressionContainer?.type !== "JSXExpressionContainer") return false;
		return isRenderItemAttribute(expressionContainer.parent);
	};
	const enter = (node) => {
		if (isRenderItemFunction(node)) renderItemDepth++;
	};
	const exit = (node) => {
		if (isRenderItemFunction(node)) renderItemDepth = Math.max(0, renderItemDepth - 1);
	};
	return {
		ArrowFunctionExpression: enter,
		"ArrowFunctionExpression:exit": exit,
		FunctionExpression: enter,
		"FunctionExpression:exit": exit,
		JSXAttribute(node) {
			if (renderItemDepth === 0) return;
			if (node.value?.type !== "JSXExpressionContainer") return;
			if (node.value.expression?.type !== "ObjectExpression") return;
			const propName = node.name?.type === "JSXIdentifier" ? node.name.name : "<unknown>";
			context.report({
				node,
				message: `Inline object literal on "${propName}" inside renderItem — allocates a fresh reference per row and breaks memo() on the row component. Hoist outside renderItem or pass primitives`
			});
		}
	};
} };
const REANIMATED_LAYOUT_KEYS = new Set([
	"width",
	"height",
	"top",
	"left",
	"right",
	"bottom",
	"minWidth",
	"minHeight",
	"maxWidth",
	"maxHeight",
	"marginTop",
	"marginBottom",
	"marginLeft",
	"marginRight",
	"paddingTop",
	"paddingBottom",
	"paddingLeft",
	"paddingRight",
	"flex",
	"flexBasis",
	"flexGrow",
	"flexShrink"
]);
const findReturnedObject = (callback) => {
	if (callback.type !== "ArrowFunctionExpression" && callback.type !== "FunctionExpression") return null;
	const body = callback.body;
	if (body?.type === "ObjectExpression") return body;
	if (body?.type !== "BlockStatement") return null;
	for (const stmt of body.body ?? []) if (stmt.type === "ReturnStatement" && stmt.argument?.type === "ObjectExpression") return stmt.argument;
	return null;
};
const rnAnimateLayoutProperty = { create: (context) => ({ CallExpression(node) {
	if (node.callee?.type !== "Identifier" || node.callee.name !== "useAnimatedStyle") return;
	const callback = node.arguments?.[0];
	if (!callback) return;
	const returnedObject = findReturnedObject(callback);
	if (!returnedObject) return;
	for (const property of returnedObject.properties ?? []) {
		if (property.type !== "Property") continue;
		if (property.key?.type !== "Identifier") continue;
		if (!REANIMATED_LAYOUT_KEYS.has(property.key.name)) continue;
		context.report({
			node: property,
			message: `useAnimatedStyle animating "${property.key.name}" — layout properties run on the layout thread; use transform: [{ translateX/Y }, { scale }] or opacity for GPU-accelerated animation`
		});
	}
} }) };
const rnPreferContentInsetAdjustment = { create: (context) => ({ JSXElement(node) {
	if (resolveJsxElementName(node.openingElement) !== "SafeAreaView") return;
	for (const child of node.children ?? []) {
		if (child.type !== "JSXElement") continue;
		const childName = resolveJsxElementName(child.openingElement);
		if (!childName || !SCROLLVIEW_NAMES.has(childName)) continue;
		context.report({
			node,
			message: "<SafeAreaView> wrapping <ScrollView> — set `contentInsetAdjustmentBehavior=\"automatic\"` on the ScrollView and drop the SafeAreaView wrapper for native safe-area handling"
		});
		return;
	}
} }) };
const PRESS_HANDLER_PROP_NAMES = new Set(["onPressIn", "onPressOut"]);
const handlerMutatesIdentifier = (handler, sharedValueBindings) => {
	if (handler.type !== "ArrowFunctionExpression" && handler.type !== "FunctionExpression") return false;
	if (sharedValueBindings.size === 0) return false;
	let didMutate = false;
	walkAst(handler.body, (child) => {
		if (didMutate) return;
		if (child.type === "AssignmentExpression" && child.left?.type === "MemberExpression" && child.left.object?.type === "Identifier" && sharedValueBindings.has(child.left.object.name) && child.left.property?.type === "Identifier" && child.left.property.name === "value") didMutate = true;
		if (child.type === "CallExpression" && child.callee?.type === "MemberExpression" && child.callee.object?.type === "Identifier" && sharedValueBindings.has(child.callee.object.name) && child.callee.property?.type === "Identifier" && (child.callee.property.name === "set" || child.callee.property.name === "value")) didMutate = true;
	});
	return didMutate;
};
const rnPressableSharedValueMutation = { create: (context) => {
	const sharedValueBindingsByComponent = [];
	const enterScope = () => {
		sharedValueBindingsByComponent.push(/* @__PURE__ */ new Set());
	};
	const exitScope = () => {
		sharedValueBindingsByComponent.pop();
	};
	const trackSharedValueBinding = (declarator) => {
		if (sharedValueBindingsByComponent.length === 0) return;
		if (declarator.id?.type !== "Identifier") return;
		if (declarator.init?.type !== "CallExpression") return;
		const callee = declarator.init.callee;
		if (callee?.type !== "Identifier") return;
		if (callee.name !== "useSharedValue") return;
		sharedValueBindingsByComponent[sharedValueBindingsByComponent.length - 1].add(declarator.id.name);
	};
	return {
		FunctionDeclaration: enterScope,
		"FunctionDeclaration:exit": exitScope,
		FunctionExpression: enterScope,
		"FunctionExpression:exit": exitScope,
		ArrowFunctionExpression: enterScope,
		"ArrowFunctionExpression:exit": exitScope,
		VariableDeclarator(node) {
			trackSharedValueBinding(node);
		},
		JSXOpeningElement(node) {
			if (resolveJsxElementName(node) !== "Pressable") return;
			if (sharedValueBindingsByComponent.length === 0) return;
			const activeBindings = /* @__PURE__ */ new Set();
			for (const frame of sharedValueBindingsByComponent) for (const binding of frame) activeBindings.add(binding);
			if (activeBindings.size === 0) return;
			for (const attr of node.attributes ?? []) {
				if (attr.type !== "JSXAttribute") continue;
				if (attr.name?.type !== "JSXIdentifier") continue;
				if (!PRESS_HANDLER_PROP_NAMES.has(attr.name.name)) continue;
				if (attr.value?.type !== "JSXExpressionContainer") continue;
				const handler = attr.value.expression;
				if (!handler) continue;
				if (!handlerMutatesIdentifier(handler, activeBindings)) continue;
				context.report({
					node: attr,
					message: `<Pressable> ${attr.name.name} mutates a Reanimated shared value — use a Gesture.Tap() inside <GestureDetector> for press animations that stay on the UI thread`
				});
			}
		}
	};
} };
const VIRTUALIZED_LIST_NAMES = new Set([
	"FlatList",
	"FlashList",
	"LegendList",
	"SectionList",
	"VirtualizedList"
]);
const rnListDataMapped = { create: (context) => ({ JSXOpeningElement(node) {
	const elementName = resolveJsxElementName(node);
	if (!elementName || !VIRTUALIZED_LIST_NAMES.has(elementName)) return;
	for (const attr of node.attributes ?? []) {
		if (attr.type !== "JSXAttribute") continue;
		if (attr.name?.type !== "JSXIdentifier" || attr.name.name !== "data") continue;
		if (attr.value?.type !== "JSXExpressionContainer") continue;
		const expression = attr.value.expression;
		if (expression?.type !== "CallExpression") continue;
		if (expression.callee?.type !== "MemberExpression") continue;
		if (expression.callee.property?.type !== "Identifier") continue;
		const methodName = expression.callee.property.name;
		if (methodName !== "map" && methodName !== "filter") continue;
		context.report({
			node: attr,
			message: `<${elementName} data={items.${methodName}(...)}> allocates a fresh array per render — wrap in useMemo at list scope so the data reference stays stable across parent renders`
		});
		return;
	}
} }) };
const rnAnimationReactionAsDerived = { create: (context) => ({ CallExpression(node) {
	if (node.callee?.type !== "Identifier" || node.callee.name !== "useAnimatedReaction") return;
	const reactionFn = node.arguments?.[1];
	if (!reactionFn) return;
	if (reactionFn.type !== "ArrowFunctionExpression" && reactionFn.type !== "FunctionExpression") return;
	const body = reactionFn.body;
	let singleAssignment = null;
	if (body?.type === "BlockStatement") {
		const statements = body.body ?? [];
		if (statements.length !== 1) return;
		const onlyStatement = statements[0];
		if (onlyStatement.type !== "ExpressionStatement") return;
		singleAssignment = onlyStatement.expression;
	} else if (body) singleAssignment = body;
	if (!singleAssignment) return;
	if (singleAssignment.type !== "AssignmentExpression") return;
	if (singleAssignment.left?.type !== "MemberExpression") return;
	if (singleAssignment.left.property?.type !== "Identifier") return;
	if (singleAssignment.left.property.name !== "value") return;
	context.report({
		node,
		message: "useAnimatedReaction body is a single shared-value assignment — useDerivedValue is shorter and tracks dependencies natively"
	});
} }) };
const JS_BOTTOM_SHEET_PACKAGES = new Set([
	"@gorhom/bottom-sheet",
	"react-native-bottom-sheet",
	"react-native-modal-bottom-sheet",
	"react-native-raw-bottom-sheet"
]);
const rnBottomSheetPreferNative = { create: (context) => ({ ImportDeclaration(node) {
	const source = node.source?.value;
	if (typeof source !== "string" || !JS_BOTTOM_SHEET_PACKAGES.has(source)) return;
	context.report({
		node,
		message: `${source} is a JS-implemented bottom sheet — for v7+ RN, prefer <Modal presentationStyle="formSheet"> for native gesture handling and snap points`
	});
} }) };
const rnScrollviewDynamicPadding = { create: (context) => ({ JSXOpeningElement(node) {
	const elementName = resolveJsxElementName(node);
	if (!elementName) return;
	if (!SCROLLVIEW_NAMES.has(elementName) && elementName !== "FlatList" && elementName !== "FlashList") return;
	for (const attr of node.attributes ?? []) {
		if (attr.type !== "JSXAttribute") continue;
		if (attr.name?.type !== "JSXIdentifier" || attr.name.name !== "contentContainerStyle") continue;
		if (attr.value?.type !== "JSXExpressionContainer") continue;
		const expression = attr.value.expression;
		if (expression?.type !== "ObjectExpression") continue;
		for (const property of expression.properties ?? []) {
			if (property.type !== "Property") continue;
			if (property.key?.type !== "Identifier") continue;
			const key = property.key.name;
			if (key !== "paddingBottom" && key !== "paddingTop") continue;
			const value = property.value;
			if (!value) continue;
			if (value.type === "Literal") continue;
			context.report({
				node: property,
				message: `Dynamic ${key} on contentContainerStyle reflows the scroll content — use \`contentInset\` (OS-level offset, no relayout) instead`
			});
			return;
		}
	}
} }) };
const LIST_ROW_PRESS_HANDLER_PROPS = new Set([
	"onPress",
	"onLongPress",
	"onPressIn",
	"onPressOut",
	"onSelect",
	"onClick"
]);
const detectInlineRowHandlers = (renderItemFn) => {
	const inlineHandlers = [];
	walkAst(renderItemFn.body, (child) => {
		if (child.type !== "JSXAttribute") return;
		if (child.name?.type !== "JSXIdentifier") return;
		if (!LIST_ROW_PRESS_HANDLER_PROPS.has(child.name.name)) return;
		if (child.value?.type !== "JSXExpressionContainer") return;
		const expression = child.value.expression;
		if (expression?.type === "ArrowFunctionExpression" || expression?.type === "FunctionExpression") inlineHandlers.push(child);
	});
	return inlineHandlers;
};
const isRenderItemJsxAttribute = (parent) => {
	if (parent?.type !== "JSXAttribute") return false;
	return (parent.name?.type === "JSXIdentifier" ? parent.name.name : null) === "renderItem";
};
const isRenderItemFunction = (node) => {
	const parent = node.parent;
	if (parent?.type !== "JSXExpressionContainer") return false;
	return isRenderItemJsxAttribute(parent.parent);
};
const rnListCallbackPerRow = { create: (context) => {
	const inspect = (node) => {
		if (!isRenderItemFunction(node)) return;
		const inlineHandlers = detectInlineRowHandlers(node);
		for (const handler of inlineHandlers) {
			const handlerName = handler.name?.type === "JSXIdentifier" ? handler.name.name : "<handler>";
			context.report({
				node: handler,
				message: `Inline ${handlerName} arrow inside renderItem creates a fresh closure per row — hoist with useCallback at list scope and pass the row id as a primitive prop`
			});
		}
	};
	return {
		ArrowFunctionExpression: inspect,
		FunctionExpression: inspect
	};
} };
const LEGACY_SHADOW_KEYS = new Set([
	"shadowColor",
	"shadowOffset",
	"shadowOpacity",
	"shadowRadius",
	"elevation"
]);
const findLegacyShadowProperty = (objectExpression) => {
	for (const property of objectExpression.properties ?? []) {
		if (property.type !== "Property") continue;
		if (property.key?.type !== "Identifier") continue;
		if (LEGACY_SHADOW_KEYS.has(property.key.name)) return {
			keyName: property.key.name,
			node: property
		};
	}
	return null;
};
const rnStylePreferBoxShadow = { create: (context) => ({
	JSXAttribute(node) {
		if (node.name?.type !== "JSXIdentifier") return;
		const attrName = node.name.name;
		if (attrName !== "style" && !attrName.endsWith("Style")) return;
		if (node.value?.type !== "JSXExpressionContainer") return;
		const expression = node.value.expression;
		if (expression?.type !== "ObjectExpression") return;
		const match = findLegacyShadowProperty(expression);
		if (!match) return;
		context.report({
			node: match.node,
			message: `${match.keyName} is iOS/Android-platform-specific — use the cross-platform CSS \`boxShadow\` string (e.g. \`boxShadow: "0 2px 8px rgba(0,0,0,0.1)"\`) on RN v7+`
		});
	},
	CallExpression(node) {
		if (node.callee?.type !== "MemberExpression") return;
		if (node.callee.object?.type !== "Identifier") return;
		if (node.callee.object.name !== "StyleSheet") return;
		if (node.callee.property?.type !== "Identifier") return;
		if (node.callee.property.name !== "create") return;
		const arg = node.arguments?.[0];
		if (arg?.type !== "ObjectExpression") return;
		for (const property of arg.properties ?? []) {
			if (property.type !== "Property") continue;
			if (property.value?.type !== "ObjectExpression") continue;
			const match = findLegacyShadowProperty(property.value);
			if (!match) continue;
			context.report({
				node: match.node,
				message: `${match.keyName} is iOS/Android-platform-specific — use the cross-platform CSS \`boxShadow\` string on RN v7+`
			});
		}
	}
}) };
const RECYCLABLE_LIST_NAMES = new Set(["FlashList", "LegendList"]);
const rnListRecyclableWithoutTypes = { create: (context) => ({ JSXOpeningElement(node) {
	const elementName = resolveJsxElementName(node);
	if (!elementName || !RECYCLABLE_LIST_NAMES.has(elementName)) return;
	let hasRecycleItemsEnabled = false;
	let hasGetItemType = false;
	for (const attr of node.attributes ?? []) {
		if (attr.type !== "JSXAttribute") continue;
		if (attr.name?.type !== "JSXIdentifier") continue;
		if (attr.name.name === "recycleItems") if (!attr.value) hasRecycleItemsEnabled = true;
		else if (attr.value.type === "JSXExpressionContainer" && attr.value.expression?.type === "Literal") hasRecycleItemsEnabled = attr.value.expression.value === true;
		else hasRecycleItemsEnabled = true;
		if (attr.name.name === "getItemType") hasGetItemType = true;
	}
	if (hasRecycleItemsEnabled && !hasGetItemType) context.report({
		node,
		message: `<${elementName} recycleItems> without \`getItemType\` — heterogeneous rows mount into the wrong recycled cells. Add \`getItemType={item => item.kind}\` so FlashList keeps separate recycle pools per type`
	});
} }) };
//#endregion
//#region src/plugin/rules/tanstack-query.ts
const queryStableQueryClient = { create: (context) => {
	let componentDepth = 0;
	let stableHookDepth = 0;
	return {
		FunctionDeclaration(node) {
			if (node.id?.name && UPPERCASE_PATTERN.test(node.id.name)) componentDepth++;
		},
		"FunctionDeclaration:exit"(node) {
			if (node.id?.name && UPPERCASE_PATTERN.test(node.id.name)) componentDepth--;
		},
		VariableDeclarator(node) {
			if (node.id?.type === "Identifier" && UPPERCASE_PATTERN.test(node.id.name) && (node.init?.type === "ArrowFunctionExpression" || node.init?.type === "FunctionExpression")) componentDepth++;
		},
		"VariableDeclarator:exit"(node) {
			if (node.id?.type === "Identifier" && UPPERCASE_PATTERN.test(node.id.name) && (node.init?.type === "ArrowFunctionExpression" || node.init?.type === "FunctionExpression")) componentDepth--;
		},
		CallExpression(node) {
			if (isHookCall(node, STABLE_HOOK_WRAPPERS)) stableHookDepth++;
		},
		"CallExpression:exit"(node) {
			if (isHookCall(node, STABLE_HOOK_WRAPPERS)) stableHookDepth = Math.max(0, stableHookDepth - 1);
		},
		NewExpression(node) {
			if (componentDepth <= 0) return;
			if (stableHookDepth > 0) return;
			if (node.callee?.type !== "Identifier" || node.callee.name !== "QueryClient") return;
			context.report({
				node,
				message: "new QueryClient() inside a component — creates a new cache on every render. Move to module scope or wrap in useState(() => new QueryClient())"
			});
		}
	};
} };
const queryNoRestDestructuring = { create: (context) => ({ VariableDeclarator(node) {
	if (node.id?.type !== "ObjectPattern") return;
	if (!node.init || node.init.type !== "CallExpression") return;
	const calleeName = node.init.callee?.type === "Identifier" ? node.init.callee.name : null;
	if (!calleeName || !TANSTACK_QUERY_HOOKS.has(calleeName)) return;
	if (node.id.properties?.some((property) => property.type === "RestElement")) context.report({
		node: node.id,
		message: `Rest destructuring on ${calleeName}() result — subscribes to all fields and causes unnecessary re-renders. Destructure only the fields you need`
	});
} }) };
const queryNoVoidQueryFn = { create: (context) => ({ CallExpression(node) {
	const calleeName = node.callee?.type === "Identifier" ? node.callee.name : null;
	if (!calleeName || !TANSTACK_QUERY_HOOKS.has(calleeName)) return;
	const optionsArgument = node.arguments?.[0];
	if (!optionsArgument || optionsArgument.type !== "ObjectExpression") return;
	const queryFnProperty = optionsArgument.properties?.find((property) => property.type === "Property" && property.key?.type === "Identifier" && property.key.name === "queryFn");
	if (!queryFnProperty?.value) return;
	const queryFnValue = queryFnProperty.value;
	if (queryFnValue.type === "ArrowFunctionExpression" && queryFnValue.body?.type !== "BlockStatement") return;
	if (queryFnValue.type === "ArrowFunctionExpression" || queryFnValue.type === "FunctionExpression") {
		const body = queryFnValue.body;
		if (body?.type !== "BlockStatement") return;
		if ((body.body ?? []).length === 0) context.report({
			node: queryFnProperty,
			message: "Empty queryFn — query functions must return a value. Use the enabled option to conditionally disable the query instead"
		});
	}
} }) };
const queryNoQueryInEffect = { create: (context) => ({ CallExpression(node) {
	if (!isHookCall(node, EFFECT_HOOK_NAMES)) return;
	const callback = getEffectCallback(node);
	if (!callback) return;
	walkAst(callback, (child) => {
		if (child.type !== "CallExpression") return;
		if ((child.callee?.type === "Identifier" ? child.callee.name : null) === "refetch") context.report({
			node: child,
			message: "refetch() inside useEffect — React Query manages refetching automatically. Use queryKey dependencies or the enabled option instead"
		});
	});
} }) };
const queryMutationMissingInvalidation = { create: (context) => ({ CallExpression(node) {
	const calleeName = node.callee?.type === "Identifier" ? node.callee.name : null;
	if (!calleeName || !TANSTACK_MUTATION_HOOKS.has(calleeName)) return;
	const optionsArgument = node.arguments?.[0];
	if (!optionsArgument || optionsArgument.type !== "ObjectExpression") return;
	if (!optionsArgument.properties?.some((property) => property.type === "Property" && property.key?.type === "Identifier" && property.key.name === "mutationFn")) return;
	let hasCacheUpdate = false;
	walkAst(optionsArgument, (child) => {
		if (hasCacheUpdate) return false;
		if (child.type === "CallExpression" && child.callee?.type === "MemberExpression" && child.callee.property?.type === "Identifier" && QUERY_CACHE_UPDATE_METHODS.has(child.callee.property.name)) {
			hasCacheUpdate = true;
			return false;
		}
	});
	if (!hasCacheUpdate) context.report({
		node,
		message: "useMutation without a cache update — stale data may remain after the mutation. Call queryClient.invalidateQueries / setQueryData / resetQueries / refetchQueries inside onSuccess (or trigger a router refresh)"
	});
} }) };
const queryNoUseQueryForMutation = { create: (context) => ({ CallExpression(node) {
	const calleeName = node.callee?.type === "Identifier" ? node.callee.name : null;
	if (!calleeName || !TANSTACK_QUERY_HOOKS.has(calleeName)) return;
	const optionsArgument = node.arguments?.[0];
	if (!optionsArgument || optionsArgument.type !== "ObjectExpression") return;
	const queryFnProperty = optionsArgument.properties?.find((property) => property.type === "Property" && property.key?.type === "Identifier" && property.key.name === "queryFn");
	if (!queryFnProperty?.value) return;
	let hasMutatingFetch = false;
	walkAst(queryFnProperty.value, (child) => {
		if (hasMutatingFetch) return;
		if (child.type !== "CallExpression") return;
		if (child.callee?.type !== "Identifier" || child.callee.name !== "fetch") return;
		const optionsArg = child.arguments?.[1];
		if (!optionsArg || optionsArg.type !== "ObjectExpression") return;
		if (optionsArg.properties?.find((property) => property.type === "Property" && property.key?.type === "Identifier" && property.key.name === "method" && property.value?.type === "Literal" && typeof property.value.value === "string" && MUTATING_HTTP_METHODS.has(property.value.value.toUpperCase()))) hasMutatingFetch = true;
	});
	if (hasMutatingFetch) context.report({
		node,
		message: `${calleeName}() with a mutating fetch (POST/PUT/DELETE) — use useMutation() instead, which provides onSuccess/onError callbacks and doesn't auto-refetch`
	});
} }) };
//#endregion
//#region src/plugin/rules/security.ts
const noEval = { create: (context) => ({
	CallExpression(node) {
		if (node.callee?.type === "Identifier" && node.callee.name === "eval") {
			context.report({
				node,
				message: "eval() is a code injection risk — avoid dynamic code execution"
			});
			return;
		}
		if (node.callee?.type === "Identifier" && (node.callee.name === "setTimeout" || node.callee.name === "setInterval") && node.arguments?.[0]?.type === "Literal" && typeof node.arguments[0].value === "string") context.report({
			node,
			message: `${node.callee.name}() with string argument executes code dynamically — use a function instead`
		});
	},
	NewExpression(node) {
		if (node.callee?.type === "Identifier" && node.callee.name === "Function") context.report({
			node,
			message: "new Function() is a code injection risk — avoid dynamic code execution"
		});
	}
}) };
const noSecretsInClientCode = { create: (context) => ({ VariableDeclarator(node) {
	if (node.id?.type !== "Identifier") return;
	if (node.init?.type !== "Literal" || typeof node.init.value !== "string") return;
	const variableName = node.id.name;
	const literalValue = node.init.value;
	const trailingSuffix = variableName.split("_").pop()?.toLowerCase() ?? "";
	const isUiConstant = SECRET_FALSE_POSITIVE_SUFFIXES.has(trailingSuffix);
	if (SECRET_VARIABLE_PATTERN.test(variableName) && !isUiConstant && literalValue.length > 24) {
		context.report({
			node,
			message: `Possible hardcoded secret in "${variableName}" — use environment variables instead`
		});
		return;
	}
	if (SECRET_PATTERNS.some((pattern) => pattern.test(literalValue))) context.report({
		node,
		message: "Hardcoded secret detected — use environment variables instead"
	});
} }) };
//#endregion
//#region src/plugin/rules/server.ts
const containsAuthCheck = (statements) => {
	let foundAuthCall = false;
	for (const statement of statements) walkAst(statement, (child) => {
		if (foundAuthCall) return;
		let callNode = null;
		if (child.type === "CallExpression") callNode = child;
		else if (child.type === "AwaitExpression" && child.argument?.type === "CallExpression") callNode = child.argument;
		if (callNode?.callee?.type === "Identifier" && AUTH_FUNCTION_NAMES.has(callNode.callee.name)) foundAuthCall = true;
	});
	return foundAuthCall;
};
const serverAuthActions = { create: (context) => {
	let fileHasUseServerDirective = false;
	return {
		Program(programNode) {
			fileHasUseServerDirective = hasDirective(programNode, "use server");
		},
		ExportNamedDeclaration(node) {
			const declaration = node.declaration;
			if (declaration?.type !== "FunctionDeclaration" || !declaration?.async) return;
			if (!(fileHasUseServerDirective || hasUseServerDirective(declaration))) return;
			if (!containsAuthCheck((declaration.body?.body ?? []).slice(0, 10))) {
				const functionName = declaration.id?.name ?? "anonymous";
				context.report({
					node: declaration.id ?? node,
					message: `Server action "${functionName}" — add auth check (auth(), getSession(), etc.) at the top`
				});
			}
		}
	};
} };
const MUTABLE_CONTAINER_CONSTRUCTORS = new Set([
	"Map",
	"Set",
	"WeakMap",
	"WeakSet"
]);
const isMutableConstInitializer = (init) => {
	if (!init) return null;
	if (init.type === "ArrayExpression") return "[]";
	if (init.type === "ObjectExpression") return "{}";
	if (init.type === "NewExpression" && init.callee?.type === "Identifier" && MUTABLE_CONTAINER_CONSTRUCTORS.has(init.callee.name)) return `new ${init.callee.name}()`;
	return null;
};
const serverNoMutableModuleState = { create: (context) => {
	let fileHasUseServerDirective = false;
	return {
		Program(programNode) {
			fileHasUseServerDirective = hasDirective(programNode, "use server");
		},
		VariableDeclaration(node) {
			if (!fileHasUseServerDirective) return;
			if (node.parent?.type !== "Program") return;
			for (const declarator of node.declarations ?? []) {
				const variableName = declarator.id?.type === "Identifier" ? declarator.id.name : "<unnamed>";
				if (node.kind === "let" || node.kind === "var") {
					context.report({
						node: declarator,
						message: `Module-scoped ${node.kind} "${variableName}" in a "use server" file — this is shared across requests; move per-request data into the action body`
					});
					continue;
				}
				const containerKind = isMutableConstInitializer(declarator.init);
				if (containerKind) context.report({
					node: declarator,
					message: `Module-scoped const "${variableName} = ${containerKind}" in a "use server" file — the container itself is shared across requests; move per-request data into the action body`
				});
			}
		}
	};
} };
const serverCacheWithObjectLiteral = { create: (context) => {
	const cachedFunctionNames = /* @__PURE__ */ new Set();
	return {
		VariableDeclarator(node) {
			if (node.id?.type !== "Identifier") return;
			const init = node.init;
			if (init?.type !== "CallExpression") return;
			const callee = init.callee;
			if (!(callee?.type === "Identifier" && callee.name === "cache" || callee?.type === "MemberExpression" && callee.object?.type === "Identifier" && callee.object.name === "React" && callee.property?.type === "Identifier" && callee.property.name === "cache")) return;
			cachedFunctionNames.add(node.id.name);
		},
		CallExpression(node) {
			if (node.callee?.type !== "Identifier") return;
			if (!cachedFunctionNames.has(node.callee.name)) return;
			if ((node.arguments?.[0])?.type !== "ObjectExpression") return;
			context.report({
				node,
				message: `${node.callee.name} is React.cache()-wrapped, but you're passing an object literal — the cache keys on argument identity, so a fresh {} per render bypasses dedup. Pass primitives or hoist the object`
			});
		}
	};
} };
const CONSOLE_DEFERRABLE_METHODS = new Set([
	"log",
	"info",
	"warn"
]);
const ANALYTICS_DEFERRABLE_OBJECTS = new Set([
	"analytics",
	"posthog",
	"mixpanel",
	"segment",
	"amplitude",
	"datadog",
	"sentry"
]);
const ANALYTICS_DEFERRABLE_METHODS = new Set([
	"track",
	"identify",
	"page",
	"capture",
	"captureMessage",
	"captureException",
	"log"
]);
const isDeferrableSideEffectCall = (objectName, methodName) => {
	if (objectName === "console") return CONSOLE_DEFERRABLE_METHODS.has(methodName);
	if (ANALYTICS_DEFERRABLE_OBJECTS.has(objectName)) return ANALYTICS_DEFERRABLE_METHODS.has(methodName);
	return false;
};
const serverAfterNonblocking = { create: (context) => {
	let fileHasUseServerDirective = false;
	let serverFunctionDepth = 0;
	const enterIfServerFunction = (node) => {
		if (hasUseServerDirective(node)) serverFunctionDepth++;
	};
	const leaveIfServerFunction = (node) => {
		if (hasUseServerDirective(node)) serverFunctionDepth = Math.max(0, serverFunctionDepth - 1);
	};
	return {
		Program(programNode) {
			fileHasUseServerDirective = hasDirective(programNode, "use server");
		},
		FunctionDeclaration: enterIfServerFunction,
		"FunctionDeclaration:exit": leaveIfServerFunction,
		FunctionExpression: enterIfServerFunction,
		"FunctionExpression:exit": leaveIfServerFunction,
		ArrowFunctionExpression: enterIfServerFunction,
		"ArrowFunctionExpression:exit": leaveIfServerFunction,
		CallExpression(node) {
			if (!fileHasUseServerDirective && serverFunctionDepth === 0) return;
			if (node.callee?.type !== "MemberExpression") return;
			if (node.callee.property?.type !== "Identifier") return;
			const objectName = node.callee.object?.type === "Identifier" ? node.callee.object.name : null;
			if (!objectName) return;
			const methodName = node.callee.property.name;
			if (!isDeferrableSideEffectCall(objectName, methodName)) return;
			context.report({
				node,
				message: `${objectName}.${methodName}() in server action — wrap in \`after(() => ${objectName}.${methodName}(...))\` so it doesn't delay the user-visible response`
			});
		}
	};
} };
const ROUTE_HANDLER_HTTP_METHODS = new Set([
	"GET",
	"POST",
	"PUT",
	"PATCH",
	"DELETE",
	"OPTIONS",
	"HEAD"
]);
const STATIC_IO_FUNCTIONS = new Set([
	"readFileSync",
	"readFile",
	"readdir",
	"readdirSync",
	"stat",
	"statSync",
	"access",
	"accessSync"
]);
const isStaticIoCall = (call) => {
	if (call.type !== "CallExpression") return false;
	const callee = call.callee;
	if (callee?.type === "Identifier" && STATIC_IO_FUNCTIONS.has(callee.name)) return true;
	if (callee?.type !== "MemberExpression") return false;
	const propertyName = callee.property?.type === "Identifier" ? callee.property.name : null;
	if (!propertyName || !STATIC_IO_FUNCTIONS.has(propertyName)) return false;
	return true;
};
const isFetchOfImportMetaUrl = (call) => {
	if (call.type !== "CallExpression") return false;
	if (call.callee?.type !== "Identifier" || call.callee.name !== "fetch") return false;
	const arg = call.arguments?.[0];
	if (!arg) return false;
	if (arg.type !== "NewExpression") return false;
	if (arg.callee?.type !== "Identifier" || arg.callee.name !== "URL") return false;
	const secondArg = arg.arguments?.[1];
	if (!secondArg) return false;
	return secondArg.type === "MemberExpression" && secondArg.object?.type === "MetaProperty" && secondArg.property?.type === "Identifier" && secondArg.property.name === "url";
};
const callReadsHandlerArgs = (call, handlerParamNames) => {
	if (handlerParamNames.size === 0) return false;
	let referencesArg = false;
	walkAst(call, (child) => {
		if (referencesArg) return;
		if (child.type === "Identifier" && handlerParamNames.has(child.name)) referencesArg = true;
	});
	return referencesArg;
};
const DERIVING_ARRAY_METHODS = new Set([
	"toSorted",
	"toReversed",
	"filter",
	"map",
	"slice"
]);
const serverDedupProps = { create: (context) => ({ JSXOpeningElement(node) {
	const identifierAttributes = /* @__PURE__ */ new Map();
	const derivedAttributes = [];
	for (const attr of node.attributes ?? []) {
		if (attr.type !== "JSXAttribute") continue;
		if (attr.name?.type !== "JSXIdentifier") continue;
		if (attr.value?.type !== "JSXExpressionContainer") continue;
		const expression = attr.value.expression;
		if (!expression) continue;
		if (expression.type === "Identifier") identifierAttributes.set(expression.name, attr.name.name);
		else if (expression.type === "CallExpression") {
			const derivingMethod = getDerivingMethodName(expression);
			if (!derivingMethod || !DERIVING_ARRAY_METHODS.has(derivingMethod)) continue;
			const root = getRootIdentifierName(expression, { followCallChains: true });
			if (!root) continue;
			derivedAttributes.push({
				propName: attr.name.name,
				rootName: root,
				node: attr
			});
		}
	}
	for (const derived of derivedAttributes) {
		const sourcePropName = identifierAttributes.get(derived.rootName);
		if (sourcePropName) context.report({
			node: derived.node,
			message: `"${derived.propName}" is derived from "${sourcePropName}" (same source: ${derived.rootName}) — passing both doubles RSC serialization. Pass the source once and derive on the client`
		});
	}
} }) };
const getDerivingMethodName = (node) => {
	if (node.type !== "CallExpression") return null;
	if (node.callee?.type !== "MemberExpression") return null;
	if (node.callee.property?.type !== "Identifier") return null;
	return node.callee.property.name;
};
const PAGES_ROUTER_API_PATH_PATTERN = /\/pages\/api\//;
const inspectHandlerBody = (context, handlerBody, handlerLabel, handlerParamNames) => {
	walkAst(handlerBody, (child) => {
		let staticCall = null;
		if (isStaticIoCall(child)) staticCall = child;
		else if (isFetchOfImportMetaUrl(child)) staticCall = child;
		else if (child.type === "AwaitExpression" && child.argument && (isStaticIoCall(child.argument) || isFetchOfImportMetaUrl(child.argument))) staticCall = child.argument;
		if (!staticCall) return;
		if (callReadsHandlerArgs(staticCall, handlerParamNames)) return;
		const calleeText = staticCall.callee?.type === "MemberExpression" && staticCall.callee.property?.type === "Identifier" ? `${staticCall.callee.object?.type === "Identifier" ? staticCall.callee.object.name : "?"}.${staticCall.callee.property.name}` : staticCall.callee?.type === "Identifier" ? staticCall.callee.name : "io";
		context.report({
			node: staticCall,
			message: `${calleeText}() in ${handlerLabel} reads the same static asset every request — hoist to module scope so the read happens once at module load`
		});
	});
};
const collectIdentifierParams = (params) => {
	const names = /* @__PURE__ */ new Set();
	for (const param of params) if (param.type === "Identifier") names.add(param.name);
	return names;
};
const serverHoistStaticIo = { create: (context) => ({
	ExportNamedDeclaration(node) {
		const declaration = node.declaration;
		if (declaration?.type !== "FunctionDeclaration") return;
		const handlerName = declaration.id?.name;
		if (!handlerName || !ROUTE_HANDLER_HTTP_METHODS.has(handlerName)) return;
		if (declaration.body?.type !== "BlockStatement") return;
		inspectHandlerBody(context, declaration.body, `${handlerName} route handler`, collectIdentifierParams(declaration.params ?? []));
	},
	ExportDefaultDeclaration(node) {
		const filename = context.getFilename?.() ?? "";
		if (!PAGES_ROUTER_API_PATH_PATTERN.test(filename)) return;
		const declaration = node.declaration;
		if (!declaration || declaration.type !== "FunctionDeclaration" && declaration.type !== "FunctionExpression" && declaration.type !== "ArrowFunctionExpression") return;
		if (!declaration.async) return;
		const body = declaration.body;
		if (body?.type !== "BlockStatement") return;
		inspectHandlerBody(context, body, "pages/api handler", collectIdentifierParams(declaration.params ?? []));
	}
}) };
const collectDeclaredNames = (declaration) => {
	const names = /* @__PURE__ */ new Set();
	for (const declarator of declaration.declarations ?? []) if (declarator.id?.type === "Identifier") names.add(declarator.id.name);
	else if (declarator.id?.type === "ObjectPattern") {
		for (const property of declarator.id.properties ?? []) if (property.type === "Property" && property.value?.type === "Identifier") names.add(property.value.name);
		else if (property.type === "RestElement" && property.argument?.type === "Identifier") names.add(property.argument.name);
	} else if (declarator.id?.type === "ArrayPattern") {
		for (const element of declarator.id.elements ?? []) if (element?.type === "Identifier") names.add(element.name);
	}
	return names;
};
const declarationStartsWithAwait = (declaration) => {
	for (const declarator of declaration.declarations ?? []) if (declarator.init?.type === "AwaitExpression") return true;
	return false;
};
const declarationReadsAnyName = (declaration, names) => {
	if (names.size === 0) return false;
	let didRead = false;
	walkAst(declaration, (child) => {
		if (didRead) return;
		if (child.type === "Identifier" && names.has(child.name)) didRead = true;
	});
	return didRead;
};
const serverSequentialIndependentAwait = { create: (context) => {
	const inspectStatements = (statements) => {
		for (let statementIndex = 0; statementIndex < statements.length - 1; statementIndex++) {
			const currentStatement = statements[statementIndex];
			if (currentStatement.type !== "VariableDeclaration") continue;
			if (!declarationStartsWithAwait(currentStatement)) continue;
			const declaredNames = collectDeclaredNames(currentStatement);
			const nextStatement = statements[statementIndex + 1];
			if (nextStatement.type !== "VariableDeclaration") continue;
			if (!declarationStartsWithAwait(nextStatement)) continue;
			if (declarationReadsAnyName(nextStatement, declaredNames)) continue;
			context.report({
				node: nextStatement,
				message: "Sequential `await` without a data dependency on the previous result — wrap the independent calls in `Promise.all([...])` so they race instead of waterfalling"
			});
			statementIndex++;
		}
	};
	const visitFunctionBody = (node) => {
		if (!node.async) return;
		if (node.body?.type !== "BlockStatement") return;
		inspectStatements(node.body.body ?? []);
	};
	return {
		FunctionDeclaration: visitFunctionBody,
		FunctionExpression: visitFunctionBody,
		ArrowFunctionExpression: visitFunctionBody
	};
} };
const isFetchCall = (node) => {
	if (node.type !== "CallExpression") return false;
	return node.callee?.type === "Identifier" && node.callee.name === "fetch";
};
const objectExpressionHasNextRevalidate = (objectExpression) => {
	if (objectExpression.type !== "ObjectExpression") return false;
	for (const property of objectExpression.properties ?? []) {
		if (property.type !== "Property") continue;
		if (property.key?.type !== "Identifier") continue;
		if (property.key.name === "cache") return true;
		if (property.key.name !== "next") continue;
		if (property.value?.type !== "ObjectExpression") return true;
		for (const innerProperty of property.value.properties ?? []) {
			if (innerProperty.type !== "Property") continue;
			if (innerProperty.key?.type !== "Identifier") continue;
			if (innerProperty.key.name === "revalidate" || innerProperty.key.name === "tags") return true;
		}
		return true;
	}
	return false;
};
const APP_ROUTER_FILE_PATTERN = /\/app\/(?:[^/]+\/)*(?:route|page|layout|template|loading|error|default)\.(?:tsx?|jsx?)$/;
const NON_PROJECT_PATH_PATTERN = /\/(?:node_modules|dist|build|\.next)\//;
const serverFetchWithoutRevalidate = { create: (context) => {
	let isServerSideFile = false;
	return {
		Program(node) {
			const filename = context.getFilename?.() ?? "";
			if (!APP_ROUTER_FILE_PATTERN.test(filename)) {
				isServerSideFile = false;
				return;
			}
			if (NON_PROJECT_PATH_PATTERN.test(filename)) {
				isServerSideFile = false;
				return;
			}
			isServerSideFile = !(node.body ?? []).some((statement) => statement.type === "ExpressionStatement" && statement.expression?.type === "Literal" && statement.expression.value === "use client");
		},
		CallExpression(node) {
			if (!isServerSideFile) return;
			if (!isFetchCall(node)) return;
			const optionsArg = node.arguments?.[1];
			if (optionsArg && objectExpressionHasNextRevalidate(optionsArg)) return;
			const urlArg = node.arguments?.[0];
			const urlText = urlArg?.type === "Literal" && typeof urlArg.value === "string" ? `"${urlArg.value}"` : "url";
			context.report({
				node,
				message: `fetch(${urlText}) in a Server Component / route handler defaults to forever-caching — pass { next: { revalidate: <seconds> } } / { next: { tags: [...] } } / { cache: "no-store" } so stale data doesn't quietly persist`
			});
		}
	};
} };
//#endregion
//#region src/plugin/rules/tanstack-start.ts
const getRouteOptionsObject = (node) => {
	if (node.type !== "CallExpression") return null;
	const callee = node.callee;
	if (callee?.type === "CallExpression" && callee.callee?.type === "Identifier") {
		if (!TANSTACK_ROUTE_CREATION_FUNCTIONS.has(callee.callee.name)) return null;
		const optionsArgument = node.arguments?.[0];
		if (optionsArgument?.type === "ObjectExpression") return optionsArgument;
		return null;
	}
	if (callee?.type === "Identifier") {
		if (!TANSTACK_ROUTE_CREATION_FUNCTIONS.has(callee.name)) return null;
		const optionsArgument = node.arguments?.[0];
		if (optionsArgument?.type === "ObjectExpression") return optionsArgument;
		return null;
	}
	return null;
};
const getPropertyKeyName = (property) => {
	if (property.type !== "Property" && property.type !== "MethodDefinition") return null;
	if (property.key?.type === "Identifier") return property.key.name;
	if (property.key?.type === "Literal") return String(property.key.value);
	return null;
};
const walkServerFnChain = (outerNode) => {
	const result = {
		isServerFnChain: false,
		specifiedMethod: null,
		hasInputValidator: false
	};
	let currentNode = outerNode.callee?.object;
	while (currentNode?.type === "CallExpression") {
		const calleeName = getCalleeName(currentNode);
		if (calleeName && TANSTACK_SERVER_FN_NAMES.has(calleeName)) {
			result.isServerFnChain = true;
			const optionsArgument = currentNode.arguments?.[0];
			if (optionsArgument?.type === "ObjectExpression") {
				for (const property of optionsArgument.properties ?? []) if (property.key?.type === "Identifier" && property.key.name === "method" && property.value?.type === "Literal" && typeof property.value.value === "string") result.specifiedMethod = property.value.value;
			}
		}
		if (calleeName === "inputValidator") result.hasInputValidator = true;
		if (currentNode.callee?.type === "MemberExpression") currentNode = currentNode.callee.object;
		else break;
	}
	return result;
};
const tanstackStartRoutePropertyOrder = { create: (context) => ({ CallExpression(node) {
	const optionsObject = getRouteOptionsObject(node);
	if (!optionsObject) return;
	const properties = optionsObject.properties ?? [];
	const orderedPropertyNames = [];
	for (const property of properties) {
		const propertyName = getPropertyKeyName(property);
		if (propertyName !== null) orderedPropertyNames.push(propertyName);
	}
	const sensitiveProperties = orderedPropertyNames.filter((propertyName) => TANSTACK_ROUTE_PROPERTY_ORDER.includes(propertyName));
	let lastIndex = -1;
	for (const propertyName of sensitiveProperties) {
		const currentIndex = TANSTACK_ROUTE_PROPERTY_ORDER.indexOf(propertyName);
		if (currentIndex < lastIndex) {
			const expectedBefore = TANSTACK_ROUTE_PROPERTY_ORDER[lastIndex];
			context.report({
				node: optionsObject,
				message: `Route property "${propertyName}" must come before "${expectedBefore}" — wrong order breaks TypeScript type inference`
			});
			return;
		}
		lastIndex = currentIndex;
	}
} }) };
const tanstackStartNoDirectFetchInLoader = { create: (context) => ({ CallExpression(node) {
	const optionsObject = getRouteOptionsObject(node);
	if (!optionsObject) return;
	const properties = optionsObject.properties ?? [];
	for (const property of properties) {
		if (getPropertyKeyName(property) !== "loader") continue;
		walkAst(property.value ?? property, (child) => {
			if (child.type !== "CallExpression") return;
			if (child.callee?.type === "Identifier" && child.callee.name === "fetch") context.report({
				node: child,
				message: "Direct fetch() in route loader — use createServerFn() for type-safe server logic with automatic RPC"
			});
		});
	}
} }) };
const tanstackStartServerFnValidateInput = { create: (context) => ({ CallExpression(node) {
	if (node.callee?.type !== "MemberExpression") return;
	if (node.callee.property?.type !== "Identifier") return;
	if (node.callee.property.name !== "handler") return;
	const chainInfo = walkServerFnChain(node);
	if (!chainInfo.isServerFnChain) return;
	const handlerFunction = node.arguments?.[0];
	if (!handlerFunction) return;
	let accessesData = false;
	walkAst(handlerFunction, (child) => {
		if (child.type === "MemberExpression" && child.property?.type === "Identifier" && child.property.name === "data") accessesData = true;
		if (child.type === "ObjectPattern" && child.properties?.some((property) => property.key?.type === "Identifier" && property.key.name === "data")) accessesData = true;
	});
	if (accessesData && !chainInfo.hasInputValidator) context.report({
		node,
		message: "Server function handler accesses data without inputValidator() — validate inputs crossing the network boundary"
	});
} }) };
const tanstackStartNoUseEffectFetch = { create: (context) => ({ CallExpression(node) {
	const filename = context.getFilename?.() ?? "";
	if (!TANSTACK_ROUTE_FILE_PATTERN.test(filename)) return;
	if (!isHookCall(node, EFFECT_HOOK_NAMES)) return;
	const callback = node.arguments?.[0];
	if (!callback) return;
	let hasFetchCall = false;
	walkAst(callback, (child) => {
		if (hasFetchCall) return;
		if (child.type === "CallExpression" && child.callee?.type === "Identifier" && child.callee.name === "fetch") hasFetchCall = true;
	});
	if (hasFetchCall) context.report({
		node,
		message: "fetch() inside useEffect in a route file — use the route loader or createServerFn() instead"
	});
} }) };
const tanstackStartMissingHeadContent = { create: (context) => {
	let hasHeadContentElement = false;
	return {
		JSXOpeningElement(node) {
			const filename = context.getFilename?.() ?? "";
			if (!TANSTACK_ROOT_ROUTE_FILE_PATTERN.test(filename)) return;
			if (node.name?.type === "JSXIdentifier" && node.name.name === "HeadContent") hasHeadContentElement = true;
		},
		"Program:exit"(programNode) {
			const filename = context.getFilename?.() ?? "";
			if (!TANSTACK_ROOT_ROUTE_FILE_PATTERN.test(filename)) return;
			if (!hasHeadContentElement) context.report({
				node: programNode,
				message: "Root route (__root) without <HeadContent /> — route head() meta tags won't render"
			});
		}
	};
} };
const tanstackStartNoAnchorElement = { create: (context) => ({ JSXOpeningElement(node) {
	const filename = context.getFilename?.() ?? "";
	if (!TANSTACK_ROUTE_FILE_PATTERN.test(filename)) return;
	if (node.name?.type !== "JSXIdentifier" || node.name.name !== "a") return;
	const hrefAttribute = (node.attributes ?? []).find((attribute) => attribute.type === "JSXAttribute" && attribute.name?.type === "JSXIdentifier" && attribute.name.name === "href");
	if (!hrefAttribute?.value) return;
	let hrefValue = null;
	if (hrefAttribute.value.type === "Literal") hrefValue = hrefAttribute.value.value;
	else if (hrefAttribute.value.type === "JSXExpressionContainer" && hrefAttribute.value.expression?.type === "Literal") hrefValue = hrefAttribute.value.expression.value;
	if (typeof hrefValue === "string" && hrefValue.startsWith("/")) context.report({
		node,
		message: "Use <Link> from @tanstack/react-router instead of <a> for internal navigation — enables type-safe routing and preloading"
	});
} }) };
const tanstackStartServerFnMethodOrder = { create: (context) => ({ CallExpression(node) {
	if (node.callee?.type !== "MemberExpression") return;
	const methodNames = [];
	let currentNode = node;
	while (currentNode?.type === "CallExpression" && currentNode.callee?.type === "MemberExpression") {
		const methodName = currentNode.callee.property?.type === "Identifier" ? currentNode.callee.property.name : null;
		if (methodName) methodNames.unshift(methodName);
		currentNode = currentNode.callee.object;
	}
	if (currentNode?.type === "CallExpression" && currentNode.callee?.type === "Identifier") {
		if (!TANSTACK_SERVER_FN_NAMES.has(currentNode.callee.name)) return;
	} else return;
	const ownMethodName = node.callee.property?.type === "Identifier" ? node.callee.property.name : null;
	if (methodNames[methodNames.length - 1] !== ownMethodName) return;
	const orderSensitiveMethods = methodNames.filter((name) => TANSTACK_MIDDLEWARE_METHOD_ORDER.includes(name));
	let lastIndex = -1;
	for (const methodName of orderSensitiveMethods) {
		const currentIndex = TANSTACK_MIDDLEWARE_METHOD_ORDER.indexOf(methodName);
		if (currentIndex < lastIndex) {
			const expectedBefore = TANSTACK_MIDDLEWARE_METHOD_ORDER[lastIndex];
			context.report({
				node,
				message: `Server function method .${methodName}() must come before .${expectedBefore}() — wrong order breaks type inference`
			});
			return;
		}
		lastIndex = currentIndex;
	}
} }) };
const tanstackStartNoNavigateInRender = { create: (context) => {
	let deferredCallbackDepth = 0;
	let eventHandlerDepth = 0;
	const isDeferredHookCall = (node) => isHookCall(node, EFFECT_HOOK_NAMES) || isHookCall(node, "useCallback") || isHookCall(node, "useMemo");
	const isEventHandlerAttribute = (node) => node.name?.type === "JSXIdentifier" && typeof node.name.name === "string" && node.name.name.startsWith("on") && UPPERCASE_PATTERN.test(node.name.name.charAt(2));
	return {
		CallExpression(node) {
			const filename = context.getFilename?.() ?? "";
			if (!TANSTACK_ROUTE_FILE_PATTERN.test(filename)) return;
			if (isDeferredHookCall(node)) deferredCallbackDepth++;
			if (deferredCallbackDepth > 0 || eventHandlerDepth > 0) return;
			if (node.callee?.type === "Identifier" && node.callee.name === "navigate" && (node.arguments?.length ?? 0) > 0) context.report({
				node,
				message: "navigate() called during render — use redirect() in beforeLoad/loader for route-level redirects"
			});
		},
		"CallExpression:exit"(node) {
			const filename = context.getFilename?.() ?? "";
			if (!TANSTACK_ROUTE_FILE_PATTERN.test(filename)) return;
			if (isDeferredHookCall(node)) deferredCallbackDepth = Math.max(0, deferredCallbackDepth - 1);
		},
		JSXAttribute(node) {
			const filename = context.getFilename?.() ?? "";
			if (!TANSTACK_ROUTE_FILE_PATTERN.test(filename)) return;
			if (isEventHandlerAttribute(node)) eventHandlerDepth++;
		},
		"JSXAttribute:exit"(node) {
			const filename = context.getFilename?.() ?? "";
			if (!TANSTACK_ROUTE_FILE_PATTERN.test(filename)) return;
			if (isEventHandlerAttribute(node)) eventHandlerDepth = Math.max(0, eventHandlerDepth - 1);
		}
	};
} };
const tanstackStartNoDynamicServerFnImport = { create: (context) => ({ ImportExpression(node) {
	const source = node.source;
	if (!source) return;
	let importPath = null;
	if (source.type === "Literal" && typeof source.value === "string") importPath = source.value;
	else if (source.type === "TemplateLiteral" && source.quasis?.length === 1) importPath = source.quasis[0].value?.raw ?? null;
	if (importPath && TANSTACK_SERVER_FN_FILE_PATTERN.test(importPath)) context.report({
		node,
		message: "Dynamic import of server functions file — use static imports so the bundler can replace server code with RPC stubs"
	});
} }) };
const tanstackStartNoUseServerInHandler = { create: (context) => ({ CallExpression(node) {
	if (node.callee?.type !== "MemberExpression") return;
	if (node.callee.property?.type !== "Identifier" || node.callee.property.name !== "handler") return;
	const handlerFunction = node.arguments?.[0];
	if (!handlerFunction || handlerFunction.type !== "ArrowFunctionExpression" && handlerFunction.type !== "FunctionExpression") return;
	const body = handlerFunction.body;
	if (body?.type !== "BlockStatement") return;
	if (body.body?.some((statement) => statement.type === "ExpressionStatement" && (statement.directive === "use server" || statement.expression?.type === "Literal" && statement.expression.value === "use server"))) context.report({
		node: handlerFunction,
		message: "\"use server\" inside createServerFn handler — TanStack Start handles this automatically, remove the directive"
	});
} }) };
const SAFE_BUILD_ENV_VARS = new Set([
	"NODE_ENV",
	"MODE",
	"DEV",
	"PROD"
]);
const SECRET_KEYWORD_PATTERN = /(?:secret|token|api[_]?key|password|private)/i;
const isLikelySecret = (envVarName) => {
	if (SAFE_BUILD_ENV_VARS.has(envVarName)) return false;
	return SECRET_KEYWORD_PATTERN.test(envVarName);
};
const tanstackStartNoSecretsInLoader = { create: (context) => ({ CallExpression(node) {
	const optionsObject = getRouteOptionsObject(node);
	if (!optionsObject) return;
	const properties = optionsObject.properties ?? [];
	for (const property of properties) {
		const keyName = getPropertyKeyName(property);
		if (keyName !== "loader" && keyName !== "beforeLoad") continue;
		walkAst(property.value ?? property, (child) => {
			if (child.type !== "MemberExpression") return;
			const isProcessEnvAccess = child.object?.type === "MemberExpression" && child.object.object?.type === "Identifier" && child.object.object.name === "process" && child.object.property?.type === "Identifier" && child.object.property.name === "env";
			const isImportMetaEnvAccess = child.object?.type === "MemberExpression" && child.object.object?.type === "MetaProperty" && child.object.property?.type === "Identifier" && child.object.property.name === "env";
			if (!isProcessEnvAccess && !isImportMetaEnvAccess) return;
			const envVarName = child.property?.type === "Identifier" ? child.property.name : null;
			if (envVarName && isLikelySecret(envVarName)) {
				const envSource = isImportMetaEnvAccess ? "import.meta.env" : "process.env";
				context.report({
					node: child,
					message: `${envSource}.${envVarName} in ${keyName} — loaders are isomorphic and may leak secrets to the client. Move to a createServerFn()`
				});
			}
		});
	}
} }) };
const tanstackStartGetMutation = { create: (context) => ({ CallExpression(node) {
	if (node.callee?.type !== "MemberExpression") return;
	if (node.callee.property?.type !== "Identifier" || node.callee.property.name !== "handler") return;
	const chainInfo = walkServerFnChain(node);
	if (!chainInfo.isServerFnChain) return;
	if (chainInfo.specifiedMethod && MUTATING_HTTP_METHODS.has(chainInfo.specifiedMethod.toUpperCase())) return;
	const handlerFunction = node.arguments?.[0];
	if (!handlerFunction) return;
	const sideEffect = findSideEffect(handlerFunction);
	if (sideEffect) context.report({
		node,
		message: `GET server function has side effects (${sideEffect}) — use createServerFn({ method: 'POST' }) for mutations`
	});
} }) };
const tanstackStartRedirectInTryCatch = { create: (context) => {
	let tryBlockDepth = 0;
	let catchClauseDepth = 0;
	return {
		TryStatement() {
			tryBlockDepth++;
		},
		"TryStatement:exit"() {
			tryBlockDepth--;
		},
		CatchClause() {
			catchClauseDepth++;
		},
		"CatchClause:exit"() {
			catchClauseDepth--;
		},
		ThrowStatement(node) {
			if (tryBlockDepth === 0) return;
			if (catchClauseDepth > 0) return;
			const argument = node.argument;
			if (argument?.type !== "CallExpression") return;
			if (argument.callee?.type !== "Identifier") return;
			if (!TANSTACK_REDIRECT_FUNCTIONS.has(argument.callee.name)) return;
			context.report({
				node,
				message: `throw ${argument.callee.name}() inside try block — the router catches this internally. Move it outside the try block or re-throw in the catch`
			});
		}
	};
} };
const hasTopLevelAwait = (statement) => {
	if (statement.type === "VariableDeclaration") return statement.declarations?.some((declarator) => declarator.init?.type === "AwaitExpression");
	if (statement.type === "ExpressionStatement") return statement.expression?.type === "AwaitExpression" || statement.expression?.type === "AssignmentExpression" && statement.expression.right?.type === "AwaitExpression";
	if (statement.type === "ReturnStatement") return statement.argument?.type === "AwaitExpression";
	if (statement.type === "ForOfStatement" && statement.await) return true;
	return false;
};
const tanstackStartLoaderParallelFetch = { create: (context) => ({ CallExpression(node) {
	const optionsObject = getRouteOptionsObject(node);
	if (!optionsObject) return;
	const properties = optionsObject.properties ?? [];
	for (const property of properties) {
		if (getPropertyKeyName(property) !== "loader") continue;
		const loaderValue = property.value;
		if (!loaderValue || loaderValue.type !== "ArrowFunctionExpression" && loaderValue.type !== "FunctionExpression") continue;
		const functionBody = loaderValue.body;
		if (!functionBody || functionBody.type !== "BlockStatement") continue;
		let sequentialAwaitCount = 0;
		for (const statement of functionBody.body ?? []) {
			if (hasTopLevelAwait(statement)) sequentialAwaitCount++;
			if (sequentialAwaitCount >= 2) {
				context.report({
					node: property,
					message: "Multiple sequential awaits in loader — use Promise.all() to fetch data in parallel and avoid waterfalls"
				});
				break;
			}
		}
	}
} }) };
//#endregion
//#region src/plugin/rules/state-and-effects.ts
const collectValueIdentifierNames = (node, into) => {
	if (!node || typeof node !== "object") return;
	if (node.type === "CallExpression") {
		if (node.callee?.type === "MemberExpression") {
			const rootName = getRootIdentifierName(node.callee);
			if (!rootName || !BUILTIN_GLOBAL_NAMESPACE_NAMES.has(rootName)) collectValueIdentifierNames(node.callee.object, into);
		}
		for (const argument of node.arguments ?? []) collectValueIdentifierNames(argument, into);
		return;
	}
	if (node.type === "MemberExpression") {
		const rootName = getRootIdentifierName(node);
		if (!rootName || !BUILTIN_GLOBAL_NAMESPACE_NAMES.has(rootName)) collectValueIdentifierNames(node.object, into);
		if (node.computed) collectValueIdentifierNames(node.property, into);
		return;
	}
	if (node.type === "Identifier") {
		into.push(node.name);
		return;
	}
	for (const key of Object.keys(node)) {
		if (key === "parent" || key === "type") continue;
		const child = node[key];
		if (Array.isArray(child)) {
			for (const item of child) if (item && typeof item === "object" && item.type) collectValueIdentifierNames(item, into);
		} else if (child && typeof child === "object" && child.type) collectValueIdentifierNames(child, into);
	}
};
const noDerivedStateEffect = { create: (context) => ({ CallExpression(node) {
	if (!isHookCall(node, EFFECT_HOOK_NAMES) || (node.arguments?.length ?? 0) < 2) return;
	const callback = getEffectCallback(node);
	if (!callback) return;
	const depsNode = node.arguments[1];
	if (depsNode.type !== "ArrayExpression" || !depsNode.elements?.length) return;
	const dependencyNames = new Set(depsNode.elements.filter((element) => element?.type === "Identifier").map((element) => element.name));
	if (dependencyNames.size === 0) return;
	const statements = getCallbackStatements(callback);
	if (statements.length === 0) return;
	if (!statements.every((statement) => {
		if (statement.type !== "ExpressionStatement") return false;
		return isSetterCall(statement.expression);
	})) return;
	let allArgumentsDeriveFromDeps = true;
	let hasAnyDependencyReference = false;
	let hasExpensiveDerivation = false;
	for (const statement of statements) {
		const setStateArguments = statement.expression.arguments;
		if (!setStateArguments?.length) continue;
		const valueIdentifierNames = [];
		collectValueIdentifierNames(setStateArguments[0], valueIdentifierNames);
		walkAst(setStateArguments[0], (child) => {
			if (child.type !== "CallExpression") return;
			if (child.callee?.type === "MemberExpression") {
				const rootName = getRootIdentifierName(child.callee);
				if (rootName && BUILTIN_GLOBAL_NAMESPACE_NAMES.has(rootName)) return;
				hasExpensiveDerivation = true;
				return;
			}
			if (child.callee?.type === "Identifier") {
				const calleeName = child.callee.name;
				if (!TRIVIAL_DERIVATION_CALLEE_NAMES.has(calleeName) && !isSetterIdentifier(calleeName)) hasExpensiveDerivation = true;
			}
		});
		const nonSetterIdentifiers = valueIdentifierNames.filter((name) => !isSetterIdentifier(name));
		if (nonSetterIdentifiers.some((name) => dependencyNames.has(name))) hasAnyDependencyReference = true;
		if (nonSetterIdentifiers.some((name) => !dependencyNames.has(name))) {
			allArgumentsDeriveFromDeps = false;
			break;
		}
	}
	if (!allArgumentsDeriveFromDeps) return;
	if (hasExpensiveDerivation) hasAnyDependencyReference = true;
	let message;
	if (!hasAnyDependencyReference) message = "State reset in useEffect — use a key prop to reset component state when props change";
	else if (hasExpensiveDerivation) message = "Derived state in useEffect — wrap the calculation in useMemo([deps]) (or compute it directly during render if it isn't expensive)";
	else message = "Derived state in useEffect — compute during render instead";
	context.report({
		node,
		message
	});
} }) };
const noFetchInEffect = { create: (context) => ({ CallExpression(node) {
	if (!isHookCall(node, EFFECT_HOOK_NAMES)) return;
	const callback = getEffectCallback(node);
	if (!callback) return;
	if (containsFetchCall(callback)) context.report({
		node,
		message: "fetch() inside useEffect — use a data fetching library (react-query, SWR) or server component"
	});
} }) };
const noCascadingSetState = { create: (context) => ({ CallExpression(node) {
	if (!isHookCall(node, EFFECT_HOOK_NAMES)) return;
	const callback = getEffectCallback(node);
	if (!callback) return;
	const setStateCallCount = countSetStateCalls(callback);
	if (setStateCallCount >= 3) context.report({
		node,
		message: `${setStateCallCount} setState calls in a single useEffect — consider using useReducer or deriving state`
	});
} }) };
const noEffectEventHandler = { create: (context) => ({ CallExpression(node) {
	if (!isHookCall(node, EFFECT_HOOK_NAMES) || (node.arguments?.length ?? 0) < 2) return;
	const callback = getEffectCallback(node);
	if (!callback) return;
	const depsNode = node.arguments[1];
	if (depsNode.type !== "ArrayExpression" || !depsNode.elements?.length) return;
	const dependencyNames = new Set(depsNode.elements.filter((element) => element?.type === "Identifier").map((element) => element.name));
	const statements = getCallbackStatements(callback);
	if (statements.length !== 1) return;
	const soleStatement = statements[0];
	if (soleStatement.type !== "IfStatement") return;
	const rootIdentifierName = getRootIdentifierName(soleStatement.test);
	if (!rootIdentifierName || !dependencyNames.has(rootIdentifierName)) return;
	context.report({
		node,
		message: "useEffect simulating an event handler — move logic to an actual event handler instead"
	});
} }) };
const noDerivedUseState = { create: (context) => {
	const propStackTracker = createComponentPropStackTracker();
	return {
		...propStackTracker.visitors,
		CallExpression(node) {
			if (!isHookCall(node, "useState") || !node.arguments?.length) return;
			const initializer = node.arguments[0];
			if (initializer.type === "Identifier" && propStackTracker.isPropName(initializer.name)) {
				context.report({
					node,
					message: `useState initialized from prop "${initializer.name}" — if this value should stay in sync with the prop, derive it during render instead`
				});
				return;
			}
			if (initializer.type === "MemberExpression" && !initializer.computed) {
				const rootIdentifierName = getRootIdentifierName(initializer);
				if (rootIdentifierName && propStackTracker.isPropName(rootIdentifierName)) context.report({
					node,
					message: `useState initialized from prop "${rootIdentifierName}" — if this value should stay in sync with the prop, derive it during render instead`
				});
			}
		}
	};
} };
const preferUseReducer = { create: (context) => {
	const reportExcessiveUseState = (body, componentName) => {
		if (body.type !== "BlockStatement") return;
		let useStateCount = 0;
		for (const statement of body.body ?? []) {
			if (statement.type !== "VariableDeclaration") continue;
			for (const declarator of statement.declarations ?? []) if (isHookCall(declarator.init, "useState")) useStateCount++;
		}
		if (useStateCount >= 5) context.report({
			node: body,
			message: `Component "${componentName}" has ${useStateCount} useState calls — consider useReducer for related state`
		});
	};
	return {
		FunctionDeclaration(node) {
			if (!node.id?.name || !isUppercaseName(node.id.name)) return;
			reportExcessiveUseState(node.body, node.id.name);
		},
		VariableDeclarator(node) {
			if (!isComponentAssignment(node)) return;
			reportExcessiveUseState(node.init.body, node.id.name);
		}
	};
} };
const rerenderLazyStateInit = { create: (context) => ({ CallExpression(node) {
	if (!isHookCall(node, "useState") || !node.arguments?.length) return;
	const initializer = node.arguments[0];
	if (initializer.type !== "CallExpression") return;
	const calleeName = initializer.callee?.type === "Identifier" ? initializer.callee.name : initializer.callee?.property?.name ?? "fn";
	if (TRIVIAL_INITIALIZER_NAMES.has(calleeName)) return;
	context.report({
		node: initializer,
		message: `useState(${calleeName}()) calls initializer on every render — use useState(() => ${calleeName}()) for lazy initialization`
	});
} }) };
const STATE_ARITHMETIC_OPERATORS = new Set([
	"+",
	"-",
	"*",
	"/",
	"%",
	"**"
]);
const deriveStateVariableName = (setterName) => {
	if (!setterName.startsWith("set") || setterName.length < 4) return null;
	return setterName.charAt(3).toLowerCase() + setterName.slice(4);
};
const rerenderFunctionalSetstate = { create: (context) => ({ CallExpression(node) {
	if (!isSetterCall(node)) return;
	if (!node.arguments?.length) return;
	const calleeName = node.callee.name;
	const argument = node.arguments[0];
	const expectedStateName = deriveStateVariableName(calleeName);
	if (argument.type === "BinaryExpression" && STATE_ARITHMETIC_OPERATORS.has(argument.operator) && expectedStateName) {
		const matchesExpected = (operand) => operand?.type === "Identifier" && operand.name === expectedStateName;
		const stateIdentifier = matchesExpected(argument.left) ? argument.left : matchesExpected(argument.right) ? argument.right : null;
		if (stateIdentifier) {
			context.report({
				node,
				message: `${calleeName}(${stateIdentifier.name} ${argument.operator} ...) — use functional update to avoid stale closures`
			});
			return;
		}
	}
	if (argument.type === "UpdateExpression" && (argument.operator === "++" || argument.operator === "--") && argument.argument?.type === "Identifier" && argument.argument.name === expectedStateName) {
		const display = argument.prefix ? `${argument.operator}${argument.argument.name}` : `${argument.argument.name}${argument.operator}`;
		context.report({
			node,
			message: `${calleeName}(${display}) — use functional update to avoid stale closures (and reading the post-increment value bug)`
		});
		return;
	}
	if (expectedStateName && argument.type === "ArrayExpression") {
		if ((argument.elements ?? []).some((element) => element?.type === "SpreadElement" && element.argument?.type === "Identifier" && element.argument.name === expectedStateName)) {
			context.report({
				node,
				message: `${calleeName}([...${expectedStateName}, ...]) — use functional update \`${calleeName}(prev => [...prev, ...])\` to avoid stale closures`
			});
			return;
		}
	}
	if (expectedStateName && argument.type === "ObjectExpression") {
		if ((argument.properties ?? []).some((property) => property?.type === "SpreadElement" && property.argument?.type === "Identifier" && property.argument.name === expectedStateName)) {
			context.report({
				node,
				message: `${calleeName}({ ...${expectedStateName}, ... }) — use functional update \`${calleeName}(prev => ({ ...prev, ... }))\` to avoid stale closures`
			});
			return;
		}
	}
} }) };
const rerenderDependencies = { create: (context) => ({ CallExpression(node) {
	if (!isHookCall(node, HOOKS_WITH_DEPS) || node.arguments.length < 2) return;
	const depsNode = node.arguments[1];
	if (depsNode.type !== "ArrayExpression") return;
	for (const element of depsNode.elements ?? []) {
		if (!element) continue;
		if (element.type === "ObjectExpression") context.report({
			node: element,
			message: "Object literal in useEffect deps — creates new reference every render, causing infinite re-runs"
		});
		if (element.type === "ArrayExpression") context.report({
			node: element,
			message: "Array literal in useEffect deps — creates new reference every render, causing infinite re-runs"
		});
		if (element.type === "ArrowFunctionExpression" || element.type === "FunctionExpression") context.report({
			node: element,
			message: "Inline function in useEffect deps — creates a new function reference every render, causing infinite re-runs. Hoist it out of the component or wrap it with useCallback"
		});
	}
} }) };
const noPropCallbackInEffect = { create: (context) => {
	const propStackTracker = createComponentPropStackTracker();
	return {
		...propStackTracker.visitors,
		CallExpression(node) {
			if (!isHookCall(node, EFFECT_HOOK_NAMES) || (node.arguments?.length ?? 0) < 2) return;
			const callback = getEffectCallback(node);
			if (!callback) return;
			const depsNode = node.arguments[1];
			if (depsNode.type !== "ArrayExpression" || !depsNode.elements?.length) return;
			if (!depsNode.elements.some((element) => element?.type === "Identifier" && !propStackTracker.isPropName(element.name))) return;
			const reportedNodes = /* @__PURE__ */ new Set();
			walkInsideStatementBlocks(callback.body, (child) => {
				if (child.type !== "CallExpression") return;
				if (child.callee?.type !== "Identifier") return;
				const calleeName = child.callee.name;
				if (!propStackTracker.isPropName(calleeName)) return;
				if (reportedNodes.has(child)) return;
				reportedNodes.add(child);
				context.report({
					node: child,
					message: `useEffect calls prop callback "${calleeName}" with local state in deps — this is the "lift state via callback" anti-pattern; lift state into a shared Provider so both sides read the same source`
				});
			});
		}
	};
} };
const noEffectEventInDeps = { create: (context) => {
	const componentBindings = createComponentBindingStackTracker({ onVariableDeclarator: (declaratorNode) => {
		if (declaratorNode.id?.type !== "Identifier") return;
		const initializer = declaratorNode.init;
		if (!initializer || initializer.type !== "CallExpression") return;
		if (!isHookCall(initializer, "useEffectEvent")) return;
		componentBindings.addBindingToCurrentFrame(declaratorNode.id.name);
	} });
	return {
		...componentBindings.visitors,
		CallExpression(node) {
			if (!isHookCall(node, HOOKS_WITH_DEPS) || node.arguments.length < 2) return;
			if (!componentBindings.isInsideComponent()) return;
			const depsNode = node.arguments[1];
			if (depsNode.type !== "ArrayExpression") return;
			for (const element of depsNode.elements ?? []) {
				if (element?.type !== "Identifier") continue;
				if (componentBindings.isBoundName(element.name)) context.report({
					node: element,
					message: `"${element.name}" is from useEffectEvent and must not be in the deps array — its identity is intentionally unstable; call it inside the effect without listing it`
				});
			}
		}
	};
} };
const collectUseStateBindings = (componentBody) => {
	const bindings = [];
	if (componentBody?.type !== "BlockStatement") return bindings;
	for (const statement of componentBody.body ?? []) {
		if (statement.type !== "VariableDeclaration") continue;
		for (const declarator of statement.declarations ?? []) {
			if (declarator.id?.type !== "ArrayPattern") continue;
			const elements = declarator.id.elements ?? [];
			if (elements.length < 2) continue;
			const valueElement = elements[0];
			const setterElement = elements[1];
			if (valueElement?.type !== "Identifier" || setterElement?.type !== "Identifier" || !isSetterIdentifier(setterElement.name)) continue;
			if (declarator.init?.type !== "CallExpression") continue;
			if (!isHookCall(declarator.init, "useState")) continue;
			bindings.push({
				valueName: valueElement.name,
				setterName: setterElement.name,
				declarator
			});
		}
	}
	return bindings;
};
const collectReturnExpressions = (componentBody) => {
	if (componentBody?.type !== "BlockStatement") return [];
	const returns = [];
	for (const statement of componentBody.body ?? []) {
		if (statement.type === "ReturnStatement" && statement.argument) {
			returns.push(statement.argument);
			continue;
		}
		walkInsideStatementBlocks(statement, (child) => {
			if (child.type === "ReturnStatement" && child.argument) returns.push(child.argument);
		});
	}
	return returns;
};
const collectIdentifierNames = (expression) => {
	const names = /* @__PURE__ */ new Set();
	walkAst(expression, (child) => {
		if (child.type === "Identifier") names.add(child.name);
	});
	return names;
};
const buildLocalDependencyGraph = (componentBody) => {
	const graph = /* @__PURE__ */ new Map();
	if (componentBody?.type !== "BlockStatement") return graph;
	const declaredNames = /* @__PURE__ */ new Set();
	for (const statement of componentBody.body ?? []) {
		if (statement.type !== "VariableDeclaration") continue;
		for (const declarator of statement.declarations ?? []) {
			if (!declarator.init) continue;
			const dependencyNames = collectIdentifierNames(declarator.init);
			declaredNames.clear();
			collectPatternNames(declarator.id, declaredNames);
			for (const declaredName of declaredNames) {
				const existing = graph.get(declaredName);
				if (existing === void 0) graph.set(declaredName, new Set(dependencyNames));
				else for (const dependencyName of dependencyNames) existing.add(dependencyName);
			}
		}
	}
	return graph;
};
const collectRenderReachableNames = (returnExpressions) => {
	const names = /* @__PURE__ */ new Set();
	for (const expression of returnExpressions) walkAst(expression, (child) => {
		if (child.type === "Identifier") names.add(child.name);
	});
	return names;
};
const expandTransitiveDependencies = (seedNames, dependencyGraph) => {
	const reachable = new Set(seedNames);
	const queue = Array.from(seedNames);
	while (queue.length > 0) {
		const currentName = queue.pop();
		if (currentName === void 0) continue;
		const dependencyNames = dependencyGraph.get(currentName);
		if (!dependencyNames) continue;
		for (const dependencyName of dependencyNames) {
			if (reachable.has(dependencyName)) continue;
			reachable.add(dependencyName);
			queue.push(dependencyName);
		}
	}
	return reachable;
};
const rerenderStateOnlyInHandlers = { create: (context) => {
	const checkComponent = (componentBody) => {
		if (!componentBody || componentBody.type !== "BlockStatement") return;
		const bindings = collectUseStateBindings(componentBody);
		if (bindings.length === 0) return;
		const returnExpressions = collectReturnExpressions(componentBody);
		if (returnExpressions.length === 0) return;
		const dependencyGraph = buildLocalDependencyGraph(componentBody);
		const renderReachableNames = expandTransitiveDependencies(collectRenderReachableNames(returnExpressions), dependencyGraph);
		for (const binding of bindings) {
			if (renderReachableNames.has(binding.valueName)) continue;
			let setterCalled = false;
			walkAst(componentBody, (child) => {
				if (setterCalled) return;
				if (child.type === "CallExpression" && child.callee?.type === "Identifier" && child.callee.name === binding.setterName) setterCalled = true;
			});
			if (!setterCalled) continue;
			context.report({
				node: binding.declarator,
				message: `useState "${binding.valueName}" is updated but never read in the component's return — use useRef so updates don't trigger re-renders`
			});
		}
	};
	return {
		FunctionDeclaration(node) {
			if (!node.id?.name || !isUppercaseName(node.id.name)) return;
			checkComponent(node.body);
		},
		VariableDeclarator(node) {
			if (!isComponentAssignment(node)) return;
			checkComponent(node.init?.body);
		}
	};
} };
const advancedEventHandlerRefs = { create: (context) => ({ CallExpression(node) {
	if (!isHookCall(node, EFFECT_HOOK_NAMES)) return;
	if ((node.arguments?.length ?? 0) < 2) return;
	const callback = getEffectCallback(node);
	if (!callback) return;
	const depsNode = node.arguments[1];
	if (depsNode.type !== "ArrayExpression" || !depsNode.elements?.length) return;
	const depIdentifierNames = /* @__PURE__ */ new Set();
	for (const element of depsNode.elements) if (element?.type === "Identifier") depIdentifierNames.add(element.name);
	if (depIdentifierNames.size === 0) return;
	let registeredHandlerName = null;
	walkAst(callback.body, (child) => {
		if (registeredHandlerName) return;
		if (child.type !== "CallExpression") return;
		if (child.callee?.type !== "MemberExpression") return;
		if (child.callee.property?.type !== "Identifier") return;
		if (!SUBSCRIPTION_METHOD_NAMES.has(child.callee.property.name)) return;
		const handlerArg = child.arguments?.[1];
		if (handlerArg?.type !== "Identifier") return;
		if (depIdentifierNames.has(handlerArg.name)) registeredHandlerName = handlerArg.name;
	});
	if (registeredHandlerName) context.report({
		node,
		message: `useEffect re-subscribes a "${registeredHandlerName}" listener every time the handler identity changes — store the handler in a ref and have the listener read \`handlerRef.current()\`, then drop it from the deps`
	});
} }) };
const DEFERRABLE_HOOK_NAMES = new Set([
	"useSearchParams",
	"useParams",
	"usePathname"
]);
const findHookCallBindings = (componentBody) => {
	const bindings = [];
	if (componentBody?.type !== "BlockStatement") return bindings;
	for (const statement of componentBody.body ?? []) {
		if (statement.type !== "VariableDeclaration") continue;
		for (const declarator of statement.declarations ?? []) {
			if (declarator.id?.type !== "Identifier") continue;
			if (declarator.init?.type !== "CallExpression") continue;
			const callee = declarator.init.callee;
			if (callee?.type !== "Identifier") continue;
			if (!DEFERRABLE_HOOK_NAMES.has(callee.name)) continue;
			bindings.push({
				valueName: declarator.id.name,
				hookName: callee.name,
				declarator
			});
		}
	}
	return bindings;
};
const collectHandlerBindingNames = (componentBody) => {
	const handlerNames = /* @__PURE__ */ new Set();
	walkAst(componentBody, (child) => {
		if (child.type !== "JSXAttribute") return;
		if (child.name?.type !== "JSXIdentifier") return;
		if (!/^on[A-Z]/.test(child.name.name)) return;
		if (child.value?.type !== "JSXExpressionContainer") return;
		const expression = child.value.expression;
		if (expression?.type === "Identifier") handlerNames.add(expression.name);
	});
	return handlerNames;
};
const isInsideEventHandler = (node, handlerBindingNames) => {
	let cursor = node.parent ?? null;
	while (cursor) {
		if (cursor.type === "ArrowFunctionExpression" || cursor.type === "FunctionExpression" || cursor.type === "FunctionDeclaration") {
			let outer = cursor.parent ?? null;
			while (outer) {
				if (outer.type === "JSXAttribute") {
					const attrName = outer.name?.type === "JSXIdentifier" ? outer.name.name : null;
					if (attrName && /^on[A-Z]/.test(attrName)) return true;
					return false;
				}
				if (outer.type === "VariableDeclarator") {
					const declaredName = outer.id?.type === "Identifier" ? outer.id.name : null;
					return Boolean(declaredName && handlerBindingNames.has(declaredName));
				}
				if (outer.type === "Program") return false;
				outer = outer.parent ?? null;
			}
			return false;
		}
		cursor = cursor.parent ?? null;
	}
	return false;
};
const rerenderDeferReadsHook = { create: (context) => {
	const checkComponent = (componentBody) => {
		if (!componentBody || componentBody.type !== "BlockStatement") return;
		const bindings = findHookCallBindings(componentBody);
		if (bindings.length === 0) return;
		const handlerBindingNames = collectHandlerBindingNames(componentBody);
		for (const binding of bindings) {
			const referenceLocations = [];
			walkAst(componentBody, (child) => {
				if (child === binding.declarator.id) return;
				if (child.type === "Identifier" && child.name === binding.valueName) referenceLocations.push(child);
			});
			if (referenceLocations.length === 0) continue;
			if (!referenceLocations.every((ref) => isInsideEventHandler(ref, handlerBindingNames))) continue;
			context.report({
				node: binding.declarator,
				message: `${binding.hookName}() return is only read inside event handlers — defer the read into the handler (e.g. \`new URL(window.location.href).searchParams\`) so the component doesn't re-render on every URL change`
			});
		}
	};
	return {
		FunctionDeclaration(node) {
			if (!node.id?.name || !isUppercaseName(node.id.name)) return;
			checkComponent(node.body);
		},
		VariableDeclarator(node) {
			if (!isComponentAssignment(node)) return;
			checkComponent(node.init?.body);
		}
	};
} };
const collectFunctionLocalBindings = (functionNode) => {
	const localBindings = /* @__PURE__ */ new Set();
	for (const param of functionNode.params ?? []) collectPatternNames(param, localBindings);
	if (functionNode.body?.type === "BlockStatement") for (const statement of functionNode.body.body ?? []) {
		if (statement.type !== "VariableDeclaration") continue;
		for (const declarator of statement.declarations ?? []) collectPatternNames(declarator.id, localBindings);
	}
	return localBindings;
};
const isFunctionLikeNode = (node) => node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression";
const walkComponentRespectingShadows = (node, shadowedStateNames, visit) => {
	if (!node || typeof node !== "object") return;
	let nextShadowedStateNames = shadowedStateNames;
	if (isFunctionLikeNode(node)) {
		const localBindings = collectFunctionLocalBindings(node);
		if (localBindings.size > 0) {
			const merged = new Set(shadowedStateNames);
			for (const localName of localBindings) merged.add(localName);
			nextShadowedStateNames = merged;
		}
	}
	visit(node, shadowedStateNames);
	for (const key of Object.keys(node)) {
		if (key === "parent") continue;
		const child = node[key];
		if (Array.isArray(child)) {
			for (const item of child) if (item && typeof item === "object" && item.type) walkComponentRespectingShadows(item, nextShadowedStateNames, visit);
		} else if (child && typeof child === "object" && child.type) walkComponentRespectingShadows(child, nextShadowedStateNames, visit);
	}
};
const noDirectStateMutation = { create: (context) => {
	const checkComponent = (componentBody) => {
		if (!componentBody || componentBody.type !== "BlockStatement") return;
		const bindings = collectUseStateBindings(componentBody);
		if (bindings.length === 0) return;
		const stateValueToSetter = new Map(bindings.map((binding) => [binding.valueName, binding.setterName]));
		walkComponentRespectingShadows(componentBody, /* @__PURE__ */ new Set(), (child, currentlyShadowed) => {
			if (child.type === "AssignmentExpression") {
				if (child.left?.type !== "MemberExpression") return;
				const rootName = getRootIdentifierName(child.left);
				if (!rootName || !stateValueToSetter.has(rootName)) return;
				if (currentlyShadowed.has(rootName)) return;
				const setterName = stateValueToSetter.get(rootName);
				context.report({
					node: child,
					message: `Direct property assignment on useState value "${rootName}" — call ${setterName} with a new value; React only re-renders on a new reference`
				});
				return;
			}
			if (child.type === "CallExpression") {
				const callee = child.callee;
				if (callee?.type !== "MemberExpression") return;
				if (callee.property?.type !== "Identifier") return;
				const methodName = callee.property.name;
				if (!MUTATING_ARRAY_METHODS.has(methodName)) return;
				const rootName = getRootIdentifierName(callee.object);
				if (!rootName || !stateValueToSetter.has(rootName)) return;
				if (currentlyShadowed.has(rootName)) return;
				const setterName = stateValueToSetter.get(rootName);
				context.report({
					node: child,
					message: `In-place mutation of useState value "${rootName}" via .${methodName}() — call ${setterName} with a new array; React only re-renders on a new reference`
				});
			}
		});
	};
	return {
		FunctionDeclaration(node) {
			if (!node.id?.name || !isUppercaseName(node.id.name)) return;
			checkComponent(node.body);
		},
		VariableDeclarator(node) {
			if (!isComponentAssignment(node)) return;
			checkComponent(node.init?.body);
		}
	};
} };
const isUnconditionalSetterCallStatement = (statement, setterNames) => {
	if (statement.type !== "ExpressionStatement") return null;
	const expression = statement.expression;
	if (expression?.type !== "CallExpression") return null;
	const callee = expression.callee;
	if (callee?.type !== "Identifier") return null;
	if (!setterNames.has(callee.name)) return null;
	return expression;
};
const noSetStateInRender = { create: (context) => {
	const checkComponent = (componentBody) => {
		if (!componentBody || componentBody.type !== "BlockStatement") return;
		const setterNames = new Set(collectUseStateBindings(componentBody).map((binding) => binding.setterName));
		if (setterNames.size === 0) return;
		for (const statement of componentBody.body ?? []) {
			const setterCall = isUnconditionalSetterCallStatement(statement, setterNames);
			if (!setterCall) continue;
			const setterIdentifierName = setterCall.callee.name;
			context.report({
				node: setterCall,
				message: `${setterIdentifierName}() called unconditionally at the top of render — causes an infinite re-render loop. Move into a useEffect or an event handler. (To derive state from props, guard the call: \`if (prev !== prop) ${setterIdentifierName}(prop)\`)`
			});
		}
	};
	return {
		FunctionDeclaration(node) {
			if (!node.id?.name || !isUppercaseName(node.id.name)) return;
			checkComponent(node.body);
		},
		VariableDeclarator(node) {
			if (!isComponentAssignment(node)) return;
			checkComponent(node.init?.body);
		}
	};
} };
const findUseEffectsInComponent = (componentBody) => {
	const effectCalls = [];
	if (componentBody?.type !== "BlockStatement") return effectCalls;
	for (const statement of componentBody.body ?? []) walkAst(statement, (child) => {
		if (child.type === "CallExpression" && isHookCall(child, EFFECT_HOOK_NAMES)) effectCalls.push(child);
	});
	return effectCalls;
};
const findSubscriptionCall = (effectBodyStatements) => {
	for (const statement of effectBodyStatements) {
		if (statement.type === "VariableDeclaration") for (const declarator of statement.declarations ?? []) {
			const init = declarator.init;
			if (init?.type !== "CallExpression") continue;
			if (init.callee?.type !== "MemberExpression") continue;
			if (init.callee.property?.type !== "Identifier") continue;
			if (!SUBSCRIPTION_METHOD_NAMES.has(init.callee.property.name)) continue;
			return {
				call: init,
				boundUnsubscribeName: declarator.id?.type === "Identifier" ? declarator.id.name : null
			};
		}
		if (statement.type === "ExpressionStatement") {
			const expression = statement.expression;
			if (expression?.type !== "CallExpression") continue;
			if (expression.callee?.type !== "MemberExpression") continue;
			if (expression.callee.property?.type !== "Identifier") continue;
			if (!SUBSCRIPTION_METHOD_NAMES.has(expression.callee.property.name)) continue;
			return {
				call: expression,
				boundUnsubscribeName: null
			};
		}
	}
	return null;
};
const getSubscriptionHandlerArgument = (subscribeCall, effectBodyStatements) => {
	for (const argument of subscribeCall.arguments ?? []) {
		if (argument.type === "ArrowFunctionExpression" || argument.type === "FunctionExpression") return argument;
		if (argument.type === "Identifier") for (const statement of effectBodyStatements) {
			if (statement.type !== "VariableDeclaration") continue;
			for (const declarator of statement.declarations ?? []) {
				if (declarator.id?.type !== "Identifier") continue;
				if (declarator.id.name !== argument.name) continue;
				const init = declarator.init;
				if (init?.type === "ArrowFunctionExpression" || init?.type === "FunctionExpression") return init;
			}
		}
	}
	return null;
};
const getSingleSetterCallFromHandler = (handler) => {
	const handlerStatements = getCallbackStatements(handler);
	if (handlerStatements.length !== 1) return null;
	const onlyStatement = handlerStatements[0];
	const expression = onlyStatement.type === "ExpressionStatement" ? onlyStatement.expression : onlyStatement;
	if (expression?.type !== "CallExpression") return null;
	if (expression.callee?.type !== "Identifier") return null;
	if (!isSetterIdentifier(expression.callee.name)) return null;
	if (!expression.arguments?.length) return null;
	return {
		setterName: expression.callee.name,
		setterArgument: expression.arguments[0]
	};
};
const cleanupReleasesSubscription = (effectBodyStatements, boundUnsubscribeName) => {
	const lastStatement = effectBodyStatements[effectBodyStatements.length - 1];
	if (lastStatement?.type !== "ReturnStatement") return false;
	const knownBoundReleaseNames = /* @__PURE__ */ new Set();
	if (boundUnsubscribeName) knownBoundReleaseNames.add(boundUnsubscribeName);
	return isCleanupReturn(lastStatement.argument, knownBoundReleaseNames);
};
const preferUseSyncExternalStore = { create: (context) => {
	const checkComponent = (componentBody) => {
		if (!componentBody || componentBody.type !== "BlockStatement") return;
		const useStateBindings = collectUseStateBindings(componentBody);
		if (useStateBindings.length === 0) return;
		const useStateInitializerByValueName = /* @__PURE__ */ new Map();
		for (const binding of useStateBindings) {
			const initializerArgument = binding.declarator.init?.arguments?.[0];
			if (!initializerArgument) continue;
			if ((initializerArgument.type === "ArrowFunctionExpression" || initializerArgument.type === "FunctionExpression") && initializerArgument.body?.type !== "BlockStatement") useStateInitializerByValueName.set(binding.valueName, initializerArgument.body);
			else useStateInitializerByValueName.set(binding.valueName, initializerArgument);
		}
		const setterNameToValueName = /* @__PURE__ */ new Map();
		for (const binding of useStateBindings) setterNameToValueName.set(binding.setterName, binding.valueName);
		for (const effectCall of findUseEffectsInComponent(componentBody)) {
			if ((effectCall.arguments?.length ?? 0) < 2) continue;
			const depsNode = effectCall.arguments[1];
			if (depsNode.type !== "ArrayExpression") continue;
			if ((depsNode.elements?.length ?? 0) !== 0) continue;
			const callback = getEffectCallback(effectCall);
			if (!callback || callback.body?.type !== "BlockStatement") continue;
			const effectBodyStatements = callback.body.body ?? [];
			if (effectBodyStatements.length < 2) continue;
			const subscription = findSubscriptionCall(effectBodyStatements);
			if (!subscription) continue;
			const handler = getSubscriptionHandlerArgument(subscription.call, effectBodyStatements);
			if (!handler) continue;
			const setterPayload = getSingleSetterCallFromHandler(handler);
			if (!setterPayload) continue;
			const valueName = setterNameToValueName.get(setterPayload.setterName);
			if (!valueName) continue;
			const useStateInitializer = useStateInitializerByValueName.get(valueName);
			if (!useStateInitializer) continue;
			if (!areExpressionsStructurallyEqual(useStateInitializer, setterPayload.setterArgument)) continue;
			if (!cleanupReleasesSubscription(effectBodyStatements, subscription.boundUnsubscribeName)) continue;
			const matchingBinding = useStateBindings.find((binding) => binding.valueName === valueName);
			context.report({
				node: matchingBinding?.declarator ?? effectCall,
				message: `useState "${valueName}" is synchronized with an external store via useEffect — replace this useState + useEffect pair with useSyncExternalStore(subscribe, getSnapshot) to avoid tearing during concurrent renders`
			});
		}
	};
	return {
		FunctionDeclaration(node) {
			if (!node.id?.name || !isUppercaseName(node.id.name)) return;
			checkComponent(node.body);
		},
		VariableDeclarator(node) {
			if (!isComponentAssignment(node)) return;
			checkComponent(node.init?.body);
		}
	};
} };
const SENTINEL_IDENTIFIER_NAMES = new Set([
	"undefined",
	"NaN",
	"null"
]);
const isSentinelIdentifier = (node) => node?.type === "Identifier" && SENTINEL_IDENTIFIER_NAMES.has(node.name);
const getTriggerGuardRootName = (testNode) => {
	if (!testNode) return null;
	if (testNode.type === "Identifier") return testNode.name;
	if (testNode.type === "BinaryExpression") {
		if (![
			"!==",
			"===",
			"!=",
			"=="
		].includes(testNode.operator)) return null;
		for (const side of [testNode.left, testNode.right]) if (side?.type === "Identifier" && !isSentinelIdentifier(side)) return side.name;
		return null;
	}
	if (testNode.type === "MemberExpression" && testNode.property?.type === "Identifier" && testNode.property.name === "length") {
		if (testNode.object?.type === "Identifier") return testNode.object.name;
	}
	if (testNode.type === "UnaryExpression" && testNode.operator === "!") return getTriggerGuardRootName(testNode.argument);
	return null;
};
const findTriggeredSideEffectCalleeName = (consequentNode) => {
	let foundCalleeName = null;
	walkAst(consequentNode, (child) => {
		if (foundCalleeName) return false;
		if (child.type !== "CallExpression") return;
		const callee = child.callee;
		if (callee?.type === "Identifier" && EVENT_TRIGGERED_SIDE_EFFECT_CALLEES.has(callee.name)) {
			foundCalleeName = callee.name;
			return;
		}
		if (callee?.type === "MemberExpression" && callee.property?.type === "Identifier") {
			const propertyName = callee.property.name;
			const isUnambiguousMethod = EVENT_TRIGGERED_SIDE_EFFECT_MEMBER_METHODS.has(propertyName);
			const isNavigationMethod = EVENT_TRIGGERED_NAVIGATION_METHOD_NAMES.has(propertyName);
			if (!isUnambiguousMethod && !isNavigationMethod) return;
			const rootName = getRootIdentifierName(callee);
			if (isNavigationMethod && (rootName === null || !NAVIGATION_RECEIVER_NAMES.has(rootName))) return;
			foundCalleeName = rootName ? `${rootName}.${propertyName}` : propertyName;
		}
	});
	return foundCalleeName;
};
const collectHandlerOnlyWriteStateNames = (componentBody, useStateBindings, handlerBindingNames) => {
	const handlerOnlyWriteStateNames = /* @__PURE__ */ new Set();
	for (const binding of useStateBindings) {
		let didFindAnySetterCall = false;
		let areAllSetterCallsInHandlers = true;
		walkAst(componentBody, (child) => {
			if (!areAllSetterCallsInHandlers) return false;
			if (child.type !== "CallExpression") return;
			if (child.callee?.type !== "Identifier") return;
			if (child.callee.name !== binding.setterName) return;
			didFindAnySetterCall = true;
			if (!isInsideEventHandler(child, handlerBindingNames)) areAllSetterCallsInHandlers = false;
		});
		if (didFindAnySetterCall && areAllSetterCallsInHandlers) handlerOnlyWriteStateNames.add(binding.valueName);
	}
	return handlerOnlyWriteStateNames;
};
const noEventTriggerState = { create: (context) => {
	const checkComponent = (componentBody) => {
		if (!componentBody || componentBody.type !== "BlockStatement") return;
		const useStateBindings = collectUseStateBindings(componentBody);
		if (useStateBindings.length === 0) return;
		const handlerOnlyWriteStateNames = collectHandlerOnlyWriteStateNames(componentBody, useStateBindings, collectHandlerBindingNames(componentBody));
		if (handlerOnlyWriteStateNames.size === 0) return;
		const returnExpressions = collectReturnExpressions(componentBody);
		const dependencyGraph = buildLocalDependencyGraph(componentBody);
		const renderReachableNames = expandTransitiveDependencies(collectRenderReachableNames(returnExpressions), dependencyGraph);
		walkAst(componentBody, (effectCall) => {
			if (effectCall.type !== "CallExpression") return;
			if (!isHookCall(effectCall, EFFECT_HOOK_NAMES)) return;
			if ((effectCall.arguments?.length ?? 0) < 2) return;
			const depsNode = effectCall.arguments[1];
			if (depsNode.type !== "ArrayExpression") return;
			if ((depsNode.elements?.length ?? 0) !== 1) return;
			const depElement = depsNode.elements[0];
			if (depElement?.type !== "Identifier") return;
			if (!handlerOnlyWriteStateNames.has(depElement.name)) return;
			if (renderReachableNames.has(depElement.name)) return;
			const callback = getEffectCallback(effectCall);
			if (!callback) return;
			const bodyStatements = getCallbackStatements(callback);
			if (bodyStatements.length !== 1) return;
			const soleStatement = bodyStatements[0];
			if (soleStatement.type !== "IfStatement") return;
			if (getTriggerGuardRootName(soleStatement.test) !== depElement.name) return;
			const sideEffectCalleeName = findTriggeredSideEffectCalleeName(soleStatement.consequent);
			if (!sideEffectCalleeName) return;
			context.report({
				node: effectCall,
				message: `useState "${depElement.name}" exists only to schedule "${sideEffectCalleeName}(...)" from a useEffect — call "${sideEffectCalleeName}(...)" directly inside the event handler that sets it, and delete the state`
			});
		});
	};
	return {
		FunctionDeclaration(node) {
			if (!node.id?.name || !isUppercaseName(node.id.name)) return;
			checkComponent(node.body);
		},
		VariableDeclarator(node) {
			if (!isComponentAssignment(node)) return;
			checkComponent(node.init?.body);
		}
	};
} };
const findTopLevelEffectCalls = (componentBody) => {
	const effectCalls = [];
	if (componentBody?.type !== "BlockStatement") return effectCalls;
	for (const statement of componentBody.body ?? []) {
		if (statement.type !== "ExpressionStatement") continue;
		const expression = statement.expression;
		if (expression?.type !== "CallExpression") continue;
		if (!isHookCall(expression, EFFECT_HOOK_NAMES)) continue;
		effectCalls.push(expression);
	}
	return effectCalls;
};
const collectDepIdentifierNames = (effectNode) => {
	const depNames = /* @__PURE__ */ new Set();
	const depsNode = effectNode.arguments?.[1];
	if (depsNode?.type !== "ArrayExpression") return depNames;
	for (const element of depsNode.elements ?? []) if (element?.type === "Identifier") depNames.add(element.name);
	return depNames;
};
const collectWrittenStateNamesInEffect = (effectCallback, setterToStateName) => {
	const writtenStateNames = /* @__PURE__ */ new Set();
	walkInsideStatementBlocks(effectCallback.body, (child) => {
		if (child.type !== "CallExpression") return;
		if (child.callee?.type !== "Identifier") return;
		const stateName = setterToStateName.get(child.callee.name);
		if (stateName) writtenStateNames.add(stateName);
	});
	return writtenStateNames;
};
const isFunctionShapedReturn = (returnedValue) => {
	if (returnedValue.type === "ArrowFunctionExpression" || returnedValue.type === "FunctionExpression") return true;
	if (returnedValue.type === "CallExpression") return true;
	if (returnedValue.type === "Identifier") return true;
	return false;
};
const isExternalSyncEffect = (effectCallback) => {
	if (effectCallback.body?.type === "BlockStatement") {
		const statements = effectCallback.body.body ?? [];
		for (const statement of statements) if (statement.type === "ReturnStatement" && statement.argument && isFunctionShapedReturn(statement.argument)) return true;
	}
	let didFindExternalCall = false;
	walkAst(effectCallback, (child) => {
		if (didFindExternalCall) return false;
		if (child.type === "NewExpression") {
			const constructor = child.callee;
			if (constructor?.type === "Identifier" && EXTERNAL_SYNC_OBSERVER_CONSTRUCTORS.has(constructor.name)) didFindExternalCall = true;
			return;
		}
		if (child.type === "AssignmentExpression") {
			if (child.left?.type === "MemberExpression" && child.left.property?.type === "Identifier" && child.left.property.name === "current") didFindExternalCall = true;
			return;
		}
		if (child.type !== "CallExpression") return;
		if (child.callee?.type === "Identifier" && EXTERNAL_SYNC_DIRECT_CALLEE_NAMES.has(child.callee.name)) {
			didFindExternalCall = true;
			return;
		}
		if (child.callee?.type === "MemberExpression" && child.callee.property?.type === "Identifier") {
			const propertyName = child.callee.property.name;
			if (EXTERNAL_SYNC_MEMBER_METHOD_NAMES.has(propertyName)) {
				didFindExternalCall = true;
				return;
			}
			if (EXTERNAL_SYNC_AMBIGUOUS_HTTP_METHOD_NAMES.has(propertyName)) {
				const receiverRootName = getRootIdentifierName(child.callee.object);
				if (receiverRootName !== null && EXTERNAL_SYNC_HTTP_CLIENT_RECEIVERS.has(receiverRootName)) didFindExternalCall = true;
			}
		}
	});
	return didFindExternalCall;
};
const noEffectChain = { create: (context) => {
	const checkComponent = (componentBody) => {
		if (!componentBody || componentBody.type !== "BlockStatement") return;
		const useStateBindings = collectUseStateBindings(componentBody);
		if (useStateBindings.length === 0) return;
		const setterToStateName = /* @__PURE__ */ new Map();
		for (const binding of useStateBindings) setterToStateName.set(binding.setterName, binding.valueName);
		const effectInfos = [];
		for (const effectCall of findTopLevelEffectCalls(componentBody)) {
			const callback = getEffectCallback(effectCall);
			if (!callback) continue;
			effectInfos.push({
				node: effectCall,
				depNames: collectDepIdentifierNames(effectCall),
				writtenStateNames: collectWrittenStateNamesInEffect(callback, setterToStateName),
				isExternalSync: isExternalSyncEffect(callback)
			});
		}
		if (effectInfos.length < 2) return;
		const reportedNodes = /* @__PURE__ */ new Set();
		for (const writerEffect of effectInfos) {
			if (writerEffect.isExternalSync) continue;
			if (writerEffect.writtenStateNames.size === 0) continue;
			for (const readerEffect of effectInfos) {
				if (readerEffect === writerEffect) continue;
				if (readerEffect.isExternalSync) continue;
				if (readerEffect.depNames.size === 0) continue;
				let chainedStateName = null;
				for (const writtenName of writerEffect.writtenStateNames) if (readerEffect.depNames.has(writtenName)) {
					chainedStateName = writtenName;
					break;
				}
				if (!chainedStateName) continue;
				if (reportedNodes.has(readerEffect.node)) continue;
				reportedNodes.add(readerEffect.node);
				context.report({
					node: readerEffect.node,
					message: `useEffect reacts to "${chainedStateName}" which is set by another useEffect — chains of effects add an extra render per link and become rigid as code evolves. Compute what you can during render and write all related state inside the event handler that originally fires the chain`
				});
			}
		}
	};
	return {
		FunctionDeclaration(node) {
			if (!node.id?.name || !isUppercaseName(node.id.name)) return;
			checkComponent(node.body);
		},
		VariableDeclarator(node) {
			if (!isComponentAssignment(node)) return;
			checkComponent(node.init?.body);
		}
	};
} };
const collectUseRefBindingNames = (componentBody) => {
	const useRefBindings = /* @__PURE__ */ new Set();
	if (componentBody?.type !== "BlockStatement") return useRefBindings;
	for (const statement of componentBody.body ?? []) {
		if (statement.type !== "VariableDeclaration") continue;
		for (const declarator of statement.declarations ?? []) {
			if (declarator.id?.type !== "Identifier") continue;
			if (declarator.init?.type !== "CallExpression") continue;
			if (!isHookCall(declarator.init, "useRef")) continue;
			useRefBindings.add(declarator.id.name);
		}
	}
	return useRefBindings;
};
const findMutableDepIssue = (depElement, useRefBindingNames) => {
	if (depElement.type !== "MemberExpression") return null;
	if (depElement.property?.type === "Identifier" && depElement.property.name === "current" && !depElement.computed && depElement.object?.type === "Identifier" && useRefBindingNames.has(depElement.object.name)) return {
		kind: "ref-current",
		rootName: depElement.object.name
	};
	const rootName = getRootIdentifierName(depElement);
	if (rootName !== null && MUTABLE_GLOBAL_ROOTS.has(rootName)) return {
		kind: "global",
		rootName
	};
	return null;
};
const getPropRootName = (expression, propNames) => {
	const rootName = getRootIdentifierName(expression, { followCallChains: true });
	return rootName !== null && propNames.has(rootName) ? rootName : null;
};
const findSubscribeLikeUsages = (callback) => {
	const usages = [];
	let cleanupArgument = null;
	if (callback.body?.type === "BlockStatement") {
		const callbackStatements = callback.body.body ?? [];
		const lastCallbackStatement = callbackStatements[callbackStatements.length - 1];
		if (lastCallbackStatement?.type === "ReturnStatement" && lastCallbackStatement.argument) cleanupArgument = lastCallbackStatement.argument;
	}
	walkAst(callback, (child) => {
		if (child === cleanupArgument) return false;
		if (child.type !== "CallExpression") return;
		if (child.callee?.type === "Identifier" && TIMER_CALLEE_NAMES_REQUIRING_CLEANUP.has(child.callee.name)) {
			usages.push({
				kind: "timer",
				resourceName: child.callee.name
			});
			return;
		}
		if (child.callee?.type === "MemberExpression" && child.callee.property?.type === "Identifier" && SUBSCRIPTION_METHOD_NAMES.has(child.callee.property.name)) usages.push({
			kind: "subscribe",
			resourceName: child.callee.property.name
		});
	});
	return usages;
};
const isSubscribeLikeCallExpression = (node) => {
	if (node?.type !== "CallExpression") return false;
	if (node.callee?.type !== "MemberExpression") return false;
	if (node.callee.property?.type !== "Identifier") return false;
	return SUBSCRIPTION_METHOD_NAMES.has(node.callee.property.name);
};
const collectReleasableBindingNames = (effectCallback) => {
	const releasableNames = /* @__PURE__ */ new Set();
	if (effectCallback.body?.type !== "BlockStatement") return releasableNames;
	for (const statement of effectCallback.body.body ?? []) {
		if (statement.type !== "VariableDeclaration") continue;
		for (const declarator of statement.declarations ?? []) {
			if (declarator.id?.type !== "Identifier") continue;
			const init = declarator.init;
			if (!init || init.type !== "CallExpression") continue;
			if (isSubscribeLikeCallExpression(init)) {
				releasableNames.add(declarator.id.name);
				continue;
			}
			if (init.callee?.type === "Identifier" && TIMER_CALLEE_NAMES_REQUIRING_CLEANUP.has(init.callee.name)) releasableNames.add(declarator.id.name);
		}
	}
	return releasableNames;
};
const isReleaseLikeCall = (callNode, knownBoundReleaseNames) => {
	if (callNode?.type !== "CallExpression") return false;
	const callee = callNode.callee;
	if (callee?.type === "Identifier") {
		if (TIMER_CLEANUP_CALLEE_NAMES.has(callee.name)) return true;
		if (CLEANUP_LIKE_RELEASE_CALLEE_NAMES.has(callee.name)) return true;
		if (knownBoundReleaseNames.has(callee.name)) return true;
		return false;
	}
	if (callee?.type === "MemberExpression" && callee.property?.type === "Identifier") return UNSUBSCRIPTION_METHOD_NAMES.has(callee.property.name);
	return false;
};
const containsReleaseLikeCall = (node, knownBoundReleaseNames) => {
	let didFindRelease = false;
	walkAst(node, (child) => {
		if (didFindRelease) return false;
		if (isReleaseLikeCall(child, knownBoundReleaseNames)) {
			didFindRelease = true;
			return false;
		}
	});
	return didFindRelease;
};
const isCleanupReturn = (returnedValue, knownBoundReleaseNames) => {
	if (!returnedValue) return false;
	if (returnedValue.type === "Identifier") return knownBoundReleaseNames.has(returnedValue.name);
	if (isSubscribeLikeCallExpression(returnedValue)) return true;
	if (returnedValue.type === "ArrowFunctionExpression" || returnedValue.type === "FunctionExpression") return containsReleaseLikeCall(returnedValue, knownBoundReleaseNames);
	return false;
};
const effectHasCleanupRelease = (callback) => {
	if (callback.body?.type !== "BlockStatement") return isSubscribeLikeCallExpression(callback.body);
	const knownBoundReleaseNames = collectReleasableBindingNames(callback);
	let didFindCleanupReturn = false;
	walkInsideStatementBlocks(callback.body, (child) => {
		if (didFindCleanupReturn) return;
		if (child.type !== "ReturnStatement") return;
		if (isCleanupReturn(child.argument, knownBoundReleaseNames)) didFindCleanupReturn = true;
	});
	return didFindCleanupReturn;
};
const effectNeedsCleanup = { create: (context) => ({ CallExpression(node) {
	if (!isHookCall(node, EFFECT_HOOK_NAMES)) return;
	const callback = getEffectCallback(node);
	if (!callback) return;
	const usages = findSubscribeLikeUsages(callback);
	if (usages.length === 0) return;
	if (effectHasCleanupRelease(callback)) return;
	const firstUsage = usages[0];
	const verb = firstUsage.kind === "timer" ? "schedules" : "subscribes via";
	const release = firstUsage.kind === "timer" ? `clear${firstUsage.resourceName === "setInterval" ? "Interval" : "Timeout"}(...)` : "the matching remove/unsubscribe call";
	context.report({
		node,
		message: `useEffect ${verb} \`${firstUsage.resourceName}(...)\` but never returns a cleanup — leaks the registration on every re-run and on unmount. Return a cleanup function that calls ${release}`
	});
} }) };
const noMirrorPropEffect = { create: (context) => {
	const checkComponent = (componentBody) => {
		if (!componentBody || componentBody.type !== "BlockStatement") return;
		const propNames = propStackTracker.getCurrentPropNames();
		if (propNames.size === 0) return;
		const mirrorBindings = [];
		for (const statement of componentBody.body ?? []) {
			if (statement.type !== "VariableDeclaration") continue;
			for (const declarator of statement.declarations ?? []) {
				if (declarator.id?.type !== "ArrayPattern") continue;
				const elements = declarator.id.elements ?? [];
				if (elements.length < 2) continue;
				const valueElement = elements[0];
				const setterElement = elements[1];
				if (valueElement?.type !== "Identifier" || setterElement?.type !== "Identifier" || !isSetterIdentifier(setterElement.name)) continue;
				if (declarator.init?.type !== "CallExpression") continue;
				if (!isHookCall(declarator.init, "useState")) continue;
				const initializer = declarator.init.arguments?.[0];
				if (!initializer) continue;
				const propRootName = getPropRootName(initializer, propNames);
				if (!propRootName) continue;
				mirrorBindings.push({
					valueName: valueElement.name,
					setterName: setterElement.name,
					initializer,
					propRootName
				});
			}
		}
		if (mirrorBindings.length === 0) return;
		for (const statement of componentBody.body ?? []) {
			if (statement.type !== "ExpressionStatement") continue;
			const effectCall = statement.expression;
			if (effectCall?.type !== "CallExpression") continue;
			if (!isHookCall(effectCall, EFFECT_HOOK_NAMES)) continue;
			if ((effectCall.arguments?.length ?? 0) < 2) continue;
			const depsNode = effectCall.arguments[1];
			if (depsNode.type !== "ArrayExpression") continue;
			const depIdentifierNames = /* @__PURE__ */ new Set();
			for (const element of depsNode.elements ?? []) if (element?.type === "Identifier") depIdentifierNames.add(element.name);
			if (depIdentifierNames.size === 0) continue;
			const callback = getEffectCallback(effectCall);
			if (!callback) continue;
			const bodyStatements = getCallbackStatements(callback);
			if (bodyStatements.length !== 1) continue;
			const onlyStatement = bodyStatements[0];
			const expression = onlyStatement.type === "ExpressionStatement" ? onlyStatement.expression : onlyStatement;
			if (expression?.type !== "CallExpression") continue;
			if (expression.callee?.type !== "Identifier") continue;
			if (!isSetterIdentifier(expression.callee.name)) continue;
			if (!expression.arguments?.length) continue;
			const setterArgument = expression.arguments[0];
			const matchedBinding = mirrorBindings.find((binding) => binding.setterName === expression.callee.name && depIdentifierNames.has(binding.propRootName) && areExpressionsStructurallyEqual(binding.initializer, setterArgument));
			if (!matchedBinding) continue;
			context.report({
				node: effectCall,
				message: `useState "${matchedBinding.valueName}" is mirrored from prop "${matchedBinding.propRootName}" via this effect — delete both the useState and the effect, and read the prop directly in render`
			});
		}
	};
	const propStackTracker = createComponentPropStackTracker({ onComponentEnter: checkComponent });
	return propStackTracker.visitors;
} };
const noMutableInDeps = { create: (context) => {
	const checkComponent = (componentBody) => {
		if (!componentBody || componentBody.type !== "BlockStatement") return;
		const useRefBindingNames = collectUseRefBindingNames(componentBody);
		walkAst(componentBody, (child) => {
			if (child.type !== "CallExpression") return;
			if (!isHookCall(child, HOOKS_WITH_DEPS)) return;
			if ((child.arguments?.length ?? 0) < 2) return;
			const depsNode = child.arguments[1];
			if (depsNode.type !== "ArrayExpression") return;
			for (const element of depsNode.elements ?? []) {
				if (!element) continue;
				const issue = findMutableDepIssue(element, useRefBindingNames);
				if (!issue) continue;
				if (issue.kind === "ref-current") context.report({
					node: element,
					message: `"${issue.rootName}.current" in deps — refs are mutable and don't trigger re-renders, so React won't re-run this effect when it changes. Read the ref inside the effect body instead`
				});
				else context.report({
					node: element,
					message: `Mutable global "${issue.rootName}.*" in deps — values like \`location.pathname\` can change without triggering a re-render, so they can't drive effect re-runs. Subscribe with useSyncExternalStore or read inside the effect`
				});
			}
		});
	};
	return {
		FunctionDeclaration(node) {
			if (!node.id?.name || !isUppercaseName(node.id.name)) return;
			checkComponent(node.body);
		},
		VariableDeclarator(node) {
			if (!isComponentAssignment(node)) return;
			checkComponent(node.init?.body);
		}
	};
} };
const collectFunctionTypedLocalBindings = (componentBody) => {
	const functionTypedLocals = /* @__PURE__ */ new Set();
	if (componentBody?.type !== "BlockStatement") return functionTypedLocals;
	for (const statement of componentBody.body ?? []) {
		if (statement.type !== "VariableDeclaration") continue;
		for (const declarator of statement.declarations ?? []) {
			if (declarator.id?.type !== "Identifier") continue;
			if (declarator.init?.type !== "CallExpression") continue;
			if (!isHookCall(declarator.init, "useCallback")) continue;
			functionTypedLocals.add(declarator.id.name);
		}
	}
	return functionTypedLocals;
};
const findEnclosingFunctionInsideEffect = (identifierNode, effectCallback) => {
	let cursor = identifierNode.parent ?? null;
	while (cursor && cursor !== effectCallback) {
		if (cursor.type === "ArrowFunctionExpression" || cursor.type === "FunctionExpression" || cursor.type === "FunctionDeclaration") return cursor;
		cursor = cursor.parent ?? null;
	}
	return null;
};
const isCallExpressionWithSubHandlerCallee = (callExpression) => {
	if (callExpression?.type !== "CallExpression") return false;
	const callee = callExpression.callee;
	if (callee?.type === "Identifier" && TIMER_AND_SCHEDULER_DIRECT_CALLEE_NAMES.has(callee.name)) return true;
	if (callee?.type === "MemberExpression" && callee.property?.type === "Identifier" && SUBSCRIPTION_METHOD_NAMES.has(callee.property.name)) return true;
	return false;
};
const getSubHandlerCalleeName = (callExpression) => {
	if (callExpression?.type !== "CallExpression") return null;
	const callee = callExpression.callee;
	if (callee?.type === "Identifier") return callee.name;
	if (callee?.type === "MemberExpression" && callee.property?.type === "Identifier") return callee.property.name;
	return null;
};
const getEnclosingFunctionBindingName = (enclosingFunction) => {
	if (enclosingFunction.type === "FunctionDeclaration" && enclosingFunction.id?.type === "Identifier") return enclosingFunction.id.name;
	const directParent = enclosingFunction.parent;
	if (directParent?.type === "VariableDeclarator" && directParent.id?.type === "Identifier") return directParent.id.name;
	if (directParent?.type === "AssignmentExpression" && directParent.right === enclosingFunction && directParent.left?.type === "Identifier") return directParent.left.name;
	return null;
};
const findSubHandlerForEnclosingFunction = (enclosingFunction, effectCallback) => {
	const directParent = enclosingFunction.parent;
	if (directParent?.type === "CallExpression" && directParent.arguments?.includes(enclosingFunction) && isCallExpressionWithSubHandlerCallee(directParent)) return directParent;
	const localName = getEnclosingFunctionBindingName(enclosingFunction);
	if (localName === null) return null;
	let matchingSubHandlerCall = null;
	walkAst(effectCallback, (child) => {
		if (matchingSubHandlerCall) return false;
		if (child.type !== "CallExpression") return;
		if (!isCallExpressionWithSubHandlerCallee(child)) return;
		for (const argument of child.arguments ?? []) if (argument?.type === "Identifier" && argument.name === localName) {
			matchingSubHandlerCall = child;
			return false;
		}
	});
	return matchingSubHandlerCall;
};
const classifyCallableReadsInsideEffect = (callableName, effectCallback) => {
	let hasAnyRead = false;
	let allReadsAreInSubHandlers = true;
	let firstSubHandlerName = null;
	walkAst(effectCallback, (child) => {
		if (child.type !== "Identifier") return;
		if (child.name !== callableName) return;
		const parent = child.parent;
		if (parent?.type === "ArrayExpression") return;
		if (parent?.type === "MemberExpression" && !parent.computed && parent.property === child) return;
		if (parent?.type === "Property" && !parent.computed && !parent.shorthand && parent.key === child) return;
		hasAnyRead = true;
		const enclosingFunction = findEnclosingFunctionInsideEffect(child, effectCallback);
		if (!enclosingFunction) {
			allReadsAreInSubHandlers = false;
			return;
		}
		const subHandlerCall = findSubHandlerForEnclosingFunction(enclosingFunction, effectCallback);
		if (!subHandlerCall) {
			allReadsAreInSubHandlers = false;
			return;
		}
		if (firstSubHandlerName === null) firstSubHandlerName = getSubHandlerCalleeName(subHandlerCall);
	});
	return {
		hasAnyRead,
		allReadsAreInSubHandlers,
		firstSubHandlerName
	};
};
//#endregion
//#region src/plugin/index.ts
const plugin = {
	meta: { name: "react-doctor" },
	rules: {
		"no-derived-state-effect": noDerivedStateEffect,
		"no-fetch-in-effect": noFetchInEffect,
		"no-mirror-prop-effect": noMirrorPropEffect,
		"no-mutable-in-deps": noMutableInDeps,
		"no-cascading-set-state": noCascadingSetState,
		"no-effect-chain": noEffectChain,
		"no-effect-event-handler": noEffectEventHandler,
		"no-effect-event-in-deps": noEffectEventInDeps,
		"no-event-trigger-state": noEventTriggerState,
		"no-prop-callback-in-effect": noPropCallbackInEffect,
		"no-derived-useState": noDerivedUseState,
		"no-direct-state-mutation": noDirectStateMutation,
		"no-set-state-in-render": noSetStateInRender,
		"prefer-use-effect-event": { create: (context) => {
			const checkComponent = (componentBody) => {
				if (!componentBody || componentBody.type !== "BlockStatement") return;
				const functionTypedLocalBindings = collectFunctionTypedLocalBindings(componentBody);
				for (const statement of componentBody.body ?? []) {
					if (statement.type !== "ExpressionStatement") continue;
					const effectCall = statement.expression;
					if (effectCall?.type !== "CallExpression") continue;
					if (!isHookCall(effectCall, EFFECT_HOOK_NAMES)) continue;
					if ((effectCall.arguments?.length ?? 0) < 2) continue;
					const depsNode = effectCall.arguments[1];
					if (depsNode.type !== "ArrayExpression") continue;
					const depElements = depsNode.elements ?? [];
					if (depElements.length < 2) continue;
					if (!depElements.every((element) => element?.type === "Identifier")) continue;
					const callback = getEffectCallback(effectCall);
					if (!callback) continue;
					for (const depElement of depElements) {
						if (!depElement) continue;
						const depName = depElement.name;
						const isFunctionTypedPropDep = propStackTracker.isPropName(depName) && REACT_HANDLER_PROP_PATTERN.test(depName);
						const isFunctionTypedLocalDep = functionTypedLocalBindings.has(depName);
						if (!isFunctionTypedPropDep && !isFunctionTypedLocalDep) continue;
						const classification = classifyCallableReadsInsideEffect(depName, callback);
						if (!classification.hasAnyRead) continue;
						if (!classification.allReadsAreInSubHandlers) continue;
						const subHandlerLabel = classification.firstSubHandlerName ? `\`${classification.firstSubHandlerName}\`` : "an async sub-handler";
						context.report({
							node: depElement,
							message: `"${depName}" is read only inside ${subHandlerLabel} — wrap it with useEffectEvent and remove it from the dep array so the effect doesn't re-synchronize on every parent render`
						});
					}
				}
			};
			const propStackTracker = createComponentPropStackTracker({ onComponentEnter: checkComponent });
			return propStackTracker.visitors;
		} },
		"prefer-useReducer": preferUseReducer,
		"prefer-use-sync-external-store": preferUseSyncExternalStore,
		"rerender-lazy-state-init": rerenderLazyStateInit,
		"rerender-functional-setstate": rerenderFunctionalSetstate,
		"rerender-dependencies": rerenderDependencies,
		"rerender-state-only-in-handlers": rerenderStateOnlyInHandlers,
		"rerender-defer-reads-hook": rerenderDeferReadsHook,
		"advanced-event-handler-refs": advancedEventHandlerRefs,
		"effect-needs-cleanup": effectNeedsCleanup,
		"no-generic-handler-names": noGenericHandlerNames,
		"no-giant-component": noGiantComponent,
		"no-many-boolean-props": noManyBooleanProps,
		"no-react19-deprecated-apis": noReact19DeprecatedApis,
		"no-render-prop-children": noRenderPropChildren,
		"no-render-in-render": noRenderInRender,
		"no-nested-component-definition": noNestedComponentDefinition,
		"react-compiler-destructure-method": reactCompilerDestructureMethod,
		"no-legacy-class-lifecycles": noLegacyClassLifecycles,
		"no-legacy-context-api": noLegacyContextApi,
		"no-default-props": noDefaultProps,
		"no-react-dom-deprecated-apis": noReactDomDeprecatedApis,
		"no-usememo-simple-expression": noUsememoSimpleExpression,
		"no-layout-property-animation": noLayoutPropertyAnimation,
		"rerender-memo-with-default-value": rerenderMemoWithDefaultValue,
		"rerender-memo-before-early-return": rerenderMemoBeforeEarlyReturn,
		"rerender-transitions-scroll": rerenderTransitionsScroll,
		"rerender-derived-state-from-hook": rerenderDerivedStateFromHook,
		"async-defer-await": asyncDeferAwait,
		"async-await-in-loop": asyncAwaitInLoop,
		"rendering-animate-svg-wrapper": renderingAnimateSvgWrapper,
		"rendering-hoist-jsx": renderingHoistJsx,
		"rendering-hydration-mismatch-time": renderingHydrationMismatchTime,
		"no-inline-prop-on-memo-component": noInlinePropOnMemoComponent,
		"rendering-hydration-no-flicker": renderingHydrationNoFlicker,
		"rendering-script-defer-async": renderingScriptDeferAsync,
		"rendering-usetransition-loading": renderingUsetransitionLoading,
		"no-transition-all": noTransitionAll,
		"no-global-css-variable-animation": noGlobalCssVariableAnimation,
		"no-large-animated-blur": noLargeAnimatedBlur,
		"no-scale-from-zero": noScaleFromZero,
		"no-permanent-will-change": noPermanentWillChange,
		"no-eval": noEval,
		"no-secrets-in-client-code": noSecretsInClientCode,
		"no-barrel-import": noBarrelImport,
		"no-dynamic-import-path": noDynamicImportPath,
		"no-full-lodash-import": noFullLodashImport,
		"no-moment": noMoment,
		"prefer-dynamic-import": preferDynamicImport,
		"use-lazy-motion": useLazyMotion,
		"no-undeferred-third-party": noUndeferredThirdParty,
		"no-array-index-as-key": noArrayIndexAsKey,
		"no-polymorphic-children": noPolymorphicChildren,
		"rendering-conditional-render": renderingConditionalRender,
		"rendering-svg-precision": renderingSvgPrecision,
		"no-prevent-default": noPreventDefault,
		"no-uncontrolled-input": noUncontrolledInput,
		"no-document-start-view-transition": { create: (context) => ({ CallExpression(node) {
			const callee = node.callee;
			if (callee?.type !== "MemberExpression") return;
			if (callee.object?.type !== "Identifier" || callee.object.name !== "document") return;
			if (callee.property?.type !== "Identifier" || callee.property.name !== "startViewTransition") return;
			context.report({
				node,
				message: "document.startViewTransition() bypasses React's <ViewTransition> integration — render a <ViewTransition> component and let React drive the transition (around startTransition / useDeferredValue / Suspense)"
			});
		} }) },
		"no-flush-sync": { create: (context) => ({ ImportDeclaration(node) {
			if (node.source?.value !== "react-dom") return;
			for (const specifier of node.specifiers ?? []) {
				if (specifier.type !== "ImportSpecifier") continue;
				if (specifier.imported?.name === "flushSync") context.report({
					node: specifier,
					message: "flushSync from react-dom skips View Transition snapshots and concurrent rendering — prefer startTransition for non-urgent updates"
				});
			}
		} }) },
		"nextjs-no-img-element": nextjsNoImgElement,
		"nextjs-async-client-component": nextjsAsyncClientComponent,
		"nextjs-no-a-element": nextjsNoAElement,
		"nextjs-no-use-search-params-without-suspense": nextjsNoUseSearchParamsWithoutSuspense,
		"nextjs-no-client-fetch-for-server-data": nextjsNoClientFetchForServerData,
		"nextjs-missing-metadata": nextjsMissingMetadata,
		"nextjs-no-client-side-redirect": nextjsNoClientSideRedirect,
		"nextjs-no-redirect-in-try-catch": nextjsNoRedirectInTryCatch,
		"nextjs-image-missing-sizes": nextjsImageMissingSizes,
		"nextjs-no-native-script": nextjsNoNativeScript,
		"nextjs-inline-script-missing-id": nextjsInlineScriptMissingId,
		"nextjs-no-font-link": nextjsNoFontLink,
		"nextjs-no-css-link": nextjsNoCssLink,
		"nextjs-no-polyfill-script": nextjsNoPolyfillScript,
		"nextjs-no-head-import": nextjsNoHeadImport,
		"nextjs-no-side-effect-in-get-handler": nextjsNoSideEffectInGetHandler,
		"server-auth-actions": serverAuthActions,
		"server-after-nonblocking": serverAfterNonblocking,
		"server-no-mutable-module-state": serverNoMutableModuleState,
		"server-cache-with-object-literal": serverCacheWithObjectLiteral,
		"server-hoist-static-io": serverHoistStaticIo,
		"server-dedup-props": serverDedupProps,
		"server-sequential-independent-await": serverSequentialIndependentAwait,
		"server-fetch-without-revalidate": serverFetchWithoutRevalidate,
		"client-passive-event-listeners": clientPassiveEventListeners,
		"client-localstorage-no-version": clientLocalstorageNoVersion,
		"js-combine-iterations": jsCombineIterations,
		"js-tosorted-immutable": jsTosortedImmutable,
		"js-hoist-regexp": jsHoistRegexp,
		"js-hoist-intl": jsHoistIntl,
		"js-cache-property-access": jsCachePropertyAccess,
		"js-length-check-first": jsLengthCheckFirst,
		"js-min-max-loop": jsMinMaxLoop,
		"js-set-map-lookups": jsSetMapLookups,
		"js-batch-dom-css": jsBatchDomCss,
		"js-index-maps": jsIndexMaps,
		"js-cache-storage": jsCacheStorage,
		"js-early-exit": jsEarlyExit,
		"js-flatmap-filter": jsFlatmapFilter,
		"async-parallel": asyncParallel,
		"rn-no-raw-text": rnNoRawText,
		"rn-no-deprecated-modules": rnNoDeprecatedModules,
		"rn-no-legacy-expo-packages": rnNoLegacyExpoPackages,
		"rn-no-dimensions-get": rnNoDimensionsGet,
		"rn-no-inline-flatlist-renderitem": rnNoInlineFlatlistRenderitem,
		"rn-no-legacy-shadow-styles": rnNoLegacyShadowStyles,
		"rn-prefer-reanimated": rnPreferReanimated,
		"rn-no-single-element-style-array": rnNoSingleElementStyleArray,
		"rn-prefer-pressable": rnPreferPressable,
		"rn-prefer-expo-image": rnPreferExpoImage,
		"rn-no-non-native-navigator": rnNoNonNativeNavigator,
		"rn-no-scroll-state": rnNoScrollState,
		"rn-no-scrollview-mapped-list": rnNoScrollviewMappedList,
		"rn-no-inline-object-in-list-item": rnNoInlineObjectInListItem,
		"rn-animate-layout-property": rnAnimateLayoutProperty,
		"rn-prefer-content-inset-adjustment": rnPreferContentInsetAdjustment,
		"rn-pressable-shared-value-mutation": rnPressableSharedValueMutation,
		"rn-list-data-mapped": rnListDataMapped,
		"rn-list-callback-per-row": rnListCallbackPerRow,
		"rn-list-recyclable-without-types": rnListRecyclableWithoutTypes,
		"rn-animation-reaction-as-derived": rnAnimationReactionAsDerived,
		"rn-bottom-sheet-prefer-native": rnBottomSheetPreferNative,
		"rn-scrollview-dynamic-padding": rnScrollviewDynamicPadding,
		"rn-style-prefer-boxshadow": rnStylePreferBoxShadow,
		"tanstack-start-route-property-order": tanstackStartRoutePropertyOrder,
		"tanstack-start-no-direct-fetch-in-loader": tanstackStartNoDirectFetchInLoader,
		"tanstack-start-server-fn-validate-input": tanstackStartServerFnValidateInput,
		"tanstack-start-no-useeffect-fetch": tanstackStartNoUseEffectFetch,
		"tanstack-start-missing-head-content": tanstackStartMissingHeadContent,
		"tanstack-start-no-anchor-element": tanstackStartNoAnchorElement,
		"tanstack-start-server-fn-method-order": tanstackStartServerFnMethodOrder,
		"tanstack-start-no-navigate-in-render": tanstackStartNoNavigateInRender,
		"tanstack-start-no-dynamic-server-fn-import": tanstackStartNoDynamicServerFnImport,
		"tanstack-start-no-use-server-in-handler": tanstackStartNoUseServerInHandler,
		"tanstack-start-no-secrets-in-loader": tanstackStartNoSecretsInLoader,
		"tanstack-start-get-mutation": tanstackStartGetMutation,
		"tanstack-start-redirect-in-try-catch": tanstackStartRedirectInTryCatch,
		"tanstack-start-loader-parallel-fetch": tanstackStartLoaderParallelFetch,
		"query-stable-query-client": queryStableQueryClient,
		"query-no-rest-destructuring": queryNoRestDestructuring,
		"query-no-void-query-fn": queryNoVoidQueryFn,
		"query-no-query-in-effect": queryNoQueryInEffect,
		"query-mutation-missing-invalidation": queryMutationMissingInvalidation,
		"query-no-usequery-for-mutation": queryNoUseQueryForMutation,
		"no-inline-bounce-easing": noInlineBounceEasing,
		"no-z-index-9999": noZIndex9999,
		"no-inline-exhaustive-style": noInlineExhaustiveStyle,
		"no-side-tab-border": noSideTabBorder,
		"no-pure-black-background": noPureBlackBackground,
		"no-gradient-text": noGradientText,
		"no-dark-mode-glow": noDarkModeGlow,
		"no-justified-text": noJustifiedText,
		"no-tiny-text": noTinyText,
		"no-wide-letter-spacing": noWideLetterSpacing,
		"no-gray-on-colored-background": noGrayOnColoredBackground,
		"no-layout-transition-inline": noLayoutTransitionInline,
		"no-disabled-zoom": noDisabledZoom,
		"no-outline-none": noOutlineNone,
		"no-long-transition-duration": noLongTransitionDuration,
		"design-no-bold-heading": noBoldHeading,
		"design-no-redundant-padding-axes": noRedundantPaddingAxes,
		"design-no-redundant-size-axes": noRedundantSizeAxes,
		"design-no-space-on-flex-children": noSpaceOnFlexChildren,
		"design-no-em-dash-in-jsx-text": noEmDashInJsxText,
		"design-no-three-period-ellipsis": noThreePeriodEllipsis,
		"design-no-default-tailwind-palette": noDefaultTailwindPalette,
		"design-no-vague-button-label": noVagueButtonLabel
	}
};
createRequire(import.meta.url);
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
const TANSTACK_QUERY_RULES = {
	"react-doctor/query-stable-query-client": "warn",
	"react-doctor/query-no-rest-destructuring": "warn",
	"react-doctor/query-no-void-query-fn": "warn",
	"react-doctor/query-no-query-in-effect": "warn",
	"react-doctor/query-mutation-missing-invalidation": "warn",
	"react-doctor/query-no-usequery-for-mutation": "warn"
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
new Set([
	...Object.keys(GLOBAL_REACT_DOCTOR_RULES),
	...Object.keys(NEXTJS_RULES),
	...Object.keys(REACT_NATIVE_RULES),
	...Object.keys(TANSTACK_START_RULES),
	...Object.keys(TANSTACK_QUERY_RULES)
]);
//#endregion
//#region src/eslint-plugin.ts
const PLUGIN_NAMESPACE = "react-doctor";
const RULE_DOCS_BASE_URL = "https://github.com/leprincep35700/react-doctor-local/tree/main/docs/rules";
const ruleNameToDescription = (ruleName) => ruleName.replaceAll("-", " ").replace(/\b\w/g, (innerChar) => innerChar.toUpperCase());
const recommendedRuleKeys = new Set(Object.keys(GLOBAL_REACT_DOCTOR_RULES));
const wrapAsEslintRule = (ruleName, ruleImpl) => ({
	meta: {
		type: "problem",
		docs: {
			description: ruleNameToDescription(ruleName),
			url: `${RULE_DOCS_BASE_URL}/${ruleName}`,
			recommended: recommendedRuleKeys.has(`${PLUGIN_NAMESPACE}/${ruleName}`)
		},
		schema: []
	},
	create: (context) => ruleImpl.create(context)
});
const eslintShapedRules = Object.fromEntries(Object.entries(plugin.rules).map(([ruleName, ruleImpl]) => [ruleName, wrapAsEslintRule(ruleName, ruleImpl)]));
const buildFlatConfig = (configName, ruleSet) => ({
	name: `react-doctor/${configName}`,
	plugins: {},
	rules: { ...ruleSet }
});
const ALL_RULES_AT_RECOMMENDED_SEVERITY = {
	...GLOBAL_REACT_DOCTOR_RULES,
	...NEXTJS_RULES,
	...REACT_NATIVE_RULES,
	...TANSTACK_START_RULES,
	...TANSTACK_QUERY_RULES
};
const eslintPlugin = {
	meta: {
		name: PLUGIN_NAMESPACE,
		version: "0.1.4"
	},
	rules: eslintShapedRules,
	configs: {
		recommended: buildFlatConfig("recommended", GLOBAL_REACT_DOCTOR_RULES),
		next: buildFlatConfig("next", NEXTJS_RULES),
		"react-native": buildFlatConfig("react-native", REACT_NATIVE_RULES),
		"tanstack-start": buildFlatConfig("tanstack-start", TANSTACK_START_RULES),
		"tanstack-query": buildFlatConfig("tanstack-query", TANSTACK_QUERY_RULES),
		all: buildFlatConfig("all", ALL_RULES_AT_RECOMMENDED_SEVERITY)
	}
};
for (const flatConfig of Object.values(eslintPlugin.configs)) flatConfig.plugins[PLUGIN_NAMESPACE] = eslintPlugin;
//#endregion
export { eslintPlugin as default };

//# sourceMappingURL=eslint-plugin.js.map