import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.WebhookBodyAPIUpdate): true => {
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

expectType<prismic.WebhookBodyAPIUpdate>({
	type: "api-update",
	domain: "string",
	apiUrl: "string",
	secret: "string",
	masterRef: "string",
	releases: {
		update: [
			{
				id: "string",
				ref: "string",
				label: "string",
				documents: ["string"],
			},
		],
		addition: [
			{
				id: "string",
				ref: "string",
				label: "string",
				documents: ["string"],
			},
		],
		deletion: [
			{
				id: "string",
				ref: "string",
				label: "string",
				documents: ["string"],
			},
		],
	},
	masks: {
		update: [
			{
				id: "string",
				label: "string",
			},
		],
		addition: [
			{
				id: "string",
				label: "string",
			},
		],
		deletion: [
			{
				id: "string",
				label: "string",
			},
		],
	},
	tags: {
		update: [
			{
				id: "string",
			},
		],
		addition: [
			{
				id: "string",
			},
		],
		deletion: [
			{
				id: "string",
			},
		],
	},
	documents: ["string"],
	experiments: {
		update: ["unknown"],
		addition: ["unknown"],
		deletion: ["unknown"],
	},
})

/**
 * Secret is nullable.
 */
expectType<prismic.WebhookBodyAPIUpdate["secret"]>(null)

/**
 * MasterRef is optional.
 */
expectType<prismic.WebhookBodyAPIUpdate["masterRef"]>(undefined)

/**
 * Experiments is optional
 */
expectType<prismic.WebhookBodyAPIUpdate["experiments"]>(undefined)
