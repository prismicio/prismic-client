import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("TableField type structure", () => {
	expectTypeOf<prismic.TableField>().toEqualTypeOf<
		| null
		| {
				head?: prismic.TableFieldHead
				body: prismic.TableFieldBody
		  }
	>()
})

test("TableField filled state", () => {
	expectTypeOf<prismic.TableField<"filled">>().toEqualTypeOf<{
		head?: prismic.TableFieldHead
		body: prismic.TableFieldBody
	}>()
})

test("TableField empty state", () => {
	expectTypeOf<prismic.TableField<"empty">>().toEqualTypeOf<null>()
})
