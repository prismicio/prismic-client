import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.Language): true => {
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

expectType<prismic.Language>({
	id: "string",
	name: "string",
	is_master: true,
})
