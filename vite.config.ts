import { defineConfig } from "vite"
import sdk from "vite-plugin-sdk"

export default defineConfig({
	plugins: [sdk()],
	resolve: {
		alias: {
			// Force using the Node-compatible version of `decode-named-character-reference`.
			"decode-named-character-reference":
				"./node_modules/decode-named-character-reference/index.js",
		},
	},
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				richtext: "./src/richtext/index.ts",
			},
		},
	},
	test: {
		coverage: {
			provider: "v8",
			reporter: ["lcovonly", "text"],
			include: ["src"],
		},
		setupFiles: ["./test/__setup__"],
	},
})
