import { assertType, it } from "vitest"

import type { LinkType } from "../../src"
import { type BooleanField, type LinkField } from "../../src"

it("supports filled values", () => {
	assertType<LinkField>({
		link_type: "Web",
		url: "string",
		target: "string",
		text: "string",
		variant: "string",
	})
	assertType<LinkField>({
		link_type: "Document",
		id: "string",
		uid: "string",
		type: "string",
		tags: ["string"],
		lang: "string",
		url: "string",
		slug: "string",
		isBroken: true,
		data: undefined,
		text: "string",
		variant: "string",
	})
	assertType<LinkField>({
		link_type: "Media",
		id: "string",
		name: "string",
		kind: "string",
		url: "string",
		size: "string",
		height: "string",
		width: "string",
		text: "string",
		variant: "string",
	})
	assertType<LinkField<string, string, never, "filled">>({
		link_type: "Web",
		url: "string",
		target: "string",
		text: "string",
		variant: "string",
	})
	assertType<LinkField<string, string, never, "empty">>({
		// @ts-expect-error - Empty fields cannot contain a filled link type.
		link_type: "Web",
		url: "string",
		target: "string",
		text: "string",
		variant: "string",
	})
	assertType<LinkField>(
		// @ts-expect-error - Web links require url property.
		{
			link_type: "Web",
		},
	)
	assertType<LinkField>(
		// @ts-expect-error - Document links require id, type, tags, and lang.
		{
			link_type: "Document",
		},
	)
	assertType<LinkField>(
		// @ts-expect-error - Document links require id, type, tags, and lang.
		{
			link_type: "Document",
			id: "id",
			// Missing: type, tags, lang
		},
	)
	assertType<LinkField>(
		// @ts-expect-error - Media links require id, name, kind, url, and size.
		{
			link_type: "Media",
		},
	)
	assertType<LinkField>(
		// @ts-expect-error - Media links require id, name, kind, url, and size.
		{
			link_type: "Media",
			id: "id",
			name: "name",
			// Missing: kind, url, size
		},
	)
})

it("supports empty values", () => {
	assertType<LinkField>({
		link_type: "Any",
	})
	assertType<LinkField<string, string, never, "filled">>({
		// @ts-expect-error - Filled fields cannot contain an empty value.
		link_type: "Any",
	})
})

it("supports empty values with text", () => {
	assertType<LinkField>({
		link_type: "Any",
		text: "string",
	})
	assertType<LinkField<string, string, never, "empty">>({
		link_type: "Any",
		text: "string",
	})
})

it("supports empty values with variant", () => {
	assertType<LinkField>({
		link_type: "Any",
		variant: "string",
	})
	assertType<LinkField<string, string, never, "empty">>({
		link_type: "Any",
		variant: "string",
	})
	assertType<LinkField<string, string, never, "empty", "foo" | "bar">>({
		link_type: "Any",
		variant: "foo",
	})
	assertType<LinkField<string, string, never, "empty", "foo" | "bar">>({
		link_type: "Any",
		// @ts-expect-error - Variant must match the given enum.
		variant: "string",
	})
})

it("supports filled values with explicit variant", () => {
	assertType<LinkField<string, string, never, "filled", "foo" | "bar">>({
		link_type: "Web",
		url: "string",
		target: "string",
		text: "string",
		variant: "foo",
	})
	assertType<LinkField<string, string, never, "filled", "foo" | "bar">>({
		link_type: "Web",
		url: "string",
		target: "string",
		text: "string",
		// @ts-expect-error - Variant must match the given enum.
		variant: "string",
	})
})

it("supports custom document type", () => {
	assertType<LinkField<"foo">>({
		link_type: "Document",
		id: "string",
		type: "foo",
		tags: [],
		lang: "string",
	})
	assertType<LinkField<"foo">>({
		link_type: "Document",
		id: "string",
		// @ts-expect-error - Document type must match the given type.
		type: "string",
		tags: [],
		lang: "string",
	})
})

it("supports custom document language", () => {
	assertType<LinkField<string, "fr-fr">>({
		link_type: "Document",
		id: "string",
		type: "string",
		tags: [],
		lang: "fr-fr",
	})
	assertType<LinkField<string, "fr-fr">>({
		link_type: "Document",
		id: "string",
		type: "string",
		tags: [],
		// @ts-expect-error - Document language must match the given type.
		lang: "string",
	})
})

it("supports custom document data", () => {
	assertType<LinkField<string, string, { foo: BooleanField }>>({
		link_type: "Document",
		id: "string",
		type: "string",
		tags: [],
		lang: "fr-fr",
		data: {
			foo: true,
			// @ts-expect-error - Only given fields are valid.
			bar: false,
		},
	})
})

it("uses const object (not enum) to allow cross-version compatibility", () => {
	// Compatible literal values work (would fail if LinkType was an enum)
	assertType<typeof LinkType.Document>("Document")
	// @ts-expect-error - Incompatible values still fail.
	assertType<typeof LinkType.Document>("Breaking")
})
