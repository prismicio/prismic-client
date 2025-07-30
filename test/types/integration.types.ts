import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.IntegrationAPIItem): true => {
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
;(value: prismic.IntegrationAPIResults): true => {
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

const item = {
	id: "string",
	title: "string",
	description: "string",
	image_url: "string",
	last_update: 1,
	blob: { foo: "bar" },
} as const

expectType<prismic.IntegrationAPIItem>(item)

expectType<prismic.IntegrationAPIResults>({
	results_size: 1,
	results: [item, item],
})

/**
 * Supports an optional cursor.
 */
expectType<prismic.IntegrationAPIResults>({
	results_size: 1,
	results: [item, item],
	cursor: "string",
})
