import { expectNever } from "ts-expect"

import type * as prismic from "../../src/index.ts"

;(value: prismic.BooleanField): true => {
	switch (typeof value) {
		case "boolean": {
			return true
		}

		default: {
			return expectNever(value)
		}
	}
}
