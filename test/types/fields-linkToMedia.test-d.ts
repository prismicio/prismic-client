import { assertType, it } from "vitest"

import type { LinkToMediaField } from "../../src"

it("supports filled values", () => {
	assertType<LinkToMediaField>({
		id: "string",
		link_type: "Media",
		name: "string",
		kind: "string",
		url: "string",
		size: "string",
		height: "string",
		width: "string",
		text: "string",
		variant: "string",
	})
	assertType<LinkToMediaField<"filled">>({
		id: "string",
		link_type: "Media",
		name: "string",
		kind: "string",
		url: "string",
		size: "string",
		height: "string",
		width: "string",
		text: "string",
		variant: "string",
	})
	assertType<LinkToMediaField<"filled">>({
		// @ts-expect-error - Filled fields cannot contain an empty value.
		link_type: "Any",
	})
})

it("supports empty values", () => {
	assertType<LinkToMediaField>({
		link_type: "Any",
	})
	assertType<LinkToMediaField<"empty">>({
		link_type: "Any",
	})
	assertType<LinkToMediaField<"empty">>({
		// @ts-expect-error - Empty fields cannot contain a filled value.
		link_type: "Media",
	})
})

it("supports empty values with text", () => {
	assertType<LinkToMediaField>({
		link_type: "Any",
		text: "string",
		variant: "string",
	})
})
