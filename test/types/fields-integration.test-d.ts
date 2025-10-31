import { assertType, it } from "vitest"

import type { IntegrationField } from "../../src"

it("supports filled values", () => {
	assertType<IntegrationField>({
		foo: "bar",
	})
	assertType<IntegrationField<Record<string, unknown>, "filled">>({
		foo: "bar",
	})
	assertType<IntegrationField<Record<string, unknown>, "filled">>(
		// @ts-expect-error - Filled fields cannot contain an empty value.
		null,
	)
})

it("supports empty values", () => {
	assertType<IntegrationField>(null)
	assertType<IntegrationField<Record<string, unknown>, "empty">>(null)
})

it("supports custom blob type", () => {
	assertType<IntegrationField<{ foo: "bar" }>>({
		foo: "bar",
	})
	assertType<IntegrationField<{ foo: "bar" }>>({
		// @ts-expect-error - Blob should match the given type.
		baz: "qux",
	})
})
