import { assertType, it } from "vitest"

import type { BooleanField, PrismicDocument, Query } from "../../src"

it("supports basic query structure", () => {
	assertType<Query>({
		page: 0,
		results_per_page: 0,
		results_size: 0,
		total_results_size: 0,
		total_pages: 0,
		next_page: "string",
		prev_page: "string",
		results: [
			{
				id: "string",
				uid: "string",
				url: "string",
				type: "string",
				href: "string",
				tags: ["string"],
				first_publication_date: "2020-06-29T15:13:27+0000",
				last_publication_date: "2020-06-29T15:13:27+0000",
				slugs: ["string"],
				linked_documents: [],
				lang: "string",
				alternate_languages: [
					{
						id: "string",
						lang: "string",
						type: "string",
						uid: "string",
					},
				],
				data: {},
			},
		],
	})
})

it("supports nullable next_page and prev_page properties", () => {
	assertType<Query>({
		page: 0,
		results_per_page: 0,
		results_size: 0,
		total_results_size: 0,
		total_pages: 0,
		next_page: null,
		prev_page: null,
		results: [],
	})
})

it("supports custom document type", () => {
	assertType<
		Query<
			PrismicDocument<{
				foo: BooleanField
			}>
		>
	>({
		page: 0,
		results_per_page: 0,
		results_size: 0,
		total_results_size: 0,
		total_pages: 0,
		next_page: null,
		prev_page: null,
		results: [
			{
				id: "string",
				uid: "string",
				url: "string",
				type: "string",
				href: "string",
				tags: ["string"],
				first_publication_date: "2020-06-29T15:13:27+0000",
				last_publication_date: "2020-06-29T15:13:27+0000",
				slugs: ["string"],
				linked_documents: [],
				lang: "string",
				alternate_languages: [
					{
						id: "string",
						lang: "string",
						type: "string",
						uid: "string",
					},
				],
				data: {
					foo: true,
					// @ts-expect-error - Only given fields are valid.
					bar: false,
				},
			},
		],
	})
})
