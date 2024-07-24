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
		coverage: {
			provider: "v8",
			reporter: ["lcovonly", "text"],
			include: ["src"],
		},
		setupFiles: ["./test/__setup__"],
	},
})
