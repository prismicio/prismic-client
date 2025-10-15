import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
	declaration: true,
	sourcemap: true,
	rollup: {
		emitCJS: true,
	},
	entries: ["src/index", "src/richtext/index"],
})
