import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		globalSetup: ["./test/setup.global.ts"],
		setupFiles: ["./test/setup.ts"],
		typecheck: {
			enabled: true,
		},
		retry: 1,
		coverage: {
			provider: "v8",
			reporter: ["lcovonly", "text"],
			include: ["src"],
		},
	},
})
