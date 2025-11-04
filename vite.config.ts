/// <reference types="vitest/config" />
import { defineConfig } from "vite"
import sdk from "vite-plugin-sdk"

export default defineConfig({
	plugins: [sdk()],
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				richtext: "./src/richtext/index.ts",
			},
		},
	},
	test: {
		include: [".\/test2\/*.test.ts"],
		globalSetup: ["./test2/global.setup.ts"],
		setupFiles: ["./test2/setup.ts"],
		typecheck: {
			enabled: true,
			include: [".\/test2\/*.test-d.ts"],
		},
		coverage: {
			provider: "v8",
			reporter: ["lcovonly", "text"],
			include: ["src"],
		},
	},
})
