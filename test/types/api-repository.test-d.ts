import { assertType, it } from "vitest"

import type { Repository } from "../../src"

it("supports basic repository structure", () => {
	assertType<Repository>({
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
})
