import { defineConfig } from "tsdown"

export default defineConfig({
	entry: ["./src/index.ts", "./src/richtext/index.ts"],
	format: ["esm", "cjs"],
	platform: "neutral",
	unbundle: true,
	sourcemap: true,
	exports: true,
})
