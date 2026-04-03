import type * as Internal from "@prismicio/types-internal"
import { assertType, expectTypeOf, it } from "vitest"

import type { CustomTypeModelIntegrationField } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelIntegrationField>({
		type: "IntegrationFields",
	})
})

it("supports config", () => {
	assertType<CustomTypeModelIntegrationField>({
		type: "IntegrationFields",
		config: {
			label: "string",
			placeholder: "string",
			catalog: "string",
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelIntegrationField>().toExtend<Internal.IntegrationFieldModel>()
	expectTypeOf<Internal.IntegrationFieldModel>().toExtend<CustomTypeModelIntegrationField>()
})
