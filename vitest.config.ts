import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		coverage: {
			provider: "v8",
			reporter: ["lcovonly", "text"],
			include: ["src"],
		},
		setupFiles: ["./test/__setup__"],
	},
})
