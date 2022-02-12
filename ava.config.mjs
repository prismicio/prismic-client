export default {
	extensions: ["ts"],
	files: ["./test/**/*.test.ts"],
	require: ["esbuild-register"],
	verbose: true,
	timeout: "60s",
};
