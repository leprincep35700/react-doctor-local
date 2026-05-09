//#region src/oxlint-config.d.ts
type RuleSeverity = "error" | "warn" | "off";
//#endregion
//#region src/plugin/types.d.ts
interface RuleVisitors {
  [selector: string]: ((node: EsTreeNode) => void) | (() => void);
}
interface EsTreeNode {
  type: string;
  [key: string]: any;
}
//#endregion
//#region src/eslint-plugin.d.ts
interface EslintRuleContext {
  report: (descriptor: {
    node: EsTreeNode;
    message: string;
  }) => void;
  getFilename?: () => string;
}
interface EslintRuleMeta {
  type: "problem" | "suggestion" | "layout";
  docs: {
    description: string;
    url: string;
    recommended: boolean;
  };
  schema: unknown[];
}
interface EslintRule {
  meta: EslintRuleMeta;
  create: (context: EslintRuleContext) => RuleVisitors;
}
interface EslintFlatConfig {
  name: string;
  plugins: Record<string, EslintPlugin>;
  rules: Record<string, RuleSeverity>;
}
interface EslintPlugin {
  meta: {
    name: string;
    version: string;
  };
  rules: Record<string, EslintRule>;
  configs: {
    recommended: EslintFlatConfig;
    next: EslintFlatConfig;
    "react-native": EslintFlatConfig;
    "tanstack-start": EslintFlatConfig;
    "tanstack-query": EslintFlatConfig;
    all: EslintFlatConfig;
  };
}
declare const eslintPlugin: EslintPlugin;
//#endregion
export { eslintPlugin as default };
//# sourceMappingURL=eslint-plugin.d.ts.map