module.exports = {
	root: true,
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:svelte/recommended",
	],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint"],
	parserOptions: {
		sourceType: "module",
		ecmaVersion: 2020,
		extraFileExtensions: [".svelte"],
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	overrides: [
		{
			files: ["*.svelte"],
			parser: "svelte-eslint-parser",
			parserOptions: {
				parser: "@typescript-eslint/parser",
			},
		},
	],
	rules: {
		"object-curly-spacing": ["error", "always"],
		"no-trailing-spaces": ["error"],
		"comma-dangle": ["error", "always-multiline"],
		"semi": ["error", "always"],
		"quotes": ["error", "double"],

		// Svelte
		"svelte/max-attributes-per-line": [
			"error",
			{
				"multiline": 1,
				"singleline": 1
			}
		],
		"svelte/first-attribute-linebreak": [
			"error",
			{
				"multiline": "below", // or "beside"
				"singleline": "beside" // "below"
			}
		],
		"svelte/indent": [
			"error",
			{
				"indent": 4,
				"ignoredNodes": [],
				"switchCase": 1,
				"alignAttributesVertically": false
			}
		],
		"svelte/html-self-closing": [
			"error",
			"all"
		],
		"svelte/html-closing-bracket-spacing": [
			"error",
			{
				"startTag": "never",
				"endTag": "never",
				"selfClosingTag": "always"
			}
		],
		"svelte/mustache-spacing": [
			"error",
			{
				"textExpressions": "never",
				"attributesAndProps": "never",
				"directiveExpressions": "never",
				"tags": {
					"openingBrace": "never",
					"closingBrace": "never"
				}
			}
		],
		"sort-imports": [
			"error",
			{
				"ignoreCase": true,
				"ignoreDeclarationSort": true,
				"ignoreMemberSort": false,
				"memberSyntaxSortOrder": ["none", "all", "multiple", "single"]
			}
		]
	},
};
