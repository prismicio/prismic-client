import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.Repository): true => {
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

expectType<prismic.Repository>({
	refs: [
		{
			id: "string",
			ref: "string",
			label: "string",
			isMasterRef: true,
			scheduledAt: "string",
		},
	],
	integrationFieldsRef: "string",
	languages: [{ id: "string", name: "string", is_master: true }],
	types: { foo: "string" },
	tags: ["string"],
	forms: {
		foo: {
			method: "GET",
			action: "string",
			fields: {
				foo: {
					type: "String",
					multiple: true,
					default: "string",
				},
			},
			enctype: "string",
			name: "string",
			rel: "string",
		},
	},
	oauth_initiate: "string",
	oauth_token: "string",
	version: "string",
	license: "string",
	experiments: {},
	bookmarks: {
		foo: "string",
	},
})
