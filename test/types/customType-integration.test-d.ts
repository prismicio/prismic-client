import { assertType, expectTypeOf, it } from "vitest"

import type { IntegrationField } from "@prismicio/types-internal/lib/customtypes"

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
	expectTypeOf<CustomTypeModelIntegrationField>().toExtend<IntegrationField>()
	expectTypeOf<IntegrationField>().toExtend<CustomTypeModelIntegrationField>()
})
