import { assertType, expectTypeOf, it } from "vitest"

import type { BooleanField, ContentRelationshipField } from "../../src"

it("supports filled values", () => {
	assertType<ContentRelationshipField>({
		link_type: "Document",
		id: "string",
		type: "string",
		tags: ["string"],
		lang: "string",
	})
	assertType<ContentRelationshipField<string, string, never, "filled">>({
		link_type: "Document",
		id: "string",
		type: "string",
		tags: ["string"],
		lang: "string",
	})
	assertType<ContentRelationshipField<string, string, never, "filled">>({
		// @ts-expect-error - An empty value is invalud
		link_type: "Any",
	})
})

it("supports empty values", () => {
	assertType<ContentRelationshipField>({ link_type: "Any" })
	assertType<ContentRelationshipField<string, string, never, "empty">>({
		link_type: "Any",
	})
	assertType<ContentRelationshipField<string, string, never, "empty">>({
		// @ts-expect-error - A filled value is invalud
		link_type: "Document",
		id: "string",
		type: "string",
		tags: ["string"],
		lang: "string",
	})
})

it("has optional properties", () => {
	type Type = ContentRelationshipField<string, string, never, "filled">
	assertType<Type>({
		link_type: "Document",
		id: "string",
		type: "string",
		tags: ["string"],
		lang: "string",
		url: "string",
		uid: "string",
		slug: "string",
		isBroken: true,
	})
	expectTypeOf<Type["url"]>().toBeNullable()
	expectTypeOf<Type["uid"]>().toBeNullable()
	expectTypeOf<Type["slug"]>().toBeNullable()
	expectTypeOf<Type["isBroken"]>().toBeNullable()
})

it("supports custom document type", () => {
	assertType<ContentRelationshipField<"foo">>({
		link_type: "Document",
		id: "string",
		type: "foo",
		tags: ["string"],
		lang: "string",
	})
	assertType<ContentRelationshipField<"foo">>({
		link_type: "Document",
		id: "string",
		// @ts-expect-error - Must match the given type
		type: "bar",
		tags: ["string"],
		lang: "string",
	})
})

it("supports custom document language", () => {
	assertType<ContentRelationshipField<string, "fr-fr">>({
		link_type: "Document",
		id: "string",
		type: "string",
		tags: ["string"],
		lang: "fr-fr",
	})
	assertType<ContentRelationshipField<string, "fr-fr">>({
		link_type: "Document",
		id: "string",
		type: "string",
		tags: ["string"],
		// @ts-expect-error - Must match the given language
		lang: "en-ca",
	})
})

it("supports custom document data", () => {
	assertType<ContentRelationshipField<string, string, { foo: BooleanField }>>({
		link_type: "Document",
		id: "string",
		type: "string",
		tags: ["string"],
		lang: "string",
		data: {
			foo: true,
			// @ts-expect-error - Only given fields are valid
			bar: false,
		},
	})
})
