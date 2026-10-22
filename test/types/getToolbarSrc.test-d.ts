import { expectTypeOf, it } from "vitest"

import { getToolbarSrc } from "../../src"

it("returns a precise URL type", () => {
	expectTypeOf(
		getToolbarSrc("example"),
	).toEqualTypeOf<"https://static.cdn.prismic.io/prismic.js?repo=example">()
	expectTypeOf(
		getToolbarSrc("example", { version: 5 }),
	).toEqualTypeOf<"https://static.cdn.prismic.io/prismic.js?repo=example&v=5">()
})
