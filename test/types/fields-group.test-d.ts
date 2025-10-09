import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

type DefaultFields = Record<
	string,
	prismic.AnyRegularField | prismic.NestedGroupField
>

test("GroupField type structure", () => {
	expectTypeOf<prismic.GroupField>().toEqualTypeOf<
		[] | [DefaultFields, ...DefaultFields[]]
	>()
})

test("GroupField filled state", () => {
	expectTypeOf<prismic.GroupField<DefaultFields, "filled">>().toEqualTypeOf<
		[DefaultFields, ...DefaultFields[]]
	>()
})

test("GroupField empty state", () => {
	expectTypeOf<prismic.GroupField<DefaultFields, "empty">>().toEqualTypeOf<[]>()
})
