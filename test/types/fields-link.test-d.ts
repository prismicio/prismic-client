import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("LinkField type structure", () => {
	expectTypeOf<prismic.LinkField>().toEqualTypeOf<
		| ({ link_type: "Any" } & { text?: string; variant?: string })
		| (({
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
		  } & { text?: string; variant?: string })
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
		  | ({ link_type: "Web"; url: string; target?: string } & {
				text?: string
				variant?: string
		  }))
	>()
})

test("LinkField filled state", () => {
	expectTypeOf<
		prismic.LinkField<string, string, never, "filled", string>
	>().toEqualTypeOf<
		| ({
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
		  } & { text?: string; variant?: string })
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
		| ({ link_type: "Web"; url: string; target?: string } & {
				text?: string
				variant?: string
		  })
	>()
})

test("LinkField empty state", () => {
	expectTypeOf<
		prismic.LinkField<string, string, never, "empty", string>
	>().toEqualTypeOf<{ link_type: "Any" } & { text?: string; variant?: string }>()
})
