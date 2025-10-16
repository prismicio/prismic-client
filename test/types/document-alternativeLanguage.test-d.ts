import { assertType, it } from "vitest"

import type { AlternateLanguage } from "../../src"

it("supports basic alternate language structure", () => {
	assertType<AlternateLanguage>({
		id: "string",
		type: "string",
		lang: "string",
	})
})

it("supports optional UID", () => {
	assertType<AlternateLanguage>({
		id: "string",
		type: "string",
		lang: "string",
		uid: "string",
	})
})

it("supports custom type", () => {
	assertType<AlternateLanguage<"foo">>({
		id: "string",
		type: "foo",
		lang: "string",
	})
	assertType<AlternateLanguage<"foo">>({
		id: "string",
		// @ts-expect-error - Document type must match the given type.
		type: "string",
		lang: "string",
	})
})

it("supports custom language", () => {
	assertType<AlternateLanguage<string, "fr-fr">>({
		id: "string",
		type: "string",
		lang: "fr-fr",
	})
	assertType<AlternateLanguage<string, "fr-fr">>({
		id: "string",
		type: "string",
		// @ts-expect-error - Document lang must match the given language.
		lang: "string",
	})
})
