import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.Form): true => {
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

expectType<prismic.Form>({
	method: "GET",
	enctype: "string",
	action: "string",
	name: "string",
	rel: "string",
	fields: {
		foo: {
			type: "String",
			multiple: true,
			default: "string",
		},
	},
})

/**
 * `method` must be "GET".
 */
expectType<prismic.Form>({
	// @ts-expect-error -`method` must be "GET".
	method: "string",
	enctype: "string",
	action: "string",
	name: "string",
	rel: "string",
	fields: {},
})

/**
 * Supports optional `name` and `rel` properties.
 */
expectType<prismic.Form>({
	method: "GET",
	enctype: "string",
	action: "string",
	fields: {},
})
