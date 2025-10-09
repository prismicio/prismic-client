import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("EmbedField type structure", () => {
	expectTypeOf<prismic.EmbedField>().toEqualTypeOf<
		| Record<string, never>
		| (prismic.AnyOEmbed &
				prismic.OEmbedExtra & {
					embed_url: string
					html: string | null
				})
	>()
})

test("EmbedField filled state", () => {
	expectTypeOf<prismic.EmbedField<prismic.AnyOEmbed, "filled">>().toEqualTypeOf<
		prismic.AnyOEmbed & {
			embed_url: string
			html: string | null
		}
	>()
})

test("EmbedField empty state", () => {
	expectTypeOf<
		prismic.EmbedField<prismic.AnyOEmbed, "empty">
	>().toEqualTypeOf<Record<string, never>>()
})
