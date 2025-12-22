import { assertType, it } from "vitest"

import type { WebhookBodyAPIUpdate } from "../../src"

it("supports basic API update webhook structure", () => {
	assertType<WebhookBodyAPIUpdate>({
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
})

it("supports nullable secret", () => {
	assertType<WebhookBodyAPIUpdate["secret"]>(null)
})

it("supports optional masterRef", () => {
	assertType<WebhookBodyAPIUpdate["masterRef"]>(undefined)
})

it("supports optional experiments", () => {
	assertType<WebhookBodyAPIUpdate["experiments"]>(undefined)
})
