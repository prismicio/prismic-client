import { assertType, it } from "vitest"

import type { Form } from "../../src"

it("supports basic form structure", () => {
	assertType<Form>({
		method: "GET",
		enctype: "string",
		action: "string",
		fields: {
			foo: {
				type: "String",
				multiple: true,
				default: "string",
			},
		},
	})
})

it("requires method to be GET", () => {
	assertType<Form>({
		// @ts-expect-error - `method` must be "GET".
		method: "string",
	})
})

it("supports optional name and rel properties", () => {
	assertType<Form>({
		method: "GET",
		enctype: "string",
		action: "string",
		fields: {},
		name: "string",
		rel: "string",
	})
})
