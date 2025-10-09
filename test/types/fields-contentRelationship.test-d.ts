import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("ContentRelationshipField type structure", () => {
	expectTypeOf<prismic.ContentRelationshipField>().toEqualTypeOf<
		| { link_type: "Any" }
		| {
				link_type: "Document"
				id: string
				uid?: string
				type: string
				tags: string[]
				lang: string
				url?: string
				slug?: string
				isBroken?: boolean
				data?: unknown
		  }
	>()
})

test("ContentRelationshipField filled state", () => {
	expectTypeOf<
		prismic.ContentRelationshipField<string, string, never, "filled">
	>().toEqualTypeOf<{
		link_type: "Document"
		id: string
		uid?: string
		type: string
		tags: string[]
		lang: string
		url?: string
		slug?: string
		isBroken?: boolean
		data?: never
	}>()
})

test("ContentRelationshipField empty state", () => {
	expectTypeOf<
		prismic.ContentRelationshipField<string, string, never, "empty">
	>().toEqualTypeOf<{ link_type: "Any" }>()
})
