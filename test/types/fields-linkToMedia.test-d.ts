import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("LinkToMediaField type structure", () => {
	expectTypeOf<prismic.LinkToMediaField>().toEqualTypeOf<
		| ({ link_type: "Any" } & { text?: string; variant?: string })
		| ({
				id: string
				link_type: "Media"
				name: string
				kind: string
				url: string
				size: string
				height?: string | null
				width?: string | null
		  } & { text?: string; variant?: string })
	>()
})

test("LinkToMediaField filled state", () => {
	expectTypeOf<prismic.LinkToMediaField<"filled">>().toEqualTypeOf<
		{
			id: string
			link_type: "Media"
			name: string
			kind: string
			url: string
			size: string
			height?: string | null
			width?: string | null
		} & { text?: string; variant?: string }
	>()
})

test("LinkToMediaField empty state", () => {
	expectTypeOf<prismic.LinkToMediaField<"empty">>().toEqualTypeOf<
		{ link_type: "Any" } & { text?: string; variant?: string }
	>()
})
