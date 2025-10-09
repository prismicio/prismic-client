import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("ColorField type is hex color string or null", () => {
	expectTypeOf<prismic.ColorField>().toEqualTypeOf<`#${string}` | null>()
})

test("filled state accepts hex color strings", () => {
	expectTypeOf<prismic.ColorField<"filled">>().toEqualTypeOf<`#${string}`>()

	// @ts-expect-error - Empty fields cannot contain a filled value.
	const _test1: prismic.ColorField<"empty"> = "#FF00FF"
})

test("empty state is null", () => {
	expectTypeOf<prismic.ColorField<"empty">>().toEqualTypeOf<null>()
})

test("must be in hex triplet format", () => {
	// @ts-expect-error - Arbitrary strings are invalid.
	const _test3: prismic.ColorField = "yellow"

	// @ts-expect-error - Non-hex-triplet color formats are invalid.
	const _test4: prismic.ColorField = "rgb(255, 0, 255)"
})
