const pkg = require("./package.json");

module.exports = [
	...new Set([
		pkg.main,
		pkg.module,
		...Object.values(pkg.exports).flatMap((exportTypes) => {
			if (typeof exportTypes === "string") {
				return exportTypes;
			} else {
				return Object.values(exportTypes);
			}
		}),
	]),
]
	.filter((path) => {
		return path && path !== "./package.json";
	})
	.map((path) => {
		return { path };
	});
