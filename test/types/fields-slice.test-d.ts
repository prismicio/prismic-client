import { expectTypeOf, test } from "vitest"

import type * as prismic from "../../src"

type DefaultPrimaryFields = Record<string, prismic.AnyRegularField>
type DefaultItemsFields = Record<string, prismic.AnyRegularField>

test("Slice type structure", () => {
	expectTypeOf<prismic.Slice>().toEqualTypeOf<{
		id: string
		slice_type: string
		slice_label: string | null
		primary: DefaultPrimaryFields
		items: DefaultItemsFields[]
	}>()
})
