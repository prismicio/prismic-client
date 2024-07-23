import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.AlternateLanguage): true => {
	switch (typeof value) {
		case "object": {
			if (value === null) {
				expectNever(value)
			}

			return true
		}

		default: {
			return expectNever(value)
		}
	}
}

expectType<prismic.AlternateLanguage>({
	id: "string",
	uid: "string",
	type: "string",
	lang: "string",
})

/**
 * Supports optional UID.
 */
expectType<prismic.AlternateLanguage>({
	id: "string",
	type: "string",
	lang: "string",
})

/**
 * Supports custom type.
 */
expectType<prismic.AlternateLanguage<"foo">>({
	id: "string",
	type: "foo",
	lang: "string",
})
expectType<prismic.AlternateLanguage<"foo">>({
	id: "string",
	// @ts-expect-error - Document type must match the given type.
	type: "string",
	lang: "string",
})

/**
 * Supports custom language.
 */
expectType<prismic.AlternateLanguage<string, "fr-fr">>({
	id: "string",
	type: "string",
	lang: "fr-fr",
})
expectType<prismic.AlternateLanguage<string, "fr-fr">>({
	id: "string",
	type: "string",
	// @ts-expect-error - Document lang must match the given language.
	lang: "string",
})
