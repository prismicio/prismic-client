import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

test("IntegrationField type structure", () => {
	expectTypeOf<prismic.IntegrationField>().toEqualTypeOf<
		| prismic.IntegrationFieldData
		| null
	>()
})

test("IntegrationField filled state", () => {
	expectTypeOf<
		prismic.IntegrationField<prismic.IntegrationFieldData, "filled">
	>().toEqualTypeOf<prismic.IntegrationFieldData>()
})

test("IntegrationField empty state", () => {
	expectTypeOf<
		prismic.IntegrationField<prismic.IntegrationFieldData, "empty">
	>().toEqualTypeOf<null>()
})
